/**
 * Pure timeline builders. Investment is an explicit input — never implied.
 */

import type { Completeness, DataLoadError, DataLoadStatus } from "./data-status.ts";
import {
  WINDOW_DAYS,
  addDays,
  dateToMs,
  type CycleKind,
  type HalvingCycle,
  type HalvingDateKind,
  type PerformanceKind,
} from "./halvings.ts";

export const DEFAULT_TIMELINE_INVESTMENT = 20_000;

export interface TimelineDay {
  date: string;
  timestamp: number;
  price: number;
  dayIndex: number;
  btcPurchased: number;
  portfolioValue: number;
  profitLoss: number;
  roiPercent: number;
  daysUntilHalving: number | null;
  daysAfterHalving: number | null;
}

export interface TimelineCycle {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  days: TimelineDay[];
  buyPrice: number;
  sellPrice: number | null;
  cycleKind: CycleKind;
  dateKind: HalvingDateKind;
  performanceKind: PerformanceKind;
}

export interface TimelineData {
  investment: number;
  currentCycle: TimelineCycle;
  previousCycle: TimelineCycle;
  status: DataLoadStatus;
  completeness: Completeness;
  source: string;
  missingDates: string[];
  error?: DataLoadError;
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + "T00:00:00Z");
  const d2 = new Date(date2 + "T00:00:00Z");
  return Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
}

export function emptyCycleFromMeta(cycle: HalvingCycle): TimelineCycle {
  return {
    label: cycle.label,
    halvingDate: cycle.date,
    buyDate: cycle.tMinus500,
    sellDate: cycle.tPlus500,
    days: [],
    buyPrice: 0,
    sellPrice: null,
    cycleKind: cycle.cycleKind,
    dateKind: cycle.dateKind,
    performanceKind: cycle.performanceKind,
  };
}

export function emptyTimelineData(
  current: HalvingCycle,
  previous: HalvingCycle,
  investment = DEFAULT_TIMELINE_INVESTMENT,
): TimelineData {
  return {
    investment,
    currentCycle: emptyCycleFromMeta(current),
    previousCycle: emptyCycleFromMeta(previous),
    status: "unavailable",
    completeness: "empty",
    source: "missing",
    missingDates: [],
    error: { code: "unavailable", message: "Historical data could not be loaded." },
  };
}

function pushDay(
  days: TimelineDay[],
  dateStr: string,
  price: number,
  buyDate: string,
  buyPrice: number,
  halvingDate: string,
  investment: number,
): void {
  const dayIndex = daysBetween(buyDate, dateStr);
  const btcPurchased = investment / buyPrice;
  const portfolioValue = btcPurchased * price;
  const profitLoss = portfolioValue - investment;
  const roiPercent = ((portfolioValue - investment) / investment) * 100;
  const untilHalving = daysBetween(dateStr, halvingDate);

  days.push({
    date: dateStr,
    timestamp: dateToMs(dateStr),
    price,
    dayIndex,
    btcPurchased,
    portfolioValue,
    profitLoss,
    roiPercent,
    daysUntilHalving: untilHalving >= 0 ? untilHalving : null,
    daysAfterHalving: untilHalving < 0 ? Math.abs(untilHalving) : null,
  });
}

export function buildCycleDays(
  buyDate: string,
  sellDate: string,
  halvingDate: string,
  prices: Map<string, number>,
  investment: number,
  options: { carryForwardMissing: boolean },
): { days: TimelineDay[]; buyPrice: number; sellPrice: number | null } {
  let buyPrice = prices.get(buyDate) ?? 0;
  if (buyPrice === 0) {
    const firstAvailableDate = [...prices.keys()].sort().find((d) => d >= buyDate);
    if (firstAvailableDate) buyPrice = prices.get(firstAvailableDate) ?? 0;
  }

  const days: TimelineDay[] = [];
  if (buyPrice <= 0) {
    return { days, buyPrice: 0, sellPrice: prices.get(sellDate) ?? null };
  }

  const cursor = new Date(buyDate + "T00:00:00Z");
  const end = new Date(sellDate + "T00:00:00Z");

  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const price = prices.get(dateStr);
    if (price !== undefined) {
      pushDay(days, dateStr, price, buyDate, buyPrice, halvingDate, investment);
    } else if (options.carryForwardMissing && days.length > 0) {
      pushDay(
        days,
        dateStr,
        days[days.length - 1]!.price,
        buyDate,
        buyPrice,
        halvingDate,
        investment,
      );
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { days, buyPrice, sellPrice: prices.get(sellDate) ?? null };
}

export function timelineCycleFromPrices(
  cycle: HalvingCycle,
  prices: Map<string, number>,
  investment: number,
  options: { carryForwardMissing: boolean },
): TimelineCycle {
  const built = buildCycleDays(
    cycle.tMinus500,
    cycle.tPlus500,
    cycle.date,
    prices,
    investment,
    options,
  );
  return {
    label: cycle.label,
    halvingDate: cycle.date,
    buyDate: cycle.tMinus500,
    sellDate: cycle.tPlus500,
    days: built.days,
    buyPrice: built.buyPrice,
    sellPrice: cycle.performanceKind === "realized" ? built.sellPrice : null,
    cycleKind: cycle.cycleKind,
    dateKind: cycle.dateKind,
    performanceKind: cycle.performanceKind,
  };
}

/** Placeholder used only when a previous historical cycle cannot be resolved. */
export function fallbackPreviousCycle(nowMs: number): HalvingCycle {
  const date = addDays(new Date(nowMs).toISOString().slice(0, 10), -WINDOW_DAYS * 2);
  return {
    number: 0,
    block: 0,
    label: "Previous cycle",
    dateKind: "historical",
    date,
    timestamp: `${date}T00:00:00.000Z`,
    tMinus500: addDays(date, -WINDOW_DAYS),
    tPlus500: addDays(date, WINDOW_DAYS),
    cycleKind: "historical",
    performanceKind: "realized",
    source: "historical",
    confidence: "low",
  };
}
