import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildLivePnl, LIVE_PNL_NOTIONAL_USD } from "./live-pnl.ts";

const BUY = "2026-11-28T00:00:00.000Z";
const NOW = "2026-11-28T06:30:00.000Z";

function mark(entry: number | null, current: number | null, nowISO = NOW) {
  return buildLivePnl({ nowISO, buyPointISO: BUY, entryPriceUSD: entry, currentPriceUSD: current });
}

describe("live P&L model", () => {
  it("marks a profit from the passed buy price and live price", () => {
    const pnl = mark(60_000, 66_000);
    assert.equal(pnl.state, "open");
    assert.equal(pnl.profitUSD, 5_000);
    assert.equal(pnl.valueUSD, 55_000);
    assert.equal(pnl.returnFraction, 0.1);
    assert.equal(pnl.isProfit, true);
    assert.equal(pnl.hoursHeld, 6);
    assert.equal(pnl.daysHeld, 0);
    assert.ok(pnl.quote.includes("+$5,000"));
  });

  it("marks a loss and keeps the sign consistent", () => {
    const pnl = mark(60_000, 54_000);
    assert.equal(pnl.profitUSD, -5_000);
    assert.equal(pnl.returnFraction, -0.1);
    assert.equal(pnl.isProfit, false);
    assert.ok(pnl.quote.includes("−$5,000"));
  });

  it("publishes no P&L when either price is missing", () => {
    for (const [entry, current] of [
      [null, 60_000],
      [60_000, null],
      [null, null],
      [0, 60_000],
      [60_000, -1],
    ] as const) {
      const pnl = mark(entry, current);
      assert.equal(pnl.state, "unavailable");
      assert.equal(pnl.profitUSD, null);
      assert.equal(pnl.returnFraction, null);
      assert.equal(pnl.entryPriceUSD, null);
      assert.equal(pnl.currentPriceUSD, null);
      assert.equal(pnl.notionalUSD, LIVE_PNL_NOTIONAL_USD);
    }
  });

  it("never marks a position before the passed buy timestamp", () => {
    const pnl = mark(60_000, 66_000, "2026-11-27T23:59:00.000Z");
    assert.equal(pnl.state, "unavailable");
    assert.equal(pnl.hoursHeld, 0);
  });

  it("uses the buy point passed in rather than the module default", () => {
    const pnl = buildLivePnl({
      nowISO: "2030-01-01T00:00:00.000Z",
      buyPointISO: "2029-12-31T00:00:00.000Z",
      entryPriceUSD: 100,
      currentPriceUSD: 110,
    });
    assert.equal(pnl.state, "open");
    assert.equal(pnl.buyPointISO, "2029-12-31T00:00:00.000Z");
    assert.equal(pnl.daysHeld, 1);
    assert.equal(pnl.profitUSD, 5_000);
  });
});
