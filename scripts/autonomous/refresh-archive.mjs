#!/usr/bin/env node
/**
 * Refresh the on-site BTC daily archive (`public/btc-usd-max.csv` and the
 * root-level copy) from a public daily API.
 *
 * Why this exists: the shipped archive stopped on 2026-07-11 and its last row
 * has an empty close price, so every page computed from it was ~3.5 months
 * behind "today" without saying so. Refreshing is mechanical, so the runner
 * does it in preflight instead of spending an agent cycle on it.
 *
 * Row convention (do not change without re-validating the overlap):
 *   `event_date,close_price_usd,market_cap_usd,volume_usd`
 *   a row dated X carries the 00:00 UTC print of X+1, i.e. the close of day X.
 *   Measured against CoinGecko over the last 60 rows: median 0.008%, max 0.15%.
 *
 * Safety rules:
 *   - historical rows are copied through verbatim (byte for byte);
 *   - rows with an unusable close price are dropped and reported;
 *   - the fetch is validated against the last `sampleDays` archive rows before
 *     anything is written — if the source disagrees, nothing is written;
 *   - both copies are written together, or neither is.
 *
 * Usage:
 *   node scripts/autonomous/refresh-archive.mjs           # fetch + write
 *   node scripts/autonomous/refresh-archive.mjs --check   # staleness only, no network
 *   node scripts/autonomous/refresh-archive.mjs --json    # machine-readable result
 */

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..", "..");
export const ARCHIVE_PATHS = [
  join(ROOT, "public", "btc-usd-max.csv"),
  join(ROOT, "btc-usd-max.csv"),
];
export const HEADER = "event_date,close_price_usd,market_cap_usd,volume_usd";

// CoinGecko's free public endpoint caps the range, so we ask for the last year
// only: we need the gap (a few months) plus an overlap window to validate.
export const CHART_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily";

/** A row dated X closes at 00:00 UTC of X+1. */
export const CLOSE_OFFSET_DAYS = 1;

export const VALIDATION = {
  sampleDays: 60,
  minDays: 30,
  maxMedianPct: 0.1,
  maxP90Pct: 1,
  minWithin1PctShare: 0.9,
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function toIsoDay(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDaysIso(day, days) {
  return new Date(`${day}T00:00:00Z`).getTime() + days * 86_400_000;
}

export function shiftDay(day, days) {
  return toIsoDay(addDaysIso(day, days));
}

/**
 * Parse the archive. Rows keep their original text so a rewrite cannot alter
 * historical data.
 * @returns {{rows: Array<{date: string, raw: string, valid: boolean}>, validRows: Array<{date: string, raw: string}>, lastDate: string|null, dropped: string[]}}
 */
export function parseArchive(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const comma = raw.indexOf(",");
    const date = comma < 0 ? "" : raw.slice(0, comma).trim().split(" ")[0];
    const valid = ISO_DAY.test(date) && Number.isFinite(closeOf(raw)) && closeOf(raw) > 0;
    rows.push({ date, raw, valid });
  }
  const validRows = rows.filter((r) => r.valid);
  return {
    rows,
    validRows,
    lastDate: validRows.length ? validRows[validRows.length - 1].date : null,
    dropped: rows.filter((r) => !r.valid).map((r) => r.raw.slice(0, 40)),
  };
}

function closeOf(raw) {
  const comma = raw.indexOf(",");
  if (comma < 0) return NaN;
  const rest = raw.slice(comma + 1);
  const next = rest.indexOf(",");
  const cell = (next < 0 ? rest : rest.slice(0, next)).trim().replace(/^"|"$/g, "");
  if (!cell) return NaN;
  return Number(cell);
}

/**
 * CoinGecko's daily points at exactly 00:00 UTC, keyed by ISO day.
 * The trailing intraday point (a live price) is ignored.
 * @returns {Map<string, {price: number, cap: number, volume: number}>}
 */
export function midnightPoints(chart) {
  const points = new Map();
  const prices = chart?.prices ?? [];
  const caps = new Map((chart?.market_caps ?? []).map(([t, v]) => [toIsoDay(t), v]));
  const volumes = new Map((chart?.total_volumes ?? []).map(([t, v]) => [toIsoDay(t), v]));
  for (const [timestamp, price] of prices) {
    const iso = new Date(timestamp).toISOString();
    if (!iso.endsWith("00:00:00.000Z")) continue;
    const day = iso.slice(0, 10);
    points.set(day, {
      price,
      cap: Number.isFinite(caps.get(day)) ? caps.get(day) : 0,
      volume: Number.isFinite(volumes.get(day)) ? volumes.get(day) : 0,
    });
  }
  return points;
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

/**
 * How well the candidate source agrees with the archive on the days both cover.
 * The archive row for X is compared with the point at X+CLOSE_OFFSET_DAYS.
 */
export function overlapStats({ points, validRows, sampleDays = VALIDATION.sampleDays }) {
  const sample = validRows.slice(-sampleDays);
  const diffs = [];
  for (const row of sample) {
    const point = points.get(shiftDay(row.date, CLOSE_OFFSET_DAYS));
    if (!point) continue;
    const close = closeOf(row.raw);
    if (!Number.isFinite(close) || close <= 0) continue;
    diffs.push((Math.abs(point.price - close) / close) * 100);
  }
  diffs.sort((a, b) => a - b);
  const within1 = diffs.filter((d) => d <= 1).length;
  return {
    days: diffs.length,
    medianPct: percentile(diffs, 0.5),
    p90Pct: percentile(diffs, 0.9),
    maxPct: diffs.length ? diffs[diffs.length - 1] : null,
    within1PctShare: diffs.length ? within1 / diffs.length : 0,
  };
}

export function validateOverlap(stats) {
  if (stats.days < VALIDATION.minDays) {
    return {
      ok: false,
      reason: `only ${stats.days} overlapping days (need ${VALIDATION.minDays})`,
    };
  }
  if (stats.medianPct > VALIDATION.maxMedianPct) {
    return {
      ok: false,
      reason: `median drift ${stats.medianPct.toFixed(3)}% > ${VALIDATION.maxMedianPct}%`,
    };
  }
  if (stats.p90Pct > VALIDATION.maxP90Pct) {
    return {
      ok: false,
      reason: `p90 drift ${stats.p90Pct.toFixed(3)}% > ${VALIDATION.maxP90Pct}%`,
    };
  }
  if (stats.within1PctShare < VALIDATION.minWithin1PctShare) {
    return {
      ok: false,
      reason: `only ${(stats.within1PctShare * 100).toFixed(1)}% of days within 1%`,
    };
  }
  return { ok: true, reason: null };
}

/**
 * Rows to append: from the day after the last valid row through the newest day
 * the source can support (a row dated X needs the print of X+1, so the newest
 * possible row is yesterday).
 */
export function planAppend({ points, lastDate, today }) {
  const newestPoint = [...points.keys()].sort().pop();
  if (!newestPoint) return { rows: [], targetLast: null, missing: 0 };
  const targetLast = shiftDay(newestPoint, -CLOSE_OFFSET_DAYS);
  const horizon = shiftDay(today, -1);
  const end = targetLast < horizon ? targetLast : horizon;
  if (!lastDate || end <= lastDate) return { rows: [], targetLast: end, missing: 0 };

  const rows = [];
  let missing = 0;
  for (let cursor = shiftDay(lastDate, 1); cursor <= end; cursor = shiftDay(cursor, 1)) {
    const point = points.get(shiftDay(cursor, CLOSE_OFFSET_DAYS));
    if (!point) {
      missing++;
      break;
    }
    rows.push({
      date: cursor,
      raw: `${cursor} 00:00:00 UTC,${point.price},${point.cap},${point.volume}`,
    });
  }
  return { rows, targetLast: end, missing };
}

export async function fetchChart(url = CHART_URL, { retries = 2, fetchImpl = fetch } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: { "user-agent": "btc500-archive-refresh/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const chart = await response.json();
      if (!Array.isArray(chart?.prices) || chart.prices.length === 0) {
        throw new Error("response has no prices");
      }
      return chart;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error(`chart fetch failed: ${lastError?.message ?? lastError}`);
}

function renderFile(validRows, appended) {
  return [HEADER, ...validRows.map((r) => r.raw), ...appended.map((r) => r.raw), ""].join("\n");
}

/**
 * Full refresh. `write: false` runs the same validation without touching disk.
 * @returns {Promise<Record<string, unknown>>}
 */
export async function refreshArchive({
  write = true,
  today = toIsoDay(Date.now()),
  fetchImpl = fetch,
  paths = ARCHIVE_PATHS,
} = {}) {
  const primary = paths[0];
  if (!existsSync(primary)) {
    return { state: "error", error: `${primary} is missing`, appended: 0 };
  }
  const text = readFileSync(primary, "utf8");
  const archive = parseArchive(text);
  const lastDate = archive.lastDate;
  const stalenessDays = lastDate
    ? Math.round(
        (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastDate}T00:00:00Z`)) / 86_400_000,
      )
    : null;

  let chart;
  try {
    chart = await fetchChart(CHART_URL, { fetchImpl });
  } catch (error) {
    return {
      state: "stale",
      error: error.message,
      lastDate,
      stalenessDays,
      appended: 0,
      written: [],
    };
  }

  const points = midnightPoints(chart);
  const stats = overlapStats({ points, validRows: archive.validRows });
  const check = validateOverlap(stats);
  if (!check.ok) {
    return {
      state: "mismatch",
      error: check.reason,
      lastDate,
      stalenessDays,
      appended: 0,
      overlap: stats,
      written: [],
    };
  }

  const plan = planAppend({ points, lastDate, today });
  if (plan.rows.length === 0) {
    return {
      state: "fresh",
      lastDate,
      stalenessDays,
      appended: 0,
      droppedRows: archive.dropped.length,
      overlap: stats,
      written: [],
    };
  }

  const result = {
    state: "refreshed",
    lastDate,
    appended: plan.rows.length,
    firstAppended: plan.rows[0].date,
    lastAppended: plan.rows[plan.rows.length - 1].date,
    targetLast: plan.targetLast,
    missingAtHorizon: plan.missing,
    droppedRows: archive.dropped.length,
    dropped: archive.dropped,
    overlap: stats,
    written: [],
    today,
  };

  if (!write) {
    result.state = "would-refresh";
    return result;
  }

  const contents = renderFile(archive.validRows, plan.rows);
  const written = [];
  for (const path of paths) {
    if (!existsSync(path)) continue;
    writeFileSync(path, contents, "utf8");
    written.push(path);
  }
  if (written.length === 0) {
    return { ...result, state: "error", error: "no archive path could be written", appended: 0 };
  }
  result.written = written;
  result.lastDate = plan.rows[plan.rows.length - 1].date;
  result.stalenessDays = 0;
  return result;
}

function parseArgs(argv) {
  const args = { check: false, json: false };
  for (const arg of argv) {
    if (arg === "--check") args.check = true;
    else if (arg === "--json") args.json = true;
  }
  return args;
}

async function main(argv) {
  const args = parseArgs(argv);
  if (args.check) {
    const primary = ARCHIVE_PATHS[0];
    const archive = existsSync(primary) ? parseArchive(readFileSync(primary, "utf8")) : null;
    const today = toIsoDay(Date.now());
    const stalenessDays = archive?.lastDate
      ? Math.round(
          (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${archive.lastDate}T00:00:00Z`)) /
            86_400_000,
        )
      : null;
    const result = {
      state: stalenessDays !== null && stalenessDays <= 1 ? "fresh" : "stale",
      lastDate: archive?.lastDate ?? null,
      stalenessDays,
      appended: 0,
    };
    if (args.json) console.log(JSON.stringify(result));
    else
      console.log(
        `archive=${result.state} last=${result.lastDate} staleness=${result.stalenessDays}d`,
      );
    return result.state === "fresh" ? 0 : 1;
  }

  const result = await refreshArchive({ write: true });
  if (args.json) {
    console.log(JSON.stringify(result));
  } else {
    console.log(
      `archive=${result.state} last=${result.lastDate ?? "?"} appended=${result.appended}` +
        (result.overlap ? ` overlap_median=${result.overlap.medianPct?.toFixed(4)}%` : "") +
        (result.error ? ` error=${result.error}` : ""),
    );
    if (result.droppedRows) console.log(`dropped invalid rows: ${result.droppedRows}`);
    for (const path of result.written ?? []) console.log(`wrote ${path}`);
  }
  return result.state === "error" || result.state === "mismatch" ? 1 : 0;
}

/**
 * True only when this file is the process entry point. `pathToFileURL(argv[1])`
 * is not enough: on macOS `/var/folders` is a symlink to `/private/var`, so a
 * module started by absolute path compares unequal to `import.meta.url` and the
 * CLI silently does nothing. Compare real paths instead.
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
      console.error(`archive refresh crashed: ${error?.stack ?? error}`);
      process.exit(1);
    });
}
