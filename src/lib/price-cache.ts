/**
 * Instance-local in-memory cache with TTL support.
 *
 * This is a short-lived optimization for a single Node/Vercel isolate.
 * It is NOT shared across Vercel instances, regions, or cold starts.
 * Do not treat a cache hit as globally authoritative.
 *
 * Key design decisions:
 * - In-memory Map only — no Redis / Edge Config unless the repo already has one
 * - TTL-based expiry — each entry has its own TTL
 * - Stale-while-revalidate — return stale data while one in-flight refresh runs
 * - In-flight coalescing — concurrent misses share one fetcher (stampede guard)
 * - Cache failures never throw in preference to a successful fetch
 * - Separate cache namespaces — different TTLs for different data types
 */

// ─── Types ───────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
  /** Promise for in-flight refresh, to avoid duplicate concurrent fetches */
  refreshing?: Promise<T>;
}

interface CacheOptions {
  /** Time-to-live in milliseconds (default: 60_000 = 1 minute) */
  ttl?: number;
  /** Whether to use stale-while-revalidate (default: true) */
  staleWhileRevalidate?: boolean;
}

// ─── Cache Store (process-local; not shared across Vercel isolates) ───────────

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get a value from cache. Returns `null` if not found or expired.
 * If `staleWhileRevalidate` is enabled, expired entries are still returned
 * (so callers can show stale data while a refresh is in-flight).
 */
function get<T>(key: string): { data: T; isStale: boolean } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  return { data: entry.data, isStale: Date.now() - entry.timestamp >= entry.ttl };
}

/**
 * Set a value in cache.
 */
function set<T>(key: string, data: T, ttl: number): void {
  store.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Check if a key exists and is fresh (not stale).
 */
function has(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Delete a key from cache.
 */
function del(key: string): void {
  store.delete(key);
}

/**
 * Clear all cached entries.
 */
function clear(): void {
  store.clear();
}

/**
 * Get cache stats (useful for debugging).
 */
function stats(): { size: number; keys: string[] } {
  return {
    size: store.size,
    keys: Array.from(store.keys()),
  };
}

// ─── High-level fetch-with-cache helper ──────────────────────────────────────

/**
 * Fetch data with caching. If the data is cached and fresh, returns it immediately.
 * If stale (or missing), calls the fetcher, caches the result, and returns it.
 *
 * If `staleWhileRevalidate` is true and stale data exists, returns stale data
 * immediately while triggering a background refresh. This prevents blocking
 * requests and reduces the chance of 429s.
 *
 * @param key - Cache key
 * @param fetcher - Async function that fetches fresh data
 * @param options - Cache options (ttl, staleWhileRevalidate)
 * @returns The cached or freshly fetched data
 */
function startRefresh<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const refreshPromise = fetcher()
    .then((freshData) => {
      try {
        set(key, freshData, ttl);
      } catch (err) {
        console.warn(`[price-cache] Failed to store "${key}":`, err);
      }
      return freshData;
    })
    .catch((err) => {
      console.warn(`[price-cache] Refresh failed for "${key}":`, err);
      throw err;
    })
    .finally(() => {
      inflight.delete(key);
      const entry = store.get(key) as CacheEntry<T> | undefined;
      if (entry) entry.refreshing = undefined;
    });

  inflight.set(key, refreshPromise);
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (entry) entry.refreshing = refreshPromise;
  return refreshPromise;
}

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = 60_000, staleWhileRevalidate = true } = options;

  let cached: { data: T; isStale: boolean } | null = null;
  try {
    cached = get<T>(key);
  } catch (err) {
    console.warn(`[price-cache] Read failed for "${key}":`, err);
  }

  if (cached && !cached.isStale) {
    return cached.data;
  }

  if (cached && cached.isStale && staleWhileRevalidate) {
    void startRefresh(key, fetcher, ttl).catch(() => {
      // Stale value is already being returned; keep serving it.
    });
    return cached.data;
  }

  try {
    return await startRefresh(key, fetcher, ttl);
  } catch (err) {
    if (cached) {
      console.warn(`[price-cache] Fetch failed for "${key}", returning stale data`);
      return cached.data;
    }
    throw err;
  }
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix: string): void {
  if (store.has(keyOrPrefix)) {
    del(keyOrPrefix);
    return;
  }
  // Treat as prefix — delete all keys starting with this string
  for (const key of store.keys()) {
    if (key.startsWith(keyOrPrefix)) {
      del(key);
    }
  }
}

// ─── Cache Key Builders ──────────────────────────────────────────────────────

export const CacheKeys = {
  /** Live BTC price from exchange APIs */
  btcPrice: () => "btc:live-price",

  /** Liquidation/futures data */
  liquidation: () => "btc:liquidation",

  /** Historical BTC price for a specific date (YYYY-MM-DD) */
  historicalPrice: (dateStr: string) => `btc:historical:${dateStr}`,

  /** Historical BTC price range (start-end) */
  historicalRange: (startDate: string, endDate: string) =>
    `btc:historical-range:${startDate}:${endDate}`,

  /** Monthly BTC klines (year-month) */
  monthlyKlines: (year: number, month: number) => `btc:klines:${year}-${month}`,

  /** DCA comparison data */
  dca: (buyDays: number, sellDays: number) => `btc:dca:v2:${buyDays}:${sellDays}`,

  /** Simulator data (v5 = completeness + structured load status) */
  simulator: () => "btc:simulator:v5",

  /** blockchain.info daily market-price series */
  blockchainSeries: () => "btc:blockchain-series",

  /** Timeline data (v3 = canonical cycle model + completeness) */
  timeline: () => "btc:timeline:v3",

  /** Tip height + observed block interval (instance-local) */
  networkState: () => "btc:network-state:v1",

  /** Cycle score / script integrity */
  cycleScore: () => "btc:cycle-score",

  /** Bear market bottom indicator snapshot */
  bearMarket: () => "btc:bear-market",

  /** US spot Bitcoin ETF absorption snapshot */
  etfAbsorption: () => "btc:etf-absorption:v1",
};

// ─── Default TTLs ────────────────────────────────────────────────────────────

export const TTL = {
  /** Live BTC price: 30 seconds — fast refresh to keep price current */
  LIVE_PRICE: 30_000,

  /** Liquidation data: 60 seconds — changes frequently but not every second */
  LIQUIDATION: 60_000,

  /** Historical price: 24 hours — historical data never changes */
  HISTORICAL_PRICE: 24 * 60 * 60_000,

  /** Historical price range: 24 hours */
  HISTORICAL_RANGE: 24 * 60 * 60_000,

  /** Monthly klines: 6 hours — old data is static, recent months may update slightly */
  MONTHLY_KLINES: 6 * 60 * 60_000,

  /** Simulator data: 24 hours — historical halving prices don't change */
  SIMULATOR: 24 * 60 * 60_000,

  /** Bitcoin network snapshot (height + interval): 10 minutes */
  NETWORK_STATE: 10 * 60_000,

  /** Timeline data: 1 hour — current cycle prices update, but historical is static */
  TIMELINE: 60 * 60_000,

  /** Cycle score: 15 minutes — path + on-chain refresh without thrashing APIs */
  CYCLE_SCORE: 15 * 60_000,

  /** Bear market indicators: 15 minutes — on-chain metrics don't change sub-minute */
  BEAR_MARKET: 15 * 60_000,

  /** ETF flows print once after the US cash session — hourly is plenty */
  ETF_FLOWS: 60 * 60_000,
};

// ─── Debug helper ────────────────────────────────────────────────────────────

export const cacheDebug = {
  stats,
  clear,
  has,
  get,
  set,
};
