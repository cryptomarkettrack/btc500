import { createFileRoute } from "@tanstack/react-router";
import { lookupHistoricalPrice } from "@/lib/historical-csv";
import { getHistoricalDataset } from "@/lib/historical-price.server";
import { daysToBuyPoint, drawdownFromHigh } from "@/lib/buy-signal";
import { formatUsd } from "@/lib/format";
import { renderSignalOgImage } from "@/lib/og-png";

/**
 * Live Twitter/OpenGraph card: https://btc500.net/api/og
 *
 * The countdown and the price are computed at request time from the same
 * daily-close archive and fixed UTC buy point used by the pages, so every
 * share of / and /is-now-the-buy-point previews the current signal.
 */
export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date();
        const days = daysToBuyPoint(now);

        let price: number | null = null;
        try {
          const dataset = await getHistoricalDataset();
          if (dataset.lastDate) price = lookupHistoricalPrice(dataset, dataset.lastDate);
        } catch (err) {
          console.error("[api/og] last close unavailable:", err);
        }

        const drawdown = drawdownFromHigh(price);
        const png = renderSignalOgImage({
          tMinusDays: days >= 0 ? String(days) : String(Math.abs(days)),
          headline:
            days >= 0 ? `T-minus ${days} ${days === 1 ? "day" : "days"}` : "Buy window is OPEN",
          price: price == null ? "n/a" : formatUsd(price),
          drawdown: drawdown == null ? "n/a" : `−${Math.abs(drawdown).toFixed(2)}%`,
        });

        return new Response(new Uint8Array(png), {
          headers: {
            "Content-Type": "image/png",
            "Content-Length": String(png.length),
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
