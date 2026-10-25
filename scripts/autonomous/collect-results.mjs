#!/usr/bin/env node
/**
 * Results collector — the measurement half of the review layer.
 *
 * The daily cycle proves *activity* (commit, tests, deploy). This proves
 * *outcome*: it reads the reports the review runner just fetched, appends a row
 * to a local history, and reduces everything to signals the reviewer must
 * explain:
 *
 *   metrics  one window of Search Console + indexation + GA4 numbers
 *   signals  indexation, non-brand clicks, impressions, sessions, referrals,
 *            plus process signals (deploy health, cycle yield, data freshness)
 *   rule     mayClaimImproving — the runner refuses a rosy verdict that the
 *            data does not support, so "no results" cannot be talked past
 *
 * Writes `<state-dir>/results-history.csv` (append-only, backfilled from the
 * dated reports on disk) and `<state-dir>/review-input.json`, and prints
 * `key=value` lines for the runner's log.
 *
 * Usage:
 *   node scripts/autonomous/collect-results.mjs [--state-dir DIR]
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");
const DEFAULT_STATE_DIR =
  process.env.BTC500_GROWTH_STATE_DIR || join(homedir(), ".local", "state", "btc500-growth");
const GSC_OUT = join(REPO_ROOT, "scripts", "search-console", "output");
const GA4_OUT = join(REPO_ROOT, "scripts", "analytics", "output");

/** Thresholds are deliberately conservative: this site's numbers are tiny, so
 * only moves that clear them count as signal. Documented in GROWTH_REVIEW.md. */
const THRESHOLDS = {
  indexStallDays: 14,
  nonBrandStallDays: 21,
  referralGreenDays: 7,
  referralStallDays: 30,
  /** An owner ask needs this long to show up as a referral session. */
  askMeasureDays: 7,
  trendUpPct: 0.1,
  trendDownPct: 0.3,
  /** A drop only counts as a regression when the old number was big enough for
   *  the change to mean something (45 -> 28 impressions a week is noise). */
  trendMinOld: 100,
  staleHours: 36,
  minOutcomeGreen: 2,
  lookbackDays: 7,
};

const HISTORY_HEADER =
  "date,windowDays,ga4Days,clicks,impressions,ctr,position,brandClicks,nonBrandClicks," +
  "nonBrandEnd,pagesWithImpressions,indexed,totalUrls,sessions,organicSessions,referralSessions";

const BRAND_RE = /btc\s*500/i;

/** Statuses that mean the automation itself broke, not just "no movement". */
const FAILURE_STATUSES = [
  "deploy-failed",
  "site-down",
  "validation-failed",
  "push-blocked",
  "dirty-tree",
  "failed",
  "verdict-invalid",
  "deferred-cycle-running",
];

function isoToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** GA4 referrer substrings that prove each distribution channel fired. */
const CHANNEL_REFERRERS = {
  x: ["x.com", "twitter.com"],
  reply: ["x.com", "twitter.com"],
  community: ["reddit.com", "news.ycombinator.com", "bitcointalk.org", "t.me", "discord"],
  newsletter: [],
  email: [],
  embed: [],
  github: ["github.com"],
  other: [],
};

function shiftDays(date, days) {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  if (!from || !to) return null;
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ------------------------------------------------------------------ parsing ---

/**
 * Search Console performance report -> flat metrics plus the query and page
 * detail the reviewer needs as evidence.
 */
export function parsePerformance(json) {
  if (!json || !json.totals) return null;
  const queries = Array.isArray(json.queries) ? json.queries : [];
  const pages = Array.isArray(json.pages) ? json.pages : [];
  let brandClicks = 0;
  let nonBrandClicks = 0;
  let brandImpressions = 0;
  let nonBrandImpressions = 0;
  const nonBrandRows = [];
  for (const row of queries) {
    const q = String(row.keys?.[0] ?? "");
    const brand = BRAND_RE.test(q);
    if (brand) {
      brandClicks += num(row.clicks);
      brandImpressions += num(row.impressions);
    } else {
      nonBrandClicks += num(row.clicks);
      nonBrandImpressions += num(row.impressions);
      nonBrandRows.push({
        query: q,
        clicks: num(row.clicks),
        impressions: num(row.impressions),
        position: Math.round(num(row.position) * 10) / 10,
      });
    }
  }
  nonBrandRows.sort((a, b) => b.impressions - a.impressions);
  const positions4to20 = queries.filter((row) => {
    const p = num(row.position, 999);
    return num(row.impressions) > 0 && p >= 4 && p <= 20;
  }).length;
  const lastNonBrand = nonBrandRows.filter((r) => r.clicks > 0).length > 0;
  return {
    window: json.window ?? null,
    windowDays: num(json.window?.days, 0) || null,
    clicks: num(json.totals.clicks),
    impressions: num(json.totals.impressions),
    ctr: num(json.totals.ctr),
    position: Math.round(num(json.totals.position) * 10) / 10,
    brandClicks,
    brandImpressions,
    nonBrandClicks,
    nonBrandImpressions,
    hasQueryRows: queries.length > 0,
    nonBrandHasClick: lastNonBrand,
    pagesWithImpressions: pages.filter((row) => num(row.impressions) > 0).length,
    pages: pages.length,
    positions4to20,
    topQueries: queries
      .slice()
      .sort((a, b) => num(b.impressions) - num(a.impressions))
      .slice(0, 15)
      .map((row) => ({
        query: String(row.keys?.[0] ?? ""),
        clicks: num(row.clicks),
        impressions: num(row.impressions),
        position: Math.round(num(row.position) * 10) / 10,
      })),
    topPages: pages
      .slice()
      .sort((a, b) => num(b.impressions) - num(a.impressions))
      .slice(0, 15)
      .map((row) => ({
        page: String(row.keys?.[0] ?? ""),
        clicks: num(row.clicks),
        impressions: num(row.impressions),
        position: Math.round(num(row.position) * 10) / 10,
      })),
  };
}

/** URL Inspection report -> how many of the site's pages are actually indexed. */
export function parseInspection(json) {
  if (!json || !Array.isArray(json.rows)) return null;
  const coverage = {};
  let indexed = 0;
  const notIndexed = [];
  for (const row of json.rows) {
    const label = String(row.coverage ?? "unknown");
    coverage[label] = (coverage[label] ?? 0) + 1;
    // "Submitted and indexed" is indexed; "Crawled - currently not indexed" is not.
    if (/indexed/i.test(label) && !/not indexed/i.test(label)) indexed += 1;
    else notIndexed.push({ url: row.url, coverage: label, lastCrawl: row.lastCrawl ?? null });
  }
  return {
    total: json.rows.length,
    indexed,
    coverage,
    notIndexed: notIndexed.slice(0, 30),
  };
}

/** GA4 report -> sessions, the organic share, and referral evidence of links. */
export function parseGa4(json) {
  if (!json || !json.totals?.current) return null;
  const rows = (table) => (Array.isArray(table) ? table : []);
  const table = json.tables ?? {};
  const channelSessions = (name) => {
    for (const row of rows(table.channels)) {
      if (String(row.dimensionValues?.[0]?.value ?? "") === name) {
        return num(row.metricValues?.[0]?.value);
      }
    }
    return 0;
  };
  const referrals = rows(table.referrals).map((row) => ({
    source: String(row.dimensionValues?.[0]?.value ?? ""),
    sessions: num(row.metricValues?.[0]?.value),
  }));
  return {
    window: json.window ?? null,
    windowDays: num(json.window?.days, 0) || null,
    sessions: num(json.totals.current.sessions),
    users: num(json.totals.current.users),
    newUsers: num(json.totals.current.newUsers),
    views: num(json.totals.current.views),
    engagedSessions: num(json.totals.current.engagedSessions),
    engagementRate: num(json.totals.current.engagementRate),
    organicSessions: channelSessions("Organic Search"),
    directSessions: channelSessions("Direct"),
    referralSessions: referrals.reduce((sum, row) => sum + row.sessions, 0),
    referrals,
    landing: rows(table.landing)
      .slice(0, 15)
      .map((row) => ({
        path: String(row.dimensionValues?.[0]?.value ?? ""),
        sessions: num(row.metricValues?.[0]?.value),
      })),
  };
}

/** last-status.txt / status-history.csv -> activity over the lookback window. */
export function parseActivity(statusText, today) {
  const since = shiftDays(today, -THRESHOLDS.lookbackDays);
  const lines = String(statusText ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const rows = [];
  for (const line of lines) {
    if (line.startsWith("timestamp,")) continue;
    const fields = line.split(",");
    if (fields.length >= 3 && fields[0].includes("T")) {
      // csv: timestamp,status,model,...
      rows.push({ timestamp: fields[0], status: fields[1] });
      continue;
    }
    // last-status.txt form: "ts status=x model=y head=..." on one line
    const record = {};
    for (const pair of line.split(/\s+/)) {
      const eq = pair.indexOf("=");
      if (eq > 0) record[pair.slice(0, eq)] = pair.slice(eq + 1);
    }
    if (record.status) rows.push({ timestamp: record.timestamp, status: record.status });
  }
  const recent = rows.filter((row) => (row.timestamp ?? "").slice(0, 10) >= since);
  const counts = {};
  for (const row of recent) counts[row.status] = (counts[row.status] ?? 0) + 1;
  const failures = recent.filter((row) => FAILURE_STATUSES.includes(row.status));
  const shipped = recent.filter((row) => row.status === "shipped" || row.status === "archive-only");
  return {
    window: { from: since, to: today },
    runs: recent.length,
    shipped: shipped.length,
    failures: failures.length,
    failureStatuses: [...new Set(failures.map((row) => row.status))],
    counts,
    last: rows.length ? rows[rows.length - 1] : null,
  };
}

// ------------------------------------------------------------------ history ---

export function readHistory(path) {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",");
  if (header[0] !== "date") return [];
  return lines.slice(1).map((line) => {
    const fields = line.split(",");
    const row = {};
    header.forEach((key, i) => {
      const raw = fields[i] ?? "";
      row[key] = key === "date" ? raw : raw === "" ? null : Number(raw);
    });
    return row;
  });
}

export function writeHistory(path, rows) {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const lines = [HISTORY_HEADER];
  for (const row of sorted) {
    const fields = HISTORY_HEADER.split(",").map((key) =>
      key === "date" ? (row[key] ?? "") : row[key] == null ? "" : String(row[key]),
    );
    lines.push(fields.join(","));
  }
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return sorted;
}

function reportDate(filename) {
  // performance-2026-10-25T04-00-13.json -> 2026-10-25
  const match = /^.+-(\d{4}-\d{2}-\d{2})T/.exec(filename);
  return match ? match[1] : null;
}

/** Map of fetch date -> the best dated report for that day, preferring a
 *  window of `preferDays` when several were fetched the same day. */
export function datedReportIndex(dir, prefix, preferDays) {
  const best = new Map();
  if (!existsSync(dir)) return best;
  for (const name of readdirSync(dir)) {
    if (!name.startsWith(`${prefix}-`) || !name.endsWith(".json")) continue;
    if (name.endsWith("-latest.json")) continue;
    const date = reportDate(name);
    if (!date) continue;
    const days = num(readJson(join(dir, name))?.window?.days, 0);
    const prev = best.get(date);
    if (!prev || Math.abs(days - preferDays) < Math.abs(prev.days - preferDays)) {
      best.set(date, { path: join(dir, name), days });
    }
  }
  return best;
}

function rowFromReports(date, perf, insp, ga4) {
  if (!perf && !insp && !ga4) return null;
  return {
    date,
    windowDays: perf?.windowDays ?? null,
    ga4Days: ga4?.windowDays ?? null,
    clicks: perf?.clicks ?? null,
    impressions: perf?.impressions ?? null,
    ctr: perf?.ctr != null ? Math.round(perf.ctr * 10_000) / 10_000 : null,
    position: perf?.position ?? null,
    brandClicks: perf?.brandClicks ?? null,
    nonBrandClicks: perf?.nonBrandClicks ?? null,
    nonBrandEnd: perf?.window?.end ?? null,
    pagesWithImpressions: perf?.pagesWithImpressions ?? null,
    indexed: insp?.indexed ?? null,
    totalUrls: insp?.total ?? null,
    sessions: ga4?.sessions ?? null,
    organicSessions: ga4?.organicSessions ?? null,
    referralSessions: ga4?.referralSessions ?? null,
  };
}

/**
 * Rebuild missing rows from the dated reports on disk so day one of the
 * history already has the days that were fetched before it existed.
 * Existing rows always win; this only fills gaps.
 */
export function backfillHistory({ gscDir, ga4Dir, today }) {
  const perfIndex = datedReportIndex(gscDir, "performance", 7);
  const inspIndex = datedReportIndex(gscDir, "inspection", 0);
  const ga4Index = datedReportIndex(ga4Dir, "ga4", 7);
  const dates = new Set([...perfIndex.keys(), ...inspIndex.keys(), ...ga4Index.keys()]);
  const rows = [];
  for (const date of [...dates].sort()) {
    if (date >= today) continue;
    const perf = perfIndex.has(date) ? parsePerformance(readJson(perfIndex.get(date).path)) : null;
    const insp = inspIndex.has(date) ? parseInspection(readJson(inspIndex.get(date).path)) : null;
    const ga4 = ga4Index.has(date) ? parseGa4(readJson(ga4Index.get(date).path)) : null;
    const row = rowFromReports(date, perf, insp, ga4);
    if (row) rows.push(row);
  }
  return rows;
}

export function mergeHistory(existing, backfill, today) {
  const byDate = new Map();
  for (const row of backfill) byDate.set(row.date, row);
  for (const row of existing) byDate.set(row.date, row); // existing wins
  byDate.delete(today); // today is written from the freshest reports
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function rowForDate(rows, date) {
  return rows.find((row) => row.date === date) ?? null;
}

/** The row closest to `date - days` whose window matches the current one. */
export function comparableRow(rows, today, days, field, preferDays) {
  const target = shiftDays(today, -days);
  const sameWindow = rows.filter((row) => row[field] === preferDays);
  let best = null;
  let bestGap = Infinity;
  for (const row of sameWindow) {
    const gap = Math.abs(daysBetween(row.date, target));
    if (gap <= 3 && gap < bestGap) {
      best = row;
      bestGap = gap;
    }
  }
  return best;
}

export function trend(cur, old, thresholds) {
  const { trendUpPct: upPct, trendDownPct: downPct, trendMinOld: minOld } = thresholds;
  if (cur == null || old == null) return null;
  if (old < minOld) {
    // Too small to read a percentage from; only a rise counts.
    if (cur > old) return "up";
    if (cur < old) return "noisy-down";
    return "flat";
  }
  const delta = (cur - old) / old;
  if (delta >= upPct) return "up";
  if (delta <= -downPct) return "down";
  return "flat";
}

/** Days since the last row whose `field` was positive (0 when today's is). */
export function daysSincePositive(rows, today, field) {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = sorted.length - 1; i >= 0; i--) {
    const row = sorted[i];
    if (num(row[field]) > 0) {
      const end = row.nonBrandEnd && field.startsWith("nonBrand") ? row.nonBrandEnd : row.date;
      return Math.max(0, daysBetween(end, today));
    }
  }
  return null;
}

// ----------------------------------------------------------------- signals ---

export function computeSignals({
  rows,
  today,
  perf,
  insp,
  ga4,
  activity,
  sources,
  previousReview,
}) {
  const signals = [];
  const oldest = rows.length ? rows[0] : null;
  const span = oldest ? daysBetween(oldest.date, today) : 0;

  // 1. indexation — the leading indicator for a site this new.
  if (!insp) {
    signals.push({
      id: "indexation",
      kind: "outcome",
      state: "unknown",
      evidence: "No URL inspection report; indexation was not measured.",
    });
  } else {
    const old =
      comparableRow(
        rows,
        today,
        THRESHOLDS.indexStallDays,
        "windowDays",
        perf?.windowDays ?? null,
      ) ?? (span > 0 ? oldest : null);
    const nowCount = insp.indexed;
    const oldCount = old?.indexed ?? null;
    if (oldCount == null || oldCount === nowCount) {
      const delta = oldCount == null ? null : 0;
      const stalled = delta === 0 && span >= THRESHOLDS.indexStallDays;
      signals.push({
        id: "indexation",
        kind: "outcome",
        state: stalled ? "stalled" : delta === 0 ? "flat" : "unknown",
        evidence:
          delta === 0
            ? `${nowCount}/${insp.total} URLs indexed, unchanged for ${span}d of history${old ? ` (same as ${old.date})` : ""}.`
            : `${nowCount}/${insp.total} URLs indexed; only ${span}d of history to compare against.`,
        current: `${nowCount}/${insp.total}`,
      });
    } else if (nowCount > oldCount) {
      signals.push({
        id: "indexation",
        kind: "outcome",
        state: "green",
        evidence: `Indexed pages rose ${oldCount} -> ${nowCount} (${old.date} to ${today}).`,
        current: `${nowCount}/${insp.total}`,
      });
    } else {
      signals.push({
        id: "indexation",
        kind: "outcome",
        state: "regressed",
        evidence: `Indexed pages fell ${oldCount} -> ${nowCount} (${old.date} to ${today}).`,
        current: `${nowCount}/${insp.total}`,
      });
    }
  }

  // 2. non-brand clicks — proof that strangers are finding us, not our own name.
  if (!perf) {
    signals.push({
      id: "non-brand-clicks",
      kind: "outcome",
      state: "unknown",
      evidence: "No Search Console performance report; queries were not measured.",
    });
  } else {
    const since = daysSincePositive(rows, today, "nonBrandClicks");
    if (perf.nonBrandClicks > 0) {
      signals.push({
        id: "non-brand-clicks",
        kind: "outcome",
        state: "green",
        evidence: `${perf.nonBrandClicks} non-brand click(s) in the current window (${perf.window?.start}..${perf.window?.end}).`,
        current: perf.nonBrandClicks,
      });
    } else {
      const days = since ?? span;
      const stalled = days >= THRESHOLDS.nonBrandStallDays;
      const where = perf.hasQueryRows
        ? ""
        : " (GSC returned no query rows — volume below the reporting threshold)";
      const when = since == null ? "never once in it" : `the last was ${days}d ago`;
      signals.push({
        id: "non-brand-clicks",
        kind: "outcome",
        state: stalled ? "stalled" : "flat",
        evidence:
          `0 non-brand clicks in ${span}d of history${where}; ${when} — ` +
          `${stalled ? "past" : "under"} the ${THRESHOLDS.nonBrandStallDays}d stall bar.`,
        current: 0,
      });
    }
  }

  // 3. impressions — demand-side: is anybody being shown us at all?
  signals.push(
    trendSignal({
      id: "impressions",
      rows,
      today,
      perf,
      field: "impressions",
      label: "impressions",
      windowField: "windowDays",
      window: perf?.windowDays ?? null,
    }),
  );

  // 4. sessions — the bottom of the funnel we can actually see.
  signals.push(
    trendSignal({
      id: "sessions",
      rows,
      today,
      perf: ga4,
      field: "sessions",
      label: "sessions",
      windowField: "ga4Days",
      window: ga4?.windowDays ?? null,
    }),
  );

  // 5. referral sessions — somebody linked to us, or nobody did.
  if (!ga4) {
    signals.push({
      id: "referral-sessions",
      kind: "outcome",
      state: "unknown",
      evidence: "No GA4 report; referral traffic was not measured.",
    });
  } else {
    const since = daysSincePositive(rows, today, "referralSessions");
    if (since != null && since <= THRESHOLDS.referralGreenDays) {
      signals.push({
        id: "referral-sessions",
        kind: "outcome",
        state: "green",
        evidence: `Referral session(s) ${since}d ago — something linking to us is producing visits.`,
        current: ga4.referralSessions,
      });
    } else if ((since ?? span) >= THRESHOLDS.referralStallDays) {
      signals.push({
        id: "referral-sessions",
        kind: "outcome",
        state: "stalled",
        evidence: `No referral session in ${since ?? span}d${since == null ? " of history" : ""} — no link is earning traffic.`,
        current: ga4.referralSessions,
      });
    } else {
      signals.push({
        id: "referral-sessions",
        kind: "outcome",
        state: "flat",
        evidence: `No referral session in ${since ?? span}d (${THRESHOLDS.referralStallDays}d is the stall bar).`,
        current: ga4.referralSessions,
      });
    }
  }

  // 6. deploy health — process, not outcome.
  if (!activity) {
    signals.push({
      id: "deploy-health",
      kind: "process",
      state: "unknown",
      evidence: "No status-history.csv; run history unavailable.",
    });
  } else if (activity.runs === 0) {
    signals.push({
      id: "deploy-health",
      kind: "process",
      state: span >= THRESHOLDS.lookbackDays ? "stalled" : "flat",
      evidence: `No growth run recorded in the last ${THRESHOLDS.lookbackDays} days.`,
    });
  } else if (activity.failures > 0) {
    signals.push({
      id: "deploy-health",
      kind: "process",
      state: "regressed",
      evidence: `${activity.failures} failed run(s) in ${THRESHOLDS.lookbackDays}d: ${activity.failureStatuses.join(", ")}.`,
      current: activity.failures,
    });
  } else {
    signals.push({
      id: "deploy-health",
      kind: "process",
      state: "green",
      evidence: `${activity.runs} run(s) in ${THRESHOLDS.lookbackDays}d, none failed.`,
      current: activity.runs,
    });
  }

  const outcomeGreens = signals.filter((s) => s.kind === "outcome" && s.state === "green").length;

  // 7. cycle yield — shipped work with no movement is the question this layer exists to ask.
  if (activity) {
    let state = "flat";
    if (activity.shipped === 0) state = "stalled";
    else if (activity.shipped >= 4 && outcomeGreens === 0) state = "stalled";
    else if (activity.shipped >= 1 && outcomeGreens >= 1) state = "green";
    signals.push({
      id: "cycle-yield",
      kind: "process",
      state,
      evidence:
        activity.shipped === 0
          ? `0 cycles shipped in ${THRESHOLDS.lookbackDays}d.`
          : `${activity.shipped} cycle(s) shipped in ${THRESHOLDS.lookbackDays}d, ${outcomeGreens} positive outcome signal(s).`,
      current: activity.shipped,
    });
  }

  // 8. data freshness — without fresh numbers there is no evidence either way.
  const staleSources = (sources ?? []).filter(
    (s) => s.missing || s.ageHours == null || s.ageHours > THRESHOLDS.staleHours,
  );
  signals.push({
    id: "data-freshness",
    kind: "process",
    state: staleSources.length ? "stale" : "green",
    evidence: staleSources.length
      ? `Missing or stale (> ${THRESHOLDS.staleHours}h): ${staleSources.map((s) => s.id).join(", ")}.`
      : `All reports fetched within ${THRESHOLDS.staleHours}h.`,
  });

  // 9. ask-effect — did the action we asked the owner to take produce anything?
  //    Only appears once an ask exists: before that there is nothing to measure,
  //    and "not asked yet" is a note for the reviewer, not a signal.
  const askSignal = askEffectSignal({ previousReview, ga4, today });
  if (askSignal) signals.push(askSignal);

  return signals.filter(Boolean);
}

/**
 * The owner half of the loop: an ask was issued, so the next review must be
 * able to say whether it worked. Referrers default per channel so a reviewer
 * cannot "forget" the machine-readable half of the ask.
 */
export function askEffectSignal({ previousReview, ga4, today }) {
  const asks = Array.isArray(previousReview?.asks) ? previousReview.asks.filter(Boolean) : [];
  if (!asks.length) return null;
  const ask = [...asks].sort((a, b) => String(b.by ?? "").localeCompare(String(a.by ?? "")))[0];
  const issued = previousReview.generated || ask.by || today;
  const channel = String(ask.channel ?? "other");
  if (!ga4) {
    return {
      id: "ask-effect",
      kind: "outcome",
      state: "unknown",
      evidence: `The ${channel} ask issued ${issued} cannot be measured: no GA4 report.`,
    };
  }
  const needles = (
    Array.isArray(ask.referrers) && ask.referrers.length
      ? ask.referrers
      : (CHANNEL_REFERRERS[channel] ?? [])
  )
    .map((n) => String(n).toLowerCase())
    .filter(Boolean);
  const hit = ga4.referrals.find(
    (row) =>
      needles.some((n) =>
        String(row.source ?? "")
          .toLowerCase()
          .includes(n),
      ) && row.sessions > 0,
  );
  const age = Math.max(0, daysBetween(issued, today));
  if (hit) {
    return {
      id: "ask-effect",
      kind: "outcome",
      state: "green",
      evidence: `The ${channel} ask issued ${issued} produced ${hit.sessions} session(s) from ${hit.source}.`,
      current: hit.sessions,
    };
  }
  if (age < THRESHOLDS.askMeasureDays) {
    return {
      id: "ask-effect",
      kind: "outcome",
      state: "flat",
      evidence: `The ${channel} ask issued ${issued} is ${age}d old; measurable after ${shiftDays(issued, THRESHOLDS.askMeasureDays)}.`,
      current: 0,
    };
  }
  return {
    id: "ask-effect",
    kind: "outcome",
    state: "stalled",
    evidence:
      `The ${channel} ask of ${issued} produced 0 referral sessions in ${age}d ` +
      `(${needles.join(", ") || "no referrers listed"}) — restate it narrower or change channel.`,
    current: 0,
  };
}

function trendSignal({ id, rows, today, perf, field, label, windowField, window }) {
  if (!perf) {
    return {
      id,
      kind: "outcome",
      state: "unknown",
      evidence: `No report to read ${label} from.`,
    };
  }
  const current = perf[field];
  const oldest = rows.length ? rows[0] : null;
  const span = oldest ? daysBetween(oldest.date, today) : 0;
  const matched = comparableRow(rows, today, THRESHOLDS.indexStallDays, windowField, window);
  // Only compare like with like: a 7-day number against a 28-day number would
  // be a claim, not a measurement.
  const old = matched ?? (oldest && oldest[windowField] === window ? oldest : null);
  if (!old || old.date === today || old[field] == null) {
    return {
      id,
      kind: "outcome",
      state: span > 0 ? "flat" : "unknown",
      evidence: `${label}: ${current}; only ${span}d of history to compare against.`,
      current,
    };
  }
  const dir = trend(current, old[field], THRESHOLDS);
  const detail = `${label} ${old[field]} (${old.date}) -> ${current} (${today})`;
  if (dir === "up") {
    return { id, kind: "outcome", state: "green", evidence: `${detail} — up.`, current };
  }
  if (dir === "down") {
    return { id, kind: "outcome", state: "regressed", evidence: `${detail} — down.`, current };
  }
  if (dir === "noisy-down") {
    return {
      id,
      kind: "outcome",
      state: "flat",
      evidence: `${detail} — down, but from a base below ${THRESHOLDS.trendMinOld} so the move is noise.`,
      current,
    };
  }
  const stalled = span >= THRESHOLDS.indexStallDays;
  return {
    id,
    kind: "outcome",
    state: stalled ? "stalled" : "flat",
    evidence: `${detail} — flat for ${span}d${stalled ? "" : ` (${THRESHOLDS.indexStallDays}d is the stall bar)`}.`,
    current,
  };
}

/** The gate the runner enforces: a verdict may only claim progress the data shows. */
export function applyRule(signals) {
  const outcomeGreen = signals.filter((s) => s.kind === "outcome" && s.state === "green").length;
  const stalled = signals.filter((s) => s.state === "stalled").length;
  const regressed = signals.filter((s) => s.state === "regressed").map((s) => s.id);
  const stale = signals.some((s) => s.state === "stale");
  const blockedBecause = [];
  if (outcomeGreen < THRESHOLDS.minOutcomeGreen) {
    blockedBecause.push(
      `only ${outcomeGreen} positive outcome signal(s), need ${THRESHOLDS.minOutcomeGreen} to claim improvement`,
    );
  }
  if (regressed.length) blockedBecause.push(`regressed: ${regressed.join(", ")}`);
  if (stale) blockedBecause.push("measurement data is missing or stale, so nothing can be claimed");
  return {
    mayClaimImproving: blockedBecause.length === 0,
    outcomeGreen,
    stalled,
    regressed,
    stale,
    blockedBecause,
  };
}

// -------------------------------------------------------------------- main ---

function sourceInfo(id, path) {
  if (!existsSync(path)) return { id, path, missing: true, ageHours: null };
  try {
    const ageHours = Math.round(((Date.now() - statSync(path).mtimeMs) / 3_600_000) * 10) / 10;
    return { id, path, missing: false, ageHours };
  } catch {
    return { id, path, missing: true, ageHours: null };
  }
}

function pickReport(dir, prefix, preferDays) {
  const index = datedReportIndex(dir, prefix, preferDays);
  const todayEntry = index.get(isoToday());
  if (todayEntry) return todayEntry.path;
  const latest = join(dir, `${prefix}-latest.json`);
  if (existsSync(latest)) return latest;
  const dates = [...index.keys()].sort();
  return dates.length ? index.get(dates[dates.length - 1]).path : null;
}

function readReview(repoRoot) {
  const file = join(repoRoot, "scripts", "autonomous", "review-latest.json");
  const json = readJson(file);
  if (!json) {
    return {
      file,
      present: false,
      mandates: [],
      targets: [],
      overdue: [],
      asks: [],
      asksOverdue: [],
    };
  }
  const today = isoToday();
  const mandates = Array.isArray(json.mandates) ? json.mandates : [];
  const targets = Array.isArray(json.targets) ? json.targets : [];
  const asks = Array.isArray(json.owner_asks) ? json.owner_asks.filter(Boolean) : [];
  return {
    file,
    present: true,
    generated: json.generated ?? null,
    verdict: json.verdict ?? null,
    mode: json.mode ?? null,
    mandates,
    targets,
    overdue: mandates.filter((m) => m.due && m.due < today),
    self_changes: Array.isArray(json.self_changes) ? json.self_changes : [],
    asks,
    asksOverdue: asks.filter((a) => a.by && a.by < today),
  };
}

function reviewStreak(stateDir) {
  const file = join(stateDir, "review-history.csv");
  if (!existsSync(file)) return { nonImproving: 0, verdicts: [] };
  const lines = readFileSync(file, "utf8").split("\n").filter(Boolean);
  const rows = lines.slice(1).map((line) => line.split(","));
  const verdicts = rows.map((fields) => fields[3] ?? "").filter(Boolean);
  let streak = 0;
  for (let i = verdicts.length - 1; i >= 0; i--) {
    if (verdicts[i] === "improving") break;
    streak += 1;
  }
  return { nonImproving: streak, verdicts: verdicts.slice(-10) };
}

async function main(argv) {
  let stateDir = DEFAULT_STATE_DIR;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--state-dir" && argv[i + 1]) stateDir = resolve(argv[++i]);
  }
  mkdirSync(stateDir, { recursive: true });
  const today = isoToday();

  const perfPath = pickReport(GSC_OUT, "performance", 7);
  const inspPath = pickReport(GSC_OUT, "inspection", 0);
  const ga4Path = pickReport(GA4_OUT, "ga4", 7);
  const sources = [
    sourceInfo("search-console", perfPath ?? join(GSC_OUT, "performance-latest.json")),
    sourceInfo("indexation", inspPath ?? join(GSC_OUT, "inspection-latest.json")),
    sourceInfo("ga4", ga4Path ?? join(GA4_OUT, "ga4-latest.json")),
  ];

  const perf = perfPath ? parsePerformance(readJson(perfPath)) : null;
  const insp = inspPath ? parseInspection(readJson(inspPath)) : null;
  const ga4 = ga4Path ? parseGa4(readJson(ga4Path)) : null;

  const historyPath = join(stateDir, "results-history.csv");
  const existing = readHistory(historyPath);
  const backfill = backfillHistory({ gscDir: GSC_OUT, ga4Dir: GA4_OUT, today });
  const merged = mergeHistory(existing, backfill, today);
  const todayRow = rowFromReports(today, perf, insp, ga4);
  const rows = writeHistory(historyPath, todayRow ? [...merged, todayRow] : merged);

  const statusPath = join(stateDir, "status-history.csv");
  const activity = existsSync(statusPath)
    ? parseActivity(readFileSync(statusPath, "utf8"), today)
    : null;

  const previousReview = readReview(REPO_ROOT);
  const signals = computeSignals({
    rows,
    today,
    perf,
    insp,
    ga4,
    activity,
    sources,
    previousReview,
  });
  const rule = applyRule(signals);
  const streak = reviewStreak(stateDir);

  const currentByMetric = {
    indexed: insp ? insp.indexed : null,
    totalUrls: insp ? insp.total : null,
    nonBrandClicks: perf?.nonBrandClicks ?? null,
    clicks7: perf?.clicks ?? null,
    impressions7: perf?.impressions ?? null,
    sessions7: ga4?.sessions ?? null,
    organicSessions7: ga4?.organicSessions ?? null,
    referralSessions7: ga4?.referralSessions ?? null,
    positions4to20: perf?.positions4to20 ?? null,
  };

  const input = {
    schema: 1,
    generated: new Date().toISOString(),
    today,
    sources: sources.map((s) => ({ ...s, path: s.path.replace(REPO_ROOT, ".") })),
    metrics: { performance: perf, indexation: insp, ga4 },
    history: {
      file: historyPath,
      rows: rows.length,
      first: rows[0]?.date ?? null,
      last: rows[rows.length - 1]?.date ?? null,
      recent: rows.slice(-14),
    },
    activity,
    signals,
    rule,
    previousReview,
    reviewStreak: streak,
    currentByMetric,
    notes: [],
  };

  if (!perf || !insp || !ga4) {
    input.notes.push(
      "One or more measurement sources are missing; the reviewer must say so instead of guessing.",
    );
  }
  if (previousReview.overdue.length) {
    input.notes.push(
      `${previousReview.overdue.length} mandate(s) from ${previousReview.generated} are overdue: ` +
        previousReview.overdue.map((m) => m.id).join(", "),
    );
  }
  if (previousReview.asksOverdue.length) {
    input.notes.push(
      `${previousReview.asksOverdue.length} ask(s) from ${previousReview.generated} are past their by date: ` +
        `${previousReview.asksOverdue.map((a) => `${a.id} (${a.channel})`).join(", ")} — ` +
        "restate them narrower instead of letting them lapse, or record what stopped them.",
    );
  }
  if (previousReview.asks.length === 0) {
    input.notes.push(
      "No owner ask has ever been issued. While results are flat, owner_asks[] is where the " +
        "highest-leverage work lives: the automation cannot post, pitch or earn links by itself.",
    );
  }
  if (streak.nonImproving >= 3) {
    input.notes.push(
      `${streak.nonImproving} consecutive non-improving reviews. Strategy, not effort, is now the question.`,
    );
  }

  const outFile = join(stateDir, "review-input.json");
  writeFileSync(outFile, `${JSON.stringify(input, null, 2)}\n`, "utf8");

  const value = (pick) => (pick == null ? "?" : String(pick));
  console.log(`results: wrote ${outFile}`);
  console.log(
    `metrics=clicks:${value(perf?.clicks)} impressions:${value(perf?.impressions)} ` +
      `position:${value(perf?.position)} indexed:${value(insp ? `${insp.indexed}/${insp.total}` : null)} ` +
      `sessions:${value(ga4?.sessions)} organic:${value(ga4?.organicSessions)} referrals:${value(ga4?.referralSessions)}`,
  );
  console.log(
    `signals=green:${rule.outcomeGreen} stalled:${rule.stalled} regressed:${rule.regressed.length} ` +
      `stale:${rule.stale} may_claim_improving:${rule.mayClaimImproving}`,
  );
  if (previousReview.asks.length) {
    console.log(
      `asks=${previousReview.asks.length} from ${previousReview.generated} ` +
        `(overdue:${previousReview.asksOverdue.length})`,
    );
  }
  for (const signal of signals) {
    console.log(`signal ${signal.id}=${signal.state}: ${signal.evidence}`);
  }
  for (const note of input.notes) console.log(`note: ${note}`);
  return 0;
}

/**
 * True only when this file is the process entry point — compare real paths,
 * because macOS `/var/folders` is a symlink to `/private/var` and an absolute
 * argv[1] never matches `import.meta.url` by string.
 */
function isEntryPoint() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return pathToFileURL(process.argv[1]).href === import.meta.url;
  }
}

if (isEntryPoint()) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(`collect-results crashed: ${error?.stack ?? error}`);
      process.exit(1);
    });
}

export { THRESHOLDS, HISTORY_HEADER, FAILURE_STATUSES, isoToday, shiftDays, daysBetween, main };
