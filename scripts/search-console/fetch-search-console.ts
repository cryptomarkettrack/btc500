#!/usr/bin/env node
/**
 * Pull Search Console performance data and write a prioritised markdown report.
 *
 *   node scripts/search-console/fetch-search-console.ts
 *   node scripts/search-console/fetch-search-console.ts --days=28
 *   bun run search-console -- --days=90 --site=sc-domain:btc500.net
 *
 * Writes to scripts/search-console/output/ (gitignored).
 */
import { fileURLToPath } from "node:url";
import { resolve as resolvePath } from "node:path";
import {
  ConfigError,
  isoDaysAgo,
  loadDotEnv,
  parseFlags,
  querySearchAnalytics,
  resolveSite,
  shiftDays,
  type SearchAnalyticsRow,
} from "./client.ts";
import { num, pct, pos, shortUrl, table, writeReport } from "./report.ts";

const HELP = `Search Console performance report

Usage:
  node scripts/search-console/fetch-search-console.ts [options]

Options:
  --days=N          Window length in days. Default: 90
  --end=YYYY-MM-DD  Last day of the window. Default: 3 days ago
                    (Search Console data lags, so today is incomplete.)
  --site=PROPERTY   Property to query, e.g. https://btc500.net/ or
                    sc-domain:btc500.net. Default: auto-detect, or $GSC_SITE
  --rows=N          Rows per dimension table to fetch. Default: 25000
  --data-state=X    all | final | hourly_all. Default: all
  --help            Show this message

Environment:
  GSC_SITE          Default property, same format as --site
  GSC_CREDENTIALS   Path to the service-account JSON key

Setup: see scripts/search-console/SETUP.txt
`;

type Options = {
  days: number;
  end: string;
  site?: string;
  rows: number;
  dataState: string;
  help: boolean;
};

function parseOptions(argv: string[]): Options {
  const flags = parseFlags(argv);
  const days = Number(flags.get("days") ?? 90);
  const rows = Number(flags.get("rows") ?? 25_000);

  if (!Number.isInteger(days) || days < 1 || days > 480) {
    throw new ConfigError("--days must be an integer between 1 and 480.");
  }
  if (!Number.isInteger(rows) || rows < 1) {
    throw new ConfigError("--rows must be a positive integer.");
  }

  return {
    days,
    end: flags.get("end") ?? "",
    site: flags.get("site"),
    rows,
    dataState: flags.get("data-state") ?? "all",
    help: flags.get("help") === "true",
  };
}

export type Analysis = {
  queries: SearchAnalyticsRow[];
  pages: SearchAnalyticsRow[];
  pairs: SearchAnalyticsRow[];
  devices: SearchAnalyticsRow[];
  countries: SearchAnalyticsRow[];
  totals: SearchAnalyticsRow | undefined;
};

function bestPageByQuery(pairs: SearchAnalyticsRow[]): Map<string, string> {
  const best = new Map<string, { impressions: number; page: string }>();
  for (const row of pairs) {
    const [query, page] = row.keys ?? [];
    if (!query || !page) continue;
    const current = best.get(query);
    if (!current || row.impressions > current.impressions) {
      best.set(query, { impressions: row.impressions, page });
    }
  }
  return new Map([...best].map(([query, entry]) => [query, entry.page]));
}

export function buildReport(site: string, start: string, end: string, data: Analysis): string {
  const pagesFor = bestPageByQuery(data.pairs);
  const lines: string[] = [];

  const totals = data.totals;
  lines.push(`# Search Console report — ${site}`);
  lines.push("");
  lines.push(`Window: **${start} → ${end}** (data state: \`all\`)`);
  lines.push("");

  if (!totals || totals.impressions === 0) {
    lines.push(
      "> No impressions returned for this window. Either the property is new, " +
        "the service account lacks access, or the window is outside retention.",
    );
    return lines.join("\n");
  }

  lines.push("## At a glance");
  lines.push("");
  lines.push(
    table(
      ["Clicks", "Impressions", "CTR", "Avg position"],
      [[num(totals.clicks), num(totals.impressions), pct(totals.ctr), pos(totals.position)]],
    ),
  );
  lines.push("");

  // --- Queries -------------------------------------------------------------
  const topQueries = [...data.queries].sort((a, b) => b.clicks - a.clicks).slice(0, 25);
  lines.push("## Top queries by clicks");
  lines.push("");
  lines.push(
    table(
      ["Query", "Clicks", "Impr.", "CTR", "Pos."],
      topQueries.map((row) => [
        row.keys?.[0] ?? "",
        num(row.clicks),
        num(row.impressions),
        pct(row.ctr),
        pos(row.position),
      ]),
    ),
  );
  lines.push("");

  // --- Quick wins: page 2 rankings -----------------------------------------
  // The highest-leverage bucket: already visible, just not clicked.
  const quickWins = data.queries
    .filter((row) => row.position >= 11 && row.position <= 20 && row.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  lines.push("## Quick wins — ranking 11–20 with real impressions");
  lines.push("");
  lines.push(
    "Already surfacing on page 2. A title, intro or internal-link push can move these onto page 1.",
  );
  lines.push("");
  lines.push(
    table(
      ["Query", "Clicks", "Impr.", "Pos.", "Best page"],
      quickWins.map((row) => {
        const query = row.keys?.[0] ?? "";
        return [
          query,
          num(row.clicks),
          num(row.impressions),
          pos(row.position),
          shortUrl(pagesFor.get(query) ?? "—"),
        ];
      }),
    ),
  );
  lines.push("");

  // --- Snippet opportunities ----------------------------------------------
  const snippets = data.queries
    .filter((row) => row.position <= 3 && row.ctr < 0.15 && row.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  lines.push("## Snippet opportunities — top 3 but under 15% CTR");
  lines.push("");
  lines.push(
    "Google is listing you high and users are not clicking. Rewrite the title and meta description.",
  );
  lines.push("");
  lines.push(
    table(
      ["Query", "Impr.", "CTR", "Pos."],
      snippets.map((row) => [
        row.keys?.[0] ?? "",
        num(row.impressions),
        pct(row.ctr),
        pos(row.position),
      ]),
    ),
  );
  lines.push("");

  // --- Zero click ---------------------------------------------------------
  const zeroClick = data.queries
    .filter((row) => row.clicks === 0 && row.impressions >= 100)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  lines.push("## Zero-click queries (100+ impressions)");
  lines.push("");
  lines.push(
    table(
      ["Query", "Impr.", "Pos."],
      zeroClick.map((row) => [row.keys?.[0] ?? "", num(row.impressions), pos(row.position)]),
    ),
  );
  lines.push("");

  // --- Pages --------------------------------------------------------------
  const topPages = [...data.pages].sort((a, b) => b.clicks - a.clicks).slice(0, 25);
  lines.push("## Top pages by clicks");
  lines.push("");
  lines.push(
    table(
      ["Page", "Clicks", "Impr.", "CTR", "Pos."],
      topPages.map((row) => [
        shortUrl(row.keys?.[0] ?? ""),
        num(row.clicks),
        num(row.impressions),
        pct(row.ctr),
        pos(row.position),
      ]),
    ),
  );
  lines.push("");

  // --- Device + country ---------------------------------------------------
  lines.push("## Device split");
  lines.push("");
  lines.push(
    table(
      ["Device", "Clicks", "Impr.", "CTR", "Pos."],
      [...data.devices]
        .sort((a, b) => b.clicks - a.clicks)
        .map((row) => [
          row.keys?.[0] ?? "",
          num(row.clicks),
          num(row.impressions),
          pct(row.ctr),
          pos(row.position),
        ]),
    ),
  );
  lines.push("");

  lines.push("## Top countries");
  lines.push("");
  lines.push(
    table(
      ["Country", "Clicks", "Impr.", "CTR"],
      [...data.countries]
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)
        .map((row) => [row.keys?.[0] ?? "", num(row.clicks), num(row.impressions), pct(row.ctr)]),
    ),
  );
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(
    `Generated ${new Date().toISOString()} from ${data.queries.length} queries and ` +
      `${data.pages.length} pages.`,
  );

  return lines.join("\n");
}

async function main(): Promise<void> {
  loadDotEnv();
  const options = parseOptions(process.argv.slice(2));

  if (options.help) {
    console.log(HELP);
    return;
  }

  const site = await resolveSite(options.site);
  const end = options.end || isoDaysAgo(3);
  const start = shiftDays(end, -(options.days - 1));

  console.log(`Property: ${site}`);
  console.log(`Window:   ${start} -> ${end} (${options.days} days)`);

  const base = {
    startDate: start,
    endDate: end,
    dataState: options.dataState,
    type: "web",
  };

  const [totalsRows, queries, pages, pairs, devices, countries] = await Promise.all([
    querySearchAnalytics(site, { ...base, dimensions: [] }, 1),
    querySearchAnalytics(site, { ...base, dimensions: ["query"] }, options.rows),
    querySearchAnalytics(site, { ...base, dimensions: ["page"] }, options.rows),
    querySearchAnalytics(
      site,
      { ...base, dimensions: ["query", "page"] },
      Math.min(options.rows, 10_000),
    ),
    querySearchAnalytics(site, { ...base, dimensions: ["device"] }, 5),
    querySearchAnalytics(site, { ...base, dimensions: ["country"] }, 50),
  ]);

  const data: Analysis = { totals: totalsRows[0], queries, pages, pairs, devices, countries };
  const markdown = buildReport(site, start, end, data);
  const { markdownPath, jsonPath } = writeReport("performance", markdown, {
    site,
    window: { start, end, days: options.days, dataState: options.dataState },
    ...data,
  });

  console.log("");
  console.log(`Queries: ${num(queries.length)}   Pages: ${num(pages.length)}`);
  if (data.totals) {
    console.log(
      `Clicks:  ${num(data.totals.clicks)}   Impressions: ${num(data.totals.impressions)}   ` +
        `CTR: ${pct(data.totals.ctr)}   Avg pos: ${pos(data.totals.position)}`,
    );
  }
  console.log("");
  console.log(`Report: ${markdownPath}`);
  console.log(`Raw:    ${jsonPath}`);
}

const invokedDirectly =
  process.argv[1] !== undefined && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url);

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
