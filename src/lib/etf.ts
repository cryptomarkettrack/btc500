/**
 * US spot Bitcoin ETF flow fetcher.
 *
 * Primary source is TFTC's open daily series (CC BY 4.0), which compiles
 * SoSoValue aggregates and Farside issuer tables. No API key required.
 */

import { createServerFn } from "@tanstack/react-start";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";
import { fetchWithRetry, DEFAULT_FETCH_TIMEOUT_MS } from "./http";
import { buildAbsorptionSnapshot, type EtfAbsorptionSnapshot } from "./etf-analysis";
import { parseTftcPayload, TFTC_ETF_JSON_URL } from "./etf-parse";

export type { EtfAbsorptionSnapshot, EtfFlowDay } from "./etf-analysis";
export { parseTftcDay, parseTftcPayload, TFTC_ETF_JSON_URL } from "./etf-parse";

async function fetchEtfAbsorption(): Promise<EtfAbsorptionSnapshot> {
  const response = await fetchWithRetry(TFTC_ETF_JSON_URL, {
    timeoutMs: DEFAULT_FETCH_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
      "User-Agent": "BTC500/1.0 (+https://btc500.net/bitcoin-etf)",
    },
    onError: (error, attempt, maxRetries) => {
      console.warn(
        `[etf] TFTC fetch attempt ${attempt}/${maxRetries} failed:`,
        error instanceof Error ? error.message : error,
      );
    },
  });

  if (!response) {
    throw new Error("Bitcoin ETF flow source is unavailable");
  }

  const raw: unknown = await response.json();
  const parsed = parseTftcPayload(raw);
  return buildAbsorptionSnapshot(parsed.days, {
    sourceName: "TFTC open ETF series",
    sourceUrl: parsed.sourceUrl,
    attribution: parsed.attribution,
    sources: parsed.sources,
    license: parsed.license,
    updatedThrough: parsed.updatedThrough,
    fetchDate: new Date().toISOString(),
  });
}

export const getBitcoinEtfAbsorption = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(CacheKeys.etfAbsorption(), fetchEtfAbsorption, {
    ttl: TTL.ETF_FLOWS,
    staleWhileRevalidate: true,
  });
});
