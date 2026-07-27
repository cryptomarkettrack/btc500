/**
 * Shared HTTP utilities for server-side data fetchers.
 */

export const DEFAULT_FETCH_TIMEOUT_MS = 15_000;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_BASE_DELAY_MS = 1000;

/** Browser-like UA used when scraping or calling APIs that block bare bots. */
export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const DEFAULT_FETCH_HEADERS: Record<string, string> = {
  "User-Agent": DEFAULT_USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export interface RetryFetchOptions {
  retries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** Called after each failed attempt (before sleep). */
  onError?: (error: unknown, attempt: number, maxRetries: number) => void;
}

/**
 * Fetch with timeout + exponential backoff retries.
 * Returns null if all attempts fail.
 */
export async function fetchWithRetry(
  url: string,
  options: RetryFetchOptions = {},
): Promise<Response | null> {
  const {
    retries = DEFAULT_MAX_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
    headers = DEFAULT_FETCH_HEADERS,
    onError,
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, { headers }, timeoutMs);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return response;
    } catch (error) {
      onError?.(error, attempt, retries);
      if (attempt < retries) {
        await sleep(baseDelayMs * attempt);
      }
    }
  }
  return null;
}
