/**
 * Server-side Cycle Score assembly: prices, path samples, on-chain bottoms.
 */

import { createServerFn } from "@tanstack/react-start";
import { estimateHalvingInfo, getBtcPrice, resolveHalvingInfo } from "./btc.functions";
import { HALVINGS, addDays, historicalHalvingByBlock } from "./halvings";
import { computeCycle, daysBetween } from "./phase";
import { computeCycleScore, type CycleScoreResult } from "./cycle-score";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";
import {
  BEAR_MARKET_MAX_POINTS,
  computeBearComposite,
  INDICATORS,
  type BearCompositeResult,
} from "./bear-market/config";

const BITVIEW_API = "https://bitview.space/api/series";

async function fetchBitviewCurrent(apiName: string): Promise<number | null> {
  try {
    const res = await fetch(`${BITVIEW_API}/${apiName}/day1/data`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data: (number | null)[] = await res.json();
    if (!Array.isArray(data)) return null;
    for (let i = data.length - 1; i >= 0; i--) {
      const v = data[i];
      if (v !== null && v !== undefined && !Number.isNaN(v)) return v as number;
    }
    return null;
  } catch {
    return null;
  }
}

/** Full bear-market composite (same 15 indicators / 30 pts as /bear-market). */
async function fetchBearMarketComposite(): Promise<BearCompositeResult | null> {
  try {
    const values = await Promise.all(INDICATORS.map((i) => fetchBitviewCurrent(i.apiName)));
    const byName: Record<string, number | null> = {};
    let any = false;
    INDICATORS.forEach((ind, idx) => {
      byName[ind.name] = values[idx];
      if (values[idx] != null) any = true;
    });
    if (!any) return null;
    return computeBearComposite(byName);
  } catch {
    return null;
  }
}

async function priceOnDate(dateStr: string): Promise<number | null> {
  const { getHistoricalBtcPrice } = await import("./historical-price.server");
  return getHistoricalBtcPrice(dateStr);
}

/**
 * Sample price at a day-offset from a halving, return multiple of day-0 price.
 */
async function cycleMultipleAtOffset(
  halvingDate: string,
  dayOffset: number,
): Promise<number | null> {
  const [base, sample] = await Promise.all([
    priceOnDate(halvingDate),
    priceOnDate(addDays(halvingDate, dayOffset)),
  ]);
  if (base == null || sample == null || base <= 0) return null;
  return sample / base;
}

async function estimateCycleDrawdown(
  lastHalvingDate: string,
  currentPrice: number,
): Promise<number | null> {
  // Sample ~every 14 days from last halving to today for a cheap peak estimate
  const start = lastHalvingDate.slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);
  try {
    const { getHistoricalBtcPricesRange } = await import("./historical-price.server");
    const range = await getHistoricalBtcPricesRange(start, end);
    const map = range.data;
    let peak = currentPrice;
    // Also include sparse sampling via historical if CSV is thin at the end
    if (map.size > 0) {
      for (const p of map.values()) {
        if (p > peak) peak = p;
      }
    } else {
      // Fallback: monthly samples
      const cursor = new Date(start + "T00:00:00Z");
      const endD = new Date(end + "T00:00:00Z");
      while (cursor <= endD) {
        const ds = cursor.toISOString().slice(0, 10);
        const p = await priceOnDate(ds);
        if (p != null && p > peak) peak = p;
        cursor.setUTCDate(cursor.getUTCDate() + 30);
      }
    }
    if (peak <= 0) return null;
    return Math.max(0, (peak - currentPrice) / peak);
  } catch {
    return null;
  }
}

async function buildCycleScore(): Promise<CycleScoreResult> {
  const now = new Date();

  const [halving, priceRes, bearComposite] = await Promise.all([
    resolveHalvingInfo(),
    getBtcPrice().catch(() => null),
    fetchBearMarketComposite().catch(() => null),
  ]);

  const nextHalving = new Date(halving.nextHalvingDate);
  const lastHalving = new Date(halving.lastHalvingDate);
  const cycle = computeCycle(now, nextHalving, lastHalving);

  const daysFromLastHalving = Math.max(0, daysBetween(lastHalving, now));
  const daysUntilHalving = Math.max(0, daysBetween(now, nextHalving));
  const currentPrice = priceRes?.price ?? null;

  const lastHalvingDateStr =
    historicalHalvingByBlock(halving.lastHalvingBlock)?.date ||
    lastHalving.toISOString().slice(0, 10) ||
    HALVINGS[HALVINGS.length - 1]?.date;

  // Prefer completed prior cycles for path comparison (avoid comparing against "current" incomplete cycle)
  const comparable = HALVINGS.filter((h) => h.date < lastHalvingDateStr);

  const historicalMultiples: number[] = [];
  try {
    const results = await Promise.all(
      comparable.map((h) => cycleMultipleAtOffset(h.date, daysFromLastHalving)),
    );
    for (const m of results) {
      if (m != null && Number.isFinite(m) && m > 0) historicalMultiples.push(m);
    }
  } catch (err) {
    console.warn("[cycle-score] historical path sample failed:", err);
  }

  let currentMultiple: number | null = null;
  try {
    if (currentPrice != null && lastHalvingDateStr) {
      const base = await priceOnDate(lastHalvingDateStr);
      if (base != null && base > 0) currentMultiple = currentPrice / base;
    }
  } catch (err) {
    console.warn("[cycle-score] current multiple failed:", err);
  }

  let drawdownFromPeak: number | null = null;
  try {
    if (currentPrice != null) {
      drawdownFromPeak = await estimateCycleDrawdown(lastHalvingDateStr, currentPrice);
    }
  } catch (err) {
    console.warn("[cycle-score] drawdown estimate failed:", err);
  }

  return computeCycleScore({
    phase: cycle.phase,
    daysFromLastHalving,
    daysUntilBuy: cycle.daysUntilBuy,
    daysUntilSell: cycle.daysUntilSell,
    daysUntilHalving,
    currentPrice,
    currentMultiple,
    historicalMultiples,
    drawdownFromPeak,
    onChainBottomPoints: bearComposite?.score ?? null,
    onChainMaxPoints: bearComposite?.maxScore ?? BEAR_MARKET_MAX_POINTS,
    onChainTriggeredCount: bearComposite?.triggeredCount ?? null,
    onChainLoadedCount: bearComposite?.loadedCount ?? null,
    onChainLabel: bearComposite?.label ?? null,
    now,
  });
}

function fallbackCycleScore(): CycleScoreResult {
  const now = new Date();
  const halving = estimateHalvingInfo(now.getTime());
  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );
  return computeCycleScore({
    phase: cycle.phase,
    daysFromLastHalving: Math.max(0, daysBetween(new Date(halving.lastHalvingDate), now)),
    daysUntilBuy: cycle.daysUntilBuy,
    daysUntilSell: cycle.daysUntilSell,
    daysUntilHalving: Math.max(0, daysBetween(now, new Date(halving.nextHalvingDate))),
    currentPrice: null,
    currentMultiple: null,
    historicalMultiples: [],
    drawdownFromPeak: null,
    onChainBottomPoints: null,
    now,
  });
}

export const getCycleScore = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchWithCache(CacheKeys.cycleScore(), () => buildCycleScore(), {
      ttl: TTL.CYCLE_SCORE,
      staleWhileRevalidate: true,
    });
  } catch (err) {
    console.error("[cycle-score] failed to assemble score:", err);
    return fallbackCycleScore();
  }
});
