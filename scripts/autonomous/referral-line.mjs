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
 *   node scripts/autonomous/referral-line.mjs [--dir scripts/analytics/output]
 *
 * Exit code 1 means no GA4 report was found; the printed line then says
 * "not measured" so it cannot be pasted as if it were zero.
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

  let line = `referrals 7d: ${parts.join(", ")}`;
  if (other.length > 0) line += ` — other: ${other.join(", ")}`;
  if (window) line += ` (window ${window})`;
  return line;
}

/** Newest `ga4-*.json` report in a directory, or null. */
export function newestReport(dir) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return null;
  }
  const reports = names
    .filter((name) => /^ga4-.*\.json$/.test(name))
    .map((name) => ({ name, path: join(dir, name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const latest = reports.at(-1);
  if (!latest) return null;
  try {
    return { path: latest.path, report: JSON.parse(readFileSync(latest.path, "utf8")) };
  } catch {
    return null;
  }
}

function main(argv) {
  const dirFlag = argv.indexOf("--dir");
  const dir = resolve(dirFlag === -1 ? DEFAULT_DIR : argv[dirFlag + 1]);
  const found = newestReport(dir);
  if (!found) {
    console.log(
      `referrals 7d: not measured — no GA4 report in ${dir}. Run: npm run analytics -- --days=7`,
    );
    return 1;
  }
  const table = found.report?.tables?.referrals;
  const rows = referralRows(table);
  const window = found.report?.window;
  const label = window?.start && window?.end ? `${window.start} → ${window.end}` : null;
  console.log(referralLine(rows, label));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
