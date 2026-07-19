import { createServerFn } from "@tanstack/react-start";
import { getBtcPricesFromCsvRange } from "./csv-price-loader";
import { getHalvingInfo } from "./btc.functions";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";

// Known halving dates (approximate, based on block heights)
const HALVINGS: Array<{ date: string; block: number; label: string }> = [
  { date: "2012-11-28", block: 210000, label: "2012 Halving" },
  { date: "2016-07-09", block: 420000, label: "2016 Halving" },
  { date: "2020-05-11", block: 630000, label: "2020 Halving" },
  { date: "2024-04-20", block: 840000, label: "2024 Halving" },
];

const AVG_BLOCK_MINUTES = 10;

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

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function dateToMs(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getTime();
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + "T00:00:00Z");
  const d2 = new Date(date2 + "T00:00:00Z");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

async function fetchBtcPriceOnDate(dateStr: string): Promise<number | null> {
  const logTag = `[fetchBtcPriceOnDate ${dateStr}]`;
  const targetUnixSeconds = Math.floor(dateToMs(dateStr) / 1000);

  try {
    const start = targetUnixSeconds - 86400;
    const end = targetUnixSeconds + 86400;
    const url = `https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1000&start=${start}&end=${end}`;

    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) {
      console.error(`${logTag} Bitstamp returned status ${r.status}`);
      return null;
    }

    const j = (await r.json()) as {
      data?: {
        ohlc?: Array<{
          timestamp: string;
          open: string;
          high: string;
          low: string;
          close: string;
          volume: string;
        }>;
      };
    };

    const ohlc = j?.data?.ohlc;
    if (!Array.isArray(ohlc) || ohlc.length === 0) {
      console.error(`${logTag} Bitstamp returned no OHLC data`);
      return null;
    }

    const TOLERANCE_S = 86400;
    const candle = ohlc.find((c) => {
      const ts = parseInt(c.timestamp, 10);
      return Math.abs(ts - targetUnixSeconds) < TOLERANCE_S;
    });

    if (!candle) {
      console.error(`${logTag} Bitstamp: no candle found within 1 day of target date`);
      return null;
    }

    const closePrice = parseFloat(candle.close);
    const valid = Number.isFinite(closePrice) && closePrice > 0;

    if (!valid) {
      console.error(`${logTag} Bitstamp returned invalid close price: ${closePrice}`);
      return null;
    }

    return closePrice;
  } catch (err) {
    console.error(`${logTag} Bitstamp threw:`, err);
    return null;
  }
}

/**
 * Internal function that actually fetches a range of prices from Bitstamp.
 */
async function fetchBtcPricesForRangeFromBitstamp(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  const csvCutoff = "2016-07-12";
  const bitstampStart = startDate >= csvCutoff ? startDate : csvCutoff;

  if (bitstampStart <= endDate) {
    const start = new Date(bitstampStart + "T00:00:00Z");
    const end = new Date(endDate + "T00:00:00Z");

    const startUnix = Math.floor(start.getTime() / 1000);
    const endUnix = Math.floor(end.getTime() / 1000);
    const url = `https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1000&start=${startUnix}&end=${endUnix}`;

    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) {
        console.error(
          `[fetchBtcPricesForRange] Bitstamp returned status ${r.status} for range ${bitstampStart} to ${endDate}`,
        );
        return priceMap;
      }

      const j = (await r.json()) as {
        data?: {
          ohlc?: Array<{
            timestamp: string;
            open: string;
            high: string;
            low: string;
            close: string;
            volume: string;
          }>;
        };
      };

      const ohlc = j?.data?.ohlc;
      if (!Array.isArray(ohlc)) {
        console.error(
          `[fetchBtcPricesForRange] Bitstamp returned invalid data for range ${bitstampStart} to ${endDate}`,
        );
        return priceMap;
      }

      for (const candle of ohlc) {
        const ts = parseInt(candle.timestamp, 10);
        const date = new Date(ts * 1000).toISOString().split("T")[0];
        const closePrice = parseFloat(candle.close);
        if (Number.isFinite(closePrice) && closePrice > 0) {
          priceMap.set(date, closePrice);
        }
      }
    } catch (err) {
      console.error(
        `[fetchBtcPricesForRange] Bitstamp threw for range ${bitstampStart} to ${endDate}:`,
        err,
      );
    }
  }

  return priceMap;
}

async function fetchBtcPricesForRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  // First, get prices from CSV for dates before 2016-07-12 (CSV is always locally cached)
  const csvPrices = await getBtcPricesFromCsvRange(startDate, endDate);
  for (const [date, price] of csvPrices) {
    priceMap.set(date, price);
  }

  // For Bitstamp range fetches, use the centralized cache
  const csvCutoff = "2016-07-12";
  const bitstampStart = startDate >= csvCutoff ? startDate : csvCutoff;

  if (bitstampStart <= endDate) {
    const bitstampPrices = await fetchWithCache(
      CacheKeys.historicalRange(bitstampStart, endDate),
      () => fetchBtcPricesForRangeFromBitstamp(bitstampStart, endDate),
      { ttl: TTL.HISTORICAL_RANGE, staleWhileRevalidate: false },
    );
    for (const [date, price] of bitstampPrices) {
      priceMap.set(date, price);
    }
  }

  return priceMap;
}

/**
 * Internal function that builds the full timeline data.
 */
async function buildTimelineDataInternal(): Promise<TimelineData> {
  const halvingInfo = await getHalvingInfo();
  const nextHalvingDate = new Date(halvingInfo.nextHalvingDate).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  // Next halving cycle: 500 days before NEXT halving -> 500 days after
  const currentBuyDate = addDays(nextHalvingDate, -500);
  const currentSellDate = addDays(nextHalvingDate, 500);
  const currentEnd = currentSellDate;

  // Previous cycle: 2024 halving (Apr 20, 2024) -> Buy -> Sell (+500 days)
  const prevHalving = HALVINGS[3]; // 2024-04-20
  const prevBuyDate = addDays(prevHalving.date, -500); // ~Nov 2022
  const prevSellDate = addDays(prevHalving.date, 500); // ~Oct 2025

  // Fetch prices for both ranges (in parallel)
  const [currentPrices, prevPrices] = await Promise.all([
    fetchBtcPricesForRange(currentBuyDate, currentEnd),
    fetchBtcPricesForRange(prevBuyDate, prevSellDate),
  ]);

  // Build current cycle timeline (may be empty if buy window hasn't opened yet)
  const currentBuyPrice = currentPrices.get(currentBuyDate) ?? 0;
  const currentDays: TimelineDay[] = [];
  const currentStart = new Date(currentBuyDate + "T00:00:00Z");
  const currentEndDate = new Date(currentEnd + "T00:00:00Z");
  const currentDayIter = new Date(currentStart);

  while (currentDayIter <= currentEndDate) {
    const dateStr = currentDayIter.toISOString().split("T")[0];
    const price = currentPrices.get(dateStr);
    if (price !== undefined && currentBuyPrice > 0) {
      const dayIndex = daysBetween(currentBuyDate, dateStr);
      const btcPurchased = 20000 / currentBuyPrice;
      const portfolioValue = btcPurchased * price;
      const profitLoss = portfolioValue - 20000;
      const roiPercent = ((portfolioValue - 20000) / 20000) * 100;
      const daysUntilHalving = daysBetween(dateStr, nextHalvingDate);
      const daysAfterHalving = daysUntilHalving < 0 ? Math.abs(daysUntilHalving) : null;

      currentDays.push({
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
    currentDayIter.setDate(currentDayIter.getDate() + 1);
  }

  // Build previous cycle timeline (2024 halving: Nov 2022 -> Apr 2024 -> Oct 2025)
  let prevBuyPrice = prevPrices.get(prevBuyDate) ?? 0;

  // If exact buy date price is missing, use the first available price on or after buy date
  if (prevBuyPrice === 0) {
    const prevDates = Array.from(prevPrices.keys()).sort();
    const firstAvailableDate = prevDates.find((d) => d >= prevBuyDate);
    if (firstAvailableDate) {
      prevBuyPrice = prevPrices.get(firstAvailableDate) ?? 0;
    }
  }

  const prevDays: TimelineDay[] = [];
  const prevStart = new Date(prevBuyDate + "T00:00:00Z");
  const prevEndDate = new Date(prevSellDate + "T00:00:00Z");
  const prevDayIter = new Date(prevStart);

  while (prevDayIter <= prevEndDate) {
    const dateStr = prevDayIter.toISOString().split("T")[0];
    const price = prevPrices.get(dateStr);

    // Only add days that have price data and valid buy price
    if (price !== undefined && prevBuyPrice > 0) {
      const dayIndex = daysBetween(prevBuyDate, dateStr);
      const btcPurchased = 20000 / prevBuyPrice;
      const portfolioValue = btcPurchased * price;
      const profitLoss = portfolioValue - 20000;
      const roiPercent = ((portfolioValue - 20000) / 20000) * 100;
      const daysUntilHalving = daysBetween(dateStr, prevHalving.date);
      const daysAfterHalving = daysUntilHalving < 0 ? Math.abs(daysUntilHalving) : null;

      prevDays.push({
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
    } else if (prevBuyPrice > 0 && prevDays.length > 0) {
      // If we have a valid buy price but no price for this day, use the last known price
      const lastDay = prevDays[prevDays.length - 1];
      const dayIndex = daysBetween(prevBuyDate, dateStr);
      const daysUntilHalving = daysBetween(dateStr, prevHalving.date);
      const daysAfterHalving = daysUntilHalving < 0 ? Math.abs(daysUntilHalving) : null;

      prevDays.push({
        date: dateStr,
        timestamp: dateToMs(dateStr),
        price: lastDay.price,
        dayIndex,
        btcPurchased: lastDay.btcPurchased,
        portfolioValue: lastDay.btcPurchased * lastDay.price,
        profitLoss: lastDay.btcPurchased * lastDay.price - 20000,
        roiPercent: ((lastDay.btcPurchased * lastDay.price - 20000) / 20000) * 100,
        daysUntilHalving: daysUntilHalving >= 0 ? daysUntilHalving : null,
        daysAfterHalving: daysUntilHalving < 0 ? Math.abs(daysUntilHalving) : null,
      });
    }
    prevDayIter.setDate(prevDayIter.getDate() + 1);
  }

  const prevSellPrice = prevPrices.get(prevSellDate) ?? null;

  console.log(
    `[getTimelineData] Final: prevDays.length=${prevDays.length}, prevBuyPrice=$${prevBuyPrice}, firstDay=${prevDays[0]?.date}, lastDay=${prevDays[prevDays.length - 1]?.date}`,
  );

  return {
    currentCycle: {
      label: "Next Halving",
      halvingDate: nextHalvingDate,
      buyDate: currentBuyDate,
      sellDate: currentSellDate,
      days: currentDays,
      buyPrice: currentBuyPrice,
      sellPrice: null, // not yet known
    },
    previousCycle: {
      label: "Previous Cycle (2024)",
      halvingDate: prevHalving.date,
      buyDate: prevBuyDate,
      sellDate: prevSellDate,
      days: prevDays,
      buyPrice: prevBuyPrice,
      sellPrice: prevSellPrice,
    },
  };
}

export const getTimelineData = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(CacheKeys.timeline(), () => buildTimelineDataInternal(), {
    ttl: TTL.TIMELINE,
    staleWhileRevalidate: true,
  });
});
