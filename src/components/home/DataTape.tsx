import { formatUsd } from "@/lib/format";

interface DataTapeProps {
  price: number | null;
  nextHalving: Date;
  score: number | null;
  height: number;
  buyDays: number;
  sellDays: number;
  isBuyActive: boolean;
  isSellActive: boolean;
  phaseDone: boolean;
  daysUntilNextCycleBuy: number;
}

function TapeStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {label}{" "}
      {/* The tape is a dark strip in both themes, so the light-mode primary
          (#bc4200) fails contrast here. Use a light orange scoped to the strip. */}
      <b className="font-semibold text-[oklch(0.82_0.15_65)]">{value}</b>
    </span>
  );
}

/**
 * Dark full-bleed "tape" strip under the hero — live market + network state at a glance.
 * Adapted from the BTC500 growth redesign; all values come from live queries, not mocks.
 */
export function DataTape({
  price,
  nextHalving,
  score,
  height,
  buyDays,
  sellDays,
  isBuyActive,
  isSellActive,
  phaseDone,
  daysUntilNextCycleBuy,
}: DataTapeProps) {
  const halvingLabel = `${nextHalving.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })} est.`;
  const countdown = isBuyActive
    ? "Buy window open"
    : isSellActive
      ? `${sellDays}d to sell`
      : phaseDone
        ? `${daysUntilNextCycleBuy}d to buy`
        : `${buyDays}d to buy`;

  return (
    <section
      aria-label="Live Bitcoin market and network data"
      className="overflow-hidden rounded-2xl bg-foreground text-background"
    >
      <div className="font-data mx-auto flex max-w-6xl items-center gap-8 overflow-x-auto px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] whitespace-nowrap">
        <TapeStat label="BTC / USD" value={price !== null ? formatUsd(price) : "—"} />
        <TapeStat label="Next halving" value={halvingLabel} />
        <TapeStat label="Cycle score" value={score !== null ? `${Math.round(score)}/100` : "—"} />
        <TapeStat label="Block height" value={height.toLocaleString("en-US")} />
        <TapeStat label="Countdown" value={countdown} />
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" /> Live
        </span>
      </div>
    </section>
  );
}
