import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { addDays, WINDOW_DAYS, type HalvingEvent } from "./halvings.ts";
import {
  computeCycleRisk,
  computeCycleRisks,
  emptyCycleRisk,
  summarizeRisk,
  type PriceLookup,
} from "./cycle-risk.ts";

const HALVING: HalvingEvent = { date: "2020-05-11", block: 630_000, label: "2020 Halving" };
const BUY = addDays(HALVING.date, -WINDOW_DAYS);
const SELL = addDays(HALVING.date, WINDOW_DAYS);

/** Build a lookup from an explicit map plus a flat default for other days. */
function lookupFrom(map: Record<string, number | null>, fallback?: number): PriceLookup {
  return (date) => (date in map ? map[date]! : (fallback ?? null));
}

describe("computeCycleRisk", () => {
  it("measures the low against the T-500 entry and how long it took to arrive", () => {
    const lowDate = addDays(BUY, 40);
    const lookup = lookupFrom(
      {
        [BUY]: 100,
        [addDays(BUY, 10)]: 80,
        [lowDate]: 50,
        [addDays(BUY, 60)]: 120,
        [SELL]: 300,
      },
      110,
    );
    const risk = computeCycleRisk(HALVING, lookup);
    assert.equal(risk.buyPrice, 100);
    assert.equal(risk.lowPrice, 50);
    assert.equal(risk.lowDate, lowDate);
    assert.equal(risk.lowVsEntryPercent, -50);
    assert.equal(risk.daysEntryToLow, 40);
    assert.equal(risk.highPrice, 300);
    assert.equal(risk.windowClosed, true);
  });

  it("counts only pre-halving closes when counting days below entry", () => {
    // 100 on entry, 90 for the three closes before the halving, then a deep
    // post-halving low that must not be counted as a pre-halving day.
    const prices: Record<string, number> = { [BUY]: 100 };
    for (const offset of [1, 2, 3]) prices[addDays(BUY, offset)] = 90;
    prices[HALVING.date] = 95;
    prices[addDays(HALVING.date, 30)] = 10;
    prices[SELL] = 400;

    const risk = computeCycleRisk(HALVING, (date) => prices[date] ?? null);
    assert.equal(risk.lowPrice, 10);
    assert.equal(risk.daysEntryToLow, WINDOW_DAYS + 30);
    // Four observed pre-halving closes, three of them below the 100 entry.
    assert.equal(risk.observedDaysBeforeHalving, 5);
    assert.equal(risk.daysBelowEntryBeforeHalving, 4);
  });

  it("tracks the worst close-to-close drawdown from a running peak", () => {
    const risk = computeCycleRisk(
      HALVING,
      lookupFrom({
        [BUY]: 100,
        [addDays(BUY, 5)]: 200,
        [addDays(BUY, 9)]: 150,
        [addDays(BUY, 12)]: 210,
        [addDays(BUY, 20)]: 105,
        [SELL]: 500,
      }),
    );
    assert.equal(risk.maxDrawdownPercent, -50);
    assert.equal(risk.maxDrawdownDate, addDays(BUY, 20));
  });

  it("marks a window that runs past the archive as open instead of complete", () => {
    const lastObserved = addDays(SELL, -100);
    const risk = computeCycleRisk(HALVING, (date) =>
      date === BUY ? 100 : date <= lastObserved ? 120 : null,
    );
    assert.equal(risk.windowClosed, false);
    assert.equal(risk.lowDate, BUY);
    assert.equal(risk.maxDrawdownPercent, null);
  });

  it("returns an explicit empty profile when the archive has no entry price", () => {
    const risk = computeCycleRisk(HALVING, () => null);
    assert.deepEqual(risk, emptyCycleRisk(HALVING));
    assert.equal(risk.buyDate, BUY);
    assert.equal(risk.sellDate, SELL);
    assert.equal(risk.lowVsEntryPercent, null);
  });

  it("never invents a low above the entry price", () => {
    const risk = computeCycleRisk(
      HALVING,
      lookupFrom({ [BUY]: 100, [addDays(BUY, 2)]: 90, [SELL]: 150 }),
    );
    assert.ok((risk.lowVsEntryPercent ?? 0) < 0);
  });
});

describe("summarizeRisk", () => {
  const base = emptyCycleRisk(HALVING);

  it("ignores windows without an entry price instead of scoring them as zero", () => {
    const summary = summarizeRisk([
      {
        ...base,
        label: "A",
        buyPrice: 100,
        lowPrice: 80,
        lowVsEntryPercent: -20,
        daysEntryToLow: 10,
        daysBelowEntryBeforeHalving: 5,
        windowClosed: true,
      },
      { ...base, label: "B" },
    ]);
    assert.equal(summary.analyzedCount, 1);
    assert.equal(summary.closedCount, 1);
    assert.equal(summary.belowEntryCount, 1);
    assert.equal(summary.medianLowVsEntryPercent, -20);
    assert.equal(summary.worst?.label, "A");
  });

  it("uses the mean of the two middle values for an even sample", () => {
    const summary = summarizeRisk([
      {
        ...base,
        label: "A",
        buyPrice: 100,
        lowPrice: 60,
        lowVsEntryPercent: -40,
        daysEntryToLow: 10,
        daysBelowEntryBeforeHalving: 10,
        windowClosed: true,
      },
      {
        ...base,
        label: "B",
        buyPrice: 100,
        lowPrice: 90,
        lowVsEntryPercent: -10,
        daysEntryToLow: 30,
        daysBelowEntryBeforeHalving: 4,
        windowClosed: true,
      },
      {
        ...base,
        label: "C",
        buyPrice: 100,
        lowPrice: 70,
        lowVsEntryPercent: -30,
        daysEntryToLow: 20,
        daysBelowEntryBeforeHalving: 8,
        windowClosed: true,
      },
      {
        ...base,
        label: "D",
        buyPrice: 100,
        lowPrice: 95,
        lowVsEntryPercent: -5,
        daysEntryToLow: 40,
        daysBelowEntryBeforeHalving: 2,
        windowClosed: true,
      },
    ]);
    assert.equal(summary.medianLowVsEntryPercent, -20);
    assert.equal(summary.medianDaysToLow, 25);
    assert.equal(summary.worst?.label, "A");
    assert.equal(summary.mildest?.label, "D");
  });

  it("reports an empty summary when nothing is measurable", () => {
    const summary = summarizeRisk([base]);
    assert.equal(summary.analyzedCount, 0);
    assert.equal(summary.allBelowEntry, false);
    assert.equal(summary.medianLowVsEntryPercent, null);
    assert.equal(summary.worst, null);
  });
});

describe("computeCycleRisks", () => {
  it("returns one profile per halving in the same order", () => {
    const halvings: HalvingEvent[] = [
      { date: "2016-07-09", block: 420_000, label: "First" },
      { date: "2020-05-11", block: 630_000, label: "Second" },
    ];
    const risks = computeCycleRisks(halvings, () => null);
    assert.equal(risks.length, 2);
    assert.deepEqual(
      risks.map((risk) => risk.label),
      ["First", "Second"],
    );
  });
});
