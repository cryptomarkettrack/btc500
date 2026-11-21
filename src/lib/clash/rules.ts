/**
 * Candle Clash — pure game rules.
 *
 * This module is deliberately free of I/O, framework imports and database
 * access so the settlement logic can be unit tested in isolation. The browser
 * never computes outcomes; these functions are the single source of truth for
 * the server.
 */

export const CLASH_SYMBOL = "BTCUSDT";
export const CLASH_TIMEFRAME = "15m";

export const ALLOWED_SYMBOLS = ["BTCUSDT"] as const;
export const ALLOWED_TIMEFRAMES = ["15m"] as const;

/** The 1m/5m timeframes from the brief are intentionally not enabled yet. */
export const TIMEFRAME_MS: Record<string, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
};

/** Stop accepting predictions 60 seconds before the candle closes. */
export const CUTOFF_BEFORE_CLOSE_MS = 60_000;

export type Direction = "UP" | "DOWN";
export type PredictionStatus = "PENDING" | "WON" | "LOST" | "VOID";

export interface CandleOutcome {
  open: number;
  close: number;
}

export interface Settlement {
  status: Exclude<PredictionStatus, "PENDING">;
  points: number;
}

export function timeframeMs(timeframe: string): number | null {
  return TIMEFRAME_MS[timeframe] ?? null;
}

/** Timestamp (ms, UTC) of the candle that is open at `nowMs`. */
export function currentCandleOpenTime(nowMs: number, intervalMs: number): number {
  return Math.floor(nowMs / intervalMs) * intervalMs;
}

/** Last millisecond (exclusive) at which a prediction for this candle is valid. */
export function cutoffTime(openTimeMs: number, intervalMs: number): number {
  return openTimeMs + intervalMs - CUTOFF_BEFORE_CLOSE_MS;
}

export function isWindowOpen(nowMs: number, openTimeMs: number, intervalMs: number): boolean {
  return nowMs >= openTimeMs && nowMs < cutoffTime(openTimeMs, intervalMs);
}

/**
 * Settle one prediction from a verified, closed exchange candle.
 *
 * UP: close > open. DOWN: close < open. Equal settles VOID with zero points.
 * A missing/non-final candle must never reach this function — callers leave
 * those predictions PENDING instead.
 */
export function settleCandle(candle: CandleOutcome, direction: Direction): Settlement {
  if (!Number.isFinite(candle.open) || !Number.isFinite(candle.close)) {
    throw new Error("candle prices must be finite");
  }
  if (candle.open === candle.close) return { status: "VOID", points: 0 };
  const up = candle.close > candle.open;
  const won = direction === "UP" ? up : !up;
  return { status: won ? "WON" : "LOST", points: won ? 1 : 0 };
}

export interface SettledRecord {
  status: PredictionStatus;
  points?: number;
}

export interface PlayerStats {
  settled: number;
  wins: number;
  accuracy: number | null;
  currentStreak: number;
  bestStreak: number;
}

/** Newest-first records. VOID predictions neither extend nor break a streak. */
export function computeStats(records: SettledRecord[]): PlayerStats {
  let settled = 0;
  let wins = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let running = 0;
  let streakBroken = false;

  for (const record of records) {
    if (record.status === "WON") {
      wins += 1;
      settled += 1;
      running += 1;
      bestStreak = Math.max(bestStreak, running);
      if (!streakBroken) currentStreak = running;
    } else if (record.status === "LOST") {
      settled += 1;
      running = 0;
      streakBroken = true;
      currentStreak = 0;
    }
    // VOID: ignored for accuracy and streaks.
  }

  return {
    settled,
    wins,
    accuracy: settled > 0 ? wins / settled : null,
    currentStreak,
    bestStreak,
  };
}

export interface LeaderboardRow {
  username: string;
  points: number;
  settled: number;
  wins: number;
}

/** Points → accuracy → sample size. Deterministic ties. */
export function rankLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aAcc = a.settled ? a.wins / a.settled : 0;
    const bAcc = b.settled ? b.wins / b.settled : 0;
    if (bAcc !== aAcc) return bAcc - aAcc;
    return b.settled - a.settled;
  });
}
