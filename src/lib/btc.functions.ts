import { createServerFn } from "@tanstack/react-start";
import {
  firstSuccessfulProvider,
  parseBinanceBtcUsd,
  parseBlockHeight,
  parseBlockSummaries,
  parseCoinbaseBtcUsd,
  parseCoingeckoBtcUsd,
  parseKrakenBtcUsd,
  parsePositiveFinite,
  readJsonIfOk,
  readTextIfOk,
} from "./btc-providers";
import {
  LAST_HISTORICAL_HALVING,
  buildHalvingEstimate,
  estimateBlockInterval,
  estimateCurrentBlockHeight,
  fallbackInterval,
  historicalHalvingByBlock,
  lastHalvingTimestamp,
  type BlockIntervalEstimate,
  type BlockSample,
  type EstimateConfidence,
  type HalvingEstimate,
  type HeightSource,
  type IntervalSource,
  type NetworkState,
} from "./halvings";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";

const BLOCK_HEIGHT_SOURCE_TIMEOUT_MS = 4_000;
const BLOCK_HEIGHT_OVERALL_TIMEOUT_MS = 6_000;

export interface HalvingInfo {
  height: number;
  nextHalvingBlock: number;
  lastHalvingBlock: number;
  /** ISO timestamp of the estimated next halving (same as estimatedHalvingTimestamp). */
  nextHalvingDate: string;
  /** ISO timestamp of the last halving (historical when known). */
  lastHalvingDate: string;
  estimatedHalvingTimestamp: string;
  estimatedHalvingDate: string;
  intervalSeconds: number;
  intervalSource: IntervalSource;
  heightSource: HeightSource;
  confidence: EstimateConfidence;
  blocksRemaining: number;
}

export function toHalvingInfo(network: NetworkState): HalvingInfo {
  const estimate = buildHalvingEstimate(network);
  return halvingInfoFromEstimate(estimate, network.observedAt);
}

export function halvingInfoFromEstimate(estimate: HalvingEstimate, nowMs: number): HalvingInfo {
  return {
    height: estimate.currentHeight,
    nextHalvingBlock: estimate.nextHalvingBlock,
    lastHalvingBlock: estimate.lastHalvingBlock,
    nextHalvingDate: estimate.estimatedTimestamp,
    lastHalvingDate: lastHalvingTimestamp(estimate.lastHalvingBlock, estimate, nowMs),
    estimatedHalvingTimestamp: estimate.estimatedTimestamp,
    estimatedHalvingDate: estimate.estimatedDate,
    intervalSeconds: estimate.intervalSeconds,
    intervalSource: estimate.intervalSource,
    heightSource: estimate.heightSource,
    confidence: estimate.confidence,
    blocksRemaining: estimate.blocksRemaining,
  };
}

export function estimateFromHalvingInfo(info: HalvingInfo): HalvingEstimate {
  return {
    nextHalvingBlock: info.nextHalvingBlock,
    lastHalvingBlock: info.lastHalvingBlock,
    currentHeight: info.height,
    heightSource: info.heightSource,
    estimatedTimestamp: info.estimatedHalvingTimestamp,
    estimatedDate: info.estimatedHalvingDate,
    intervalSeconds: info.intervalSeconds,
    intervalSource: info.intervalSource,
    confidence: info.confidence,
    blocksRemaining: info.blocksRemaining,
  };
}

/**
 * Pure derivation of the halving-cycle info for a given block height.
 * Shared by the live server function and the deterministic client/server estimate
 * so first paint is never blocked on external block-height APIs.
 */
export function deriveHalvingInfo(
  height: number,
  now: number = Date.now(),
  interval: BlockIntervalEstimate = fallbackInterval(),
  heightSource: HeightSource = "estimated",
): HalvingInfo {
  return toHalvingInfo({
    height,
    heightSource,
    interval,
    observedAt: now,
  });
}

/**
 * Deterministic estimate of the current block height derived from the last
 * confirmed halving + the protocol 10-minute target. No network required.
 */
export function estimateCurrentHeight(now: number = Date.now()): number {
  return estimateCurrentBlockHeight(now);
}

/** Deterministic halving info used to seed the countdown before the live fetch resolves. */
export function estimateHalvingInfo(now: number = Date.now()): HalvingInfo {
  return deriveHalvingInfo(estimateCurrentBlockHeight(now), now, fallbackInterval(), "estimated");
}

async function fetchBlockHeight(): Promise<number> {
  const sources = [
    "https://mempool.space/api/blocks/tip/height",
    "https://blockchain.info/q/getblockcount",
    "https://blockstream.info/api/blocks/tip/height",
  ];

  const attempt = async (): Promise<number> => {
    const result = await firstSuccessfulProvider(
      sources.map((url) => ({
        name: url,
        fetch: async () => {
          const r = await fetch(url, {
            signal: AbortSignal.timeout(BLOCK_HEIGHT_SOURCE_TIMEOUT_MS),
          });
          return parseBlockHeight(await readTextIfOk(r));
        },
      })),
      (n): n is number => n !== null,
    );
    if (!result || result.value === null) throw new Error("block-height-unavailable");
    return result.value;
  };

  return Promise.race([
    attempt(),
    new Promise<number>((_, reject) => {
      setTimeout(() => reject(new Error("block-height-timeout")), BLOCK_HEIGHT_OVERALL_TIMEOUT_MS);
    }),
  ]);
}

async function fetchMempoolBlocksEndingAt(height?: number): Promise<BlockSample[]> {
  const url =
    height == null
      ? "https://mempool.space/api/v1/blocks"
      : `https://mempool.space/api/v1/blocks/${height}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(BLOCK_HEIGHT_SOURCE_TIMEOUT_MS) });
  return parseBlockSummaries(await readJsonIfOk(r));
}

async function fetchBlockstreamTipBlocks(): Promise<BlockSample[]> {
  const r = await fetch("https://blockstream.info/api/blocks", {
    signal: AbortSignal.timeout(BLOCK_HEIGHT_SOURCE_TIMEOUT_MS),
  });
  return parseBlockSummaries(await readJsonIfOk(r));
}

function pickOldestNewest(
  samples: BlockSample[],
): { earlier: BlockSample; later: BlockSample } | null {
  if (samples.length < 2) return null;
  const sorted = [...samples].sort((a, b) => a.height - b.height);
  const earlier = sorted[0]!;
  const later = sorted[sorted.length - 1]!;
  if (later.height <= earlier.height) return null;
  return { earlier, later };
}

async function fetchObservedInterval(): Promise<BlockIntervalEstimate> {
  // The observed interval is a live-pace *diagnostic* (source / confidence and,
  // for short horizons, the current block rate) — it no longer drives the
  // next-halving date, which is projected at the protocol 10-minute target (see
  // buildHalvingEstimate). Computing it across the whole epoch (~2 years of
  // blocks) gives a stable, representative number instead of a noisy 1-day tail.
  const earlier: BlockSample = {
    height: LAST_HISTORICAL_HALVING.block,
    timestampSec: Math.floor(Date.parse(LAST_HISTORICAL_HALVING.timestamp) / 1000),
  };

  try {
    const tipBlocks = await fetchMempoolBlocksEndingAt();
    const later = pickOldestNewest(tipBlocks)?.later ?? tipBlocks[0];
    if (later && later.height > earlier.height) {
      return estimateBlockInterval(earlier, later);
    }
  } catch {
    // Fall through to the blockstream tip.
  }

  try {
    const tipBlocks = await fetchBlockstreamTipBlocks();
    const later = pickOldestNewest(tipBlocks)?.later ?? tipBlocks[0];
    if (later && later.height > earlier.height) {
      return estimateBlockInterval(earlier, later);
    }
  } catch {
    // No observed sample.
  }

  return fallbackInterval();
}

async function fetchNetworkState(): Promise<NetworkState> {
  const height = await fetchBlockHeight();
  const interval = await fetchObservedInterval();
  return {
    height,
    heightSource: "live",
    interval,
    observedAt: Date.now(),
  };
}

/**
 * Live tip height + observed interval when providers respond in time;
 * otherwise the deterministic protocol-interval estimate. Never throws.
 */
export async function resolveHalvingInfo(now: number = Date.now()): Promise<HalvingInfo> {
  try {
    const network = await fetchWithCache(CacheKeys.networkState(), fetchNetworkState, {
      ttl: TTL.NETWORK_STATE,
      staleWhileRevalidate: true,
    });
    return toHalvingInfo({
      ...network,
      // Project from the snapshot's observation time so remaining-blocks
      // and the cached height stay consistent.
      observedAt: network.observedAt,
    });
  } catch (err) {
    console.error("[halving] live height unavailable, using labelled fallback estimate:", err);
    return estimateHalvingInfo(now);
  }
}

export const getHalvingInfo = createServerFn({ method: "GET" }).handler(async () => {
  return resolveHalvingInfo();
});

/**
 * Internal function that actually fetches BTC price from external providers.
 * Tries Binance → CoinGecko → Coinbase → Kraken in order.
 */
async function fetchBtcPriceFromProviders(): Promise<{ price: number; ts: number }> {
  const sources = [
    {
      name: "binance",
      fetch: async () => {
        const r = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
          signal: AbortSignal.timeout(5000),
        });
        const price = parseBinanceBtcUsd(await readJsonIfOk(r));
        if (price === null) throw new Error("binance-malformed");
        return price;
      },
    },
    {
      name: "coingecko",
      fetch: async () => {
        const r = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
          { signal: AbortSignal.timeout(5000) },
        );
        const price = parseCoingeckoBtcUsd(await readJsonIfOk(r));
        if (price === null) throw new Error("coingecko-malformed");
        return price;
      },
    },
    {
      name: "coinbase",
      fetch: async () => {
        const r = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", {
          signal: AbortSignal.timeout(5000),
        });
        const price = parseCoinbaseBtcUsd(await readJsonIfOk(r));
        if (price === null) throw new Error("coinbase-malformed");
        return price;
      },
    },
    {
      name: "kraken",
      fetch: async () => {
        const r = await fetch("https://api.kraken.com/0/public/Ticker?pair=XBTUSD", {
          signal: AbortSignal.timeout(5000),
        });
        const price = parseKrakenBtcUsd(await readJsonIfOk(r));
        if (price === null) throw new Error("kraken-malformed");
        return price;
      },
    },
  ];

  const result = await firstSuccessfulProvider(sources, (p) => parsePositiveFinite(p) !== null);
  if (!result) throw new Error("btc-price-unavailable");
  return { price: result.value, ts: Date.now() };
}

export const getBtcPrice = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchWithCache(CacheKeys.btcPrice(), () => fetchBtcPriceFromProviders(), {
      ttl: TTL.LIVE_PRICE,
      staleWhileRevalidate: true,
    });
  } catch (err) {
    console.error("[btc-price] all live providers failed:", err);
    throw err;
  }
});

/** Re-export for callers that only need the last confirmed historical timestamp. */
export { historicalHalvingByBlock };
