import { createServerFn } from "@tanstack/react-start";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";

// Known past halvings
const HALVING_BLOCKS = [210000, 420000, 630000, 840000, 1050000, 1260000, 1470000];
const AVG_BLOCK_MINUTES = 10;

async function fetchBlockHeight(): Promise<number> {
  const sources = [
    { url: "https://mempool.space/api/blocks/tip/height", parse: (t: string) => parseInt(t) },
    { url: "https://blockchain.info/q/getblockcount", parse: (t: string) => parseInt(t) },
    {
      url: "https://blockstream.info/api/blocks/tip/height",
      parse: (t: string) => parseInt(t),
    },
  ];
  for (const s of sources) {
    try {
      const r = await fetch(s.url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) continue;
      const n = s.parse(await r.text());
      if (Number.isFinite(n) && n > 800000) return n;
      // Try the next source if this one fails or returns an unusable height.
    } catch {
      // Provider unavailable — fall through to the next source.
    }
  }
  throw new Error("block-height-unavailable");
}

// Estimate last halving date by working backwards from known height 840000 on 2024-04-20 09:09 UTC
const KNOWN_HEIGHT = 840000;
const KNOWN_DATE = Date.UTC(2024, 3, 20, 9, 9, 0);
const BLOCK_MS = AVG_BLOCK_MINUTES * 60_000;

export interface HalvingInfo {
  height: number;
  nextHalvingBlock: number;
  lastHalvingBlock: number;
  nextHalvingDate: string;
  lastHalvingDate: string;
}

/**
 * Pure derivation of the halving-cycle info for a given block height.
 * Shared by the live server function and the deterministic client/server estimate
 * so first paint is never blocked on external block-height APIs.
 */
export function deriveHalvingInfo(height: number, now: number = Date.now()): HalvingInfo {
  const nextHalvingBlock = HALVING_BLOCKS.find((b) => b > height) ?? 1050000;
  const lastHalvingBlock = [...HALVING_BLOCKS].reverse().find((b) => b <= height) ?? 840000;
  const blocksUntilNext = nextHalvingBlock - height;
  const nextHalvingDate = new Date(now + blocksUntilNext * BLOCK_MS);
  const lastHalvingDate = new Date(KNOWN_DATE + (lastHalvingBlock - KNOWN_HEIGHT) * BLOCK_MS);
  return {
    height,
    nextHalvingBlock,
    lastHalvingBlock,
    nextHalvingDate: nextHalvingDate.toISOString(),
    lastHalvingDate: lastHalvingDate.toISOString(),
  };
}

/**
 * Deterministic estimate of the current block height derived from the known 2024
 * halving anchor (block 840000) + 10-minute blocks. No network required — lets the
 * countdown render instantly and get refined when the live height arrives.
 */
export function estimateCurrentBlockHeight(now: number = Date.now()): number {
  return Math.max(KNOWN_HEIGHT, Math.floor(KNOWN_HEIGHT + (now - KNOWN_DATE) / BLOCK_MS));
}

/** Deterministic halving info used to seed the countdown before the live fetch resolves. */
export function estimateHalvingInfo(now: number = Date.now()): HalvingInfo {
  return deriveHalvingInfo(estimateCurrentBlockHeight(now), now);
}

export const getHalvingInfo = createServerFn({ method: "GET" }).handler(async () => {
  const height = await fetchBlockHeight();
  return deriveHalvingInfo(height);
});

/**
 * Internal function that actually fetches BTC price from external providers.
 * Tries Binance → CoinGecko → Coinbase → Kraken in order.
 */
async function fetchBtcPriceFromProviders(): Promise<{ price: number; ts: number }> {
  const sources: Array<() => Promise<number>> = [
    async () => {
      const r = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
        signal: AbortSignal.timeout(5000),
      });
      const j = (await r.json()) as { price: string };
      return parseFloat(j.price);
    },
    async () => {
      const r = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        { signal: AbortSignal.timeout(5000) },
      );
      const j = (await r.json()) as { bitcoin: { usd: number } };
      return j.bitcoin.usd;
    },
    async () => {
      const r = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", {
        signal: AbortSignal.timeout(5000),
      });
      const j = (await r.json()) as { data: { amount: string } };
      return parseFloat(j.data.amount);
    },
    async () => {
      const r = await fetch("https://api.kraken.com/0/public/Ticker?pair=XBTUSD", {
        signal: AbortSignal.timeout(5000),
      });
      const j = (await r.json()) as { result: Record<string, { c: string[] }> };
      const key = Object.keys(j.result)[0];
      return parseFloat(j.result[key].c[0]);
    },
  ];
  for (const src of sources) {
    try {
      const p = await src();
      if (Number.isFinite(p) && p > 0) return { price: p, ts: Date.now() };
      // Try the next provider if this one fails or returns a non-positive price.
    } catch {
      // Provider unavailable — fall through to the next source.
    }
  }
  throw new Error("btc-price-unavailable");
}

export const getBtcPrice = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(CacheKeys.btcPrice(), () => fetchBtcPriceFromProviders(), {
    ttl: TTL.LIVE_PRICE,
    staleWhileRevalidate: true,
  });
});
