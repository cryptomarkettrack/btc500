import { createFileRoute } from "@tanstack/react-router";
import { estimateHalvingInfo, resolveHalvingInfo } from "@/lib/btc.functions";
import { renderLlmsText } from "@/lib/llms-dates";
import { LLMS_FULL_TEMPLATE } from "@/lib/llms-documents.server";

/**
 * `/llms-full.txt` — the long-form knowledge base for answer engines.
 *
 * Same treatment as `/llms.txt`: the buy, halving and sell dates are rendered
 * per request from the live model instead of being frozen in a static file, so
 * the LLM-facing surface cannot disagree with `/halving-dates` again.
 */
export const Route = createFileRoute("/llms-full.txt")({
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
          return new Response(renderLlmsText(LLMS_FULL_TEMPLATE, halving), {
            status: 200,
            headers,
          });
        } catch (err) {
          console.error("[llms-full.txt] live model unavailable, using protocol estimate:", err);
          halving = estimateHalvingInfo();
          return new Response(renderLlmsText(LLMS_FULL_TEMPLATE, halving), {
            status: 200,
            headers,
          });
        }
      },
    },
  },
});
