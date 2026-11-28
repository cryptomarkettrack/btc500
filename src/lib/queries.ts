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
import { unavailableSimulatorResult, getSimulatorData } from "@/lib/simulator.functions";
import { getSpacingData } from "@/lib/spacing.functions";
import { emptySpacingReport } from "@/lib/halving-spacing";
import { emptyTimelinePayload, getTimelineData } from "@/lib/timeline.functions";
import { getBtcPriceAt, getBtcPriceForDate } from "@/lib/historical-price.server";
import { getSignalPrice } from "@/lib/buy-signal.functions";

const MINUTE = 60_000;
const NETWORK_REFRESH_MS = 10 * 60_000;
const HOUR = 60 * 60_000;

export const NETWORK_STALE_MS = NETWORK_REFRESH_MS;

export const halvingQuery = queryOptions({
  queryKey: ["halving"],
  queryFn: () => getHalvingInfo(),
  staleTime: NETWORK_REFRESH_MS,
  refetchInterval: NETWORK_REFRESH_MS,
  refetchOnMount: true,
  // Last-resort seed for renders that never ran the root loader (tests, error
  // boundaries). Routes are normally seeded from a live tip-height snapshot in
  // src/lib/seed-halving.ts so the SSR HTML and hydrated client match.
  initialData: (): HalvingInfo => estimateHalvingInfo(),
  initialDataUpdatedAt: 0,
});

export const btcPriceQuery = queryOptions({
  queryKey: ["btc-price"],
  queryFn: () => getBtcPrice(),
  staleTime: MINUTE,
  refetchInterval: MINUTE,
});

/** Last daily close used by the 500-day signal cards (same archive as the backtest). */
export const signalPriceQuery = queryOptions({
  queryKey: ["signal-price"],
  queryFn: () => getSignalPrice(),
  staleTime: HOUR,
});

/** Entry (buy) price of the current cycle's T−500 date, for live P&L tracking. */
export const buyPriceQuery = (buyDate: string) =>
  queryOptions({
    queryKey: ["buy-price", buyDate],
    queryFn: async () => {
      try {
        return await getBtcPriceForDate({ data: { date: buyDate } });
      } catch (err) {
        console.error("[buy-price] query failed:", err);
        return null;
      }
    },
    staleTime: HOUR,
    refetchInterval: HOUR,
  });

/**
 * Entry mark for the live P&L: the hourly BTC/USD close at the exact T−500 buy
 * timestamp. The bar is final as soon as the buy hour ends, so a visitor entering
 * on the buy day already sees a marked position instead of an empty placeholder.
 */
export const buyPointPriceQuery = (buyPointISO: string) =>
  queryOptions({
    queryKey: ["buy-point-price", buyPointISO],
    queryFn: async () => {
      try {
        return await getBtcPriceAt({ data: { iso: buyPointISO } });
      } catch (err) {
        console.error("[buy-point-price] query failed:", err);
        return null;
      }
    },
    // The hourly bar is final — no client poll after the first fetch.
    staleTime: HOUR,
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

/**
 * The halving-spacing test (400 / 500 / 600 days), computed server-side from
 * the shared daily-close archive. Same stale window as the simulator.
 */
export const spacingQuery = queryOptions({
  queryKey: ["halving-spacing"],
  queryFn: async () => {
    try {
      return await getSpacingData();
    } catch (err) {
      console.error("[halving-spacing] query failed:", err);
      return emptySpacingReport();
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
