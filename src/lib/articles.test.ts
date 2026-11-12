import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

import { ARCHIVED_ARTICLE_SLUGS, isArchivedArticle } from "./article-archive.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

/** Every source file under a directory, relative to the repository root. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(new URL(`../../${dir}`, import.meta.url), {
    recursive: true,
  })) {
    if (!String(entry).endsWith(".ts") && !String(entry).endsWith(".tsx")) continue;
    out.push(`${dir}/${entry}`);
  }
  return out;
}

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
 *
 * `strongest-hands` was added on 2026-10-29 (review mandate
 * `declined-url-301-and-crawl-test`): it was the first URL to *lose* an index
 * (last crawl 2026-08-17), so it is the first one no amount of on-page work can
 * bring back.
 */
const CONTRACTED_SLUGS = [
  "bitcoin-volatility",
  "bitcoin-infrastructure-exploits",
  "ondo-finance-tokenization",
  "strongest-hands",
];

const machineReadable = [
  ["src/content/llms.txt", read("../content/llms.txt")],
  ["src/content/llms-full.txt", read("../content/llms-full.txt")],
  ["public/feed.xml", read("../../public/feed.xml")],
] as const;

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

  it("only offers indexable articles to internal links", () => {
    // Archived articles are `noindex, nofollow`. A link to one passes no
    // signal, so the homepage and the related-reading block must draw from
    // the indexable set instead of the newest-articles list.
    const homepage = read("../components/home/HomePage.tsx");
    const endMatter = read("../components/ArticleEndMatter.tsx");

    assert.ok(
      homepage.includes("getIndexableArticles()"),
      "homepage latest articles must use getIndexableArticles()",
    );
    assert.ok(
      endMatter.includes("getIndexableArticles()"),
      "related reading must use getIndexableArticles()",
    );
    assert.ok(
      !homepage.includes("getArticlesSorted()"),
      "homepage must not link the full article list",
    );
    assert.ok(
      !endMatter.includes("getArticlesSorted()"),
      "related reading must not link the full article list",
    );
  });

  it("keeps the /articles list structured data on the indexable articles", () => {
    const route = read("../routes/articles.tsx");
    const listSchema = route.slice(
      route.indexOf("articlesListSchema"),
      route.indexOf("export const Route"),
    );
    assert.ok(
      listSchema.includes("isArchivedArticle"),
      "ItemList schema must skip archived articles",
    );
  });

  it("never links an archived article from an indexable page", () => {
    // An archived article is `noindex, nofollow`, so a link to it passes no
    // internal-link signal. Only an archived article may link to another
    // archived article; every indexable page has to link to indexable pages.
    const archivedComponents = new Set<string>();
    for (const slug of ARCHIVED_ARTICLE_SLUGS) {
      const routePath = `src/routes/articles.${slug}.tsx`;
      archivedComponents.add(routePath);
      const route = read(`../routes/articles.${slug}.tsx`);
      for (const m of route.matchAll(/from "@\/([^"]+)"/gu)) {
        archivedComponents.add(`src/${m[1]}`);
        archivedComponents.add(`src/${m[1]}.tsx`);
      }
    }

    for (const file of sourceFiles("src")) {
      if (archivedComponents.has(file)) continue;
      // The generated route tree registers every route, including archived ones.
      if (file.endsWith(".gen.ts")) continue;
      const contents = read(`../../${file}`);
      for (const slug of ARCHIVED_ARTICLE_SLUGS) {
        // A real link target: `to="/articles/<slug>"`, `href='...'`,
        // `to={`/articles/<slug>`}`. Bare slug strings (metadata, OG image
        // paths) are not links.
        const link = new RegExp(`["'\`]/articles/${slug}["'\`]`);
        assert.ok(!link.test(contents), `${file} links to the archived (noindex) article: ${slug}`);
      }
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

  it("are gone from the machine-readable surfaces as well as the sitemap", () => {
    // llms.txt, llms-full.txt and feed.xml advertised the three 2026-10-28
    // contractions for a day after they started returning a redirect. Anything
    // that hands a URL to a crawler or an AI agent has to be killed with it.
    for (const slug of CONTRACTED_SLUGS) {
      for (const [file, contents] of machineReadable) {
        assert.ok(
          !contents.includes(`/articles/${slug}`),
          `${file} still references contracted URL: ${slug}`,
        );
      }
    }
  });
});
