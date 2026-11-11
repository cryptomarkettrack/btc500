import type { CycleInfo } from "@/lib/phase";

interface RuleDiagramProps {
  cycle: CycleInfo;
  /** Days from today to the buy date (0 once the window has opened). */
  buyDays: number;
  /** Days from today to the sell date. */
  sellDays: number;
  /** Days from today to the next halving. */
  daysUntilHalving: number;
  isBuyActive: boolean;
  isSellActive: boolean;
}

const WINDOW_DAYS = 1000;

/**
 * The rule as one diagram: buy at T−500, the halving in the middle, sell at
 * T+500 — with the real dates and the live position on the rail.
 */
export function RuleDiagram({
  cycle,
  buyDays,
  sellDays,
  daysUntilHalving,
  isBuyActive,
  isSellActive,
}: RuleDiagramProps) {
  // Where today sits inside the 1000-day window that runs from the buy date to
  // the sell date. Before the buy date the marker rests on the buy node.
  const daysSinceBuy = isSellActive
    ? WINDOW_DAYS - sellDays
    : isBuyActive
      ? 500 - daysUntilHalving
      : -buyDays;
  const position = Math.min(100, Math.max(0, (daysSinceBuy / WINDOW_DAYS) * 100));
  // The rail runs from the buy node (16.67%) to the sell node (83.33%).
  const railFrom = 16.6667;
  const railTo = 83.3333;
  const railWidth = railTo - railFrom;
  const marker = railFrom + (position / 100) * railWidth;

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-[var(--panel)] px-5 py-8 sm:px-8 sm:py-10">
      {/* ---- the rail ---- */}
      <div className="relative hidden sm:block">
        <div
          className="absolute top-[7px] h-px bg-white/15"
          style={{ left: `${railFrom}%`, right: `${100 - railTo}%` }}
        />
        <div
          className="absolute top-[7px] h-px bg-primary transition-[width] duration-1000"
          style={{ left: `${railFrom}%`, width: `${Math.max(0, (position / 100) * railWidth)}%` }}
        />

        {/* live position */}
        <div
          className="absolute -top-2 transition-[left] duration-1000"
          style={{ left: `${marker}%` }}
        >
          <span className="flex -translate-x-1/2 flex-col items-center">
            <span className="font-data rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] whitespace-nowrap text-primary uppercase">
              now
            </span>
            <span className="mt-1 h-4 w-px bg-primary/70" />
          </span>
        </div>

        <div className="relative h-32">
          <Node
            label="Buy"
            offset="T−500"
            date={formatDay(cycle.buyDate)}
            state={isBuyActive ? "now" : "done"}
            at={railFrom}
          />
          <Node
            label="Halving"
            offset="block event"
            date={formatDay(cycle.nextHalving)}
            state={isSellActive ? "done" : "next"}
            at={50}
          />
          <Node
            label="Sell"
            offset="T+500"
            date={formatDay(cycle.sellDate)}
            state={isSellActive ? "now" : "future"}
            at={railTo}
          />
        </div>
      </div>

      {/* ---- the same three dates, stacked on a phone ---- */}
      <dl className="space-y-3 sm:hidden">
        <Row label="Buy" offset="T−500" date={formatDay(cycle.buyDate)} accent={isBuyActive} />
        <Row label="Halving" offset="block event" date={formatDay(cycle.nextHalving)} />
        <Row label="Sell" offset="T+500" date={formatDay(cycle.sellDate)} accent={isSellActive} />
      </dl>
    </div>
  );
}

function Node({
  label,
  offset,
  date,
  state,
  at,
}: {
  label: string;
  offset: string;
  date: string;
  state: "done" | "now" | "next" | "future";
  at: number;
}) {
  const dot =
    state === "future"
      ? "border-white/25 bg-[var(--panel)]"
      : state === "now"
        ? "border-primary bg-primary shadow-[0_0_0_6px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
        : "border-primary/70 bg-[var(--panel)]";

  return (
    <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${at}%` }}>
      <span className={`mx-auto block h-3.5 w-3.5 rounded-full border-2 ${dot}`} />
      <div className="mt-3">
        <div className="font-data text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {offset}
        </div>
        <div className="mt-1 text-base font-semibold text-foreground">{label}</div>
        <div className="font-data mt-0.5 text-[12px] whitespace-nowrap text-muted-foreground">
          {date}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  offset,
  date,
  accent,
}: {
  label: string;
  offset: string;
  date: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3 last:border-0">
      <dt className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="font-data text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          {offset}
        </span>
      </dt>
      <dd
        className="font-data text-[12px]"
        style={accent ? { color: "var(--primary)" } : undefined}
      >
        {date}
      </dd>
    </div>
  );
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
