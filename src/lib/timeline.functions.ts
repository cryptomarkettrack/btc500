import { createServerFn } from "@tanstack/react-start";
import { estimateFromHalvingInfo, resolveHalvingInfo } from "./btc.functions";
import { buildHalvingCycles, selectTimelineCycles } from "./halvings";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";
import {
  DEFAULT_TIMELINE_INVESTMENT,
  emptyTimelineData,
  fallbackPreviousCycle,
  timelineCycleFromPrices,
  type TimelineCycle,
  type TimelineData,
  type TimelineDay,
} from "./timeline-build";

export type { TimelineCycle, TimelineData, TimelineDay };
export { DEFAULT_TIMELINE_INVESTMENT, emptyTimelineData };

export function emptyTimelinePayload(nowMs = Date.now()): TimelineData {
  const day = new Date(nowMs).toISOString().slice(0, 10);
  const cycles = buildHalvingCycles(nowMs, {
    nextHalvingBlock: 1_050_000,
    lastHalvingBlock: 840_000,
    currentHeight: 840_000,
    heightSource: "estimated",
    estimatedTimestamp: new Date(nowMs).toISOString(),
    estimatedDate: day,
    intervalSeconds: 600,
    intervalSource: "fallback-protocol",
    confidence: "low",
    blocksRemaining: 210_000,
  });
  const selected = selectTimelineCycles(cycles);
  return emptyTimelineData(selected.current, selected.previous ?? fallbackPreviousCycle(nowMs));
}

async function buildTimelineDataInternal(
  investment = DEFAULT_TIMELINE_INVESTMENT,
): Promise<TimelineData> {
  const nowMs = Date.now();
  const asOfDay = new Date(nowMs).toISOString().slice(0, 10);
  const halvingInfo = await resolveHalvingInfo(nowMs);
  const cycles = buildHalvingCycles(nowMs, estimateFromHalvingInfo(halvingInfo));
  const selected = selectTimelineCycles(cycles);
  const previousMeta = selected.previous ?? fallbackPreviousCycle(nowMs);

  const { getHistoricalBtcPricesRange } = await import("./historical-price.server");
  const [currentRange, prevRange] = await Promise.all([
    getHistoricalBtcPricesRange(selected.current.tMinus500, selected.current.tPlus500, asOfDay),
    getHistoricalBtcPricesRange(previousMeta.tMinus500, previousMeta.tPlus500, asOfDay),
  ]);

  const currentCycle = timelineCycleFromPrices(selected.current, currentRange.data, investment, {
    carryForwardMissing: false,
  });
  const previousCycle = timelineCycleFromPrices(previousMeta, prevRange.data, investment, {
    carryForwardMissing: previousMeta.performanceKind === "realized",
  });

  const missingDates = [...currentRange.missingDates, ...prevRange.missingDates];
  const source = [currentRange.source, prevRange.source].filter(Boolean).join("+");
  const anyDays = currentCycle.days.length + previousCycle.days.length;
  const completeness =
    currentRange.completeness === "complete" && prevRange.completeness === "complete"
      ? "complete"
      : anyDays === 0
        ? "empty"
        : "partial";
  const status =
    completeness === "complete" ? "ok" : completeness === "partial" ? "partial" : "unavailable";

  console.info(
    `[getTimelineData] prevDays=${previousCycle.days.length} prevBuy=$${previousCycle.buyPrice} currentDays=${currentCycle.days.length} status=${status}`,
  );

  return {
    investment,
    currentCycle,
    previousCycle,
    status,
    completeness,
    source,
    missingDates,
    ...(status === "unavailable"
      ? { error: { code: "unavailable" as const, message: "Historical data could not be loaded." } }
      : {}),
  };
}

export const getTimelineData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchWithCache(
      CacheKeys.timeline(),
      () => buildTimelineDataInternal(DEFAULT_TIMELINE_INVESTMENT),
      {
        ttl: TTL.TIMELINE,
        staleWhileRevalidate: true,
      },
    );
  } catch (err) {
    console.error("[timeline] failed to build historical timeline:", err);
    return emptyTimelinePayload();
  }
});
