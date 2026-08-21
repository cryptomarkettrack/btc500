import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Layers,
  Target,
  Shield,
  Activity,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd, formatUtc } from "@/lib/format";
import {
  CYCLE_SCORE_COMPONENT_META,
  CYCLE_SCORE_OVERALL_META,
  statusAccent,
  type CycleScoreComponentId,
  type CycleScoreResult,
  type ScriptStatus,
} from "@/lib/cycle-score";
import { Progress } from "@/components/ui/progress";
import { BtcLogo } from "@/components/BtcLogo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CommandCenterProps {
  cycle: CycleInfo;
  score: CycleScoreResult | null;
  scoreLoading?: boolean;
  price: number | null;
  height: number;
  nextHalvingBlock: number;
  lastHalvingBlock: number;
  buyDays: number;
  sellDays: number;
  isBuyActive: boolean;
  isSellActive: boolean;
  buyProgress: number;
  blockProgress: number;
  blocksRemaining: number;
}

function phaseLabel(cycle: CycleInfo, isBuyActive: boolean, isSellActive: boolean): string {
  if (isBuyActive) return "Buy window open";
  if (isSellActive) return "Hold → sell window";
  if (cycle.phase === "wait-buy") return "Waiting to buy";
  if (cycle.phase === "wait-sell") return "Waiting to sell";
  return "Cycle complete";
}

function actionToneStyles(tone: CycleScoreResult["actionTone"]): {
  color: string;
  soft: string;
} {
  switch (tone) {
    case "buy":
      return { color: "var(--primary)", soft: "var(--primary-soft)" };
    case "sell":
      return { color: "var(--success)", soft: "var(--success-soft)" };
    case "hold":
      return { color: "var(--info)", soft: "oklch(0.95 0.04 240)" };
    case "wait":
      return { color: "var(--primary)", soft: "var(--primary-soft)" };
    default:
      return { color: "var(--muted-foreground)", soft: "var(--muted)" };
  }
}

export function CommandCenter({
  cycle,
  score,
  scoreLoading,
  price,
  height,
  nextHalvingBlock,
  lastHalvingBlock,
  buyDays,
  sellDays,
  isBuyActive,
  isSellActive,
  buyProgress,
  blockProgress,
  blocksRemaining,
}: CommandCenterProps) {
  const status: ScriptStatus = score?.status ?? "awaiting_data";
  const accent = statusAccent(status);
  const primaryDays = cycle.phase === "wait-sell" ? sellDays : buyDays;
  const primaryLabel =
    cycle.phase === "wait-sell"
      ? "Days to sell"
      : cycle.phase === "done"
        ? "Cycle done"
        : "Days to buy";
  const actionTone = score ? actionToneStyles(score.actionTone) : actionToneStyles("neutral");

  return (
    <TooltipProvider delayDuration={200}>
      <motion.section
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)]"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 opacity-[0.05]">
          <BtcLogo size={360} />
        </div>

        {/* Header strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: accent.soft }}
            >
              <Activity className="h-4 w-4" style={{ color: accent.color }} />
            </span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Cycle command center
              </div>
              <div className="text-sm font-semibold text-foreground">
                Today&apos;s read · {phaseLabel(cycle, isBuyActive, isSellActive)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: accent.soft, color: accent.color }}
            >
              {accent.label}
            </span>
            {price != null && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                BTC {formatUsd(price)}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left: countdown + dates */}
          <div className="border-b border-border/50 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: isSellActive ? "var(--success-soft)" : "var(--primary-soft)",
                }}
              >
                <Clock
                  className="h-5 w-5"
                  style={{ color: isSellActive ? "var(--success)" : "var(--primary)" }}
                />
              </span>
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: isSellActive ? "var(--success)" : "var(--primary)" }}
                >
                  {primaryLabel}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cycle.phase === "wait-sell"
                    ? "500 days after halving"
                    : "500 days before next halving"}
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                suppressHydrationWarning
                className="text-[5.5rem] font-bold leading-[0.9] tracking-tighter sm:text-[7rem]"
                style={{ color: isSellActive ? "var(--success)" : "var(--primary)" }}
              >
                {primaryDays.toLocaleString()}
              </span>
              <span className="pb-3 text-lg font-medium text-muted-foreground">days</span>
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isSellActive ? "var(--success)" : "var(--primary)",
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(cycle.phase === "wait-sell" ? cycle.sellProgress : buyProgress) * 100}%`,
                }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MiniStat
                icon={Calendar}
                label="Next halving"
                value={formatDate(cycle.nextHalving)}
              />
              <MiniStat icon={Target} label="Buy date" value={formatDate(cycle.buyDate)} />
              <MiniStat icon={Shield} label="Sell date" value={formatDate(cycle.sellDate)} />
            </div>

            <div className="mt-5 rounded-2xl bg-muted/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Block progress
                </span>
              </div>
              <div className="mt-2">
                <Progress
                  value={blockProgress * 100}
                  className="h-1.5"
                  aria-label="Block progress toward next halving"
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span className="font-mono">{height.toLocaleString()}</span>
                <span>{blocksRemaining.toLocaleString()} left</span>
                <span className="font-mono">{nextHalvingBlock.toLocaleString()}</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {formatUtc(cycle.nextHalving)} · last halving block{" "}
                {lastHalvingBlock.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Right: cycle score */}
          <div className="flex flex-col p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Cycle score
                </div>
                <MethodTooltip
                  title={CYCLE_SCORE_OVERALL_META.label}
                  summary={CYCLE_SCORE_OVERALL_META.summary}
                  calculation={CYCLE_SCORE_OVERALL_META.calculation}
                  dataSources={CYCLE_SCORE_OVERALL_META.dataSources}
                  weightLabel="Weighted composite"
                />
              </div>
              {scoreLoading && !score && (
                <span className="text-xs text-muted-foreground">Loading…</span>
              )}
            </div>

            {score ? (
              <>
                <div className="flex items-end gap-4">
                  <div
                    className="text-6xl font-bold tracking-tighter sm:text-7xl"
                    style={{ color: accent.color }}
                  >
                    {score.score}
                  </div>
                  <div className="pb-2">
                    <div className="text-xs text-muted-foreground">/ 100</div>
                    <div className="text-base font-semibold" style={{ color: accent.color }}>
                      {score.headline}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {score.subline}
                </p>

                <div
                  className="mt-5 rounded-2xl border border-border/50 px-4 py-3"
                  style={{ background: actionTone.soft }}
                >
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: actionTone.color }}
                  >
                    Next action
                  </div>
                  <p className="mt-1 text-sm font-medium leading-snug text-foreground">
                    {score.action}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {score.components.map((c) => (
                    <ComponentMeter
                      key={c.id}
                      id={c.id}
                      label={c.label}
                      score={c.score}
                      metric={c.metric}
                      detail={c.detail}
                    />
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {score.currentMultiple != null && (
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      Path {score.currentMultiple.toFixed(2)}×
                      {score.medianMultiple != null && (
                        <> vs {score.medianMultiple.toFixed(2)}× median</>
                      )}
                    </span>
                  )}
                  {score.drawdownFromPeak != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <TrendingDown className="h-3 w-3" />−
                      {(score.drawdownFromPeak * 100).toFixed(0)}% from peak
                    </span>
                  )}
                  {score.onChainBottomPoints != null && (
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      On-chain {score.onChainBottomPoints}/{score.onChainMaxPoints}
                      {score.onChainLabel ? ` · ${score.onChainLabel}` : ""}
                      {score.onChainTriggeredCount != null
                        ? ` · ${score.onChainTriggeredCount} fired`
                        : ""}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <ScoreSkeleton />
            )}

            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Link
                to="/bear-market"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Bear meter
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                to="/liquidation"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Liq heat
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                to="/bitcoin-etf"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                ETF absorption
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                to="/embed-kit"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <Sparkles className="h-3 w-3" />
                Embed kit
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </TooltipProvider>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div suppressHydrationWarning className="mt-1 text-sm font-semibold">
        {value}
      </div>
    </div>
  );
}

function MethodTooltip({
  title,
  summary,
  calculation,
  dataSources,
  weightLabel,
  liveDetail,
}: {
  title: string;
  summary: string;
  calculation: string;
  dataSources: string;
  weightLabel?: string;
  liveDetail?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`How ${title} is calculated`}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={8}
        className="max-w-[min(22rem,calc(100vw-2rem))] border border-border/60 bg-popover px-3.5 py-3 text-left text-popover-foreground shadow-lg"
      >
        <div className="space-y-2.5">
          <div>
            <div className="text-xs font-bold tracking-tight text-foreground">{title}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{summary}</p>
          </div>
          {weightLabel && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {weightLabel}
            </div>
          )}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              How it&apos;s calculated
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-foreground/90">{calculation}</p>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Data sources
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-foreground/90">{dataSources}</p>
          </div>
          {liveDetail && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                This reading
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-foreground/90">{liveDetail}</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function ComponentMeter({
  id,
  label,
  score,
  metric,
  detail,
}: {
  id: CycleScoreComponentId;
  label: string;
  score: number;
  metric?: string;
  detail?: string;
}) {
  const meta = CYCLE_SCORE_COMPONENT_META[id];
  const color =
    score >= 75 ? "var(--success)" : score >= 50 ? "var(--primary)" : "var(--destructive)";
  return (
    <div className="rounded-xl border border-border/40 bg-background/60 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="truncate">{label}</span>
          <MethodTooltip
            title={meta.label}
            summary={meta.summary}
            calculation={meta.calculation}
            dataSources={meta.dataSources}
            weightLabel={meta.weightLabel}
            liveDetail={detail}
          />
        </span>
        <span className="shrink-0 text-xs font-bold" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      {metric && <div className="mt-1 truncate text-[10px] text-muted-foreground">{metric}</div>}
    </div>
  );
}

function ScoreSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-end gap-4">
        <div className="h-16 w-24 rounded-xl bg-muted" />
        <div className="mb-2 space-y-2">
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
      </div>
      <div className="h-12 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
