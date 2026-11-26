/**
 * Shared model for the live 500-day buy signal.
 *
 * One place owns the fixed UTC buy point, the drawdown maths and the projection
 * of the repo's simulator backtest into display rows. Both the homepage and
 * /is-now-the-buy-point read from here so the two pages can never disagree.
 *
 * Prices are never invented: every number in the table comes from the bundled
 * daily-close archive via `assembleSimulatorResult` (see /simulator and
 * /data/500-day-cycles.json). A missing price renders as `—` in the UI.
 */

import { formatIsoDay, formatMultiple, formatUsd } from "./format.ts";
import { SITE_URL } from "./site.ts";
import type { CycleResult } from "./simulator-result.ts";

/** The 500-day buy point derived from the projected 2028-04-11 halving. */
export const BUY_POINT_ISO = "2026-11-28T00:00:00Z";
export const BUY_POINT_DAY = "2026-11-28";
export const BUY_POINT_LABEL = "November 28, 2026";
export const HALVING_LABEL = "April 11, 2028";
export const HALVING_BLOCK = "1,050,000";
/** Verified cycle high used for the drawdown card, never for table data. */
export const CYCLE_HIGH_USD = 126_198;

export const SIGNAL_PATH = "/is-now-the-buy-point";
export const SIGNAL_URL = `${SITE_URL}${SIGNAL_PATH}`;
/** The live countdown card generated at request time (see src/routes/api.og.ts). */
export const SIGNAL_OG_IMAGE = `${SITE_URL}/api/og`;
export const SHARE_TWEET =
  "Bitcoin is 500 days from the next halving. The 500-day rule says this is the buy window.";

const DAY_MS = 86_400_000;

function utcDayStart(value: Date | string): number {
  const date = typeof value === "string" ? new Date(value) : value;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Calendar days from today (UTC) to the buy point. Negative once the window
 * has opened. Calendar days, not a floor of the remaining milliseconds, so a
 * visit on Nov 26 reports "2 days" rather than "1 day + 4 hours".
 */
export function daysToBuyPoint(now: Date | string): number {
  return Math.round((utcDayStart(BUY_POINT_DAY) - utcDayStart(now)) / DAY_MS);
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  isOpen: boolean;
  daysSince: number;
}

/** Precise T-minus breakdown from the fixed UTC target, computed client-side. */
export function countdownParts(now: Date): CountdownParts {
  const target = Date.parse(BUY_POINT_ISO);
  const remaining = target - now.getTime();
  if (remaining <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isOpen: true,
      daysSince: Math.max(0, -daysToBuyPoint(now)),
    };
  }
  return {
    days: Math.floor(remaining / DAY_MS),
    hours: Math.floor((remaining % DAY_MS) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    isOpen: false,
    daysSince: 0,
  };
}

/** Percentage drawdown from the verified October 2025 high. */
export function drawdownFromHigh(price: number | null): number | null {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  return ((price - CYCLE_HIGH_USD) / CYCLE_HIGH_USD) * 100;
}

export interface BacktestRow {
  cycle: string;
  halving: string;
  buyDate: string;
  buyPrice: string;
  sellDate: string;
  sellPrice: string;
  multiple: string;
}

/** Project repo backtest results into display rows; `—` where data is absent. */
export function toBacktestRows(cycles: readonly CycleResult[]): BacktestRow[] {
  return cycles.map((cycle) => ({
    cycle: cycle.halvingDate.slice(0, 4),
    halving: formatIsoDay(cycle.halvingDate),
    buyDate: formatIsoDay(cycle.buyDate),
    buyPrice: cycle.buyPrice == null ? "—" : formatUsd(cycle.buyPrice),
    sellDate: formatIsoDay(cycle.sellDate),
    sellPrice: cycle.sellPrice == null ? "—" : formatUsd(cycle.sellPrice),
    multiple: cycle.returnMultiplier == null ? "—" : formatMultiple(cycle.returnMultiplier),
  }));
}

/** "T-minus {N} days" for the OG card and the context strip. */
export function signalDaysLabel(now: Date | string): string {
  const days = daysToBuyPoint(now);
  return days >= 0 ? `${days}` : `${Math.abs(days)}`;
}
