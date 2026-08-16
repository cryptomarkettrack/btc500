import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cycleFromHistorical, LAST_HISTORICAL_HALVING } from "./halvings.ts";
import {
  DEFAULT_TIMELINE_INVESTMENT,
  buildCycleDays,
  timelineCycleFromPrices,
} from "./timeline-build.ts";

const NOW = Date.parse("2026-08-01T00:00:00.000Z");

describe("timeline builders", () => {
  it("uses the explicit investment amount instead of a hidden constant", () => {
    const prices = new Map([
      ["2024-01-01", 40_000],
      ["2024-01-02", 44_000],
    ]);
    const built = buildCycleDays("2024-01-01", "2024-01-02", "2024-04-20", prices, 10_000, {
      carryForwardMissing: false,
    });
    assert.equal(built.days[0]?.btcPurchased, 10_000 / 40_000);
    assert.equal(built.days[1]?.portfolioValue, (10_000 / 40_000) * 44_000);
    assert.equal(DEFAULT_TIMELINE_INVESTMENT, 20_000);
  });

  it("does not treat an in-progress cycle sell as a realized exit price", () => {
    const historical = cycleFromHistorical(LAST_HISTORICAL_HALVING, NOW);
    const live = {
      ...historical,
      performanceKind: "in-progress" as const,
      cycleKind: "current" as const,
    };
    const prices = new Map([
      [historical.tMinus500, 16_000],
      [historical.date, 64_000],
      [historical.tPlus500, 100_000],
    ]);
    const realized = timelineCycleFromPrices(historical, prices, 20_000, {
      carryForwardMissing: false,
    });
    const open = timelineCycleFromPrices(live, prices, 20_000, { carryForwardMissing: false });
    assert.equal(realized.performanceKind, "realized");
    assert.equal(realized.sellPrice, 100_000);
    assert.equal(open.sellPrice, null);
  });

  it("does not invent days when prices are missing and carry-forward is off", () => {
    const prices = new Map([["2024-01-01", 40_000]]);
    const built = buildCycleDays("2024-01-01", "2024-01-03", "2024-04-20", prices, 20_000, {
      carryForwardMissing: false,
    });
    assert.equal(built.days.length, 1);
    assert.equal(built.sellPrice, null);
  });
});
