#!/usr/bin/env node
/**
 * Preflight — the deterministic facts the growth agent reads before it decides.
 *
 * The runner executes this before starting the agent so the day begins with
 * measurements instead of an audit:
 *   - the price archive is refreshed (and reported if it could not be),
 *   - experiments whose reading date has passed are listed,
 *   - the last run and the live site are checked.
 *
 * Writes `<state-dir>/preflight.json` and prints one `key=value` line per area,
 * which the runner copies into its log and greps for `archive=`.
 *
 * Usage:
 *   node scripts/autonomous/preflight.mjs [--state-dir DIR] [--offline]
 */

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { refreshArchive } from "./refresh-archive.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");
const DEFAULT_STATE_DIR =
  process.env.BTC500_GROWTH_STATE_DIR || join(homedir(), ".local", "state", "btc500-growth");

function isoToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  if (!from || !to) return null;
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function readJson(path, fallback = null) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function readLastRun(stateDir) {
  const file = join(stateDir, "last-status.txt");
  if (!existsSync(file)) return null;
  const line = readFileSync(file, "utf8").trim();
  const record = {};
  for (const pair of line.split(/\s+/)) {
    const eq = pair.indexOf("=");
    if (eq > 0) record[pair.slice(0, eq)] = pair.slice(eq + 1);
  }
  record.raw = line;
  record.timestamp = line.split(/\s+/)[0] ?? null;
  // "2026-10-25T06:21:38+0200" -> "+02:00" so Date.parse accepts it.
  const parseable = record.timestamp?.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  record.ageHours = parseable ? Math.round((Date.now() - Date.parse(parseable)) / 3_600_000) : null;
  return record;
}

/**
 * The last results review, so the cycle starts with its verdict instead of
 * rediscovering that a signal is stalled. Mandates from the review outrank the
 * backlog: they are the answer to "why are we not gaining results".
 */
function readReview(stateDir, today) {
  const file = join(REPO_ROOT, "scripts", "autonomous", "review-latest.json");
  const json = readJson(file, null);
  const historyFile = join(stateDir, "review-history.csv");
  let streak = 0;
  if (existsSync(historyFile)) {
    const verdicts = readFileSync(historyFile, "utf8")
      .split("\n")
      .slice(1)
      .map((line) => (line.split(",")[3] ?? "").trim())
      .filter(Boolean);
    for (let i = verdicts.length - 1; i >= 0; i--) {
      if (verdicts[i] === "improving") break;
      streak += 1;
    }
  }
  const base = {
    file,
    present: false,
    fresh: false,
    verdict: null,
    mode: null,
    generated: null,
    mandates: [],
    overdue: [],
    targets: [],
    asks: [],
    streak,
  };
  if (!json || !json.generated) return base;
  const mandates = (Array.isArray(json.mandates) ? json.mandates : []).map((m) => ({
    id: m?.id ?? "?",
    action: m?.action ?? "",
    because: m?.because ?? "",
    due: m?.due ?? null,
    overdue: Boolean(m?.due && m.due < today),
  }));
  // Asks are the owner's half of the loop — the cycle cannot post, pitch or
  // request a link. They surface here so today's work does not duplicate them.
  const asks = (Array.isArray(json.owner_asks) ? json.owner_asks : []).map((a) => ({
    id: a?.id ?? "?",
    channel: a?.channel ?? "?",
    action: a?.action ?? "",
    by: a?.by ?? null,
    overdue: Boolean(a?.by && a.by < today),
  }));
  return {
    ...base,
    present: true,
    fresh: json.generated === today,
    generated: json.generated,
    verdict: json.verdict ?? null,
    mode: json.mode ?? null,
    mandates,
    overdue: mandates.filter((m) => m.overdue),
    targets: Array.isArray(json.targets) ? json.targets : [],
    selfChanges: Array.isArray(json.self_changes) ? json.self_changes : [],
    asks,
  };
}

function readExperiments(today) {
  const file = join(REPO_ROOT, "scripts", "autonomous", "experiments.json");
  const ledger = readJson(file, null);
  if (!ledger) {
    return {
      error: "experiments.json missing or unreadable",
      open: 0,
      max: null,
      due: [],
      experiments: [],
    };
  }
  const experiments = Array.isArray(ledger.experiments) ? ledger.experiments : [];
  const open = experiments.filter((e) => e.status === "open");
  const due = open
    .filter((e) => e.next_reading && e.next_reading <= today)
    .map((e) => ({
      id: e.id,
      what: e.what,
      next_reading: e.next_reading,
      overdue_days: daysBetween(e.next_reading, today),
    }))
    .sort((a, b) => a.next_reading.localeCompare(b.next_reading));
  return {
    open: open.length,
    max: ledger.max_open ?? null,
    due,
    next_readings: open
      .filter((e) => e.next_reading)
      .map((e) => ({ id: e.id, next_reading: e.next_reading }))
      .sort((a, b) => a.next_reading.localeCompare(b.next_reading)),
    can_open_new: (ledger.max_open ?? Infinity) > open.length,
    experiments: open.map((e) => ({ id: e.id, opened: e.opened, next_reading: e.next_reading })),
  };
}

async function siteChecks(site) {
  const result = {};
  for (const [key, path] of [
    ["home", "/"],
    ["sitemap", "/sitemap.xml"],
  ]) {
    try {
      const response = await fetch(`${site}${path}`, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      result[key] = response.status;
    } catch (error) {
      result[key] = 0;
      result[`${key}_error`] = error?.message ?? String(error);
    }
  }
  return result;
}

async function main(argv) {
  let stateDir = DEFAULT_STATE_DIR;
  let offline = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--state-dir" && argv[i + 1]) stateDir = resolve(argv[++i]);
    else if (argv[i] === "--offline") offline = true;
  }

  const today = isoToday();
  mkdirSync(stateDir, { recursive: true });

  let archive;
  if (offline) {
    archive = { state: "skipped", appended: 0, note: "--offline" };
  } else {
    try {
      archive = await refreshArchive({ write: true, today });
    } catch (error) {
      archive = { state: "error", appended: 0, error: error?.message ?? String(error) };
    }
  }

  const experiments = readExperiments(today);
  const review = readReview(stateDir, today);
  const lastRun = readLastRun(stateDir);
  const site = offline
    ? {}
    : await siteChecks(process.env.BTC500_GROWTH_SITE || "https://btc500.net");

  const preflight = {
    schema: 1,
    generated: new Date().toISOString(),
    today,
    repo: REPO_ROOT,
    archive: {
      state: archive.state,
      lastDate: archive.lastDate ?? null,
      stalenessDays: archive.stalenessDays ?? null,
      appended: archive.appended ?? 0,
      firstAppended: archive.firstAppended ?? null,
      lastAppended: archive.lastAppended ?? null,
      droppedRows: archive.droppedRows ?? 0,
      overlapMedianPct: archive.overlap?.medianPct ?? null,
      error: archive.error ?? null,
      written: archive.written ?? [],
    },
    experiments,
    review,
    lastRun,
    site,
    notes: [],
  };

  if (archive.state === "stale" || archive.state === "mismatch" || archive.state === "error") {
    preflight.notes.push(
      `Price archive could not be refreshed (${archive.state}: ${archive.error ?? "unknown"}). ` +
        "Retry \`npm run archive:refresh\` during this cycle and say so in the commit if it still fails.",
    );
  }
  if (experiments.due?.length) {
    preflight.notes.push(
      `${experiments.due.length} experiment reading(s) are due: ${experiments.due.map((e) => e.id).join(", ")}. ` +
        "Read them before starting new work.",
    );
  }
  if (experiments.max && experiments.open >= experiments.max) {
    preflight.notes.push(
      `${experiments.open}/${experiments.max} experiments are open. Close, merge or read one before opening another.`,
    );
  }
  const dueMandates = review.mandates.filter((m) => m.due && m.due <= today);
  if (dueMandates.length) {
    preflight.notes.push(
      `${dueMandates.length} mandate(s) from the ${review.verdict ?? "last"} review (${review.generated}) are due: ` +
        `${dueMandates.map((m) => `${m.id}${m.overdue ? " OVERDUE" : ""}`).join(", ")}. ` +
        "Do these before the backlog: each exists because a measured signal is stalled, and skipping it is how a failed review repeats itself.",
    );
  }
  if (review.present && !review.fresh && review.generated) {
    preflight.notes.push(
      `The last review is from ${review.generated}, not today (${today}). If the review ran, check ~/.local/state/btc500-growth/last-review.txt.`,
    );
  }
  if (review.asks?.length) {
    const overdueAsks = review.asks.filter((a) => a.overdue);
    preflight.notes.push(
      `${review.asks.length} ask(s) are waiting on the owner, not on you: ` +
        `${review.asks.map((a) => `${a.channel}${a.by ? ` by ${a.by}` : ""}`).join(", ")}. ` +
        `Full text in ${join(stateDir, "owner-asks.txt")}. Do not post anything yourself — ` +
        "if a mandate says to prepare the asset behind an ask, prepare it; otherwise it is not your work.",
    );
    if (overdueAsks.length) {
      preflight.notes.push(
        `${overdueAsks.length} owner ask(s) are past their by date (${overdueAsks.map((a) => a.id).join(", ")}). ` +
          "The next review must restate them narrower instead of letting them lapse.",
      );
    }
  }
  if (review.streak >= 2) {
    preflight.notes.push(
      `${review.streak} consecutive non-improving reviews. Publishing more of the same is not the answer — read why[] in scripts/autonomous/review-latest.json before choosing today's work.`,
    );
  }
  if (lastRun?.ageHours != null && lastRun.ageHours > 26) {
    preflight.notes.push(
      `The last growth run was ${lastRun.ageHours}h ago (${lastRun.timestamp}). Investigate if it failed.`,
    );
  }
  if (site.home && site.home !== 200) {
    preflight.notes.push(`Production homepage returned ${site.home}. Check btc500.net first.`);
  }

  const outFile = join(stateDir, "preflight.json");
  writeFileSync(outFile, `${JSON.stringify(preflight, null, 2)}\n`, "utf8");

  console.log(`preflight: wrote ${outFile}`);
  console.log(
    `archive=${preflight.archive.state} last=${preflight.archive.lastDate ?? "?"} ` +
      `staleness=${preflight.archive.stalenessDays ?? "?"}d appended=${preflight.archive.appended}` +
      (preflight.archive.overlapMedianPct != null
        ? ` overlap_median=${preflight.archive.overlapMedianPct.toFixed(4)}%`
        : "") +
      (preflight.archive.error ? ` error=${preflight.archive.error}` : ""),
  );
  console.log(
    `experiments=open:${experiments.open} max:${experiments.max ?? "?"} due:${experiments.due?.length ?? 0}` +
      (experiments.due?.length
        ? ` ids=${experiments.due.map((e) => `${e.id}@${e.next_reading}(+${e.overdue_days}d)`).join(" ")}`
        : ""),
  );
  console.log(
    `review=${review.present ? (review.verdict ?? "?") : "none"} generated=${review.generated ?? "-"} ` +
      `fresh=${review.fresh} mandates=${review.mandates.length} due=${dueMandates.length} ` +
      `asks=${review.asks?.length ?? 0} streak=${review.streak}`,
  );
  if (lastRun?.timestamp)
    console.log(
      `last_run=${lastRun.timestamp} status=${lastRun.status ?? "?"} age=${lastRun.ageHours ?? "?"}h`,
    );
  if (site.home != null) console.log(`site=${site.home} sitemap=${site.sitemap ?? "?"}`);
  for (const note of preflight.notes) console.log(`note: ${note}`);

  return 0;
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
      console.error(`preflight crashed: ${error?.stack ?? error}`);
      process.exit(1);
    });
}

export { isoToday, readExperiments, daysBetween, readReview };
