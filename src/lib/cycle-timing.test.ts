import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EARLIER_OFFSET_DAYS,
  LATER_OFFSET_DAYS,
  TIMING_OFFSET_DAYS,
  computeCycleTiming,
  computeCycleTimings,
  daysBetween,
  describeOffset,
  summarizeOffset,
  summarizeTiming,
  type CycleTiming,
} from "./cycle-timing.ts";
import { WINDOW_DAYS, addDays, type HalvingEvent } from "./halvings.ts";

const CYCLE: HalvingEvent = { date: "2020-05-11", block: 630_000, label: "2020 Halving" };
const OTHER: HalvingEvent = { date: "2016-07-09", block: 420_000, label: "2016 Halving" };

const BUY = addDays(CYCLE.date, -WINDOW_DAYS); // 2018-12-28
const EXIT = addDays(CYCLE.date, WINDOW_DAYS); // 2021-09-23

function fixture(): Map<string, number> {
  const prices = new Map<string, number>([[EXIT, 1000]]);
  const byOffset: Record<number, number> = {
    [-120]: 200,
    [-90]: 250,
    [-60]: 125,
    [-30]: 500,
    0: 100,
    30: 80,
    // +60 intentionally missing
    90: 400,
    120: 0, // invalid print, must be treated as missing
  };
  for (const [offset, price] of Object.entries(byOffset)) {
    prices.set(addDays(BUY, Number(offset)), price);
  }
  return prices;
}

describe("computeCycleTiming", () => {
  it("keeps the T+500 exit fixed and measures every entry against the exact T-500 result", () => {
    const prices = fixture();
    const timing = computeCycleTiming(CYCLE, (date) => prices.get(date) ?? null);

    assert.equal(timing.buyDate, BUY);
    assert.equal(timing.exitDate, EXIT);
    assert.equal(timing.exitPrice, 1000);
    assert.equal(timing.baselineMultiple, 10);
    assert.equal(timing.entries.length, TIMING_OFFSET_DAYS.length);

    const exact = timing.entries.find((entry) => entry.offsetDays === 0);
    assert.equal(exact?.multiple, 10);
    assert.equal(exact?.vsT500Percent, 0);

    const earlier = timing.entries.find((entry) => entry.offsetDays === -120);
    assert.equal(earlier?.entryDate, addDays(BUY, -120));
    assert.equal(earlier?.entryPrice, 200);
    assert.equal(earlier?.multiple, 5);
    assert.equal(earlier?.vsT500Percent, -50);

    const later = timing.entries.find((entry) => entry.offsetDays === 30);
    assert.equal(later?.multiple, 12.5);
    assert.equal(later?.vsT500Percent, 25);
  });

  it("leaves a missing or invalid print as null instead of interpolating", () => {
    const prices = fixture();
    const timing = computeCycleTiming(CYCLE, (date) => prices.get(date) ?? null);
    const missing = timing.entries.find((entry) => entry.offsetDays === 60);
    const invalid = timing.entries.find((entry) => entry.offsetDays === 120);

    assert.equal(missing?.entryPrice, null);
    assert.equal(missing?.multiple, null);
    assert.equal(missing?.vsT500Percent, null);
    assert.equal(invalid?.entryPrice, null);
    assert.equal(invalid?.multiple, null);
    // 9 offsets - 2 unusable prints
    assert.equal(timing.availableCount, 7);
  });

  it("reports no comparison when the exit print is missing", () => {
    const prices = fixture();
    prices.delete(EXIT);
    const timing = computeCycleTiming(CYCLE, (date) => prices.get(date) ?? null);

    assert.equal(timing.baselineMultiple, null);
    assert.ok(timing.entries.every((entry) => entry.vsT500Percent === null));
    assert.equal(timing.entries[0]?.entryPrice, 200);
  });

  it("never invents a baseline when T-500 itself has no print", () => {
    const prices = fixture();
    prices.delete(BUY);
    const timing = computeCycleTiming(CYCLE, (date) => prices.get(date) ?? null);

    assert.equal(timing.baselineMultiple, null);
    assert.ok(timing.entries.every((entry) => entry.vsT500Percent === null));
  });
});

describe("summarizeOffset", () => {
  function twoCycles(): CycleTiming[] {
    const first = fixture();
    const second = new Map<string, number>([
      [addDays(OTHER.date, WINDOW_DAYS), 1000],
      [addDays(OTHER.date, -WINDOW_DAYS), 100],
      [addDays(OTHER.date, -WINDOW_DAYS - 120), 50], // -> 20x, +100% vs baseline
      [addDays(OTHER.date, -WINDOW_DAYS + 120), 40], // -> 25x, +150% vs baseline
    ]);
    return computeCycleTimings(
      [CYCLE, OTHER],
      (date) => first.get(date) ?? second.get(date) ?? null,
    );
  }

  it("counts improvements and losses and names the extremes", () => {
    const summary = summarizeOffset(twoCycles(), -120);
    assert.equal(summary.cycleCount, 2);
    assert.equal(summary.improvedCount, 1);
    assert.equal(summary.worsenedCount, 1);
    assert.equal(summary.bestLabel, "2016 Halving");
    assert.equal(summary.bestVsT500Percent, 100);
    assert.equal(summary.worstLabel, "2020 Halving");
    assert.equal(summary.worstVsT500Percent, -50);
    assert.equal(summary.medianVsT500Percent, 25);
  });

  it("skips cycles that have no comparable multiple at that offset", () => {
    const summary = summarizeOffset(twoCycles(), 30);
    assert.equal(summary.cycleCount, 1);
    assert.equal(summary.improvedCount, 1);
    assert.equal(summary.medianVsT500Percent, 25);
  });

  it("returns an empty summary rather than zeros when nothing is comparable", () => {
    const summary = summarizeOffset(twoCycles(), 60);
    assert.equal(summary.cycleCount, 0);
    assert.equal(summary.medianVsT500Percent, null);
    assert.equal(summary.bestLabel, null);
    assert.equal(summary.improvedCount, 0);
    assert.equal(summary.worsenedCount, 0);
  });
});

describe("summarizeTiming", () => {
  it("wires the earlier and later summaries to the published offsets", () => {
    const summary = summarizeTiming(computeCycleTimings([CYCLE], () => null));
    assert.equal(summary.cycleCount, 0);
    assert.equal(summary.offsets.length, TIMING_OFFSET_DAYS.length);
    assert.equal(summary.earlier?.offsetDays, EARLIER_OFFSET_DAYS);
    assert.equal(summary.later?.offsetDays, LATER_OFFSET_DAYS);
  });

  it("only counts windows with a usable baseline", () => {
    const prices = fixture();
    const summary = summarizeTiming(
      computeCycleTimings([CYCLE, OTHER], (date) => prices.get(date) ?? null),
    );
    assert.equal(summary.cycleCount, 1);
    const exact = summary.offsets.find((row) => row.offsetDays === 0);
    assert.equal(exact?.cycleCount, 1);
    assert.equal(exact?.medianVsT500Percent, 0);
  });
});

describe("helpers", () => {
  it("labels offsets in words", () => {
    assert.equal(describeOffset(0), "Exact T-500");
    assert.equal(describeOffset(-30), "30 days earlier");
    assert.equal(describeOffset(120), "120 days later");
  });

  it("counts calendar days across month and year boundaries", () => {
    assert.equal(daysBetween("2018-12-28", "2021-09-23"), 1000);
    assert.equal(daysBetween("2020-02-28", "2020-03-01"), 2);
  });
});
