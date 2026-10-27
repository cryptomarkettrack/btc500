import { createFileRoute } from "@tanstack/react-router";
import { buildCycleDataset } from "@/lib/cycle-dataset";
import { lookupHistoricalPrice } from "@/lib/historical-csv";
import { getHistoricalDataset } from "@/lib/historical-price.server";
import { SITE_URL } from "@/lib/site";
import { assembleSimulatorResult } from "@/lib/simulator-result";

/**
 * Machine-readable BTC500 dataset: /data/500-day-cycles.json
 *
 * Built per request from the same daily-close archive the pages use, so a
 * writer can cite one URL and always get the numbers currently on the page.
 * CORS is open on purpose — the point is that other sites can chart it.
 *
 * A missing archive is an honest 503, never an empty file that looks like a
 * completed backtest.
 */
export const Route = createFileRoute("/data/500-day-cycles.json")({
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

          const result = assembleSimulatorResult(
            (date) => lookupHistoricalPrice(dataset, date),
            dataset.source,
            dataset.size,
          );

          const payload = buildCycleDataset(result, {
            generated: new Date().toISOString(),
            site: SITE_URL,
            archive: {
              firstDate: dataset.firstDate,
              lastDate: dataset.lastDate,
              rows: dataset.size,
              source: dataset.source,
            },
          });

          return new Response(JSON.stringify(payload, null, 2), { status: 200, headers });
        } catch (err) {
          console.error("[data/500-day-cycles] build failed:", err);
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
