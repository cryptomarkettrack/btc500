import { useMemo, useState, type ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Cell,
} from "recharts";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  Zap,
  ShieldCheck,
  AlertCircle,
  Eye,
  Crosshair,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Database,
  Loader2,
} from "lucide-react";
import { useLiquidationData } from "@/hooks/use-liquidation-data";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  type TimeRange,
  sliceLiquidationData,
  buildPriceOiChartData,
  buildLongShortChartData,
  buildFundingChartData,
  buildTakerChartData,
  analyzeMarketSituation,
  computeLiqZones,
  computeSeriesDomain,
  findWatchLevels,
  proposeFuturesPosition,
} from "@/lib/liquidation-analysis";
import { formatPrice, formatCompactUsd, formatPercent, formatCompactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

function formatOIBtc(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function ChartCard({
  title,
  signal,
  signalBullish,
  howToRead,
  children,
  legend,
  footer,
}: {
  title: string;
  signal?: string;
  signalBullish?: boolean | null;
  howToRead?: ReactNode;
  children: ReactNode;
  legend?: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-5 rounded-2xl border border-border/60 bg-card p-4 sm:mb-6 sm:p-6">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      {signal && (
        <p
          className={cn(
            "mt-2 text-sm font-semibold leading-snug",
            signalBullish === true && "text-green-500",
            signalBullish === false && "text-red-500",
            signalBullish == null && "text-muted-foreground",
          )}
        >
          → {signal}
        </p>
      )}
      {howToRead && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            How to read this chart
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {open && (
            <div className="mt-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              {howToRead}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 -mx-1 sm:mx-0">{children}</div>
      {legend && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {legend}
        </div>
      )}
      {footer && <div className="mt-3 text-xs text-muted-foreground">{footer}</div>}
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function ChartTooltipShell({
  active,
  label,
  children,
}: {
  active?: boolean;
  label?: string;
  children: ReactNode;
}) {
  if (!active) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {children}
    </div>
  );
}

export function LiquidationDashboard() {
  const { data, isLoading, error, refetch } = useLiquidationData();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [showSources, setShowSources] = useState(false);

  const sliced = useMemo(
    () => (data ? sliceLiquidationData(data, timeRange) : null),
    [data, timeRange],
  );

  const priceOIMerged = useMemo(() => (sliced ? buildPriceOiChartData(sliced) : []), [sliced]);
  const lsChartData = useMemo(() => (sliced ? buildLongShortChartData(sliced) : []), [sliced]);
  const fundingChartData = useMemo(() => (sliced ? buildFundingChartData(sliced) : []), [sliced]);
  const takerChartData = useMemo(() => (sliced ? buildTakerChartData(sliced) : []), [sliced]);

  const latestPrice = data?.klines[data.klines.length - 1]?.close ?? 0;
  const currentOI = data?.currentOI.oi ?? 0;
  const currentOIValue = data?.currentOI.oiValue ?? 0;
  const latestFunding = data?.fundingRates[data.fundingRates.length - 1]?.rate ?? 0;
  const latestLS = data?.longShortRatios[data.longShortRatios.length - 1];
  const prevLS = data?.longShortRatios[data.longShortRatios.length - 2];
  const lsDirection = latestLS && prevLS ? latestLS.ratio - prevLS.ratio : 0;

  const marketSituation = useMemo(() => (data ? analyzeMarketSituation(data) : null), [data]);
  const liqZones = useMemo(
    () => (data ? computeLiqZones(data, latestPrice) : []),
    [data, latestPrice],
  );
  const nextLevels = useMemo(
    () => (data ? findWatchLevels(data, latestPrice, liqZones) : null),
    [data, latestPrice, liqZones],
  );
  const proposedPosition = useMemo(
    () =>
      data && marketSituation ? proposeFuturesPosition(data, marketSituation, latestPrice) : null,
    [data, marketSituation, latestPrice],
  );

  // Chart responsive knobs
  const chartHeight = isMobile ? 220 : 300;
  const compactChartHeight = isMobile ? 200 : 260;
  // Dedicated chart-body heights (labels sit outside so they don't eat plot space)
  const pricePanelHeight = isMobile ? 170 : 210;
  const oiPanelHeight = isMobile ? 150 : 180;
  const xInterval = isMobile
    ? Math.max(0, Math.floor((priceOIMerged.length || 1) / 4) - 1)
    : ("preserveStartEnd" as const);
  const chartMargin = isMobile
    ? { top: 8, right: 8, left: 0, bottom: 0 }
    : { top: 8, right: 12, left: 4, bottom: 0 };
  // OI panel needs bottom room for X-axis tick labels
  const oiChartMargin = isMobile
    ? { top: 4, right: 8, left: 0, bottom: 4 }
    : { top: 4, right: 12, left: 4, bottom: 4 };
  const tickFont = isMobile ? 9 : 10;
  const yWidth = isMobile ? 44 : 56;
  const yWidthRight = isMobile ? 36 : 44;

  const priceDomain = useMemo(
    () =>
      computeSeriesDomain(
        priceOIMerged.map((d) => d.price),
        0.06,
      ),
    [priceOIMerged],
  );
  const oiDomain = useMemo(
    () =>
      computeSeriesDomain(
        priceOIMerged.map((d) => d.oi),
        0.12,
      ),
    [priceOIMerged],
  );

  const oiChangePct = useMemo(() => {
    const vals = priceOIMerged.map((d) => d.oi).filter((v): v is number => v != null);
    if (vals.length < 2) return null;
    const first = vals[0];
    const last = vals[vals.length - 1];
    if (!first) return null;
    return ((last - first) / first) * 100;
  }, [priceOIMerged]);

  const priceChangePct = useMemo(() => {
    if (priceOIMerged.length < 2) return null;
    const first = priceOIMerged[0].price;
    const last = priceOIMerged[priceOIMerged.length - 1].price;
    if (!first) return null;
    return ((last - first) / first) * 100;
  }, [priceOIMerged]);

  const lsPctDomain = useMemo((): [number, number] => {
    if (lsChartData.length === 0) return [30, 70];
    let min = 100;
    let max = 0;
    for (const d of lsChartData) {
      min = Math.min(min, d.longRatio, d.shortRatio);
      max = Math.max(max, d.longRatio, d.shortRatio);
    }
    const pad = 5;
    return [Math.max(0, Math.floor(min - pad)), Math.min(100, Math.ceil(max + pad))];
  }, [lsChartData]);

  const lsRatioDomain = useMemo((): [number, number] => {
    if (lsChartData.length === 0) return [0.5, 2];
    let min = Infinity;
    let max = -Infinity;
    for (const d of lsChartData) {
      min = Math.min(min, d.ratio);
      max = Math.max(max, d.ratio);
    }
    const pad = 0.15;
    return [Math.max(0, Number((min - pad).toFixed(2))), Number((max + pad).toFixed(2))];
  }, [lsChartData]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold sm:text-2xl">Liquidation Dashboard</h1>
          </div>
          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <p className="mb-1 font-semibold text-red-500">Could not load futures data</p>
              <p className="mb-4 text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="animate-pulse text-sm sm:text-base">
                Loading BTC perpetual futures data…
              </p>
              <p className="text-xs text-muted-foreground/80">
                Binance Futures first, OKX fallback if geo-restricted
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const fetchTime = formatDistanceToNow(new Date(data.fetchDate), { addSuffix: true });
  const sourceIsMixed = data.source.startsWith("Mixed");
  const sourceIsOkx = data.source.includes("OKX") && !sourceIsMixed;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-8">
        {/* Header */}
        <header className="mb-5 sm:mb-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                <Flame className="h-6 w-6 shrink-0 text-orange-500 sm:h-7 sm:w-7" />
                <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                  Liquidation Dashboard
                </h1>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                BTC perpetual futures — open interest, funding, long/short & taker volume.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold",
                sourceIsOkx && "bg-orange-500/10 text-orange-500",
                sourceIsMixed && "bg-blue-500/10 text-blue-500",
                !sourceIsOkx &&
                  !sourceIsMixed &&
                  "bg-green-500/10 text-green-600 dark:text-green-400",
              )}
            >
              <Database className="h-3 w-3" />
              {data.source}
            </span>
            <span className="text-muted-foreground">Updated {fetchTime}</span>
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {showSources ? "Hide sources" : "Data sources"}
            </button>
          </div>

          {showSources && (
            <div className="mt-3 rounded-2xl border border-border/60 bg-muted/30 p-3 sm:p-4">
              <p className="mb-2 text-xs font-semibold text-foreground">
                Public futures APIs (no API key)
              </p>
              <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                Primary source is Binance USD-M Futures. If Binance is geo-restricted or fails,
                individual metrics fall back to OKX BTC-USDT-SWAP. Actual liquidation order feed is
                not public without exchange auth — zones below are volume-profile proxies.
              </p>
              <ul className="space-y-2">
                {data.endpoints.map((ep) => (
                  <li
                    key={ep.name}
                    className="flex flex-col gap-0.5 rounded-lg bg-card/80 px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{ep.name}</p>
                      <a
                        href={ep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 flex items-start gap-1 break-all text-[10px] text-muted-foreground hover:text-primary sm:text-[11px]"
                      >
                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="line-clamp-2 sm:line-clamp-1">{ep.url}</span>
                      </a>
                    </div>
                    <span
                      className={cn(
                        "w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        ep.source === "Binance" &&
                          "bg-green-500/10 text-green-600 dark:text-green-400",
                        ep.source === "OKX" && "bg-orange-500/10 text-orange-500",
                      )}
                    >
                      {ep.source}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* ── Situation overview (read first) ── */}
        {marketSituation && (
          <section className="mb-5 rounded-2xl border border-border/60 bg-card p-4 sm:mb-6 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-base font-semibold sm:text-lg">Right now — market overview</h2>
            </div>

            <div
              className={cn(
                "mb-4 rounded-xl p-3.5 sm:p-5",
                marketSituation.verdictColor === "green" &&
                  "border border-green-500/30 bg-green-500/10",
                marketSituation.verdictColor === "red" && "border border-red-500/30 bg-red-500/10",
                marketSituation.verdictColor === "blue" &&
                  "border border-blue-500/30 bg-blue-500/10",
                marketSituation.verdictColor === "orange" &&
                  "border border-orange-500/30 bg-orange-500/10",
                marketSituation.verdictColor === "muted" && "border border-border bg-muted",
              )}
            >
              <div className="mb-2 flex items-start gap-2">
                {marketSituation.verdictColor === "green" && (
                  <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                )}
                {marketSituation.verdictColor === "red" && (
                  <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                )}
                {marketSituation.verdictColor === "blue" && (
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                )}
                {marketSituation.verdictColor === "orange" && (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                )}
                {marketSituation.verdictColor === "muted" && (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-base font-bold leading-snug sm:text-lg",
                      marketSituation.verdictColor === "green" && "text-green-500",
                      marketSituation.verdictColor === "red" && "text-red-500",
                      marketSituation.verdictColor === "blue" && "text-blue-500",
                      marketSituation.verdictColor === "orange" && "text-orange-500",
                      marketSituation.verdictColor === "muted" && "text-muted-foreground",
                    )}
                  >
                    {marketSituation.verdict.split(" — ")[0].replace("MARKET SITUATION: ", "")}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {marketSituation.verdict.split(" — ")[1]}
                  </p>
                </div>
              </div>
            </div>

            {/* Snapshot metrics */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</p>
                <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
                  {formatPrice(latestPrice)}
                </p>
                {priceChangePct != null && (
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      priceChangePct >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {priceChangePct >= 0 ? "+" : ""}
                    {priceChangePct.toFixed(1)}% in view
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Open interest
                </p>
                <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
                  {formatOIBtc(currentOI)}
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">BTC</span>
                </p>
                {oiChangePct != null ? (
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      oiChangePct >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {oiChangePct >= 0 ? "+" : ""}
                    {oiChangePct.toFixed(1)}% in view
                    {currentOIValue > 0 ? ` · ${formatCompactUsd(currentOIValue)}` : ""}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {currentOIValue > 0 ? formatCompactUsd(currentOIValue) : "—"}
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Funding (8h)
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-base font-bold tabular-nums sm:text-lg",
                    latestFunding >= 0 ? "text-green-500" : "text-red-500",
                  )}
                >
                  {formatPercent(latestFunding, 4)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {latestFunding >= 0 ? "Longs pay shorts" : "Shorts pay longs"}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 sm:p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Long / Short
                </p>
                <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
                  {latestLS ? latestLS.ratio.toFixed(3) : "—"}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {lsDirection >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  {lsDirection >= 0 ? "Longs growing" : "Shorts growing"}
                </p>
              </div>
            </div>

            {/* Signal chips */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {marketSituation.signals.map((signal) => (
                <div
                  key={signal.label}
                  className={cn(
                    "rounded-xl p-2.5 text-xs sm:p-3",
                    signal.bullish === true && "border border-green-500/20 bg-green-500/5",
                    signal.bullish === false && "border border-red-500/20 bg-red-500/5",
                    signal.bullish == null && "border border-border bg-muted/40",
                  )}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        signal.bullish === true && "bg-green-500",
                        signal.bullish === false && "bg-red-500",
                        signal.bullish == null && "bg-muted-foreground",
                      )}
                    />
                    <span className="font-semibold text-foreground">{signal.label}</span>
                    <span
                      className={cn(
                        "ml-auto text-[10px] font-bold uppercase",
                        signal.bullish === true && "text-green-500",
                        signal.bullish === false && "text-red-500",
                        signal.bullish == null && "text-muted-foreground",
                      )}
                    >
                      {signal.bullish === true
                        ? "Bullish"
                        : signal.bullish === false
                          ? "Bearish"
                          : "Neutral"}
                    </span>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{signal.detail}</p>
                </div>
              ))}
            </div>

            {/* Quick levels */}
            {nextLevels && (nextLevels.above.length > 0 || nextLevels.below.length > 0) && (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    Watch overhead
                  </p>
                  {nextLevels.above.slice(0, 1).map((level) => (
                    <div key={level.price}>
                      <p className="font-mono text-sm font-bold text-red-500">
                        {formatPrice(level.price)}
                        <span className="ml-2 font-sans text-[10px] font-medium text-red-500/80">
                          {level.type}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {level.expectation}
                      </p>
                    </div>
                  ))}
                  {nextLevels.above.length === 0 && (
                    <p className="text-xs text-muted-foreground">No nearby resistance</p>
                  )}
                </div>
                <div className="rounded-xl border border-green-500/15 bg-green-500/5 p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-green-500">
                    Watch below
                  </p>
                  {nextLevels.below.slice(0, 1).map((level) => (
                    <div key={level.price}>
                      <p className="font-mono text-sm font-bold text-green-500">
                        {formatPrice(level.price)}
                        <span className="ml-2 font-sans text-[10px] font-medium text-green-500/80">
                          {level.type}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {level.expectation}
                      </p>
                    </div>
                  ))}
                  {nextLevels.below.length === 0 && (
                    <p className="text-xs text-muted-foreground">No nearby support</p>
                  )}
                </div>
              </div>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Scroll for charts, levels & position details ↓
            </p>
          </section>
        )}

        {/* Time range for chart history */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
          <h2 className="text-sm font-semibold text-foreground sm:text-base">Detail charts</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:gap-2">
            {(["7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all sm:px-4",
                  timeRange === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {r === "all" ? "All" : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Price + OI — dual panel so both series are fully visible */}
        <ChartCard
          title="Price + Open Interest"
          signal={marketSituation?.signals[0]?.detail}
          signalBullish={marketSituation?.signals[0]?.bullish}
          howToRead={
            <>
              <p>
                Two stacked panels share the same timeline. Top = BTC price, bottom = open interest
                in BTC — each with its own scale so neither series is crushed.
              </p>
              <p className="mt-1">
                <strong className="text-green-500">Bullish:</strong> price ↑ + OI ↑ = new longs.
                <strong className="text-red-500"> Bearish:</strong> price ↓ + OI ↑ = new shorts.
                <strong className="text-orange-500"> Caution:</strong> price ↑ + OI ↓ = thin rally.
              </p>
            </>
          }
          legend={
            <>
              <LegendDot color="#f59e0b" label="Price (USD)" />
              <LegendDot color="#6366f1" label="Open Interest (BTC)" />
              {priceChangePct != null && (
                <span className="tabular-nums">
                  Price {priceChangePct >= 0 ? "+" : ""}
                  {priceChangePct.toFixed(1)}%
                </span>
              )}
              {oiChangePct != null && (
                <span className="tabular-nums">
                  OI {oiChangePct >= 0 ? "+" : ""}
                  {oiChangePct.toFixed(1)}%
                </span>
              )}
            </>
          }
        >
          <div className="w-full space-y-3">
            {/* Price panel — label outside fixed height so plot isn't clipped */}
            <div className="w-full">
              <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-amber-500/90">
                Price
              </p>
              <div className="w-full" style={{ height: pricePanelHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={priceOIMerged} margin={chartMargin}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis dataKey="time" hide />
                    <YAxis
                      domain={priceDomain}
                      width={yWidth}
                      tick={{ fontSize: tickFont, fill: "#f59e0b" }}
                      tickFormatter={(v) =>
                        isMobile ? `$${(v / 1000).toFixed(0)}k` : `$${(v / 1000).toFixed(1)}k`
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, label, payload }) => (
                        <ChartTooltipShell active={active} label={label as string}>
                          {typeof payload?.[0]?.payload?.price === "number" && (
                            <p className="text-amber-500">
                              Price: {formatPrice(payload[0].payload.price)}
                            </p>
                          )}
                          {typeof payload?.[0]?.payload?.oi === "number" && (
                            <p className="text-indigo-500">
                              OI:{" "}
                              {payload[0].payload.oi.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}{" "}
                              BTC
                            </p>
                          )}
                        </ChartTooltipShell>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="#f59e0b18"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* OI panel — own scale + full height for the series */}
            <div className="w-full border-t border-border/40 pt-3">
              <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-indigo-500/90">
                Open interest
              </p>
              <div className="w-full" style={{ height: oiPanelHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={priceOIMerged} margin={oiChartMargin}>
                    <defs>
                      <linearGradient id="oiFillPanel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                      interval={xInterval as number | "preserveStartEnd"}
                      minTickGap={isMobile ? 28 : 40}
                      axisLine={false}
                      tickLine={false}
                      height={28}
                    />
                    <YAxis
                      domain={oiDomain}
                      width={yWidth}
                      tick={{ fontSize: tickFont, fill: "#6366f1" }}
                      tickFormatter={(v) => formatCompactNumber(v)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, label, payload }) => (
                        <ChartTooltipShell active={active} label={label as string}>
                          {typeof payload?.[0]?.payload?.oi === "number" && (
                            <p className="text-indigo-500">
                              OI:{" "}
                              {payload[0].payload.oi.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}{" "}
                              BTC
                            </p>
                          )}
                          {typeof payload?.[0]?.payload?.price === "number" && (
                            <p className="text-amber-500">
                              Price: {formatPrice(payload[0].payload.price)}
                            </p>
                          )}
                        </ChartTooltipShell>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="oi"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#oiFillPanel)"
                      connectNulls
                      dot={false}
                      isAnimationActive={false}
                      baseValue="dataMin"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Long/Short */}
        <ChartCard
          title="Long / Short Account Ratio"
          signal={marketSituation?.signals[2]?.detail}
          signalBullish={marketSituation?.signals[2]?.bullish}
          howToRead={
            <>
              <p>
                Share of accounts that are long vs short (global). Ratio &gt; 1 means more long
                accounts.
              </p>
              <p className="mt-1">
                <strong className="text-blue-500">Contrarian:</strong> crowded longs often get
                squeezed down; crowded shorts often get squeezed up. The crowd is usually wrong at
                extremes.
              </p>
            </>
          }
          legend={
            <>
              <LegendDot color="#22c55e" label="% Long accounts" />
              <LegendDot color="#ef4444" label="% Short accounts" />
              <LegendDot color="#3b82f6" label="L/S ratio" />
            </>
          }
        >
          <div style={{ height: chartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lsChartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  interval={xInterval as number | "preserveStartEnd"}
                  minTickGap={isMobile ? 28 : 40}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="pct"
                  domain={lsPctDomain}
                  width={yWidth}
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="ratio"
                  orientation="right"
                  domain={lsRatioDomain}
                  width={yWidthRight}
                  tick={{ fontSize: tickFont, fill: "#3b82f6" }}
                  tickFormatter={(v) => v.toFixed(1)}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine
                  yAxisId="ratio"
                  y={1}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <ChartTooltipShell active={active} label={label as string}>
                      {payload?.map((p) => {
                        if (p.dataKey === "longRatio" && typeof p.value === "number") {
                          return (
                            <p key="l" className="text-green-500">
                              Long: {p.value.toFixed(1)}%
                            </p>
                          );
                        }
                        if (p.dataKey === "shortRatio" && typeof p.value === "number") {
                          return (
                            <p key="s" className="text-red-500">
                              Short: {p.value.toFixed(1)}%
                            </p>
                          );
                        }
                        if (p.dataKey === "ratio" && typeof p.value === "number") {
                          return (
                            <p key="r" className="text-blue-500">
                              L/S ratio: {p.value.toFixed(3)}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </ChartTooltipShell>
                  )}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="longRatio"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="shortRatio"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="ratio"
                  type="monotone"
                  dataKey="ratio"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Funding */}
        <ChartCard
          title="Funding Rate History"
          signal={marketSituation?.signals[1]?.detail}
          signalBullish={marketSituation?.signals[1]?.bullish}
          howToRead={
            <>
              <p>
                <strong className="text-green-500">Green (positive):</strong> longs pay shorts —
                market skewed long.
              </p>
              <p className="mt-1">
                <strong className="text-red-500">Red (negative):</strong> shorts pay longs — market
                skewed short. Extreme positive funding often precedes a correction.
              </p>
            </>
          }
          footer={
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
              <p>
                High positive funding = overleveraged longs at risk. Negative funding =
                overleveraged shorts at risk.
              </p>
            </div>
          }
        >
          <div style={{ height: compactChartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingChartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  interval={xInterval as number | "preserveStartEnd"}
                  minTickGap={isMobile ? 28 : 40}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={yWidth}
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${Number(v).toFixed(3)}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <ChartTooltipShell active={active} label={label as string}>
                      {typeof payload?.[0]?.value === "number" && (
                        <p className={payload[0].value >= 0 ? "text-green-500" : "text-red-500"}>
                          Funding (8h): {payload[0].value.toFixed(4)}%
                        </p>
                      )}
                    </ChartTooltipShell>
                  )}
                />
                <Bar dataKey="rate" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {fundingChartData.map((entry, i) => (
                    <Cell key={`fund-${i}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Taker volume */}
        <ChartCard
          title="Taker Buy / Sell Volume"
          signal={marketSituation?.signals[3]?.detail}
          signalBullish={marketSituation?.signals[3]?.bullish}
          howToRead={
            <>
              <p>
                <strong className="text-green-500">Green:</strong> aggressive buyers hitting the ask
                (real demand).
              </p>
              <p className="mt-1">
                <strong className="text-red-500">Red:</strong> aggressive sellers hitting the bid
                (real sell pressure). Buy share &gt; 50% is bullish bias.
              </p>
            </>
          }
          legend={
            <>
              <LegendDot color="#22c55e" label="Taker buy" />
              <LegendDot color="#ef4444" label="Taker sell" />
            </>
          }
        >
          <div style={{ height: compactChartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={takerChartData} margin={chartMargin} stackOffset="none">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  interval={xInterval as number | "preserveStartEnd"}
                  minTickGap={isMobile ? 28 : 40}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={yWidth}
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => formatCompactNumber(v)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <ChartTooltipShell active={active} label={label as string}>
                      {payload?.map((p) => {
                        if (p.dataKey === "buyVolume" && typeof p.value === "number") {
                          return (
                            <p key="b" className="text-green-500">
                              Buy: {p.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
                              BTC
                            </p>
                          );
                        }
                        if (p.dataKey === "sellVolume" && typeof p.value === "number") {
                          return (
                            <p key="s" className="text-red-500">
                              Sell:{" "}
                              {p.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} BTC
                            </p>
                          );
                        }
                        return null;
                      })}
                      {typeof payload?.[0]?.payload?.buyShare === "number" && (
                        <p className="mt-0.5 text-muted-foreground">
                          Buy share: {payload[0].payload.buyShare.toFixed(1)}%
                        </p>
                      )}
                    </ChartTooltipShell>
                  )}
                />
                <Bar dataKey="buyVolume" stackId="vol" fill="#22c55e" isAnimationActive={false} />
                <Bar
                  dataKey="sellVolume"
                  stackId="vol"
                  fill="#ef4444"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Volume / liq zones — coarse clusters */}
        <ChartCard
          title="High-Volume Price Zones"
          signal={
            liqZones.length > 0 && latestPrice > 0
              ? `Largest clusters: ${liqZones
                  .slice()
                  .sort((a, b) => b.volume - a.volume)
                  .slice(0, 3)
                  .map((z) => z.label)
                  .join(", ")} — wide volume magnets (not $100 ticks).`
              : undefined
          }
          signalBullish={null}
          howToRead={
            <>
              <p>
                Zoomed-out volume profile: large price bands (typically $1k–$5k wide) where the most
                BTC traded over ~30 days. These act as support/resistance magnets.
              </p>
              <p className="mt-1">
                Dense bands below can fuel long liquidations on a breakdown; bands above can fuel
                short squeezes on a breakout. Not an exchange liquidation heatmap.
              </p>
            </>
          }
        >
          <div
            style={{
              height: Math.max(isMobile ? 240 : 280, liqZones.length * (isMobile ? 28 : 32)),
            }}
            className="w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={liqZones}
                layout="vertical"
                margin={
                  isMobile
                    ? { top: 4, right: 12, left: 0, bottom: 4 }
                    : { top: 4, right: 20, left: 4, bottom: 4 }
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => formatCompactNumber(v)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={isMobile ? 72 : 92}
                  tick={{ fontSize: tickFont, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const z = payload[0].payload as {
                      label: string;
                      price: number;
                      volume: number;
                      distancePct: number;
                      side: string;
                    };
                    return (
                      <ChartTooltipShell active>
                        <p className="font-medium">{z.label}</p>
                        <p className="text-muted-foreground">
                          Mid {formatPrice(z.price)} · Volume{" "}
                          {z.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC
                        </p>
                        <p className="text-muted-foreground">
                          {z.distancePct >= 0 ? "+" : ""}
                          {z.distancePct.toFixed(1)}% vs spot ({z.side})
                        </p>
                      </ChartTooltipShell>
                    );
                  }}
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {liqZones.map((z, i) => (
                    <Cell
                      key={`zone-${i}`}
                      fill={
                        z.side === "above"
                          ? "rgba(239, 68, 68, 0.65)"
                          : z.side === "below"
                            ? "rgba(34, 197, 94, 0.65)"
                            : "rgba(249, 115, 22, 0.75)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <LegendDot color="rgba(34, 197, 94, 0.65)" label="Below price (support / long liqs)" />
            <LegendDot
              color="rgba(239, 68, 68, 0.65)"
              label="Above price (resistance / short liqs)"
            />
            <LegendDot color="rgba(249, 115, 22, 0.75)" label="Contains spot" />
          </div>
        </ChartCard>

        {/* Levels + proposed position (detail) */}
        {(nextLevels || proposedPosition) && (
          <section className="mb-5 rounded-2xl border border-border/60 bg-card p-4 sm:mb-6 sm:p-6">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <Eye className="h-5 w-5 text-purple-400" />
              <h2 className="text-base font-semibold sm:text-lg">Levels & trade context</h2>
            </div>

            {nextLevels && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-500">
                    ↑ Resistance
                  </p>
                  {nextLevels.above.length === 0 && (
                    <p className="text-xs text-muted-foreground">No nearby resistance</p>
                  )}
                  {nextLevels.above.map((level) => (
                    <div key={level.price} className="mb-2.5 last:mb-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-red-500">
                          {formatPrice(level.price)}
                        </span>
                        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
                          {level.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {level.expectation}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-green-500">
                    ↓ Support
                  </p>
                  {nextLevels.below.length === 0 && (
                    <p className="text-xs text-muted-foreground">No nearby support</p>
                  )}
                  {nextLevels.below.map((level) => (
                    <div key={level.price} className="mb-2.5 last:mb-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-green-500">
                          {formatPrice(level.price)}
                        </span>
                        <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-500">
                          {level.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {level.expectation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {proposedPosition && proposedPosition.direction && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Crosshair className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold">Proposed Futures Position</h3>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-bold",
                      proposedPosition.direction === "LONG"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500",
                    )}
                  >
                    {proposedPosition.direction}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {proposedPosition.leverage}× leverage
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Entry
                    </p>
                    <p className="font-mono text-sm font-bold">
                      {formatPrice(proposedPosition.entry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-green-500">
                      Take Profit
                    </p>
                    <p className="font-mono text-sm font-bold text-green-500">
                      {formatPrice(proposedPosition.tp)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      +{proposedPosition.rewardPct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-red-500">Stop Loss</p>
                    <p className="font-mono text-sm font-bold text-red-500">
                      {formatPrice(proposedPosition.sl)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      -{proposedPosition.riskPct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Risk : Reward
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        proposedPosition.rr >= 2 && "text-green-500",
                        proposedPosition.rr >= 1.5 && proposedPosition.rr < 2 && "text-yellow-500",
                        proposedPosition.rr < 1.5 && "text-orange-500",
                      )}
                    >
                      1:{proposedPosition.rr.toFixed(1)}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Reasoning:</strong>{" "}
                  {proposedPosition.reasoning}
                </p>
                <p className="mt-2 text-[10px] text-orange-500/80">
                  Algorithmic suggestion — not financial advice.
                </p>
              </div>
            )}
            {proposedPosition && !proposedPosition.direction && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Proposed Futures Position</h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {proposedPosition.reasoning}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border py-5 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          <p>
            Data from <strong className="text-foreground">{data.source}</strong> public futures
            APIs.
            {sourceIsOkx && " Binance geo-restricted — OKX fallback in use."}
            {sourceIsMixed && " Some metrics from Binance, others from OKX."}
          </p>
          <p className="mt-1">
            Metrics: open interest, funding rate, global long/short, taker buy/sell, 4h klines. Not
            financial advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
