import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, LineChart } from "lucide-react";
import { Btc500Hero } from "@/components/Btc500Hero";
import { BuyPointCountdown } from "@/components/signal/BuyPointCountdown";
import { trackCta } from "@/lib/analytics";
import { formatUsd } from "@/lib/format";
import type { HomeAnswer } from "@/lib/home-answer";
import type { CycleInfo } from "@/lib/phase";
import type { LivePnl } from "@/lib/live-pnl";
import { BUY_POINT_LABEL } from "@/lib/buy-signal";

interface HeroSplitProps {
  answer: HomeAnswer;
  cycle: CycleInfo;
  price: number | null;
  countdownValue: number;
  countdownLabel: string;
  isSellActive: boolean;
  buyDays: number;
  sellDays: number;
  /** Live paper position, passed in already computed from the buy point onward. */
  pnl: LivePnl;
  /** The T−500 instant is in the past and the T+500 exit has not fired yet. */
  isPositionOpen: boolean;
}

/**
 * The first screen. Once the T−500 buy point has passed the page leads with the
 * live P&L — the number a returning visitor came to check — and the calendar
 * answer follows underneath. Before the buy point the countdown keeps the lead.
 */
export function HeroSplit({
  answer,
  cycle,
  price,
  countdownValue,
  countdownLabel,
  isSellActive,
  buyDays,
  sellDays,
  pnl,
  isPositionOpen,
}: HeroSplitProps) {
  const showingPnL =
    isPositionOpen &&
    pnl.state === "open" &&
    pnl.profitUSD !== null &&
    pnl.returnFraction !== null &&
    pnl.entryPriceUSD !== null &&
    pnl.currentPriceUSD !== null;
  const pnlColor = pnl.isProfit ? "var(--success)" : "var(--destructive)";
  const pnlSign = pnl.isProfit ? "+" : "−";
  const accent = showingPnL ? pnlColor : isSellActive ? "var(--success)" : "var(--primary)";
  const windowTotal = pnl.daysHeld + cycle.daysUntilSell;
  const windowProgress = windowTotal > 0 ? (pnl.daysHeld / windowTotal) * 100 : 0;

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-53px)] flex-col justify-center overflow-hidden"
      aria-label="BTC500 in one screen"
    >
      <div className="hero-ground" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-8 pb-16 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-16 lg:pb-24">
        {/* ---- words: P&L first once the position is open ---- */}
        <div className="lg:col-span-6 lg:pt-4">
          {showingPnL ? (
            <div
              data-enter
              style={{ "--enter-delay": "40ms" } as React.CSSProperties}
              className="mb-7 -mt-1 border-b border-white/10 pb-7 sm:mb-9"
              aria-label="Live paper position P&L"
            >
              <div className="flex flex-wrap items-center gap-2">
                <i
                  className="pulse-dot h-1.5 w-1.5 rounded-full"
                  style={{ background: pnlColor }}
                />
                <span className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Live P&amp;L · {formatUsd(pnl.notionalUSD)} paper buy
                </span>
                <span
                  className="font-data rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: pnlColor, borderColor: pnlColor }}
                >
                  Position open
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1">
                <span
                  suppressHydrationWarning
                  className="font-data text-[clamp(3.25rem,11vw,6rem)] leading-[0.85] font-semibold tracking-[-0.055em] tabular-nums"
                  style={{ color: pnlColor }}
                >
                  {pnlSign}
                  {formatUsd(Math.abs(pnl.profitUSD!))}
                </span>
                <span
                  suppressHydrationWarning
                  className="font-data pb-1 text-2xl font-semibold tabular-nums sm:text-3xl"
                  style={{ color: pnlColor }}
                >
                  {pnlSign}
                  {(Math.abs(pnl.returnFraction!) * 100).toFixed(2)}%
                </span>
              </div>

              <p
                suppressHydrationWarning
                className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground"
              >
                Bought <strong className="font-semibold text-foreground">{BUY_POINT_LABEL}</strong>{" "}
                at {formatUsd(pnl.entryPriceUSD!)} · BTC now {formatUsd(pnl.currentPriceUSD!)} · day{" "}
                {pnl.daysHeld.toLocaleString()} of {windowTotal.toLocaleString()} held.
              </p>

              <div
                className="mt-4 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Progress through the 500-day holding window"
                aria-valuenow={Math.round(windowProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-out"
                  style={{ background: pnlColor, width: `${Math.max(windowProgress, 1)}%` }}
                />
              </div>
              <p className="font-data mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Unrealized · marked live · paper only, not financial advice
              </p>
            </div>
          ) : isPositionOpen ? (
            <div
              data-enter
              style={{ "--enter-delay": "40ms" } as React.CSSProperties}
              className="mb-7 border-b border-white/10 pb-7"
            >
              <p className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Live P&amp;L · {formatUsd(pnl.notionalUSD)} paper buy
              </p>
              <div
                className="mt-3 h-14 w-56 animate-pulse rounded-xl bg-muted"
                aria-label="P&L loading"
              />
              <p className="mt-2 text-xs text-muted-foreground">{pnl.statusNote}</p>
            </div>
          ) : null}

          <p
            data-enter
            style={{ "--enter-delay": "60ms" } as React.CSSProperties}
            className="font-data flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span className={showingPnL ? "text-success" : "text-primary"}>{answer.eyebrow}</span>
          </p>

          <h1
            data-enter
            style={{ "--enter-delay": "140ms" } as React.CSSProperties}
            className={`mt-5 font-semibold tracking-[-0.03em] text-balance ${
              showingPnL
                ? "text-3xl leading-[1.08] sm:text-4xl lg:text-[3.25rem]"
                : "text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.1rem]"
            }`}
            dangerouslySetInnerHTML={{ __html: answer.h1Html }}
          />

          <p
            data-enter
            style={{ "--enter-delay": "220ms" } as React.CSSProperties}
            id="hero-tagline"
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            <strong className="font-semibold text-foreground">{answer.leadAnswer}</strong>{" "}
            {answer.leadRest}
          </p>

          {!isPositionOpen && (
            <div data-enter style={{ "--enter-delay": "280ms" } as React.CSSProperties}>
              <BuyPointCountdown />
            </div>
          )}

          <div
            data-enter
            style={{ "--enter-delay": "300ms" } as React.CSSProperties}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/simulator"
              onClick={() => trackCta("hero", "/simulator")}
              className="press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_var(--primary)] hover:shadow-[0_16px_40px_-14px_var(--primary)]"
            >
              <Calculator className="h-4 w-4" />
              Run $50,000 through the cycle
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/timeline"
              onClick={() => trackCta("hero", "/timeline")}
              className="press inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"
            >
              <LineChart className="h-4 w-4" />
              Replay the timeline
            </Link>
          </div>

          <p
            data-enter
            style={{ "--enter-delay": "380ms" } as React.CSSProperties}
            className="font-data mt-6 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            Free · No account · Dates from block height
          </p>
        </div>

        {/* ---- the real thing ---- */}
        <div
          data-enter
          style={{ "--enter-delay": "240ms" } as React.CSSProperties}
          className="lg:col-span-6"
        >
          <div className="relative rounded-2xl border border-white/10 bg-[color-mix(in_oklab,var(--panel)_92%,transparent)] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] backdrop-blur-sm">
            {/* window bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                btc500 / cycle map
              </span>
              <span className="font-data inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                <i
                  className="pulse-dot h-1.5 w-1.5 rounded-full"
                  aria-hidden="true"
                  style={{ background: accent }}
                />
                live
              </span>
            </div>

            {/* the number the visitor came for */}
            <div className="flex items-end justify-between gap-4 px-5 pt-5">
              {showingPnL ? (
                <div>
                  <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Unrealized P&amp;L
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      suppressHydrationWarning
                      className="font-data text-4xl font-semibold leading-none tracking-tighter tabular-nums sm:text-5xl"
                      style={{ color: pnlColor }}
                    >
                      {pnlSign}
                      {formatUsd(Math.abs(pnl.profitUSD!))}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="ml-1 text-lg font-semibold tabular-nums"
                      style={{ color: pnlColor }}
                    >
                      {pnlSign}
                      {(Math.abs(pnl.returnFraction!) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : isPositionOpen ? (
                <div>
                  <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Unrealized P&amp;L
                  </div>
                  <div className="mt-1 h-12 w-48 animate-pulse rounded-full bg-muted" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded-full bg-muted/50" />
                </div>
              ) : (
                <div>
                  <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {countdownLabel}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      suppressHydrationWarning
                      className="font-data text-5xl font-semibold leading-none tracking-tighter sm:text-6xl"
                      style={{ color: accent }}
                    >
                      {countdownValue.toLocaleString()}
                    </span>
                    <span className="font-data text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              )}
              <div className="text-right">
                <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  BTC / USD
                </div>
                <div suppressHydrationWarning className="font-data mt-1 text-lg font-semibold">
                  {price !== null ? formatUsd(price) : "—"}
                </div>
              </div>
            </div>

            {/* the cycle chart */}
            <div className="px-2 pt-2 pb-1 sm:px-4">
              <Btc500Hero
                price={price}
                daysLeft={buyDays}
                daysUntilSell={sellDays}
                buyDateLabel={formatDay(cycle.buyDate)}
                phase={cycle.phase}
                compact
                countdown={
                  <div
                    className="w-full text-center"
                    style={{
                      fontFamily: '"Space Grotesk", system-ui, sans-serif',
                      fontSize: "13px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                      color: showingPnL ? pnlColor : undefined,
                    }}
                  >
                    {showingPnL
                      ? `P&L ${pnlSign}${formatUsd(Math.abs(pnl.profitUSD!))} (${pnlSign}${(Math.abs(pnl.returnFraction!) * 100).toFixed(2)}%) · ${pnl.daysHeld.toLocaleString()} days held`
                      : `${countdownLabel}: ${countdownValue} days`}
                  </div>
                }
              />
            </div>

            {/* the three dated facts */}
            <dl className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
              <Fact label="Next halving" value={formatDay(cycle.nextHalving)} />
              <Fact label="Buy date" value={formatDay(cycle.buyDate)} accent />
              <Fact label="Sell date" value={formatDay(cycle.sellDate)} />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-3.5">
      <dt className="font-data text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className="font-data mt-1 text-[13px] font-semibold"
        style={accent ? { color: "var(--primary)" } : undefined}
      >
        {value}
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
