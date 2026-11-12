#!/usr/bin/env node
/**
 * Pull Bing Webmaster Tools data and write two reports:
 *
 *   scripts/bing/output/inspection-*.json   per-URL index state, shaped like the
 *                                           Search Console inspection report so
 *                                           the results collector can read it
 *                                           with the same parser
 *   scripts/bing/output/bing-*.md           the human report: site stats,
 *                                           keywords, backlinks, crawl state
 *
 * Usage:
 *   node scripts/bing/fetch-bing.ts [--site=https://btc500.net] [--delay=200]
 *
 * Needs a Bing API key (see scripts/bing/SETUP.txt). Without one the script
 * prints what to do and exits 0 without writing a report, so the daily review
 * cycle is never broken by a missing key.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import {
  ConfigError,
  bingRequest,
  loadDotEnv,
  num,
  OUTPUT_DIR,
  parseBingDate,
  parseFlags,
  pick,
  readApiKey,
  siteUrl,
  sitemapUrls,
  type BingKeyword,
  type BingUrlInfo,
} from "./client.ts";

const HELP = `Bing Webmaster Tools report

Usage:
  node scripts/bing/fetch-bing.ts [options]

Options:
  --site=URL     Site as Bing knows it. Default: https://btc500.net
  --delay=MS     Pause between per-URL requests. Default: 200
  --limit=N      Only inspect the first N sitemap URLs. Default: all
  --help         Show this message

Environment:
  BING_API_KEY   Bing Webmaster API key (or scripts/bing/api-key.txt)
  BING_SITE      Default site, same as --site
`;

/** Bing returns either a bare array or { d: [...] } depending on the method. */
function asRows<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const inner = (payload as { d?: unknown }).d;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

/** Numeric fields of an unknown object, for a table that cannot guess names. */
function numericFields(payload: unknown): [string, number][] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const out: [string, number][] = [];
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    const n = Number(value);
    if (Number.isFinite(n)) out.push([key, n]);
  }
  return out;
}

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function table(headers: string[], rows: string[][]): string {
  const lines = [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`];
  for (const row of rows) lines.push(`| ${row.join(" | ")} |`);
  return lines.join("\n");
}

type IndexRow = {
  url: string;
  coverage: string;
  lastCrawl: string | null;
  httpStatus: number | null;
  discovered: string | null;
  anchors: number | null;
};

async function inspectUrls(
  site: string,
  urls: string[],
  delay: number,
): Promise<{ rows: IndexRow[]; errors: string[] }> {
  const rows: IndexRow[] = [];
  const errors: string[] = [];

  for (const url of urls) {
    try {
      const info = await bingRequest<BingUrlInfo>("GetUrlInfo", {
        query: { siteUrl: site, url },
      });
      if (!info) {
        rows.push({
          url,
          coverage: "Unknown to Bing",
          lastCrawl: null,
          httpStatus: null,
          discovered: null,
          anchors: null,
        });
      } else {
        const httpStatus = pick<number>(info as never, ["HttpStatus"]) ?? null;
        const lastCrawled = parseBingDate(info.LastCrawledDate);
        const discovered = parseBingDate(info.DiscoveryDate);
        const anchors = pick<number>(info as never, ["AnchorCount"]) ?? null;
        // Bing has no GSC-style coverage vocabulary, so map onto it:
        // a page Bing has crawled and can fetch is indexed; anything else is not.
        const coverage =
          httpStatus === 200 && lastCrawled
            ? "Submitted and indexed"
            : httpStatus === 200
              ? "Discovered - currently not indexed"
              : httpStatus
                ? `HTTP ${httpStatus}`
                : "Discovered - currently not indexed";
        rows.push({ url, coverage, lastCrawl: lastCrawled, httpStatus, discovered, anchors });
      }
    } catch (error) {
      const message = (error as Error).message.split("\n")[0];
      errors.push(`${url}: ${message}`);
      rows.push({
        url,
        coverage: "Unknown to Bing",
        lastCrawl: null,
        httpStatus: null,
        discovered: null,
        anchors: null,
      });
    }
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return { rows, errors };
}

async function main(): Promise<void> {
  loadDotEnv();
  const flags = parseFlags(process.argv.slice(2));
  if (flags.get("help") === "true") {
    console.log(HELP);
    return;
  }

  if (!readApiKey()) {
    console.log(
      "Bing: no API key yet — skipping the Bing report.\n" +
        "See scripts/bing/SETUP.txt (Settings -> API Access -> Generate API Key),\n" +
        "then put BING_API_KEY in .env.local and run this again.",
    );
    return;
  }

  const site = flags.get("site") ?? siteUrl();
  const delay = Number(flags.get("delay") ?? 200);
  const limit = flags.get("limit") ? Number(flags.get("limit")) : Number.POSITIVE_INFINITY;
  const urls = sitemapUrls()
    .map((entry) => entry.url)
    .slice(0, limit);

  console.log(`Site:  ${site}`);
  console.log(`URLs:  ${urls.length} from public/sitemap.xml`);

  const [siteStats, keywordsRaw, backlinksRaw, crawlStats, quota, feeds] = await Promise.all([
    bingRequest("GetSiteStats", { query: { siteUrl: site } }).catch(() => null),
    bingRequest("GetKeywords", { query: { siteUrl: site } }).catch(() => null),
    bingRequest("GetBackLinks", { query: { siteUrl: site } }).catch(() => null),
    bingRequest("GetCrawlStats", { query: { siteUrl: site } }).catch(() => null),
    bingRequest("GetUrlSubmissionQuota", { query: { siteUrl: site } }).catch(() => null),
    bingRequest("GetSiteMap", { query: { siteUrl: site } }).catch(() => null),
  ]);

  const { rows, errors } = await inspectUrls(site, urls, delay);
  const indexed = rows.filter((row) => row.coverage === "Submitted and indexed").length;
  const keywords = asRows<BingKeyword>(keywordsRaw);
  const backlinks = asRows<Record<string, unknown>>(backlinksRaw);
  const feedsRows = asRows<Record<string, unknown>>(feeds);

  // ---- inspection report, shaped like the Search Console one --------------
  const inspection = {
    site,
    generated: new Date().toISOString(),
    source: "bing",
    total: rows.length,
    indexed,
    rows: rows.map((row) => ({
      url: row.url,
      coverage: row.coverage,
      lastCrawl: row.lastCrawl,
      httpStatus: row.httpStatus,
      discovered: row.discovered,
      anchors: row.anchors,
    })),
    errors,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const generated = stamp();
  const inspectionFile = resolvePath(OUTPUT_DIR, `inspection-${generated}.json`);
  writeFileSync(inspectionFile, `${JSON.stringify(inspection, null, 2)}\n`, "utf8");
  writeFileSync(
    resolvePath(OUTPUT_DIR, "inspection-latest.json"),
    `${JSON.stringify(inspection, null, 2)}\n`,
    "utf8",
  );

  // ---- human report -------------------------------------------------------
  const lines: string[] = [];
  lines.push(`# Bing Webmaster report — ${site}`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  lines.push("## Index state");
  lines.push("");
  lines.push(`**${indexed}/${rows.length}** sitemap URLs are indexed in Bing.`);
  lines.push("");
  lines.push(
    table(
      ["URL", "State", "Last crawl", "HTTP", "Anchors"],
      rows.map((row) => [
        row.url.replace("https://btc500.net", "") || "/",
        row.coverage,
        row.lastCrawl ?? "—",
        row.httpStatus == null ? "—" : String(row.httpStatus),
        row.anchors == null ? "—" : String(row.anchors),
      ]),
    ),
  );
  lines.push("");

  if (errors.length) {
    lines.push("### Errors");
    lines.push("");
    for (const error of errors) lines.push(`- ${error}`);
    lines.push("");
  }

  lines.push("## Site stats");
  lines.push("");
  const stats = numericFields(siteStats);
  lines.push(
    stats.length
      ? table(
          ["Metric", "Value"],
          stats.map(([key, value]) => [key, String(value)]),
        )
      : "No site stats returned.",
  );
  lines.push("");

  lines.push("## Crawl stats");
  lines.push("");
  const crawl = numericFields(crawlStats);
  lines.push(
    crawl.length
      ? table(
          ["Metric", "Value"],
          crawl.map(([key, value]) => [key, String(value)]),
        )
      : "No crawl stats returned.",
  );
  lines.push("");

  lines.push("## Keywords");
  lines.push("");
  if (keywords.length) {
    lines.push(
      table(
        ["Query", "Clicks", "Impr.", "Avg click pos.", "Avg impr. pos."],
        keywords
          .slice()
          .sort((a, b) => num(b.Impressions) - num(a.Impressions))
          .slice(0, 40)
          .map((kw) => [
            kw.Query ?? "",
            String(num(kw.Clicks)),
            String(num(kw.Impressions)),
            num(kw.AvgClickPosition).toFixed(1),
            num(kw.AvgImpressionPosition).toFixed(1),
          ]),
      ),
    );
  } else {
    lines.push("No keyword rows returned (volume is below Bing's reporting threshold).");
  }
  lines.push("");

  lines.push("## Backlinks");
  lines.push("");
  const referring = new Set(
    backlinks
      .map((row) => String(pick<string>(row, ["Url", "Page", "ReferringPage"]) ?? ""))
      .filter((value) => value && !value.includes("btc500.net")),
  );
  lines.push(
    `Bing reports **${backlinks.length}** backlink rows across **${referring.size}** referring pages.`,
  );
  lines.push("");
  if (referring.size) {
    lines.push(
      table(
        ["Referring page"],
        [...referring].slice(0, 40).map((value) => [value]),
      ),
    );
    lines.push("");
  }

  lines.push("## Submission");
  lines.push("");
  const quotaRows = numericFields(quota);
  lines.push(
    quotaRows.length
      ? table(
          ["Quota", "Remaining"],
          quotaRows.map(([key, value]) => [key, String(value)]),
        )
      : "No quota information returned.",
  );
  lines.push("");
  lines.push("### Sitemaps known to Bing");
  lines.push("");
  if (feedsRows.length) {
    lines.push(
      table(
        ["Feed", "Detail"],
        feedsRows.map((feed) => [
          String(pick<string>(feed, ["Url", "FeedUrl"]) ?? "—"),
          Object.entries(feed)
            .filter(([key]) => key !== "Url" && key !== "FeedUrl")
            .map(([key, value]) => `${key}=${String(value)}`)
            .join(", "),
        ]),
      ),
    );
  } else {
    lines.push("No sitemap rows returned.");
  }
  lines.push("");

  const markdown = lines.join("\n");
  writeFileSync(resolvePath(OUTPUT_DIR, `bing-${generated}.md`), `${markdown}\n`, "utf8");
  writeFileSync(resolvePath(OUTPUT_DIR, "bing-latest.md"), `${markdown}\n`, "utf8");

  const summary = {
    site,
    generated: new Date().toISOString(),
    indexed,
    total: rows.length,
    keywords: keywords.length,
    backlinkRows: backlinks.length,
    referringPages: referring.size,
    quota,
    siteStats,
    crawlStats,
    feeds: feedsRows,
    errors,
  };
  writeFileSync(
    resolvePath(OUTPUT_DIR, "bing-latest.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log(
    `Indexed: ${indexed}/${rows.length}   Keywords: ${keywords.length}   Backlink rows: ${backlinks.length}`,
  );
  console.log(`Report:  ${resolvePath(OUTPUT_DIR, "bing-latest.md")}`);
  console.log(`Raw:     ${resolvePath(OUTPUT_DIR, "bing-latest.json")}`);
}

const invokedDirectly =
  process.argv[1] !== undefined && resolvePath(process.argv[1]).endsWith("fetch-bing.ts");

if (invokedDirectly) {
  main().catch((error: unknown) => {
    if (error instanceof ConfigError) {
      console.error(`\n${error.message}\n`);
      process.exit(1);
    }
    console.error(error);
    process.exit(1);
  });
}
