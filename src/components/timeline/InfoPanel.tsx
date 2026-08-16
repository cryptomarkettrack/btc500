import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import type { PerformanceKind } from "@/lib/halvings";
import type { TimelineDay } from "@/lib/timeline.functions";

interface InfoPanelProps {
  investment: number;
  currentDay: TimelineDay | null;
  previousDay: TimelineDay | null;
  currentPerformanceKind?: PerformanceKind;
  previousPerformanceKind?: PerformanceKind;
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function InfoPanel({
  investment,
  currentDay,
  previousDay,
  currentPerformanceKind,
  previousPerformanceKind,
}: InfoPanelProps) {
  const diffPercent =
    currentDay && previousDay && previousDay.portfolioValue > 0
      ? ((currentDay.portfolioValue - previousDay.portfolioValue) / previousDay.portfolioValue) *
        100
      : null;

  const historicalCandidates = [
    currentPerformanceKind === "realized" ? currentDay : null,
    previousPerformanceKind === "realized" ? previousDay : null,
  ].filter((d): d is TimelineDay => d != null);

  const bestHistorical =
    historicalCandidates.length === 0
      ? null
      : historicalCandidates.reduce((best, day) =>
          day.portfolioValue > best.portfolioValue ? day : best,
        );

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-[24px] border border-border/60 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
        {/* Investment */}
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Investment
          </div>
          <div className="mt-1 text-xl font-bold">{formatUsd(investment)}</div>
        </div>

        {/* Current cycle portfolio */}
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Current Cycle
          </div>
          <div className="mt-1 text-xl font-bold">
            {currentDay ? <AnimatedNumber value={currentDay.portfolioValue} isCurrency /> : "—"}
          </div>
          {currentDay && (
            <div
              className={`text-xs font-semibold ${
                currentDay.roiPercent >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              <AnimatedNumber value={currentDay.roiPercent} isPercent />
            </div>
          )}
        </div>

        {/* Previous cycle portfolio */}
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Previous Cycle
          </div>
          <div className="mt-1 text-xl font-bold">
            {previousDay ? <AnimatedNumber value={previousDay.portfolioValue} isCurrency /> : "—"}
          </div>
          {previousDay && (
            <div
              className={`text-xs font-semibold ${
                previousDay.roiPercent >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              <AnimatedNumber value={previousDay.roiPercent} isPercent />
            </div>
          )}
        </div>

        {/* Difference */}
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Difference
          </div>
          <div
            className={`mt-1 text-xl font-bold ${
              diffPercent !== null ? (diffPercent >= 0 ? "text-success" : "text-destructive") : ""
            }`}
          >
            {diffPercent !== null ? <AnimatedNumber value={diffPercent} isPercent /> : "—"}
          </div>
        </div>

        {/* Best historical outcome */}
        <div className="text-center sm:col-span-2 lg:col-span-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Best Historical Outcome
          </div>
          <div className="mt-1 text-xl font-bold text-success">
            {bestHistorical ? (
              <>
                {formatUsd(bestHistorical.portfolioValue)}
                <span className="ml-1 text-sm font-semibold">
                  (<AnimatedNumber value={bestHistorical.roiPercent} isPercent />)
                </span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
