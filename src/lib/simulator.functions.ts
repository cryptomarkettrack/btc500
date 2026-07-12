import { createServerFn } from "@tanstack/react-start";
import { getBtcPriceFromCsv } from "./csv-price-loader";

// Known halving dates (approximate, based on block heights)
const HALVINGS: Array<{ date: string; block: number; label: string }> = [
  { date: "2012-11-28", block: 210000, label: "2012 Halving" },
  { date: "2016-07-09", block: 420000, label: "2016 Halving" },
  { date: "2020-05-11", block: 630000, label: "2020 Halving" },
  { date: "2024-04-20", block: 840000, label: "2024 Halving" },
];

export interface CycleResult {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number | null;
  sellPrice: number | null;
  returnMultiplier: number | null;
  returnPercent: number | null;
  profit: number | null;
}

export interface SimulatorResult {
  cycles: CycleResult[];
  totalInvestment: number;
  totalReturn: number;
  totalProfit: number | null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Convert a YYYY-MM-DD date string to Unix milliseconds (start of day UTC) */
function dateToMs(dateStr: string): number {
  return new Date(dateStr + "T00:00:00Z").getTime();
}

async function fetchBtcPriceOnDate(dateStr: string): Promise<number | null> {
  const logTag = `[fetchBtcPriceOnDate ${dateStr}]`;

  // First, try to get price from CSV for dates before 2016-07-12
  const csvPrice = await getBtcPriceFromCsv(dateStr);
  if (csvPrice !== null) {
    return csvPrice;
  }

  // If not in CSV or date is on/after 2016-07-12, use Bitstamp
  // Target date as start-of-day Unix seconds (Bitstamp timestamps are in seconds)
  const targetUnixSeconds = Math.floor(dateToMs(dateStr) / 1000);

  try {
    // Bitstamp OHLC returns daily candles. Use `start` and `end` to narrow
    // the window to ±1 day around the target, so we only get the relevant candle(s).
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

    // Find the candle whose timestamp falls within 1 day of the target date
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

export const getSimulatorData = createServerFn({ method: "GET" }).handler(async () => {
  const cycles: CycleResult[] = [];

  for (const halving of HALVINGS) {
    const buyDate = addDays(halving.date, -500);
    const sellDate = addDays(halving.date, 500);

    const [buyPrice, sellPrice] = await Promise.all([
      fetchBtcPriceOnDate(buyDate),
      fetchBtcPriceOnDate(sellDate),
    ]);

    cycles.push({
      label: halving.label,
      halvingDate: halving.date,
      buyDate,
      sellDate,
      buyPrice,
      sellPrice,
      returnMultiplier: buyPrice && sellPrice ? sellPrice / buyPrice : null,
      returnPercent: buyPrice && sellPrice ? ((sellPrice - buyPrice) / buyPrice) * 100 : null,
      profit: null, // computed client-side based on user input
    });
  }

  return { cycles };
});
