import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  BarChart3,
  ArrowRight,
  CalendarDays,
  Calculator,
} from "lucide-react";
import { formatUsd } from "@/lib/format";
import { dcaQuery, simulatorQuery } from "@/lib/queries";
import {
  buildCycleComparisons,
  computeDcaTotals,
} from "@/lib/dca-compare";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback } from "react";

export function DcaComparisonPage() {
  const [investmentStr, setInvestmentStr] = useState("10000");
  const [dcaBuyDaysStr, setDcaBuyDaysStr] = useState("30");
  const [dcaSellDaysStr, setDcaSellDaysStr] = useState("0");

  // Committed values — only updated when "Calculate" is clicked
  const [committed, setCommitted] = useState<{
    investment: number;
    buyDays: number;
    sellDays: number;
  }>({ investment: 10000, buyDays: 30, sellDays: 0 });

  const parsedInvestment = useMemo(() => {
    const n = parseFloat(investmentStr);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [investmentStr]);

  const parsedBuyDays = useMemo(() => {
    const n = parseInt(dcaBuyDaysStr, 10);
    return Number.isFinite(n) && n >= 0 && n <= 365 ? n : 0;
  }, [dcaBuyDaysStr]);

  const parsedSellDays = useMemo(() => {
    const n = parseInt(dcaSellDaysStr, 10);
    return Number.isFinite(n) && n >= 0 && n <= 365 ? n : 0;
  }, [dcaSellDaysStr]);

  // The actual values used for querying and computing
  const investmentAmount = committed.investment;
  const dcaBuyDays = committed.buyDays;
  const dcaSellDays = committed.sellDays;

  const { data: dcaData, isFetching: dcaFetching } = useSuspenseQuery(
    dcaQuery(committed.buyDays, committed.sellDays),
  );
  const { data: simData } = useSuspenseQuery(simulatorQuery);

  const handleCalculate = useCallback(() => {
    setCommitted({
      investment: parsedInvestment,
      buyDays: parsedBuyDays,
      sellDays: parsedSellDays,
    });
  }, [parsedInvestment, parsedBuyDays, parsedSellDays]);

  const comparisons = useMemo(
    () => buildCycleComparisons(dcaData, simData, investmentAmount, dcaSellDays),
    [dcaData, simData, investmentAmount, dcaSellDays],
  );

  const totals = useMemo(
    () => computeDcaTotals(comparisons, investmentAmount),
    [comparisons, investmentAmount],
  );

  // Summary stats
  const lumpSumWins = comparisons.filter((c) => c.winner === "lump-sum").length;
  const dcaWins = comparisons.filter((c) => c.winner === "dca").length;

  const buyDaysDirty = investmentStr !== "" && (dcaBuyDaysStr === "" || dcaSellDaysStr === "");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-6 p-5">
          {/* Header */}
          <header className="mb-4 text-center sm:mb-8">
            <div className="flex items-center justify-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                DCA vs <span className="text-primary">Lump Sum</span>
              </h1>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Should you go all-in at the BTC
              <span className="text-primary">500</span> buy/sell signal, or spread your orders
              across multiple days? Compare the outcomes.
            </p>
          </header>

          {/* Controls */}
          <div className="mx-auto grid w-full max-w-2xl gap-4 sm:grid-cols-3">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Investment amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  min="1"
                  step="100"
                  value={investmentStr}
                  onChange={(e) => setInvestmentStr(e.target.value)}
                  className="h-14 rounded-2xl border-border/60 bg-card pl-10 text-2xl font-bold tracking-tight"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                DCA buy days
              </label>
              <Input
                type="number"
                min="0"
                max="365"
                value={dcaBuyDaysStr}
                onChange={(e) => setDcaBuyDaysStr(e.target.value)}
                className="h-14 rounded-2xl border-border/60 bg-card text-2xl font-bold tracking-tight"
                placeholder="30"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Spread buy over N days after signal
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                DCA sell days
              </label>
              <Input
                type="number"
                min="0"
                max="365"
                value={dcaSellDaysStr}
                onChange={(e) => setDcaSellDaysStr(e.target.value)}
                className="h-14 rounded-2xl border-border/60 bg-card text-2xl font-bold tracking-tight"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Spread sell over N days after signal (0 = sell all at once)
              </p>
            </motion.div>
          </div>

          {/* Calculate button */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mx-auto"
          >
            <Button
              onClick={handleCalculate}
              disabled={dcaFetching || parsedInvestment <= 0}
              className="h-14 rounded-2xl px-8 text-base font-semibold"
              size="lg"
            >
              <Calculator className="mr-2 h-5 w-5" />
              {dcaFetching ? "Calculating…" : "Calculate"}
            </Button>
          </motion.div>

          {/* Loading indicator */}
          {dcaFetching && (
            <div className="mx-auto text-center text-sm text-muted-foreground">
              Loading price data…
            </div>
          )}

          {/* Warning banner */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mx-auto w-full max-w-3xl"
          >
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs leading-relaxed text-amber-600 dark:text-amber-400">
              <p className="mb-1 text-sm font-semibold">⚠️ Important Disclaimer</p>
              <p>
                These calculations do <strong>not</strong> include exchange fees, bid-ask spreads,
                or taxes — all of which can significantly reduce real-world returns. DCA over many
                days incurs substantially more trading fees and taxable events than a single
                lump-sum trade. Past performance does not guarantee future results.
                <strong> This is not financial advice.</strong>
              </p>
            </div>
          </motion.div>

          {/* Summary comparison card */}
          {investmentAmount > 0 && !dcaFetching && (
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto w-full max-w-3xl"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Lump Sum */}
                <div className="rounded-[24px] border border-border/60 bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Lump Sum
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-bold tracking-tight">
                    {totals.lumpSumTotalProfit !== null
                      ? `${totals.lumpSumTotalProfit >= 0 ? "+" : ""}${formatUsd(totals.lumpSumTotalProfit)}`
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">total profit</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {totals.lumpSumTotalReturn !== null
                      ? `Final: ${formatUsd(totals.lumpSumTotalReturn)}`
                      : ""}
                  </div>
                </div>

                {/* DCA */}
                <div
                  className={`rounded-[24px] border p-6 text-center ${
                    totals.lumpSumBetter === false
                      ? "border-success/40 bg-success/5"
                      : "border-border/60 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      DCA ({dcaBuyDays}d buy
                      {dcaSellDays > 0 ? `, ${dcaSellDays}d sell` : ""})
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-bold tracking-tight">
                    {totals.dcaTotalProfit !== null
                      ? `${totals.dcaTotalProfit >= 0 ? "+" : ""}${formatUsd(totals.dcaTotalProfit)}`
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">total profit</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {totals.dcaTotalReturn !== null
                      ? `Final: ${formatUsd(totals.dcaTotalReturn)}`
                      : ""}
                  </div>
                </div>
              </div>

              {/* Difference banner */}
              {totals.lumpSumTotalProfit !== null && totals.dcaTotalProfit !== null && (
                <div
                  className={`mt-4 rounded-2xl p-4 text-center text-sm ${
                    totals.lumpSumBetter
                      ? "bg-muted/60 text-foreground"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {totals.lumpSumBetter ? (
                    <>
                      <span className="font-semibold">Lump sum wins</span> by{" "}
                      <span className="font-semibold">{formatUsd(Math.abs(totals.diff!))}</span>
                      {totals.diffPercent !== null && (
                        <>
                          {" "}
                          ({totals.diffPercent >= 0 ? "+" : ""}
                          {totals.diffPercent.toFixed(1)}% vs DCA)
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">DCA wins</span> by{" "}
                      <span className="font-semibold">{formatUsd(Math.abs(totals.diff!))}</span>
                      {totals.diffPercent !== null && (
                        <> ({Math.abs(totals.diffPercent!).toFixed(1)}% better than lump sum)</>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Win count */}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>
                  Lump sum wins:{" "}
                  <span className="font-semibold text-foreground">
                    {lumpSumWins}/{comparisons.length}
                  </span>
                </span>
                <span>·</span>
                <span>
                  DCA wins:{" "}
                  <span className="font-semibold text-foreground">
                    {dcaWins}/{comparisons.length}
                  </span>
                </span>
              </div>
            </motion.div>
          )}

          {/* Per-cycle comparison cards */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {comparisons.map((cycle, i) => {
              const priceWarning =
                cycle.buyPricesAvailable === 0 || (dcaBuyDays > 0 && cycle.buyPricesAvailable < 2);
              return (
                <motion.div
                  key={cycle.label}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className={`rounded-[24px] border p-6 ${
                    cycle.winner === "lump-sum"
                      ? "border-border/60 bg-card"
                      : cycle.winner === "dca"
                        ? "border-success/30 bg-success/5"
                        : "border-border/60 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bitcoin className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold">{cycle.label}</h3>
                    </div>
                    {cycle.winner === "lump-sum" && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Lump sum
                      </span>
                    )}
                    {cycle.winner === "dca" && (
                      <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
                        DCA wins
                      </span>
                    )}
                    {cycle.winner === "tie" && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Tie
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-muted/60 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Buy Date
                      </div>
                      <div className="mt-1 text-sm font-semibold">{cycle.buyDate}</div>
                      {cycle.lumpSumBuyPrice !== null && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Lump sum: {formatUsd(cycle.lumpSumBuyPrice)}
                        </div>
                      )}
                      {cycle.dcaBuyPrice !== null && dcaBuyDays > 0 && (
                        <div className="text-xs text-muted-foreground">
                          DCA avg: {formatUsd(cycle.dcaBuyPrice)}
                          {cycle.dcaBuyDaysUsed > 0 && ` (${cycle.dcaBuyDaysUsed}d)`}
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-muted/60 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Sell Date
                      </div>
                      <div className="mt-1 text-sm font-semibold">{cycle.sellDate}</div>
                      {cycle.lumpSumSellPrice !== null && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Lump sum: {formatUsd(cycle.lumpSumSellPrice)}
                        </div>
                      )}
                      {cycle.dcaSellPrice !== null && dcaSellDays > 0 && (
                        <div className="text-xs text-muted-foreground">
                          DCA avg: {formatUsd(cycle.dcaSellPrice)}
                          {cycle.dcaSellDaysUsed > 0 && ` (${cycle.dcaSellDaysUsed}d)`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return comparison */}
                  {investmentAmount > 0 && (
                    <div className="mt-4 space-y-2">
                      {/* Lump sum return */}
                      {cycle.lumpSumReturn !== null && (
                        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            Lump sum
                          </span>
                          <div className="text-right">
                            <span
                              className={`text-base font-bold ${
                                cycle.lumpSumReturn >= 0 ? "text-success" : "text-destructive"
                              }`}
                            >
                              {cycle.lumpSumReturn >= 0 ? "+" : ""}
                              {formatUsd(cycle.lumpSumReturn)}
                            </span>
                            {cycle.lumpSumMultiplier !== null && (
                              <div className="text-xs text-muted-foreground">
                                {cycle.lumpSumMultiplier.toFixed(2)}x
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* DCA return */}
                      {cycle.dcaReturn !== null && (
                        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-3.5 w-3.5" />
                            DCA
                          </span>
                          <div className="text-right">
                            <span
                              className={`text-base font-bold ${
                                cycle.dcaReturn >= 0 ? "text-success" : "text-destructive"
                              }`}
                            >
                              {cycle.dcaReturn >= 0 ? "+" : ""}
                              {formatUsd(cycle.dcaReturn)}
                            </span>
                            {cycle.dcaMultiplier !== null && (
                              <div className="text-xs text-muted-foreground">
                                {cycle.dcaMultiplier.toFixed(2)}x
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Difference */}
                      {cycle.lumpSumReturn !== null && cycle.dcaReturn !== null && (
                        <div className="flex items-center justify-center gap-1 pt-1 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3" />
                          <span>
                            Difference:{" "}
                            <span
                              className={`font-semibold ${
                                cycle.lumpSumReturn > cycle.dcaReturn
                                  ? "text-foreground"
                                  : "text-success"
                              }`}
                            >
                              {formatUsd(Math.abs(cycle.lumpSumReturn - cycle.dcaReturn))}
                            </span>{" "}
                            in favor of {cycle.lumpSumReturn > cycle.dcaReturn ? "lump sum" : "DCA"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No data warning */}
                  {priceWarning && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Limited price data for this cycle — some DCA days may not have historical
                      prices available.
                    </p>
                  )}

                  {/* Missing lump sum data */}
                  {cycle.lumpSumBuyPrice === null && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Price data unavailable for this cycle
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Historical prices from the BTC-USD max CSV. Past performance does not guarantee future
            results. DCA assumes equal dollar amounts each day; actual execution prices may vary.
          </p>
        </div>
      </main>
    </div>
  );
}
