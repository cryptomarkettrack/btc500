/**
 * Edge caching for SSR documents.
 *
 * Public pages are identical for every visitor: the countdown, price and tools
 * refresh through their own queries after hydration. Caching the SSR document
 * at Vercel's Edge for one minute therefore removes a full external
 * block-height fetch (and a function invocation) from almost every page view,
 * without changing what a visitor sees. `stale-while-revalidate` lets the edge
 * serve the previous document while a fresh one is generated in the background.
 *
 * Only successful HTML responses get this header — server-function RPCs, the
 * /data/*.json endpoints (which set their own longer TTLs), assets and error
 * pages must keep their existing cache behaviour.
 */

export const HTML_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=600";

export function withHtmlCacheControl(response: Response): Response {
  if (!response.ok || response.headers.has("cache-control")) return response;
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", HTML_CACHE_CONTROL);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
