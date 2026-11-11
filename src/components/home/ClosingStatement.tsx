import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, BookOpen } from "lucide-react";
import { trackCta } from "@/lib/analytics";

/**
 * The closing section, and the second dealt moment: "line-carries-colour".
 * The section sits on a new ground edge to edge; inside it an inset panel in the
 * old ground is cleared by a one-pixel accent line that climbs through it, and
 * the words follow the line up.
 */
export function ClosingStatement() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 120% at 50% 0%, color-mix(in oklab, var(--primary) 20%, transparent) 0%, transparent 70%), linear-gradient(180deg, var(--background) 0%, color-mix(in oklab, var(--primary) 8%, var(--background)) 50%, var(--background) 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-20 sm:pt-10 sm:pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] px-6 py-14 sm:px-14 sm:py-16">
          {/* the line that carries the colour up the panel */}
          <span
            aria-hidden="true"
            className="carry-line absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary to-primary"
          />

          <div className="carry-words mx-auto max-w-2xl text-center">
            <p
              className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              One rule · every cycle since 2012
            </p>
            <h2
              className="mt-4 text-3xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Trade the calendar,
              <br className="hidden sm:block" /> not the noise.
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Put any amount through the BTC500 windows — 500 days before each halving, 500 days
              after — and see what the calendar would have done with it. Real prices, dated windows,
              no forecast.
            </p>
            <div
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <Link
                to="/simulator"
                onClick={() => trackCta("closing", "/simulator")}
                className="press inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_var(--primary)]"
              >
                <Calculator className="h-4 w-4" />
                Simulate my returns
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/articles/btc500-strategy"
                onClick={() => trackCta("closing", "/articles/btc500-strategy")}
                className="press inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Read the strategy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
