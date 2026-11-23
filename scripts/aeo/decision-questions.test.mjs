import assert from "node:assert/strict";
import test from "node:test";
import {
  DECISION_QUESTIONS,
  FRAMEWORK,
  LADDER,
  assertValidMap,
  byFrame,
  byId,
} from "./decision-questions.mjs";

test("the map is internally valid", () => {
  assert.equal(assertValidMap(), DECISION_QUESTIONS);
  assert.ok(DECISION_QUESTIONS.length >= 10, "enough decisions to be a real map");
});

test("every Granola frame is represented", () => {
  for (const frame of Object.keys(FRAMEWORK)) {
    assert.ok(byFrame(frame).length > 0, `no decision questions for ${frame}`);
  }
});

test("every decision has both a Google keyword and an AI prompt", () => {
  for (const q of DECISION_QUESTIONS) {
    assert.ok(q.googleQuery.length > 4, `${q.id} has no real Google query`);
    assert.ok(q.aiPrompt.length > 12, `${q.id} has no real AI prompt`);
    assert.notEqual(q.googleQuery, q.aiPrompt, `${q.id} reuses one string for both`);
  }
});

test("every decision names an owning surface and an answer marker the audit can check", () => {
  for (const q of DECISION_QUESTIONS) {
    assert.match(q.ownSurface, /\.(tsx|ts|mjs|json|csv)$/, q.id);
    assert.ok(q.answerMarker.length > 0, q.id);
  }
});

test("EARN decisions name offsite sources we do not control", () => {
  for (const q of byFrame("EARN")) {
    assert.ok(q.external.length >= 2, `${q.id} has no independent coverage target`);
  }
});

test("byId returns a stable record or null", () => {
  assert.equal(byId(DECISION_QUESTIONS[0].id), DECISION_QUESTIONS[0]);
  assert.equal(byId("does-not-exist"), null);
});

test("the visibility ladder is ordered from retrieval to recommendation", () => {
  assert.deepEqual(LADDER, ["retrieved", "cited", "mentioned", "recommended"]);
});

test("a malformed record is rejected instead of failing silently in a report", () => {
  const bad = [{ ...DECISION_QUESTIONS[0], frame: "RANK" }];
  assert.throws(() => assertValidMap(bad), /invalid frame/);
  const dupe = [DECISION_QUESTIONS[0], DECISION_QUESTIONS[0]];
  assert.throws(() => assertValidMap(dupe), /duplicate id/);
  const missing = [{ ...DECISION_QUESTIONS[0], aiPrompt: "" }];
  assert.throws(() => assertValidMap(missing), /missing aiPrompt/);
});
