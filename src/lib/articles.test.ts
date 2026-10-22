import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { ARCHIVED_ARTICLE_SLUGS, isArchivedArticle } from "./article-archive.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const sitemap = read("../../public/sitemap.xml");
// articles.ts pulls in ./site (no extension), which the strip-types runner
// cannot resolve, so the slug list is read from source instead of imported.
const articleSlugs = [...read("./articles.ts").matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map(
  (m) => m[1],
);

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
