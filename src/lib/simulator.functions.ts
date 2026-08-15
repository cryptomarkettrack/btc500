import { createServerFn } from "@tanstack/react-start";
import { getBtcPriceFromCsv } from "./csv-price-loader";
import { fetchBtcPriceFromBitstamp } from "./bitstamp-fetcher";
import { fetchBtcPriceFromBlockchain } from "./blockchain-price";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";
import { HALVINGS, addDays } from "./halvings";

export interface CycleResult {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number | null;
  /** BTC price on the halving date itself, when a historical print exists. */
  halvingPrice: number | null;
  sellPrice: number | null;
  returnMultiplier: number | null;
  returnPercent: number | null;
  /** T-500 → halving return, when both prices exist. */
  toHalvingMultiplier: number | null;
  toHalvingPercent: number | null;
  profit: number | null;
}

export interface SimulatorResult {
  cycles: CycleResult[];
  totalInvestment: number;
  totalReturn: number;
  totalProfit: number | null;
}

async function fetchBtcPriceOnDate(dateStr: string): Promise<number | null> {
  const csvPrice = await getBtcPriceFromCsv(dateStr);
  if (csvPrice !== null) {
    return csvPrice;
  }

  const bitstamp = await fetchWithCache(
    CacheKeys.historicalPrice(dateStr),
    () => fetchBtcPriceFromBitstamp(dateStr),
    { ttl: TTL.HISTORICAL_PRICE, staleWhileRevalidate: false },
  );
  if (bitstamp !== null) return bitstamp;

  // Last resort. 2012-cycle dates now live in btc-usd-max.csv (2011-07-17 onward).
  return fetchBtcPriceFromBlockchain(dateStr);
}

export const getSimulatorData = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(
    CacheKeys.simulator(),
    async () => {
      const cycles: CycleResult[] = [];

      for (const halving of HALVINGS) {
        const buyDate = addDays(halving.date, -500);
        const sellDate = addDays(halving.date, 500);

        const [buyPrice, halvingPrice, sellPrice] = await Promise.all([
          fetchBtcPriceOnDate(buyDate),
          fetchBtcPriceOnDate(halving.date),
          fetchBtcPriceOnDate(sellDate),
        ]);

        cycles.push({
          label: halving.label,
          halvingDate: halving.date,
          buyDate,
          sellDate,
          buyPrice,
          halvingPrice,
          sellPrice,
          returnMultiplier: buyPrice && sellPrice ? sellPrice / buyPrice : null,
          returnPercent: buyPrice && sellPrice ? ((sellPrice - buyPrice) / buyPrice) * 100 : null,
          toHalvingMultiplier: buyPrice && halvingPrice ? halvingPrice / buyPrice : null,
          toHalvingPercent:
            buyPrice && halvingPrice ? ((halvingPrice - buyPrice) / buyPrice) * 100 : null,
          profit: null, // computed client-side based on user input
        });
      }

      return { cycles };
    },
    { ttl: TTL.SIMULATOR, staleWhileRevalidate: false },
  );
});
