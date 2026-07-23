import { createServerFn } from "@tanstack/react-start";
import { getBtcPriceFromCsv, getBtcPricesFromCsvRange } from "./csv-price-loader";
import { fetchBtcPriceFromBitstamp } from "./bitstamp-fetcher";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";

// Known halving dates (approximate, based on block heights)
const HALVINGS: Array<{ date: string; label: string }> = [
  { date: "2012-11-28", label: "2012 Halving" },
  { date: "2016-07-09", label: "2016 Halving" },
  { date: "2020-05-11", label: "2020 Halving" },
  { date: "2024-04-20", label: "2024 Halving" },
];

export interface DcaCycleResult {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  /** Buy prices: index 0 = buyDate, index i = buyDate + i days */
  buyPrices: (number | null)[];
  /** Sell prices: index 0 = sellDate, index i = sellDate + i days */
  sellPrices: (number | null)[];
  /** Number of days of DCA data available for buy side */
  buyDaysAvailable: number;
  /** Number of days of DCA data available for sell side */
  sellDaysAvailable: number;
}

export interface DcaServerResult {
  cycles: DcaCycleResult[];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Fetch BTC price for a date.
 * Tries CSV first (which has data from 2013 to present).
 * Falls back to Bitstamp API only if CSV doesn't have the date.
 */
async function fetchBtcPrice(dateStr: string): Promise<number | null> {
  // Try CSV first — it covers 2013 to present
  const csvPrice = await getBtcPriceFromCsv(dateStr);
  if (csvPrice !== null) {
    return csvPrice;
  }

  // Fall back to Bitstamp for dates the CSV doesn't cover
  return fetchWithCache(
    CacheKeys.historicalPrice(dateStr),
    () => fetchBtcPriceFromBitstamp(dateStr),
    { ttl: TTL.HISTORICAL_PRICE, staleWhileRevalidate: false },
  );
}

/**
 * Fetch daily BTC prices for a date range.
 * Tries CSV first for all dates; falls back to Bitstamp for individual dates CSV doesn't have.
 */
async function fetchBtcPricesRange(
  startDate: string,
  endDate: string,
  maxDays: number,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  // 1. Fetch all available CSV prices for the entire range
  const csvPrices = await getBtcPricesFromCsvRange(startDate, endDate);
  for (const [date, price] of csvPrices) {
    result.set(date, price);
  }

  // 2. For dates CSV didn't have, fetch from Bitstamp individual prices
  const current = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const maxApiDays = Math.min(maxDays, 90); // cap at 90 API calls per range to be safe

  const promises: Promise<void>[] = [];
  let apiCallsCount = 0;

  while (current <= end && apiCallsCount < maxApiDays) {
    const dateStr = current.toISOString().split("T")[0];
    if (!result.has(dateStr)) {
      apiCallsCount++;
      promises.push(
        fetchBtcPrice(dateStr).then((price) => {
          if (price !== null) {
            result.set(dateStr, price);
          }
        }),
      );
    }
    current.setDate(current.getDate() + 1);
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }

  return result;
}

export const getDcaData = createServerFn({ method: "GET" })
  .validator((data: { dcaBuyDays: number; dcaSellDays: number }) => {
    return {
      dcaBuyDays: Math.max(0, Math.min(365, data.dcaBuyDays)),
      dcaSellDays: Math.max(0, Math.min(365, data.dcaSellDays)),
    };
  })
  .handler(async ({ data }) => {
    return fetchWithCache(
      CacheKeys.dca(data.dcaBuyDays, data.dcaSellDays),
      async () => {
        const cycles: DcaCycleResult[] = [];

        for (const halving of HALVINGS) {
          const buyDate = addDays(halving.date, -500);
          const sellDate = addDays(halving.date, 500);

          // Fetch prices for buy and sell windows
          const buyEndDate = data.dcaBuyDays > 0 ? addDays(buyDate, data.dcaBuyDays - 1) : buyDate;
          const sellEndDate =
            data.dcaSellDays > 0 ? addDays(sellDate, data.dcaSellDays - 1) : sellDate;

          const [buyPricesMap, sellPricesMap] = await Promise.all([
            fetchBtcPricesRange(buyDate, buyEndDate, data.dcaBuyDays + 1),
            fetchBtcPricesRange(sellDate, sellEndDate, data.dcaSellDays + 1),
          ]);

          // Build price arrays
          const buyPrices: (number | null)[] = [];
          for (let d = 0; d <= data.dcaBuyDays; d++) {
            const date = addDays(buyDate, d);
            buyPrices.push(buyPricesMap.get(date) ?? null);
          }

          const sellPrices: (number | null)[] = [];
          for (let d = 0; d <= data.dcaSellDays; d++) {
            const date = addDays(sellDate, d);
            sellPrices.push(sellPricesMap.get(date) ?? null);
          }

          const buyDaysAvailable = buyPrices.filter((p) => p !== null).length;
          const sellDaysAvailable = sellPrices.filter((p) => p !== null).length;

          cycles.push({
            label: halving.label,
            halvingDate: halving.date,
            buyDate,
            sellDate,
            buyPrices,
            sellPrices,
            buyDaysAvailable,
            sellDaysAvailable,
          });
        }

        return { cycles };
      },
      { ttl: TTL.HISTORICAL_RANGE, staleWhileRevalidate: false },
    );
  });
