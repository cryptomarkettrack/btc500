import { createServerFn } from "@tanstack/react-start";
import { resolveHalvingInfo } from "./btc.functions";
import { HALVINGS, addDays, dateToMs } from "./halvings";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";

export interface TimelineDay {
  date: string; // YYYY-MM-DD
  timestamp: number; // unix ms
  price: number;
  dayIndex: number; // days since buy
  btcPurchased: number; // 20000 / price on buy date (constant)
  portfolioValue: number; // btcPurchased * current price
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
}

export interface TimelineData {
  currentCycle: TimelineCycle;
  previousCycle: TimelineCycle;
}

const INVESTMENT = 20_000;

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + "T00:00:00Z");
  const d2 = new Date(date2 + "T00:00:00Z");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

function emptyCycle(
  label: string,
  halvingDate: string,
  buyDate: string,
  sellDate: string,
): TimelineCycle {
  return {
    label,
    halvingDate,
    buyDate,
    sellDate,
    days: [],
    buyPrice: 0,
    sellPrice: null,
  };
}

export function emptyTimelineData(): TimelineData {
  const next = addDays(HALVINGS[HALVINGS.length - 1]?.date ?? "2024-04-20", 1461);
  const prev = HALVINGS[3] ?? HALVINGS[HALVINGS.length - 1];
  return {
    currentCycle: emptyCycle("Next Halving", next, addDays(next, -500), addDays(next, 500)),
    previousCycle: emptyCycle(
      "Previous Cycle (2024)",
      prev.date,
      addDays(prev.date, -500),
      addDays(prev.date, 500),
    ),
  };
}

function pushDay(
  days: TimelineDay[],
  dateStr: string,
  price: number,
  buyDate: string,
  buyPrice: number,
  halvingDate: string,
): void {
  const dayIndex = daysBetween(buyDate, dateStr);
  const btcPurchased = INVESTMENT / buyPrice;
  const portfolioValue = btcPurchased * price;
  const profitLoss = portfolioValue - INVESTMENT;
  const roiPercent = ((portfolioValue - INVESTMENT) / INVESTMENT) * 100;
  const daysUntilHalving = daysBetween(dateStr, halvingDate);

  days.push({
    date: dateStr,
    timestamp: dateToMs(dateStr),
    price,
    dayIndex,
    btcPurchased,
    portfolioValue,
    profitLoss,
    roiPercent,
    daysUntilHalving: daysUntilHalving >= 0 ? daysUntilHalving : null,
    daysAfterHalving: daysUntilHalving < 0 ? Math.abs(daysUntilHalving) : null,
  });
}

function buildCycleDays(
  buyDate: string,
  sellDate: string,
  halvingDate: string,
  prices: Map<string, number>,
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
      pushDay(days, dateStr, price, buyDate, buyPrice, halvingDate);
    } else if (options.carryForwardMissing && days.length > 0) {
      pushDay(days, dateStr, days[days.length - 1].price, buyDate, buyPrice, halvingDate);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { days, buyPrice, sellPrice: prices.get(sellDate) ?? null };
}

async function buildTimelineDataInternal(): Promise<TimelineData> {
  const halvingInfo = await resolveHalvingInfo();
  const nextHalvingDate = new Date(halvingInfo.nextHalvingDate).toISOString().slice(0, 10);

  const currentBuyDate = addDays(nextHalvingDate, -500);
  const currentSellDate = addDays(nextHalvingDate, 500);

  const prevHalving = HALVINGS[3] ?? HALVINGS[HALVINGS.length - 1];
  const prevBuyDate = addDays(prevHalving.date, -500);
  const prevSellDate = addDays(prevHalving.date, 500);

  const { getHistoricalBtcPricesRange } = await import("./historical-price.server");
  const [currentPrices, prevPrices] = await Promise.all([
    getHistoricalBtcPricesRange(currentBuyDate, currentSellDate),
    getHistoricalBtcPricesRange(prevBuyDate, prevSellDate),
  ]);

  const current = buildCycleDays(currentBuyDate, currentSellDate, nextHalvingDate, currentPrices, {
    carryForwardMissing: false,
  });
  const previous = buildCycleDays(prevBuyDate, prevSellDate, prevHalving.date, prevPrices, {
    carryForwardMissing: true,
  });

  console.info(
    `[getTimelineData] prevDays=${previous.days.length} prevBuy=$${previous.buyPrice} currentDays=${current.days.length}`,
  );

  return {
    currentCycle: {
      label: "Next Halving",
      halvingDate: nextHalvingDate,
      buyDate: currentBuyDate,
      sellDate: currentSellDate,
      days: current.days,
      buyPrice: current.buyPrice,
      sellPrice: null,
    },
    previousCycle: {
      label: "Previous Cycle (2024)",
      halvingDate: prevHalving.date,
      buyDate: prevBuyDate,
      sellDate: prevSellDate,
      days: previous.days,
      buyPrice: previous.buyPrice,
      sellPrice: previous.sellPrice,
    },
  };
}

export const getTimelineData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchWithCache(CacheKeys.timeline(), () => buildTimelineDataInternal(), {
      ttl: TTL.TIMELINE,
      staleWhileRevalidate: true,
    });
  } catch (err) {
    console.error("[timeline] failed to build historical timeline:", err);
    return emptyTimelineData();
  }
});
