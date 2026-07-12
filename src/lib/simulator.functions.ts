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
  // Sources are tried in order — the first to return a valid price wins.
  // Binance is tried first, then CoinGecko, then CoinPaprika.
  const sources: Array<() => Promise<number | null>> = [
    // ── Source 1: Binance klines ──
    async () => {
      const startTime = dateToMs(dateStr);
      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=1`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) return null;
      const j = (await r.json()) as unknown[];
      if (!Array.isArray(j) || j.length === 0) return null;
      const closePrice = parseFloat((j[0] as unknown[])[4] as string);
      return Number.isFinite(closePrice) && closePrice > 0 ? closePrice : null;
    },

    // ── Source 2: CoinGecko history endpoint ──
    async () => {
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
      if (!r.ok) return null;
      const j = (await r.json()) as {
        market_data?: { current_price?: { usd?: number } };
      };
      return j?.market_data?.current_price?.usd ?? null;
    },

    // ── Source 3: CoinPaprika historical ticker ──
    async () => {
      // CoinPaprika expects YYYY-MM-DD
      const url = `https://api.coinpaprika.com/v1/tickers/btc-bitcoin/historical?start=${dateStr}&end=${dateStr}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) return null;
      const j = (await r.json()) as Array<{ price?: number }>;
      if (!Array.isArray(j) || j.length === 0) return null;
      const price = j[0]?.price;
      return Number.isFinite(price) && price! > 0 ? price! : null;
    },
  ];

  for (const src of sources) {
    try {
      const price = await src();
      if (price !== null) return price;
    } catch {
      // continue to next source
    }
  }
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
