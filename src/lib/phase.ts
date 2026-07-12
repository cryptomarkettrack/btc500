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
  // Normalize to local midnight so the countdown changes at calendar-day boundaries,
  // not at arbitrary times of day that depend on when the halving was estimated.
  const aLocal = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bLocal = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bLocal.getTime() - aLocal.getTime()) / DAY);
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

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatUtc(d: Date): string {
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")} UTC`;
}
