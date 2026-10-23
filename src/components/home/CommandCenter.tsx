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
import { BtcLogo } from "@/components/BtcLogo";

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

function phaseLabel(cycle: CycleInfo, isBuyActive: boolean, isSellActive: boolean): string {
  if (isBuyActive) return "Buy window open";
  if (isSellActive) return "Hold → sell window";
  if (cycle.phase === "wait-buy") return "Waiting to buy";
  if (cycle.phase === "wait-sell") return "Waiting to sell";
  return "Cycle complete";
}

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
  const accent =
    cycle.phase === "wait-sell"
      ? { color: "var(--success)", soft: "var(--success-soft)" }
      : cycle.phase === "done"
        ? { color: "var(--muted-foreground)", soft: "var(--muted)" }
        : { color: "var(--primary)", soft: "var(--primary-soft)" };

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)]">
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
        {price != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
            BTC {formatUsd(price)}
          </span>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left: countdown */}
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
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-out"
              style={{
                background: isSellActive ? "var(--success)" : "var(--primary)",
                width: `${(cycle.phase === "wait-sell" ? cycle.sellProgress : buyProgress) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Right: dates + block progress */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <MiniStat icon={Calendar} label="Next halving" value={formatDate(cycle.nextHalving)} />
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

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
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
