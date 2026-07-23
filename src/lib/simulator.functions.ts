import { createServerFn } from "@tanstack/react-start";
import { getBtcPriceFromCsv } from "./csv-price-loader";
import { fetchBtcPriceFromBitstamp } from "./bitstamp-fetcher";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";

// Known halving dates (approximate, based on block heights)
const HALVINGS: Array<{ date: string; block: number; label: string }> = [
  { date: "2012-11-28", block: 210000, label: "2012 Halving" },
  { date: "2016-07-09", block: 420000, label: "2016 Halving" },
  { date: "2020-05-11", block: 630000, label: "2020 Halving" },
  { date: "2024-04-20", block: 840000, label: "2024 Halving" },
];

export interface CycleResult {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number | null;
  sellPrice: number | null;
  returnMultiplier: number | null;
  returnPercent: number | null;
  profit: number | null;
}

export interface SimulatorResult {
  cycles: CycleResult[];
  totalInvestment: number;
  totalReturn: number;
  totalProfit: number | null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function fetchBtcPriceOnDate(dateStr: string): Promise<number | null> {
  // First, try to get price from CSV for dates before 2016-07-12
  const csvPrice = await getBtcPriceFromCsv(dateStr);
  if (csvPrice !== null) {
    return csvPrice;
  }

  // For Bitstamp fetches, use the centralized cache
  return fetchWithCache(
    CacheKeys.historicalPrice(dateStr),
    () => fetchBtcPriceFromBitstamp(dateStr),
    { ttl: TTL.HISTORICAL_PRICE, staleWhileRevalidate: false },
  );
}

export const getSimulatorData = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(
    CacheKeys.simulator(),
    async () => {
      const cycles: CycleResult[] = [];

      for (const halving of HALVINGS) {
        const buyDate = addDays(halving.date, -500);
        const sellDate = addDays(halving.date, 500);

        const [buyPrice, sellPrice] = await Promise.all([
          fetchBtcPriceOnDate(buyDate),
          fetchBtcPriceOnDate(sellDate),
        ]);

        cycles.push({
          label: halving.label,
          halvingDate: halving.date,
          buyDate,
          sellDate,
          buyPrice,
          sellPrice,
          returnMultiplier: buyPrice && sellPrice ? sellPrice / buyPrice : null,
          returnPercent: buyPrice && sellPrice ? ((sellPrice - buyPrice) / buyPrice) * 100 : null,
          profit: null, // computed client-side based on user input
        });
      }

      return { cycles };
    },
    { ttl: TTL.SIMULATOR, staleWhileRevalidate: false },
  );
});
