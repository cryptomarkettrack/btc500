import { useNow } from "@/hooks/use-now";
import { BUY_POINT_LABEL, countdownParts } from "@/lib/buy-signal";

interface BuyPointCountdownProps {
  /** Compact form for the sticky bar; the hero form shows all three units. */
  compact?: boolean;
}

/**
 * Live T-minus to the fixed UTC buy point (2026-11-28T00:00:00Z).
 * The clock is browser-side: no API call, no hardcoded zero state.
 */
export function BuyPointCountdown({ compact = false }: BuyPointCountdownProps) {
  const now = useNow(30_000);
  const parts = countdownParts(now);

  if (parts.isOpen) {
    return (
      <div className={compact ? "flex items-baseline gap-2" : "mt-6"} suppressHydrationWarning>
        <span
          className={`font-data font-semibold text-success ${compact ? "text-sm" : "text-3xl sm:text-4xl"}`}
        >
          Buy window is OPEN
        </span>
        {!compact && (
          <span className="font-data mt-1 block text-xs text-muted-foreground">
            {parts.daysSince} {parts.daysSince === 1 ? "day" : "days"} since {BUY_POINT_LABEL}
          </span>
        )}
        {compact && (
          <span className="font-data text-[10px] text-muted-foreground">+{parts.daysSince}d</span>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <span
        className="font-data flex items-baseline gap-1.5 text-xs font-semibold"
        suppressHydrationWarning
      >
        <span className="text-primary">T−{parts.days}d</span>
        <span className="text-muted-foreground">
          {String(parts.hours).padStart(2, "0")}h {String(parts.minutes).padStart(2, "0")}m
        </span>
      </span>
    );
  }

  return (
    <div
      className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.06] px-5 py-4 sm:px-6"
      aria-label={`Countdown to the ${BUY_POINT_LABEL} buy point`}
    >
      <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Buy signal · T-minus to {BUY_POINT_LABEL}
      </div>
      <div className="mt-2 flex items-end gap-3 sm:gap-5" suppressHydrationWarning>
        <Unit value={parts.days} label="days" />
        <Separator />
        <Unit value={parts.hours} label="hours" />
        <Separator />
        <Unit value={parts.minutes} label="minutes" />
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-data text-3xl font-semibold leading-none tracking-tighter text-foreground sm:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-data text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="font-data pb-1 text-xl text-primary/50">:</span>;
}
