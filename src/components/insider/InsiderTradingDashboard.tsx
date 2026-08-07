import {
  getInsiderTrading,
  type InsiderSummary,
  type InsiderTransaction,
} from "@/lib/insider-trading";
import { useState, useMemo, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Hash,
  Copy,
  Check,
  Loader2,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toCanvas } from "html-to-image";
import {
  formatCompactUsd as formatCurrency,
  formatCompactNumber as formatNumber,
} from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InsiderShareCard } from "@/components/insider/InsiderShareCard";
import { InsiderTransactionShareCard } from "@/components/insider/InsiderTransactionShareCard";

const COLORS: Record<string, string> = {
  Buy: "#22c55e",
  Sale: "#ef4444",
  "Proposed Sale": "#f97316",
  "Option Exercise": "#a855f7",
};

const TYPE_OPTIONS = ["All", "Buy", "Sale", "Proposed Sale", "Option Exercise"] as const;

type GroupByMode = "none" | "ticker";

/** Custom pie slice label — short name + percent, only when slice is large enough */
function renderPieLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name = "" } =
    props;

  // Hide labels on tiny slices to avoid clutter
  if (percent < 0.06) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Short labels for tight slices
  const shortName =
    name === "Proposed Sale" ? "Proposed" : name === "Option Exercise" ? "Option" : name;

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: 11,
        fontWeight: 700,
        pointerEvents: "none",
        textShadow: "0 1px 2px rgba(0,0,0,0.35)",
      }}
    >
      <tspan x={x} dy="-0.45em">
        {shortName}
      </tspan>
      <tspan x={x} dy="1.2em" style={{ fontSize: 10, fontWeight: 600 }}>
        {(percent * 100).toFixed(0)}%
      </tspan>
    </text>
  );
}

async function captureToPng(el: HTMLElement): Promise<string> {
  const canvas = await toCanvas(el, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#fff",
  });
  return canvas.toDataURL("image/png");
}

async function captureToBlob(el: HTMLElement): Promise<Blob> {
  const canvas = await toCanvas(el, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#fff",
  });
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
  if (!blob) throw new Error("Failed to create image blob");
  return blob;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  if (isIOS) {
    // Open image so user can long-press / share
    const w = window.open();
    if (w) {
      w.document.write(
        `<img src="${dataUrl}" style="max-width:100%" alt="Share card" /><p style="font-family:sans-serif;padding:12px">Long-press the image to save or share.</p>`,
      );
    }
    return;
  }
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

function RatioBar({
  label,
  buyShare,
  saleShare,
  proposedShare,
  buyDetail,
  saleDetail,
  proposedDetail,
}: {
  label: string;
  buyShare: number;
  saleShare: number;
  proposedShare: number;
  buyDetail: string;
  saleDetail: string;
  proposedDetail: string;
}) {
  const buyPct = Math.round(buyShare * 100);
  const salePct = Math.round(saleShare * 100);
  const proposedPct = Math.round(proposedShare * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="flex h-7 sm:h-8 w-full overflow-hidden rounded-lg">
        {buyShare > 0 && (
          <div
            className="bg-green-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white transition-all"
            style={{ width: `${buyShare * 100}%` }}
          >
            {buyShare >= 0.12 && `${buyPct}% Buys`}
          </div>
        )}
        {saleShare > 0 && (
          <div
            className="bg-red-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white transition-all"
            style={{ width: `${saleShare * 100}%` }}
          >
            {saleShare >= 0.12 && `${salePct}% Sales`}
          </div>
        )}
        {proposedShare > 0 && (
          <div
            className="bg-orange-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white transition-all"
            style={{ width: `${proposedShare * 100}%` }}
          >
            {proposedShare >= 0.12 && `${proposedPct}% Prop.`}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mt-1.5 text-xs text-muted-foreground">
        <span>
          Buys: {buyDetail} ({buyPct}%)
        </span>
        <span>
          Sales: {saleDetail} ({salePct}%)
        </span>
        <span>
          Proposed: {proposedDetail} ({proposedPct}%)
        </span>
      </div>
    </div>
  );
}

export function InsiderTradingDashboard({ initialData }: { initialData: InsiderSummary | null }) {
  const [view, setView] = useState<"count" | "value">("value");
  const [showAll, setShowAll] = useState(false);
  const [tickerFilter, setTickerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [groupBy, setGroupBy] = useState<GroupByMode>("none");

  const [selectedTx, setSelectedTx] = useState<InsiderTransaction | null>(null);

  const shareCardRef = useRef<HTMLDivElement>(null);
  const txShareCardRef = useRef<HTMLDivElement>(null);

  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txCopying, setTxCopying] = useState(false);
  const [txCopied, setTxCopied] = useState(false);

  const serverData = initialData;

  const [data, setData] = useState<InsiderSummary | null>(serverData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getInsiderTrading();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch insider trading data"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyShareCard = useCallback(async () => {
    const el = shareCardRef.current;
    if (!el) return;
    setCopying(true);
    try {
      const blob = await captureToBlob(el);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy share card", err);
      // Fallback: download
      try {
        const dataUrl = await captureToPng(el);
        downloadDataUrl(dataUrl, `btc500-insider-${new Date().toISOString().slice(0, 10)}.png`);
      } catch {
        /* ignore */
      }
    } finally {
      setCopying(false);
    }
  }, []);

  const handleDownloadShareCard = useCallback(async () => {
    const el = shareCardRef.current;
    if (!el) return;
    setCopying(true);
    try {
      const dataUrl = await captureToPng(el);
      downloadDataUrl(dataUrl, `btc500-insider-${new Date().toISOString().slice(0, 10)}.png`);
    } catch (err) {
      console.error("Failed to download share card", err);
    } finally {
      setCopying(false);
    }
  }, []);

  const handleCopyTxCard = useCallback(async () => {
    const el = txShareCardRef.current;
    if (!el || !selectedTx) return;
    setTxCopying(true);
    try {
      // Brief delay so the hidden card has painted with the selected tx
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      const blob = await captureToBlob(el);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setTxCopied(true);
      setTimeout(() => setTxCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy transaction card", err);
      try {
        const dataUrl = await captureToPng(el);
        downloadDataUrl(
          dataUrl,
          `btc500-insider-${selectedTx.ticker}-${new Date().toISOString().slice(0, 10)}.png`,
        );
      } catch {
        /* ignore */
      }
    } finally {
      setTxCopying(false);
    }
  }, [selectedTx]);

  const handleDownloadTxCard = useCallback(async () => {
    const el = txShareCardRef.current;
    if (!el || !selectedTx) return;
    setTxCopying(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      const dataUrl = await captureToPng(el);
      downloadDataUrl(
        dataUrl,
        `btc500-insider-${selectedTx.ticker}-${new Date().toISOString().slice(0, 10)}.png`,
      );
    } catch (err) {
      console.error("Failed to download transaction card", err);
    } finally {
      setTxCopying(false);
    }
  }, [selectedTx]);

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

    // Sort by value descending
    filtered = [...filtered].sort((a, b) => b.value - a.value);

    return {
      filteredTransactions: showAll ? filtered : filtered.slice(0, 100),
      groupedTransactions: [],
    };
  }, [data, tickerFilter, typeFilter, groupBy, showAll]);

  const showGrouped = groupBy === "ticker";

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-6">Insider Trading Dashboard</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground animate-pulse text-center text-sm sm:text-base px-4">
              Loading insider trading data from SEC Form 4 filings...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-6">Insider Trading Dashboard</h1>
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

  const countDenom = data.buys + data.sales + data.proposedSales || 1;
  const volumeDenom =
    data.buyTotalValue + data.saleTotalValue + data.proposedSaleTotalValue || 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Insider Trading Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Real-time insider transactions from SEC Form 4 filings. Data sourced from Finviz.
            Updated {fetchTime}.
          </p>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
          >
            {isLoading ? "Refreshing…" : "Refresh now"}
          </button>
        </div>

        {/* Share card actions */}
        <div className="mb-6 sm:mb-8 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Share2 className="h-4 w-4 text-primary shrink-0" />
                Share insider summary
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a social card with buy/sale distribution and totals — ready for X or
                anywhere else.
              </p>
            </div>
            <div className="flex flex-col xs:flex-row sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyShareCard}
                disabled={copying}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
              >
                {copying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy card
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadShareCard}
                disabled={copying}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5 disabled:opacity-50 whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Distribution</h2>
            <div className="flex gap-2 self-start sm:self-auto">
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

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="w-full md:w-1/2 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={96}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#666"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      view === "value" ? formatCurrency(value) : formatNumber(value),
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-2.5 sm:space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[item.name] || "#666" }}
                    />
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">
                      {view === "value" ? formatCurrency(item.value) : formatNumber(item.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (item.value / (view === "value" ? totalValue : totalCount || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
              Total Transactions
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{data.total}</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-green-400 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Buys
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-400 mt-1">{data.buys}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.buyTotalValue)}
            </p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-red-400 uppercase tracking-wide flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Sales
            </p>
            <p className="text-xl sm:text-2xl font-bold text-red-400 mt-1">{data.sales}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.saleTotalValue)}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-orange-400 uppercase tracking-wide">
              Proposed Sales
            </p>
            <p className="text-xl sm:text-2xl font-bold text-orange-400 mt-1">
              {data.proposedSales}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.proposedSaleTotalValue)}
            </p>
          </div>
        </div>

        {/* Ratio bars — by volume and by count */}
        {data.total > 0 && (
          <div className="mb-6 sm:mb-8 space-y-5">
            <p className="text-sm font-medium">Buy / Sale Ratio</p>

            <RatioBar
              label="By volume"
              buyShare={data.buyTotalValue / volumeDenom}
              saleShare={data.saleTotalValue / volumeDenom}
              proposedShare={data.proposedSaleTotalValue / volumeDenom}
              buyDetail={formatCurrency(data.buyTotalValue)}
              saleDetail={formatCurrency(data.saleTotalValue)}
              proposedDetail={formatCurrency(data.proposedSaleTotalValue)}
            />

            <RatioBar
              label="By count"
              buyShare={data.buys / countDenom}
              saleShare={data.sales / countDenom}
              proposedShare={data.proposedSales / countDenom}
              buyDetail={`${data.buys} txs`}
              saleDetail={`${data.sales} txs`}
              proposedDetail={`${data.proposedSales} txs`}
            />
          </div>
        )}

        {/* Filters and Table */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              {showGrouped ? "By Ticker" : "Transactions"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {filteredTotal} / {allTotal}
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
              {/* Ticker search */}
              <div className="relative flex-1 sm:flex-none min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter ticker or insider…"
                  value={tickerFilter}
                  onChange={(e) => setTickerFilter(e.target.value)}
                  className="h-10 sm:h-9 w-full sm:w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
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
                className="h-10 sm:h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary w-full sm:w-auto"
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
                className={`h-10 sm:h-9 rounded-lg border px-3 text-sm font-medium transition-all w-full sm:w-auto ${
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
            /* Grouped by ticker — cards on mobile, table on md+ */
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {groupedTransactions.map((g) => (
                  <div
                    key={g.ticker}
                    className="rounded-xl border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <a
                        href={`https://finviz.com/stock?t=${g.ticker}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                      >
                        {g.ticker}
                      </a>
                      <span className="text-sm font-bold">{formatCurrency(g.totalValue)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {g.buys > 0 && (
                        <span className="rounded-full bg-green-500/10 text-green-400 px-2 py-0.5 font-medium">
                          {g.buys} buy{g.buys !== 1 ? "s" : ""}
                        </span>
                      )}
                      {g.sales > 0 && (
                        <span className="rounded-full bg-red-500/10 text-red-400 px-2 py-0.5 font-medium">
                          {g.sales} sale{g.sales !== 1 ? "s" : ""}
                        </span>
                      )}
                      {g.proposedSales > 0 && (
                        <span className="rounded-full bg-orange-500/10 text-orange-400 px-2 py-0.5 font-medium">
                          {g.proposedSales} proposed
                        </span>
                      )}
                      {g.options > 0 && (
                        <span className="rounded-full bg-purple-500/10 text-purple-400 px-2 py-0.5 font-medium">
                          {g.options} option{g.options !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-muted-foreground">{g.transactions.length} txs</span>
                    </div>
                  </div>
                ))}
                {groupedTransactions.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground text-sm">
                    No tickers match your filter
                  </p>
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
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
                    {groupedTransactions.map((g) => (
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
                          {g.buys > 0 && (
                            <span className="text-green-400 font-medium">{g.buys}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {g.sales > 0 && (
                            <span className="text-red-400 font-medium">{g.sales}</span>
                          )}
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
            </>
          ) : (
            /* Flat transaction list */
            <>
              {/* Mobile cards — tap to open modal */}
              <div className="md:hidden space-y-2">
                {filteredTransactions.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedTx(t)}
                    className="w-full text-left rounded-xl border border-border bg-card p-4 hover:bg-muted/30 active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-primary">{t.ticker}</span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
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
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {t.insider}
                          {t.title ? ` · ${t.title}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{formatCurrency(t.value)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatNumber(t.shares)} @ ${t.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground text-sm">
                    No transactions match your filters
                  </p>
                )}
              </div>

              {/* Desktop table — click row to open modal */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
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
                        onClick={() => setSelectedTx(t)}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-2.5 font-medium">
                          <span className="text-primary">{t.ticker}</span>
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

      {/* Hidden page-level share card */}
      <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }} aria-hidden>
        <InsiderShareCard ref={shareCardRef} data={data} />
      </div>

      {/* Hidden transaction share card (rendered when a tx is selected) */}
      {selectedTx && (
        <div
          style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }}
          aria-hidden
        >
          <InsiderTransactionShareCard ref={txShareCardRef} transaction={selectedTx} />
        </div>
      )}

      {/* Transaction detail + share modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedTx && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2 pr-6">
                  <span className="text-primary">{selectedTx.ticker}</span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedTx.type === "Buy"
                        ? "bg-green-500/10 text-green-400"
                        : selectedTx.type === "Sale"
                          ? "bg-red-500/10 text-red-400"
                          : selectedTx.type === "Proposed Sale"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {selectedTx.type}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  SEC Form 4 insider transaction — preview and share
                </DialogDescription>
              </DialogHeader>

              {/* Preview panel */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                <div className="text-center py-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Transaction value
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold mt-1 ${
                      selectedTx.type === "Buy"
                        ? "text-green-400"
                        : selectedTx.type === "Sale"
                          ? "text-red-400"
                          : selectedTx.type === "Proposed Sale"
                            ? "text-orange-400"
                            : "text-purple-400"
                    }`}
                  >
                    {formatCurrency(selectedTx.value)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatNumber(selectedTx.shares)} shares @ ${selectedTx.price.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-background/80 border border-border/60 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Insider
                    </p>
                    <p className="font-medium mt-0.5 break-words">{selectedTx.insider || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-background/80 border border-border/60 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Title
                    </p>
                    <p className="font-medium mt-0.5 break-words">{selectedTx.title || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-background/80 border border-border/60 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Trade date
                    </p>
                    <p className="font-medium mt-0.5">{selectedTx.date || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-background/80 border border-border/60 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Filing date
                    </p>
                    <p className="font-medium mt-0.5">{selectedTx.filingDate || "—"}</p>
                  </div>
                  {selectedTx.held > 0 && (
                    <div className="col-span-2 rounded-lg bg-background/80 border border-border/60 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Shares held after
                      </p>
                      <p className="font-medium mt-0.5">{formatNumber(selectedTx.held)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Share actions */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Export a shareable card for social media:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleCopyTxCard}
                    disabled={txCopying}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
                  >
                    {txCopying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : txCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy share card
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadTxCard}
                    disabled={txCopying}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Download PNG
                  </button>
                </div>
                <a
                  href={`https://finviz.com/stock?t=${selectedTx.ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  View {selectedTx.ticker} on Finviz
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
