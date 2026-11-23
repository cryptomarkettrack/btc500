#!/usr/bin/env node
/**
 * `npm run aeo:map`
 *
 * Step 1 of the Granola pattern: start from the decisions a reader is making,
 * not from keywords. Prints every decision with its Google keyword, its AI
 * prompt, the owning surface and the OWN / CLAIM / EARN / CONTEST frame.
 *
 * `--json` emits the raw dataset for other tools and for the results ledger.
 */
import { DECISION_QUESTIONS, FRAMEWORK, LADDER, assertValidMap } from "./decision-questions.mjs";

const asJson = process.argv.includes("--json");
const map = assertValidMap();

if (asJson) {
  console.log(JSON.stringify({ framework: FRAMEWORK, ladder: LADDER, questions: map }, null, 2));
  process.exit(0);
}

console.log("BTC500 decision-question map — decisions first, keywords second\n");
let lastFrame = null;
for (const q of map) {
  if (q.frame !== lastFrame) {
    console.log(`\n=== ${q.frame} — ${FRAMEWORK[q.frame]} ===`);
    lastFrame = q.frame;
  }
  console.log(`\n[${q.id}] ${q.question}`);
  console.log(`  decision : ${q.decision} (${q.stage})`);
  console.log(`  Google   : ${q.googleQuery}`);
  console.log(`  AI prompt: ${q.aiPrompt}`);
  console.log(`  own page : ${q.ownSurface}`);
  console.log(`  evidence : ${q.evidence}`);
  console.log(`  must earn: ${q.external.join(", ")}`);
}
console.log(`\n${map.length} decision questions across ${Object.keys(FRAMEWORK).length} frames.`);
console.log(`Visibility ladder: ${LADDER.join(" -> ")}.`);
