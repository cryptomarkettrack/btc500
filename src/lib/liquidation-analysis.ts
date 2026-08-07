/**
 * Pure liquidation dashboard analysis helpers.
 * Keep UI-free so signals/levels can be tested and reused.
 */

import type { LiquidationData } from "./liquidation";
import { formatChartTimestamp } from "./format";

export type TimeRange = "7d" | "30d" | "all";

/** ~6 × 4h candles per day */
const CANDLES_PER_DAY = 6;

export function getRangeIndex(dataLength: number, range: TimeRange): number {
  if (range === "all") return 0;
  if (range === "7d") return Math.max(0, dataLength - 7 * CANDLES_PER_DAY);
  if (range === "30d") return Math.max(0, dataLength - 30 * CANDLES_PER_DAY);
  return 0;
}

/**
 * Slice all series by the kline time window so ranges stay aligned
 * even when series have different sampling frequencies.
 */
export function sliceLiquidationData(data: LiquidationData, timeRange: TimeRange) {
  const kLen = data.klines.length;
  const idx = getRangeIndex(kLen, timeRange);
  const startTs = data.klines[idx]?.timestamp ?? 0;

  const after = <T extends { timestamp: number }>(arr: T[]) =>
    startTs > 0 ? arr.filter((d) => d.timestamp >= startTs) : arr;

  return {
    klines: data.klines.slice(idx),
    openInterestHistory: after(data.openInterestHistory),
    longShortRatios: after(data.longShortRatios),
    topTraderRatios: after(data.topTraderRatios),
    fundingRates: after(data.fundingRates),
    takerRatios: after(data.takerRatios),
  };
}

export type SlicedLiquidation = ReturnType<typeof sliceLiquidationData>;

function nearestByTime<T extends { timestamp: number }>(
  series: T[],
  ts: number,
  maxDeltaMs: number,
): T | undefined {
  let best: T | undefined;
  let bestDelta = Infinity;
  for (const point of series) {
    const delta = Math.abs(point.timestamp - ts);
    if (delta < bestDelta && delta <= maxDeltaMs) {
      best = point;
      bestDelta = delta;
    }
  }
  return best;
}

function toFiniteNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/**
 * Merge price klines with OI. Forward-fills OI so the series is continuous
 * and visible even when sample times don't align perfectly.
 */
export function buildPriceOiChartData(sliced: SlicedLiquidation) {
  const maxDelta = 6 * 60 * 60 * 1000; // allow up to 6h mismatch
  // Coerce OI fields (APIs may return strings) before merge / chart domain math.
  const oiSorted = [...sliced.openInterestHistory]
    .map((d) => ({
      timestamp: Number(d.timestamp),
      oi: toFiniteNumber(d.oi),
      oiValue: toFiniteNumber(d.oiValue),
    }))
    .filter((d): d is { timestamp: number; oi: number; oiValue: number | null } =>
      Number.isFinite(d.timestamp) && d.oi != null,
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  let oiIdx = 0;
  let lastOi: number | null = null;
  let lastOiValue: number | null = null;

  return sliced.klines.map((k) => {
    // Advance OI cursor to the latest point at or before this kline (+ small lag)
    while (oiIdx < oiSorted.length && oiSorted[oiIdx].timestamp <= k.timestamp + maxDelta) {
      lastOi = oiSorted[oiIdx].oi;
      lastOiValue = oiSorted[oiIdx].oiValue;
      oiIdx++;
    }
    // Prefer nearest within window if forward-fill is stale
    const nearest = nearestByTime(oiSorted, k.timestamp, maxDelta);
    const oi = nearest?.oi ?? lastOi;
    const oiValue = nearest?.oiValue ?? lastOiValue;

    return {
      ts: k.timestamp,
      time: formatChartTimestamp(k.timestamp),
      price: k.close,
      oi: toFiniteNumber(oi),
      oiValue: toFiniteNumber(oiValue),
      volume: k.volume,
    };
  });
}

/** Tight Y domains so small OI/price moves remain readable (not crushed to 0). */
export function computeSeriesDomain(
  values: (number | null | undefined)[],
  padRatio = 0.08,
): [number, number] | ["auto", "auto"] {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (nums.length === 0) return ["auto", "auto"];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) {
    const pad = Math.abs(min) * 0.02 || 1;
    return [min - pad, max + pad];
  }
  const span = max - min;
  const pad = span * padRatio;
  return [min - pad, max + pad];
}

export function buildLongShortChartData(sliced: SlicedLiquidation) {
  const maxDelta = 4 * 60 * 60 * 1000;
  return sliced.longShortRatios.map((r) => {
    const top = nearestByTime(sliced.topTraderRatios, r.timestamp, maxDelta);
    return {
      ts: r.timestamp,
      time: formatChartTimestamp(r.timestamp),
      longRatio: r.longRatio * 100, // % of accounts long
      shortRatio: r.shortRatio * 100,
      ratio: r.ratio,
      topLongRatio: top ? top.longRatio * 100 : null,
      topShortRatio: top ? top.shortRatio * 100 : null,
    };
  });
}

export function buildFundingChartData(sliced: SlicedLiquidation) {
  return sliced.fundingRates.map((f) => ({
    ts: f.timestamp,
    time: formatChartTimestamp(f.timestamp),
    rate: f.rate * 100, // percent for display
    markPrice: f.markPrice,
    fill: f.rate >= 0 ? "#22c55e" : "#ef4444",
  }));
}

export function buildTakerChartData(sliced: SlicedLiquidation) {
  return sliced.takerRatios.map((t) => ({
    ts: t.timestamp,
    time: formatChartTimestamp(t.timestamp),
    buyRatio: t.buyRatio, // already [0, 1]
    buyShare: t.buyRatio * 100,
    buyVolume: t.buyVolume,
    sellVolume: t.sellVolume,
  }));
}

export interface MarketSignal {
  label: string;
  bullish: boolean | null;
  detail: string;
}

export interface MarketSituation {
  signals: MarketSignal[];
  verdict: string;
  verdictColor: string;
}

export function analyzeMarketSituation(data: LiquidationData): MarketSituation | null {
  if (data.klines.length < 12) return null;

  const klines = data.klines;
  const recent = klines.slice(-12);
  const latestFunding = data.fundingRates[data.fundingRates.length - 1]?.rate ?? 0;
  const latestLS = data.longShortRatios[data.longShortRatios.length - 1];

  const priceNow = recent[recent.length - 1].close;
  const price48hAgo = recent[0]?.close ?? priceNow;
  const pricePctChange = ((priceNow - price48hAgo) / price48hAgo) * 100;
  const priceDirection: "up" | "down" | "flat" =
    pricePctChange > 1 ? "up" : pricePctChange < -1 ? "down" : "flat";

  const oiNow = data.currentOI.oi;
  const oldOIMatch = data.openInterestHistory.find(
    (oi) => Math.abs(oi.timestamp - recent[0]?.timestamp) < 6 * 60 * 60 * 1000,
  );
  const oiThen = oldOIMatch?.oi ?? oiNow;
  const oiPctChange = oiThen > 0 ? ((oiNow - oiThen) / oiThen) * 100 : 0;
  const oiDirection: "rising" | "falling" | "flat" =
    oiPctChange > 1 ? "rising" : oiPctChange < -1 ? "falling" : "flat";

  const fundingPct = latestFunding * 100;
  const fundingLevel:
    "extreme_positive" | "positive" | "neutral" | "negative" | "extreme_negative" =
    fundingPct > 0.03
      ? "extreme_positive"
      : fundingPct > 0.005
        ? "positive"
        : fundingPct > -0.005
          ? "neutral"
          : fundingPct > -0.03
            ? "negative"
            : "extreme_negative";

  const lsRatio = latestLS?.ratio ?? 1;
  const crowdSide: "long_heavy" | "balanced" | "short_heavy" =
    lsRatio > 1.2 ? "long_heavy" : lsRatio < 0.8 ? "short_heavy" : "balanced";

  const recentTakers = data.takerRatios.slice(-6);
  const avgBuyRatio =
    recentTakers.length > 0
      ? recentTakers.reduce((s, t) => s + t.buyRatio, 0) / recentTakers.length
      : 0.5;
  const takerBias: "buyers" | "sellers" | "neutral" =
    avgBuyRatio > 0.53 ? "buyers" : avgBuyRatio < 0.47 ? "sellers" : "neutral";

  const signals: MarketSignal[] = [];

  if (priceDirection === "up" && oiDirection === "rising") {
    signals.push({
      label: "Price + OI",
      bullish: true,
      detail: `Price ${pricePctChange >= 0 ? "+" : ""}${pricePctChange.toFixed(1)}% & OI ${oiPctChange >= 0 ? "+" : ""}${oiPctChange.toFixed(1)}% — new money entering longs, bullish trend.`,
    });
  } else if (priceDirection === "up" && oiDirection === "falling") {
    signals.push({
      label: "Price + OI",
      bullish: null,
      detail: `Price +${pricePctChange.toFixed(1)}% but OI ${oiPctChange.toFixed(1)}% — rally losing conviction, shorts closing.`,
    });
  } else if (priceDirection === "down" && oiDirection === "rising") {
    signals.push({
      label: "Price + OI",
      bullish: false,
      detail: `Price ${pricePctChange.toFixed(1)}% & OI +${oiPctChange.toFixed(1)}% — new shorts opening, bearish pressure.`,
    });
  } else if (priceDirection === "down" && oiDirection === "falling") {
    signals.push({
      label: "Price + OI",
      bullish: null,
      detail: `Price ${pricePctChange.toFixed(1)}% & OI ${oiPctChange.toFixed(1)}% — longs capitulating, potential bottom forming.`,
    });
  } else {
    signals.push({
      label: "Price + OI",
      bullish: null,
      detail: "Price and OI relatively flat — no clear directional signal.",
    });
  }

  if (fundingLevel === "extreme_positive") {
    signals.push({
      label: "Funding",
      bullish: false,
      detail: `Funding at ${fundingPct.toFixed(4)}% — extremely overheated, longs at risk of correction.`,
    });
  } else if (fundingLevel === "positive") {
    signals.push({
      label: "Funding",
      bullish: true,
      detail: `Funding at ${fundingPct.toFixed(4)}% — mildly bullish, longs paying a reasonable premium.`,
    });
  } else if (fundingLevel === "negative") {
    signals.push({
      label: "Funding",
      bullish: true,
      detail: `Funding at ${fundingPct.toFixed(4)}% — shorts paying longs, contrarian bullish.`,
    });
  } else if (fundingLevel === "extreme_negative") {
    signals.push({
      label: "Funding",
      bullish: true,
      detail: `Funding at ${fundingPct.toFixed(4)}% — extremely fearful, shorts vulnerable to squeeze.`,
    });
  } else {
    signals.push({
      label: "Funding",
      bullish: null,
      detail: "Funding near neutral — balanced market, no leverage imbalance.",
    });
  }

  if (crowdSide === "long_heavy") {
    signals.push({
      label: "Crowd Positioning",
      bullish: false,
      detail: `L/S ratio at ${lsRatio.toFixed(2)} — crowd is heavily long, contrarian downside risk.`,
    });
  } else if (crowdSide === "short_heavy") {
    signals.push({
      label: "Crowd Positioning",
      bullish: true,
      detail: `L/S ratio at ${lsRatio.toFixed(2)} — crowd is heavily short, contrarian upside potential.`,
    });
  } else {
    signals.push({
      label: "Crowd Positioning",
      bullish: null,
      detail: `L/S ratio at ${lsRatio.toFixed(2)} — crowd is balanced.`,
    });
  }

  if (takerBias === "buyers") {
    signals.push({
      label: "Taker Volume",
      bullish: true,
      detail: `Buy share avg ${(avgBuyRatio * 100).toFixed(1)}% — aggressive buyers dominating, real demand.`,
    });
  } else if (takerBias === "sellers") {
    signals.push({
      label: "Taker Volume",
      bullish: false,
      detail: `Buy share avg ${(avgBuyRatio * 100).toFixed(1)}% — aggressive sellers dominating, real sell pressure.`,
    });
  } else {
    signals.push({
      label: "Taker Volume",
      bullish: null,
      detail: "Buy share balanced — no clear taker dominance.",
    });
  }

  const bullishCount = signals.filter((s) => s.bullish === true).length;
  const bearishCount = signals.filter((s) => s.bullish === false).length;

  let verdict: string;
  let verdictColor: string;
  if (bullishCount >= 3) {
    verdict =
      "MARKET SITUATION: BULLISH — Most indicators favor upside. Leaning long could be favorable, but watch for overleveraged crowding.";
    verdictColor = "green";
  } else if (bearishCount >= 3) {
    verdict =
      "MARKET SITUATION: BEARISH — Most indicators favor downside. Caution for longs, consider reducing exposure.";
    verdictColor = "red";
  } else if (bullishCount > bearishCount) {
    verdict =
      "MARKET SITUATION: CAUTIOUSLY BULLISH — Mixed signals leaning positive. Mild long bias with tight stops is reasonable.";
    verdictColor = "blue";
  } else if (bearishCount > bullishCount) {
    verdict =
      "MARKET SITUATION: CAUTIOUSLY BEARISH — Mixed signals leaning negative. Defensive positioning preferred, avoid overleveraging.";
    verdictColor = "orange";
  } else {
    verdict =
      "MARKET SITUATION: NEUTRAL — Indicators are split. No strong edge either way. Wait for clearer confirmation before big moves.";
    verdictColor = "muted";
  }

  return { signals, verdict, verdictColor };
}

export interface LiqZone {
  /** Bucket midpoint */
  price: number;
  priceLow: number;
  priceHigh: number;
  /** Human label e.g. "$60k–$62k" */
  label: string;
  volume: number;
  /** Distance from latest price as % (using midpoint) */
  distancePct: number;
  side: "above" | "below" | "at";
}

/** Round raw step up to a clean price increment ($500, $1k, $2k, …). */
function niceBucketSize(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1000;
  const steps = [250, 500, 1000, 1500, 2000, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 50000];
  for (const s of steps) {
    if (s >= raw * 0.85) return s;
  }
  // Very wide ranges: round to nearest 25k / 50k
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  if (norm <= 1.5) return mag * 2;
  if (norm <= 3.5) return mag * 5;
  return mag * 10;
}

function formatZoneLabel(low: number, high: number): string {
  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `$${Math.round(n)}`;
  };
  return `${fmt(low)}–${fmt(high)}`;
}

/**
 * Coarse volume-profile clusters over recent price action.
 * Uses large buckets (~$1k–$5k at typical BTC prices) so the chart
 * shows meaningful magnets, not $100 noise levels.
 */
export function computeLiqZones(data: LiquidationData, latestPrice = 0): LiqZone[] {
  if (data.klines.length === 0) return [];

  // ~30 days of 4h candles for a wider "zoom out" profile
  const recent = data.klines.slice(-180);
  const lows = recent.map((k) => k.low);
  const highs = recent.map((k) => k.high);
  const rangeLow = Math.min(...lows);
  const rangeHigh = Math.max(...highs);
  const span = Math.max(rangeHigh - rangeLow, (latestPrice || rangeLow) * 0.05);

  // Target ~7–9 large clusters across the full range
  const bucketSize = niceBucketSize(span / 8);
  const buckets: Record<number, number> = {};

  for (const k of recent) {
    // Spread candle volume across every large bucket it trades through
    const start = Math.floor(k.low / bucketSize) * bucketSize;
    const end = Math.floor(k.high / bucketSize) * bucketSize;
    const steps = Math.max(1, Math.round((end - start) / bucketSize) + 1);
    const share = k.volume / steps;
    for (let p = start; p <= end + bucketSize * 0.001; p += bucketSize) {
      const key = Math.round(p); // avoid float keys
      buckets[key] = (buckets[key] || 0) + share;
    }
  }

  // Keep zones that have meaningful volume (drop empty / near-empty edges)
  const entries = Object.entries(buckets)
    .map(([price, volume]) => ({ price: Number(price), volume }))
    .filter((e) => e.volume > 0)
    .sort((a, b) => a.price - b.price);

  if (entries.length === 0) return [];

  const maxVol = Math.max(...entries.map((e) => e.volume));
  const minKeep = maxVol * 0.08; // drop tiny edge noise

  return entries
    .filter((e) => e.volume >= minKeep)
    .map((e) => {
      const priceLow = e.price;
      const priceHigh = e.price + bucketSize;
      const mid = priceLow + bucketSize / 2;
      const distancePct = latestPrice > 0 ? ((mid - latestPrice) / latestPrice) * 100 : 0;
      // "at" if spot sits inside this bucket
      const side: LiqZone["side"] =
        latestPrice > 0 && latestPrice >= priceLow && latestPrice < priceHigh
          ? "at"
          : distancePct > 0
            ? "above"
            : "below";
      return {
        price: mid,
        priceLow,
        priceHigh,
        label: formatZoneLabel(priceLow, priceHigh),
        volume: e.volume,
        distancePct,
        side,
      };
    });
}

export interface WatchLevel {
  price: number;
  type: string;
  expectation: string;
  isAbove: boolean;
}

export function findWatchLevels(
  data: LiquidationData,
  latestPrice: number,
  liqZones: LiqZone[],
): { above: WatchLevel[]; below: WatchLevel[] } | null {
  if (data.klines.length < 20 || latestPrice <= 0) return null;

  const recent = data.klines.slice(-50);
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  for (let i = 2; i < recent.length - 2; i++) {
    if (
      recent[i].high > recent[i - 1].high &&
      recent[i].high > recent[i - 2].high &&
      recent[i].high > recent[i + 1].high &&
      recent[i].high > recent[i + 2].high
    ) {
      swingHighs.push(recent[i].high);
    }
    if (
      recent[i].low < recent[i - 1].low &&
      recent[i].low < recent[i - 2].low &&
      recent[i].low < recent[i + 1].low &&
      recent[i].low < recent[i + 2].low
    ) {
      swingLows.push(recent[i].low);
    }
  }

  const volLevels = liqZones.map((z) => z.price);
  // Match tolerance scales with zone size (large clusters ≈ $1k–$5k)
  const zoneTol =
    liqZones.length > 0 ? Math.max(500, (liqZones[0].priceHigh - liqZones[0].priceLow) * 0.6) : 500;
  const swingTol = 400;
  const allLevels = new Set<number>([...swingHighs, ...swingLows, ...volLevels]);

  const roundBase = Math.floor(latestPrice / 1000) * 1000;
  for (let i = roundBase - 4000; i <= roundBase + 4000; i += 1000) {
    if (i > 0) allLevels.add(i);
  }
  const roundBase500 = Math.floor(latestPrice / 500) * 500;
  for (let i = roundBase500 - 2000; i <= roundBase500 + 2000; i += 500) {
    if (i > 0) allLevels.add(i);
  }

  const levels = Array.from(allLevels)
    .filter((l) => Math.abs(l - latestPrice) / latestPrice < 0.08 && Math.abs(l - latestPrice) > 50)
    .map((l) => {
      const isAbove = l > latestPrice;
      const isSwingHigh = swingHighs.some((sh) => Math.abs(sh - l) < swingTol);
      const isSwingLow = swingLows.some((sl) => Math.abs(sl - l) < swingTol);
      const isVolZone = volLevels.some((v) => Math.abs(v - l) < zoneTol);
      const isRound = l % 1000 === 0;

      let type: string;
      let expectation: string;

      if (isAbove) {
        if (isSwingHigh && isVolZone) {
          type = "Resistance + Liq Zone";
          expectation =
            "Major resistance with dense orders — expect sell pressure & short liquidation cascade if broken.";
        } else if (isSwingHigh) {
          type = "Swing High";
          expectation =
            "Previous rejection point — sellers likely defending. A breakout triggers a short squeeze.";
        } else if (isVolZone) {
          type = "Volume Cluster";
          expectation =
            "High-volume area — expect consolidation. A clean break accelerates toward the next level.";
        } else if (isRound) {
          type = "Psych Level";
          expectation =
            "Round number — limit orders typically cluster here. Breakout is a bullish signal.";
        } else {
          type = "Minor Resistance";
          expectation = "Light resistance — may cause a brief pause.";
        }
      } else {
        if (isSwingLow && isVolZone) {
          type = "Support + Liq Zone";
          expectation =
            "Major support with high volume — expect a bounce, but a breakdown triggers long liquidation cascade.";
        } else if (isSwingLow) {
          type = "Swing Low";
          expectation = "Previous bounce zone — buyers likely defending. A breakdown is bearish.";
        } else if (isVolZone) {
          type = "Volume Cluster";
          expectation =
            "High-volume area — expect buying interest. A breakdown accelerates to the next support.";
        } else if (isRound) {
          type = "Psych Level";
          expectation =
            "Round number — buy orders typically clustered here. Breakdown is a bearish signal.";
        } else {
          type = "Minor Support";
          expectation = "Light support — may cause a brief bounce.";
        }
      }

      return { price: l, type, expectation, isAbove };
    })
    .sort((a, b) => a.price - b.price);

  const above = levels.filter((l) => l.isAbove).slice(0, 2);
  const below = levels
    .filter((l) => !l.isAbove)
    .reverse()
    .slice(0, 2);

  return { above, below };
}

export interface ProposedPosition {
  direction: "LONG" | "SHORT" | null;
  entry: number;
  tp: number;
  sl: number;
  leverage: number;
  riskPct: number;
  rewardPct: number;
  rr: number;
  reasoning: string;
  investment: number;
  notional: number;
  pnlTP: number;
  pnlSL: number;
}

export function proposeFuturesPosition(
  data: LiquidationData,
  marketSituation: MarketSituation,
  latestPrice: number,
): ProposedPosition | null {
  if (latestPrice <= 0) return null;

  const { verdictColor } = marketSituation;
  const recent = data.klines.slice(-30);

  const atr =
    recent.length > 1
      ? recent.reduce((sum, k) => sum + (k.high - k.low), 0) / recent.length
      : latestPrice * 0.02;

  const swingLow = Math.min(...recent.map((k) => k.low));
  const swingHigh = Math.max(...recent.map((k) => k.high));

  let direction: "LONG" | "SHORT" | null = null;
  let entry = latestPrice;
  let tp = 0;
  let sl = 0;
  let leverage = 5;
  let reasoning = "";

  if (verdictColor === "green" || verdictColor === "blue") {
    direction = "LONG";
    entry = latestPrice;
    tp = Math.max(swingHigh, latestPrice + atr * 2.5);
    sl = Math.min(swingLow - atr * 0.3, latestPrice - atr * 1.5);
    leverage = verdictColor === "green" ? 8 : 5;
    reasoning =
      verdictColor === "green"
        ? "Strong bullish signals — multiple indicators confirm upside bias. Moderate leverage with defined risk/reward."
        : "Cautiously bullish — mixed signals leaning positive. Conservative leverage recommended.";
  } else if (verdictColor === "red" || verdictColor === "orange") {
    direction = "SHORT";
    entry = latestPrice;
    tp = Math.min(swingLow, latestPrice - atr * 2.5);
    sl = Math.max(swingHigh + atr * 0.3, latestPrice + atr * 1.5);
    leverage = verdictColor === "red" ? 8 : 5;
    reasoning =
      verdictColor === "red"
        ? "Strong bearish signals — multiple indicators confirm downside bias. Moderate leverage with defined risk/reward."
        : "Cautiously bearish — mixed signals leaning negative. Conservative leverage recommended.";
  } else {
    reasoning =
      "Market is neutral — no clear edge either way. Wait for a clearer signal before taking a directional position.";
  }

  const riskPct = direction ? Math.abs((sl - entry) / entry) * 100 : 0;
  const rewardPct = direction ? Math.abs((tp - entry) / entry) * 100 : 0;
  const rr = riskPct > 0 ? rewardPct / riskPct : 0;

  const investment = 1000;
  const notional = investment * leverage;
  const pnlTP = direction ? (rewardPct / 100) * notional : 0;
  const pnlSL = direction ? -(riskPct / 100) * notional : 0;

  return {
    direction,
    entry,
    tp,
    sl,
    leverage,
    riskPct,
    rewardPct,
    rr,
    reasoning,
    investment,
    notional,
    pnlTP,
    pnlSL,
  };
}
