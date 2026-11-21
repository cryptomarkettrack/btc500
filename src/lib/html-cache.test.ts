import assert from "node:assert/strict";
import test from "node:test";
import { HTML_CACHE_CONTROL, withHtmlCacheControl } from "./html-cache.ts";

const html = () =>
  new Response("<html></html>", {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

test("successful SSR documents are cached at the edge", () => {
  const response = withHtmlCacheControl(html());
  assert.equal(response.headers.get("cache-control"), HTML_CACHE_CONTROL);
  assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(response.status, 200);
});

test("endpoints that set their own cache policy are untouched", () => {
  const original = new Response("{}", {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
  const response = withHtmlCacheControl(original);
  assert.equal(response, original);
  assert.equal(response.headers.get("cache-control"), "public, s-maxage=3600");
});

test("JSON and error responses are never cached as documents", () => {
  const json = new Response("{}", { headers: { "Content-Type": "application/json" } });
  assert.equal(withHtmlCacheControl(json), json);
  assert.equal(json.headers.has("cache-control"), false);

  const error = new Response("oops", {
    status: 503,
    headers: { "Content-Type": "text/html" },
  });
  assert.equal(withHtmlCacheControl(error), error);
  assert.equal(error.headers.has("cache-control"), false);
});

test("other headers and the response body survive the header rewrite", async () => {
  const response = withHtmlCacheControl(
    new Response("hello", {
      headers: { "Content-Type": "text/html", "X-Robots-Tag": "noindex" },
    }),
  );
  assert.equal(response.headers.get("x-robots-tag"), "noindex");
  assert.equal(await response.text(), "hello");
});
