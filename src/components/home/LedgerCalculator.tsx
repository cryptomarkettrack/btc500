import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { trackCta } from "@/lib/analytics";
import type { CycleResult } from "@/lib/simulator-result";

interface LedgerCalculatorProps {
  /** Last completed window from the simulator archive (e.g. the 2020 window). */
  cycle: CycleResult | null;
}

/**
 * "Put a number on it" — interactive what-if against the last completed BTC500
 * window's real historical return. Adapted from the BTC500 growth redesign (section 04).
 */
export function LedgerCalculator({ cycle }: LedgerCalculatorProps) {
  const [amount, setAmount] = useState("10000");
  const numeric = Math.max(0, Number(amount.replace(/[^0-9]/g, "")) || 0);
  const multiplier = cycle?.returnMultiplier ?? null;
  const estimate = multiplier !== null ? Math.round(numeric * multiplier) : null;
  const returnPercent = cycle?.returnPercent ?? null;

  return (
    <div className="grid overflow-hidden rounded-[32px] border border-border/60 bg-card lg:grid-cols-2">
      <div className="p-8 sm:p-10">
        <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          04 / Put a number on it
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          What would $10,000 have done?
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          A quick look at the last completed BTC500 window. This is the useful kind of what-if:
          dated, simple, and impossible to mistake for a forecast.
        </p>
        <Link
          to="/simulator"
          onClick={() => trackCta("ledger", "/simulator")}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        >
          Open the full simulator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="bg-muted/50 p-8 sm:p-10">
        <label
          htmlFor="home-ledger-amount"
          className="font-data text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Hypothetical starting amount
        </label>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
              $
            </span>
            <input
              id="home-ledger-amount"
              inputMode="numeric"
              autoComplete="off"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))}
              className="font-data w-full rounded-xl border border-border bg-background py-3 pr-4 pl-8 text-xl font-semibold tracking-tight outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Hypothetical starting amount in dollars"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-border/60 pt-5">
          <p className="font-data text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Illustrative result{cycle ? ` · ${cycle.label} window` : ""}
          </p>
          <p className="font-data mt-2 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            {estimate !== null ? formatUsd(estimate) : "—"}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {cycle && returnPercent !== null
              ? `Based on the ${cycle.label} window's historical ${
                  returnPercent > 0 ? "+" : ""
                }${returnPercent.toFixed(0)}% return (buy ${formatDay(cycle.buyDate)} → sell ${formatDay(
                  cycle.sellDate,
                )}). Not a prediction.`
              : "Completed-window data is loading. Not a prediction."}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
