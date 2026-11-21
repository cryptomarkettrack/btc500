import { timeframeMs, type CandleOutcome } from "./rules";

export interface ExchangeCandle extends CandleOutcome {
  symbol: string;
  timeframe: string;
  openTime: number;
  closeTime: number;
  high: number;
  low: number;
  final: boolean;
}

interface BinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  closeTime: number;
}

function parseKline(value: unknown): BinanceKline | null {
  if (!Array.isArray(value) || value.length < 7) return null;
  const openTime = Number(value[0]);
  const open = Number(value[1]);
  const high = Number(value[2]);
  const low = Number(value[3]);
  const close = Number(value[4]);
  const closeTime = Number(value[6]);
  if (![openTime, open, high, low, close, closeTime].every(Number.isFinite)) return null;
  if (open <= 0 || close <= 0 || high <= 0 || low <= 0) return null;
  return { openTime, open, high, low, close, closeTime };
}

function toExchangeCandle(
  kline: BinanceKline,
  symbol: string,
  timeframe: string,
  intervalMs: number,
  nowMs: number,
): ExchangeCandle {
  // A candle is final only once Binance's close time has passed and it lines
  // up with the timeframe boundary. The live candle's "close" is its current
  // price and must never settle a prediction.
  const final = kline.closeTime <= nowMs && kline.closeTime === kline.openTime + intervalMs - 1;
  return {
    symbol,
    timeframe,
    openTime: kline.openTime,
    closeTime: kline.closeTime,
    open: kline.open,
    high: kline.high,
    low: kline.low,
    close: kline.close,
    final,
  };
}

/**
 * Fetch the single exchange candle with the given (UTC, timeframe-aligned)
 * open time from Binance spot klines. Returns null on any network/parse problem
 * or when the requested candle is not in the response — callers must keep the
 * prediction PENDING rather than guessing a price.
 */
export async function fetchCandle(
  symbol: string,
  timeframe: string,
  openTime: number,
  nowMs = Date.now(),
): Promise<ExchangeCandle | null> {
  const intervalMs = timeframeMs(timeframe);
  if (!intervalMs) return null;

  const url = new URL("https://api.binance.com/api/v3/klines");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", timeframe);
  url.searchParams.set("startTime", String(openTime));
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6_000) });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) return null;

    const kline = parseKline(payload[0]);
    if (!kline || kline.openTime !== openTime) return null;
    return toExchangeCandle(kline, symbol, timeframe, intervalMs, nowMs);
  } catch (error) {
    console.error("[clash/binance] candle fetch failed:", error);
    return null;
  }
}

/**
 * Recent candles for the game chart, oldest first. Includes the live (open)
 * candle so the player can see the current move; `final` distinguishes it from
 * settled candles. Returns [] on failure so the UI can degrade honestly.
 */
export async function fetchRecentCandles(
  symbol: string,
  timeframe: string,
  limit = 40,
  nowMs = Date.now(),
): Promise<ExchangeCandle[]> {
  const intervalMs = timeframeMs(timeframe);
  if (!intervalMs) return [];

  const url = new URL("https://api.binance.com/api/v3/klines");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", timeframe);
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6_000) });
    if (!response.ok) return [];
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return [];

    return payload
      .map(parseKline)
      .filter((kline): kline is BinanceKline => kline !== null)
      .filter((kline) => kline.openTime % intervalMs === 0)
      .sort((a, b) => a.openTime - b.openTime)
      .map((kline) => toExchangeCandle(kline, symbol, timeframe, intervalMs, nowMs));
  } catch (error) {
    console.error("[clash/binance] recent candles fetch failed:", error);
    return [];
  }
}
