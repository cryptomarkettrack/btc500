import { createServerFn } from "@tanstack/react-start";

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

  // Sources are tried in order — the first to return a valid price wins.
  // Binance is tried first, then CoinGecko, then CoinPaprika.
  const sources: Array<{ name: string; fetch: () => Promise<number | null> }> = [
    {
      name: "Binance",
      fetch: async () => {
        const startTime = dateToMs(dateStr);
        const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=1`;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) {
          console.warn(`${logTag} Binance returned status ${r.status}`);
          return null;
        }
        const j = (await r.json()) as unknown[];
        if (!Array.isArray(j) || j.length === 0) {
          console.warn(`${logTag} Binance returned empty array`);
          return null;
        }
        const closePrice = parseFloat((j[0] as unknown[])[4] as string);
        const valid = Number.isFinite(closePrice) && closePrice > 0;
        if (!valid) console.warn(`${logTag} Binance returned invalid close price: ${closePrice}`);
        return valid ? closePrice : null;
      },
    },

    {
      name: "CoinGecko",
      fetch: async () => {
        // CoinGecko expects DD-MM-YYYY
        const d = new Date(dateStr + "T00:00:00Z");
        const parts = [
          String(d.getUTCDate()).padStart(2, "0"),
          String(d.getUTCMonth() + 1).padStart(2, "0"),
          d.getUTCFullYear(),
        ];
        const dateParam = parts.join("-");
        const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateParam}`;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) {
          console.warn(`${logTag} CoinGecko returned status ${r.status}`);
          return null;
        }
        const j = (await r.json()) as {
          market_data?: { current_price?: { usd?: number } };
        };
        const price = j?.market_data?.current_price?.usd ?? null;
        if (price === null)
          console.warn(`${logTag} CoinGecko response missing market_data.current_price.usd`);
        return price;
      },
    },

    {
      name: "CoinPaprika",
      fetch: async () => {
        // CoinPaprika expects YYYY-MM-DD
        const url = `https://api.coinpaprika.com/v1/tickers/btc-bitcoin/historical?start=${dateStr}&end=${dateStr}`;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) {
          console.warn(`${logTag} CoinPaprika returned status ${r.status}`);
          return null;
        }
        const j = (await r.json()) as Array<{ price?: number }>;
        if (!Array.isArray(j) || j.length === 0) {
          console.warn(`${logTag} CoinPaprika returned empty array`);
          return null;
        }
        const price = j[0]?.price;
        const valid = Number.isFinite(price) && price! > 0;
        if (!valid) console.warn(`${logTag} CoinPaprika returned invalid price: ${price}`);
        return valid ? price! : null;
      },
    },
  ];

  for (const { name, fetch: fn } of sources) {
    try {
      const price = await fn();
      if (price !== null) {
        console.log(`${logTag} ${name} → $${price}`);
        return price;
      }
      console.warn(`${logTag} ${name} returned null, trying next source…`);
    } catch (err) {
      console.error(`${logTag} ${name} threw:`, err);
    }
  }

  console.error(`${logTag} All sources exhausted — no price available`);
  return null;
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
