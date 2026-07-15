import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
} from "lucide-react";
import type {
  DashboardData,
  MacroEvent,
  EventClassification,
  IndicatorStatistics,
} from "@/lib/macro-impact/types";
import { getMacroImpactData } from "@/lib/macro-impact/server";
import { StatsCard } from "./StatsCard";
import { EventTable } from "./EventTable";
import { InsightCards } from "./InsightCards";
import { HeatmapGrid } from "./HeatmapGrid";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function fadeUp(index = 0) {
  return {
    initial: { y: 12, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease, delay: 0.05 * index },
  };
}

function fmtPct(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function fmtDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface MacroImpactPageProps {
  initialData: DashboardData | null;
}

export function MacroImpactPage({ initialData }: MacroImpactPageProps) {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<"all" | "CPI" | "PPI">("all");
  const [classificationFilter, setClassificationFilter] = useState<"all" | EventClassification>(
    "all",
  );
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMacroImpactData();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load macro impact data");
    } finally {
      setIsLoading(false);
    }
  };

  const availableYears = useMemo(() => {
    if (!data) return [];
    const years = new Set<number>();
    for (const ev of data.events) {
      years.add(new Date(ev.release.date).getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    let events = data.events;
    if (typeFilter !== "all") events = events.filter((e) => e.release.indicator === typeFilter);
    if (classificationFilter !== "all")
      events = events.filter((e) => e.classification === classificationFilter);
    if (yearFilter !== "all") {
      const y = parseInt(yearFilter);
      events = events.filter((e) => new Date(e.release.date).getFullYear() === y);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.release.date.includes(q) ||
          e.release.indicator.toLowerCase().includes(q) ||
          (e.release.actual !== null && e.release.actual.toString().includes(q)),
      );
    }
    return events;
  }, [data, typeFilter, classificationFilter, yearFilter, searchQuery]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Fetching CPI, PPI & Bitcoin price data...
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                This may take a few seconds as we query multiple data sources.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
          <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">Macro Impact</h1>
          <div className="rounded-[24px] border border-red-500/30 bg-red-500/5 p-12 text-center">
            <p className="text-lg font-semibold text-red-400">Failed to load data</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={refetch}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
          <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">Macro Impact</h1>
          <div className="rounded-[24px] border border-border/60 bg-card p-12 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-semibold">No data available</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Unable to fetch macroeconomic data.
            </p>
            <button
              onClick={refetch}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" /> Load data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { statistics, bestEvent, worstEvent, currentMonthExpectations } = data;
  const cpiStats = statistics.cpi;
  const ppiStats = statistics.ppi;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        {/* Header */}
        <motion.div className="mb-10" {...fadeUp(0)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <BarChart3 className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </span>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Market Intelligence
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Macro Impact</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                How CPI & PPI releases historically moved Bitcoin. Every data point comes from real
                Binance price data correlated with official US economic releases.
              </p>
            </div>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <motion.div {...fadeUp(1)}>
            <StatsCard
              label="CPI Bullish"
              sublabel="BTC avg after 24h"
              value={fmtPct(cpiStats.byClassification.bullish_surprise.mean)}
              accent="green"
              detail={`${cpiStats.byClassification.bullish_surprise.count} events · ${cpiStats.byClassification.bullish_surprise.winRate.toFixed(0)}% win`}
            />
          </motion.div>
          <motion.div {...fadeUp(2)}>
            <StatsCard
              label="CPI Bearish"
              sublabel="BTC avg after 24h"
              value={fmtPct(cpiStats.byClassification.bearish_surprise.mean)}
              accent="red"
              detail={`${cpiStats.byClassification.bearish_surprise.count} events · ${cpiStats.byClassification.bearish_surprise.winRate.toFixed(0)}% win`}
            />
          </motion.div>
          <motion.div {...fadeUp(3)}>
            <StatsCard
              label="PPI Bullish"
              sublabel="BTC avg after 24h"
              value={fmtPct(ppiStats.byClassification.bullish_surprise.mean)}
              accent="green"
              detail={`${ppiStats.byClassification.bullish_surprise.count} events · ${ppiStats.byClassification.bullish_surprise.winRate.toFixed(0)}% win`}
            />
          </motion.div>
          <motion.div {...fadeUp(4)}>
            <StatsCard
              label="PPI Bearish"
              sublabel="BTC avg after 24h"
              value={fmtPct(ppiStats.byClassification.bearish_surprise.mean)}
              accent="red"
              detail={`${ppiStats.byClassification.bearish_surprise.count} events · ${ppiStats.byClassification.bearish_surprise.winRate.toFixed(0)}% win`}
            />
          </motion.div>
        </div>

        {/* Best & Worst */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <motion.div {...fadeUp(5)}>
            <BestWorstCard event={bestEvent} type="best" />
          </motion.div>
          <motion.div {...fadeUp(6)}>
            <BestWorstCard event={worstEvent} type="worst" />
          </motion.div>
        </div>

        {/* Upcoming Releases */}
        {(currentMonthExpectations.nextCPI || currentMonthExpectations.nextPPI) && (
          <motion.div className="mb-8" {...fadeUp(7)}>
            <UpcomingReleasesCard
              nextCPI={currentMonthExpectations.nextCPI}
              nextPPI={currentMonthExpectations.nextPPI}
            />
          </motion.div>
        )}

        {/* Insights */}
        <motion.div className="mb-8" {...fadeUp(8)}>
          <SectionHeader icon={Info} label="Key Insights" title="What History Shows" />
          <InsightCards insights={data.insights} />
        </motion.div>

        {/* Statistics by Horizon */}
        <motion.div className="mb-8" {...fadeUp(9)}>
          <SectionHeader icon={TrendingUp} label="Statistics" title="Performance by Time Horizon" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <HorizonStatsCard indicator="CPI" stats={cpiStats} />
            <HorizonStatsCard indicator="PPI" stats={ppiStats} />
          </div>
        </motion.div>

        {/* Heatmaps */}
        <motion.div className="mb-8" {...fadeUp(10)}>
          <SectionHeader icon={BarChart3} label="Patterns" title="Heatmaps" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <HeatmapGrid
              title="Release Hour vs Avg BTC 1h Return"
              cells={data.heatmap.hourlyReturns.filter((c) => c.count > 0)}
              unit="%"
            />
            <HeatmapGrid
              title="Month vs Avg BTC 24h Return"
              cells={data.heatmap.monthlyImpact}
              unit="%"
            />
          </div>
        </motion.div>

        {/* Interactive Table */}
        <motion.div className="mb-8" {...fadeUp(11)}>
          <SectionHeader icon={Calendar} label="All Events" title="Historical Events" />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
              All
            </FilterPill>
            <FilterPill active={typeFilter === "CPI"} onClick={() => setTypeFilter("CPI")}>
              CPI
            </FilterPill>
            <FilterPill active={typeFilter === "PPI"} onClick={() => setTypeFilter("PPI")}>
              PPI
            </FilterPill>
            <span className="mx-1 h-4 w-px bg-border" />
            <FilterPill
              active={classificationFilter === "all"}
              onClick={() => setClassificationFilter("all")}
            >
              All Types
            </FilterPill>
            <FilterPill
              active={classificationFilter === "bullish_surprise"}
              onClick={() => setClassificationFilter("bullish_surprise")}
            >
              Bullish
            </FilterPill>
            <FilterPill
              active={classificationFilter === "bearish_surprise"}
              onClick={() => setClassificationFilter("bearish_surprise")}
            >
              Bearish
            </FilterPill>
            <FilterPill
              active={classificationFilter === "neutral"}
              onClick={() => setClassificationFilter("neutral")}
            >
              Neutral
            </FilterPill>
            <span className="mx-1 h-4 w-px bg-border" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary"
            >
              <option value="all">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-primary w-40"
              />
            </div>
          </div>
          <EventTable events={filteredEvents} total={data.events.length} />
        </motion.div>
      </main>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className="h-5 w-5" />
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="text-lg font-semibold">{title}</div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all ${active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
    >
      {children}
    </button>
  );
}

function BestWorstCard({ event, type }: { event: MacroEvent | null; type: "best" | "worst" }) {
  if (!event) {
    return (
      <div className="rounded-[24px] border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">No {type} event data available</p>
      </div>
    );
  }
  const ret24h = event.performance.returns.h24;
  const isPositive = type === "best";
  return (
    <div
      className={`rounded-[24px] border p-6 ${isPositive ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 text-green-400" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-400" />
        )}
        <span
          className={`text-xs font-semibold uppercase tracking-[0.18em] ${isPositive ? "text-green-400" : "text-red-400"}`}
        >
          {isPositive ? "Best Historical Event" : "Worst Historical Event"}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {fmtPct(ret24h)}
        </span>
        <span className="text-sm text-muted-foreground">24h return</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-semibold">
          {event.release.indicator}
        </span>
        <span>{fmtDate(event.release.date)}</span>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        {event.release.actual !== null && (
          <span>
            Actual: <strong className="text-foreground">{event.release.actual}</strong>
          </span>
        )}
        {event.release.forecast !== null && (
          <span>
            Forecast: <strong className="text-foreground">{event.release.forecast}</strong>
          </span>
        )}
        {event.release.previous !== null && (
          <span>
            Previous: <strong className="text-foreground">{event.release.previous}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

function UpcomingReleasesCard({
  nextCPI,
  nextPPI,
}: {
  nextCPI: DashboardData["currentMonthExpectations"]["nextCPI"];
  nextPPI: DashboardData["currentMonthExpectations"]["nextPPI"];
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Upcoming Releases
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {nextCPI && (
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Next CPI
            </div>
            <div className="mt-1 text-lg font-bold">{fmtDate(nextCPI.date)}</div>
            {nextCPI.forecast !== null && (
              <div className="text-xs text-muted-foreground">Forecast: {nextCPI.forecast}</div>
            )}
          </div>
        )}
        {nextPPI && (
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Next PPI
            </div>
            <div className="mt-1 text-lg font-bold">{fmtDate(nextPPI.date)}</div>
            {nextPPI.forecast !== null && (
              <div className="text-xs text-muted-foreground">Forecast: {nextPPI.forecast}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HorizonStatsCard({ indicator, stats }: { indicator: string; stats: IndicatorStatistics }) {
  const horizons = [
    { key: "h1" as const, label: "1 Hour" },
    { key: "h4" as const, label: "4 Hours" },
    { key: "h24" as const, label: "24 Hours" },
    { key: "d3" as const, label: "3 Days" },
    { key: "d7" as const, label: "7 Days" },
  ];
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {indicator}
        </span>
        <span className="text-sm font-semibold">Average BTC Return After Release</span>
      </div>
      <div className="space-y-3">
        {horizons.map(({ key, label }) => {
          const s = stats.byHorizon[key];
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold ${s.mean > 0 ? "text-green-400" : s.mean < 0 ? "text-red-400" : "text-muted-foreground"}`}
                >
                  {fmtPct(s.mean)}
                </span>
                <span className="w-12 text-right text-xs text-muted-foreground/60">
                  n={s.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/60 px-3 py-2 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Median 24h
          </div>
          <div className="text-sm font-bold">{fmtPct(stats.byHorizon.h24.median)}</div>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Std Dev
          </div>
          <div className="text-sm font-bold">{stats.byHorizon.h24.stdDev.toFixed(2)}%</div>
        </div>
        <div className="rounded-xl bg-muted/60 px-3 py-2 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Avg Vol
          </div>
          <div className="text-sm font-bold">{stats.avgVolatility.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}
