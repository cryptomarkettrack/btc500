import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ALLOWED_SYMBOLS,
  ALLOWED_TIMEFRAMES,
  CUTOFF_BEFORE_CLOSE_MS,
  computeStats,
  currentCandleOpenTime,
  cutoffTime,
  isWindowOpen,
  rankLeaderboard,
  settleCandle,
  timeframeMs,
  type SettledRecord,
} from "./rules.ts";

const INTERVAL = 900_000;

describe("market allowlist", () => {
  it("only exposes 15m and BTCUSDT for the MVP", () => {
    assert.deepEqual(ALLOWED_TIMEFRAMES, ["15m"]);
    assert.deepEqual(ALLOWED_SYMBOLS, ["BTCUSDT"]);
    assert.equal(timeframeMs("15m"), INTERVAL);
    assert.equal(timeframeMs("1h"), null);
  });
});

describe("candle window", () => {
  it("aligns open times to the UTC timeframe boundary", () => {
    const now = Date.UTC(2026, 0, 1, 12, 7, 33, 456);
    const expected = Date.UTC(2026, 0, 1, 12, 0, 0, 0);
    assert.equal(currentCandleOpenTime(now, INTERVAL), expected);
  });

  it("closes the window exactly at the cutoff", () => {
    const open = Date.UTC(2026, 0, 1, 12, 0, 0, 0);
    const cutoff = cutoffTime(open, INTERVAL);
    assert.equal(cutoff - open, INTERVAL - CUTOFF_BEFORE_CLOSE_MS);
    assert.equal(isWindowOpen(cutoff - 1, open, INTERVAL), true);
    assert.equal(isWindowOpen(cutoff, open, INTERVAL), false);
    assert.equal(isWindowOpen(open + INTERVAL, open, INTERVAL), false);
  });
});

describe("settlement", () => {
  it("awards UP when close is above open", () => {
    assert.deepEqual(settleCandle({ open: 100, close: 101 }, "UP"), {
      status: "WON",
      points: 1,
    });
  });

  it("awards DOWN when close is below open", () => {
    assert.deepEqual(settleCandle({ open: 100, close: 99 }, "DOWN"), {
      status: "WON",
      points: 1,
    });
  });

  it("awards zero for a wrong direction", () => {
    assert.deepEqual(settleCandle({ open: 100, close: 101 }, "DOWN"), {
      status: "LOST",
      points: 0,
    });
  });

  it("voids an unchanged candle instead of treating it as a loss", () => {
    assert.deepEqual(settleCandle({ open: 100, close: 100 }, "UP"), {
      status: "VOID",
      points: 0,
    });
    assert.deepEqual(settleCandle({ open: 100, close: 100 }, "DOWN"), {
      status: "VOID",
      points: 0,
    });
  });

  it("rejects malformed prices", () => {
    assert.throws(() => settleCandle({ open: Number.NaN, close: 100 }, "UP"));
  });
});

describe("stats", () => {
  const records = (statuses: string[]): SettledRecord[] =>
    statuses.map((status) => ({
      status: status as SettledRecord["status"],
      points: status === "WON" ? 1 : 0,
    }));

  it("reports accuracy with its sample size", () => {
    const stats = computeStats(records(["WON", "LOST", "WON", "WON"]));
    assert.equal(stats.settled, 4);
    assert.equal(stats.wins, 3);
    assert.equal(stats.accuracy, 0.75);
  });

  it("ignores voids in accuracy and streaks", () => {
    const stats = computeStats(records(["WON", "VOID", "WON"]));
    assert.equal(stats.settled, 2);
    assert.equal(stats.currentStreak, 2);
    assert.equal(stats.bestStreak, 2);
  });

  it("a loss ends the current streak but not the best streak", () => {
    const stats = computeStats(records(["LOST", "WON", "WON"]));
    assert.equal(stats.currentStreak, 0);
    assert.equal(stats.bestStreak, 2);
  });

  it("no settled predictions means no accuracy", () => {
    assert.equal(computeStats([]).accuracy, null);
  });
});

describe("leaderboard", () => {
  it("orders by points, then accuracy, then sample size", () => {
    const ranked = rankLeaderboard([
      { username: "low", points: 2, settled: 10, wins: 2 },
      { username: "accurate", points: 2, settled: 4, wins: 3 },
      { username: "top", points: 5, settled: 8, wins: 5 },
      { username: "same", points: 2, settled: 6, wins: 4 },
    ]);
    assert.deepEqual(
      ranked.map((row) => row.username),
      ["top", "accurate", "same", "low"],
    );
  });
});
