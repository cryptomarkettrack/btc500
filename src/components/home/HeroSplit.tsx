import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, LineChart } from "lucide-react";
import { Btc500Hero } from "@/components/Btc500Hero";
import { trackCta } from "@/lib/analytics";
import { formatUsd } from "@/lib/format";
import type { HomeAnswer } from "@/lib/home-answer";
import type { CycleInfo } from "@/lib/phase";

interface HeroSplitProps {
  answer: HomeAnswer;
  cycle: CycleInfo;
  price: number | null;
  countdownValue: number;
  countdownLabel: string;
  isSellActive: boolean;
  buyDays: number;
}

/**
 * The hero, dealt by taste-skill as a split: the words on the left, the real
 * thing — the live cycle map — on the right, both whole on the first screen.
 * It enters once on load (data-enter) and never again.
 */
export function HeroSplit({
  answer,
  cycle,
  price,
  countdownValue,
  countdownLabel,
  isSellActive,
  buyDays,
}: HeroSplitProps) {
  const accent = isSellActive ? "var(--success)" : "var(--primary)";

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-53px)] flex-col justify-center overflow-hidden"
      aria-label="BTC500 in one screen"
    >
      <div className="hero-ground" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-8 pb-16 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-16 lg:pb-24">
        {/* ---- words ---- */}
        <div className="lg:col-span-6 lg:pt-4">
          <p
            data-enter
            style={{ "--enter-delay": "60ms" } as React.CSSProperties}
            className="font-data flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span className="text-primary">{answer.eyebrow}</span>
          </p>

          <h1
            data-enter
            style={{ "--enter-delay": "140ms" } as React.CSSProperties}
            className="mt-5 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.1rem]"
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
              Run $10,000 through the cycle
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
              <span className="font-data inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                <i className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                live
              </span>
            </div>

            {/* the number the visitor came for */}
            <div className="flex items-end justify-between gap-4 px-5 pt-5">
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
              <Btc500Hero price={price} daysLeft={buyDays} compact />
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
