#!/usr/bin/env node
/**
 * `npm run aeo:audit`
 *
 * Step 2 + 3 of the Granola pattern: find the decisions we fail to answer and
 * check whether an EXISTING page can close the gap before any new page is
 * created. This audit is repo-based and offline: it proves an answer surface
 * exists in code, not that a crawler read it (that is `aeo:measure`).
 *
 * For each decision question it checks:
 *   - does the owning file exist?
 *   - does it carry the answer marker we expect (an answer-first block, a
 *     speakable target, a schema type, a data endpoint reference)?
 * Then it checks the shared machine-readable surfaces the answer engines read.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DECISION_QUESTIONS, assertValidMap } from "./decision-questions.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");

function read(rel) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, "utf8");
}

function checkFile(rel, needle) {
  const body = read(rel);
  if (body === null) return { ok: false, why: "file missing" };
  if (needle && !body.toLowerCase().includes(needle.toLowerCase())) {
    return { ok: false, why: `no "${needle}"` };
  }
  return { ok: true, why: "present" };
}

const questions = assertValidMap();
const rows = questions.map((q) => {
  const page = checkFile(q.ownSurface, q.answerMarker);
  const evidence = q.evidence ? checkFile(q.evidence, null) : { ok: true, why: "n/a" };
  const status =
    page.ok && evidence.ok
      ? "ANSWERED"
      : !page.ok
        ? `PAGE ${page.why.toUpperCase()}`
        : `EVIDENCE ${evidence.why.toUpperCase()}`;
  return {
    id: q.id,
    frame: q.frame,
    question: q.question,
    ownSurface: q.ownSurface,
    status,
    ok: page.ok && evidence.ok,
  };
});

const shared = [
  { name: "robots.txt allows answer-engine crawlers", ...checkFile("public/robots.txt", "GPTBot") },
  { name: "robots.txt names PerplexityBot", ...checkFile("public/robots.txt", "PerplexityBot") },
  { name: "robots.txt points at the sitemap", ...checkFile("public/robots.txt", "sitemap.xml") },
  { name: "/llms.txt server route", ...checkFile("src/routes/llms[.]txt.ts", "renderLlmsText") },
  {
    name: "/llms-full.txt server route",
    ...checkFile("src/routes/llms-full[.]txt.ts", "llms-full"),
  },
  { name: "XML sitemap", ...checkFile("public/sitemap.xml", "<loc>") },
  {
    name: "SpeakableSpecification for answer extraction",
    ...checkFile("src/lib/site.ts", "SpeakableSpecification"),
  },
  {
    name: "original 500-day dataset endpoint",
    ...checkFile("src/routes/data.500-day-cycles[.]json.ts", "buildCycleDataset"),
  },
  {
    name: "dataset carries a citation string",
    ...checkFile("src/lib/cycle-dataset.ts", "citation"),
  },
];

const answered = rows.filter((r) => r.ok).length;
const ready = shared.filter((s) => s.ok).length;
const report = {
  generated: new Date().toISOString().slice(0, 10),
  decisions: rows.length,
  answered,
  gaps: rows.length - answered,
  coverage: Math.round((answered / rows.length) * 100),
  sharedReady: ready,
  sharedTotal: shared.length,
  rows,
  shared,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.gaps > 0 ? 1 : 0);
}

console.log(`BTC500 AEO surface audit — ${report.generated}\n`);
console.log(
  `Decision questions answered in code: ${answered}/${rows.length} (${report.coverage}%)`,
);
console.log(`Shared machine-readable surfaces ready: ${ready}/${shared.length}\n`);

console.log("Per-decision coverage:");
for (const r of rows) {
  console.log(`  ${r.ok ? "OK  " : "GAP "} [${r.frame.padEnd(7)}] ${r.id} — ${r.status}`);
}

const gaps = rows.filter((r) => !r.ok);
console.log(`\nGaps to close on EXISTING pages first (${gaps.length}):`);
if (!gaps.length) {
  console.log("  none — every decision has an answer surface");
} else {
  for (const r of gaps) {
    console.log(`  - ${r.id}: ${r.question} -> fix ${r.ownSurface} (${r.status})`);
  }
}

console.log("\nShared answer-engine surfaces:");
for (const s of shared) {
  console.log(`  ${s.ok ? "OK  " : "GAP "} ${s.name} (${s.why})`);
}

console.log(
  `\nRule: fix an existing surface before creating a new one. A new URL is allowed only when a GSC impression row already exists for its query.`,
);
process.exit(report.gaps > 0 ? 1 : 0);
