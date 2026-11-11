import { formatUsd } from "@/lib/format";

interface DataTapeProps {
  price: number | null;
  nextHalving: Date;
  height: number;
  buyDays: number;
  sellDays: number;
  isBuyActive: boolean;
  isSellActive: boolean;
  phaseDone: boolean;
  daysUntilNextCycleBuy: number;
}

function TapeStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <span className="text-muted-foreground">{label}</span>
      <b className={`font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{value}</b>
    </span>
  );
}

/**
 * The live tape under the hero: market price, next halving, block height and
 * the countdown, all from live queries. Dark strip, hairline dividers, one
 * breathing "live" dot.
 */
export function DataTape({
  price,
  nextHalving,
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
      className="border-y border-white/10 bg-[var(--panel)]"
    >
      <div className="font-data mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.14em] whitespace-nowrap">
        <TapeStat label="BTC / USD" value={price !== null ? formatUsd(price) : "—"} accent />
        <TapeStat label="Next halving" value={halvingLabel} />
        <TapeStat label="Block height" value={height.toLocaleString("en-US")} />
        <TapeStat label="Countdown" value={countdown} />
        <span className="inline-flex shrink-0 items-center gap-2 text-primary">
          <i className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Live
        </span>
      </div>
    </section>
  );
}
