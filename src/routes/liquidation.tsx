import { createFileRoute } from "@tanstack/react-router";
import { getLiquidationData, type LiquidationData } from "@/lib/liquidation";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
} from "recharts";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Flame,
  Zap,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/liquidation")({
  component: LiquidationPage,
  loader: async (): Promise<LiquidationData | null> => {
    try {
      return await getLiquidationData();
    } catch {
      return null;
    }
  },
  head: () => ({
    meta: [
      {
        title: "BTC Liquidation Dashboard — OI, Funding & Long/Short | BTC500",
      },
      {
        name: "description",
        content:
          "Real-time Bitcoin futures liquidation data: open interest, funding rates, long/short ratios, and taker buy/sell volume from Binance.",
      },
    ],
  }),
});

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatPrice(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatOIBtc(v: number): string {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatOIMillions(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function formatBps(v: number): string {
  return `${(v * 10000).toFixed(1)} bps`;
}

type TimeRange = "7d" | "30d" | "all";

function getRangeIndex(dataLength: number, range: TimeRange): number {
  if (range === "all") return 0;
  if (range === "7d") return Math.max(0, dataLength - 7 * 6); // ~7 4h candles per day × 6 (actually 6 per day, 7d = 42)
  if (range === "30d") return Math.max(0, dataLength - 30 * 6); // 30 days × 6 candles/day
  return 0;
}

function LiquidationPage() {
  const serverData = Route.useLoaderData();
  const [data, setData] = useState<LiquidationData | null>(serverData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const refetch = async () => {
    setIsLoading(true);
    try {
      const result = await getLiquidationData();
      setData(result);
    } catch {
      // keep stale data
    } finally {
      setIsLoading(false);
    }
  };

  // Sliced data based on time range
  const sliced = useMemo(() => {
    if (!data) return null;
    const kLen = data.klines.length;
    const idx = getRangeIndex(kLen, timeRange);
    return {
      klines: data.klines.slice(idx),
      openInterestHistory: data.openInterestHistory.slice(
        Math.max(0, Math.floor(idx * (data.openInterestHistory.length / kLen))),
      ),
      longShortRatios: data.longShortRatios.slice(
        Math.max(0, Math.floor(idx * (data.longShortRatios.length / kLen))),
      ),
      topTraderRatios: data.topTraderRatios.slice(
        Math.max(0, Math.floor(idx * (data.topTraderRatios.length / kLen))),
      ),
      fundingRates: data.fundingRates.slice(
        Math.max(0, Math.floor(idx * (data.fundingRates.length / kLen))),
      ),
      takerRatios: data.takerRatios.slice(
        Math.max(0, Math.floor(idx * (data.takerRatios.length / kLen))),
      ),
    };
  }, [data, timeRange]);

  // Merge price + OI for combined chart
  const priceOIMerged = useMemo(() => {
    if (!sliced) return [];
    return sliced.klines.map((k) => {
      // Find matching OI by closest timestamp
      const match = sliced.openInterestHistory.find(
        (oi) => Math.abs(oi.timestamp - k.timestamp) < 4 * 60 * 60 * 1000,
      );
      return {
        time: formatTimestamp(k.timestamp),
        price: k.close,
        oi: match?.oi ?? null,
        oiValue: match?.oiValue ?? null,
        volume: k.volume,
      };
    });
  }, [sliced]);

  // Long/Short merged chart
  const lsChartData = useMemo(() => {
    if (!sliced) return [];
    return sliced.longShortRatios.map((r, i) => {
      const top = sliced.topTraderRatios[i];
      return {
        time: formatTimestamp(r.timestamp),
        longRatio: r.longRatio,
        shortRatio: r.shortRatio,
        ratio: r.ratio,
        topLongRatio: top?.longRatio ?? 0,
        topShortRatio: top?.shortRatio ?? 0,
      };
    });
  }, [sliced]);

  // Funding rate chart
  const fundingChartData = useMemo(() => {
    if (!sliced) return [];
    return sliced.fundingRates.map((f) => ({
      time: formatTimestamp(f.timestamp),
      rate: f.rate * 100, // convert to percentage
      markPrice: f.markPrice,
    }));
  }, [sliced]);

  // Taker buy/sell chart
  const takerChartData = useMemo(() => {
    if (!sliced) return [];
    return sliced.takerRatios.map((t) => ({
      time: formatTimestamp(t.timestamp),
      buyRatio: t.buyRatio,
      buyVolume: t.buyVolume,
      sellVolume: t.sellVolume,
    }));
  }, [sliced]);

  // Current stats
  const latestPrice = data?.klines[data.klines.length - 1]?.close ?? 0;
  const currentOI = data?.currentOI.oi ?? 0;
  const latestFunding = data?.fundingRates[data.fundingRates.length - 1]?.rate ?? 0;
  const latestLS = data?.longShortRatios[data.longShortRatios.length - 1];
  const prevLS = data?.longShortRatios[data.longShortRatios.length - 2];
  const lsDirection = latestLS && prevLS ? latestLS.ratio - prevLS.ratio : 0;

  // --- Market situation analysis ---
  const marketSituation = useMemo(() => {
    if (!data || data.klines.length < 12) return null;

    const klines = data.klines;
    const recent = klines.slice(-12); // last 48h (12 × 4h candles)
    const prior = klines.slice(-24, -12); // 48h before that

    // Price trend: compare last close to close 48h ago
    const priceNow = recent[recent.length - 1].close;
    const price48hAgo = recent[0]?.close ?? priceNow;
    const pricePctChange = ((priceNow - price48hAgo) / price48hAgo) * 100;
    const priceDirection: "up" | "down" | "flat" =
      pricePctChange > 1 ? "up" : pricePctChange < -1 ? "down" : "flat";

    // OI trend: compare latest OI to OI 48h ago
    const oiNow = data.currentOI.oi;
    const oldOIMatch = data.openInterestHistory.find(
      (oi) => Math.abs(oi.timestamp - recent[0]?.timestamp) < 6 * 60 * 60 * 1000,
    );
    const oiThen = oldOIMatch?.oi ?? oiNow;
    const oiPctChange = oiThen > 0 ? ((oiNow - oiThen) / oiThen) * 100 : 0;
    const oiDirection: "rising" | "falling" | "flat" =
      oiPctChange > 1 ? "rising" : oiPctChange < -1 ? "falling" : "flat";

    // Funding rate assessment
    const fundingPct = latestFunding * 100;
    const fundingLevel:
      "extreme_positive" | "positive" | "neutral" | "negative" | "extreme_negative" =
      fundingPct > 0.03
        ? "extreme_positive"
        : fundingPct > 0.005
          ? "positive"
          : fundingPct > -0.005
            ? "neutral"
            : fundingPct > -0.03
              ? "negative"
              : "extreme_negative";

    // L/S ratio assessment
    const lsRatio = latestLS?.ratio ?? 1;
    const crowdSide: "long_heavy" | "balanced" | "short_heavy" =
      lsRatio > 1.2 ? "long_heavy" : lsRatio < 0.8 ? "short_heavy" : "balanced";

    // Taker volume: recent buy vs sell
    const recentTakers = data.takerRatios.slice(-6); // last 24h
    const avgBuyRatio =
      recentTakers.length > 0
        ? recentTakers.reduce((s, t) => s + t.buyRatio, 0) / recentTakers.length
        : 0.5;
    const takerBias: "buyers" | "sellers" | "neutral" =
      avgBuyRatio > 0.53 ? "buyers" : avgBuyRatio < 0.47 ? "sellers" : "neutral";

    // Generate signals array
    const signals: { label: string; bullish: boolean | null; detail: string }[] = [];

    // Price + OI signal
    if (priceDirection === "up" && oiDirection === "rising") {
      signals.push({
        label: "Price + OI",
        bullish: true,
        detail: `Price ${pricePctChange >= 0 ? "+" : ""}${pricePctChange.toFixed(1)}% & OI ${oiPctChange >= 0 ? "+" : ""}${oiPctChange.toFixed(1)}% — new money entering longs, bullish trend.`,
      });
    } else if (priceDirection === "up" && oiDirection === "falling") {
      signals.push({
        label: "Price + OI",
        bullish: null,
        detail: `Price +${pricePctChange.toFixed(1)}% but OI ${oiPctChange.toFixed(1)}% — rally losing conviction, shorts closing.`,
      });
    } else if (priceDirection === "down" && oiDirection === "rising") {
      signals.push({
        label: "Price + OI",
        bullish: false,
        detail: `Price ${pricePctChange.toFixed(1)}% & OI +${oiPctChange.toFixed(1)}% — new shorts opening, bearish pressure.`,
      });
    } else if (priceDirection === "down" && oiDirection === "falling") {
      signals.push({
        label: "Price + OI",
        bullish: null,
        detail: `Price ${pricePctChange.toFixed(1)}% & OI ${oiPctChange.toFixed(1)}% — longs capitulating, potential bottom forming.`,
      });
    } else {
      signals.push({
        label: "Price + OI",
        bullish: null,
        detail: "Price and OI relatively flat — no clear directional signal.",
      });
    }

    // Funding signal
    if (fundingLevel === "extreme_positive") {
      signals.push({
        label: "Funding",
        bullish: false,
        detail: `Funding at ${fundingPct.toFixed(4)}% — extremely overheated, longs at risk of correction.`,
      });
    } else if (fundingLevel === "positive") {
      signals.push({
        label: "Funding",
        bullish: true,
        detail: `Funding at ${fundingPct.toFixed(4)}% — mildly bullish, longs paying a reasonable premium.`,
      });
    } else if (fundingLevel === "negative") {
      signals.push({
        label: "Funding",
        bullish: true,
        detail: `Funding at ${fundingPct.toFixed(4)}% — shorts paying longs, contrarian bullish.`,
      });
    } else if (fundingLevel === "extreme_negative") {
      signals.push({
        label: "Funding",
        bullish: true,
        detail: `Funding at ${fundingPct.toFixed(4)}% — extremely fearful, shorts vulnerable to squeeze.`,
      });
    } else {
      signals.push({
        label: "Funding",
        bullish: null,
        detail: "Funding near neutral — balanced market, no leverage imbalance.",
      });
    }

    // L/S signal
    if (crowdSide === "long_heavy") {
      signals.push({
        label: "Crowd Positioning",
        bullish: false,
        detail: `L/S ratio at ${lsRatio.toFixed(2)} — crowd is heavily long, contrarian downside risk.`,
      });
    } else if (crowdSide === "short_heavy") {
      signals.push({
        label: "Crowd Positioning",
        bullish: true,
        detail: `L/S ratio at ${lsRatio.toFixed(2)} — crowd is heavily short, contrarian upside potential.`,
      });
    } else {
      signals.push({
        label: "Crowd Positioning",
        bullish: null,
        detail: `L/S ratio at ${lsRatio.toFixed(2)} — crowd is balanced.`,
      });
    }

    // Taker signal
    if (takerBias === "buyers") {
      signals.push({
        label: "Taker Volume",
        bullish: true,
        detail: `Buy ratio avg ${(avgBuyRatio * 100).toFixed(1)}% — aggressive buyers dominating, real demand.`,
      });
    } else if (takerBias === "sellers") {
      signals.push({
        label: "Taker Volume",
        bullish: false,
        detail: `Buy ratio avg ${(avgBuyRatio * 100).toFixed(1)}% — aggressive sellers dominating, real sell pressure.`,
      });
    } else {
      signals.push({
        label: "Taker Volume",
        bullish: null,
        detail: "Buy ratio balanced — no clear taker dominance.",
      });
    }

    // Overall verdict
    const bullishCount = signals.filter((s) => s.bullish === true).length;
    const bearishCount = signals.filter((s) => s.bullish === false).length;

    let verdict: string;
    let verdictColor: string;
    if (bullishCount >= 3) {
      verdict =
        "MARKET SITUATION: BULLISH — Most indicators favor upside. Leaning long could be favorable, but watch for overleveraged crowding.";
      verdictColor = "green";
    } else if (bearishCount >= 3) {
      verdict =
        "MARKET SITUATION: BEARISH — Most indicators favor downside. Caution for longs, consider reducing exposure.";
      verdictColor = "red";
    } else if (bullishCount > bearishCount) {
      verdict =
        "MARKET SITUATION: CAUTIOUSLY BULLISH — Mixed signals leaning positive. Mild long bias with tight stops is reasonable.";
      verdictColor = "blue";
    } else if (bearishCount > bullishCount) {
      verdict =
        "MARKET SITUATION: CAUTIOUSLY BEARISH — Mixed signals leaning negative. Defensive positioning preferred, avoid overleveraging.";
      verdictColor = "orange";
    } else {
      verdict =
        "MARKET SITUATION: NEUTRAL — Indicators are split. No strong edge either way. Wait for clearer confirmation before big moves.";
      verdictColor = "muted";
    }

    return { signals, verdict, verdictColor };
  }, [data, latestPrice, latestFunding, latestLS]);

  // Identify potential liquidation zones from high-volume price levels
  const liqZones = useMemo(() => {
    if (!data?.klines) return [];
    // Group klines by price levels and sum volume
    const buckets: Record<string, number> = {};
    const bucketSize = 100; // $100 price buckets
    for (const k of data.klines) {
      // Mid price of candle
      const mid = Math.round((k.high + k.low) / 2 / bucketSize) * bucketSize;
      const key = String(mid);
      buckets[key] = (buckets[key] || 0) + k.volume;
    }
    // Sort by volume and take top zones
    return Object.entries(buckets)
      .map(([price, volume]) => ({ price: Number(price), volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 15);
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Liquidation Dashboard</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground animate-pulse">
              Loading BTC liquidation data from Binance Futures...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fetchTime = formatDistanceToNow(new Date(data.fetchDate), { addSuffix: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-7 w-7 text-orange-500" />
            <h1 className="text-3xl font-bold tracking-tight">Liquidation Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            BTC perpetual futures — open interest, funding rates, long/short ratios & taker volume.
            Source:{" "}
            <span
              className={`font-semibold ${
                data.source.includes("OKX") ? "text-orange-400" : "text-green-400"
              }`}
            >
              {data.source}
            </span>
            . Updated {fetchTime}.
          </p>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            Refresh now
          </button>
        </div>

        {/* Time range selector */}
        <div className="mb-6 flex gap-2">
          {(["7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                timeRange === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {r === "all" ? "All" : r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Price</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(latestPrice)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Open Interest
            </p>
            <p className="text-2xl font-bold mt-1">{formatOIBtc(currentOI)}</p>
            <p className="text-xs text-muted-foreground mt-1">BTC</p>
          </div>
          <div
            className={`rounded-xl border bg-card p-4 ${
              latestFunding >= 0
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Funding Rate</p>
            <p
              className={`text-2xl font-bold mt-1 ${latestFunding >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {formatPercent(latestFunding)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">8h rate</p>
          </div>
          <div
            className={`rounded-xl border bg-card p-4 ${
              lsDirection >= 0
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-orange-500/30 bg-orange-500/5"
            }`}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              Long / Short
            </p>
            <p className="text-2xl font-bold mt-1">{latestLS ? latestLS.ratio.toFixed(3) : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {lsDirection >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              {lsDirection >= 0 ? "Longs growing" : "Shorts growing"}
            </p>
          </div>
        </div>

        {/* Market Situation Summary */}
        {marketSituation && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Market Situation — What's Happening Now</h2>
            </div>

            {/* Verdict banner */}
            <div
              className={`mb-5 rounded-lg p-4 ${
                marketSituation.verdictColor === "green"
                  ? "bg-green-500/10 border border-green-500/30"
                  : marketSituation.verdictColor === "red"
                    ? "bg-red-500/10 border border-red-500/30"
                    : marketSituation.verdictColor === "blue"
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : marketSituation.verdictColor === "orange"
                        ? "bg-orange-500/10 border border-orange-500/30"
                        : "bg-muted border border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {marketSituation.verdictColor === "green" && (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                )}
                {marketSituation.verdictColor === "red" && (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                {marketSituation.verdictColor === "blue" && (
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                )}
                {marketSituation.verdictColor === "orange" && (
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                )}
                {marketSituation.verdictColor === "muted" && (
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                )}
                <p
                  className={`text-sm font-bold ${
                    marketSituation.verdictColor === "green"
                      ? "text-green-400"
                      : marketSituation.verdictColor === "red"
                        ? "text-red-400"
                        : marketSituation.verdictColor === "blue"
                          ? "text-blue-400"
                          : marketSituation.verdictColor === "orange"
                            ? "text-orange-400"
                            : "text-muted-foreground"
                  }`}
                >
                  {marketSituation.verdict.split(" — ")[0]}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {marketSituation.verdict.split(" — ")[1]}
              </p>
            </div>

            {/* Signal breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {marketSituation.signals.map((signal) => (
                <div
                  key={signal.label}
                  className={`rounded-lg p-3 text-xs ${
                    signal.bullish === true
                      ? "bg-green-500/5 border border-green-500/20"
                      : signal.bullish === false
                        ? "bg-red-500/5 border border-red-500/20"
                        : "bg-muted/50 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {signal.bullish === true && (
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                    {signal.bullish === false && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {signal.bullish === null && (
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    )}
                    <span className="font-semibold text-foreground">{signal.label}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price + OI Chart */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Price + Open Interest</h2>
          {marketSituation && (
            <p
              className={`text-sm font-bold mb-3 ${
                marketSituation.signals[0]?.bullish === true
                  ? "text-green-400"
                  : marketSituation.signals[0]?.bullish === false
                    ? "text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              ➜ {marketSituation.signals[0]?.detail}
            </p>
          )}
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-green-400">Bullish:</strong> Price rising + OI rising = new
            money entering longs (strong trend). <strong className="text-red-400">Bearish:</strong>{" "}
            Price falling + OI rising = new money entering shorts (downtrend strengthening).{" "}
            <strong className="text-orange-400">Caution:</strong> Price rising + OI falling = rally
            running out of fuel. <strong className="text-blue-400">Bottom signal:</strong> Price
            falling + OI falling = longs capitulating, reversal may be near.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceOIMerged}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="price"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "#f59e0b" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  stroke="#f59e0b"
                />
                <YAxis
                  yAxisId="oi"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#6366f1" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  stroke="#6366f1"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "price") return [formatPrice(value), "Price"];
                    if (name === "oi")
                      return [
                        `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC`,
                        "Open Interest",
                      ];
                    return [value, name];
                  }}
                />
                <Area
                  yAxisId="oi"
                  type="monotone"
                  dataKey="oi"
                  fill="#6366f120"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Price (USD)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Open Interest (BTC)
            </span>
          </div>
        </div>

        {/* Long/Short Ratio */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Long / Short Account Ratio</h2>
          {marketSituation && (
            <p
              className={`text-sm font-bold mb-3 ${
                marketSituation.signals[2]?.bullish === true
                  ? "text-green-400"
                  : marketSituation.signals[2]?.bullish === false
                    ? "text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              ➜ {marketSituation.signals[2]?.detail}
            </p>
          )}
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-blue-400">Contrarian signal:</strong> When most traders are
            long, price tends to drop (squeeze the crowd). When most traders are short, price tends
            to rise. The dashed line at 1.0 = equal longs and shorts. Above 1 = more accounts are
            long (crowd is bullish — often a warning). Below 1 = more accounts are short (crowd is
            bearish — often a buying opportunity).{" "}
            <strong className="text-orange-400">The crowd is usually wrong at extremes.</strong>
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 2]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <ReferenceLine y={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "ratio") return [value.toFixed(3), "Global L/S Ratio"];
                    if (name === "longRatio")
                      return [`${(value * 100).toFixed(1)}%`, "Long Accounts"];
                    if (name === "shortRatio")
                      return [`${(value * 100).toFixed(1)}%`, "Short Accounts"];
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="longRatio"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="longRatio"
                />
                <Line
                  type="monotone"
                  dataKey="shortRatio"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="shortRatio"
                />
                <Line
                  type="monotone"
                  dataKey="ratio"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="ratio"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Long Accounts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Short Accounts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> L/S Ratio
            </span>
          </div>
        </div>

        {/* Funding Rate Chart */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Funding Rate History</h2>
          {marketSituation && (
            <p
              className={`text-sm font-bold mb-3 ${
                marketSituation.signals[1]?.bullish === true
                  ? "text-green-400"
                  : marketSituation.signals[1]?.bullish === false
                    ? "text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              ➜ {marketSituation.signals[1]?.detail}
            </p>
          )}
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-green-400">Positive bars (green):</strong> Longs pay shorts —
            the market is overleveraged to the upside. Higher = more dangerous for longs.{" "}
            <strong className="text-red-400">Negative bars (red):</strong> Shorts pay longs — market
            is overleveraged to the downside. Higher negative = more dangerous for shorts.{" "}
            <strong className="text-orange-400">
              Extremely high positive funding often precedes a correction.
            </strong>{" "}
            Funding is what it costs to hold a position — when it's expensive, the crowded side
            usually gets wrecked.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v.toFixed(3)}%`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value.toFixed(4)}%`, "Funding Rate (8h)"]}
                />
                <Bar
                  dataKey="rate"
                  fill="#22c55e"
                  radius={[2, 2, 0, 0]}
                  // Color negative bars red
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-500" />
            <p>
              <strong className="text-orange-400">High positive funding</strong> = longs pay shorts
              (overleveraged longs at risk of liquidation).{" "}
              <strong className="text-green-400">Negative funding</strong> = shorts pay longs
              (overleveraged shorts at risk).
            </p>
          </div>
        </div>

        {/* Taker Buy/Sell Volume */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Taker Buy / Sell Volume</h2>
          {marketSituation && (
            <p
              className={`text-sm font-bold mb-3 ${
                marketSituation.signals[3]?.bullish === true
                  ? "text-green-400"
                  : marketSituation.signals[3]?.bullish === false
                    ? "text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              ➜ {marketSituation.signals[3]?.detail}
            </p>
          )}
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-green-400">Green (taker buy):</strong> Aggressive buyers hitting
            the ask — this is real demand pushing price up.{" "}
            <strong className="text-red-400">Red (taker sell):</strong> Aggressive sellers hitting
            the bid — real sell pressure pushing price down.{" "}
            <strong className="text-blue-400">
              {
                "Buy ratio > 0.5 = buyers dominating (bullish). Below 0.5 = sellers dominating (bearish)."
              }
            </strong>{" "}
            Watch for sudden spikes — they often signal large players entering or exiting positions.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={takerChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "buyVolume")
                      return [
                        `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC`,
                        "Taker Buy Vol",
                      ];
                    if (name === "sellVolume")
                      return [
                        `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC`,
                        "Taker Sell Vol",
                      ];
                    if (name === "buyRatio") return [value.toFixed(3), "Buy/Sell Ratio"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="buyVolume" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sellVolume" fill="#ef4444" stackId="a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Taker Buy (bullish)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Taker Sell (bearish)
            </span>
          </div>
        </div>

        {/* Potential Liquidation Zones (volume heatmap approximation) */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Potential Liquidation Zones</h2>
          {liqZones.length > 0 && latestPrice > 0 && (
            <p className="text-sm font-bold text-orange-400 mb-3">
              ➜ Highest volume zones at{" "}
              {liqZones
                .slice(0, 3)
                .map((z) => `$${z.price.toLocaleString()}`)
                .join(", ")}{" "}
              — {latestPrice > liqZones[0]?.price ? "price is above" : "price is near"} the biggest
              liquidation cluster.{" "}
              {latestPrice > liqZones[0]?.price
                ? "Watch for support if price dips into these zones."
                : "Watch for a potential squeeze if price pumps through."}
            </p>
          )}
          <p className="text-xs text-muted-foreground mb-2">
            These are the price levels where the most trading happened — think of them as "battle
            zones" where big moves can trigger chain reactions.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            <strong className="text-orange-400">
              If price drops into a high-volume zone below:
            </strong>{" "}
            many longs may get liquidated, causing a cascade (flash crash).{" "}
            <strong className="text-blue-400">If price pumps into a high-volume zone above:</strong>{" "}
            many shorts may get liquidated, causing a squeeze to the upside. The bigger the bar, the
            more potential fuel for a move.
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liqZones} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="price"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC`,
                    "Volume",
                  ]}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary) / 0.6)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>
              These levels represent price zones with the most accumulated volume. Sudden price
              moves into these zones can trigger cascading liquidations, amplifying volatility.
            </p>
          </div>
        </div>

        {/* Data source footer */}
        <div className="text-center text-xs text-muted-foreground py-4 border-t border-border">
          Data sourced from {data.source === "Binance" ? "Binance" : "OKX"} Futures API (public, no
          API key required).{" "}
          {data.source.includes("OKX") ? "Binance geo-restricted — OKX fallback used." : ""}
          <br />
          Open Interest, Funding Rate, Long/Short Ratio, Taker Buy/Sell Volume.
        </div>
      </div>
    </div>
  );
}
