/**
 * The spacing test: is the 500-day window special, or does 400 or 600 days
 * produce the same answer?
 *
 * Why this module exists (2026-11-17 review, mandate `spacing-answer-1117`):
 * two members of the only public thread that has produced visitors asked
 * whether the rule survives a different spacing (400 or 600 days) and whether
 * a decaying halving supply effect makes the 2024 window unlike the first
 * three. The opening post promised "say which one and I will run it and post
 * the table". This computes that table from the site's own daily-close archive,
 * with the same lookup the simulator uses, so the published numbers cannot
 * disagree with /data/500-day-cycles.json.
 *
 * Rules kept here on purpose:
 * - Nothing is filled in. A spacing whose entry or exit day has no close is
 *   reported as skipped with the reason, never interpolated.
 * - The 500-day row must reproduce the simulator exactly. That is asserted in
 *   halving-spacing.test.ts against the live archive; if it ever drifts, the
 *   page and the simulator would be quoting different histories.
 * - Medians and worst cases are computed, not typed in. Every number on the
 *   page comes from this module, so a data correction moves the page.
 */

import { eachIsoDay, lookupHistoricalPrice, type HistoricalCsvDataset } from "./historical-csv.ts";
import { HALVINGS, addDays, type HalvingEvent } from "./halvings.ts";

/** Spacings the thread asked about, in the order the page shows them. */
export const SPACING_DAYS = [400, 500, 600] as const;

/** Stable identifier so a consumer can detect a breaking shape change. */
export const SPACING_DATASET_SCHEMA = "btc500/halving-spacing@1";
export const SPACING_DATASET_PATH = "/data/halving-spacing.json";
/** The human-readable page this dataset backs. */
export const SPACING_PAGE_PATH = "/halving-spacing";

export type SpacingWindowStatus =
  | "complete"
  | "entry-before-archive"
  | "exit-after-archive"
  | "missing-price";

export interface SpacingWindow {
  spacingDays: number;
  label: string;
  halvingDate: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number | null;
  exitPrice: number | null;
  /** exit close / entry close, when both exist. */
  multiple: number | null;
  /** Lowest close inside [entryDate, exitDate]. */
  lowDate: string | null;
  lowPrice: number | null;
  /** (low close - entry close) / entry close * 100. Negative when it traded below entry. */
  lowVsEntryPercent: number | null;
  status: SpacingWindowStatus;
  /** Why a window was skipped, or a label a reader must not drop. */
  note: string | null;
}

export interface SpacingSummary {
  spacingDays: number;
  /** Windows with an entry close, an exit close and a multiple. */
  computedWindows: number;
  /** Windows this archive cannot compute, with the reason on each window. */
  skippedWindows: number;
  medianMultiple: number | null;
  bestMultiple: number | null;
  worstMultiple: number | null;
  medianLowVsEntryPercent: number | null;
  worstLowVsEntryPercent: number | null;
  /** Completed windows whose lowest close was below their entry close. */
  windowsBelowEntry: number;
  /** True when every computed window closed above its entry. */
  allClosedAboveEntry: boolean | null;
}

export interface SpacingArchiveRange {
  firstDate: string | null;
  lastDate: string | null;
  rows: number;
  source: string;
}

export interface SpacingReport {
  spacings: SpacingSummary[];
  windows: SpacingWindow[];
  archive: SpacingArchiveRange;
}

/**
 * Labels that must travel with a number, keyed by `<halving date>/<spacing>`.
 *
 * 2012 at 400 days: entry 2011-10-25 closed at $3.16, 28 days before the
 * 2011-11-22 low of $2.30. The 244× is that bottom, not a property of 400 days
 * — the same rule at 500 days starts on the archive's first row instead.
 */
const WINDOW_NOTES: Record<string, string> = {
  "2012-11-28/400":
    "2011-bottom artefact: this entry sits 28 days before the 2011 low, so the 244× is the bottom rather than a property of 400 days.",
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function windowFor(
  halving: HalvingEvent,
  spacingDays: number,
  dataset: Pick<HistoricalCsvDataset, "prices" | "firstDate" | "lastDate">,
): SpacingWindow {
  const entryDate = addDays(halving.date, -spacingDays);
  const exitDate = addDays(halving.date, spacingDays);
  const key = `${halving.date}/${spacingDays}`;

  const base: SpacingWindow = {
    spacingDays,
    label: halving.label,
    halvingDate: halving.date,
    entryDate,
    exitDate,
    entryPrice: null,
    exitPrice: null,
    multiple: null,
    lowDate: null,
    lowPrice: null,
    lowVsEntryPercent: null,
    status: "complete",
    note: WINDOW_NOTES[key] ?? null,
  };

  // The archive is a contiguous daily series: if the entry day is before the
  // first row there is no entry close, and saying so is the honest result.
  if (dataset.firstDate && entryDate < dataset.firstDate) {
    return {
      ...base,
      status: "entry-before-archive",
      note: `Entry ${entryDate} is before the price archive's first row (${dataset.firstDate}), so this window cannot be computed at ${spacingDays} days.`,
    };
  }
  if (dataset.lastDate && exitDate > dataset.lastDate) {
    return {
      ...base,
      status: "exit-after-archive",
      note: `Exit ${exitDate} is after the archive's last row (${dataset.lastDate}).`,
    };
  }

  const entryPrice = lookupHistoricalPrice(dataset as HistoricalCsvDataset, entryDate);
  const exitPrice = lookupHistoricalPrice(dataset as HistoricalCsvDataset, exitDate);
  if (entryPrice == null || exitPrice == null || entryPrice <= 0) {
    return {
      ...base,
      status: "missing-price",
      note: `No daily close for ${entryPrice == null ? entryDate : exitDate}.`,
    };
  }

  let lowPrice: number | null = null;
  let lowDate: string | null = null;
  for (const day of eachIsoDay(entryDate, exitDate)) {
    const price = dataset.prices.get(day);
    if (price === undefined) continue;
    if (lowPrice === null || price < lowPrice) {
      lowPrice = price;
      lowDate = day;
    }
  }

  return {
    ...base,
    entryPrice,
    exitPrice,
    multiple: exitPrice / entryPrice,
    lowDate,
    lowPrice,
    lowVsEntryPercent:
      lowPrice != null && entryPrice > 0 ? ((lowPrice - entryPrice) / entryPrice) * 100 : null,
  };
}

function summarize(windows: SpacingWindow[], spacingDays: number): SpacingSummary {
  const computed = windows.filter(
    (w) => w.spacingDays === spacingDays && w.multiple != null && w.entryPrice != null,
  );
  const multiples = computed.map((w) => w.multiple!);
  const lows = computed
    .map((w) => w.lowVsEntryPercent)
    .filter((v): v is number => v != null && Number.isFinite(v));

  return {
    spacingDays,
    computedWindows: computed.length,
    skippedWindows: windows.filter((w) => w.spacingDays === spacingDays && w.multiple == null)
      .length,
    medianMultiple: median(multiples),
    bestMultiple: multiples.length ? Math.max(...multiples) : null,
    worstMultiple: multiples.length ? Math.min(...multiples) : null,
    medianLowVsEntryPercent: median(lows),
    worstLowVsEntryPercent: lows.length ? Math.min(...lows) : null,
    windowsBelowEntry: lows.filter((v) => v < 0).length,
    allClosedAboveEntry: multiples.length ? multiples.every((m) => m > 1) : null,
  };
}

/**
 * Run the rule at every spacing for every historical halving.
 *
 * `dataset` is the same object the simulator reads (a Map of ISO day → daily
 * close plus its range), so the 500-day windows here are the simulator's own.
 */
export function computeSpacingReport(
  dataset: Pick<HistoricalCsvDataset, "prices" | "firstDate" | "lastDate"> & {
    size?: number;
    source?: string;
  },
  options: {
    spacings?: readonly number[];
    halvings?: readonly HalvingEvent[];
  } = {},
): SpacingReport {
  const spacings = options.spacings ?? SPACING_DAYS;
  const halvings = options.halvings ?? HALVINGS;

  const windows: SpacingWindow[] = [];
  for (const spacingDays of spacings) {
    for (const halving of halvings) {
      windows.push(windowFor(halving, spacingDays, dataset));
    }
  }

  return {
    spacings: spacings.map((spacingDays) => summarize(windows, spacingDays)),
    windows,
    archive: {
      firstDate: dataset.firstDate,
      lastDate: dataset.lastDate,
      rows: dataset.size ?? dataset.prices.size,
      source: dataset.source ?? "unknown",
    },
  };
}

/** A report with no data, so an unavailable archive renders as unavailable. */
export function emptySpacingReport(): SpacingReport {
  return {
    spacings: [],
    windows: [],
    archive: { firstDate: null, lastDate: null, rows: 0, source: "unavailable" },
  };
}

function round(value: number | null | undefined, digits: number): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export interface SpacingDataset {
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
    low: string;
    statistics: string;
    caveat: string;
  };
  archive: SpacingArchiveRange;
  spacings: Array<{
    spacingDays: number;
    computedWindows: number;
    skippedWindows: number;
    medianMultiple: number | null;
    bestMultiple: number | null;
    worstMultiple: number | null;
    medianLowVsEntryPercent: number | null;
    worstLowVsEntryPercent: number | null;
    windowsBelowEntry: number;
    allClosedAboveEntry: boolean | null;
  }>;
  windows: Array<{
    label: string;
    spacingDays: number;
    halvingDate: string;
    entry: { date: string; price: number | null };
    exit: { date: string; price: number | null };
    multiple: number | null;
    low: { date: string | null; price: number | null; vsEntryPercent: number | null };
    status: SpacingWindowStatus;
    note: string | null;
  }>;
}

/** Machine-readable form of the report, for /data/halving-spacing.json. */
export function buildSpacingDataset(
  report: SpacingReport,
  options: { generated: string; site: string },
): SpacingDataset {
  const year = report.archive.lastDate?.slice(0, 4) ?? options.generated.slice(0, 4);

  return {
    schema: SPACING_DATASET_SCHEMA,
    generated: options.generated,
    site: options.site,
    page: `${options.site}${SPACING_PAGE_PATH}`,
    citation: `BTC500 (${year}). Bitcoin halving spacing test: the 500-day rule run at 400, 500 and 600 days on daily UTC closes. ${options.site}${SPACING_DATASET_PATH}`,
    licence: "Free to cite with attribution to BTC500 and a link to the page above.",
    method: {
      rule: "Buy S days before each Bitcoin halving and sell S days after it, for S = 400, 500 and 600.",
      entry: "Entry = halving date minus S calendar days (UTC).",
      exit: "Exit = halving date plus S calendar days (UTC). The exit never moves to chase a price.",
      prices:
        "Daily close in USD, UTC calendar days, from BTC500's own archive. A day with no print is skipped; nothing is interpolated. An entry or exit day with no close is reported as skipped rather than estimated.",
      low: "low = the lowest close inside the window; lowVsEntryPercent = (low - entry close) / entry close. Intraday wicks are not captured, so every low here is a shallower bound than what a holder actually watched.",
      statistics:
        "Median and worst are computed across the windows this archive can price at that spacing. A spacing with fewer than four windows is labelled by its count wherever it is quoted.",
      caveat:
        "Four completed windows, three at 600 days, is a small sample. These are historical observations, not forecasts, and nothing here is financial advice.",
    },
    archive: report.archive,
    spacings: report.spacings.map((s) => ({
      spacingDays: s.spacingDays,
      computedWindows: s.computedWindows,
      skippedWindows: s.skippedWindows,
      medianMultiple: round(s.medianMultiple, 4),
      bestMultiple: round(s.bestMultiple, 4),
      worstMultiple: round(s.worstMultiple, 4),
      medianLowVsEntryPercent: round(s.medianLowVsEntryPercent, 2),
      worstLowVsEntryPercent: round(s.worstLowVsEntryPercent, 2),
      windowsBelowEntry: s.windowsBelowEntry,
      allClosedAboveEntry: s.allClosedAboveEntry,
    })),
    windows: report.windows.map((w) => ({
      label: w.label,
      spacingDays: w.spacingDays,
      halvingDate: w.halvingDate,
      entry: { date: w.entryDate, price: round(w.entryPrice, 2) },
      exit: { date: w.exitDate, price: round(w.exitPrice, 2) },
      multiple: round(w.multiple, 4),
      low: {
        date: w.lowDate,
        price: round(w.lowPrice, 2),
        vsEntryPercent: round(w.lowVsEntryPercent, 2),
      },
      status: w.status,
      note: w.note,
    })),
  };
}
