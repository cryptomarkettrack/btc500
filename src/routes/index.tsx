import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  TrendingUp,
  Layers,
  Calculator,
  BookOpen,
  BarChart3,
  Flame,
  Newspaper,
  TrendingDown,
  ArrowRight,
  Target,
  Shield,
  Zap,
  DollarSign,
  LineChart,
} from "lucide-react";
import { getHalvingInfo, getBtcPrice } from "@/lib/btc.functions";
import { computeCycle, formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { ProgressRing } from "@/components/ProgressRing";
import { BtcLogo } from "@/components/BtcLogo";
import { ShareButton } from "@/components/ShareButton";
import { ChartShareCard } from "@/components/ChartShareCard";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Btc500Hero } from "@/components/Btc500Hero";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSimulatorData } from "@/lib/simulator.functions";
import { getArticlesSorted, type ArticleMeta } from "@/lib/articles";

const halvingQuery = queryOptions({
  queryKey: ["halving"],
  queryFn: () => getHalvingInfo(),
  staleTime: 60 * 60_000,
  refetchInterval: 60 * 60_000,
});

const priceQuery = queryOptions({
  queryKey: ["btc-price"],
  queryFn: () => getBtcPrice(),
  staleTime: 60_000,
  refetchInterval: 60_000,
});

const simulatorPreviewQuery = queryOptions({
  queryKey: ["simulator-preview"],
  queryFn: () => getSimulatorData(),
  staleTime: 60 * 60_000,
  refetchInterval: 60 * 60_000,
});

const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "BTC500 — Bitcoin Halving Countdown & Investment Strategy",
  url: "https://btc500.vercel.app/",
  description:
    "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell exactly 500 days after. Live countdowns, block progress, historical returns & investment simulator.",
  dateModified: "2026-07-13",
  datePublished: "2024-01-15",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://btc500.vercel.app/",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://btc500.vercel.app/",
      },
    ],
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BTC500 — Bitcoin Halving Countdown & Investment Strategy | Buy 500 Days Before" },
      {
        name: "description",
        content:
          "Track the Bitcoin 500 strategy. Buy exactly 500 days before each halving and sell exactly 500 days after. Live countdowns, investment simulator, historical performance data and daily shareable cards. The simplest Bitcoin investment strategy.",
      },
      {
        name: "keywords",
        content:
          "Bitcoin halving, BTC500, Bitcoin strategy, Bitcoin countdown, buy Bitcoin, crypto halving, Bitcoin investment, halving countdown, Bitcoin trading, Bitcoin price, block height",
      },
      { property: "og:title", content: "BTC500 — Bitcoin Halving Countdown & Investment Strategy" },
      {
        property: "og:description",
        content:
          "Buy 500 days before halving. Sell 500 days after. Track live countdowns, block progress, and historical returns. The dead-simple Bitcoin strategy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://btc500.vercel.app/" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "BTC500 — Bitcoin Halving Countdown & Strategy Dashboard",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BTC500 — Bitcoin Halving Countdown & Strategy" },
      {
        name: "twitter:description",
        content: "Buy 500 days before halving. Sell 500 days after. Track live countdowns.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
    ],
    links: [
      { rel: "canonical", href: "https://btc500.vercel.app/" },
      { rel: "alternate", hrefLang: "en", href: "https://btc500.vercel.app/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://btc500.vercel.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(homePageSchema),
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(halvingQuery);
    // Pre-fetch simulator data for the preview section
    context.queryClient.prefetchQuery(simulatorPreviewQuery);
  },
  component: Index,
  pendingComponent: Pending,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Data updating…</p>
        <p className="mt-2 text-xs text-muted-foreground/70">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Index() {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const priceRes = useQuery(priceQuery);
  const simulatorRes = useQuery(simulatorPreviewQuery);
  const now = useNow(60_000);
  const heroRef = useRef<HTMLDivElement>(null);
  const chartShareCardRef = useRef<HTMLDivElement>(null);

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );

  // Section 1: "Waiting to Buy" — active during the 500-day pre-halving window (buyDate to nextHalving)
  const isBuyActive = now >= cycle.buyDate && now < cycle.nextHalving;
  // Section 2: "Waiting to Sell" — active after halving until sellDate
  const isSellActive = now >= cycle.nextHalving && now < cycle.sellDate;

  // Buy section accent
  const buyAccent = "var(--primary)";
  const buyAccentSoft = "var(--primary-soft)";

  // Sell section accent
  const sellAccent = isSellActive ? "var(--success)" : "var(--muted-foreground)";
  const sellAccentSoft = isSellActive ? "var(--success-soft)" : "var(--muted)";

  // Buy countdown: days until buyDate (or 0 if passed)
  const buyDays = Math.max(0, cycle.daysUntilBuy);
  const buyTotalDays = 500;
  const buyElapsed = buyTotalDays - buyDays;
  const buyProgress = cycle.buyProgress;

  // Block progress: current block height vs target halving block
  const blocksInCycle = halving.nextHalvingBlock - halving.lastHalvingBlock;
  const blocksElapsed = halving.height - halving.lastHalvingBlock;
  const blockProgress = Math.max(0, Math.min(1, blocksElapsed / blocksInCycle));
  const blocksRemaining = halving.nextHalvingBlock - halving.height;

  // Sell countdown: days until sellDate
  const sellDays = cycle.daysUntilSell;
  const sellTotalDays = 500;
  const sellElapsed = sellTotalDays - sellDays;
  const sellProgress = cycle.sellProgress;

  // Get latest articles
  const latestArticles = getArticlesSorted().slice(0, 3);

  // Calculate historical returns from simulator data for the preview
  const completedCycles =
    simulatorRes.data?.cycles.filter((c) => c.returnMultiplier !== null) ?? [];
  const bestCycle =
    completedCycles.length > 0
      ? completedCycles.reduce((best, c) =>
          c.returnMultiplier! > best.returnMultiplier! ? c : best,
        )
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div
          ref={heroRef}
          className="flex flex-col gap-6 p-0 sm:p-5"
          style={{ background: "var(--background)" }}
        >
          <Btc500Hero price={priceRes.data?.price ?? null} daysLeft={buyDays} />

          {/* Share Card Export Buttons */}
          <div className="flex justify-center px-6">
            <ShareButton captureRef={chartShareCardRef} />
          </div>

          {/* Section 1: Waiting to Buy (Main hero card) */}
          <motion.section
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)] sm:p-12"
          >
            {/* watermark */}
            <div className="pointer-events-none absolute -right-16 -bottom-16 opacity-[0.06]">
              <BtcLogo size={420} />
            </div>

            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
              {/* Countdown block */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ background: buyAccentSoft }}
                  >
                    <Clock className="h-5 w-5" style={{ color: buyAccent }} />
                  </span>
                  <div>
                    <div
                      className="text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ color: buyAccent }}
                    >
                      Waiting to Buy
                    </div>
                    <div className="text-lg font-semibold">500 days before halving</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Days Left
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span
                      className="text-[8rem] font-bold leading-[0.9] tracking-tighter sm:text-[10rem]"
                      style={{ color: buyAccent }}
                    >
                      {buyDays.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: buyAccent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${buyProgress * 100}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                    <span>{Math.max(0, buyElapsed)} days elapsed</span>
                    <span>{buyTotalDays} days total</span>
                  </div>
                </div>
              </div>

              {/* Next halving */}
              <div className="flex flex-col justify-center md:border-l md:border-border/60 md:pl-14">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Next Halving
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-foreground/80" />
                  <span className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {formatDate(new Date(halving.nextHalvingDate))}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {formatUtc(new Date(halving.nextHalvingDate))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <MiniStat label="Buy Date" value={formatDate(cycle.buyDate)} />
                  <MiniStat label="Sell Date" value={formatDate(cycle.sellDate)} />
                </div>

                {/* Block progress */}
                <div className="mt-8 rounded-2xl bg-muted/60 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Block Progress
                    </span>
                  </div>
                  <div className="mt-3">
                    <Progress value={blockProgress * 100} className="h-2" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground/80">
                      {halving.height.toLocaleString()}
                    </span>
                    <span className="font-mono font-medium text-foreground/80">
                      {halving.nextHalvingBlock.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground/70">
                    <span>Current block</span>
                    <span>Target block</span>
                  </div>
                  <div className="mt-2 text-center text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {blocksRemaining.toLocaleString()}
                    </span>{" "}
                    blocks remaining
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 2: Waiting to Sell (Secondary card) */}
          <motion.section
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
          >
            <div className="flex items-center gap-4">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: sellAccentSoft }}
              >
                <TrendingUp className="h-5 w-5" style={{ color: sellAccent }} />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Waiting to Sell
                </div>
                <div className="text-base font-semibold text-foreground/80">
                  500 days after halving
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Sell countdown */}
              <div className="text-right">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Days to Sell
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: isSellActive ? "var(--success)" : "var(--muted-foreground)" }}
                >
                  {sellDays}
                </div>
              </div>
              {/* Sell date */}
              <div className="text-right">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Sell Date
                </div>
                <div className="text-sm font-semibold">{formatDate(cycle.sellDate)}</div>
              </div>
              {isSellActive ? (
                priceRes.data ? (
                  <div className="text-sm text-muted-foreground">
                    BTC{" "}
                    <span className="font-semibold text-foreground">
                      {formatUsd(priceRes.data.price)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-10 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                  </div>
                )
              ) : null}
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {isSellActive ? "Active" : "Not Active"}
              </span>
            </div>
          </motion.section>
        </div>

        {/* ===== HOW IT WORKS SECTION ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How BTC<span className="text-primary">500</span> Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              A dead-simple, rules-based Bitcoin investment strategy built around the halving cycle.
              No charts, no TA, no emotions.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <HowItWorksCard
              icon={Target}
              step="1"
              title="Buy 500 Days Before"
              description="Set your buy order exactly 500 days before the next halving. The countdown above tells you exactly when."
              accent="var(--primary)"
              accentSoft="var(--primary-soft)"
            />
            <HowItWorksCard
              icon={Zap}
              step="2"
              title="Hold Through Halving"
              description="Hold your position as the halving event passes. This is where the magic happens — reduced supply meets sustained demand."
              accent="var(--info)"
              accentSoft="oklch(0.95 0.04 240)"
            />
            <HowItWorksCard
              icon={Shield}
              step="3"
              title="Sell 500 Days After"
              description="Exit exactly 500 days after halving. Lock in profits and wait for the next cycle. Rinse and repeat every ~4 years."
              accent="var(--success)"
              accentSoft="var(--success-soft)"
            />
          </div>
        </motion.section>

        {/* ===== HISTORICAL RETURNS PREVIEW ===== */}
        {completedCycles.length > 0 && (
          <motion.section
            initial={{ y: 12, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20"
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Historical Performance
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                The BTC<span className="text-primary">500</span> strategy has delivered exceptional
                returns across every halving cycle since 2012.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {completedCycles.map((cycle, i) => (
                <motion.div
                  key={cycle.label}
                  initial={{ y: 12, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-[24px] border border-border/60 bg-card p-5"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {cycle.label}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy Price</span>
                      <span className="font-semibold">
                        {cycle.buyPrice ? formatUsd(cycle.buyPrice) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sell Price</span>
                      <span className="font-semibold">
                        {cycle.sellPrice ? formatUsd(cycle.sellPrice) : "—"}
                      </span>
                    </div>
                    <div className="border-t border-border/40 pt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return</span>
                        <span
                          className="font-bold"
                          style={{
                            color:
                              cycle.returnPercent && cycle.returnPercent > 0
                                ? "var(--success)"
                                : "var(--destructive)",
                          }}
                        >
                          {cycle.returnPercent !== null
                            ? `${cycle.returnPercent > 0 ? "+" : ""}${cycle.returnPercent.toFixed(0)}%`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/simulator"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                <Calculator className="h-4 w-4" />
                Calculate Your Returns
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>
        )}

        {/* ===== FEATURE CARDS — EXPLORE TOOLS ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore All Tools</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Go beyond the countdown. Dive deeper into Bitcoin data, strategy, and market insights.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              to="/simulator"
              icon={Calculator}
              title="Investment Simulator"
              description={
                <>
                  See exactly how much you'd have earned using the BTC
                  <span className="text-primary">500</span> strategy across every halving cycle
                  since 2012.
                </>
              }
              accent="var(--primary)"
              accentSoft="var(--primary-soft)"
            />
            <FeatureCard
              to="/timeline"
              icon={LineChart}
              title="Time Machine"
              description="Replay any day in Bitcoin's halving history. Watch prices evolve in real-time through an interactive timeline."
              accent="var(--info)"
              accentSoft="oklch(0.95 0.04 240)"
            />
            <FeatureCard
              to="/articles"
              icon={BookOpen}
              title="Strategy Articles"
              description={
                <>
                  Deep dives into the BTC<span className="text-primary">500</span> strategy,
                  NUPL/RUPL indicators, on-chain analysis, and more.
                </>
              }
              accent="var(--success)"
              accentSoft="var(--success-soft)"
            />
            <FeatureCard
              to="/macro-impact"
              icon={BarChart3}
              title="Macro Impact (CPI/PPI)"
              description="Track how CPI, PPI, and Fed rate decisions correlate with Bitcoin price movements."
              accent="oklch(0.65 0.15 240)"
              accentSoft="oklch(0.95 0.04 240)"
            />
            <FeatureCard
              to="/insider-trading"
              icon={TrendingUp}
              title="Insider Trading Tracker"
              description="Monitor insider transactions at major crypto companies. See who's buying and selling."
              accent="oklch(0.65 0.15 155)"
              accentSoft="oklch(0.95 0.04 155)"
            />
            <FeatureCard
              to="/liquidation"
              icon={Flame}
              title="Liquidation Dashboard"
              description="Track real-time crypto liquidations across exchanges. See where leverage is getting wiped out."
              accent="oklch(0.577 0.245 27.325)"
              accentSoft="oklch(0.95 0.04 30)"
            />
          </div>
        </motion.section>

        {/* ===== LATEST ARTICLES ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Articles</h2>
              <p className="mt-2 text-muted-foreground">In-depth analysis and strategy guides.</p>
            </div>
            <Link
              to="/articles"
              className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {latestArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
            >
              View all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        {/* ===== FINAL CTA ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-10 text-center shadow-sm sm:p-16">
            <div className="pointer-events-none absolute -left-16 -top-16 opacity-[0.04]">
              <BtcLogo size={300} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Master the Halving Cycle?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                The BTC<span className="text-primary">500</span> strategy gives you a clear,
                data-backed plan. No guesswork, no FOMO, no emotional trading. Just a proven system.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                >
                  <Calculator className="h-4 w-4" />
                  Try the Simulator
                </Link>
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  Read the Strategy
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Data refreshes automatically. Halving estimate from Bitcoin block height · BTC price from
          Binance, CoinGecko, Coinbase & Kraken.
        </p>
      </main>

      {/* Hidden share card for social media image generation */}
      <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }}>
        <ChartShareCard
          ref={chartShareCardRef}
          cycle={cycle}
          price={priceRes.data?.price ?? null}
          daysLeft={buyDays}
        />
      </div>
    </div>
  );
}

function Pending() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-6 p-0 sm:p-5">
          {/* Header skeleton */}
          <header className="mb-4 text-center sm:mb-6">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-10 w-56 rounded-lg" />
              <Skeleton className="h-20 w-full max-w-[300px] rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </header>

          {/* Main hero card skeleton */}
          <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-8 shadow-sm sm:p-12">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
              {/* Countdown block skeleton */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-28 rounded-md" />
                    <Skeleton className="mt-1.5 h-5 w-44 rounded-md" />
                  </div>
                </div>
                <div className="mt-4">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <div className="mt-2 flex items-baseline gap-3">
                    <Skeleton className="h-32 w-48 rounded-lg sm:h-40" />
                    <Skeleton className="h-8 w-12 rounded-md" />
                  </div>
                  <div className="mt-6">
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="mt-2 flex justify-between">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Next halving skeleton */}
              <div className="flex flex-col justify-center md:border-l md:border-border/60 md:pl-14">
                <Skeleton className="h-3 w-24 rounded-md" />
                <div className="mt-3 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-10 w-44 rounded-lg sm:h-12" />
                </div>
                <Skeleton className="mt-2 h-4 w-36 rounded-md" />
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 rounded-2xl" />
                  <Skeleton className="h-16 rounded-2xl" />
                </div>
                <div className="mt-8 rounded-2xl bg-muted/60 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                  <Skeleton className="mt-3 h-2 w-full rounded-full" />
                  <div className="mt-2 flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                  <Skeleton className="mx-auto mt-2 h-4 w-32 rounded-md" />
                </div>
              </div>
            </div>
          </section>

          {/* Secondary card skeleton */}
          <section className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div>
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="mt-1.5 h-5 w-44 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-20 rounded-md" />
              <Skeleton className="h-12 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </section>
        </div>

        <Skeleton className="mx-auto mt-16 h-4 w-96 rounded-md" />
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function HowItWorksCard({
  icon: Icon,
  step,
  title,
  description,
  accent,
  accentSoft,
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
  accent: string;
  accentSoft: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-6 transition-all hover:shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: accentSoft, color: accent }}
        >
          {step}
        </span>
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  to,
  icon: Icon,
  title,
  description,
  accent,
  accentSoft,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  accent: string;
  accentSoft: string;
}) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group rounded-[24px] border border-border/60 bg-card p-6 transition-all hover:shadow-sm"
      >
        <span
          className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: accentSoft }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </span>
        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div
          className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: accent }}
        >
          Explore
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </motion.div>
    </Link>
  );
}

function ArticleCard({ article, index }: { article: ArticleMeta; index: number }) {
  return (
    <Link to={`/articles/${article.slug}` as "/articles/btc500-strategy"}>
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group rounded-[24px] border border-border/60 bg-card p-6 transition-all hover:shadow-sm"
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>{article.articleSection}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {article.description}
        </p>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
          Read article
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </motion.div>
    </Link>
  );
}
