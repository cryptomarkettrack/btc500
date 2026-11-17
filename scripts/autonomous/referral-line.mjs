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
 * Sources a named-source line never counts: Direct is not a referrer (GA4
 * reports it as `(direct)`), and `github.com` is our own repository (the
 * 2026-11-11 review's §10(b): a github.com referral is a self-referral and
 * never a positive signal).
 */
export const EXCLUDED_SOURCES = ["direct", "(direct)", "github.com"];

/**
 * Sessions GA4 could not attribute to any source at all. They are not external
 * traffic — nothing named them — but they are not Direct either, so the external
 * audience line reports them separately instead of silently adding or dropping
 * them: the 2026-11-14 review's baseline of `19 sessions / 16 users` excludes
 * Unassigned 3/3, and a line that quietly included it would never reconcile
 * with that number.
 */
export const UNATTRIBUTED_SOURCES = ["(not set)", "not set", "", "(none)"];

/**
 * Reduce GA4 rows shaped `[channel, sessionSource]` + `[sessions, users]` to
 * `[{channel, source, sessions, users}]`.
 *
 * This one-row-per-source table is the only honest source of a user count: a
 * breakdown by landing page repeats a visitor under every page they landed on,
 * so summing `users` across those rows counts one person several times. The
 * 2026-11-16 review caught the line doing exactly that — `bitcointalk.org 5/5`
 * when the same report's Referral table says `bitcointalk.org 5/2`, because the
 * source has four landing rows (pillar 2/2, /liquidation 1/1, /simulator 1/1,
 * /timeline 1/1), and the property-wide total of 40 users was reported as 22
 * external when the honest figure was 19.
 */
export function sourceTotalRows(table) {
  const rows = Array.isArray(table) ? table : [];
  const out = [];
  for (const row of rows) {
    const channel = row?.dimensionValues?.[0]?.value;
    const source = row?.dimensionValues?.[1]?.value;
    const sessions = Number(row?.metricValues?.[0]?.value ?? 0);
    const users = Number(row?.metricValues?.[1]?.value ?? 0);
    if (!source || !Number.isFinite(sessions)) continue;
    out.push({
      channel: String(channel ?? ""),
      source: String(source).toLowerCase(),
      sessions,
      users: Number.isFinite(users) ? users : 0,
    });
  }
  return out;
}

/**
 * One user count per source: the authoritative `(channel, sessionSource)` table
 * when the report carries it, otherwise the largest single landing row for that
 * source — a lower bound, never a sum.
 */
function sourceUserIndex(totals) {
  const index = new Map();
  for (const row of Array.isArray(totals) ? totals : []) {
    index.set(row.source, (index.get(row.source) ?? 0) + row.users);
  }
  return index;
}

/**
 * Reduce GA4 rows shaped `[channel, sessionSource, landingPage]` +
 * `[sessions, users]` to `[{channel, source, landing, sessions, users}]`.
 */
export function namedSourceRows(table) {
  const rows = Array.isArray(table) ? table : [];
  const out = [];
  for (const row of rows) {
    const channel = row?.dimensionValues?.[0]?.value;
    const source = row?.dimensionValues?.[1]?.value;
    const landing = row?.dimensionValues?.[2]?.value;
    const sessions = Number(row?.metricValues?.[0]?.value ?? 0);
    const users = Number(row?.metricValues?.[1]?.value ?? 0);
    if (!source || !Number.isFinite(sessions)) continue;
    out.push({
      channel: String(channel ?? ""),
      source: String(source).toLowerCase(),
      landing: landing ? String(landing) : "(not set)",
      sessions,
      users: Number.isFinite(users) ? users : 0,
    });
  }
  return out;
}

/**
 * `named sources 7d: t.co 3/3 → /, facebook.com 6/6 → /, chatgpt.com 2/2 → (not set)`
 *
 * Every source outside Direct and github.com, with sessions, users and the
 * landing page that carried most of its sessions. This exists because the
 * Referral-channel line is structurally blind: GA4 files X under Organic
 * Social (`t.co`), Facebook under Organic Social, and ChatGPT under AI
 * Assistant, so 21 readings printed "0 named non-github referral sessions"
 * while nine such sessions were in the same 7-day window (review 2026-11-12).
 */
export function namedSourcesLine(rows, window, options = {}) {
  const totalsIndex = sourceUserIndex(options.sourceTotals);
  const bySource = new Map();
  for (const row of rows) {
    if (!(row.sessions > 0)) continue;
    if (EXCLUDED_SOURCES.includes(row.source)) continue;
    const entry = bySource.get(row.source) ?? {
      sessions: 0,
      users: 0,
      landings: new Map(),
    };
    entry.sessions += row.sessions;
    // One count per source: never the sum of a page-level breakdown.
    entry.users = Math.max(entry.users, row.users);
    entry.landings.set(row.landing, (entry.landings.get(row.landing) ?? 0) + row.sessions);
    bySource.set(row.source, entry);
  }

  const usersFor = (source, fallback) => totalsIndex.get(source) ?? fallback;

  const days = reportDays({ window });
  const label = days ? `named sources ${days}d:` : "named sources (window unknown):";
  if (bySource.size === 0) {
    let empty = `${label} none outside Direct and github.com`;
    if (window?.start && window?.end) empty += ` (window ${window.start} → ${window.end})`;
    return empty;
  }

  const parts = [...bySource.entries()]
    .sort((a, b) => b[1].sessions - a[1].sessions || a[0].localeCompare(b[0]))
    .map(([source, entry]) => {
      const [landing] = [...entry.landings.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      )[0];
      return `${source} ${entry.sessions}/${usersFor(source, entry.users)} → ${landing}`;
    });

  let line = `${label} ${parts.join(", ")}`;
  if (window?.start && window?.end) line += ` (window ${window.start} → ${window.end})`;
  return line;
}

/**
 * `external audience 7d: 19 sessions / 16 users (facebook.com 6/6 → /, …)`
 *
 * The 2026-11-14 review made this the headline number of every report, because
 * a session total without it is not a result: 108 sessions in the 7 days to
 * 2026-11-13 read as growth, and 19 of them were strangers (79 were Direct from
 * 17 users and 8 were this repository).
 *
 * "External" means every source that is neither Direct, github.com nor
 * unattributed — the same three exclusions, stated in the line's own label, so
 * the count cannot be inflated by traffic the site cannot name.
 *
 * `users` is one count per source, never a sum across a source's landing rows.
 * The 2026-11-16 review's mandate (`referral-instrument-1116`) exists because the
 * first version summed them: `bitcointalk.org` printed 5/5 by adding four
 * landing rows (2/2, 1/1, 1/1, 1/1) where the report's own Referral table says
 * 5 sessions / 2 users, and the headline read 22 users where the honest figure
 * was 19. The report's `(channel, sessionSource)` table, when present, is the
 * count; otherwise the largest landing row for that source is used — a lower
 * bound. Cross-source de-duplication is impossible from a breakdown, so the
 * total is capped at the property total and the cap is printed when it bites.
 */
export function externalAudienceLine(rows, window, options = {}) {
  const totalsIndex = sourceUserIndex(options.sourceTotals);
  const propertyUsers = Number(options.propertyUsers);
  const bySource = new Map();
  let unattributedSessions = 0;
  let unattributedUsers = 0;
  for (const row of rows) {
    if (!(row.sessions > 0)) continue;
    if (EXCLUDED_SOURCES.includes(row.source)) continue;
    if (UNATTRIBUTED_SOURCES.includes(row.source)) {
      unattributedSessions += row.sessions;
      unattributedUsers = Math.max(unattributedUsers, row.users);
      continue;
    }
    const entry = bySource.get(row.source) ?? {
      sessions: 0,
      users: 0,
      landings: new Map(),
    };
    entry.sessions += row.sessions;
    // One count per source. Summing this field is the defect this fixes.
    entry.users = Math.max(entry.users, row.users);
    entry.landings.set(row.landing, (entry.landings.get(row.landing) ?? 0) + row.sessions);
    bySource.set(row.source, entry);
  }

  const days = reportDays({ window });
  const label = days ? `external audience ${days}d:` : "external audience (window unknown):";
  const sessions = [...bySource.values()].reduce((sum, entry) => sum + entry.sessions, 0);
  let users = [...bySource.entries()].reduce(
    (sum, [source, entry]) => sum + (totalsIndex.get(source) ?? entry.users),
    0,
  );
  let capped = false;
  if (Number.isFinite(propertyUsers) && propertyUsers > 0 && users > propertyUsers) {
    users = propertyUsers;
    capped = true;
  }

  const parts = [...bySource.entries()]
    .sort((a, b) => b[1].sessions - a[1].sessions || a[0].localeCompare(b[0]))
    .map(([source, entry]) => {
      const [landing] = [...entry.landings.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      )[0];
      return `${source} ${entry.sessions}/${totalsIndex.get(source) ?? entry.users} → ${landing}`;
    });

  const detail =
    parts.length === 0 ? "none outside Direct, github.com and unattributed" : parts.join(", ");
  let line = `${label} ${sessions} sessions / ${users} users (${detail})`;
  if (window?.start && window?.end) line += ` (window ${window.start} → ${window.end})`;
  if (capped) line += ` — users capped at the property total of ${propertyUsers}`;
  if (unattributedSessions > 0) {
    line += ` — unattributed ${unattributedSessions} sessions / ${unattributedUsers} users ("(not set)")`;
  }
  return line;
}

/**
 * The seven sources an ask was actually handed to, printed whether or not they
 * sent anything: `asked channels 7d: bitcointalk.org 5/2, x.com 2/2, …`.
 *
 * "The ask produced nothing" and "the ask was never measurable" are different
 * claims, and only a line that lists every asked destination can tell them
 * apart. `lopp.net` is here because it is the one merged, followed link; a zero
 * on its own row is the reading that closed the linked-post experiment.
 */
export const ASKED_CHANNELS = [
  "bitcointalk.org",
  "x.com",
  "t.co",
  "facebook.com",
  "theblock.co",
  "lopp.net",
  "chatgpt.com",
];

export function askedChannelsLine(rows, window, options = {}) {
  const totalsIndex = sourceUserIndex(options.sourceTotals);
  const sessionsBy = new Map();
  const usersBy = new Map();
  for (const row of rows) {
    if (!(row.sessions > 0)) continue;
    if (!ASKED_CHANNELS.includes(row.source)) continue;
    sessionsBy.set(row.source, (sessionsBy.get(row.source) ?? 0) + row.sessions);
    // One count per source, as above: max over rows, replaced by the source
    // table when the report has one.
    usersBy.set(row.source, Math.max(usersBy.get(row.source) ?? 0, row.users));
  }

  const days = reportDays({ window });
  const label = days ? `asked channels ${days}d:` : "asked channels (window unknown):";
  const parts = ASKED_CHANNELS.map((source) => {
    const sessions = sessionsBy.get(source) ?? 0;
    const users = totalsIndex.get(source) ?? usersBy.get(source) ?? 0;
    return `${source} ${sessions}/${users}`;
  });
  const answered = parts.filter((part) => !part.endsWith(" 0/0"));
  let line = `${label} ${parts.join(", ")}`;
  if (answered.length === 0) line += " — none of them sent a visitor";
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

function resolveFlagged(argv, index, fallback) {
  return resolve(index === -1 ? fallback : argv[index + 1]);
}

function printWindow(dir, wanted) {
  const found = newestReport(dir, { days: wanted });
  if (!found) {
    console.log(
      `external audience ${wanted}d: not measured — no ${wanted}-day GA4 report in ${dir}. Run: npm run analytics -- --days=${wanted}`,
    );
    console.log(
      `referrals ${wanted}d: not measured — no ${wanted}-day GA4 report in ${dir}. Run: npm run analytics -- --days=${wanted}`,
    );
    console.log(`named sources ${wanted}d: not measured — no ${wanted}-day GA4 report in ${dir}.`);
    console.log(`asked channels ${wanted}d: not measured — no ${wanted}-day GA4 report in ${dir}.`);
    return false;
  }
  const window = found.report?.window;
  const rows = namedSourceRows(found.report?.tables?.namedSources);
  // The `(channel, sessionSource)` table is the only honest source of a user
  // count (see sourceTotalRows); older reports do not carry it and the line
  // falls back to one landing row per source.
  const sourceTotals = sourceTotalRows(found.report?.tables?.sourceTotals);
  const propertyUsers = Number(found.report?.totals?.current?.users);
  // External audience first: since 2026-11-14 it is the headline the report
  // leads with, and the referral/named-source lines are its detail.
  console.log(externalAudienceLine(rows, window, { sourceTotals, propertyUsers }));
  console.log(referralLine(referralRows(found.report?.tables?.referrals), window));
  console.log(namedSourcesLine(rows, window, { sourceTotals }));
  console.log(askedChannelsLine(rows, window, { sourceTotals }));
  return true;
}

function main(argv) {
  const dirFlag = argv.indexOf("--dir");
  const dir = resolveFlagged(argv, dirFlag, DEFAULT_DIR);
  const daysFlag = argv.find((arg) => arg.startsWith("--days="));

  // No --days: print both windows the review reads, so one command answers
  // "what arrived, from where, and how many people" for 7 and 28 days.
  const windows = daysFlag
    ? [
        (() => {
          const requested = Number(daysFlag.slice("--days=".length));
          return Number.isFinite(requested) && requested > 0 ? Math.round(requested) : 7;
        })(),
      ]
    : [7, 28];

  let ok = true;
  for (const wanted of windows) {
    if (!printWindow(dir, wanted)) ok = false;
  }
  return ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
