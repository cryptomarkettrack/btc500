/**
 * Shared TanStack Query option factories.
 * Keeps query keys and stale/refetch intervals consistent across routes.
 */

import { queryOptions } from "@tanstack/react-query";
import {
  getHalvingInfo,
  getBtcPrice,
  estimateHalvingInfo,
  type HalvingInfo,
} from "@/lib/btc.functions";
import { emptySimulatorCycles, getSimulatorData } from "@/lib/simulator.functions";
import { emptyTimelineData, getTimelineData } from "@/lib/timeline.functions";
import { emptyDcaCycles, getDcaData } from "@/lib/dca.functions";
import { getCycleScore } from "@/lib/cycle-score.functions";

const HOUR = 60 * 60_000;
const MINUTE = 60_000;
const QUARTER_HOUR = 15 * 60_000;

export const halvingQuery = queryOptions({
  queryKey: ["halving"],
  queryFn: () => getHalvingInfo(),
  staleTime: HOUR,
  refetchInterval: HOUR,
  // Deterministic estimate is provided synchronously so the hero renders instantly on
  // BOTH the SSR server and the client with the SAME snapshot — avoiding a hydration
  // mismatch between the server's time and the client's time. The live block height is
  // fetched in the background after mount and refines these values.
  initialData: (): HalvingInfo => estimateHalvingInfo(),
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
      return { cycles: emptySimulatorCycles() };
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
      return { cycles: emptySimulatorCycles() };
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
      return emptyTimelineData();
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
