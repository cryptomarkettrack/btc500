/**
 * Entry-timing sensitivity for the BTC500 window.
 *
 * The strongest objection to the rule is that 500 is a round number picked
 * after the fact. `cycle-risk.ts` answers "what did it cost to hold";
 * this module answers "did the exact buy date matter".
 *
 * Method: keep the T+500 exit fixed (the exit the rule actually publishes) and
 * re-enter at T-500 + offset for offsets from -120 to +120 days. A later entry
 * therefore holds for fewer days — that is the point of the test, because the
 * reader's real question is "I missed the date, what did missing it cost".
 *
 * Everything comes from the same daily-close archive as the simulator. A day
 * with no print yields null rather than an interpolated price, and the 2012
 * window simply has no pre-T-500 history because the archive starts there.
 */

import { WINDOW_DAYS, addDays, dateToMs, type HalvingEvent } from "./halvings.ts";

export const TIMING_OFFSET_DAYS = [-120, -90, -60, -30, 0, 30, 60, 90, 120] as const;

export type TimingOffsetDays = (typeof TIMING_OFFSET_DAYS)[number];

/** The offset used in the summary sentences, so the prose cannot drift from the table. */
export const EARLIER_OFFSET_DAYS = -120;
export const LATER_OFFSET_DAYS = 120;

export interface TimingEntry {
  offsetDays: number;
  /** Calendar date of this entry, T-500 + offset. */
  entryDate: string;
  entryPrice: number | null;
  /** Exit price / entry price. Null when either print is missing. */
  multiple: number | null;
  /** Percent change in the multiple against the exact T-500 entry. */
  vsT500Percent: number | null;
}

export interface CycleTiming {
  label: string;
  halvingDate: string;
  buyDate: string;
  /** Fixed exit for every offset: T+500. */
  exitDate: string;
  exitPrice: number | null;
  /** Multiple at the exact T-500 entry, the baseline for every comparison. */
  baselineMultiple: number | null;
  entries: TimingEntry[];
  /** Offsets in this window that produced a comparable multiple. */
  availableCount: number;
}

export interface TimingOffsetSummary {
  offsetDays: number;
  /** Cycles with a comparable multiple at this offset. */
  cycleCount: number;
  medianVsT500Percent: number | null;
  bestLabel: string | null;
  bestVsT500Percent: number | null;
  worstLabel: string | null;
  worstVsT500Percent: number | null;
  improvedCount: number;
  worsenedCount: number;
}

export interface TimingSummary {
  /** Windows with a T-500 print and a T+500 print. */
  cycleCount: number;
  offsets: TimingOffsetSummary[];
  earlier: TimingOffsetSummary | null;
  later: TimingOffsetSummary | null;
}

function median(values: number[]): number | null {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!;
}

function usablePrice(value: number | null): number | null {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

export function emptyCycleTiming(halving: HalvingEvent): CycleTiming {
  const buyDate = addDays(halving.date, -WINDOW_DAYS);
  return {
    label: halving.label,
    halvingDate: halving.date,
    buyDate,
    exitDate: addDays(halving.date, WINDOW_DAYS),
    exitPrice: null,
    baselineMultiple: null,
    entries: TIMING_OFFSET_DAYS.map((offsetDays) => ({
      offsetDays,
      entryDate: addDays(buyDate, offsetDays),
      entryPrice: null,
      multiple: null,
      vsT500Percent: null,
    })),
    availableCount: 0,
  };
}

export function computeCycleTiming(
  halving: HalvingEvent,
  lookup: (date: string) => number | null,
): CycleTiming {
  const buyDate = addDays(halving.date, -WINDOW_DAYS);
  const exitDate = addDays(halving.date, WINDOW_DAYS);
  const exitPrice = usablePrice(lookup(exitDate));
  const baselinePrice = usablePrice(lookup(buyDate));
  const baselineMultiple =
    exitPrice != null && baselinePrice != null ? exitPrice / baselinePrice : null;

  const entries = TIMING_OFFSET_DAYS.map((offsetDays) => {
    const entryDate = addDays(buyDate, offsetDays);
    const entryPrice = usablePrice(lookup(entryDate));
    const multiple = exitPrice != null && entryPrice != null ? exitPrice / entryPrice : null;
    return {
      offsetDays,
      entryDate,
      entryPrice,
      multiple,
      vsT500Percent:
        multiple != null && baselineMultiple != null && baselineMultiple > 0
          ? (multiple / baselineMultiple - 1) * 100
          : null,
    };
  });

  return {
    label: halving.label,
    halvingDate: halving.date,
    buyDate,
    exitDate,
    exitPrice,
    baselineMultiple,
    entries,
    availableCount: entries.filter((entry) => entry.multiple != null).length,
  };
}

export function computeCycleTimings(
  halvings: readonly HalvingEvent[],
  lookup: (date: string) => number | null,
): CycleTiming[] {
  return halvings.map((halving) => computeCycleTiming(halving, lookup));
}

/** Summarize one offset across cycles. Cycles without a comparable multiple are skipped. */
export function summarizeOffset(timings: CycleTiming[], offsetDays: number): TimingOffsetSummary {
  const rows = timings
    .map((timing) => ({
      label: timing.label,
      change:
        timing.entries.find((entry) => entry.offsetDays === offsetDays)?.vsT500Percent ?? null,
    }))
    .filter((row): row is { label: string; change: number } => row.change != null);

  const changes = rows.map((row) => row.change);
  const sorted = [...rows].sort((a, b) => a.change - b.change);

  return {
    offsetDays,
    cycleCount: rows.length,
    medianVsT500Percent: median(changes),
    bestLabel: sorted.length > 0 ? sorted[sorted.length - 1]!.label : null,
    bestVsT500Percent: sorted.length > 0 ? sorted[sorted.length - 1]!.change : null,
    worstLabel: sorted.length > 0 ? sorted[0]!.label : null,
    worstVsT500Percent: sorted.length > 0 ? sorted[0]!.change : null,
    improvedCount: changes.filter((change) => change > 0).length,
    worsenedCount: changes.filter((change) => change < 0).length,
  };
}

export function summarizeTiming(timings: CycleTiming[]): TimingSummary {
  const baseline = timings.filter((timing) => timing.baselineMultiple != null);
  const offsets = TIMING_OFFSET_DAYS.map((offsetDays) => summarizeOffset(baseline, offsetDays));

  return {
    cycleCount: baseline.length,
    offsets,
    earlier: offsets.find((row) => row.offsetDays === EARLIER_OFFSET_DAYS) ?? null,
    later: offsets.find((row) => row.offsetDays === LATER_OFFSET_DAYS) ?? null,
  };
}

/** Offset in words for UI labels, e.g. "-30" -> "30 days earlier". */
export function describeOffset(offsetDays: number): string {
  if (offsetDays === 0) return "Exact T-500";
  return offsetDays < 0 ? `${Math.abs(offsetDays)} days earlier` : `${offsetDays} days later`;
}

/** Calendar days between two ISO days. Used for the "fewer days held" caveat. */
export function daysBetween(fromDate: string, toDate: string): number {
  return Math.round((dateToMs(toDate) - dateToMs(fromDate)) / 86_400_000);
}
