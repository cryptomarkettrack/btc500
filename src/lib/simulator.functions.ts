import { createServerFn } from "@tanstack/react-start";
import { lookupHistoricalPrice } from "./historical-csv";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";
import {
  assembleSimulatorResult,
  emptySimulatorCycles,
  unavailableSimulatorResult,
  type CycleResult,
  type SimulatorResult,
} from "./simulator-result";

export type { CycleResult, SimulatorResult };
export { emptySimulatorCycles, unavailableSimulatorResult };

export const getSimulatorData = createServerFn({ method: "GET" }).handler(
  async (): Promise<SimulatorResult> => {
    try {
      return await fetchWithCache(
        CacheKeys.simulator(),
        async () => {
          const { getHistoricalDataset } = await import("./historical-price.server");
          const dataset = await getHistoricalDataset();
          console.info(
            `[simulator] dataset source=${dataset.source} size=${dataset.size} ${dataset.firstDate}→${dataset.lastDate}`,
          );
          return assembleSimulatorResult(
            (date) => lookupHistoricalPrice(dataset, date),
            dataset.source,
            dataset.size,
          );
        },
        { ttl: TTL.SIMULATOR, staleWhileRevalidate: false },
      );
    } catch (err) {
      console.error("[simulator] failed to build historical result:", err);
      return unavailableSimulatorResult(
        "unknown",
        "upstream",
        "Historical data could not be loaded.",
      );
    }
  },
);
