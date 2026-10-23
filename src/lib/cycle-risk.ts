/**
 * Inside-the-window risk statistics for each BTC500 cycle.
 *
 * The return table answers "what did the window pay". This module answers the
 * question a reader asks before committing to a rule: "what did it feel like
 * while it was open" — how far below the T-500 entry price Bitcoin traded, how
 * long the low took to arrive, and what the worst close-to-close drawdown was.
 *
 * Everything is derived from the same daily-close archive as the simulator.
 * Nothing is filled in: a day with no print is skipped, and a window that runs
 * past the end of the archive is marked open rather than completed.
 *
 * Only daily closes are available. Intraday wicks are not captured, so every
 * drawdown here is a lower bound on what a holder actually watched.
 */

import { eachIsoDay } from "./historical-csv.ts";
import { WINDOW_DAYS, addDays, dateToMs, type HalvingEvent } from "./halvings.ts";

const DAY_MS = 86_400_000;

export type PriceLookup = (date: string) => number | null;

export interface CycleRisk {
  label: string;
  buyDate: string;
  halvingDate: string;
  sellDate: string;
  /** Close on T-500, or null when the archive does not cover that day. */
  buyPrice: number | null;
  /** Lowest close inside [T-500, T+500]. */
  lowDate: string | null;
  lowPrice: number | null;
  /** (lowPrice - buyPrice) / buyPrice * 100. Negative when price traded below entry. */
  lowVsEntryPercent: number | null;
  /** Calendar days from T-500 to the lowest close. */
  daysEntryToLow: number | null;
  /** Highest close inside the window. */
  highDate: string | null;
  highPrice: number | null;
  highVsEntryPercent: number | null;
  /** Daily closes between T-500 and the halving day that exist in the archive. */
  observedDaysBeforeHalving: number;
  /** Of those, how many closed strictly below the T-500 entry price. */
  daysBelowEntryBeforeHalving: number | null;
  /** Worst close-to-close fall from a running peak inside the window. */
  maxDrawdownPercent: number | null;
  maxDrawdownDate: string | null;
  /** Daily closes actually observed in the window. */
  observedDays: number;
  /** True when the archive has a print at or after T+500. */
  windowClosed: boolean;
}

export interface RiskSummary {
  /** Windows with both an entry print and at least one later close. */
  analyzedCount: number;
  closedCount: number;
  /** Analyzed windows whose lowest close was below the T-500 entry price. */
  belowEntryCount: number;
  allBelowEntry: boolean;
  medianLowVsEntryPercent: number | null;
  worst: CycleRisk | null;
  mildest: CycleRisk | null;
  medianDaysToLow: number | null;
  medianDaysBelowEntryBeforeHalving: number | null;
}

export function emptyCycleRisk(halving: HalvingEvent): CycleRisk {
  return {
    label: halving.label,
    buyDate: addDays(halving.date, -WINDOW_DAYS),
    halvingDate: halving.date,
    sellDate: addDays(halving.date, WINDOW_DAYS),
    buyPrice: null,
    lowDate: null,
    lowPrice: null,
    lowVsEntryPercent: null,
    daysEntryToLow: null,
    highDate: null,
    highPrice: null,
    highVsEntryPercent: null,
    observedDaysBeforeHalving: 0,
    daysBelowEntryBeforeHalving: null,
    maxDrawdownPercent: null,
    maxDrawdownDate: null,
    observedDays: 0,
    windowClosed: false,
  };
}

interface Observation {
  date: string;
  price: number;
}

function percentChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

function dayGap(fromDate: string, toDate: string): number {
  return Math.round((dateToMs(toDate) - dateToMs(fromDate)) / DAY_MS);
}

/**
 * Compute one cycle's risk profile from a date → close lookup.
 * `lookup` must return null outside the archive rather than a fabricated price.
 */
export function computeCycleRisk(halving: HalvingEvent, lookup: PriceLookup): CycleRisk {
  const buyDate = addDays(halving.date, -WINDOW_DAYS);
  const sellDate = addDays(halving.date, WINDOW_DAYS);
  const buyPrice = lookup(buyDate);

  const observed: Observation[] = [];
  for (const date of eachIsoDay(buyDate, sellDate)) {
    const price = lookup(date);
    if (price != null && price > 0) observed.push({ date, price });
  }

  if (observed.length === 0) {
    return {
      ...emptyCycleRisk(halving),
      buyPrice: buyPrice != null && buyPrice > 0 ? buyPrice : null,
    };
  }

  let low = observed[0]!;
  let high = observed[0]!;
  let peak = observed[0]!;
  let maxDrawdownPercent = 0;
  let maxDrawdownDate: string | null = null;

  for (const point of observed) {
    if (point.price < low.price) low = point;
    if (point.price > high.price) high = point;
    if (point.price > peak.price) peak = point;
    const drawdown = percentChange(peak.price, point.price);
    if (drawdown < maxDrawdownPercent) {
      maxDrawdownPercent = drawdown;
      maxDrawdownDate = point.date;
    }
  }

  const beforeHalving = observed.filter((point) => point.date <= halving.date);
  const lastObserved = observed[observed.length - 1]!;

  return {
    label: halving.label,
    buyDate,
    halvingDate: halving.date,
    sellDate,
    buyPrice: buyPrice != null && buyPrice > 0 ? buyPrice : null,
    lowDate: low.date,
    lowPrice: low.price,
    lowVsEntryPercent: buyPrice != null && buyPrice > 0 ? percentChange(buyPrice, low.price) : null,
    daysEntryToLow: dayGap(buyDate, low.date),
    highDate: high.date,
    highPrice: high.price,
    highVsEntryPercent:
      buyPrice != null && buyPrice > 0 ? percentChange(buyPrice, high.price) : null,
    observedDaysBeforeHalving: beforeHalving.length,
    daysBelowEntryBeforeHalving:
      buyPrice != null && buyPrice > 0 && beforeHalving.length > 0
        ? beforeHalving.filter((point) => point.price < buyPrice).length
        : null,
    maxDrawdownPercent: maxDrawdownDate == null ? null : maxDrawdownPercent,
    maxDrawdownDate,
    observedDays: observed.length,
    windowClosed: lastObserved.date >= sellDate,
  };
}

export function computeCycleRisks(
  halvings: readonly HalvingEvent[],
  lookup: PriceLookup,
): CycleRisk[] {
  return halvings.map((halving) => computeCycleRisk(halving, lookup));
}

function median(values: number[]): number | null {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!;
}

/**
 * Summarize the risk profiles. Windows without an entry price or without any
 * close after it are excluded instead of being treated as zero drawdown.
 */
export function summarizeRisk(risks: CycleRisk[]): RiskSummary {
  const analyzed = risks.filter(
    (risk) => risk.buyPrice != null && risk.lowPrice != null && risk.lowVsEntryPercent != null,
  );
  const belowEntry = analyzed.filter((risk) => (risk.lowVsEntryPercent ?? 0) < 0);
  const sortedByLow = [...belowEntry].sort(
    (a, b) => (a.lowVsEntryPercent ?? 0) - (b.lowVsEntryPercent ?? 0),
  );

  return {
    analyzedCount: analyzed.length,
    closedCount: analyzed.filter((risk) => risk.windowClosed).length,
    belowEntryCount: belowEntry.length,
    allBelowEntry: analyzed.length > 0 && belowEntry.length === analyzed.length,
    medianLowVsEntryPercent: median(
      analyzed
        .map((risk) => risk.lowVsEntryPercent)
        .filter((value): value is number => value != null),
    ),
    worst: sortedByLow[0] ?? null,
    mildest: sortedByLow[sortedByLow.length - 1] ?? null,
    medianDaysToLow: median(
      analyzed.map((risk) => risk.daysEntryToLow).filter((value): value is number => value != null),
    ),
    medianDaysBelowEntryBeforeHalving: median(
      analyzed
        .map((risk) => risk.daysBelowEntryBeforeHalving)
        .filter((value): value is number => value != null),
    ),
  };
}
