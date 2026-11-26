import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  BUY_POINT_LABEL,
  countdownParts,
  daysToBuyPoint,
  drawdownFromHigh,
  toBacktestRows,
} from "./buy-signal.ts";
import { parseHistoricalCsv, lookupHistoricalPrice } from "./historical-csv.ts";
import { assembleSimulatorResult, emptySimulatorCycles } from "./simulator-result.ts";

describe("buy signal model", () => {
  it("uses the fixed UTC buy point for calendar-day status", () => {
    assert.equal(daysToBuyPoint("2026-11-26T20:00:00.000Z"), 2);
    assert.equal(daysToBuyPoint("2026-11-28T00:00:00.000Z"), 0);
    assert.equal(daysToBuyPoint("2026-11-30T00:00:00.000Z"), -2);
  });

  it("ticks days/hours/minutes and flips to an open window after the target", () => {
    const before = countdownParts(new Date("2026-11-26T20:00:00.000Z"));
    assert.deepEqual(
      { days: before.days, hours: before.hours, minutes: before.minutes, isOpen: before.isOpen },
      { days: 1, hours: 4, minutes: 0, isOpen: false },
    );
    const after = countdownParts(new Date("2026-11-30T00:00:00.000Z"));
    assert.equal(after.isOpen, true);
    assert.equal(after.daysSince, 2);
  });

  it("computes the drawdown from the verified high instead of hardcoding it", () => {
    const pct = drawdownFromHigh(60_374.147782582884);
    assert.ok(pct !== null);
    assert.equal(pct.toFixed(2), "-52.16");
    assert.equal(drawdownFromHigh(null), null);
  });

  it("renders — for any missing backtest price", () => {
    const rows = toBacktestRows(emptySimulatorCycles());
    assert.equal(rows.length, 4);
    for (const row of rows) {
      assert.equal(row.buyPrice, "—");
      assert.equal(row.sellPrice, "—");
      assert.equal(row.multiple, "—");
    }
  });

  it("verifies the 180-day max deviation claim against the bundled archive", () => {
    const csv = readFileSync(new URL("../../public/btc-usd-max.csv", import.meta.url), "utf8");
    const dataset = parseHistoricalCsv(csv, "test-csv");
    const result = assembleSimulatorResult(
      (date) => lookupHistoricalPrice(dataset, date),
      dataset.source,
      dataset.size,
    );
    const deviations = result.risk
      .map((risk) => risk.daysEntryToLow)
      .filter((value): value is number => value !== null);
    assert.deepEqual(deviations, [128, 180, 41, 12]);
    assert.equal(Math.max(...deviations), 180);
    assert.equal(result.cycles.filter((cycle) => (cycle.returnPercent ?? 0) < 0).length, 0);
    assert.equal(BUY_POINT_LABEL, "November 28, 2026");
  });
});
