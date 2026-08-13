export type Phase = "wait-buy" | "wait-sell" | "done";

export interface CycleInfo {
  now: Date;
  nextHalving: Date;
  lastHalving: Date;
  buyDate: Date;
  sellDate: Date;
  phase: Phase;
  daysUntilBuy: number;
  daysUntilSell: number;
  daysUntilNextCycleBuy: number;
  buyProgress: number; // 0..1 elapsed of the 500-day pre-halving window
  sellProgress: number; // 0..1 elapsed since last halving toward sell
}

const DAY = 86_400_000;

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY);
}

export function daysBetween(a: Date, b: Date): number {
  // Compute in UTC so the result is identical on the SSR server (usually UTC) and the
  // client (any user timezone). Previously this used LOCAL midnight, which made the
  // countdown "days" number differ between server and client on non-UTC timezones and
  // triggered React hydration mismatches (error #418).
  const aUtc = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUtc = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUtc - aUtc) / DAY);
}

export function computeCycle(now: Date, nextHalving: Date, lastHalving: Date): CycleInfo {
  const buyDate = addDays(nextHalving, -500);
  const sellDate = addDays(nextHalving, 500);
  let phase: Phase;
  if (now < buyDate) phase = "wait-buy";
  else if (now < sellDate) phase = "wait-sell";
  else phase = "done";

  const buyWindowStart = addDays(buyDate, -500); // pre-buy 500-day track
  const buyElapsed = (now.getTime() - buyWindowStart.getTime()) / DAY;
  const buyProgress = Math.max(0, Math.min(1, buyElapsed / 500));

  const sellElapsed = (now.getTime() - nextHalving.getTime()) / DAY;
  const sellProgress = Math.max(0, Math.min(1, sellElapsed / 500));

  return {
    now,
    nextHalving,
    lastHalving,
    buyDate,
    sellDate,
    phase,
    daysUntilBuy: Math.max(0, daysBetween(now, buyDate)),
    daysUntilSell: Math.max(0, daysBetween(now, sellDate)),
    daysUntilNextCycleBuy: Math.max(0, daysBetween(now, addDays(nextHalving, -500))),
    buyProgress,
    sellProgress,
  };
}

// Formatters live in format.ts; re-exported here for backward compatibility.
export { formatUsd, formatDate, formatUtc } from "./format";
