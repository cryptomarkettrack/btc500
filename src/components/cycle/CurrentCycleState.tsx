import { Calendar, Clock, Shield, Target } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CycleInfo } from "@/lib/phase";
import { formatUsd } from "@/lib/format";

interface CurrentCycleStateProps {
  cycle: CycleInfo;
  price: number | null;
  height: number;
  nextHalvingBlock: number;
}

function formatUtcDay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function phaseCopy(cycle: CycleInfo): { label: string; detail: string; days: number } {
  if (cycle.phase === "wait-buy") {
    return {
      label: "Waiting to buy",
      detail: "Days until T-500",
      days: cycle.daysUntilBuy,
    };
  }
  if (cycle.phase === "wait-sell") {
    return {
      label: nowAfterHalving(cycle) ? "Hold through T+500" : "Hold through the halving",
      detail: "Days until T+500",
      days: cycle.daysUntilSell,
    };
  }
  return {
    label: "Window complete",
    detail: "This 500-day window has closed",
    days: 0,
  };
}

function nowAfterHalving(cycle: CycleInfo): boolean {
  return cycle.now >= cycle.nextHalving;
}

export function CurrentCycleState({
  cycle,
  price,
  height,
  nextHalvingBlock,
}: CurrentCycleStateProps) {
  const phase = phaseCopy(cycle);

  return (
    <section
      aria-labelledby="current-cycle-heading"
      className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="current-cycle-heading" className="text-sm font-semibold text-foreground">
            Current 500-day cycle
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{phase.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {price != null && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              BTC {formatUsd(price)}
            </span>
          )}
          <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            Live
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <Clock className="mb-1 h-5 w-5 text-primary" aria-hidden="true" />
        <span
          suppressHydrationWarning
          className="text-6xl font-bold leading-none tracking-tighter text-primary sm:text-7xl"
        >
          {phase.days.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{phase.detail}</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniDate icon={Target} label="T-500" value={formatUtcDay(cycle.buyDate)} />
        <MiniDate icon={Calendar} label="Next halving" value={formatUtcDay(cycle.nextHalving)} />
        <MiniDate icon={Shield} label="T+500" value={formatUtcDay(cycle.sellDate)} />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Block {height.toLocaleString()} of {nextHalvingBlock.toLocaleString()}. The live countdown
        lives on the{" "}
        <Link to="/" className="font-semibold text-primary hover:underline">
          homepage
        </Link>
        . Dates move if Bitcoin blocks come in faster or slower than ten minutes.
      </p>
    </section>
  );
}

function MiniDate({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/60 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
