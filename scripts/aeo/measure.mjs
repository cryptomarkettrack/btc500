#!/usr/bin/env node
/**
 * `npm run aeo:measure`
 *
 * Steps 8 + 9 of the Granola pattern: measure Google and AI separately, then
 * repeat the measurement so gaps can be closed on evidence instead of vibes.
 *
 * Sources (all already collected by the existing runner — nothing new is called):
 *   - scripts/analytics/output/ga4-latest.json      -> sessions by source/channel
 *   - scripts/search-console/output/performance-summary.json -> clicks / impressions
 *
 * Each run appends one snapshot to scripts/aeo/output/history.json and prints
 * the delta against the previous snapshot. A missing report is reported as
 * "unavailable", never as zero.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const HISTORY = join(HERE, "output/history.json");

const AI_SOURCES = new Set([
  "chatgpt.com",
  "perplexity.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "claude.ai",
]);

function loadJson(rel) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch {
    return null;
  }
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Sum (sessions, users) for rows matching a predicate over [channel, source]. */
function sumSources(rows, predicate) {
  let sessions = 0;
  let users = 0;
  for (const row of rows ?? []) {
    const dims = (row.dimensionValues ?? []).map((d) => d.value);
    if (!predicate(dims[0] ?? "", dims[1] ?? "")) continue;
    sessions += toInt(row.metricValues?.[0]?.value);
    users += toInt(row.metricValues?.[1]?.value);
  }
  return { sessions, users };
}

function readGa4() {
  const report = loadJson("scripts/analytics/output/ga4-latest.json");
  if (!report) return { available: false, reason: "ga4-latest.json not found" };
  const sourceTotals = report.tables?.sourceTotals ?? [];
  const channels = report.tables?.channels ?? [];
  const ai = sumSources(
    sourceTotals,
    (channel, source) => channel === "AI Assistant" || AI_SOURCES.has(source.toLowerCase()),
  );
  const google = sumSources(
    sourceTotals,
    (channel, source) => channel === "Organic Search" && source.toLowerCase() === "google",
  );
  const namedAiSources = [
    ...new Set(
      sourceTotals
        .map((r) => (r.dimensionValues ?? []).map((d) => d.value))
        .filter((d) => d[0] === "AI Assistant" || AI_SOURCES.has((d[1] ?? "").toLowerCase()))
        .map((d) => d[1]),
    ),
  ];
  const channelTotals = Object.fromEntries(
    channels.map((r) => [
      (r.dimensionValues ?? [])[0]?.value ?? "unknown",
      toInt(r.metricValues?.[0]?.value),
    ]),
  );
  return {
    available: true,
    window: report.window ?? null,
    totals: report.totals?.current ?? null,
    ai,
    google,
    namedAiSources,
    channels: channelTotals,
  };
}

function readGsc() {
  const summary = loadJson("scripts/search-console/output/performance-summary.json");
  if (!Array.isArray(summary))
    return { available: false, reason: "performance-summary.json not found" };
  const seven = summary
    .filter((r) => r.days === 7)
    .sort((a, b) => (a.generated ?? "").localeCompare(b.generated ?? ""));
  const row = seven.at(-1);
  if (!row) return { available: false, reason: "no 7-day row in performance-summary.json" };
  return {
    available: true,
    end: row.end,
    generated: row.generated,
    clicks: toInt(row.propertyClicks),
    impressions: toInt(row.propertyImpressions),
  };
}

function delta(now, before, key) {
  if (before == null || now == null) return "n/a";
  const d = now - before;
  return d === 0 ? "0" : `${d > 0 ? "+" : ""}${d}`;
}

const ga4 = readGa4();
const gsc = readGsc();
const key = `${ga4.window?.start ?? "?"}_${ga4.window?.end ?? "?"}_${gsc.end ?? "?"}`;
const snapshot = { key, collected: new Date().toISOString().slice(0, 10), ga4, gsc };

let history = [];
if (existsSync(HISTORY)) {
  try {
    history = JSON.parse(readFileSync(HISTORY, "utf8"));
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }
}
const previous = history.at(-1) ?? null;
history = history.filter((h) => h.key !== key);
history.push(snapshot);
if (history.length > 180) history = history.slice(-180);
mkdirSync(dirname(HISTORY), { recursive: true });
writeFileSync(HISTORY, JSON.stringify(history, null, 2) + "\n");

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ snapshot, previous, samples: history.length }, null, 2));
  process.exit(0);
}

console.log(`BTC500 AEO scorecard — ${snapshot.collected}\n`);
console.log("GOOGLE (ranking surface)");
if (gsc.available) {
  console.log(
    `  clicks ${gsc.clicks} (${delta(gsc.clicks, previous?.gsc?.clicks, "clicks")}) · impressions ${gsc.impressions} (${delta(gsc.impressions, previous?.gsc?.impressions, "impressions")}) · window ending ${gsc.end}`,
  );
} else {
  console.log(`  unavailable — ${gsc.reason}`);
}
console.log("\nAI ANSWER ENGINES (recommendation surface — measured separately)");
if (ga4.available) {
  console.log(
    `  sessions ${ga4.ai.sessions} (${delta(ga4.ai.sessions, previous?.ga4?.ai?.sessions)}) · users ${ga4.ai.users} (${delta(ga4.ai.users, previous?.ga4?.ai?.users)})`,
  );
  console.log(
    `  sources: ${ga4.namedAiSources.length ? ga4.namedAiSources.join(", ") : "none named in this window"}`,
  );
  console.log(`  window ${ga4.window?.start ?? "?"} → ${ga4.window?.end ?? "?"}`);
} else {
  console.log(`  unavailable — ${ga4.reason}`);
}
console.log("\nCONTEXT");
if (ga4.available) {
  console.log(
    `  Google organic sessions ${ga4.google.sessions} (${delta(ga4.google.sessions, previous?.ga4?.google?.sessions)})`,
  );
  const external = Object.entries(ga4.channels)
    .filter(([c]) => !["Direct", "Unassigned"].includes(c))
    .map(([c, s]) => `${c} ${s}`)
    .join(" · ");
  console.log(`  non-direct channels: ${external || "none"}`);
  const externalTotal = ga4.ai.sessions + ga4.google.sessions;
  console.log(
    `  AI share of search-origin sessions: ${externalTotal ? Math.round((ga4.ai.sessions / externalTotal) * 100) : 0}%`,
  );
}
console.log(
  `\nSamples in history: ${history.length}. Google ranking and AI recommendation are different surfaces; a click here does not prove a mention there.`,
);
