import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DECISION_QUESTIONS, byId } from "./decision-questions.mjs";
import { buildGapReport, classify, latestByQuestion } from "./gap-report.mjs";

const q = (id, frame = "CLAIM") => ({ id, frame, question: id, aiPrompt: `prompt ${id}` });

test("unmeasured decisions are reported, never counted as misses", () => {
  const report = buildGapReport([q("a")], []);
  assert.equal(report.rows[0].type, "unmeasured");
  assert.equal(report.unmeasured.length, 1);
  assert.equal(report.missed.length, 0);
  assert.ok(report.rows[0].nextAction.includes("prompt-results.json"));
});

test("a miss with competitors and cited sources is weak coverage", () => {
  assert.equal(
    classify(q("a"), {
      brandPresent: false,
      competitors: ["X"],
      citedSources: ["https://x.test"],
    }),
    "weak-coverage",
  );
});

test("an EARN miss is an offsite-consensus problem even with no citations", () => {
  assert.equal(classify(q("a", "EARN"), { brandPresent: false }), "offsite-consensus");
});

test("a miss with no evidence of other sources is missing information", () => {
  assert.equal(classify(q("a"), { brandPresent: false }), "missing-information");
});

test("a present brand is not called a win", () => {
  const report = buildGapReport(
    [q("a")],
    [{ questionId: "a", observedAt: "2026-11-23", engine: "chatgpt", brandPresent: true }],
  );
  assert.equal(report.present.length, 1);
  assert.equal(report.rows[0].diagnosis, "");
});

test("latestByQuestion keeps only the newest observation", () => {
  const latest = latestByQuestion([
    { questionId: "a", observedAt: "2026-11-20", brandPresent: false },
    { questionId: "a", observedAt: "2026-11-23", brandPresent: true },
    { questionId: "b", observedAt: "2026-11-21", brandPresent: false },
  ]);
  assert.equal(latest.get("a").brandPresent, true);
  assert.equal(latest.size, 2);
});

test("trusted sources are de-duplicated and sorted for the EARN target list", () => {
  const report = buildGapReport(
    [q("a"), q("b")],
    [
      {
        questionId: "a",
        observedAt: "2026-11-23",
        brandPresent: false,
        competitors: ["X"],
        citedSources: ["z.test", "a.test"],
      },
      {
        questionId: "b",
        observedAt: "2026-11-23",
        brandPresent: false,
        competitors: ["Y"],
        citedSources: ["a.test"],
      },
    ],
  );
  assert.deepEqual(report.trustedSources, ["a.test", "z.test"]);
});

test("the real map plus real ledger produces a usable report", () => {
  const ledger = JSON.parse(
    readFileSync(new URL("./prompt-results.json", import.meta.url), "utf8"),
  );
  const report = buildGapReport(DECISION_QUESTIONS, ledger);
  assert.equal(report.rows.length, DECISION_QUESTIONS.length);
  assert.ok(report.missed.length >= 2, "the recorded misses are visible");
  assert.ok(report.trustedSources.length >= 8, "the EARN target list is populated");
  assert.ok(byId(report.rows[0].id), "every row maps back to the decision map");
});
