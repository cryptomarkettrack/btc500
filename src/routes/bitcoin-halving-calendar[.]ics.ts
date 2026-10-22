import { createFileRoute } from "@tanstack/react-router";
import { fetchBlockHeight } from "@/lib/btc.functions";
import { buildIcs } from "@/lib/cycle-calendar";
import { halvingCalendarEvents } from "@/lib/halving-calendar";
import {
  buildHalvingCycles,
  buildHalvingEstimate,
  estimateCurrentBlockHeight,
  fallbackInterval,
} from "@/lib/halvings";

/**
 * Downloadable / subscribable BTC500 calendar.
 *
 * Dates are projected from the same halving model as every page on the site,
 * so the file cannot drift from the live countdown. If the tip-height call
 * fails the protocol-time estimate is used and the events stay labelled
 * "estimated" either way.
 *
 * The response is cacheable for an hour: the dates move by days, not seconds.
 */
export const Route = createFileRoute("/bitcoin-halving-calendar.ics")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date();

        let height: number | null = null;
        try {
          height = await fetchBlockHeight();
        } catch {
          // Protocol schedule below still produces a valid, labelled estimate.
        }

        const estimate = buildHalvingEstimate({
          height: height ?? estimateCurrentBlockHeight(now.getTime()),
          heightSource: height === null ? "estimated" : "live",
          interval: fallbackInterval(),
          observedAt: now.getTime(),
        });

        const cycles = buildHalvingCycles(now.getTime(), estimate);
        const nextCycle = cycles.find((cycle) => cycle.dateKind === "estimated") ?? cycles.at(-1);
        if (!nextCycle) {
          return new Response("No cycle available", { status: 503 });
        }

        const body = buildIcs(halvingCalendarEvents(nextCycle), {
          name: "BTC500 — Bitcoin halving & 500-day windows",
          description:
            "Buy 500 days before the Bitcoin halving, sell 500 days after. Dates are block-height estimates; the live countdown is at https://btc500.net/",
          now,
        });

        return new Response(body, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="btc500-bitcoin-halving-calendar.ics"',
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
