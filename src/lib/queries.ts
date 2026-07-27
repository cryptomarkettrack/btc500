/**
 * Shared TanStack Query option factories.
 * Keeps query keys and stale/refetch intervals consistent across routes.
 */

import { queryOptions } from "@tanstack/react-query";
import { getHalvingInfo, getBtcPrice } from "@/lib/btc.functions";
import { getSimulatorData } from "@/lib/simulator.functions";
import { getTimelineData } from "@/lib/timeline.functions";
import { getDcaData } from "@/lib/dca.functions";

const HOUR = 60 * 60_000;
const MINUTE = 60_000;

export const halvingQuery = queryOptions({
  queryKey: ["halving"],
  queryFn: () => getHalvingInfo(),
  staleTime: HOUR,
  refetchInterval: HOUR,
});

export const btcPriceQuery = queryOptions({
  queryKey: ["btc-price"],
  queryFn: () => getBtcPrice(),
  staleTime: MINUTE,
  refetchInterval: MINUTE,
});

export const simulatorQuery = queryOptions({
  queryKey: ["simulator"],
  queryFn: () => getSimulatorData(),
  staleTime: HOUR,
  refetchInterval: HOUR,
});

/** Home page preview uses a distinct key so it can be prefetched independently. */
export const simulatorPreviewQuery = queryOptions({
  queryKey: ["simulator-preview"],
  queryFn: () => getSimulatorData(),
  staleTime: HOUR,
  refetchInterval: HOUR,
});

export const timelineQuery = queryOptions({
  queryKey: ["timeline"],
  queryFn: () => getTimelineData(),
  staleTime: HOUR,
  refetchInterval: HOUR,
});

export const dcaQuery = (dcaBuyDays: number, dcaSellDays: number) =>
  queryOptions({
    queryKey: ["dca", dcaBuyDays, dcaSellDays],
    queryFn: () => getDcaData({ data: { dcaBuyDays, dcaSellDays } }),
    staleTime: HOUR,
    refetchInterval: HOUR,
  });
