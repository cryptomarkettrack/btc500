import { createServerFn } from "@tanstack/react-start";
import { HALVINGS, addDays } from "./halvings";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";

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

export function emptyDcaCycles(dcaBuyDays: number, dcaSellDays: number): DcaCycleResult[] {
  return HALVINGS.map((halving) => {
    const buyDate = addDays(halving.date, -500);
    const sellDate = addDays(halving.date, 500);
    return {
      label: halving.label,
      halvingDate: halving.date,
      buyDate,
      sellDate,
      buyPrices: Array.from({ length: dcaBuyDays + 1 }, () => null),
      sellPrices: Array.from({ length: dcaSellDays + 1 }, () => null),
      buyDaysAvailable: 0,
      sellDaysAvailable: 0,
    };
  });
}

function priceSeries(
  startDate: string,
  days: number,
  pricesMap: Map<string, number>,
): { prices: (number | null)[]; available: number } {
  const prices: (number | null)[] = [];
  for (let d = 0; d <= days; d++) {
    prices.push(pricesMap.get(addDays(startDate, d)) ?? null);
  }
  return { prices, available: prices.filter((p) => p !== null).length };
}

async function buildDcaCycles(dcaBuyDays: number, dcaSellDays: number): Promise<DcaCycleResult[]> {
  const { getHistoricalBtcPricesRange } = await import("./historical-price.server");
  const cycles: DcaCycleResult[] = [];

  for (const halving of HALVINGS) {
    const buyDate = addDays(halving.date, -500);
    const sellDate = addDays(halving.date, 500);
    const buyEndDate = addDays(buyDate, dcaBuyDays);
    const sellEndDate = addDays(sellDate, dcaSellDays);

    const [buyPricesMap, sellPricesMap] = await Promise.all([
      getHistoricalBtcPricesRange(buyDate, buyEndDate),
      getHistoricalBtcPricesRange(sellDate, sellEndDate),
    ]);

    const buy = priceSeries(buyDate, dcaBuyDays, buyPricesMap);
    const sell = priceSeries(sellDate, dcaSellDays, sellPricesMap);

    cycles.push({
      label: halving.label,
      halvingDate: halving.date,
      buyDate,
      sellDate,
      buyPrices: buy.prices,
      sellPrices: sell.prices,
      buyDaysAvailable: buy.available,
      sellDaysAvailable: sell.available,
    });
  }

  return cycles;
}

export const getDcaData = createServerFn({ method: "GET" })
  .validator((data: { dcaBuyDays: number; dcaSellDays: number }) => {
    return {
      dcaBuyDays: Math.max(0, Math.min(365, data.dcaBuyDays)),
      dcaSellDays: Math.max(0, Math.min(365, data.dcaSellDays)),
    };
  })
  .handler(async ({ data }) => {
    try {
      return await fetchWithCache(
        CacheKeys.dca(data.dcaBuyDays, data.dcaSellDays),
        async () => ({ cycles: await buildDcaCycles(data.dcaBuyDays, data.dcaSellDays) }),
        { ttl: TTL.HISTORICAL_RANGE, staleWhileRevalidate: false },
      );
    } catch (err) {
      console.error("[dca] failed to build historical comparison:", err);
      return { cycles: emptyDcaCycles(data.dcaBuyDays, data.dcaSellDays) };
    }
  });
