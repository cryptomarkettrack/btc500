/**
 * Public, machine-readable BTC500 dataset.
 *
 * This is the citation surface for the 500-day research: one stable URL that
 * carries the numbers a writer or another site would otherwise have to lift
 * from a table by hand. It is generated from the same daily-close archive as
 * the simulator and the pillar page, so it cannot disagree with what the site
 * shows.
 *
 * Rules kept here on purpose:
 * - Nothing is filled in. A missing print stays null rather than being
 *   interpolated, and an unfinished window is flagged `windowClosed: false`.
 * - The payload records the archive range it was built from, so a reader can
 *   tell a stale copy from a fresh one without trusting a "generated" stamp.
 * - Numbers are rounded for citation stability (2dp prices/percent, 4dp
 *   multiples). Percentages are in percent, not fractions.
 */

import { summarizeRisk, type CycleRisk } from "./cycle-risk.ts";
import { summarizeTiming, type CycleTiming } from "./cycle-timing.ts";
import type { CycleResult, SimulatorResult } from "./simulator-result.ts";

/** Stable identifier so a consumer can detect a breaking shape change. */
export const CYCLE_DATASET_SCHEMA = "btc500/500-day-cycles@1";
export const CYCLE_DATASET_PATH = "/data/500-day-cycles.json";
/** The human-readable page the dataset backs. */
export const CYCLE_DATASET_PAGE = "/bitcoin-500-day-cycle";

export interface CycleDatasetArchive {
  firstDate: string | null;
  lastDate: string | null;
  rows: number;
  source: string;
}

export interface CycleDatasetTimingRow {
  offsetDays: number;
  entryDate: string;
  entryPrice: number | null;
  /** Percent change in the T+500 multiple against the exact T-500 entry. */
  vsT500Percent: number | null;
}

export interface CycleDatasetCycle {
  label: string;
  halvingDate: string;
  entry: { date: string; price: number | null };
  halving: { price: number | null };
  exit: { date: string; price: number | null };
  returnPercent: number | null;
  multiple: number | null;
  toHalvingPercent: number | null;
  drawdown: {
    lowDate: string | null;
    lowPrice: number | null;
    /** Lowest close inside the window vs the T-500 entry close. */
    lowVsEntryPercent: number | null;
    daysEntryToLow: number | null;
    maxDrawdownPercent: number | null;
    maxDrawdownDate: string | null;
    daysBelowEntryBeforeHalving: number | null;
    observedDaysBeforeHalving: number;
    windowClosed: boolean;
  };
  timing: CycleDatasetTimingRow[];
}

export interface CycleDataset {
  schema: string;
  generated: string;
  site: string;
  page: string;
  citation: string;
  licence: string;
  method: {
    rule: string;
    entry: string;
    exit: string;
    prices: string;
    drawdown: string;
    timing: string;
    caveat: string;
  };
  archive: CycleDatasetArchive;
  summary: {
    completedWindows: number;
    risk: {
      analyzedCount: number;
      belowEntryCount: number;
      allBelowEntry: boolean;
      medianLowVsEntryPercent: number | null;
      medianDaysToLow: number | null;
      worstLabel: string | null;
      worstLowVsEntryPercent: number | null;
    };
    timing: {
      cycleCount: number;
      offsets: Array<{
        offsetDays: number;
        cycleCount: number;
        medianVsT500Percent: number | null;
        improvedCount: number;
        worsenedCount: number;
      }>;
    };
  };
  cycles: CycleDatasetCycle[];
}

function round(value: number | null | undefined, digits: number): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function money(value: number | null): number | null {
  return round(value, 2);
}

function percent(value: number | null): number | null {
  return round(value, 2);
}

function findRisk(risk: CycleRisk[], label: string): CycleRisk | undefined {
  return risk.find((row) => row.label === label);
}

function findTiming(timing: CycleTiming[], label: string): CycleTiming | undefined {
  return timing.find((row) => row.label === label);
}

function buildCycle(
  cycle: CycleResult,
  risk: CycleRisk | undefined,
  timing: CycleTiming | undefined,
): CycleDatasetCycle {
  return {
    label: cycle.label,
    halvingDate: cycle.halvingDate,
    entry: { date: cycle.buyDate, price: money(cycle.buyPrice) },
    halving: { price: money(cycle.halvingPrice) },
    exit: { date: cycle.sellDate, price: money(cycle.sellPrice) },
    returnPercent: percent(cycle.returnPercent),
    multiple: round(cycle.returnMultiplier, 4),
    toHalvingPercent: percent(cycle.toHalvingPercent),
    drawdown: {
      lowDate: risk?.lowDate ?? null,
      lowPrice: money(risk?.lowPrice ?? null),
      lowVsEntryPercent: percent(risk?.lowVsEntryPercent ?? null),
      daysEntryToLow: risk?.daysEntryToLow ?? null,
      maxDrawdownPercent: percent(risk?.maxDrawdownPercent ?? null),
      maxDrawdownDate: risk?.maxDrawdownDate ?? null,
      daysBelowEntryBeforeHalving: risk?.daysBelowEntryBeforeHalving ?? null,
      observedDaysBeforeHalving: risk?.observedDaysBeforeHalving ?? 0,
      windowClosed: risk?.windowClosed ?? false,
    },
    timing: (timing?.entries ?? []).map((entry) => ({
      offsetDays: entry.offsetDays,
      entryDate: entry.entryDate,
      entryPrice: money(entry.entryPrice),
      vsT500Percent: percent(entry.vsT500Percent),
    })),
  };
}

export function buildCycleDataset(
  result: SimulatorResult,
  options: { generated: string; site: string; archive: CycleDatasetArchive },
): CycleDataset {
  const cycles = result.cycles.map((cycle) =>
    buildCycle(cycle, findRisk(result.risk, cycle.label), findTiming(result.timing, cycle.label)),
  );
  const risk = summarizeRisk(result.risk);
  const timing = summarizeTiming(result.timing);
  const year = options.archive.lastDate?.slice(0, 4) ?? options.generated.slice(0, 4);

  return {
    schema: CYCLE_DATASET_SCHEMA,
    generated: options.generated,
    site: options.site,
    page: `${options.site}${CYCLE_DATASET_PAGE}`,
    citation: `BTC500 (${year}). Bitcoin 500-day cycle dataset: T-500 to T+500 prices, drawdowns and entry-timing deltas for the 2012, 2016, 2020 and 2024 halvings. ${options.site}${CYCLE_DATASET_PATH}`,
    licence: "Free to cite with attribution to BTC500 and a link to the page above.",
    method: {
      rule: "Buy exactly 500 days before each Bitcoin halving and sell exactly 500 days after it.",
      entry:
        "T-500 = the calendar day 500 days before the halving date. Halving dates are the protocol block heights (210,000 / 420,000 / 630,000 / 840,000).",
      exit: "T+500 = the calendar day 500 days after the halving date.",
      prices:
        "Daily close in USD, UTC calendar days, from BTC500's own archive. A missing day is returned as null rather than interpolated.",
      drawdown:
        "lowVsEntryPercent = (lowest close in the window - the T-500 close) / T-500 close. maxDrawdownPercent = worst close-to-close fall from a running peak inside the window. Intraday wicks are not captured, so every drawdown here is a lower bound.",
      timing:
        "The exit stays fixed at T+500 and the entry moves to T-500 + offset for offsets from -120 to +120 days. vsT500Percent compares that entry's T+500 multiple with the exact T-500 multiple (negative = worse than the published rule).",
      caveat:
        "Four completed windows is a small sample. These are historical observations, not forecasts, and nothing here is financial advice.",
    },
    archive: {
      firstDate: options.archive.firstDate,
      lastDate: options.archive.lastDate,
      rows: options.archive.rows,
      source: options.archive.source,
    },
    summary: {
      completedWindows: cycles.filter((cycle) => cycle.drawdown.windowClosed).length,
      risk: {
        analyzedCount: risk.analyzedCount,
        belowEntryCount: risk.belowEntryCount,
        allBelowEntry: risk.allBelowEntry,
        medianLowVsEntryPercent: percent(risk.medianLowVsEntryPercent),
        medianDaysToLow: round(risk.medianDaysToLow, 1),
        worstLabel: risk.worst?.label ?? null,
        worstLowVsEntryPercent: percent(risk.worst?.lowVsEntryPercent ?? null),
      },
      timing: {
        cycleCount: timing.cycleCount,
        offsets: timing.offsets.map((offset) => ({
          offsetDays: offset.offsetDays,
          cycleCount: offset.cycleCount,
          medianVsT500Percent: percent(offset.medianVsT500Percent),
          improvedCount: offset.improvedCount,
          worsenedCount: offset.worsenedCount,
        })),
      },
    },
    cycles,
  };
}

/**
 * Dataset JSON-LD for the pillar page. Points at the endpoint above so an
 * editor (or Google Dataset Search) can go from the page to the raw numbers.
 */
export function buildCycleDatasetSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "BTC500 — Bitcoin 500-day cycle dataset",
    description:
      "T-500 entry, halving and T+500 exit closes, inside-window drawdowns and entry-timing deltas for the 2012, 2016, 2020 and 2024 Bitcoin halving windows, from a daily UTC close archive.",
    url: `https://btc500.net${CYCLE_DATASET_PATH}`,
    isAccessibleForFree: true,
    license: "https://btc500.net/terms",
    creator: {
      "@type": "Organization",
      name: "BTC500",
      url: "https://btc500.net",
    },
    temporalCoverage: "2011-07-17/..",
    variableMeasured: [
      "Bitcoin daily close price in USD",
      "BTC500 window return",
      "Lowest close inside the 500-day window",
      "Entry-timing sensitivity vs the exact T-500 entry",
    ],
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `https://btc500.net${CYCLE_DATASET_PATH}`,
      },
    ],
  };
}
