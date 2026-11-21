import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";

import { resolveDuePredictions } from "@/lib/clash/service";

/**
 * Protected settlement endpoint called by Vercel Cron (daily on Hobby plans).
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; the secret never reaches
 * the client bundle. Returns a count so stuck pending predictions are visible.
 */
export const Route = createFileRoute("/api/cron/clash-resolve")({
  server: {
    handlers: {
      GET: async () => {
        const headers = {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        };
        const configured = process.env.CRON_SECRET;
        const provided = getRequest().headers.get("authorization");
        if (!configured || provided !== `Bearer ${configured}`) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
            status: 401,
            headers,
          });
        }

        try {
          const result = await resolveDuePredictions();
          return new Response(JSON.stringify({ ok: true, ...result }), { status: 200, headers });
        } catch (error) {
          console.error("[clash/cron] settlement failed:", error);
          return new Response(JSON.stringify({ ok: false, error: "settlement failed" }), {
            status: 500,
            headers,
          });
        }
      },
    },
  },
});
