import type { BacktestRow } from "@/lib/buy-signal";

/**
 * The completed-window record. Every cell comes from the repo's daily-close
 * archive via the simulator result; an absent print is rendered as `—`.
 */
export function BacktestTable({
  rows,
  caption = true,
}: {
  rows: readonly BacktestRow[];
  caption?: boolean;
}) {
  return (
    <div>
      {caption && (
        <p className="font-data mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Buy = 500 days before halving · Sell = 500 days after · daily closes
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[var(--panel)]">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {[
                "Cycle",
                "Halving",
                "Buy date (500d before)",
                "Price at buy",
                "Sell date (500d after)",
                "Price at sell",
                "Multiple",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="font-data px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  Backtest data is unavailable.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.cycle} className="border-b border-white/5 last:border-0">
                <th scope="row" className="font-data px-4 py-3 font-semibold text-primary">
                  {row.cycle}
                </th>
                <td className="font-data px-4 py-3 text-muted-foreground">{row.halving}</td>
                <td className="font-data px-4 py-3">{row.buyDate}</td>
                <td className="font-data px-4 py-3">{row.buyPrice}</td>
                <td className="font-data px-4 py-3">{row.sellDate}</td>
                <td className="font-data px-4 py-3">{row.sellPrice}</td>
                <td className="font-data px-4 py-3 font-semibold text-success">{row.multiple}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
