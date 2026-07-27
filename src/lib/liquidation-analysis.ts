/**
 * Pure liquidation dashboard analysis helpers.
 * Keep UI-free so signals/levels can be tested and reused.
 */

import type { LiquidationData } from "./liquidation";
import { formatChartTimestamp } from "./format";

export type TimeRange = "7d" | "30d" | "all";

export function getRangeIndex(dataLength: number, range: TimeRange): number {
  if (range === "all") return 0;
  if (range === "7d") return Math.max(0, dataLength - 7 * 6); // ~6 4h candles/day × 7
  if (range === "30d") return Math.max(0, dataLength - 30 * 6);
  return 0;
}

export function sliceLiquidationData(data: LiquidationData, timeRange: TimeRange) {
  const kLen = data.klines.length;
  const idx = getRangeIndex(kLen, timeRange);
  const scale = (len: number) => Math.max(0, Math.floor(idx * (len / kLen)));

  return {
    klines: data.klines.slice(idx),
    openInterestHistory: data.openInterestHistory.slice(scale(data.openInterestHistory.length)),
    longShortRatios: data.longShortRatios.slice(scale(data.longShortRatios.length)),
    topTraderRatios: data.topTraderRatios.slice(scale(data.topTraderRatios.length)),
    fundingRates: data.fundingRates.slice(scale(data.fundingRates.length)),
    takerRatios: data.takerRatios.slice(scale(data.takerRatios.length)),
  };
}

export type SlicedLiquidation = ReturnType<typeof sliceLiquidationData>;

export function buildPriceOiChartData(sliced: SlicedLiquidation) {
  return sliced.klines.map((k) => {
    const match = sliced.openInterestHistory.find(
      (oi) => Math.abs(oi.timestamp - k.timestamp) < 4 * 60 * 60 * 1000,
    );
    return {
      time: formatChartTimestamp(k.timestamp),
      price: k.close,
      oi: match?.oi ?? null,
      oiValue: match?.oiValue ?? null,
      volume: k.volume,
    };
  });
}

export function buildLongShortChartData(sliced: SlicedLiquidation) {
  return sliced.longShortRatios.map((r, i) => {
    const top = sliced.topTraderRatios[i];
    return {
      time: formatChartTimestamp(r.timestamp),
      longRatio: r.longRatio,
      shortRatio: r.shortRatio,
      ratio: r.ratio,
      topLongRatio: top?.longRatio ?? 0,
      topShortRatio: top?.shortRatio ?? 0,
    };
  });
}

export function buildFundingChartData(sliced: SlicedLiquidation) {
  return sliced.fundingRates.map((f) => ({
    time: formatChartTimestamp(f.timestamp),
    rate: f.rate * 100,
    markPrice: f.markPrice,
  }));
}

export function buildTakerChartData(sliced: SlicedLiquidation) {
  return sliced.takerRatios.map((t) => ({
    time: formatChartTimestamp(t.timestamp),
    buyRatio: t.buyRatio,
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
    | "extreme_positive"
    | "positive"
    | "neutral"
    | "negative"
    | "extreme_negative" =
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
      detail: `Buy ratio avg ${(avgBuyRatio * 100).toFixed(1)}% — aggressive buyers dominating, real demand.`,
    });
  } else if (takerBias === "sellers") {
    signals.push({
      label: "Taker Volume",
      bullish: false,
      detail: `Buy ratio avg ${(avgBuyRatio * 100).toFixed(1)}% — aggressive sellers dominating, real sell pressure.`,
    });
  } else {
    signals.push({
      label: "Taker Volume",
      bullish: null,
      detail: "Buy ratio balanced — no clear taker dominance.",
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
  price: number;
  volume: number;
}

export function computeLiqZones(data: LiquidationData): LiqZone[] {
  const buckets: Record<string, number> = {};
  const bucketSize = 100;
  for (const k of data.klines) {
    const mid = Math.round((k.high + k.low) / 2 / bucketSize) * bucketSize;
    const key = String(mid);
    buckets[key] = (buckets[key] || 0) + k.volume;
  }
  return Object.entries(buckets)
    .map(([price, volume]) => ({ price: Number(price), volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 15);
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
    .filter(
      (l) => Math.abs(l - latestPrice) / latestPrice < 0.08 && Math.abs(l - latestPrice) > 50,
    )
    .map((l) => {
      const isAbove = l > latestPrice;
      const isSwingHigh = swingHighs.some((sh) => Math.abs(sh - l) < 300);
      const isSwingLow = swingLows.some((sl) => Math.abs(sl - l) < 300);
      const isVolZone = volLevels.some((v) => Math.abs(v - l) < 300);
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
