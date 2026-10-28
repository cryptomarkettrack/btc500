import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { ARCHIVED_ARTICLE_SLUGS, isArchivedArticle } from "./article-archive.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const sitemap = read("../../public/sitemap.xml");
const vercel = JSON.parse(read("../../vercel.json")) as {
  redirects?: { source: string; destination: string; permanent?: boolean }[];
};
// articles.ts pulls in ./site (no extension), which the strip-types runner
// cannot resolve, so the slug list is read from source instead of imported.
const articleSlugs = [...read("./articles.ts").matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map(
  (m) => m[1],
);

/**
 * Removed from the site on 2026-10-28 (review mandate `consolidate-declined-urls`):
 * three articles Google had crawled and declined, last re-crawled in August. A
 * noindex would keep the URLs alive in the crawl queue; a 301 ends them.
 */
const CONTRACTED_SLUGS = [
  "bitcoin-volatility",
  "bitcoin-infrastructure-exploits",
  "ondo-finance-tokenization",
];

describe("archived articles", () => {
  it("finds article slugs in the metadata file", () => {
    assert.ok(articleSlugs.length >= 10, `expected article slugs, found ${articleSlugs.length}`);
  });

  it("only archives slugs that exist", () => {
    const known = new Set(articleSlugs);
    for (const slug of ARCHIVED_ARTICLE_SLUGS) {
      assert.ok(known.has(slug), `archived slug has no article: ${slug}`);
    }
  });

  it("keeps archived articles out of the sitemap", () => {
    for (const slug of ARCHIVED_ARTICLE_SLUGS) {
      assert.ok(!sitemap.includes(`/articles/${slug}<`), `archived article in sitemap: ${slug}`);
    }
  });

  it("keeps every live article in the sitemap", () => {
    for (const slug of articleSlugs) {
      if (isArchivedArticle(slug)) continue;
      assert.ok(
        sitemap.includes(`/articles/${slug}<`),
        `live article missing from sitemap: ${slug}`,
      );
    }
  });
});

describe("contracted articles", () => {
  it("are no longer in the article metadata, so nothing links to them", () => {
    for (const slug of CONTRACTED_SLUGS) {
      assert.ok(!articleSlugs.includes(slug), `contracted slug still in articles.ts: ${slug}`);
    }
  });

  it("are out of the sitemap", () => {
    for (const slug of CONTRACTED_SLUGS) {
      assert.ok(
        !sitemap.includes(`/articles/${slug}<`),
        `contracted URL still in sitemap: ${slug}`,
      );
    }
  });

  it("permanently redirect to /articles", () => {
    for (const slug of CONTRACTED_SLUGS) {
      const match = (vercel.redirects ?? []).find((r) => r.source === `/articles/${slug}`);
      assert.ok(match, `no redirect for /articles/${slug}`);
      assert.equal(match.destination, "/articles");
      assert.equal(match.permanent, true, `redirect for /articles/${slug} must be permanent`);
    }
  });

  it("have no route file left to serve them", () => {
    for (const slug of CONTRACTED_SLUGS) {
      assert.ok(
        !existsSync(new URL(`../routes/articles.${slug}.tsx`, import.meta.url)),
        `route still exists: articles.${slug}.tsx`,
      );
    }
  });
});
