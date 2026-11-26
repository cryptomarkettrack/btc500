import { Link } from "@tanstack/react-router";
import { BacktestTable } from "./BacktestTable";
import { BuyPointCountdown } from "./BuyPointCountdown";
import { SignalContextStrip } from "./SignalContextStrip";
import { SignalShareRow } from "./SignalShareRow";
import { StickySignalBar } from "./StickySignalBar";
import type { BacktestRow } from "@/lib/buy-signal";
import type { SignalPriceData } from "@/lib/buy-signal.functions";
import { BUY_POINT_H1, BUY_POINT_LEAD, BUY_POINT_SECTIONS } from "@/lib/buy-point-copy";

interface BuyPointPageProps {
  signal: SignalPriceData;
  rows: readonly BacktestRow[];
}

/** /is-now-the-buy-point — the shareable, answer-engine-friendly landing page. */
export function BuyPointPage({ signal, rows }: BuyPointPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickySignalBar />

      <header className="relative isolate overflow-hidden border-b border-white/10">
        <div className="hero-ground" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <p className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Live buy signal · 500 days before the halving
          </p>
          <h1 className="mt-5 text-[2.4rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
            {BUY_POINT_H1}
          </h1>
          <p
            id="answer"
            className="lead mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {BUY_POINT_LEAD}
          </p>

          <BuyPointCountdown />
          <SignalContextStrip signal={signal} />
          <SignalShareRow />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24">
        {BUY_POINT_SECTIONS.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="pt-14 sm:pt-20"
          >
            <h2
              id={`${section.id}-heading`}
              className="text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl"
            >
              {section.question}
            </h2>
            <p className="lead mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              {renderAnswer(section.answer)}
            </p>

            {index === 1 && (
              <div className="mt-6">
                <SignalContextStrip signal={signal} />
              </div>
            )}
            {index === 2 && (
              <div className="mt-8">
                <BacktestTable rows={rows} />
              </div>
            )}
          </section>
        ))}

        <div className="mt-20 border-t border-white/10 pt-8">
          <SignalShareRow />
          <p className="font-data mt-6 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Source: BTC500 daily-close archive · past performance does not guarantee future results
          </p>
        </div>
      </main>
    </div>
  );
}

/** Keep the visible section-6 text byte-identical to the FAQPage schema answer. */
function renderAnswer(answer: string) {
  const marker = "/halving-dates";
  const [before, after] = answer.split(marker);
  if (after === undefined) return answer;
  return (
    <>
      {before}
      <Link
        to="/halving-dates"
        className="text-primary underline decoration-primary/40 underline-offset-2"
      >
        {marker}
      </Link>
      {after}
    </>
  );
}
