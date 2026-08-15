/**
 * Daily BTC USD prices from blockchain.info, used only when CSV and Bitstamp
 * have no candle. The 2012-cycle buy window is now in btc-usd-max.csv.
 */

import { dateToMs } from "./halvings";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";

/** Last-resort closes if every live source is down. Source: blockchain.info market-price. */
const SEEDED_EARLY_PRICES: Record<string, number> = {
  "2011-07-16": 14.25,
  "2011-07-17": 14.07,
};

async function loadBlockchainSeries(): Promise<Map<string, number>> {
  const url =
    "https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=false";
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`blockchain.info ${res.status}`);

  const json = (await res.json()) as { values?: Array<{ x: number; y: number }> };
  const values = json.values;
  if (!Array.isArray(values)) throw new Error("blockchain.info: missing values");

  const map = new Map<string, number>();
  for (const point of values) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.y <= 0) continue;
    const date = new Date(point.x * 1000).toISOString().slice(0, 10);
    map.set(date, point.y);
  }
  return map;
}

export async function fetchBtcPriceFromBlockchain(dateStr: string): Promise<number | null> {
  try {
    const series = await fetchWithCache(CacheKeys.blockchainSeries(), loadBlockchainSeries, {
      ttl: TTL.HISTORICAL_PRICE,
      staleWhileRevalidate: false,
    });
    const exact = series.get(dateStr);
    if (exact !== undefined) return exact;

    const target = dateToMs(dateStr);
    let best: { price: number; delta: number } | null = null;
    for (const [iso, price] of series) {
      const delta = Math.abs(dateToMs(iso) - target);
      if (delta <= 86_400_000 && (best === null || delta < best.delta)) {
        best = { price, delta };
      }
    }
    return best?.price ?? SEEDED_EARLY_PRICES[dateStr] ?? null;
  } catch (err) {
    console.error(`[blockchain.info] ${dateStr}:`, err);
    return SEEDED_EARLY_PRICES[dateStr] ?? null;
  }
}
