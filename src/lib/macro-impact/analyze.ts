import type {
  MacroRelease,
  MacroEvent,
  BTCPriceSnapshot,
  BTCPerformance,
  EventClassification,
  ComparisonToPrevious,
  ReturnStatistics,
  IndicatorStatistics,
  MacroInsight,
  HeatmapData,
  HeatmapCell,
  DashboardData,
} from "./types";
import { fetchMacroReleases, fetchBTCRange, interpolatePrice } from "./fetch-data";

// ─── Event Classification ────────────────────────────────────────────────────

export function classifyEvent(
  actual: number | null,
  forecast: number | null,
  previous: number | null,
): EventClassification {
  if (actual === null || forecast === null) return "neutral";

  const diff = forecast - actual;

  // Threshold: 0.05% difference is considered neutral
  // CPI/PPI are typically reported to 1 decimal place, so 0.1 is the minimum meaningful diff
  if (diff > 0.05) return "bullish_surprise"; // actual < forecast → lower inflation → bullish for BTC
  if (diff < -0.05) return "bearish_surprise"; // actual > forecast → higher inflation → bearish for BTC
  return "neutral";
}

export function compareToPrevious(
  actual: number | null,
  previous: number | null,
): ComparisonToPrevious {
  if (actual === null || previous === null) return "equal";
  if (actual < previous - 0.01) return "lower";
  if (actual > previous + 0.01) return "higher";
  return "equal";
}

// ─── BTC Performance Calculation ─────────────────────────────────────────────

export function calculateBTCPerformance(prices: BTCPriceSnapshot): BTCPerformance {
  const base = prices.atAnnouncement;

  function calcReturn(price: number | null): number | null {
    if (price === null || base === 0) return null;
    return ((price - base) / base) * 100;
  }

  function calcAbs(price: number | null): number | null {
    if (price === null) return null;
    return price - base;
  }

  const returns = {
    h1: calcReturn(prices.after1h),
    h4: calcReturn(prices.after4h),
    h24: calcReturn(prices.after24h),
    d3: calcReturn(prices.after3d),
    d7: calcReturn(prices.after7d),
  };

  const absoluteChange = {
    h1: calcAbs(prices.after1h),
    h4: calcAbs(prices.after4h),
    h24: calcAbs(prices.after24h),
    d3: calcAbs(prices.after3d),
    d7: calcAbs(prices.after7d),
  };

  return {
    returns,
    absoluteChange,
    maxMove24h:
      prices.after24h !== null
        ? Math.max(returns.h1 ?? 0, returns.h4 ?? 0, returns.h24 ?? 0)
        : null,
    maxDrawdown24h:
      prices.after24h !== null
        ? Math.min(returns.h1 ?? 0, returns.h4 ?? 0, returns.h24 ?? 0)
        : null,
  };
}

// ─── Statistics ──────────────────────────────────────────────────────────────

function computeReturnStatistics(values: number[]): ReturnStatistics {
  if (values.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, winRate: 0, maxGain: 0, maxLoss: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / count;

  const median =
    count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / count;
  const stdDev = Math.sqrt(variance);

  const wins = values.filter((v) => v > 0).length;
  const winRate = (wins / count) * 100;

  return {
    mean,
    median,
    stdDev,
    winRate,
    maxGain: sorted[count - 1],
    maxLoss: sorted[0],
    count,
  };
}

export function computeIndicatorStatistics(
  events: MacroEvent[],
  indicator: "CPI" | "PPI",
): IndicatorStatistics {
  const filtered = events.filter((e) => e.release.indicator === indicator);

  // By classification
  const bullish = filtered
    .filter((e) => e.classification === "bullish_surprise")
    .map((e) => e.performance.returns.h24)
    .filter((v): v is number => v !== null);
  const bearish = filtered
    .filter((e) => e.classification === "bearish_surprise")
    .map((e) => e.performance.returns.h24)
    .filter((v): v is number => v !== null);
  const neutral = filtered
    .filter((e) => e.classification === "neutral")
    .map((e) => e.performance.returns.h24)
    .filter((v): v is number => v !== null);

  // By horizon
  const getReturns = (horizon: "h1" | "h4" | "h24" | "d3" | "d7") =>
    filtered.map((e) => e.performance.returns[horizon]).filter((v): v is number => v !== null);

  // Avg volatility
  const volatilities = filtered
    .map((e) => e.performance.maxMove24h)
    .filter((v): v is number => v !== null);
  const avgVolatility =
    volatilities.length > 0 ? volatilities.reduce((s, v) => s + v, 0) / volatilities.length : 0;

  return {
    indicator,
    byClassification: {
      bullish_surprise: computeReturnStatistics(bullish),
      bearish_surprise: computeReturnStatistics(bearish),
      neutral: computeReturnStatistics(neutral),
    },
    byHorizon: {
      h1: computeReturnStatistics(getReturns("h1")),
      h4: computeReturnStatistics(getReturns("h4")),
      h24: computeReturnStatistics(getReturns("h24")),
      d3: computeReturnStatistics(getReturns("d3")),
      d7: computeReturnStatistics(getReturns("d7")),
    },
    avgVolatility,
  };
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function computeHeatmap(events: MacroEvent[]): HeatmapData {
  // Hour after release → avg return
  const hourlyMap = new Map<number, number[]>();
  for (const ev of events) {
    const hour = new Date(ev.release.date).getHours();
    const ret = ev.performance.returns.h1;
    if (ret !== null) {
      const existing = hourlyMap.get(hour) || [];
      existing.push(ret);
      hourlyMap.set(hour, existing);
    }
  }

  const hourlyReturns: HeatmapCell[] = Array.from({ length: 24 }, (_, h) => {
    const vals = hourlyMap.get(h) || [];
    return {
      label: `${String(h).padStart(2, "0")}:00`,
      value: vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null,
      count: vals.length,
    };
  });

  // Month → avg CPI/PPI impact
  const monthMap = new Map<string, number[]>();
  for (const ev of events) {
    const d = new Date(ev.release.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const ret = ev.performance.returns.h24;
    if (ret !== null) {
      const existing = monthMap.get(monthKey) || [];
      existing.push(ret);
      monthMap.set(monthKey, existing);
    }
  }

  const monthlyImpact: HeatmapCell[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, vals]) => ({
      label,
      value: vals.reduce((s, v) => s + v, 0) / vals.length,
      count: vals.length,
    }));

  return { hourlyReturns, monthlyImpact };
}

// ─── Insights Generation ─────────────────────────────────────────────────────

export function generateInsights(
  events: MacroEvent[],
  cpiStats: IndicatorStatistics,
  ppiStats: IndicatorStatistics,
): MacroInsight[] {
  const insights: MacroInsight[] = [];
  let id = 0;

  // CPI bullish insight
  if (cpiStats.byClassification.bullish_surprise.count > 0) {
    const s = cpiStats.byClassification.bullish_surprise;
    insights.push({
      id: `insight-${id++}`,
      title: `CPI Below Forecast → BTC Gains`,
      description: `When CPI came in below expectations, Bitcoin gained an average of ${s.mean.toFixed(2)}% within 24 hours with a ${s.winRate.toFixed(0)}% win rate across ${s.count} observations.`,
      metric: `+${s.mean.toFixed(2)}% avg`,
      type: "positive",
    });
  }

  // CPI bearish insight
  if (cpiStats.byClassification.bearish_surprise.count > 0) {
    const s = cpiStats.byClassification.bearish_surprise;
    insights.push({
      id: `insight-${id++}`,
      title: `CPI Above Forecast → BTC Declines`,
      description: `When CPI exceeded expectations, Bitcoin dropped an average of ${s.mean.toFixed(2)}% within 24 hours. Win rate was ${s.winRate.toFixed(0)}% across ${s.count} observations.`,
      metric: `${s.mean.toFixed(2)}% avg`,
      type: "negative",
    });
  }

  // PPI comparison to CPI
  if (ppiStats.byHorizon.h24.count > 0 && cpiStats.byHorizon.h24.count > 0) {
    const cpiVol = cpiStats.avgVolatility;
    const ppiVol = ppiStats.avgVolatility;
    insights.push({
      id: `insight-${id++}`,
      title: `${ppiVol < cpiVol ? "PPI" : "CPI"} Surprises Move BTC More`,
      description: `Historically, ${ppiVol < cpiVol ? "CPI" : "PPI"} surprises have produced larger moves than ${ppiVol < cpiVol ? "PPI" : "CPI"} (avg volatility: ${Math.max(cpiVol, ppiVol).toFixed(2)}% vs ${Math.min(cpiVol, ppiVol).toFixed(2)}%).`,
      type: "neutral",
    });
  }

  // Best single event
  const validEvents = events.filter((e) => e.performance.returns.h24 !== null);
  if (validEvents.length > 0) {
    const best = validEvents.reduce((b, e) =>
      (e.performance.returns.h24 ?? 0) > (b.performance.returns.h24 ?? 0) ? e : b,
    );
    insights.push({
      id: `insight-${id++}`,
      title: `Best Historical ${best.release.indicator} Event`,
      description: `The strongest BTC rally after ${best.release.indicator} occurred on ${formatDateShort(best.release.date)} — BTC surged +${(best.performance.returns.h24 ?? 0).toFixed(2)}% in 24 hours (${best.release.actual} vs ${best.release.forecast} forecast).`,
      metric: `+${(best.performance.returns.h24 ?? 0).toFixed(2)}%`,
      type: "positive",
    });

    // Worst single event
    const worst = validEvents.reduce((w, e) =>
      (e.performance.returns.h24 ?? 0) < (w.performance.returns.h24 ?? 0) ? e : w,
    );
    insights.push({
      id: `insight-${id++}`,
      title: `Worst Historical ${worst.release.indicator} Event`,
      description: `The strongest BTC selloff followed ${worst.release.indicator} on ${formatDateShort(worst.release.date)} — BTC fell ${(worst.performance.returns.h24 ?? 0).toFixed(2)}% in 24 hours (${worst.release.actual} vs ${worst.release.forecast} forecast).`,
      metric: `${(worst.performance.returns.h24 ?? 0).toFixed(2)}%`,
      type: "negative",
    });
  }

  return insights;
}

function formatDateShort(dateStr: string): string {
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

// ─── Full Pipeline ───────────────────────────────────────────────────────────

export async function buildMacroImpactData(): Promise<DashboardData> {
  // 1. Fetch CPI and PPI releases
  const [cpiReleases, ppiReleases] = await Promise.all([
    fetchMacroReleases("CPI"),
    fetchMacroReleases("PPI"),
  ]);

  const allReleases = [...cpiReleases, ...ppiReleases];

  if (allReleases.length === 0) {
    throw new Error("No macro releases found. The data source may be unavailable.");
  }

  // 2. Determine date range for BTC data
  const dates = allReleases.map((r) => new Date(r.date)).filter((d) => !isNaN(d.getTime()));
  const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  // Extend range: 7 days before earliest, 7 days after latest
  const fetchStart = new Date(earliestDate);
  fetchStart.setDate(fetchStart.getDate() - 1);
  const fetchEnd = new Date(latestDate);
  fetchEnd.setDate(fetchEnd.getDate() + 8);

  // 3. Fetch BTC price data
  let klines;
  try {
    klines = await fetchBTCRange(fetchStart, fetchEnd);
  } catch (error) {
    console.error("Failed to fetch BTC data:", error);
    throw new Error("Failed to fetch Bitcoin price data from Binance. Please try again later.");
  }

  // 4. Build events with BTC performance
  const events: MacroEvent[] = [];

  for (const release of allReleases) {
    const releaseTime = new Date(`${release.date}T${release.releaseTimeUTC}:00Z`);
    if (isNaN(releaseTime.getTime())) continue;

    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const threeDays = 3 * oneDay;
    const sevenDays = 7 * oneDay;

    const atAnnouncement = interpolatePrice(klines, releaseTime.getTime());
    if (atAnnouncement === null) continue;

    const prices: BTCPriceSnapshot = {
      atAnnouncement,
      after1h: interpolatePrice(klines, releaseTime.getTime() + oneHour),
      after4h: interpolatePrice(klines, releaseTime.getTime() + 4 * oneHour),
      after24h: interpolatePrice(klines, releaseTime.getTime() + oneDay),
      after3d: interpolatePrice(klines, releaseTime.getTime() + threeDays),
      after7d: interpolatePrice(klines, releaseTime.getTime() + sevenDays),
    };

    const performance = calculateBTCPerformance(prices);
    const classification = classifyEvent(release.actual, release.forecast, release.previous);
    const comparisonToPrevious = compareToPrevious(release.actual, release.previous);

    events.push({
      release,
      classification,
      comparisonToPrevious,
      btcPrices: prices,
      performance,
    });
  }

  // 5. Sort events by date descending
  events.sort((a, b) => new Date(b.release.date).getTime() - new Date(a.release.date).getTime());

  // 6. Compute statistics
  const cpiStats = computeIndicatorStatistics(events, "CPI");
  const ppiStats = computeIndicatorStatistics(events, "PPI");

  // 7. Compute insights
  const insights = generateInsights(events, cpiStats, ppiStats);

  // 8. Compute heatmaps
  const heatmap = computeHeatmap(events);

  // 9. Find best/worst events
  const eventsWithReturn = events.filter((e) => e.performance.returns.h24 !== null);
  const bestEvent =
    eventsWithReturn.length > 0
      ? eventsWithReturn.reduce((best, e) =>
          (e.performance.returns.h24 ?? 0) > (best.performance.returns.h24 ?? 0) ? e : best,
        )
      : null;
  const worstEvent =
    eventsWithReturn.length > 0
      ? eventsWithReturn.reduce((worst, e) =>
          (e.performance.returns.h24 ?? 0) < (worst.performance.returns.h24 ?? 0) ? e : worst,
        )
      : null;

  // 10. Next scheduled releases (approximate)
  const now = new Date();
  const nextCPI = findNextRelease(cpiReleases, now);
  const nextPPI = findNextRelease(ppiReleases, now);

  return {
    events,
    statistics: { cpi: cpiStats, ppi: ppiStats },
    insights,
    heatmap,
    bestEvent,
    worstEvent,
    currentMonthExpectations: { nextCPI, nextPPI },
  };
}

function findNextRelease(releases: MacroRelease[], after: Date): MacroRelease | null {
  const future = releases
    .filter((r) => new Date(r.date) > after)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return future[0] ?? null;
}
