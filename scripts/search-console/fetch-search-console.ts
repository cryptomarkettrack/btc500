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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve as resolvePath } from "node:path";
import {
  ConfigError,
  isoDaysAgo,
  loadDotEnv,
  OUTPUT_DIR,
  parseFlags,
  querySearchAnalytics,
  resolveSite,
  shiftDays,
  type SearchAnalyticsRow,
} from "./client.ts";
import { num, pct, pos, shortUrl, table, writeReport } from "./report.ts";
import {
  findLongerWindow,
  reconcile,
  toStoredWindow,
  type Reconciliation,
  type StoredWindow,
} from "./reconcile.ts";

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
  /** `byProperty`: deduplicated, matches the Search Console UI total. */
  totals: SearchAnalyticsRow | undefined;
  /** `byPage`: the sum of the page rows, used to prove the tables reconcile. */
  pageTotals: SearchAnalyticsRow | undefined;
};

const SUMMARY_FILE = "performance-summary.json";

function readSummary(): StoredWindow[] {
  const path = resolvePath(OUTPUT_DIR, SUMMARY_FILE);
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredWindow[]) : [];
  } catch {
    return [];
  }
}

function writeSummary(stored: StoredWindow[], entry: StoredWindow): void {
  // One record per (end, days) — the newest run wins. Keep the file bounded.
  const kept = stored.filter((row) => !(row.end === entry.end && row.days === entry.days));
  const next = [...kept, entry].slice(-60);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(
    resolvePath(OUTPUT_DIR, SUMMARY_FILE),
    `${JSON.stringify(next, null, 2)}\n`,
    "utf8",
  );
}

function reconciliationSection(
  rec: Reconciliation,
  rowCounts: { pages: number; queries: number; pairs: number },
): string[] {
  const lines: string[] = [];
  lines.push("## Reconciliation");
  lines.push("");
  lines.push(
    "Totals are fetched under two aggregation types and both are printed, because " +
      "Search Console counts them differently: `byProperty` counts one impression once for " +
      "the whole site (the number its UI shows), `byPage` counts it once per URL that appeared " +
      "and is therefore the number the page rows must add up to.",
  );
  lines.push("");
  lines.push(
    table(
      ["Table", "Aggregation", "Rows", "Clicks", "Impressions"],
      [
        [
          "total",
          "byProperty",
          "1",
          num(rec.propertyTotal.clicks),
          num(rec.propertyTotal.impressions),
        ],
        ["total", "byPage", "1", num(rec.pageTotal.clicks), num(rec.pageTotal.impressions)],
        [
          "pages",
          "byPage",
          num(rowCounts.pages),
          num(rec.sums.pages.clicks),
          num(rec.sums.pages.impressions),
        ],
        [
          "queries",
          "byPage",
          num(rowCounts.queries),
          num(rec.sums.queries.clicks),
          num(rec.sums.queries.impressions),
        ],
        [
          "query × page",
          "byPage",
          num(rowCounts.pairs),
          num(rec.sums.pairs.clicks),
          num(rec.sums.pairs.impressions),
        ],
      ],
    ),
  );
  lines.push("");
  lines.push(
    `Status: **${rec.ok ? "reconciled" : "REFUSED"}** — ` +
      `${rec.sums.pages.impressions === rec.pageTotal.impressions ? "page rows equal the byPage total" : "page rows differ from the byPage total"}, ` +
      `${rec.pageTotal.impressions - rec.propertyTotal.impressions} impressions are the byPage/byProperty ` +
      "difference (one search result counted per URL).",
  );
  for (const failure of rec.failures) lines.push(`- FAIL: ${failure}`);
  for (const warning of rec.warnings) lines.push(`- note: ${warning}`);
  lines.push("");
  lines.push("### Derived fields — and the window each came from");
  lines.push("");
  lines.push(
    table(
      ["Field", "Value", "Table", "Window", "Aggregation"],
      [
        [
          "pagesWithImpressions",
          num(rec.derived.pagesWithImpressions.value),
          rec.derived.pagesWithImpressions.from,
          `${rec.derived.pagesWithImpressions.window.start} → ${rec.derived.pagesWithImpressions.window.end} (${rec.derived.pagesWithImpressions.window.days}d)`,
          rec.derived.pagesWithImpressions.aggregation,
        ],
        [
          "positions4to20",
          num(rec.derived.positions4to20.value),
          rec.derived.positions4to20.from,
          `${rec.derived.positions4to20.window.start} → ${rec.derived.positions4to20.window.end} (${rec.derived.positions4to20.window.days}d)`,
          rec.derived.positions4to20.aggregation,
        ],
      ],
    ),
  );
  lines.push("");
  lines.push(
    "`pagesWithImpressions` and `positions4to20` are counts of rows in the tables above " +
      "for the window named on this line. They are not comparable across runs with different " +
      "`--days` or a different end date: a 7-day window is a subset of a 28-day window.",
  );
  lines.push("");
  return lines;
}

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

export function buildReport(
  site: string,
  start: string,
  end: string,
  data: Analysis,
  reconciliation?: Reconciliation,
): string {
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

  if (reconciliation) {
    lines.push(
      ...reconciliationSection(reconciliation, {
        pages: data.pages.length,
        queries: data.queries.length,
        pairs: data.pairs.length,
      }),
    );
  }

  lines.push("## At a glance");
  lines.push("");
  lines.push("Site total, `byProperty` (deduplicated — the Search Console UI number):");
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
  // `page`/`query` dimensions cannot be aggregated byProperty (the API rejects
  // it), so every dimensioned table is byPage and the matching totals call is
  // requested under the same aggregation. See reconcile.ts for why.
  const byPage = { ...base, aggregationType: "byPage" };

  const [totalsRows, pageTotalRows, queries, pages, pairs, devices, countries] = await Promise.all([
    querySearchAnalytics(site, { ...base, dimensions: [] }, 1),
    querySearchAnalytics(site, { ...byPage, dimensions: [] }, 1),
    querySearchAnalytics(site, { ...byPage, dimensions: ["query"] }, options.rows),
    querySearchAnalytics(site, { ...byPage, dimensions: ["page"] }, options.rows),
    querySearchAnalytics(
      site,
      { ...byPage, dimensions: ["query", "page"] },
      Math.min(options.rows, 10_000),
    ),
    querySearchAnalytics(site, { ...base, dimensions: ["device"] }, 5),
    querySearchAnalytics(site, { ...base, dimensions: ["country"] }, 50),
  ]);

  const window = { start, end, days: options.days };
  const stored = readSummary();
  const reconciliation = reconcile({
    window,
    propertyTotal: totalsRows[0],
    pageTotal: pageTotalRows[0],
    pages,
    queries,
    pairs,
    longerWindow: findLongerWindow(stored, window),
  });

  for (const failure of reconciliation.failures) {
    console.error(`reconcile: FAIL — ${failure}`);
  }
  for (const warning of reconciliation.warnings) {
    console.error(`reconcile: note — ${warning}`);
  }
  console.error(
    `reconcile: ${window.days}d ${start} -> ${end}: ` +
      `property ${reconciliation.propertyTotal.clicks}/${reconciliation.propertyTotal.impressions}, ` +
      `byPage ${reconciliation.pageTotal.clicks}/${reconciliation.pageTotal.impressions}, ` +
      `pages ${reconciliation.sums.pages.clicks}/${reconciliation.sums.pages.impressions} in ${pages.length} rows, ` +
      `queries ${reconciliation.sums.queries.clicks}/${reconciliation.sums.queries.impressions} in ${queries.length} rows`,
  );

  if (!reconciliation.ok) {
    // Nothing is written: the previous performance-latest.* stays in place so a
    // broken run cannot silently replace a report the review reads.
    console.error(
      "\nRefusing to write a report whose tables do not reconcile. " +
        "The previous report is untouched.",
    );
    process.exit(1);
  }

  const data: Analysis = {
    totals: totalsRows[0],
    pageTotals: pageTotalRows[0],
    queries,
    pages,
    pairs,
    devices,
    countries,
  };
  const markdown = buildReport(site, start, end, data, reconciliation);
  const generated = new Date().toISOString();
  const { markdownPath, jsonPath } = writeReport("performance", markdown, {
    site,
    window: { ...window, dataState: options.dataState },
    aggregation: { totals: "byProperty", dimensions: "byPage" },
    reconciliation: {
      ok: reconciliation.ok,
      failures: reconciliation.failures,
      warnings: reconciliation.warnings,
      sums: reconciliation.sums,
      propertyTotal: reconciliation.propertyTotal,
      pageTotal: reconciliation.pageTotal,
    },
    derived: reconciliation.derived,
    ...data,
  });
  writeSummary(stored, toStoredWindow(window, reconciliation, pages, generated));

  console.log("");
  console.log(`Queries: ${num(queries.length)}   Pages: ${num(pages.length)}`);
  if (data.totals) {
    console.log(
      `Clicks:  ${num(data.totals.clicks)}   Impressions: ${num(data.totals.impressions)}   ` +
        `CTR: ${pct(data.totals.ctr)}   Avg pos: ${pos(data.totals.position)}`,
    );
  }
  console.log(
    `Reconciled: page rows ${num(reconciliation.sums.pages.impressions)} = byPage total ` +
      `${num(reconciliation.pageTotal.impressions)}; property total ` +
      `${num(reconciliation.propertyTotal.impressions)}`,
  );
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
