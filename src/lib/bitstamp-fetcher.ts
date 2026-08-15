import { dateToMs } from "./halvings";
import { fetchWithTimeout } from "./http";

const BITSTAMP_TIMEOUT_MS = 5_000;

type BitstampOhlc = {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

function parseBitstampBody(json: unknown): BitstampOhlc[] | null {
  if (!json || typeof json !== "object") return null;
  const data = (json as { data?: { ohlc?: unknown } }).data;
  if (!data || !Array.isArray(data.ohlc)) return null;
  return data.ohlc as BitstampOhlc[];
}

/**
 * Fetch a single historical BTC price from Bitstamp for a given date.
 * Used only for dates after the last bundled CSV print. Never throws.
 */
export async function fetchBtcPriceFromBitstamp(dateStr: string): Promise<number | null> {
  const logTag = `[fetchBtcPriceFromBitstamp ${dateStr}]`;
  const targetUnixSeconds = Math.floor(dateToMs(dateStr) / 1000);
  if (!Number.isFinite(targetUnixSeconds)) {
    console.error(`${logTag} invalid date`);
    return null;
  }

  try {
    const start = targetUnixSeconds - 86400;
    const end = targetUnixSeconds + 86400;
    const url = `https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1000&start=${start}&end=${end}`;

    const r = await fetchWithTimeout(url, {}, BITSTAMP_TIMEOUT_MS);
    if (!r.ok) {
      console.error(`${logTag} Bitstamp returned status ${r.status}`);
      return null;
    }

    const ohlc = parseBitstampBody(await r.json());
    if (!ohlc || ohlc.length === 0) {
      console.error(`${logTag} Bitstamp returned no OHLC data`);
      return null;
    }

    const TOLERANCE_S = 86400;
    const candle = ohlc.find((c) => {
      const ts = parseInt(c.timestamp, 10);
      return Number.isFinite(ts) && Math.abs(ts - targetUnixSeconds) < TOLERANCE_S;
    });

    if (!candle) {
      console.error(`${logTag} Bitstamp: no candle found within 1 day of target date`);
      return null;
    }

    const closePrice = parseFloat(candle.close);
    if (!Number.isFinite(closePrice) || closePrice <= 0) {
      console.error(
        `${logTag} Bitstamp returned invalid close price: ${closePrice} (timestamp: ${candle.timestamp})`,
      );
      return null;
    }

    return closePrice;
  } catch (err) {
    console.error(`${logTag} Bitstamp threw:`, err);
    return null;
  }
}

/**
 * Daily closes for an inclusive date range. One request, 5s timeout, never throws.
 * Callers must only use this for the post-CSV recent tail.
 */
export async function fetchBtcPricesFromBitstampRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  const startUnix = Math.floor(dateToMs(startDate) / 1000);
  const endUnix = Math.floor(dateToMs(endDate) / 1000);
  if (!Number.isFinite(startUnix) || !Number.isFinite(endUnix) || startUnix > endUnix) {
    return priceMap;
  }

  const url = `https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1000&start=${startUnix}&end=${endUnix}`;
  try {
    const r = await fetchWithTimeout(url, {}, BITSTAMP_TIMEOUT_MS);
    if (!r.ok) {
      console.error(
        `[fetchBtcPricesFromBitstampRange] status ${r.status} for ${startDate}→${endDate}`,
      );
      return priceMap;
    }

    const ohlc = parseBitstampBody(await r.json());
    if (!ohlc) {
      console.error(
        `[fetchBtcPricesFromBitstampRange] invalid payload for ${startDate}→${endDate}`,
      );
      return priceMap;
    }

    for (const candle of ohlc) {
      const ts = parseInt(candle.timestamp, 10);
      if (!Number.isFinite(ts)) continue;
      const date = new Date(ts * 1000).toISOString().slice(0, 10);
      const closePrice = parseFloat(candle.close);
      if (Number.isFinite(closePrice) && closePrice > 0) {
        priceMap.set(date, closePrice);
      }
    }
  } catch (err) {
    console.error(`[fetchBtcPricesFromBitstampRange] threw for ${startDate}→${endDate}:`, err);
  }

  return priceMap;
}
