/**
 * Centralized in-memory price cache with TTL support.
 *
 * This module provides a unified caching layer for all external data fetches
 * (BTC price, liquidation data, historical prices, klines, etc.) to avoid
 * hitting rate limits (429 responses) from external providers.
 *
 * Key design decisions:
 * - In-memory Map (not Redis) — works server-side in both Node and edge runtimes
 * - TTL-based expiry — each entry has its own TTL
 * - Stale-while-revalidate pattern — returns stale data while fetching fresh data
 *   to avoid blocking requests when the cache is being refreshed
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

// ─── Cache Store ─────────────────────────────────────────────────────────────

const store = new Map<string, CacheEntry<unknown>>();

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get a value from cache. Returns `null` if not found or expired.
 * If `staleWhileRevalidate` is enabled, expired entries are still returned
 * (so callers can show stale data while a refresh is in-flight).
 */
function get<T>(key: string): { data: T; isStale: boolean } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  const isStale = age >= entry.ttl;

  // If stale and stale-while-revalidate is disabled, treat as miss
  if (isStale && !entry.refreshing) {
    // Don't delete yet — let the caller decide to refresh
    return null;
  }

  return { data: entry.data, isStale };
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
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = 60_000, staleWhileRevalidate = true } = options;

  // 1. Check cache
  const cached = get<T>(key);

  // 2. If we have fresh data, return it immediately
  if (cached && !cached.isStale) {
    return cached.data;
  }

  // 3. If stale-while-revalidate and we have stale data, return it
  //    but trigger a background refresh
  if (cached && cached.isStale && staleWhileRevalidate) {
    // Check if there's already a refresh in-flight
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (entry?.refreshing) {
      // Don't await — just return stale data; the refresh will update cache
      return cached.data;
    }

    // Start background refresh
    const refreshPromise = fetcher()
      .then((freshData) => {
        set(key, freshData, ttl);
        return freshData;
      })
      .catch((err) => {
        // If refresh fails, keep stale data and log warning
        console.warn(`[price-cache] Background refresh failed for "${key}":`, err);
        // Clear the refreshing flag so next request tries again
        const currentEntry = store.get(key) as CacheEntry<T> | undefined;
        if (currentEntry) {
          currentEntry.refreshing = undefined;
        }
        throw err;
      });

    // Store the refresh promise on the entry
    const currentEntry = store.get(key) as CacheEntry<T> | undefined;
    if (currentEntry) {
      currentEntry.refreshing = refreshPromise;
      // Clear refreshing flag when done (success or failure)
      refreshPromise.finally(() => {
        const e = store.get(key) as CacheEntry<T> | undefined;
        if (e) e.refreshing = undefined;
      });
    }

    return cached.data;
  }

  // 4. No cache entry at all — fetch synchronously
  try {
    const freshData = await fetcher();
    set(key, freshData, ttl);
    return freshData;
  } catch (err) {
    // If fetch fails and we have stale data (shouldn't happen here but just in case)
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
  dca: (buyDays: number, sellDays: number) => `btc:dca:${buyDays}:${sellDays}`,

  /** Simulator data */
  simulator: () => "btc:simulator",

  /** Timeline data */
  timeline: () => "btc:timeline",
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

  /** Timeline data: 1 hour — current cycle prices update, but historical is static */
  TIMELINE: 60 * 60_000,
};

// ─── Debug helper ────────────────────────────────────────────────────────────

export const cacheDebug = {
  stats,
  clear,
  has,
  get,
  set,
};
