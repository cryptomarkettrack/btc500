import { useMemo, useState } from "react";
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
  Eye,
  Crosshair,
} from "lucide-react";
import { useLiquidationData } from "@/hooks/use-liquidation-data";
import {
  type TimeRange,
  sliceLiquidationData,
  buildPriceOiChartData,
  buildLongShortChartData,
  buildFundingChartData,
  buildTakerChartData,
  analyzeMarketSituation,
  computeLiqZones,
  findWatchLevels,
  proposeFuturesPosition,
} from "@/lib/liquidation-analysis";
import {
  formatPrice,
  formatCompactUsd,
  formatPercent,
} from "@/lib/format";

function formatOIBtc(v: number): string {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatOIMillions(v: number): string {
  if (v >= 1e9) return formatCompactUsd(v, { maxFractionDigits: 2 });
  if (v >= 1e6) return formatCompactUsd(v, { maxFractionDigits: 0 });
  return `$${v.toFixed(0)}`;
}

export function LiquidationDashboard() {
  const { data, isLoading, refetch } = useLiquidationData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const sliced = useMemo(
    () => (data ? sliceLiquidationData(data, timeRange) : null),
    [data, timeRange],
  );

  const priceOIMerged = useMemo(
    () => (sliced ? buildPriceOiChartData(sliced) : []),
    [sliced],
  );
  const lsChartData = useMemo(
    () => (sliced ? buildLongShortChartData(sliced) : []),
    [sliced],
  );
  const fundingChartData = useMemo(
    () => (sliced ? buildFundingChartData(sliced) : []),
    [sliced],
  );
  const takerChartData = useMemo(
    () => (sliced ? buildTakerChartData(sliced) : []),
    [sliced],
  );

  const latestPrice = data?.klines[data.klines.length - 1]?.close ?? 0;
  const currentOI = data?.currentOI.oi ?? 0;
  const latestFunding = data?.fundingRates[data.fundingRates.length - 1]?.rate ?? 0;
  const latestLS = data?.longShortRatios[data.longShortRatios.length - 1];
  const prevLS = data?.longShortRatios[data.longShortRatios.length - 2];
  const lsDirection = latestLS && prevLS ? latestLS.ratio - prevLS.ratio : 0;

  const marketSituation = useMemo(
    () => (data ? analyzeMarketSituation(data) : null),
    [data],
  );
  const liqZones = useMemo(() => (data ? computeLiqZones(data) : []), [data]);
  const nextLevels = useMemo(
    () => (data ? findWatchLevels(data, latestPrice, liqZones) : null),
    [data, latestPrice, liqZones],
  );
  const proposedPosition = useMemo(
    () =>
      data && marketSituation
        ? proposeFuturesPosition(data, marketSituation, latestPrice)
        : null,
    [data, marketSituation, latestPrice],
  );

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

            {/* ── Next Levels to Watch ── */}
            {nextLevels && (
              <div className="mt-5 rounded-lg bg-muted/30 border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold">Next Levels to Watch</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resistance */}
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wide">
                      ↑ Resistance
                    </p>
                    {nextLevels.above.length === 0 && (
                      <p className="text-xs text-muted-foreground">No nearby resistance levels</p>
                    )}
                    {nextLevels.above.map((level) => (
                      <div key={level.price} className="mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-red-400">
                            {formatPrice(level.price)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
                            {level.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {level.expectation}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Support */}
                  <div>
                    <p className="text-xs font-medium text-green-400 mb-2 uppercase tracking-wide">
                      ↓ Support
                    </p>
                    {nextLevels.below.length === 0 && (
                      <p className="text-xs text-muted-foreground">No nearby support levels</p>
                    )}
                    {nextLevels.below.map((level) => (
                      <div key={level.price} className="mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-green-400">
                            {formatPrice(level.price)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 font-medium">
                            {level.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {level.expectation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Proposed Futures Position ── */}
            {proposedPosition && proposedPosition.direction && (
              <div className="mt-4 rounded-lg bg-muted/30 border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold">Proposed Futures Position</h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      proposedPosition.direction === "LONG"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {proposedPosition.direction}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {proposedPosition.leverage}× leverage
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Entry
                    </p>
                    <p className="text-sm font-bold font-mono">
                      {formatPrice(proposedPosition.entry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-400 uppercase tracking-wide">
                      Take Profit
                    </p>
                    <p className="text-sm font-bold font-mono text-green-400">
                      {formatPrice(proposedPosition.tp)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      +{proposedPosition.rewardPct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-red-400 uppercase tracking-wide">Stop Loss</p>
                    <p className="text-sm font-bold font-mono text-red-400">
                      {formatPrice(proposedPosition.sl)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      -{proposedPosition.riskPct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Risk : Reward
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        proposedPosition.rr >= 2
                          ? "text-green-400"
                          : proposedPosition.rr >= 1.5
                            ? "text-yellow-400"
                            : "text-orange-400"
                      }`}
                    >
                      1:{proposedPosition.rr.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded bg-muted/50 border border-border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">
                    Example: ${proposedPosition.investment.toLocaleString()} invested @{" "}
                    {proposedPosition.leverage}× leverage
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Notional position size:{" "}
                    <strong className="text-foreground">
                      ${proposedPosition.notional.toLocaleString()}
                    </strong>
                    {" — "}
                    <span className="text-green-400 font-semibold">
                      If TP hit: +${proposedPosition.pnlTP.toFixed(0)}
                    </span>{" "}
                    <span className="text-muted-foreground">|</span>{" "}
                    <span className="text-red-400 font-semibold">
                      If SL hit: ${proposedPosition.pnlSL.toFixed(0)}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                  <strong className="text-foreground">Reasoning:</strong>{" "}
                  {proposedPosition.reasoning}
                </p>
                <p className="text-[10px] text-orange-400/70 mt-2">
                  ⚠️ Algorithmic suggestion based on current market data — not financial advice.
                  Always use proper risk management.
                </p>
              </div>
            )}
            {proposedPosition && !proposedPosition.direction && (
              <div className="mt-4 rounded-lg bg-muted/30 border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crosshair className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Proposed Futures Position</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {proposedPosition.reasoning}
                </p>
                <p className="text-[10px] text-orange-400/70 mt-2">
                  ⚠️ Algorithmic suggestion based on current market data — not financial advice.
                </p>
              </div>
            )}
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
