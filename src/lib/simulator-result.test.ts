import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { HALVINGS, WINDOW_DAYS, addDays } from "./halvings.ts";
import { assembleSimulatorResult, unavailableSimulatorResult } from "./simulator-result.ts";

describe("assembleSimulatorResult", () => {
  it("returns a successful result when every checkpoint has a price", () => {
    const prices = new Map<string, number>();
    for (const h of HALVINGS) {
      prices.set(addDays(h.date, -WINDOW_DAYS), 100);
      prices.set(h.date, 200);
      prices.set(addDays(h.date, WINDOW_DAYS), 400);
    }
    const result = assembleSimulatorResult((d) => prices.get(d) ?? null, "fixture", prices.size);
    assert.equal(result.status, "ok");
    assert.equal(result.completeness, "complete");
    assert.equal(result.missingDates.length, 0);
    assert.equal(result.cycles.length, HALVINGS.length);
    assert.equal(result.cycles[0]?.returnMultiplier, 4);
    assert.equal(result.error, undefined);
  });

  it("marks a partial dataset without inventing the missing prices", () => {
    const prices = new Map<string, number>([
      [addDays(HALVINGS[0]!.date, -WINDOW_DAYS), 10],
      [HALVINGS[0]!.date, 20],
    ]);
    const result = assembleSimulatorResult((d) => prices.get(d) ?? null, "fixture", prices.size);
    assert.equal(result.status, "partial");
    assert.equal(result.completeness, "partial");
    assert.ok(result.missingDates.includes(addDays(HALVINGS[0]!.date, WINDOW_DAYS)));
    assert.equal(result.cycles[0]?.buyPrice, 10);
    assert.equal(result.cycles[0]?.sellPrice, null);
    assert.equal(result.cycles[0]?.returnMultiplier, null);
  });

  it("treats an empty dataset as unavailable, not a legitimate empty backtest", () => {
    const result = assembleSimulatorResult(() => null, "missing", 0);
    assert.equal(result.status, "unavailable");
    assert.equal(result.completeness, "empty");
    assert.equal(result.error?.code, "unavailable");
    assert.equal(result.error?.message, "Historical data could not be loaded.");
    assert.ok(result.cycles.every((c) => c.buyPrice === null && c.sellPrice === null));
  });
});

describe("unavailableSimulatorResult", () => {
  it("maps upstream failure to a structured error without a stack", () => {
    const result = unavailableSimulatorResult(
      "unknown",
      "upstream",
      "Historical data could not be loaded.",
    );
    assert.equal(result.status, "error");
    assert.equal(result.error?.code, "upstream");
    assert.equal(result.error?.message.includes("Error:"), false);
    assert.equal(result.error?.message.includes("at "), false);
  });
});
