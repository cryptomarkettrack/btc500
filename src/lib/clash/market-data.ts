import { timeframeMs, type CandleOutcome } from "./rules";

export type PriceSource = "binance" | "kraken" | "coinbase";

/**
 * Tried in order. Binance is last because it is geo-blocked from some Vercel
 * egress regions — a dead provider must not add latency ahead of working ones.
 */
export const PRICE_SOURCES: PriceSource[] = ["kraken", "coinbase", "binance"];

export interface ExchangeCandle extends CandleOutcome {
  symbol: string;
  timeframe: string;
  openTime: number;
  closeTime: number;
  high: number;
  low: number;
  final: boolean;
  /** Source used for this candle. A prediction must settle from the same source. */
  source: PriceSource;
}

function makeCandle(
  symbol: string,
  timeframe: string,
  intervalMs: number,
  source: PriceSource,
  openTime: number,
  open: number,
  high: number,
  low: number,
  close: number,
  nowMs: number,
): ExchangeCandle | null {
  if (![openTime, open, high, low, close].every(Number.isFinite)) return null;
  if (open <= 0 || close <= 0 || high <= 0 || low <= 0) return null;
  if (openTime % intervalMs !== 0) return null;
  return {
    symbol,
    timeframe,
    openTime,
    closeTime: openTime + intervalMs - 1,
    open,
    high,
    low,
    close,
    // The live candle's close is its current price and must never settle a bet.
    final: openTime + intervalMs - 1 <= nowMs,
    source,
  };
}

export function parseBinanceRows(
  payload: unknown,
  symbol: string,
  timeframe: string,
  intervalMs: number,
  nowMs: number,
): ExchangeCandle[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((value) => {
    if (!Array.isArray(value) || value.length < 7) return [];
    const candle = makeCandle(
      symbol,
      timeframe,
      intervalMs,
      "binance",
      Number(value[0]),
      Number(value[1]),
      Number(value[2]),
      Number(value[3]),
      Number(value[4]),
      nowMs,
    );
    return candle ? [candle] : [];
  });
}

export function parseKrakenRows(
  payload: unknown,
  symbol: string,
  timeframe: string,
  intervalMs: number,
  nowMs: number,
): ExchangeCandle[] {
  if (typeof payload !== "object" || payload === null) return [];
  const body = payload as { error?: unknown; result?: Record<string, unknown> };
  if (!Array.isArray(body.error) || body.error.length > 0 || !body.result) return [];

  const pair = symbol === "BTCUSDT" ? "XBTUSDT" : symbol;
  const rows = body.result[pair];
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((value) => {
    if (!Array.isArray(value) || value.length < 5) return [];
    const candle = makeCandle(
      symbol,
      timeframe,
      intervalMs,
      "kraken",
      Number(value[0]) * 1000,
      Number(value[1]),
      Number(value[2]),
      Number(value[3]),
      Number(value[4]),
      nowMs,
    );
    return candle ? [candle] : [];
  });
}

export function coinbaseOpenTime(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value * 1000;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parseCoinbaseRows(
  payload: unknown,
  symbol: string,
  timeframe: string,
  intervalMs: number,
  nowMs: number,
): ExchangeCandle[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((value) => {
    if (!Array.isArray(value) || value.length < 5) return [];
    const candle = makeCandle(
      symbol,
      timeframe,
      intervalMs,
      "coinbase",
      coinbaseOpenTime(value[0]),
      Number(value[3]),
      Number(value[2]),
      Number(value[1]),
      Number(value[4]),
      nowMs,
    );
    return candle ? [candle] : [];
  });
}

interface RequestOptions {
  openTime?: number;
  limit: number;
}

async function requestCandles(
  source: PriceSource,
  symbol: string,
  timeframe: string,
  options: RequestOptions,
  nowMs: number,
): Promise<ExchangeCandle[]> {
  const intervalMs = timeframeMs(timeframe);
  if (!intervalMs) return [];

  let url: URL;
  if (source === "binance") {
    url = new URL("https://api.binance.com/api/v3/klines");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", timeframe);
    if (options.openTime !== undefined) {
      url.searchParams.set("startTime", String(options.openTime));
      url.searchParams.set("limit", "1");
    } else {
      url.searchParams.set("limit", String(options.limit));
    }
  } else if (source === "kraken") {
    url = new URL("https://api.kraken.com/0/public/OHLC");
    url.searchParams.set("pair", symbol === "BTCUSDT" ? "XBTUSDT" : symbol);
    // Kraken's OHLC interval is in minutes, not seconds.
    url.searchParams.set("interval", String(intervalMs / 60_000));
  } else {
    url = new URL("https://api.exchange.coinbase.com/products/BTC-USD/candles");
    url.searchParams.set("granularity", String(intervalMs / 1000));
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6_000) });
    if (!response.ok) {
      console.warn(`[clash/market-data] ${source} returned ${response.status}`);
      return [];
    }
    const payload: unknown = await response.json();
    const rows =
      source === "binance"
        ? parseBinanceRows(payload, symbol, timeframe, intervalMs, nowMs)
        : source === "kraken"
          ? parseKrakenRows(payload, symbol, timeframe, intervalMs, nowMs)
          : parseCoinbaseRows(payload, symbol, timeframe, intervalMs, nowMs);

    const matching =
      options.openTime === undefined
        ? rows
        : rows.filter((candle) => candle.openTime === options.openTime);
    return matching.sort((a, b) => a.openTime - b.openTime).slice(-options.limit);
  } catch (error) {
    console.warn(`[clash/market-data] ${source} fetch failed:`, error);
    return [];
  }
}

/** Recent candles for the chart, oldest first, from the first working source. */
export async function fetchRecentCandles(
  symbol: string,
  timeframe: string,
  limit = 40,
  nowMs = Date.now(),
): Promise<ExchangeCandle[]> {
  for (const source of PRICE_SOURCES) {
    const candles = await requestCandles(source, symbol, timeframe, { limit }, nowMs);
    if (candles.length > 0) return candles;
  }
  return [];
}

/** One exact candle from the first source that has it (used for entry pricing). */
export async function fetchCandle(
  symbol: string,
  timeframe: string,
  openTime: number,
  nowMs = Date.now(),
): Promise<ExchangeCandle | null> {
  for (const source of PRICE_SOURCES) {
    const rows = await requestCandles(source, symbol, timeframe, { openTime, limit: 1 }, nowMs);
    if (rows[0]) return rows[0];
  }
  return null;
}

/**
 * Settlement must use the same source that priced the prediction — never mix
 * exchanges for a single outcome. If that source is down, keep it PENDING.
 */
export async function fetchCandleFromSource(
  source: PriceSource,
  symbol: string,
  timeframe: string,
  openTime: number,
  nowMs = Date.now(),
): Promise<ExchangeCandle | null> {
  const rows = await requestCandles(source, symbol, timeframe, { openTime, limit: 1 }, nowMs);
  return rows[0] ?? null;
}
