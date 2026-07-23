/** Convert a YYYY-MM-DD date string to Unix milliseconds (start of day UTC) */
function dateToMs(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getTime();
}

/**
 * Fetch a single historical BTC price from Bitstamp for a given date.
 * This is extracted into its own module so it can be shared between
 * the simulator and DCA comparison features.
 */
export async function fetchBtcPriceFromBitstamp(dateStr: string): Promise<number | null> {
  const logTag = `[fetchBtcPriceFromBitstamp ${dateStr}]`;
  const targetUnixSeconds = Math.floor(dateToMs(dateStr) / 1000);

  try {
    const start = targetUnixSeconds - 86400;
    const end = targetUnixSeconds + 86400;
    const url = `https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1000&start=${start}&end=${end}`;

    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) {
      console.error(`${logTag} Bitstamp returned status ${r.status}`);
      return null;
    }

    const j = (await r.json()) as {
      data?: {
        pair?: string;
        ohlc?: Array<{
          timestamp: string;
          open: string;
          high: string;
          low: string;
          close: string;
          volume: string;
        }>;
      };
    };

    const ohlc = j?.data?.ohlc;
    if (!Array.isArray(ohlc) || ohlc.length === 0) {
      console.error(`${logTag} Bitstamp returned no OHLC data`);
      return null;
    }

    const TOLERANCE_S = 86400;
    const candle = ohlc.find((c) => {
      const ts = parseInt(c.timestamp, 10);
      return Math.abs(ts - targetUnixSeconds) < TOLERANCE_S;
    });

    if (!candle) {
      console.error(`${logTag} Bitstamp: no candle found within 1 day of target date`);
      return null;
    }

    const closePrice = parseFloat(candle.close);
    const valid = Number.isFinite(closePrice) && closePrice > 0;

    if (!valid) {
      console.error(
        `${logTag} Bitstamp returned invalid close price: ${closePrice} (timestamp: ${candle.timestamp})`,
      );
      return null;
    }

    console.log(`${logTag} Bitstamp → $${closePrice} (timestamp: ${candle.timestamp})`);
    return closePrice;
  } catch (err) {
    console.error(`${logTag} Bitstamp threw:`, err);
    return null;
  }
}
