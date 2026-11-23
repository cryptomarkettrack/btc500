import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCalculatorAnswer, buildStrategyComparison } from "./aeo-answers.ts";
import { CYCLE_DATASET_PATH } from "./cycle-dataset.ts";
import type { CycleResult } from "./simulator-result.ts";

function cycle(
  label: string,
  buyPrice: number | null,
  halvingPrice: number | null,
  sellPrice: number | null,
): CycleResult {
  const year = Number(label);
  return {
    label,
    halvingDate: `${year}-01-01`,
    buyDate: `${year - 1}-01-01`,
    sellDate: `${year + 1}-01-01`,
    buyPrice,
    halvingPrice,
    sellPrice,
    returnMultiplier: buyPrice && sellPrice ? sellPrice / buyPrice : null,
    returnPercent: null,
    toHalvingMultiplier: null,
    toHalvingPercent: null,
    profit: null,
  };
}

const cycles = [
  cycle("2012", 10, 20, 100), // 10x
  cycle("2016", 20, 30, 120), // 6x
];

test("calculator answer derives a value per completed window from the archive", () => {
  const answer = buildCalculatorAnswer(cycles, 10_000);
  assert.equal(answer.completed, 2);
  assert.equal(answer.windows[0].value, 100_000);
  assert.equal(answer.windows[1].value, 60_000);
  assert.equal(answer.medianValue, 80_000);
  assert.equal(answer.sourcePath, CYCLE_DATASET_PATH);
});

test("calculator answer leaves a missing print null instead of filling it in", () => {
  const answer = buildCalculatorAnswer([cycle("2020", 10, 20, null)], 10_000);
  assert.equal(answer.completed, 0);
  assert.equal(answer.windows[0].value, null);
  assert.equal(answer.medianValue, null);
});

test("calculator answer publishes no value for a non-positive amount", () => {
  const answer = buildCalculatorAnswer(cycles, 0);
  assert.equal(answer.completed, 0);
  assert.equal(answer.medianValue, null);
});

test("strategy comparison uses the same amount and span for rule and hold", () => {
  const answer = buildStrategyComparison(cycles, 10_000);
  assert.equal(answer.amount, 10_000);
  assert.equal(answer.from, 2012);
  assert.ok(answer.ruleValue !== null, "rule result exists");
  assert.ok(answer.holdValue !== null, "hold result exists");
  assert.equal(typeof answer.ruleWins, "boolean");
  assert.equal(answer.sourcePath, CYCLE_DATASET_PATH);
});

test("entry advantage is positive when T-500 beat the halving-day entry", () => {
  const answer = buildStrategyComparison([cycle("2012", 10, 20, 100)], 10_000);
  // T-500 multiple 10x vs halving-day 5x => +100%
  assert.equal(answer.windows[0].ruleMultiple, 10);
  assert.equal(answer.windows[0].halvingEntryMultiple, 5);
  assert.equal(answer.windows[0].entryAdvantagePercent, 100);
});

test("strategy comparison stays null when there is no complete window", () => {
  const answer = buildStrategyComparison([cycle("2020", 10, 20, null)], 10_000);
  assert.equal(answer.ruleValue, null);
  assert.equal(answer.holdValue, null);
  assert.equal(answer.ruleWins, null);
  assert.equal(answer.windows[0].entryAdvantagePercent, null);
});

test("both answers carry the historical, not-forecast caveat", () => {
  for (const answer of [buildCalculatorAnswer(cycles), buildStrategyComparison(cycles)]) {
    assert.match(answer.caveat, /not a forecast/i);
  }
});
