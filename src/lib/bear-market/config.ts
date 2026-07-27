/**
 * Bear market bottom indicator config, BitView API client, and scoring helpers.
 */

// === BitView API Helpers ===
const BITVIEW_API = "https://bitview.space/api/series";

/**
 * Fetch dates and data together, then find the last non-null value for "current"
 * and find the value closest to each bottom date.
 */
export async function fetchIndicatorData(
  apiName: string,
): Promise<{ current: number | null; bottoms: (number | null)[] }> {
  try {
    const [datesRes, dataRes] = await Promise.all([
      fetch(`${BITVIEW_API}/date/day1/data`),
      fetch(`${BITVIEW_API}/${apiName}/day1/data`),
    ]);
    if (!datesRes.ok || !dataRes.ok) {
      return { current: null, bottoms: BOTTOMS.map(() => null) };
    }
    const dates: string[] = await datesRes.json();
    const data: (number | null)[] = await dataRes.json();

    if (!Array.isArray(dates) || !Array.isArray(data) || dates.length !== data.length) {
      return { current: null, bottoms: BOTTOMS.map(() => null) };
    }

    // Find current: last non-null value from the end
    let current: number | null = null;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i] !== null && data[i] !== undefined && !Number.isNaN(data[i])) {
        current = data[i] as number;
        break;
      }
    }

    // Find values near each bottom date
    const bottoms = BOTTOMS.map((b) => {
      const targetTime = new Date(b.date).getTime();
      // Find closest date index
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < dates.length; i++) {
        const diff = Math.abs(new Date(dates[i]).getTime() - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      // If the closest is null, search nearby for nearest non-null
      if (
        data[closestIdx] !== null &&
        data[closestIdx] !== undefined &&
        !Number.isNaN(data[closestIdx])
      ) {
        return data[closestIdx] as number;
      }
      // Search outward from closestIdx for nearest non-null
      for (let offset = 1; offset < 60; offset++) {
        for (const dir of [-1, 1]) {
          const idx = closestIdx + offset * dir;
          if (idx >= 0 && idx < data.length) {
            if (data[idx] !== null && data[idx] !== undefined && !Number.isNaN(data[idx])) {
              return data[idx] as number;
            }
          }
        }
      }
      return null;
    });

    return { current, bottoms };
  } catch {
    return { current: null, bottoms: BOTTOMS.map(() => null) };
  }
}

// === BitView Chart Links ===
export const CHART_LINKS: Record<string, string> = {
  "MVRV Ratio": "https://bitview.space/charts/distribution/overview/capitalization/mvrv",
  NUPL: "https://bitview.space/charts/distribution/overview/profitability/unrealized/nupl",
  "STH-MVRV": "https://bitview.space/charts/distribution/sth-vs-lth/capitalization/mvrv",
  "LTH-MVRV": "https://bitview.space/charts/distribution/sth-vs-lth/capitalization/mvrv",
  "Puell Multiple":
    "https://bitview.space/charts/market/indicators/puell-multiple?r=4305.00_6668.00",
  "RHODL Ratio": "https://bitview.space/charts/market/indicators/rhodl-ratio",
  "Reserve Risk": "https://bitview.space/charts/frameworks/cointime/indicators/reserve-risk",
  SOPR: "https://bitview.space/charts/distribution/overview/activity/sopr/compare?i=1w&r=489.00_927.00",
  "STH-SOPR": "https://bitview.space/charts/distribution/sth-vs-lth/sopr/sth",
  "LTH-SOPR": "https://bitview.space/charts/distribution/sth-vs-lth/capitalization/mvrv",
  "Supply in Profit":
    "https://bitview.space/charts/distribution/utxo-profitability/in-profit/all/supply/total?i=1w&r=489.00_927.00",
  "LTH Supply": "https://bitview.space/charts/distribution/sth-vs-lth/supply/total",
  "Realized Loss": "https://bitview.space/charts/distribution/overview/capitalization/realized-cap",
  Liveliness: "https://bitview.space/charts/frameworks/cointime/activity",
  Vaultedness: "https://bitview.space/charts/frameworks/cointime/activity",
  "STH Greed": "https://bitview.space/charts/distribution/sth-vs-lth/nupl/sth",
  "LTH Greed": "https://bitview.space/charts/distribution/sth-vs-lth/nupl/lth",
  "STH-NUPL": "https://bitview.space/charts/distribution/sth-vs-lth/profitability/unrealized/nupl",
  "LTH-NUPL": "https://bitview.space/charts/distribution/sth-vs-lth/profitability/unrealized/nupl",
  "ATH Drawdown": "https://bitview.space/charts/market/all-time-high/drawdown",
};

// === Indicator Config ===
export interface IndicatorConfig {
  name: string;
  apiName: string;
  tier: 1 | 2 | 3;
  points: number;
  description: string;
  bottomValues: string;
  currentThreshold: string;
  bitviewLink?: string;
}

export const INDICATORS: IndicatorConfig[] = [
  {
    name: "MVRV Ratio",
    apiName: "mvrv",
    tier: 1,
    points: 3,
    description: "Market Cap / Realized Cap",
    bottomValues: "0.39-1.00",
    currentThreshold: "Must be < 1.0",
  },
  {
    name: "Puell Multiple",
    apiName: "puell_multiple",
    tier: 1,
    points: 3,
    description: "Daily mining revenue / 365d MA",
    bottomValues: "0.24-0.67",
    currentThreshold: "Must be < 0.5",
  },
  {
    name: "NUPL",
    apiName: "nupl_bps",
    tier: 1,
    points: 3,
    description: "Net Unrealized Profit/Loss",
    bottomValues: "-15895 to 24 (bps)",
    currentThreshold: "Must be negative",
  },
  {
    name: "STH-MVRV",
    apiName: "sth_mvrv",
    tier: 1,
    points: 3,
    description: "Short-term holder MVRV",
    bottomValues: "0.36-0.78",
    currentThreshold: "Must be < 1.0",
  },
  {
    name: "ATH Drawdown",
    apiName: "price_drawdown_bps",
    tier: 1,
    points: 3,
    description: "Drawdown from all-time high",
    bottomValues: "-77% to -86%",
    currentThreshold: "Must be < -70%",
  },
  {
    name: "RHODL Ratio",
    apiName: "rhodl_ratio_bps",
    tier: 2,
    points: 2,
    description: "Realized HODL wave metric",
    bottomValues: "612-99127",
    currentThreshold: "Historic low zone",
  },
  {
    name: "Reserve Risk",
    apiName: "reserve_risk",
    tier: 2,
    points: 2,
    description: "Price / HODL bank",
    bottomValues: "2.67e-6 to 6.89e-6",
    currentThreshold: "Multi-year lows",
  },
  {
    name: "SOPR",
    apiName: "sopr_24h",
    tier: 2,
    points: 2,
    description: "Spent Output Profit Ratio",
    bottomValues: "0.91-0.99",
    currentThreshold: "< 1 then recover",
  },
  {
    name: "LTH-MVRV",
    apiName: "lth_mvrv",
    tier: 2,
    points: 2,
    description: "Long-term holder MVRV",
    bottomValues: "0.40-1.18",
    currentThreshold: "Approaching 1.0",
  },
  {
    name: "Supply in Profit",
    apiName: "supply_in_profit",
    tier: 2,
    points: 2,
    description: "BTC supply currently in profit",
    bottomValues: "4.3M-8.8M BTC",
    currentThreshold: "Must be < 50% of supply",
  },
  {
    name: "STH-NUPL",
    apiName: "sth_nupl_bps",
    tier: 2,
    points: 2,
    description: "STH unrealized P/L",
    bottomValues: "-17998 to -4250",
    currentThreshold: "Deeply negative",
  },
  {
    name: "LTH-NUPL",
    apiName: "lth_nupl_bps",
    tier: 2,
    points: 2,
    description: "LTH unrealized P/L",
    bottomValues: "-15078 to 1491",
    currentThreshold: "Near zero",
  },
  {
    name: "LTH Supply",
    apiName: "lth_supply_sats",
    tier: 3,
    points: 1,
    description: "Long-term holder supply",
    bottomValues: "Rising at bottoms",
    currentThreshold: "Uptrend = buy",
  },
  {
    name: "Liveliness",
    apiName: "liveliness",
    tier: 3,
    points: 1,
    description: "Ratio of coin days destroyed vs created",
    bottomValues: "0.39-0.61",
    currentThreshold: "Falling = HODLing",
  },
  {
    name: "Vaultedness",
    apiName: "vaultedness",
    tier: 3,
    points: 1,
    description: "Coins vaulted / total",
    bottomValues: "0.39-0.61",
    currentThreshold: "Rising = accumulation",
  },
];

// === Historical Bottom Dates (approximate) ===
export const BOTTOMS = [
  { date: "2011-11-22", label: "2011" },
  { date: "2015-01-14", label: "2015" },
  { date: "2018-12-15", label: "2018" },
  { date: "2020-03-12", label: "COVID" },
  { date: "2022-11-21", label: "2022" },
];

function getValueNearDate(dates: string[], values: number[], targetDate: string): number | null {
  let closest = NaN;
  let minDiff = Infinity;
  for (let i = 0; i < dates.length; i++) {
    const diff = Math.abs(new Date(dates[i]).getTime() - new Date(targetDate).getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closest = values[i];
    }
  }
  return isNaN(closest) ? null : closest;
}

// === UI Components ===

export function formatValue(v: number | null, name: string): string {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (name.includes("bps") || name.includes("nupl") || name.includes("NUPL")) {
    return (v / 100).toFixed(2) + "%";
  }
  if (name === "lth_supply_sats") {
    return (v / 1e12).toFixed(1) + "T sats";
  }
  if (name === "supply_in_profit") {
    return (v / 1e6).toFixed(1) + "M BTC";
  }
  if (name.includes("Reserve Risk") || name.includes("reserve_risk")) {
    return v.toExponential(2);
  }
  if (Math.abs(v) < 0.01 || Math.abs(v) > 10000) {
    return v.toExponential(2);
  }
  return v.toFixed(2);
}

export function formatValueBps(v: number | null): string {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return (v / 100).toFixed(2) + "%";
}

export function getStatusColor(
  name: string,
  value: number | null,
): "destructive" | "default" | "secondary" | "outline" {
  if (value === null || isNaN(value)) return "secondary";
  const n = name.toLowerCase();
  if (n === "mvrv" || n === "sth-mvrv" || n === "lth-mvrv") {
    return value < 1.0 ? "destructive" : value < 1.2 ? "outline" : "default";
  }
  if (n === "puell multiple") {
    return value < 0.5 ? "destructive" : value < 1.0 ? "outline" : "default";
  }
  if (n.includes("nupl")) {
    return value < 0 ? "destructive" : value < 500 ? "outline" : "default";
  }
  if (n === "sopr" || n.includes("sopr")) {
    return value < 1.0 ? "destructive" : "default";
  }
  if (n === "rhodl ratio") {
    return value < 2000 ? "destructive" : "default";
  }
  if (n.includes("ath drawdown") || n.includes("price_drawdown")) {
    return value < -7000 ? "destructive" : value < -5000 ? "outline" : "default";
  }
  if (n === "supply in profit") {
    return value < 5e6 ? "destructive" : value < 10e6 ? "outline" : "default";
  }
  return "secondary";
}

export function getStatusText(name: string, value: number | null): string {
  if (value === null || isNaN(value)) return "No Data";
  const n = name.toLowerCase();
  if (n === "mvrv" || n === "sth-mvrv" || n === "lth-mvrv") {
    return value < 1.0 ? "✅ Bottom Zone" : value < 1.2 ? "⚠️ Caution" : "❌ Not Bottom";
  }
  if (n === "puell multiple") {
    return value < 0.5 ? "✅ Miner Capitulation" : value < 1.0 ? "⚠️ Low" : "❌ Not Bottom";
  }
  if (n.includes("nupl")) {
    return value < 0 ? "✅ Capitulation" : value < 500 ? "⚠️ Low" : "❌ Not Bottom";
  }
  if (n === "sopr" || n.includes("sopr")) {
    return value < 1.0 ? "✅ Loss Realization" : "❌ Not Bottom";
  }
  if (n === "rhodl ratio") {
    return value < 2000 ? "✅ Extreme Low" : "❌ Not Bottom";
  }
  if (n === "reserve risk") {
    return value < 5e-6 ? "✅ Historical Low" : "❌ Not Bottom";
  }
  if (n.includes("liveliness")) {
    return value < 0.55 ? "✅ HODLing" : "❌ Not Bottom";
  }
  if (n.includes("vaultedness")) {
    return value > 0.45 ? "✅ Accumulation" : "❌ Not Bottom";
  }
  if (n.includes("ath drawdown") || n.includes("price_drawdown")) {
    return value < -7000 ? "✅ Deep Drawdown" : value < -5000 ? "⚠️ Moderate" : "❌ Not Bottom";
  }
  if (n === "supply in profit") {
    return value < 5e6 ? "✅ Extreme Fear" : value < 10e6 ? "⚠️ Low" : "❌ Not Bottom";
  }
  return "📊 Monitor";
}

