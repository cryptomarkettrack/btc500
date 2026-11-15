#!/usr/bin/env node
/**
 * Non-brand query table — the one Search Console reading the cycle prints every
 * run until 2026-11-29.
 *
 * Mandate `nonbrand-query-table-1114` (2026-11-14 review): "print the non-brand
 * query table from the 28d GSC report — query, impressions, position, landing
 * page — and print `non-brand queries: none visible in 28d (anonymised)` when it
 * is empty rather than `0`." Typing a table by hand each cycle is how a number
 * becomes a guess (the same file carried 18 page impressions against a property
 * total of 15 for a week), so this reads the newest report of the requested
 * window and prints it identically every time.
 *
 * The table is a floor, not a share: Search Console anonymises rare queries, so
 * query rows sum to less than the property total. The report's own
 * `reconciliation` note is printed beside it and the two numbers are never
 * added.
 *
 * Brand is the collector's own rule (`BRAND_RE` in collect-results.mjs), so this
 * script and the `non-brand-clicks` signal can never disagree about what a brand
 * query is. That rule matches `btc500`, `btc 500`, `BTC-500`; it does not match
 * `bitcoin 500`, which therefore appears here as a non-brand query — printed as
 * measured, with the rule stated, rather than silently reclassified.
 *
 * Usage:
 *   node scripts/autonomous/nonbrand-queries.mjs [--days=28] [--dir DIR]
 *
 * Exit code 1 means no report for that window was found; the printed line then
 * says "not measured" so it cannot be pasted as if the table were empty.
 */

import { readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { BRAND_RE } from "./collect-results.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = join(HERE, "..", "search-console", "output");
const DEFAULT_STATE_DIR =
  process.env.BTC500_GROWTH_STATE_DIR || join(homedir(), ".local", "state", "btc500-growth");

/** The indexation level below which no copy work may be offered (2026-11-14 review). */
export const COPY_WORK_INDEX_FLOOR = 5;

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Window length in days, from the report's own `window`, or null. */
export function reportDays(report) {
  const window = report?.window;
  if (!window || typeof window !== "object") return null;
  const stated = Number(window.days);
  if (Number.isFinite(stated) && stated > 0) return Math.round(stated);
  const start = Date.parse(`${window.start}T00:00:00Z`);
  const end = Date.parse(`${window.end}T00:00:00Z`);
  if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
    return Math.round((end - start) / 86_400_000) + 1;
  }
  return null;
}

/**
 * Non-brand query rows, most impressions first, each carrying the page that
 * carried most of its impressions (`pairs`), or "(not set)" when the report has
 * no pair row for it.
 */
export function nonBrandRows(report) {
  const queries = Array.isArray(report?.queries) ? report.queries : [];
  const pairs = Array.isArray(report?.pairs) ? report.pairs : [];
  const landingByQuery = new Map();
  for (const pair of pairs) {
    const query = String(pair?.keys?.[0] ?? "");
    const page = String(pair?.keys?.[1] ?? "");
    if (!query || !page) continue;
    const impressions = num(pair.impressions);
    const best = landingByQuery.get(query);
    if (!best || impressions > best.impressions) {
      landingByQuery.set(query, { page, impressions });
    }
  }
  const rows = [];
  for (const row of queries) {
    const query = String(row?.keys?.[0] ?? "");
    if (!query) continue;
    if (BRAND_RE.test(query)) continue;
    rows.push({
      query,
      clicks: num(row.clicks),
      impressions: num(row.impressions),
      position: Math.round(num(row.position) * 10) / 10,
      landing: landingByQuery.get(query)?.page ?? "(not set)",
    });
  }
  rows.sort((a, b) => b.impressions - a.impressions || a.position - b.position);
  return rows;
}

/** Today's `indexed` reading from the collector's own output, or null. */
export function readIndexed(stateDir = DEFAULT_STATE_DIR) {
  let input;
  try {
    input = JSON.parse(readFileSync(join(stateDir, "review-input.json"), "utf8"));
  } catch {
    return null;
  }
  const signals = Array.isArray(input?.signals) ? input.signals : [];
  const signal = signals.find((s) => s?.id === "indexation");
  const current = String(signal?.current ?? "");
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(current.trim());
  if (!match) return null;
  return {
    indexed: Number(match[1]),
    total: Number(match[2]),
    current: current.trim(),
    generated: input?.generated ?? null,
  };
}

/**
 * The floor line. Non-brand clicks cannot come from a snippet while almost no
 * URL is served, so the number and the prohibition are printed together: the
 * next cycle cannot propose copy work without reading the level that forbids it.
 */
export function copyFloorLine(reading) {
  if (!reading) {
    return `floor: no title, meta, snippet, copy or internal-link work as a non-brand action while indexed < ${COPY_WORK_INDEX_FLOOR} (today's indexed not quoted — no review-input.json)`;
  }
  const when = reading.generated ? ` (review-input ${reading.generated})` : "";
  const verdict =
    reading.indexed < COPY_WORK_INDEX_FLOOR
      ? `none permitted until indexed >= ${COPY_WORK_INDEX_FLOOR}`
      : `permitted — indexed is at or above ${COPY_WORK_INDEX_FLOOR}`;
  return `floor: ${verdict} — indexed ${reading.current}${when}`;
}

/** The whole printable block: heading, table (or the anonymised line), floor. */
export function nonBrandTableText(report, reading) {
  const days = reportDays(report);
  const label = days ? `non-brand queries ${days}d` : "non-brand queries (window unknown)";
  const window = report?.window;
  const when = window?.start && window?.end ? ` (window ${window.start} → ${window.end})` : "";
  const rows = nonBrandRows(report);
  const lines = [`${label}${when}:`];
  if (rows.length === 0) {
    // Never "0": an empty query table means Search Console withheld the rows,
    // not that nobody searched.
    lines.push(`  non-brand queries: none visible in ${days ?? "the"}d (anonymised)`);
  } else {
    lines.push("  query | clicks | impressions | position | landing page");
    for (const row of rows) {
      lines.push(
        `  ${row.query} | ${row.clicks} | ${row.impressions} | ${row.position} | ${row.landing}`,
      );
    }
  }
  const warnings = Array.isArray(report?.reconciliation?.warnings)
    ? report.reconciliation.warnings
    : [];
  const reconcile = warnings.find((w) => /anonymis/i.test(String(w))) ?? warnings[0];
  if (reconcile) lines.push(`  note: ${reconcile}`);
  lines.push(copyFloorLine(reading));
  return lines.join("\n");
}

/**
 * Newest `performance-*.json` covering exactly `days` days, ordered by the
 * window it covers (end date, then filename) — never by filename alone, which is
 * how a 28-day report once printed as a 7-day number.
 */
export function newestReport(dir, { days } = {}) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return null;
  }
  const reports = [];
  for (const name of names) {
    if (!/^performance-.*\.json$/.test(name)) continue;
    let report;
    try {
      report = JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch {
      continue;
    }
    if (!report?.window) continue;
    if (days !== undefined && reportDays(report) !== days) continue;
    reports.push({ name, path: join(dir, name), report, end: String(report.window.end ?? "") });
  }
  if (reports.length === 0) return null;
  reports.sort((a, b) =>
    a.end === b.end ? a.name.localeCompare(b.name) : a.end.localeCompare(b.end),
  );
  return reports.at(-1);
}

function main(argv) {
  const dirFlag = argv.indexOf("--dir");
  const dir = resolve(dirFlag === -1 ? DEFAULT_DIR : argv[dirFlag + 1]);
  const daysFlag = argv.find((arg) => arg.startsWith("--days="));
  const requested = daysFlag ? Number(daysFlag.slice("--days=".length)) : 28;
  const days = Number.isFinite(requested) && requested > 0 ? Math.round(requested) : 28;

  const found = newestReport(dir, { days });
  if (!found) {
    console.log(
      `non-brand queries ${days}d: not measured — no ${days}-day Search Console report in ${dir}. Run: npm run search-console -- --days=${days}`,
    );
    return 1;
  }
  console.log(nonBrandTableText(found.report, readIndexed()));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
