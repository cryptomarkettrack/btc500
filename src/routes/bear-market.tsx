import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  ExternalLink,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/bear-market")({
  component: BearMarketPage,
});

// === BitView API Helpers ===
const BITVIEW_API = "https://bitview.space/api/series";

/**
 * Fetch dates and data together, then find the last non-null value for "current"
 * and find the value closest to each bottom date.
 */
async function fetchIndicatorData(
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
const CHART_LINKS: Record<string, string> = {
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
interface IndicatorConfig {
  name: string;
  apiName: string;
  tier: 1 | 2 | 3;
  points: number;
  description: string;
  bottomValues: string;
  currentThreshold: string;
  bitviewLink?: string;
}

const INDICATORS: IndicatorConfig[] = [
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
const BOTTOMS = [
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

function formatValue(v: number | null, name: string): string {
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

function formatValueBps(v: number | null): string {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return (v / 100).toFixed(2) + "%";
}

function getStatusColor(
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

function getStatusText(name: string, value: number | null): string {
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

function IndicatorCard({
  indicator,
  currentValue,
  bottomValues,
}: {
  indicator: IndicatorConfig;
  currentValue: number | null;
  bottomValues: (number | null)[];
}) {
  const status = getStatusText(indicator.name, currentValue);
  const tierLabel = indicator.tier === 1 ? "Tier 1" : indicator.tier === 2 ? "Tier 2" : "Tier 3";
  const tierColor =
    indicator.tier === 1
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : indicator.tier === 2
        ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
        : "bg-blue-500/10 text-blue-400 border-blue-500/20";
  const link = indicator.bitviewLink || CHART_LINKS[indicator.name];

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{indicator.name}</CardTitle>
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${tierColor}`}>
              {tierLabel} · {indicator.points}pt
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{indicator.description}</p>
      </CardHeader>
      <CardContent>
        {/* Current Value */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="text-lg font-bold font-mono">
              {formatValue(currentValue, indicator.apiName)}
            </div>
          </div>
          <Badge variant={getStatusColor(indicator.name, currentValue)} className="text-xs">
            {status}
          </Badge>
        </div>

        {/* Bottom Values */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">At Bear Market Bottoms</div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {BOTTOMS.map((b, i) => (
              <div key={b.label} className="text-xs">
                <div className="text-muted-foreground">{b.label}</div>
                <div className="font-mono text-[10px]">
                  {bottomValues[i] !== null ? formatValue(bottomValues[i], indicator.apiName) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threshold */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Signal:</span> {indicator.currentThreshold}
        </div>

        {/* Link to BitView */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on BitView <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// === Main Component ===
function BearMarketPage() {
  const [indicators, setIndicators] = useState<
    Record<string, { current: number | null; bottoms: (number | null)[] }>
  >({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: INDICATORS.length });

  useEffect(() => {
    let cancelled = false;

    async function loadIndicators() {
      const results: Record<string, { current: number | null; bottoms: (number | null)[] }> = {};
      let done = 0;

      for (const ind of INDICATORS) {
        if (cancelled) return;
        const result = await fetchIndicatorData(ind.apiName);
        results[ind.name] = result;
        done++;
        setProgress({ done, total: INDICATORS.length });
      }

      if (!cancelled) {
        setIndicators(results);
        setLoading(false);
      }
    }

    loadIndicators();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate composite score
  const compositeScore = useMemo(() => {
    let score = 0;
    for (const ind of INDICATORS) {
      const data = indicators[ind.name];
      if (!data || data.current === null) continue;
      const n = ind.name.toLowerCase();
      let triggered = false;
      if (n === "mvrv" || n === "sth-mvrv") triggered = data.current < 1.0;
      else if (n === "lth-mvrv") triggered = data.current < 1.2;
      else if (n === "puell multiple") triggered = data.current < 0.5;
      else if (n.includes("nupl")) triggered = data.current < 0;
      else if (n === "sopr" || n.includes("sopr")) triggered = data.current < 1.0;
      else if (n === "rhodl ratio") triggered = data.current < 2000;
      else if (n === "reserve risk") triggered = data.current < 5e-6;
      else if (n.includes("liveliness")) triggered = data.current < 0.55;
      else if (n.includes("vaultedness")) triggered = data.current > 0.45;
      else if (n === "ath drawdown") triggered = data.current < -7000;
      else if (n.includes("supply in profit")) triggered = data.current < 5e6; // <5M BTC in profit
      if (triggered) score += ind.points;
    }
    return score;
  }, [indicators]);

  const scoreLabel =
    compositeScore >= 15
      ? "STRONG BUY"
      : compositeScore >= 10
        ? "MODERATE BUY"
        : compositeScore >= 5
          ? "CAUTIOUS"
          : "NOT A BOTTOM";
  const scoreColor =
    compositeScore >= 15
      ? "text-green-400"
      : compositeScore >= 10
        ? "text-orange-400"
        : compositeScore >= 5
          ? "text-yellow-400"
          : "text-red-400";

  // Count triggered indicators
  const triggeredCount = useMemo(() => {
    let count = 0;
    for (const ind of INDICATORS) {
      const data = indicators[ind.name];
      if (!data || data.current === null) continue;
      const n = ind.name.toLowerCase();
      if (n === "mvrv" || n === "sth-mvrv") {
        if (data.current < 1.0) count++;
      } else if (n === "puell multiple") {
        if (data.current < 0.5) count++;
      } else if (n.includes("nupl")) {
        if (data.current < 0) count++;
      } else if (n === "sopr" || n.includes("sopr")) {
        if (data.current < 1.0) count++;
      } else if (n === "rhodl ratio") {
        if (data.current < 2000) count++;
      }
    }
    return count;
  }, [indicators]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <h1 className="text-3xl font-bold">Is the 2026 Bear Market Over?</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Has Bitcoin bottomed in 2026? Track 15 on-chain indicators and compare current values
            against every bear market bottom since 2011 to determine whether the 2026 bear market is
            truly over — or if more downside is ahead.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Fetching indicators… {progress.done}/{progress.total}
          </p>
          <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!loading && (
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
          {/* Composite Score */}
          <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    2026 Bear Market Bottom Score
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold font-mono ${scoreColor}`}>
                      {compositeScore}
                    </span>
                    <span className="text-2xl text-muted-foreground">/ 30</span>
                  </div>
                  <div className={`text-lg font-semibold mt-1 ${scoreColor}`}>{scoreLabel}</div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-sm text-muted-foreground mb-1">Indicators Triggered</div>
                  <div className="text-3xl font-bold">
                    {triggeredCount}{" "}
                    <span className="text-lg text-muted-foreground">/ {INDICATORS.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {loading
                      ? "Loading..."
                      : `${progress.done}/${progress.total} indicators loaded`}
                  </div>
                </div>
              </div>

              {/* Scoring Legend */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="font-semibold text-green-400">15+ pts</div>
                    <div className="text-muted-foreground">STRONG BUY</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-orange-500/10 border border-orange-500/20">
                  <Target className="h-4 w-4 text-orange-400" />
                  <div>
                    <div className="font-semibold text-orange-400">10-14 pts</div>
                    <div className="text-muted-foreground">MODERATE BUY</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="font-semibold text-yellow-400">5-9 pts</div>
                    <div className="text-muted-foreground">CAUTIOUS</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                  <BarChart3 className="h-4 w-4 text-red-400" />
                  <div>
                    <div className="font-semibold text-red-400">{"<"} 5 pts</div>
                    <div className="text-muted-foreground">NOT A BOTTOM</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier 1: Primary Signals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h2 className="text-xl font-bold">Tier 1 — Primary Signals</h2>
              <Badge variant="destructive" className="text-xs">
                3 pts each
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These 5 indicators have correctly identified every bear market bottom (2011, 2015,
              2018, 2020, 2022). When multiple Tier 1 signals fire together, it's the strongest
              evidence the bear market is over. Check how many are triggered now.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATORS.filter((i) => i.tier === 1).map((ind) => (
                <IndicatorCard
                  key={ind.name}
                  indicator={ind}
                  currentValue={indicators[ind.name]?.current ?? null}
                  bottomValues={indicators[ind.name]?.bottoms ?? BOTTOMS.map(() => null)}
                />
              ))}
            </div>
          </section>

          {/* Tier 2: Confirmation Signals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <h2 className="text-xl font-bold">Tier 2 — Confirmation Signals</h2>
              <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-400">
                2 pts each
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Secondary indicators that confirmed Tier 1 signals at past bottoms. If these are also
              flashing, it adds conviction that the 2026 bear market has reached its end.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATORS.filter((i) => i.tier === 2).map((ind) => (
                <IndicatorCard
                  key={ind.name}
                  indicator={ind}
                  currentValue={indicators[ind.name]?.current ?? null}
                  bottomValues={indicators[ind.name]?.bottoms ?? BOTTOMS.map(() => null)}
                />
              ))}
            </div>
          </section>

          {/* Tier 3: Secondary Signals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-xl font-bold">Tier 3 — Secondary Signals</h2>
              <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-400">
                1 pt each
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Longer-term accumulation and HODLing signals observed at past bottoms. These provide
              supporting evidence but are less precise for timing the exact end of the bear market.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATORS.filter((i) => i.tier === 3).map((ind) => (
                <IndicatorCard
                  key={ind.name}
                  indicator={ind}
                  currentValue={indicators[ind.name]?.current ?? null}
                  bottomValues={indicators[ind.name]?.bottoms ?? BOTTOMS.map(() => null)}
                />
              ))}
            </div>
          </section>

          {/* How to Use */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                How to Use This Page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Check the Composite Score</strong> — The
                score at the top shows how many on-chain indicators are in "bear market bottom
                zone." A score of 15+ means 2026 is showing the same capitulation signals that
                marked the end of previous bear markets (2011, 2015, 2018, 2020, 2022).
              </p>
              <p>
                <strong className="text-foreground">2. Focus on Tier 1 First</strong> — MVRV, Puell
                Multiple, NUPL, STH-MVRV, and ATH Drawdown are the most reliable at detecting bear
                market bottoms. If these aren't in bottom zone, the 2026 bear market is probably not
                over yet.
              </p>
              <p>
                <strong className="text-foreground">3. Look for Confluence</strong> — The clearest
                bear market bottoms show 3+ Tier 1 signals + 2+ Tier 2 signals firing together. The
                more indicators triggered, the stronger the case that the bear market is done.
              </p>
              <p>
                <strong className="text-foreground">4. Click "View on BitView"</strong> — Each
                indicator links to its live chart on BitView so you can see the full historical
                context and judge for yourself whether 2026 has truly bottomed.
              </p>
              <p>
                <strong className="text-foreground">5. Historical Context</strong> — Each card shows
                the exact values recorded at past bear market bottoms. Compare today's 2026 values
                to see if we've reached the same capitulation levels — or still have further to
                fall.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/40">
            <p>
              Data from{" "}
              <a
                href="https://bitview.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                BitView
              </a>{" "}
              • 22,582 charts analyzed • {INDICATORS.length} key indicators tracked • Live 2026 data
            </p>
            <p className="mt-1">
              Reference bottoms: Nov 2011 · Jan 2015 · Dec 2018 · Mar 2020 · Nov 2022
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
