import { createFileRoute } from "@tanstack/react-router";
import { estimateHalvingInfo, resolveHalvingInfo } from "@/lib/btc.functions";
import { renderLlmsText } from "@/lib/llms-dates";
import { LLMS_TEMPLATE } from "@/lib/llms-documents.server";

/**
 * `/llms.txt` — the two-line-per-fact summary an answer engine reads.
 *
 * Rendered per request from the live halving model so its buy, halving and sell
 * dates are the same three dates `/bitcoin-500-day-cycle` and `/halving-dates`
 * show. Before 2026-11-12 this file was static and stated "November 28, 2026"
 * while both pages rendered "November 29, 2026".
 *
 * If the live block height is unreachable, `resolveHalvingInfo` already falls
 * back to the labelled protocol estimate, so the file is never served with a
 * literal `{{TOKEN}}` in it.
 */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const headers = {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        };

        let halving;
        try {
          halving = await resolveHalvingInfo();
          return new Response(renderLlmsText(LLMS_TEMPLATE, halving), { status: 200, headers });
        } catch (err) {
          console.error("[llms.txt] live model unavailable, using protocol estimate:", err);
          halving = estimateHalvingInfo();
          return new Response(renderLlmsText(LLMS_TEMPLATE, halving), { status: 200, headers });
        }
      },
    },
  },
});
