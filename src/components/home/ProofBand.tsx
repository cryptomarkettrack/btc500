import { Info } from "lucide-react";
import { CounterRoll } from "@/components/home/CounterRoll";

interface ProofBandProps {
  totalCompleted: number;
  profitable: number;
  avgReturn: number | null;
  bestReturn: number | null;
}

/**
 * "The record" — the archive's completed windows, as proof figures that roll
 * once when the row comes on screen (the counter-rolls moment).
 */
export function ProofBand({ totalCompleted, profitable, avgReturn, bestReturn }: ProofBandProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] px-6 py-12 sm:px-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 100% at 12% 0%, color-mix(in oklab, var(--primary) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            02 / The record
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl">
            The rule has a history.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Every completed BTC500 window in the archive finished higher at T+500. Exact dates,
            exact prices, open assumptions. Read the record first, then make up your own mind.
          </p>
        </div>

        <div className="grid content-center gap-6 sm:grid-cols-3 lg:gap-4">
          <div className="border-t border-white/10 pt-4">
            <div className="font-data text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {totalCompleted > 0 ? (
                <>
                  <CounterRoll value={profitable} />
                  <span className="text-muted-foreground">/{totalCompleted}</span>
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="font-data mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Completed cycles higher
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="font-data text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {avgReturn !== null ? (
                <CounterRoll
                  value={avgReturn}
                  decimals={0}
                  prefix={avgReturn > 0 ? "+" : ""}
                  suffix="%"
                />
              ) : (
                "—"
              )}
            </div>
            <div className="font-data mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Avg return per cycle
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="font-data text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {bestReturn !== null ? (
                <CounterRoll
                  value={bestReturn}
                  decimals={0}
                  prefix={bestReturn > 0 ? "+" : ""}
                  suffix="%"
                />
              ) : (
                "—"
              )}
            </div>
            <div className="font-data mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Best completed window
            </div>
          </div>
        </div>
      </div>

      <p className="font-data relative mt-10 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Past performance is not a guarantee of future results. BTC500 is educational software, not
        financial advice.
      </p>
    </div>
  );
}
