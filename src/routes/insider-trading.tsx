import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  fetchInsiderTrading,
  type InsiderSummary,
  type InsiderTransaction,
} from "@/lib/insider-trading";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, TrendingUp, TrendingDown, Hash, DollarSign } from "lucide-react";

export const Route = createFileRoute("/insider-trading")({
  component: InsiderTradingPage,
  loader: async (): Promise<InsiderSummary | null> => {
    try {
      const data = await fetchInsiderTrading();
      return data;
    } catch (e) {
      return null;
    }
  },
  head: () => ({
    meta: [
      { title: "Insider Trading Dashboard — Buy vs Sell Analysis | BTC500" },
      {
        name: "description",
        content:
          "Real-time insider trading data from SEC Form 4 filings. Analyze insider buy vs sell ratios with interactive pie charts.",
      },
    ],
  }),
});

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

const COLORS: Record<string, string> = {
  Buy: "#22c55e",
  Sale: "#ef4444",
  "Proposed Sale": "#f97316",
  "Option Exercise": "#a855f7",
};

const TYPE_OPTIONS = ["All", "Buy", "Sale", "Proposed Sale", "Option Exercise"] as const;

type GroupByMode = "none" | "ticker";

function InsiderTradingPage() {
  const [view, setView] = useState<"count" | "value">("value");
  const [showAll, setShowAll] = useState(false);
  const [tickerFilter, setTickerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [groupBy, setGroupBy] = useState<GroupByMode>("none");

  const serverData = Route.useLoaderData();

  const { data, isLoading, error, refetch } = useQuery<InsiderSummary>({
    queryKey: ["insider-trading"],
    queryFn: () => fetchInsiderTrading(),
    initialData: serverData ?? undefined,
    refetchInterval: 5 * 60 * 1000,
  });

  // Derive unique tickers for the datalist
  const allTickers = useMemo(() => {
    if (!data) return [];
    const tickers = new Set(data.transactions.map((t) => t.ticker));
    return Array.from(tickers).sort();
  }, [data]);

  // Filter & group transactions
  const { filteredTransactions, groupedTransactions } = useMemo(() => {
    if (!data) return { filteredTransactions: [], groupedTransactions: [] };

    let filtered = data.transactions;

    if (tickerFilter) {
      const search = tickerFilter.toUpperCase();
      filtered = filtered.filter(
        (t) => t.ticker.includes(search) || t.insider.toUpperCase().includes(search),
      );
    }

    if (typeFilter !== "All") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Group by ticker if enabled
    if (groupBy === "ticker") {
      const grouped = new Map<
        string,
        {
          ticker: string;
          buys: number;
          sales: number;
          proposedSales: number;
          options: number;
          totalValue: number;
          transactions: InsiderTransaction[];
        }
      >();

      for (const t of filtered) {
        if (!grouped.has(t.ticker)) {
          grouped.set(t.ticker, {
            ticker: t.ticker,
            buys: 0,
            sales: 0,
            proposedSales: 0,
            options: 0,
            totalValue: 0,
            transactions: [],
          });
        }
        const entry = grouped.get(t.ticker)!;
        entry.totalValue += t.value;
        entry.transactions.push(t);
        if (t.type === "Buy") entry.buys++;
        else if (t.type === "Sale") entry.sales++;
        else if (t.type === "Proposed Sale") entry.proposedSales++;
        else if (t.type === "Option Exercise") entry.options++;
      }

      return {
        filteredTransactions: [],
        groupedTransactions: Array.from(grouped.values()).sort(
          (a, b) => b.totalValue - a.totalValue,
        ),
      };
    }

    return {
      filteredTransactions: showAll ? filtered : filtered.slice(0, 100),
      groupedTransactions: [],
    };
  }, [data, tickerFilter, typeFilter, groupBy, showAll]);

  const showGrouped = groupBy === "ticker";

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Insider Trading Dashboard</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground animate-pulse">
              Loading insider trading data from SEC Form 4 filings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Insider Trading Dashboard</h1>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 mb-2">Failed to load insider trading data</p>
            <button
              onClick={() => refetch()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const countPieData = [
    { name: "Buy", value: data.buys },
    { name: "Sale", value: data.sales },
    { name: "Proposed Sale", value: data.proposedSales },
    { name: "Option Exercise", value: data.options },
  ].filter((d) => d.value > 0);

  const valuePieData = [
    { name: "Buy", value: data.buyTotalValue },
    { name: "Sale", value: data.saleTotalValue },
    { name: "Proposed Sale", value: data.proposedSaleTotalValue },
    { name: "Option Exercise", value: data.optionTotalValue },
  ].filter((d) => d.value > 0);

  const pieData = view === "count" ? countPieData : valuePieData;

  const totalCount = data.buys + data.sales + data.proposedSales + data.options;
  const totalValue =
    data.buyTotalValue + data.saleTotalValue + data.proposedSaleTotalValue + data.optionTotalValue;

  const fetchTime = data.fetchDate
    ? formatDistanceToNow(new Date(data.fetchDate), { addSuffix: true })
    : "";

  const filteredTotal = showGrouped ? groupedTransactions.length : filteredTransactions.length;

  const allTotal = groupBy === "ticker" ? allTickers.length : data.transactions.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Insider Trading Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time insider transactions from SEC Form 4 filings. Data sourced from Finviz.
            Updated {fetchTime}.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Refresh now
          </button>
        </div>

        {/* Pie chart — moved to top */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Distribution</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView("value")}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  view === "value"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                By Value
              </button>
              <button
                onClick={() => setView("count")}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  view === "count"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                By Count
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 rounded-xl border border-border bg-card p-6">
            <div className="w-full md:w-1/2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#666"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[item.name] || "#666" }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {view === "value" ? formatCurrency(item.value) : formatNumber(item.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((item.value / (view === "value" ? totalValue : totalCount)) * 100).toFixed(
                        1,
                      )}
                      %
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Transactions
            </p>
            <p className="text-2xl font-bold mt-1">{data.total}</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-xs text-green-400 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Buys
            </p>
            <p className="text-2xl font-bold text-green-400 mt-1">{data.buys}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.buyTotalValue)}
            </p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-xs text-red-400 uppercase tracking-wide flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Sales
            </p>
            <p className="text-2xl font-bold text-red-400 mt-1">{data.sales}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.saleTotalValue)}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
            <p className="text-xs text-orange-400 uppercase tracking-wide">Proposed Sales</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{data.proposedSales}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.proposedSaleTotalValue)}
            </p>
          </div>
        </div>

        {/* Ratio bar */}
        {data.total > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium mb-2">Buy / Sale Ratio</p>
            <div className="flex h-8 w-full overflow-hidden rounded-lg">
              <div
                className="bg-green-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{
                  width: `${(data.buys / (data.buys + data.sales + data.proposedSales)) * 100}%`,
                }}
              >
                {data.buys > 0 &&
                  `${Math.round((data.buys / (data.buys + data.sales + data.proposedSales)) * 100)}% Buys`}
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{
                  width: `${(data.sales / (data.buys + data.sales + data.proposedSales)) * 100}%`,
                }}
              >
                {data.sales > 0 &&
                  `${Math.round((data.sales / (data.buys + data.sales + data.proposedSales)) * 100)}% Sales`}
              </div>
              <div
                className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{
                  width: `${(data.proposedSales / (data.buys + data.sales + data.proposedSales)) * 100}%`,
                }}
              >
                {data.proposedSales > 0 &&
                  `${Math.round((data.proposedSales / (data.buys + data.sales + data.proposedSales)) * 100)}% Proposed`}
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>
                Buys: {data.buys} ({formatCurrency(data.buyTotalValue)})
              </span>
              <span>
                Sales: {data.sales} ({formatCurrency(data.saleTotalValue)})
              </span>
              <span>
                Proposed: {data.proposedSales} ({formatCurrency(data.proposedSaleTotalValue)})
              </span>
            </div>
          </div>
        )}

        {/* Filters and Table */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">
              {showGrouped ? "By Ticker" : "Transactions"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {filteredTotal} / {allTotal}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* Ticker search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter ticker..."
                  value={tickerFilter}
                  onChange={(e) => setTickerFilter(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary w-40"
                  list="ticker-datalist"
                />
                <datalist id="ticker-datalist">
                  {allTickers.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Group by toggle */}
              <button
                onClick={() => setGroupBy((g) => (g === "ticker" ? "none" : "ticker"))}
                className={`h-9 rounded-lg border px-3 text-sm font-medium transition-all ${
                  groupBy === "ticker"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <Hash className="inline h-3.5 w-3.5 mr-1" />
                Group by Ticker
              </button>
            </div>
          </div>

          {showGrouped ? (
            /* Grouped by ticker view */
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      Ticker
                    </th>
                    <th className="px-3 py-3 text-center font-medium text-muted-foreground">
                      Buys
                    </th>
                    <th className="px-3 py-3 text-center font-medium text-muted-foreground">
                      Sales
                    </th>
                    <th className="px-3 py-3 text-center font-medium text-muted-foreground">
                      Proposed
                    </th>
                    <th className="px-3 py-3 text-center font-medium text-muted-foreground">
                      Options
                    </th>
                    <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                      Total Value
                    </th>
                    <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                      # Txs
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedTransactions.map((g, i) => (
                    <tr
                      key={g.ticker}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2.5 font-medium">
                        <a
                          href={`https://finviz.com/stock?t=${g.ticker}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {g.ticker}
                        </a>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {g.buys > 0 && <span className="text-green-400 font-medium">{g.buys}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {g.sales > 0 && <span className="text-red-400 font-medium">{g.sales}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {g.proposedSales > 0 && (
                          <span className="text-orange-400 font-medium">{g.proposedSales}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {g.options > 0 && (
                          <span className="text-purple-400 font-medium">{g.options}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium">
                        {formatCurrency(g.totalValue)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">
                        {g.transactions.length}
                      </td>
                    </tr>
                  ))}
                  {groupedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                        No tickers match your filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Flat transaction list */
            <>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                        Ticker
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                        Insider
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                        Shares
                      </th>
                      <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-medium">
                          <a
                            href={`https://finviz.com/stock?t=${t.ticker}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {t.ticker}
                          </a>
                        </td>
                        <td
                          className="px-3 py-2.5 text-muted-foreground max-w-[160px] truncate"
                          title={t.insider}
                        >
                          {t.insider}
                        </td>
                        <td
                          className="px-3 py-2.5 text-muted-foreground max-w-[180px] truncate"
                          title={t.title}
                        >
                          {t.title}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{t.date}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              t.type === "Buy"
                                ? "bg-green-500/10 text-green-400"
                                : t.type === "Sale"
                                  ? "bg-red-500/10 text-red-400"
                                  : t.type === "Proposed Sale"
                                    ? "bg-orange-500/10 text-orange-400"
                                    : "bg-purple-500/10 text-purple-400"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">${t.price.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right">{formatNumber(t.shares)}</td>
                        <td className="px-3 py-2.5 text-right font-medium">
                          {formatCurrency(t.value)}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                          No transactions match your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!tickerFilter && typeFilter === "All" && data.transactions.length > 100 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showAll ? "Show less" : `Show all ${data.transactions.length} transactions`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
