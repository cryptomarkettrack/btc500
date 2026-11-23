#!/usr/bin/env node
/**
 * `npm run aeo:gaps`
 *
 * Reads the prompt-results ledger and reports missed recommendations the way
 * Granola did: who appeared instead, which sources were cited, what kind of gap
 * it is, and what to do next. It also lists the prompts still unmeasured so the
 * repeat-and-close loop has a concrete queue.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DECISION_QUESTIONS, assertValidMap } from "./decision-questions.mjs";
import { buildGapReport } from "./gap-report.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const results = JSON.parse(readFileSync(join(HERE, "prompt-results.json"), "utf8"));
const report = buildGapReport(assertValidMap(), results);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log("BTC500 AEO missed-recommendation diagnosis\n");
console.log(
  `Measured present: ${report.present.length} · missed: ${report.missed.length} · unmeasured: ${report.unmeasured.length} · decisions: ${report.rows.length}\n`,
);

function printRow(r) {
  console.log(`\n[${r.frame}] ${r.question}`);
  console.log(`  prompt     : ${r.aiPrompt}`);
  console.log(`  observed   : ${r.observedAt ?? "never"} via ${r.engine ?? "—"}`);
  console.log(`  verdict    : ${r.type.toUpperCase()} — ${r.diagnosis}`);
  if (r.competitors.length) console.log(`  competitors: ${r.competitors.join(", ")}`);
  if (r.citedSources.length) console.log(`  cited      : ${r.citedSources.join(" | ")}`);
  if (r.note) console.log(`  note       : ${r.note}`);
  console.log(`  next       : ${r.nextAction}`);
}

console.log("--- MISSED RECOMMENDATIONS (highest priority) ---");
for (const r of report.missed) printRow(r);
if (!report.missed.length) console.log("  none recorded");

console.log("\n--- PRESENT (repeat to confirm, do not call a win yet) ---");
for (const r of report.present) {
  console.log(`  - ${r.id}: ${r.engine} on ${r.observedAt}${r.note ? ` — ${r.note}` : ""}`);
}

console.log("\n--- UNMEASURED PROMPTS (the next test queue) ---");
for (const r of report.unmeasured) console.log(`  - [${r.frame}] ${r.id}: ${r.aiPrompt}`);

console.log("\n--- SOURCES THE ENGINES ALREADY TRUST (EARN targets) ---");
for (const s of report.trustedSources) console.log(`  - ${s}`);
