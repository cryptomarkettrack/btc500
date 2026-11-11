import {
  Calendar,
  Clock,
  Layers,
  Target,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd, formatUtc } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

interface CommandCenterProps {
  cycle: CycleInfo;
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

function cycleLabel(phase: string): string {
  if (phase === "done") return "complete";
  if (phase === "wait-buy") return "waiting to buy";
  if (phase === "wait-sell") return "waiting to sell";
  return phase;
}

function phaseLabel(cycle: CycleInfo, isBuyActive: boolean, isSellActive: boolean): string {
  if (isBuyActive) return "Buy window open";
  if (isSellActive) return "Hold → sell window";
  if (cycle.phase === "wait-buy") return "Waiting to buy";
  if (cycle.phase === "wait-sell") return "Waiting to sell";
  return "Cycle complete";
}

/**
 * The product's own window: today's read of the cycle, the three dated facts
 * and the block progress toward the next halving.
 */
export function CommandCenter({
  cycle,
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
  const primaryDays = cycle.phase === "wait-sell" ? sellDays : buyDays;
  const primaryLabel =
    cycle.phase === "wait-sell"
      ? "Days to sell"
      : cycle.phase === "done"
        ? "Cycle done"
        : "Days to buy";
  const accent = cycle.phase === "wait-sell" ? "var(--success)" : "var(--primary)";

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
      {/* header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Activity className="h-4 w-4" style={{ color: accent }} />
          </span>
          <div>
            <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              btc500 / command center
            </div>
            <div className="text-sm font-semibold text-foreground">
              Today&apos;s read · {phaseLabel(cycle, isBuyActive, isSellActive)}
            </div>
          </div>
        </div>
        {price != null && (
          <span className="font-data rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-foreground">
            BTC {formatUsd(price)}
          </span>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left: the countdown */}
        <div className="border-b border-white/10 p-6 sm:p-8 lg:border-r lg:border-b-0">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10">
              <Clock className="h-4 w-4" style={{ color: accent }} />
            </span>
            <div>
              <div
                className="font-data text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: accent }}
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
              className="font-data text-6xl leading-[0.9] font-semibold tracking-tighter sm:text-7xl"
              style={{ color: accent }}
            >
              {primaryDays.toLocaleString()}
            </span>
            <span className="pb-2 text-lg font-medium text-muted-foreground">days</span>
          </div>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-out"
              style={{
                background: accent,
                width: `${(cycle.phase === "wait-sell" ? cycle.sellProgress : buyProgress) * 100}%`,
              }}
            />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat icon={Clock} label="Days to sell" value={`${sellDays.toLocaleString()} d`} />
            <MiniStat icon={Calendar} label="Next halving" value={formatDate(cycle.nextHalving)} />
            <MiniStat icon={Activity} label="Cycle" value={cycleLabel(cycle.phase)} />
          </dl>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The dates do not move with the price. They come from the block schedule — which is why
            they can be checked before they are traded.
          </p>
        </div>

        {/* Right: dates + block progress */}
        <div className="flex flex-col p-6 sm:p-8">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <MiniStat icon={Calendar} label="Next halving" value={formatDate(cycle.nextHalving)} />
            <MiniStat icon={Target} label="Buy date" value={formatDate(cycle.buyDate)} />
            <MiniStat icon={Shield} label="Sell date" value={formatDate(cycle.sellDate)} />
          </dl>

          <div className="mt-5 rounded-xl border border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
            <div className="font-data mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>{height.toLocaleString()}</span>
              <span>{blocksRemaining.toLocaleString()} left</span>
              <span>{nextHalvingBlock.toLocaleString()}</span>
            </div>
            <div className="font-data mt-1 text-[10px] text-muted-foreground">
              {formatUtc(cycle.nextHalving)} · last halving block{" "}
              {lastHalvingBlock.toLocaleString()}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Link
              to="/liquidation"
              className="press inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              Liq heat
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/bitcoin-etf"
              className="press inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              ETF absorption
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/embed-kit"
              className="press inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Embed kit
            </Link>
          </div>
        </div>
      </div>
    </section>
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
    <div className="rounded-xl border border-white/10 px-3 py-2.5">
      <dt className="font-data flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </dt>
      <dd suppressHydrationWarning className="font-data mt-1 text-sm font-semibold">
        {value}
      </dd>
    </div>
  );
}
