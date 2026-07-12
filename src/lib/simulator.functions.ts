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
  // Binance klines API — get the daily candle for the given date
  const startTime = dateToMs(dateStr);
  const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=1`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const j = (await r.json()) as Array<
      [
        number,
        string,
        string,
        string,
        string,
        string,
        number,
        string,
        number,
        string,
        string,
        string,
      ]
    >;
    if (!Array.isArray(j) || j.length === 0) return null;
    // Index 4 is the close price
    const closePrice = parseFloat(j[0][4]);
    return Number.isFinite(closePrice) && closePrice > 0 ? closePrice : null;
  } catch {
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
