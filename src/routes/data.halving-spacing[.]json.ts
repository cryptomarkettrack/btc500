import { createFileRoute } from "@tanstack/react-router";
import {
  buildSpacingDataset,
  computeSpacingReport,
  SPACING_DATASET_SCHEMA,
} from "@/lib/halving-spacing";
import { getHistoricalDataset } from "@/lib/historical-price.server";
import { SITE_URL } from "@/lib/site";

/**
 * Machine-readable halving-spacing dataset: /data/halving-spacing.json
 *
 * Built per request from the same daily-close archive the pages use, so a
 * writer quoting "the 500-day rule at 400 or 600 days" can cite one URL and
 * always get the numbers currently on /halving-spacing. CORS is open on
 * purpose — the point is that other sites can chart it.
 *
 * A missing archive is an honest 503, never an empty file that looks like a
 * finished test.
 */
export const Route = createFileRoute("/data/halving-spacing.json")({
  server: {
    handlers: {
      GET: async () => {
        const headers = {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        };

        try {
          const dataset = await getHistoricalDataset();
          if (dataset.size <= 0 || !dataset.lastDate) {
            return new Response(
              JSON.stringify({
                schema: "btc500/error@1",
                error: "daily price archive unavailable",
                generated: new Date().toISOString(),
              }),
              { status: 503, headers },
            );
          }

          const payload = buildSpacingDataset(computeSpacingReport(dataset), {
            generated: new Date().toISOString(),
            site: SITE_URL,
          });

          return new Response(JSON.stringify(payload, null, 2), {
            status: 200,
            headers: { ...headers, "X-BTC500-Schema": SPACING_DATASET_SCHEMA },
          });
        } catch (err) {
          console.error("[data/halving-spacing] build failed:", err);
          return new Response(
            JSON.stringify({
              schema: "btc500/error@1",
              error: "dataset build failed",
              generated: new Date().toISOString(),
            }),
            { status: 503, headers },
          );
        }
      },
    },
  },
});
