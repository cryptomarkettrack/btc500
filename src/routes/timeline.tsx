import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Play, Pause, ArrowLeftRight } from "lucide-react";
import { getTimelineData } from "@/lib/timeline.functions";
import type { TimelineDay } from "@/lib/timeline.functions";
import { CycleCard } from "@/components/timeline/CycleCard";
import { InfoPanel } from "@/components/timeline/InfoPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useRef, useEffect } from "react";

const timelineQuery = queryOptions({
  queryKey: ["timeline"],
  queryFn: () => getTimelineData(),
  staleTime: 60 * 60_000,
  refetchInterval: 60 * 60_000,
});

const timelinePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "BTC500 Time Machine — Replay Bitcoin Halving Cycles",
  url: "https://btc500.vercel.app/timeline",
  description:
    "Explore the BTC500 strategy through an interactive timeline. Compare a $20,000 investment across current and previous halving cycles with real historical Bitcoin prices.",
  dateModified: "2026-07-13",
  datePublished: "2024-01-15",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://btc500.vercel.app/timeline",
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Time Machine",
        item: "https://btc500.vercel.app/timeline",
      },
    ],
  },
};

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      {
        title: "BTC500 Time Machine — Replay Bitcoin Halving Cycles | Interactive Timeline",
      },
      {
        name: "description",
        content:
          "Explore the BTC500 strategy through an interactive timeline. Compare a $20,000 investment across current and previous halving cycles with real historical Bitcoin prices.",
      },
      {
        name: "keywords",
        content:
          "Bitcoin timeline, BTC500 time machine, Bitcoin halving history, Bitcoin price history, Bitcoin investment timeline, halving cycle comparison, Bitcoin backtest",
      },
      { property: "og:title", content: "BTC500 Time Machine — Interactive Bitcoin Timeline" },
      {
        property: "og:description",
        content:
          "Replay Bitcoin history with the BTC500 strategy. Compare investments across halving cycles with real price data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://btc500.vercel.app/timeline" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "BTC500 Time Machine — Interactive Bitcoin Halving Timeline",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BTC500 Time Machine — Interactive Bitcoin Timeline" },
      {
        name: "twitter:description",
        content: "Replay Bitcoin history with the BTC500 strategy.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
    ],
    links: [
      { rel: "canonical", href: "https://btc500.vercel.app/timeline" },
      { rel: "alternate", hrefLang: "en", href: "https://btc500.vercel.app/timeline" },
      { rel: "alternate", hrefLang: "x-default", href: "https://btc500.vercel.app/timeline" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(timelinePageSchema),
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(timelineQuery),
  component: Timeline,
  pendingComponent: Pending,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Data updating...</p>
        <p className="mt-2 text-xs text-muted-foreground/70">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function Pending() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-6 p-5">
          <header className="mb-8 text-center sm:mb-12">
            <Skeleton className="mx-auto h-10 w-80 rounded-lg" />
            <Skeleton className="mx-auto mt-4 h-6 w-96 rounded-md" />
          </header>
          <Skeleton className="h-24 rounded-[24px]" />
          <Skeleton className="h-96 rounded-[32px]" />
          <Skeleton className="h-96 rounded-[32px]" />
        </div>
      </main>
    </div>
  );
}

function Timeline() {
  const { data } = useSuspenseQuery(timelineQuery);
  const { currentCycle, previousCycle } = data;

  // If there's no previous cycle data, show a placeholder message
  const hasPreviousCycleData = previousCycle.days.length > 0;

  if (!hasPreviousCycleData) {
    const buyDateFormatted = new Date(currentCycle.buyDate + "T00:00:00Z").toLocaleDateString(
      "en-US",
      { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" },
    );

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <Clock className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              BTC<span className="text-primary">500</span> Time Machine
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              The current BTC<span className="text-primary">500</span> cycle hasn't started yet. The
              buy window opens{" "}
              <span className="font-semibold text-foreground">{buyDateFormatted}</span> — 500 days
              before the projected April 2028 halving.
            </p>
            <p className="max-w-xl text-sm text-muted-foreground">
              In the meantime, explore the previous cycle below to see how the strategy performed.
            </p>
            <div className="w-full">
              <InfoPanel
                currentDay={null}
                previousDay={
                  hasPreviousCycleData ? previousCycle.days[previousCycle.days.length - 1] : null
                }
              />
              {hasPreviousCycleData && (
                <div className="mt-8">
                  <CycleCard
                    cycle={previousCycle}
                    selectedDay={previousCycle.days[0]}
                    onDayChange={() => {}}
                    title={previousCycle.label}
                    showSell
                  />
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Historical prices from Bitstamp. Only real historical Bitcoin prices are used.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // Initialize with safe defaults - these will be valid because of the guard above
  const initialCurrentDay =
    currentCycle.days.length > 0
      ? currentCycle.days[currentCycle.days.length - 1]
      : ({
          date: "",
          timestamp: 0,
          price: 0,
          dayIndex: 0,
          btcPurchased: 0,
          portfolioValue: 0,
          profitLoss: 0,
          roiPercent: 0,
          daysUntilHalving: null,
          daysAfterHalving: null,
        } as TimelineDay);

  const initialPreviousDay =
    previousCycle.days.length > 0
      ? previousCycle.days[0]
      : ({
          date: "",
          timestamp: 0,
          price: 0,
          dayIndex: 0,
          btcPurchased: 0,
          portfolioValue: 0,
          profitLoss: 0,
          roiPercent: 0,
          daysUntilHalving: null,
          daysAfterHalving: null,
        } as TimelineDay);

  const [currentDay, setCurrentDay] = useState<TimelineDay>(initialCurrentDay);
  const [previousDay, setPreviousDay] = useState<TimelineDay>(initialPreviousDay);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const previousIndexRef = useRef(0);

  // Sync mode
  const [syncMode, setSyncMode] = useState(false);

  const handleCurrentDayChange = useCallback(
    (day: TimelineDay) => {
      setCurrentDay(day);
      currentIndexRef.current = currentCycle.days.findIndex((d) => d.date === day.date);
      if (isPlaying) setIsPlaying(false);
    },
    [currentCycle.days, isPlaying],
  );

  const handlePreviousDayChange = useCallback(
    (day: TimelineDay) => {
      setPreviousDay(day);
      previousIndexRef.current = previousCycle.days.findIndex((d) => d.date === day.date);
      if (isPlaying) setIsPlaying(false);
    },
    [previousCycle.days, isPlaying],
  );

  // Sync: move previous cycle to same day index as current
  const handleSync = useCallback(() => {
    const currentIdx = currentCycle.days.findIndex((d) => d.date === currentDay.date);
    const targetIdx = Math.min(currentIdx, previousCycle.days.length - 1);
    const targetDay = previousCycle.days[targetIdx];
    if (targetDay) {
      setPreviousDay(targetDay);
      previousIndexRef.current = targetIdx;
    }
    setSyncMode(true);
    if (isPlaying) setIsPlaying(false);
  }, [currentCycle.days, currentDay, previousCycle.days, isPlaying]);

  // Playback logic
  useEffect(() => {
    if (!isPlaying) {
      if (playbackRef.current !== null) {
        cancelAnimationFrame(playbackRef.current);
        playbackRef.current = null;
      }
      return;
    }

    let lastTick = performance.now();
    const tick = (now: number) => {
      if (now - lastTick < 100) {
        playbackRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTick = now;

      let updated = false;

      // Advance both timelines
      const nextCurrentIdx = currentIndexRef.current + 1;
      if (nextCurrentIdx < currentCycle.days.length) {
        const nextDay = currentCycle.days[nextCurrentIdx];
        setCurrentDay(nextDay);
        currentIndexRef.current = nextCurrentIdx;
        updated = true;
      }

      const nextPrevIdx = previousIndexRef.current + 1;
      if (nextPrevIdx < previousCycle.days.length) {
        const nextDay = previousCycle.days[nextPrevIdx];
        setPreviousDay(nextDay);
        previousIndexRef.current = nextPrevIdx;
        updated = true;
      }

      if (updated) {
        playbackRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };

    playbackRef.current = requestAnimationFrame(tick);

    return () => {
      if (playbackRef.current !== null) {
        cancelAnimationFrame(playbackRef.current);
        playbackRef.current = null;
      }
    };
  }, [isPlaying, currentDay, previousDay, currentCycle.days, previousCycle.days]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <motion.header
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                BTC<span className="text-primary">500</span> Time Machine
              </h1>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Follow a $20,000 investment through the BTC
              <span className="text-primary">500</span> strategy across halving cycles. Drag the
              timeline or press play to watch history unfold.
            </p>
          </motion.header>

          {/* Info Panel */}
          <InfoPanel currentDay={currentDay} previousDay={previousDay} />

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </button>

            {/* Compare Same Day */}
            <button
              onClick={handleSync}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                syncMode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare Same Day
            </button>
          </div>

          {/* Current Cycle Card */}
          {currentDay && (
            <CycleCard
              cycle={currentCycle}
              selectedDay={currentDay}
              onDayChange={handleCurrentDayChange}
              title={currentCycle.label}
              showToday
            />
          )}

          {/* Previous Cycle Card */}
          {previousDay && (
            <CycleCard
              cycle={previousCycle}
              selectedDay={previousDay}
              onDayChange={handlePreviousDayChange}
              title={previousCycle.label}
              showSell
            />
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Historical prices from Bitstamp. Only real historical Bitcoin prices are used. No future
            price predictions. Past performance does not guarantee future results.
          </p>
        </div>
      </main>
    </div>
  );
}
