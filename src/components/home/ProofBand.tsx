import { Info } from "lucide-react";

interface ProofBandProps {
  totalCompleted: number;
  profitable: number;
  avgReturn: number | null;
  bestReturn: number | null;
}

/**
 * "The record" — dark proof band with the real completed-cycle stats from the
 * simulator archive. Adapted from the BTC500 growth redesign (section 02).
 */
export function ProofBand({ totalCompleted, profitable, avgReturn, bestReturn }: ProofBandProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-foreground px-6 py-12 text-background sm:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            02 / The record
          </p>
          <h2
            id="record-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-background sm:text-4xl"
          >
            The rule has a history.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-background/70">
            Every completed BTC500 window in the archive finished higher at T+500. Exact dates,
            exact prices, open assumptions. Start with the record, then make up your own mind.
          </p>
        </div>
        <div className="grid content-center gap-6 sm:grid-cols-3 lg:gap-4">
          <div>
            <div className="text-3xl font-bold text-primary sm:text-4xl">
              {totalCompleted > 0 ? `${profitable}/${totalCompleted}` : "—"}
            </div>
            <div className="font-data mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-background/60">
              Completed cycles higher
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary sm:text-4xl">
              {avgReturn !== null ? `${avgReturn > 0 ? "+" : ""}${avgReturn.toFixed(0)}%` : "—"}
            </div>
            <div className="font-data mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-background/60">
              Avg return per cycle
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary sm:text-4xl">
              {bestReturn !== null ? `${bestReturn > 0 ? "+" : ""}${bestReturn.toFixed(0)}%` : "—"}
            </div>
            <div className="font-data mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-background/60">
              Best completed window
            </div>
          </div>
        </div>
      </div>
      <p className="font-data mt-10 flex items-start gap-2 text-[10px] leading-relaxed text-background/55">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Past performance is not a guarantee of future results. BTC500 is educational software, not
        financial advice.
      </p>
    </div>
  );
}
