import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, TrendingUp, Layers } from "lucide-react";
import { getHalvingInfo, getBtcPrice } from "@/lib/btc.functions";
import { computeCycle, formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { ProgressRing } from "@/components/ProgressRing";
import { BtcLogo } from "@/components/BtcLogo";
import { ShareButton } from "@/components/ShareButton";
import { ShareCard } from "@/components/ShareCard";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

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
  loader: ({ context }) => context.queryClient.ensureQueryData(halvingQuery),
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
  const now = useNow(60_000);
  const heroRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div
          ref={heroRef}
          className="flex flex-col gap-6 p-0 sm:p-5"
          style={{ background: "var(--background)" }}
        >
          <Header />

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
                    <motion.span
                      key={buyDays}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-[8rem] font-bold leading-[0.9] tracking-tighter sm:text-[10rem]"
                      style={{ color: buyAccent }}
                    >
                      {buyDays}
                    </motion.span>
                    <span className="pb-4 text-3xl font-medium text-muted-foreground">days</span>
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

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Data refreshes automatically. Halving estimate from Bitcoin block height · BTC price from
          Binance, CoinGecko, Coinbase & Kraken.
        </p>
      </main>

      {/* Hidden share card for social media image generation */}
      <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }}>
        <ShareCard ref={shareCardRef} cycle={cycle} price={priceRes.data?.price ?? null} />
      </div>

      <div className="mt-16 flex justify-center px-6 pb-12">
        <ShareButton captureRef={shareCardRef} />
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
          <header className="mb-8 text-center sm:mb-12">
            <div className="flex items-center justify-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-14 w-48 rounded-lg" />
            </div>
            <Skeleton className="mx-auto mt-4 h-6 w-80 rounded-md" />
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

function Header() {
  return (
    <header className="mb-8 text-center sm:mb-12">
      <div className="flex items-center justify-center gap-4">
        <BtcLogo size={56} />
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">BTC 500</h1>
      </div>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        Buy 500 days before halving. Sell 500 days after halving.
      </p>
    </header>
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
