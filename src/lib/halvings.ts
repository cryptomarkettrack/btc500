/**
 * Canonical Bitcoin halving / 500-day cycle model.
 *
 * Single source of truth for:
 *   - authoritative historical halvings (dates + block heights)
 *   - the next halving block (protocol schedule)
 *   - T-500 / T+500 windows
 *   - cycle classification (historical / current / future)
 *   - block-interval and calendar-date estimation
 *
 * Historical dates are never recomputed from block time.
 * The next halving date is projected from live height at the protocol 10-minute
 * target (difficulty retargeting pins the long-run average to 600s); block-time
 * observation feeds the live-pace diagnostic (source / confidence) metadata.
 */

export type EstimateConfidence = "high" | "medium" | "low";
export type HeightSource = "live" | "estimated";
export type IntervalSource = "observed" | "fallback-protocol";

export const BLOCKS_PER_HALVING = 210_000;
export const WINDOW_DAYS = 500;
/** Bitcoin's protocol target. Used only as a labelled fallback. */
export const PROTOCOL_BLOCK_INTERVAL_SECONDS = 600;
export const MIN_OBSERVED_INTERVAL_SECONDS = 300;
export const MAX_OBSERVED_INTERVAL_SECONDS = 1_200;
/** ~1 day of blocks. Long enough to dampen noise, cheap to sample. */
export const INTERVAL_SAMPLE_BLOCKS = 144;

const DAY_MS = 86_400_000;

export type HalvingDateKind = "historical" | "estimated";
export type CycleKind = "historical" | "current" | "future";
export type PerformanceKind = "realized" | "in-progress" | "projected";

export type CyclePosition =
  | "before-tminus500"
  | "at-tminus500"
  | "between-tminus500-and-halving"
  | "at-halving"
  | "between-halving-and-tplus500"
  | "at-tplus500"
  | "after-tplus500";

/** Legacy shape kept for existing imports. */
export interface HalvingEvent {
  date: string;
  block: number;
  label: string;
}

export interface HistoricalHalving {
  number: number;
  block: number;
  /** Authoritative UTC calendar date (YYYY-MM-DD). */
  date: string;
  /** Authoritative UTC timestamp of the halving block. */
  timestamp: string;
  label: string;
}

export interface BlockSample {
  height: number;
  timestampSec: number;
}

export interface BlockIntervalEstimate {
  seconds: number;
  source: IntervalSource;
  sampleSize: number | null;
  sampleSpanBlocks: number | null;
  confidence: EstimateConfidence;
}

export interface NetworkState {
  height: number;
  heightSource: HeightSource;
  interval: BlockIntervalEstimate;
  /** Epoch ms when `height` was observed (or estimated). */
  observedAt: number;
}

export interface HalvingEstimate {
  /** Authoritative protocol target. */
  nextHalvingBlock: number;
  lastHalvingBlock: number;
  currentHeight: number;
  heightSource: HeightSource;
  estimatedTimestamp: string;
  estimatedDate: string;
  intervalSeconds: number;
  intervalSource: IntervalSource;
  confidence: EstimateConfidence;
  blocksRemaining: number;
}

export interface HalvingCycle {
  number: number;
  block: number;
  label: string;
  dateKind: HalvingDateKind;
  /** UTC calendar date (YYYY-MM-DD). Historical = fact; estimated = projection. */
  date: string;
  timestamp: string;
  tMinus500: string;
  tPlus500: string;
  cycleKind: CycleKind;
  performanceKind: PerformanceKind;
  source: IntervalSource | "historical";
  confidence: EstimateConfidence;
}

/**
 * Confirmed historical halvings. Calendar dates and timestamps are records of
 * what happened — do not re-estimate these from average block time.
 */
export const HISTORICAL_HALVINGS: readonly HistoricalHalving[] = [
  {
    number: 1,
    block: 210_000,
    date: "2012-11-28",
    timestamp: "2012-11-28T15:24:38.000Z",
    label: "2012 Halving",
  },
  {
    number: 2,
    block: 420_000,
    date: "2016-07-09",
    timestamp: "2016-07-09T16:46:13.000Z",
    label: "2016 Halving",
  },
  {
    number: 3,
    block: 630_000,
    date: "2020-05-11",
    timestamp: "2020-05-11T19:23:43.000Z",
    label: "2020 Halving",
  },
  {
    number: 4,
    block: 840_000,
    date: "2024-04-20",
    timestamp: "2024-04-20T00:09:27.000Z",
    label: "2024 Halving",
  },
];

/** Last confirmed halving — fallback height/time anchor when the network is unreachable. */
export const LAST_HISTORICAL_HALVING = HISTORICAL_HALVINGS[HISTORICAL_HALVINGS.length - 1]!;

/** Historical-only list. The next (estimated) halving is not included. */
export const HALVINGS: HalvingEvent[] = HISTORICAL_HALVINGS.map((h) => ({
  date: h.date,
  block: h.block,
  label: h.label,
}));

export function toIsoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Add calendar days to a YYYY-MM-DD string and return YYYY-MM-DD (UTC). */
export function addDays(dateStr: string, days: number): string {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T00:00:00Z` : dateStr;
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Parse a YYYY-MM-DD (or ISO) date string to UTC midnight epoch ms. */
export function dateToMs(dateStr: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return Date.parse(`${dateStr}T00:00:00Z`);
  }
  return new Date(dateStr).getTime();
}

export function nextHalvingBlock(height: number): number {
  return (Math.floor(height / BLOCKS_PER_HALVING) + 1) * BLOCKS_PER_HALVING;
}

export function lastHalvingBlock(height: number): number {
  const n = Math.floor(height / BLOCKS_PER_HALVING);
  if (n < 1) return BLOCKS_PER_HALVING;
  return n * BLOCKS_PER_HALVING;
}

export function halvingNumberForBlock(block: number): number {
  return Math.max(1, Math.round(block / BLOCKS_PER_HALVING));
}

export function historicalHalvingByBlock(block: number): HistoricalHalving | undefined {
  return HISTORICAL_HALVINGS.find((h) => h.block === block);
}

export function fallbackInterval(): BlockIntervalEstimate {
  return {
    seconds: PROTOCOL_BLOCK_INTERVAL_SECONDS,
    source: "fallback-protocol",
    sampleSize: null,
    sampleSpanBlocks: null,
    confidence: "low",
  };
}

/**
 * Average seconds per block between two observed (height, timestamp) samples.
 * Rejects non-positive spans and clamps to a physically plausible range.
 */
export function estimateBlockInterval(
  earlier: BlockSample,
  later: BlockSample,
): BlockIntervalEstimate {
  const spanBlocks = later.height - earlier.height;
  const spanSec = later.timestampSec - earlier.timestampSec;
  if (
    spanBlocks <= 0 ||
    spanSec <= 0 ||
    !Number.isFinite(spanBlocks) ||
    !Number.isFinite(spanSec)
  ) {
    return fallbackInterval();
  }

  const seconds = spanSec / spanBlocks;
  if (
    !Number.isFinite(seconds) ||
    seconds < MIN_OBSERVED_INTERVAL_SECONDS ||
    seconds > MAX_OBSERVED_INTERVAL_SECONDS
  ) {
    return {
      ...fallbackInterval(),
      sampleSize: spanBlocks,
      sampleSpanBlocks: spanBlocks,
    };
  }

  const confidence: EstimateConfidence =
    spanBlocks >= 100 ? "high" : spanBlocks >= 12 ? "medium" : "low";
  return {
    seconds,
    source: "observed",
    sampleSize: spanBlocks,
    sampleSpanBlocks: spanBlocks,
    confidence,
  };
}

export function combineEstimateConfidence(
  heightSource: HeightSource,
  interval: BlockIntervalEstimate,
): EstimateConfidence {
  if (heightSource === "estimated") return "low";
  return interval.confidence;
}

export function estimateHalvingTimestampMs(
  currentHeight: number,
  targetBlock: number,
  observedAtMs: number,
  intervalSeconds: number,
): number {
  const remaining = targetBlock - currentHeight;
  return observedAtMs + remaining * intervalSeconds * 1000;
}

/**
 * Deterministic tip-height estimate from the last confirmed halving + an interval.
 * Used only when live height is unavailable (SSR seed / fallback).
 */
export function estimateCurrentBlockHeight(
  nowMs: number = Date.now(),
  intervalSeconds: number = PROTOCOL_BLOCK_INTERVAL_SECONDS,
): number {
  const elapsedMs = nowMs - Date.parse(LAST_HISTORICAL_HALVING.timestamp);
  const blocks = Math.floor(elapsedMs / (intervalSeconds * 1000));
  return Math.max(LAST_HISTORICAL_HALVING.block, LAST_HISTORICAL_HALVING.block + blocks);
}

export function buildHalvingEstimate(network: NetworkState): HalvingEstimate {
  const nextBlock = nextHalvingBlock(network.height);
  const lastBlock = lastHalvingBlock(network.height);
  // Project the far-future date at the protocol 10-minute target. Bitcoin's
  // difficulty retarget (2016 blocks / 2 weeks) re-pins the long-run average to
  // 600s, so a slightly-fast observed pace (e.g. ~597s today) must not be
  // extrapolated across the ~2 years / ~87k blocks to the next halving — doing
  // so pulled the 2028 estimate ~3 days early vs. upstream counts (CoinGecko's
  // 13 April 2028). The observed interval is kept as a live-pace diagnostic
  // (intervalSeconds / intervalSource / confidence) but does not drive this date.
  const ts = estimateHalvingTimestampMs(
    network.height,
    nextBlock,
    network.observedAt,
    PROTOCOL_BLOCK_INTERVAL_SECONDS,
  );
  return {
    nextHalvingBlock: nextBlock,
    lastHalvingBlock: lastBlock,
    currentHeight: network.height,
    heightSource: network.heightSource,
    estimatedTimestamp: new Date(ts).toISOString(),
    estimatedDate: toIsoDay(ts),
    intervalSeconds: network.interval.seconds,
    intervalSource: network.interval.source,
    confidence: combineEstimateConfidence(network.heightSource, network.interval),
    blocksRemaining: Math.max(0, nextBlock - network.height),
  };
}

export function classifyCycleKind(today: string, tMinus500: string, tPlus500: string): CycleKind {
  if (today < tMinus500) return "future";
  if (today > tPlus500) return "historical";
  return "current";
}

export function classifyCyclePosition(
  today: string,
  tMinus500: string,
  halving: string,
  tPlus500: string,
): CyclePosition {
  if (today < tMinus500) return "before-tminus500";
  if (today === tMinus500) return "at-tminus500";
  if (today < halving) return "between-tminus500-and-halving";
  if (today === halving) return "at-halving";
  if (today < tPlus500) return "between-halving-and-tplus500";
  if (today === tPlus500) return "at-tplus500";
  return "after-tplus500";
}

export function performanceKindFor(
  cycleKind: CycleKind,
  dateKind: HalvingDateKind,
): PerformanceKind {
  if (cycleKind === "historical") return "realized";
  if (cycleKind === "current") return "in-progress";
  return dateKind === "estimated" ? "projected" : "in-progress";
}

export function cycleDisplayLabel(
  cycle: Pick<HalvingCycle, "date" | "dateKind" | "cycleKind" | "label">,
): string {
  const year = cycle.date.slice(0, 4);
  if (cycle.dateKind === "estimated") {
    if (cycle.cycleKind === "current") return `${year} Halving (live)`;
    if (cycle.cycleKind === "future") return `${year} Halving (estimated)`;
  }
  if (cycle.cycleKind === "historical") return `${year} Halving (historical)`;
  if (cycle.cycleKind === "current") return `${year} Halving (live)`;
  return cycle.label;
}

function toCycle(
  input: {
    number: number;
    block: number;
    label: string;
    date: string;
    timestamp: string;
    dateKind: HalvingDateKind;
    source: HalvingCycle["source"];
    confidence: EstimateConfidence;
  },
  today: string,
): HalvingCycle {
  const tMinus500 = addDays(input.date, -WINDOW_DAYS);
  const tPlus500 = addDays(input.date, WINDOW_DAYS);
  const cycleKind = classifyCycleKind(today, tMinus500, tPlus500);
  return {
    ...input,
    tMinus500,
    tPlus500,
    cycleKind,
    performanceKind: performanceKindFor(cycleKind, input.dateKind),
    label: cycleDisplayLabel({
      date: input.date,
      dateKind: input.dateKind,
      cycleKind,
      label: input.label,
    }),
  };
}

export function cycleFromHistorical(halving: HistoricalHalving, nowMs: number): HalvingCycle {
  return toCycle(
    {
      number: halving.number,
      block: halving.block,
      label: halving.label,
      date: halving.date,
      timestamp: halving.timestamp,
      dateKind: "historical",
      source: "historical",
      confidence: "high",
    },
    toIsoDay(nowMs),
  );
}

export function cycleFromEstimate(estimate: HalvingEstimate, nowMs: number): HalvingCycle {
  const number = halvingNumberForBlock(estimate.nextHalvingBlock);
  const year = estimate.estimatedDate.slice(0, 4);
  return toCycle(
    {
      number,
      block: estimate.nextHalvingBlock,
      label: `${year} Halving`,
      date: estimate.estimatedDate,
      timestamp: estimate.estimatedTimestamp,
      dateKind: "estimated",
      source: estimate.intervalSource,
      confidence: estimate.confidence,
    },
    toIsoDay(nowMs),
  );
}

/**
 * Historical cycles (authoritative) plus the next estimated cycle when it is
 * not already a recorded historical event.
 */
export function buildHalvingCycles(nowMs: number, estimate: HalvingEstimate): HalvingCycle[] {
  const historical = HISTORICAL_HALVINGS.map((h) => cycleFromHistorical(h, nowMs));
  if (historical.some((c) => c.block === estimate.nextHalvingBlock)) {
    return historical;
  }
  return [...historical, cycleFromEstimate(estimate, nowMs)];
}

export function selectTimelineCycles(cycles: HalvingCycle[]): {
  current: HalvingCycle;
  previous: HalvingCycle | undefined;
} {
  const current =
    cycles.find((c) => c.cycleKind === "current") ??
    cycles.find((c) => c.cycleKind === "future") ??
    cycles[cycles.length - 1]!;
  const previous = [...cycles].reverse().find((c) => c.block < current.block);
  return { current, previous };
}

export function lastHalvingTimestamp(
  lastBlock: number,
  estimate: HalvingEstimate,
  nowMs: number,
): string {
  const historical = historicalHalvingByBlock(lastBlock);
  if (historical) return historical.timestamp;

  const blocksSince = estimate.currentHeight - lastBlock;
  if (blocksSince < 0 || !Number.isFinite(blocksSince)) {
    return estimate.estimatedTimestamp;
  }
  const ms = nowMs - blocksSince * estimate.intervalSeconds * 1000;
  return new Date(ms).toISOString();
}

/** @deprecated Use DAY_MS via date helpers; kept so existing day-math stays consistent. */
export const HALVING_DAY_MS = DAY_MS;
