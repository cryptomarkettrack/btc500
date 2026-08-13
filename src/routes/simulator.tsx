import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calculator, DollarSign, TrendingUp, TrendingDown, Bitcoin } from "lucide-react";
import { formatUsd } from "@/lib/format";
import { simulatorQuery } from "@/lib/queries";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

const simulatorPageSchema = generateWebPageSchema({
  path: "/simulator",
  name: "BTC500 Simulator — Bitcoin Halving Returns Calculator",
  description:
    "See how much you would have earned investing in Bitcoin using the BTC500 strategy across past halving cycles. Enter any investment amount and calculate your returns from the 2012, 2016, 2020, and 2024 halving cycles.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Simulator", path: "/simulator" },
  ],
});

export const Route = createFileRoute("/simulator")({
  head: () =>
    generatePageHead({
      path: "/simulator",
      title: "BTC500 Simulator — Bitcoin Halving Returns Calculator",
      description:
        "See what you'd have earned investing in Bitcoin with the BTC500 strategy across past halving cycles. Enter an amount to calculate your returns.",
      keywords:
        "Bitcoin halving simulator, BTC500 calculator, Bitcoin investment returns, halving cycle returns, Bitcoin strategy backtest, crypto investment calculator, Bitcoin profit calculator",
      ogTitle: "BTC500 Simulator — Bitcoin Halving Returns Calculator",
      ogDescription:
        "Simulate your returns using the BTC500 strategy across past halving cycles. See historical buy/sell prices and profit calculations.",
      ogImageAlt: "BTC500 Simulator — Bitcoin Investment Returns Calculator",
      twitterDescription:
        "Simulate your returns using the BTC500 strategy across past halving cycles.",
      schema: simulatorPageSchema,
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(simulatorQuery),
  component: Simulator,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});

function Simulator() {
  const { data } = useSuspenseQuery(simulatorQuery);
  const [investment, setInvestment] = useState("1000");

  const investmentAmount = useMemo(() => {
    const n = parseFloat(investment);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [investment]);

  const cyclesWithProfit = useMemo(() => {
    return data.cycles.map((cycle) => {
      const profit =
        cycle.returnMultiplier !== null && investmentAmount > 0
          ? investmentAmount * cycle.returnMultiplier - investmentAmount
          : null;
      return { ...cycle, profit };
    });
  }, [data.cycles, investmentAmount]);

  const totals = useMemo(() => {
    // Only count cycles that have price data
    const cyclesWithData = cyclesWithProfit.filter((c) => c.profit !== null);
    const activeCycleCount = cyclesWithData.length;

    const totalInvestment = investmentAmount * activeCycleCount;
    const totalReturn = cyclesWithData.reduce((sum, c) => sum + c.profit! + investmentAmount, 0);
    const totalProfit = activeCycleCount > 0 ? totalReturn - totalInvestment : null;
    return { totalInvestment, totalReturn, totalProfit, activeCycleCount };
  }, [cyclesWithProfit, investmentAmount]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-6 p-5">
          {/* Header */}
          <header className="mb-4 text-center sm:mb-8">
            <div className="flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                BTC<span className="text-primary">500</span> Simulator
              </h1>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              See how much you would have earned by investing in each halving cycle using the BTC
              <span className="text-primary">500</span> strategy — buy 500 days before, sell 500
              days after.
            </p>
          </header>

          {/* Investment input */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Investment per cycle
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                min="1"
                step="100"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="h-14 rounded-2xl border-border/60 bg-card pl-10 text-2xl font-bold tracking-tight"
              />
            </div>
          </motion.div>

          {/* Summary card */}
          {investmentAmount > 0 && (
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto w-full max-w-md rounded-[24px] border border-border/60 bg-card p-6 text-center"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Total Across All Cycles
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight">
                {formatUsd(totals.totalInvestment)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">invested</div>
              {totals.totalProfit !== null && (
                <>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {totals.totalProfit >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                    <span
                      className={`text-2xl font-bold ${
                        totals.totalProfit >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {totals.totalProfit >= 0 ? "+" : ""}
                      {formatUsd(totals.totalProfit)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totals.totalProfit >= 0 ? "profit" : "loss"}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Final value:{" "}
                    <span className="font-semibold text-foreground">
                      {formatUsd(totals.totalReturn)}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Cycle cards */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {cyclesWithProfit.map((cycle, i) => (
              <motion.div
                key={cycle.label}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="rounded-[24px] border border-border/60 bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">{cycle.label}</h2>
                  </div>
                  {cycle.returnPercent !== null && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        cycle.returnPercent >= 0
                          ? "bg-success-soft text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {cycle.returnPercent >= 0 ? "+" : ""}
                      {cycle.returnPercent.toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-muted/60 px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Buy Date
                    </div>
                    <div className="mt-1 text-sm font-semibold">{cycle.buyDate}</div>
                    {cycle.buyPrice !== null && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        BTC @ {formatUsd(cycle.buyPrice)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl bg-muted/60 px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Sell Date
                    </div>
                    <div className="mt-1 text-sm font-semibold">{cycle.sellDate}</div>
                    {cycle.sellPrice !== null && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        BTC @ {formatUsd(cycle.sellPrice)}
                      </div>
                    )}
                  </div>
                </div>

                {cycle.returnMultiplier !== null && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {cycle.returnMultiplier.toFixed(2)}x return
                  </div>
                )}

                {investmentAmount > 0 && cycle.profit !== null && (
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {formatUsd(investmentAmount)} invested
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        cycle.profit >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {cycle.profit >= 0 ? "+" : ""}
                      {formatUsd(cycle.profit)}
                    </span>
                  </div>
                )}

                {cycle.buyPrice === null && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Price data unavailable for this cycle
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* SEO / informational content */}
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              What the BTC500 Simulator Shows
            </h2>
            <p>
              The BTC500 strategy is a rules-based Bitcoin investing approach: buy exactly 500 days
              before each halving and sell exactly 500 days after. This simulator backtests that
              rule against real historical prices for the halving cycles that began in 2012, 2016,
              2020 and 2024.
            </p>
            <p>
              Enter any investment amount to see what would have been allocated in each cycle, the
              buy and sell prices captured by the strategy, and the resulting profit or loss across
              every completed cycle. The totals card sums the outcome of repeating the same dollar
              amount in each of those cycles.
            </p>
            <p>
              A backtest cannot predict future returns — it only shows what historically happened
              when a fixed 500-day buy/sell rule was followed around each Bitcoin halving. Treat it
              as a research tool, not financial advice.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Historical prices from CoinGecko. Past performance does not guarantee future results.
            The BTC<span className="text-primary">500</span> strategy is a hypothetical backtest.
          </p>
        </div>
      </main>
    </div>
  );
}
