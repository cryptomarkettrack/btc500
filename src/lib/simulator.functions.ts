import { createServerFn } from "@tanstack/react-start";
import { HALVINGS, addDays } from "./halvings";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";

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

function cycleFromPrices(
  halving: (typeof HALVINGS)[number],
  buyPrice: number | null,
  halvingPrice: number | null,
  sellPrice: number | null,
): CycleResult {
  const buyDate = addDays(halving.date, -500);
  const sellDate = addDays(halving.date, 500);
  return {
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
  };
}

export function emptySimulatorCycles(): CycleResult[] {
  return HALVINGS.map((halving) => cycleFromPrices(halving, null, null, null));
}

async function buildSimulatorCycles(): Promise<CycleResult[]> {
  const { getHistoricalBtcPrice, getHistoricalDataset } = await import("./historical-price.server");
  const dataset = await getHistoricalDataset();
  console.info(
    `[simulator] dataset source=${dataset.source} size=${dataset.size} ${dataset.firstDate}→${dataset.lastDate}`,
  );

  const cycles: CycleResult[] = [];
  for (const halving of HALVINGS) {
    const buyDate = addDays(halving.date, -500);
    const sellDate = addDays(halving.date, 500);
    const [buyPrice, halvingPrice, sellPrice] = await Promise.all([
      getHistoricalBtcPrice(buyDate),
      getHistoricalBtcPrice(halving.date),
      getHistoricalBtcPrice(sellDate),
    ]);
    cycles.push(cycleFromPrices(halving, buyPrice, halvingPrice, sellPrice));
  }
  return cycles;
}

export const getSimulatorData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchWithCache(
      CacheKeys.simulator(),
      async () => ({ cycles: await buildSimulatorCycles() }),
      { ttl: TTL.SIMULATOR, staleWhileRevalidate: false },
    );
  } catch (err) {
    console.error("[simulator] failed to build historical result:", err);
    return { cycles: emptySimulatorCycles() };
  }
});
