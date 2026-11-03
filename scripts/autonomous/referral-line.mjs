#!/usr/bin/env node
/**
 * Referral line — the one number the ask loop is judged on.
 *
 * The 2026-10-27 review made this line mandatory at the end of every commit's
 * PERFORMANCE block, because the three pitches and three owner asks have never
 * had a measured answer. Typing it by hand each cycle is how a number becomes a
 * guess, so this reads the newest GA4 report under scripts/analytics/output/
 * and prints exactly the line the review asked for:
 *
 *   referrals 7d: github.com N, x.com N, reddit.com N, bitcoinmagazine.com N,
 *                 bitcointalk.org N
 *
 * Sources are matched case-insensitively, `twitter.com` counts as `x.com`, and
 * any other referrer is appended rather than dropped — a referral from a
 * channel nobody asked for is still evidence.
 *
 * Usage:
 *   node scripts/autonomous/referral-line.mjs [--days=7] [--dir scripts/analytics/output]
 *
 * The window label comes from the report's own `window` (`days`, or counted from
 * its start/end), never from the filename and never from a default: a 28-day
 * report cannot be printed as "referrals 7d". The 2026-11-02 review found the
 * opposite — 15 github sessions labelled as 7 days when the 7-day figure was 12
 * — because the newest `ga4-*.json` by filename was chosen and the label was
 * hardcoded.
 *
 * Exit code 1 means no report for the requested window was found; the printed
 * line then says "not measured" so it cannot be pasted as if it were zero.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = join(HERE, "..", "analytics", "output");

/** Referrers the reviewer asks about, in the order it asks for them. */
const TRACKED = [
  { label: "github.com", hosts: ["github.com"] },
  { label: "x.com", hosts: ["x.com", "twitter.com", "t.co"] },
  { label: "reddit.com", hosts: ["reddit.com"] },
  { label: "bitcoinmagazine.com", hosts: ["bitcoinmagazine.com"] },
  { label: "bitcointalk.org", hosts: ["bitcointalk.org"] },
];

/**
 * Reduce GA4 referral rows to `[{source, sessions}]`.
 * Accepts the report's raw shape (`dimensionValues` / `metricValues`).
 */
export function referralRows(table) {
  const rows = Array.isArray(table) ? table : [];
  const out = [];
  for (const row of rows) {
    const source = row?.dimensionValues?.[0]?.value;
    const sessions = Number(row?.metricValues?.[0]?.value ?? 0);
    if (!source || !Number.isFinite(sessions)) continue;
    out.push({ source: String(source).toLowerCase(), sessions });
  }
  return out;
}

/** Build the mandated one-line summary from `[{source, sessions}]`. */
export function referralLine(rows, window) {
  const byHost = new Map();
  for (const row of rows) {
    const host = String(row.source).toLowerCase();
    byHost.set(host, (byHost.get(host) ?? 0) + row.sessions);
  }

  const seen = new Set();
  const parts = TRACKED.map(({ label, hosts }) => {
    for (const host of hosts) seen.add(host);
    const total = hosts.reduce((sum, host) => sum + (byHost.get(host) ?? 0), 0);
    return `${label} ${total}`;
  });

  const other = [...byHost.entries()]
    .filter(([host]) => !seen.has(host) && byHost.get(host) > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([host, sessions]) => `${host} ${sessions}`);

  const days = reportDays({ window });
  let line = `${days ? `referrals ${days}d:` : "referrals (window unknown):"} ${parts.join(", ")}`;
  if (other.length > 0) line += ` — other: ${other.join(", ")}`;
  if (window?.start && window?.end) line += ` (window ${window.start} → ${window.end})`;
  return line;
}

/**
 * Window length in days, read from the report's own `window` — its `days` field
 * when present, otherwise counted inclusively from `start`/`end`. Returns null
 * when the report does not say, so the caller prints "unknown" instead of 7.
 */
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
 * Newest `ga4-*.json` report in a directory, ordered by the window it covers
 * (end date, then filename), or null. Pass `{ days }` to require a report of
 * exactly that window length — the only way to guarantee a 7-day number is a
 * 7-day report, whatever order the reports were generated in.
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
    if (!/^ga4-.*\.json$/.test(name)) continue;
    const path = join(dir, name);
    let report;
    try {
      report = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      continue;
    }
    const length = reportDays(report);
    if (days !== undefined && length !== days) continue;
    reports.push({ name, path, report, end: String(report?.window?.end ?? "") });
  }
  if (reports.length === 0) return null;
  reports.sort((a, b) =>
    a.end === b.end ? a.name.localeCompare(b.name) : a.end.localeCompare(b.end),
  );
  const latest = reports.at(-1);
  return { path: latest.path, report: latest.report };
}

function main(argv) {
  const dirFlag = argv.indexOf("--dir");
  const dir = resolve(dirFlag === -1 ? DEFAULT_DIR : argv[dirFlag + 1]);
  const daysFlag = argv.find((arg) => arg.startsWith("--days="));
  const requested = daysFlag ? Number(daysFlag.slice("--days=".length)) : 7;
  const wanted = Number.isFinite(requested) && requested > 0 ? Math.round(requested) : 7;
  const found = newestReport(dir, { days: wanted });
  if (!found) {
    console.log(
      `referrals ${wanted}d: not measured — no ${wanted}-day GA4 report in ${dir}. Run: npm run analytics -- --days=${wanted}`,
    );
    return 1;
  }
  const table = found.report?.tables?.referrals;
  const rows = referralRows(table);
  console.log(referralLine(rows, found.report?.window));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
