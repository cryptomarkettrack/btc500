#!/usr/bin/env node
/**
 * Inspect indexing status for URLs via the Search Console URL Inspection API.
 *
 * By default every URL in public/sitemap.xml is inspected.
 *
 *   node scripts/search-console/inspect-urls.ts
 *   node scripts/search-console/inspect-urls.ts --limit=10
 *   node scripts/search-console/inspect-urls.ts --urls=https://btc500.net/simulator
 *   bun run search-console:inspect
 *
 * Writes to scripts/search-console/output/ (gitignored).
 *
 * Note: the URL Inspection API is rate limited (roughly 600/minute and
 * 2000/day per property). Calls are throttled by --delay.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ConfigError,
  gscRequest,
  loadDotEnv,
  parseFlags,
  PROJECT_ROOT,
  resolveSite,
} from "./client.ts";
import { shortUrl, table, writeReport } from "./report.ts";

const HELP = `Search Console URL inspection

Usage:
  node scripts/search-console/inspect-urls.ts [options]

Options:
  --urls=A,B,C      Inspect these URLs instead of reading the sitemap
  --sitemap=PATH    Sitemap to read. Default: public/sitemap.xml
  --limit=N         Inspect only the first N URLs. Default: all
  --delay=MS        Pause between requests. Default: 150
  --site=PROPERTY   Property to inspect against. Default: auto-detect
  --help            Show this message

Environment:
  GSC_SITE          Default property
  GSC_CREDENTIALS   Path to the service-account JSON key

Setup: see scripts/search-console/SETUP.txt
`;

type IndexStatus = {
  verdict?: string;
  coverageState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  lastCrawlTime?: string;
  pageFetchState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  crawledAs?: string;
  sitemap?: string[];
};

type InspectionResponse = {
  inspectionResult?: {
    inspectionResultLink?: string;
    indexStatusResult?: IndexStatus;
    mobileUsabilityResult?: { verdict?: string };
    richResultsResult?: { verdict?: string; detectedItems?: Array<{ richResultType?: string }> };
  };
};

export type Row = {
  url: string;
  verdict: string;
  coverage: string;
  indexing: string;
  robots: string;
  lastCrawl: string;
  canonicalMatch: string;
  issues: string[];
  error?: string;
};

const PROBLEM_VERDICTS = new Set(["FAIL", "PARTIAL"]);

function readSitemapUrls(path: string): string[] {
  const file = resolve(PROJECT_ROOT, path);
  if (!existsSync(file)) throw new ConfigError(`Sitemap not found: ${file}`);
  const xml = readFileSync(file, "utf8");
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gu)].map((match) => match[1]);
}

function describeIssues(status: IndexStatus): string[] {
  const issues: string[] = [];

  if (status.verdict && PROBLEM_VERDICTS.has(status.verdict)) {
    issues.push(`verdict ${status.verdict}`);
  }
  if (status.coverageState && status.coverageState !== "Submitted and indexed") {
    issues.push(status.coverageState);
  }
  if (status.robotsTxtState && status.robotsTxtState !== "ALLOWED") {
    issues.push(`robots.txt ${status.robotsTxtState}`);
  }
  if (status.indexingState && status.indexingState !== "INDEXING_ALLOWED") {
    issues.push(`indexing ${status.indexingState}`);
  }
  if (status.pageFetchState && status.pageFetchState !== "SUCCESSFUL") {
    issues.push(`fetch ${status.pageFetchState}`);
  }
  if (
    status.googleCanonical &&
    status.userCanonical &&
    status.googleCanonical !== status.userCanonical
  ) {
    issues.push("canonical mismatch");
  }

  return issues;
}

async function inspect(site: string, url: string): Promise<Row> {
  const body = { inspectionUrl: url, siteUrl: site, languageCode: "en-US" };

  try {
    const response = await gscRequest<InspectionResponse>("v1/urlInspection/index:inspect", {
      method: "POST",
      body,
    });

    const status = response.inspectionResult?.indexStatusResult ?? {};
    const issues = describeIssues(status);

    return {
      url,
      verdict: status.verdict ?? "UNKNOWN",
      coverage: status.coverageState ?? "—",
      indexing: status.indexingState ?? "—",
      robots: status.robotsTxtState ?? "—",
      lastCrawl: status.lastCrawlTime ? status.lastCrawlTime.slice(0, 10) : "never",
      canonicalMatch:
        status.googleCanonical && status.userCanonical
          ? status.googleCanonical === status.userCanonical
            ? "match"
            : "differs"
          : "—",
      issues,
    };
  } catch (error) {
    return {
      url,
      verdict: "ERROR",
      coverage: "—",
      indexing: "—",
      robots: "—",
      lastCrawl: "—",
      canonicalMatch: "—",
      issues: [(error as Error).message.split("\n")[0]],
      error: (error as Error).message,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

export function buildReport(site: string, rows: Row[]): string {
  const lines: string[] = [];
  lines.push(`# URL inspection — ${site}`);
  lines.push("");
  lines.push(`Inspected ${rows.length} URLs at ${new Date().toISOString()}`);
  lines.push("");

  const broken = rows.filter((row) => row.verdict === "ERROR");
  const problems = rows.filter((row) => row.verdict !== "ERROR" && row.issues.length > 0);
  const clean = rows.filter((row) => row.verdict !== "ERROR" && row.issues.length === 0);

  lines.push("## Summary");
  lines.push("");
  lines.push(
    table(
      ["Indexed cleanly", "Needs attention", "Failed to inspect"],
      [[String(clean.length), String(problems.length), String(broken.length)]],
    ),
  );
  lines.push("");

  lines.push("## All URLs");
  lines.push("");
  lines.push(
    table(
      ["URL", "Verdict", "Coverage", "Crawl", "Canonical"],
      rows.map((row) => [
        shortUrl(row.url),
        row.verdict,
        row.coverage,
        row.lastCrawl,
        row.canonicalMatch,
      ]),
    ),
  );
  lines.push("");

  if (problems.length > 0) {
    lines.push("## Needs attention");
    lines.push("");
    for (const row of problems) {
      lines.push(`- \`${shortUrl(row.url)}\` — ${row.issues.join("; ")}`);
    }
    lines.push("");
  }

  if (broken.length > 0) {
    lines.push("## Could not inspect");
    lines.push("");
    for (const row of broken) {
      lines.push(`- \`${shortUrl(row.url)}\` — ${row.issues[0]}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main(): Promise<void> {
  loadDotEnv();
  const flags = parseFlags(process.argv.slice(2));

  if (flags.get("help") === "true") {
    console.log(HELP);
    return;
  }

  const site = await resolveSite(flags.get("site"));
  const delay = Number(flags.get("delay") ?? 150);
  const limit = Number(flags.get("limit") ?? 0);

  let urls: string[];
  if (flags.get("urls")) {
    urls = (flags.get("urls") ?? "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  } else {
    urls = readSitemapUrls(flags.get("sitemap") ?? "public/sitemap.xml");
  }

  if (limit > 0) urls = urls.slice(0, limit);
  if (urls.length === 0) throw new ConfigError("No URLs to inspect.");

  console.log(`Property: ${site}`);
  console.log(`Inspecting ${urls.length} URL(s)...`);

  const rows: Row[] = [];
  for (const [index, url] of urls.entries()) {
    const row = await inspect(site, url);
    rows.push(row);

    const marker = row.issues.length === 0 ? "ok" : row.verdict === "ERROR" ? "ERR" : "!!";
    process.stdout.write(`  [${index + 1}/${urls.length}] ${marker.padEnd(3)} ${shortUrl(url)}\n`);

    if (index < urls.length - 1 && delay > 0) await sleep(delay);
  }

  const markdown = buildReport(site, rows);
  const { markdownPath, jsonPath } = writeReport("inspection", markdown, { site, rows });

  const problems = rows.filter((row) => row.issues.length > 0).length;
  console.log("");
  console.log(`${rows.length - problems} clean, ${problems} need attention`);
  console.log("");
  console.log(`Report: ${markdownPath}`);
  console.log(`Raw:    ${jsonPath}`);

  // Non-zero exit makes this usable in CI once a site is expected to be clean.
  if (rows.some((row) => row.verdict === "ERROR")) process.exitCode = 2;
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

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
