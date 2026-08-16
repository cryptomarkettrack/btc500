/**
 * Shared TanStack Query option factories.
 * Keeps query keys and stale/refetch intervals consistent across routes.
 *
 * Local countdown ticks in the browser via useNow() and does not hit the network.
 * Bitcoin network state (height / interval / estimated date) refreshes on a
 * 10-minute cadence so we do not hammer upstream block APIs.
 */

import { queryOptions } from "@tanstack/react-query";
import {
  getHalvingInfo,
  getBtcPrice,
  estimateHalvingInfo,
  type HalvingInfo,
} from "@/lib/btc.functions";
import { emptyDcaCycles, getDcaData } from "@/lib/dca.functions";
import { getCycleScore } from "@/lib/cycle-score.functions";
import { unavailableSimulatorResult, getSimulatorData } from "@/lib/simulator.functions";
import { emptyTimelinePayload, getTimelineData } from "@/lib/timeline.functions";

const MINUTE = 60_000;
const NETWORK_REFRESH_MS = 10 * 60_000;
const HOUR = 60 * 60_000;
const QUARTER_HOUR = 15 * 60_000;

export const NETWORK_STALE_MS = NETWORK_REFRESH_MS;

export const halvingQuery = queryOptions({
  queryKey: ["halving"],
  queryFn: () => getHalvingInfo(),
  staleTime: NETWORK_REFRESH_MS,
  refetchInterval: NETWORK_REFRESH_MS,
  refetchOnMount: true,
  // Deterministic estimate so the hero renders instantly on both the SSR server
  // and the client with the same seeded snapshot. Marked stale so the live
  // height/interval fetch runs after mount instead of waiting a full hour.
  initialData: (): HalvingInfo => estimateHalvingInfo(),
  initialDataUpdatedAt: 0,
});

export const btcPriceQuery = queryOptions({
  queryKey: ["btc-price"],
  queryFn: () => getBtcPrice(),
  staleTime: MINUTE,
  refetchInterval: MINUTE,
});

export const simulatorQuery = queryOptions({
  queryKey: ["simulator"],
  queryFn: async () => {
    try {
      return await getSimulatorData();
    } catch (err) {
      console.error("[simulator] query failed:", err);
      return unavailableSimulatorResult(
        "unknown",
        "unknown",
        "Historical data could not be loaded.",
      );
    }
  },
  staleTime: HOUR,
  refetchInterval: HOUR,
});

/** Home page preview uses a distinct key so it can be prefetched independently. */
export const simulatorPreviewQuery = queryOptions({
  queryKey: ["simulator-preview"],
  queryFn: async () => {
    try {
      return await getSimulatorData();
    } catch (err) {
      console.error("[simulator-preview] query failed:", err);
      return unavailableSimulatorResult(
        "unknown",
        "unknown",
        "Historical data could not be loaded.",
      );
    }
  },
  staleTime: HOUR,
  refetchInterval: HOUR,
});

export const timelineQuery = queryOptions({
  queryKey: ["timeline"],
  queryFn: async () => {
    try {
      return await getTimelineData();
    } catch (err) {
      console.error("[timeline] query failed:", err);
      return emptyTimelinePayload();
    }
  },
  staleTime: HOUR,
  refetchInterval: HOUR,
});

export const dcaQuery = (dcaBuyDays: number, dcaSellDays: number) =>
  queryOptions({
    queryKey: ["dca", dcaBuyDays, dcaSellDays],
    queryFn: async () => {
      try {
        return await getDcaData({ data: { dcaBuyDays, dcaSellDays } });
      } catch (err) {
        console.error("[dca] query failed:", err);
        return { cycles: emptyDcaCycles(dcaBuyDays, dcaSellDays) };
      }
    },
    staleTime: HOUR,
    refetchInterval: HOUR,
  });

export const cycleScoreQuery = queryOptions({
  queryKey: ["cycle-score"],
  queryFn: getCycleScore,
  staleTime: QUARTER_HOUR,
  refetchInterval: QUARTER_HOUR,
  retry: 1,
});
