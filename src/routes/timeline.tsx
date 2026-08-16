import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Play, Pause, ArrowLeftRight } from "lucide-react";
import { emptyTimelinePayload, type TimelineDay } from "@/lib/timeline.functions";
import { timelineQuery } from "@/lib/queries";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { CycleCard } from "@/components/timeline/CycleCard";
import { InfoPanel } from "@/components/timeline/InfoPanel";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useRef, useEffect } from "react";

const timelinePageSchema = generateWebPageSchema({
  path: "/timeline",
  name: "BTC500 Time Machine — Replay Bitcoin Halving Cycles",
  description:
    "Explore the BTC500 strategy through an interactive timeline. Compare a $20,000 investment across current and previous halving cycles with real historical Bitcoin prices.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Time Machine", path: "/timeline" },
  ],
});

function TimelinePending() {
  return (
    <RoutePending>
      <div className="flex flex-col gap-6 p-5">
        <header className="mb-8 text-center sm:mb-12">
          <Skeleton className="mx-auto h-10 w-80 rounded-lg" />
          <Skeleton className="mx-auto mt-4 h-6 w-96 rounded-md" />
        </header>
        <Skeleton className="h-24 rounded-[24px]" />
        <Skeleton className="h-96 rounded-[32px]" />
        <Skeleton className="h-96 rounded-[32px]" />
      </div>
    </RoutePending>
  );
}

export const Route = createFileRoute("/timeline")({
  head: () =>
    generatePageHead({
      path: "/timeline",
      title: "BTC500 Time Machine — Replay Bitcoin Halving Cycles",
      description:
        "Replay Bitcoin halving cycles with the BTC500 interactive timeline and follow a $20,000 investment through real historical prices.",
      keywords:
        "Bitcoin timeline, BTC500 time machine, Bitcoin halving history, Bitcoin price history, Bitcoin investment timeline, halving cycle comparison, Bitcoin backtest",
      ogTitle: "BTC500 Time Machine — Interactive Bitcoin Timeline",
      ogDescription:
        "Replay Bitcoin history with the BTC500 strategy. Compare investments across halving cycles with real price data.",
      ogImageAlt: "BTC500 Time Machine — Interactive Bitcoin Halving Timeline",
      twitterDescription: "Replay Bitcoin history with the BTC500 strategy.",
      schema: timelinePageSchema,
    }),
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(timelineQuery);
    } catch (err) {
      console.error("[timeline] loader failed; page will render an empty timeline:", err);
      context.queryClient.setQueryData(timelineQuery.queryKey, emptyTimelinePayload());
    }
  },
  component: Timeline,
  pendingComponent: TimelinePending,
  errorComponent: ({ error }) => <RouteDataError error={error} message="Data updating..." />,
  notFoundComponent: RouteNotFound,
});

function formatUsdAmount(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function Timeline() {
  const { data } = useSuspenseQuery(timelineQuery);
  const { currentCycle, previousCycle, investment } = data;
  const loadFailed = data.status === "unavailable" || data.status === "error";
  const hasPreviousCycleData = previousCycle.days.length > 0;
  const hasCurrentCycleData = currentCycle.days.length > 0;

  const [currentDay, setCurrentDay] = useState<TimelineDay | null>(
    currentCycle.days[currentCycle.days.length - 1] ?? null,
  );
  const [previousDay, setPreviousDay] = useState<TimelineDay | null>(previousCycle.days[0] ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const previousIndexRef = useRef(0);
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

  const handleSync = useCallback(() => {
    if (!currentDay) return;
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

  if (loadFailed && !hasPreviousCycleData && !hasCurrentCycleData) {
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
              Historical data could not be loaded. This is not an empty timeline — prices are
              unavailable right now.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!hasPreviousCycleData && !hasCurrentCycleData) {
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
              The {currentCycle.label} buy window opens{" "}
              <span className="font-semibold text-foreground">{buyDateFormatted}</span>. There is no
              price path to replay yet for that window.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!hasCurrentCycleData && hasPreviousCycleData) {
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
              The {currentCycle.label} buy window opens{" "}
              <span className="font-semibold text-foreground">{buyDateFormatted}</span>. The
              previous realized cycle is below.
            </p>
            <div className="w-full">
              <InfoPanel
                investment={investment}
                currentDay={null}
                previousDay={previousCycle.days[previousCycle.days.length - 1] ?? null}
                currentPerformanceKind={currentCycle.performanceKind}
                previousPerformanceKind={previousCycle.performanceKind}
              />
              <div className="mt-8">
                <CycleCard
                  cycle={previousCycle}
                  selectedDay={previousCycle.days[0]!}
                  onDayChange={() => {}}
                  title={previousCycle.label}
                  showSell
                />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Only confirmed historical Bitcoin prices are used. Projected dates are not shown as
              realized results.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

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
              Explore Bitcoin halving history with the BTC
              <span className="text-primary">500</span> strategy. Follow a{" "}
              {formatUsdAmount(investment)} investment through realized and live cycles — drag the
              timeline or press play to watch history unfold.
            </p>
          </motion.header>

          {/* Info Panel */}
          <InfoPanel
            investment={investment}
            currentDay={currentDay}
            previousDay={previousDay}
            currentPerformanceKind={currentCycle.performanceKind}
            previousPerformanceKind={previousCycle.performanceKind}
          />

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
          {currentDay && hasCurrentCycleData && (
            <CycleCard
              cycle={currentCycle}
              selectedDay={currentDay}
              onDayChange={handleCurrentDayChange}
              title={currentCycle.label}
              showToday={currentCycle.performanceKind !== "realized"}
            />
          )}

          {/* Previous Cycle Card */}
          {previousDay && hasPreviousCycleData && (
            <CycleCard
              cycle={previousCycle}
              selectedDay={previousDay}
              onDayChange={handlePreviousDayChange}
              title={previousCycle.label}
              showSell={previousCycle.performanceKind === "realized"}
            />
          )}

          {/* SEO / informational content */}
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              How to Read the BTC500 Time Machine
            </h2>
            <p>
              The time machine replays Bitcoin&apos;s price history around each halving. It follows
              a hypothetical {formatUsdAmount(investment)} investment through the live cycle and the
              previous realized cycle using actual historical prices, letting you drag the timeline
              or press play to watch a halving cycle unfold day by day.
            </p>
            <p>
              The BTC500 strategy is simple: enter the market 500 days before a halving and exit 500
              days after. Comparing the current cycle against a previous one at the same day offset
              shows how the buy and sell signal feels in real time versus how it looked after the
              fact.
            </p>
            <p>
              Only confirmed historical prices are used here — there are no future price
              predictions. Past performance does not guarantee future results. For the full T-500 /
              T+500 methodology see the{" "}
              <Link
                to="/bitcoin-500-day-cycle"
                className="font-semibold text-primary hover:underline"
              >
                Bitcoin 500-day cycle
              </Link>
              . Run the same dates in the{" "}
              <Link to="/simulator" className="font-semibold text-primary hover:underline">
                simulator
              </Link>{" "}
              or read the{" "}
              <Link
                to="/articles/btc500-strategy"
                className="font-semibold text-primary hover:underline"
              >
                strategy
              </Link>
              .
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Historical prices from Bitstamp. Only real historical Bitcoin prices are used. No future
            price predictions. Past performance does not guarantee future results.
          </p>
        </div>
      </main>
    </div>
  );
}
