// ─── Macro Event Types ───────────────────────────────────────────────────────

export type MacroIndicator = "CPI" | "PPI";

export type EventClassification = "bullish_surprise" | "bearish_surprise" | "neutral";

export type ComparisonToPrevious = "lower" | "higher" | "equal";

export interface MacroRelease {
  /** ISO date string of the release */
  date: string;
  /** Release time in UTC (e.g., "13:30") */
  releaseTimeUTC: string;
  /** Indicator type */
  indicator: MacroIndicator;
  /** Actual value (e.g., 3.0) */
  actual: number | null;
  /** Forecast/consensus value */
  forecast: number | null;
  /** Previous release value */
  previous: number | null;
}

export interface BTCPriceSnapshot {
  /** Price at the time of announcement */
  atAnnouncement: number;
  /** Price 1 hour after */
  after1h: number | null;
  /** Price 4 hours after */
  after4h: number | null;
  /** Price 24 hours after */
  after24h: number | null;
  /** Price 3 days after */
  after3d: number | null;
  /** Price 7 days after */
  after7d: number | null;
}

export interface BTCPerformance {
  /** Returns at various time horizons */
  returns: {
    h1: number | null;
    h4: number | null;
    h24: number | null;
    d3: number | null;
    d7: number | null;
  };
  /** Absolute returns (same structure) */
  absoluteChange: {
    h1: number | null;
    h4: number | null;
    h24: number | null;
    d3: number | null;
    d7: number | null;
  };
  /** Maximum positive move during first 24h */
  maxMove24h: number | null;
  /** Maximum drawdown during first 24h */
  maxDrawdown24h: number | null;
}

export interface MacroEvent {
  release: MacroRelease;
  classification: EventClassification;
  comparisonToPrevious: ComparisonToPrevious;
  btcPrices: BTCPriceSnapshot;
  performance: BTCPerformance;
}

// ─── Statistics ──────────────────────────────────────────────────────────────

export interface ReturnStatistics {
  mean: number;
  median: number;
  stdDev: number;
  winRate: number;
  maxGain: number;
  maxLoss: number;
  count: number;
}

export interface IndicatorStatistics {
  indicator: MacroIndicator;
  /** Stats grouped by classification */
  byClassification: {
    bullish_surprise: ReturnStatistics;
    bearish_surprise: ReturnStatistics;
    neutral: ReturnStatistics;
  };
  /** Stats at different time horizons */
  byHorizon: {
    h1: ReturnStatistics;
    h4: ReturnStatistics;
    h24: ReturnStatistics;
    d3: ReturnStatistics;
    d7: ReturnStatistics;
  };
  /** Average volatility (maxMove24h average) */
  avgVolatility: number;
}

// ─── Insights ────────────────────────────────────────────────────────────────

export interface MacroInsight {
  id: string;
  title: string;
  description: string;
  metric?: string;
  type: "positive" | "negative" | "neutral";
}

// ─── Heatmap Data ────────────────────────────────────────────────────────────

export interface HeatmapCell {
  label: string;
  value: number | null;
  count: number;
}

export interface HeatmapData {
  /** Hour after release vs avg return */
  hourlyReturns: HeatmapCell[];
  /** Month vs avg CPI/PPI impact */
  monthlyImpact: HeatmapCell[];
}

// ─── Dashboard Data ──────────────────────────────────────────────────────────

export interface DashboardData {
  events: MacroEvent[];
  statistics: {
    cpi: IndicatorStatistics;
    ppi: IndicatorStatistics;
  };
  insights: MacroInsight[];
  heatmap: HeatmapData;
  bestEvent: MacroEvent | null;
  worstEvent: MacroEvent | null;
  currentMonthExpectations: {
    nextCPI: MacroRelease | null;
    nextPPI: MacroRelease | null;
  };
}

// ─── Binance Kline ───────────────────────────────────────────────────────────

export interface BinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteAssetVolume: number;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: number;
  takerBuyQuoteAssetVolume: number;
}
