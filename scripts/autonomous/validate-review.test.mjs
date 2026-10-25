import assert from "node:assert/strict";
import test from "node:test";

import { validateReview } from "./validate-review.mjs";

const TODAY = "2026-10-26";

function inputFixture(overrides = {}) {
  return {
    schema: 1,
    rule: {
      mayClaimImproving: false,
      outcomeGreen: 0,
      stalled: 3,
      regressed: [],
      stale: false,
      blockedBecause: ["only 0 positive outcome signal(s), need 2"],
    },
    reviewStreak: { nonImproving: 0, verdicts: [] },
    previousReview: { overdue: [] },
    ...overrides,
  };
}

function reviewFixture(overrides = {}) {
  return {
    schema: 1,
    generated: TODAY,
    mode: "daily",
    window: { start: "2026-10-19", end: TODAY },
    verdict: "stagnant",
    signals: [
      { id: "indexation", state: "stalled", note: "6/25 for 17d" },
      { id: "non-brand-clicks", state: "stalled", note: "0 clicks in 24d" },
      { id: "impressions", state: "flat", note: "45 -> 28, noise" },
    ],
    why: ["Indexation has not moved because nothing earns a crawl."],
    questions: ["Why is the backlog all content?"],
    mandates: [
      {
        id: "merge-stubs",
        action: "Merge 4 stubs into 2 pages",
        because: "6/25 indexed for 17d",
        due: "2026-10-28",
        owner: "cycle",
      },
    ],
    targets: [
      {
        metric: "indexed",
        current: "6/25",
        target: "10/25",
        by: "2026-11-15",
        status: "miss-so-far",
      },
    ],
    self_changes: [],
    next_review_focus: "indexation after the merge",
    ...overrides,
  };
}

function errorsOf(review, input = inputFixture(), options = { today: TODAY, mode: "daily" }) {
  const result = validateReview(review, input, options);
  return { ok: result.ok, errors: result.errors.join(" | ") };
}

test("a stagnant verdict with evidence, mandates and targets passes", () => {
  const { ok, errors } = errorsOf(reviewFixture());
  assert.equal(ok, true, errors);
});

test("an improving verdict is rejected while the data shows no improvement", () => {
  const { ok, errors } = errorsOf(reviewFixture({ verdict: "improving" }));
  assert.equal(ok, false);
  assert.match(errors, /"improving" is not allowed/);
  assert.match(errors, /need 2/);
});

test("an improving verdict passes when the rule allows it", () => {
  const input = inputFixture({
    rule: {
      mayClaimImproving: true,
      outcomeGreen: 2,
      stalled: 1,
      regressed: [],
      stale: false,
      blockedBecause: [],
    },
  });
  const review = reviewFixture({
    verdict: "improving",
    why: ["Indexation rose 6 -> 9 and non-brand clicks appeared."],
    mandates: [
      {
        id: "keep",
        action: "Keep shipping toward 10/25",
        because: "coverage is moving",
        due: "2026-10-30",
        owner: "cycle",
      },
    ],
  });
  const { ok, errors } = errorsOf(review, input);
  assert.equal(ok, true, errors);
});

test("a stale or different-day verdict is rejected", () => {
  assert.match(
    errorsOf(reviewFixture({ generated: "2026-10-25" })).errors,
    /generated is "2026-10-25"/,
  );
  assert.match(errorsOf(reviewFixture({ mode: "deep" })).errors, /mode is "deep", expected daily/);
  assert.match(errorsOf(reviewFixture({ verdict: "great" })).errors, /is not one of improving/);
});

test("a non-improving verdict must explain itself and order at least one mandate", () => {
  assert.match(
    errorsOf(reviewFixture({ mandates: [] })).errors,
    /mandates\[\] must contain at least one action/,
  );
  assert.match(errorsOf(reviewFixture({ why: [] })).errors, /why\[\] must explain/);
});

test("signals must be present, typed, and quote a number", () => {
  assert.match(
    errorsOf(reviewFixture({ signals: [{ id: "a", state: "flat", note: "1" }] })).errors,
    /signals has 1 entries/,
  );
  assert.match(
    errorsOf(
      reviewFixture({
        signals: [
          { id: "", state: "flat", note: "1" },
          { id: "b", state: "flat", note: "2" },
          { id: "c", state: "flat", note: "3" },
        ],
      }),
    ).errors,
    /missing an id/,
  );
  assert.match(
    errorsOf(
      reviewFixture({
        signals: [
          { id: "a", state: "worse", note: "1" },
          { id: "b", state: "flat", note: "2" },
          { id: "c", state: "flat", note: "3" },
        ],
      }),
    ).errors,
    /state "worse" is not one of/,
  );
  assert.match(
    errorsOf(
      reviewFixture({
        signals: [
          { id: "a", state: "flat" },
          { id: "b", state: "flat", note: "2" },
          { id: "c", state: "flat", note: "3" },
        ],
      }),
    ).errors,
    /has no note quoting a number/,
  );
});

test("mandates need evidence and a due date inside the next 14 days", () => {
  const late = reviewFixture();
  late.mandates = [
    { id: "x", action: "do it", because: "evidence", due: "2026-11-20", owner: "cycle" },
  ];
  assert.match(errorsOf(late).errors, /more than 14 days out/);

  const past = reviewFixture();
  past.mandates = [
    { id: "x", action: "do it", because: "evidence", due: "2026-10-20", owner: "cycle" },
  ];
  assert.match(errorsOf(past).errors, /already past/);

  const noBecause = reviewFixture();
  noBecause.mandates = [{ id: "x", action: "do it", due: "2026-10-28", owner: "cycle" }];
  assert.match(errorsOf(noBecause).errors, /missing the evidence/);

  const tooMany = reviewFixture();
  tooMany.mandates = Array.from({ length: 6 }, (_, i) => ({
    id: `m${i}`,
    action: "do it",
    because: "evidence",
    due: "2026-10-28",
    owner: "cycle",
  }));
  assert.match(errorsOf(tooMany).errors, /cap is 5/);
});

test("targets must exist and name a metric, a current value and a date", () => {
  assert.match(errorsOf(reviewFixture({ targets: [] })).errors, /targets\[\] must hold/);
  assert.match(
    errorsOf(reviewFixture({ targets: [{ metric: "indexed", current: "6/25", target: "10/25" }] }))
      .errors,
    /targets\[0\] is missing by/,
  );
});

test("three non-improving reviews in a row force a change to the machine", () => {
  const input = inputFixture({
    reviewStreak: { nonImproving: 3, verdicts: ["stagnant", "stagnant", "stagnant"] },
  });
  assert.match(errorsOf(reviewFixture(), input).errors, /self_changes\[\] must record a change/);

  const changed = reviewFixture({
    self_changes: ["Cut the content backlog in half in GROWTH_PROMPT.md"],
  });
  assert.equal(errorsOf(changed, input).ok, true);

  // One or two in a row is normal; no forced change yet.
  const early = inputFixture({
    reviewStreak: { nonImproving: 2, verdicts: ["stagnant", "stagnant"] },
  });
  assert.equal(errorsOf(reviewFixture(), early).ok, true);
});

test("the whole file being absent or malformed is reported, not guessed at", () => {
  assert.equal(validateReview(null, inputFixture(), { today: TODAY, mode: "daily" }).ok, false);
  assert.equal(
    validateReview([], inputFixture(), { today: TODAY, mode: "daily" }).errors[0],
    "the review file is not a JSON object",
  );
});

test("the untouched seed file is reported as no verdict at all", () => {
  const seed = JSON.parse(
    '{"schema":1,"generated":"","mode":null,"verdict":null,"signals":[],"why":[],"mandates":[],"targets":[],"self_changes":[]}',
  );
  const result = validateReview(seed, inputFixture(), { today: TODAY, mode: "daily" });
  assert.equal(result.ok, false);
  assert.equal(result.absent, true);
  assert.match(result.errors[0], /no verdict was produced/);
});
