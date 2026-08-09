/**
 * Server-side fetch for the Bear Market dashboard.
 *
 * Fetch all on-chain indicators in parallel (instead of sequential client-side
 * loop), cache the snapshot, and apply a hard timeout so SSR never hangs.
 * The cached snapshot is what gets rendered into the initial HTML for SEO.
 */

import { createServerFn } from "@tanstack/react-start";
import { INDICATORS, BOTTOMS, fetchIndicatorData } from "./bear-market/config";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";

export interface BearMarketIndicatorData {
  indicators: Record<string, { current: number | null; bottoms: (number | null)[] }>;
  loadedCount: number;
  totalIndicators: number;
}

/** Hard cap so cold SSR doesn't wait forever on slow BitView responses. */
const SSR_TIMEOUT_MS = 12_000;

async function fetchAllIndicatorsParallel(): Promise<BearMarketIndicatorData> {
  const results = await Promise.allSettled(
    INDICATORS.map((ind) => fetchIndicatorData(ind.apiName)),
  );

  const indicators: Record<string, { current: number | null; bottoms: (number | null)[] }> = {};
  let loadedCount = 0;

  INDICATORS.forEach((ind, i) => {
    const r = results[i];
    if (r.status === "fulfilled") {
      indicators[ind.name] = r.value;
      if (r.value.current !== null) loadedCount++;
    } else {
      // Failed/timeout — render as "No Data" (component already handles nulls)
      indicators[ind.name] = { current: null, bottoms: BOTTOMS.map(() => null) };
    }
  });

  return { indicators, loadedCount, totalIndicators: INDICATORS.length };
}

export const getBearMarketData = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(
    CacheKeys.bearMarket(),
    async () => {
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Bear market indicator fetch timed out")),
          SSR_TIMEOUT_MS,
        );
      });
      return Promise.race([fetchAllIndicatorsParallel(), timeout]);
    },
    { ttl: TTL.BEAR_MARKET, staleWhileRevalidate: false },
  );
});
