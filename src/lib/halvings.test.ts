import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HALVINGS,
  HISTORICAL_HALVINGS,
  LAST_HISTORICAL_HALVING,
  PROTOCOL_BLOCK_INTERVAL_SECONDS,
  WINDOW_DAYS,
  addDays,
  buildHalvingCycles,
  buildHalvingEstimate,
  classifyCycleKind,
  classifyCyclePosition,
  cycleFromHistorical,
  estimateBlockInterval,
  estimateCurrentBlockHeight,
  estimateHalvingTimestampMs,
  fallbackInterval,
  lastHalvingBlock,
  nextHalvingBlock,
  selectTimelineCycles,
} from "./halvings.ts";

const NOW = Date.parse("2026-08-01T12:00:00.000Z");
const TODAY = "2026-08-01";

describe("historical halvings", () => {
  it("keeps recorded dates and 210k-block heights as authoritative", () => {
    assert.deepEqual(
      HISTORICAL_HALVINGS.map((h) => [h.number, h.block, h.date]),
      [
        [1, 210000, "2012-11-28"],
        [2, 420000, "2016-07-09"],
        [3, 630000, "2020-05-11"],
        [4, 840000, "2024-04-20"],
      ],
    );
    assert.equal(HALVINGS.length, HISTORICAL_HALVINGS.length);
  });

  it("computes T-500 and T+500 from the historical calendar date", () => {
    const cycle = cycleFromHistorical(LAST_HISTORICAL_HALVING, NOW);
    assert.equal(cycle.tMinus500, addDays("2024-04-20", -WINDOW_DAYS));
    assert.equal(cycle.tPlus500, addDays("2024-04-20", WINDOW_DAYS));
    assert.equal(cycle.dateKind, "historical");
    assert.equal(cycle.performanceKind, "realized");
  });
});

describe("block height schedule", () => {
  it("treats the next multiple of 210000 as the authoritative target", () => {
    assert.equal(nextHalvingBlock(839999), 840000);
    assert.equal(nextHalvingBlock(840000), 1050000);
    assert.equal(nextHalvingBlock(1049999), 1050000);
    assert.equal(lastHalvingBlock(840000), 840000);
    assert.equal(lastHalvingBlock(840001), 840000);
  });
});

describe("block interval estimation", () => {
  it("uses the observed span instead of assuming 600s", () => {
    const estimate = estimateBlockInterval(
      { height: 900000, timestampSec: 1_700_000_000 },
      { height: 900144, timestampSec: 1_700_000_000 + 144 * 550 },
    );
    assert.equal(estimate.source, "observed");
    assert.equal(estimate.seconds, 550);
    assert.equal(estimate.sampleSpanBlocks, 144);
    assert.equal(estimate.confidence, "high");
  });

  it("falls back to the protocol interval when the sample is invalid", () => {
    const inverted = estimateBlockInterval(
      { height: 900144, timestampSec: 1_700_000_000 },
      { height: 900000, timestampSec: 1_700_000_100 },
    );
    assert.equal(inverted.source, "fallback-protocol");
    assert.equal(inverted.seconds, PROTOCOL_BLOCK_INTERVAL_SECONDS);
    assert.equal(inverted.confidence, "low");
  });

  it("rejects implausible intervals instead of projecting them", () => {
    const tooFast = estimateBlockInterval(
      { height: 900000, timestampSec: 1_700_000_000 },
      { height: 900144, timestampSec: 1_700_000_000 + 144 * 10 },
    );
    assert.equal(tooFast.source, "fallback-protocol");
  });
});

describe("next-halving timestamp", () => {
  it("projects from remaining blocks × observed interval", () => {
    const ts = estimateHalvingTimestampMs(1_000_000, 1_050_000, NOW, 500);
    assert.equal(ts, NOW + 50_000 * 500 * 1000);
  });

  it("builds a labelled estimate with separate height, timestamp, and date", () => {
    const estimate = buildHalvingEstimate({
      height: 1_000_000,
      heightSource: "live",
      interval: estimateBlockInterval(
        { height: 999856, timestampSec: 1_700_000_000 },
        { height: 1_000_000, timestampSec: 1_700_000_000 + 144 * 580 },
      ),
      observedAt: NOW,
    });
    assert.equal(estimate.nextHalvingBlock, 1_050_000);
    assert.equal(estimate.currentHeight, 1_000_000);
    assert.equal(estimate.blocksRemaining, 50_000);
    assert.equal(estimate.intervalSource, "observed");
    assert.equal(
      estimate.estimatedDate,
      new Date(estimate.estimatedTimestamp).toISOString().slice(0, 10),
    );
    assert.notEqual(estimate.intervalSeconds, PROTOCOL_BLOCK_INTERVAL_SECONDS);
  });

  it("uses the last confirmed halving as the height fallback, not a live tip", () => {
    const height = estimateCurrentBlockHeight(NOW, PROTOCOL_BLOCK_INTERVAL_SECONDS);
    assert.ok(height >= LAST_HISTORICAL_HALVING.block);
    const earlier = estimateCurrentBlockHeight(
      Date.parse(LAST_HISTORICAL_HALVING.timestamp),
      PROTOCOL_BLOCK_INTERVAL_SECONDS,
    );
    assert.equal(earlier, LAST_HISTORICAL_HALVING.block);
  });

  it("projects the far-future date at the protocol pace from the live tip (matches CoinGecko's 2028-04-13)", () => {
    // Realistic mid-2026 live tip. Even when the observed pace is slightly fast
    // (~597s epoch average), difficulty retargeting pins the long-run block time
    // at 600s, so the date is projected at the protocol target — not by
    // extrapolating the observed pace across the ~87k remaining blocks.
    const tipHeight = 962_716;
    const observedAt = Date.parse("2026-08-16T12:00:00Z");
    const lastSec = Date.parse(LAST_HISTORICAL_HALVING.timestamp) / 1000;
    const interval = estimateBlockInterval(
      { height: LAST_HISTORICAL_HALVING.block, timestampSec: lastSec },
      {
        height: tipHeight,
        timestampSec: lastSec + (tipHeight - LAST_HISTORICAL_HALVING.block) * 597,
      },
    );
    assert.equal(interval.source, "observed"); // still recorded as live-pace data

    const estimate = buildHalvingEstimate({
      height: tipHeight,
      heightSource: "live",
      interval,
      observedAt,
    });
    assert.equal(estimate.nextHalvingBlock, 1_050_000);

    const remaining = estimate.nextHalvingBlock - estimate.currentHeight;
    const expected = new Date(observedAt + remaining * PROTOCOL_BLOCK_INTERVAL_SECONDS * 1000)
      .toISOString()
      .slice(0, 10);
    assert.equal(estimate.estimatedDate, expected);
    // This is the upstream consensus date (CoinGecko: 13 April 2028).
    assert.equal(expected, "2028-04-13");

    // The observed interval is reported as a diagnostic, separate from the date.
    assert.notEqual(estimate.intervalSeconds, PROTOCOL_BLOCK_INTERVAL_SECONDS);
  });

  it("does not let a fast observed day move the far-future date (difficulty retargeting)", () => {
    // Regression: extrapolating a ~549s one-day sample over the remaining ~87k
    // blocks previously pulled block 1,050,000 from ~April to ~Feb 2028. The
    // projected date must only track the live tip's remaining blocks at the
    // protocol pace, so a transient fast day is absorbed.
    const tipHeight = 962_716;
    const observedAt = Date.parse("2026-08-16T12:00:00Z");
    const noisyDay = estimateBlockInterval(
      {
        height: tipHeight - 144,
        timestampSec: Date.parse("2026-08-15T12:00:00Z") / 1000,
      },
      {
        height: tipHeight,
        timestampSec: Date.parse("2026-08-15T12:00:00Z") / 1000 + 144 * 549,
      },
    );
    assert.equal(noisyDay.source, "observed");
    assert.ok(noisyDay.seconds < 560, `expected a fast ~549s sample, got ${noisyDay.seconds}`);

    const estimate = buildHalvingEstimate({
      height: tipHeight,
      heightSource: "live",
      interval: noisyDay,
      observedAt,
    });
    // The date is anchored on the remaining blocks x the 10-min target.
    const expected = new Date(observedAt + (1_050_000 - tipHeight) * 600 * 1000)
      .toISOString()
      .slice(0, 10);
    assert.equal(estimate.estimatedDate, expected);
    assert.equal(expected, "2028-04-13");
  });
});

describe("cycle classification", () => {
  const tMinus500 = "2026-01-01";
  const halving = "2027-05-16";
  const tPlus500 = "2028-09-27";

  it("classifies every T-500 / halving / T+500 boundary", () => {
    assert.equal(
      classifyCyclePosition("2025-12-31", tMinus500, halving, tPlus500),
      "before-tminus500",
    );
    assert.equal(classifyCyclePosition(tMinus500, tMinus500, halving, tPlus500), "at-tminus500");
    assert.equal(
      classifyCyclePosition("2026-06-01", tMinus500, halving, tPlus500),
      "between-tminus500-and-halving",
    );
    assert.equal(classifyCyclePosition(halving, tMinus500, halving, tPlus500), "at-halving");
    assert.equal(
      classifyCyclePosition("2028-01-01", tMinus500, halving, tPlus500),
      "between-halving-and-tplus500",
    );
    assert.equal(classifyCyclePosition(tPlus500, tMinus500, halving, tPlus500), "at-tplus500");
    assert.equal(
      classifyCyclePosition("2028-09-28", tMinus500, halving, tPlus500),
      "after-tplus500",
    );
  });

  it("marks a cycle historical / current / future from the same dates", () => {
    assert.equal(classifyCycleKind("2025-12-31", tMinus500, tPlus500), "future");
    assert.equal(classifyCycleKind(tMinus500, tMinus500, tPlus500), "current");
    assert.equal(classifyCycleKind(halving, tMinus500, tPlus500), "current");
    assert.equal(classifyCycleKind(tPlus500, tMinus500, tPlus500), "current");
    assert.equal(classifyCycleKind("2028-09-28", tMinus500, tPlus500), "historical");
  });

  it("does not present the next estimated cycle as a realized historical cycle", () => {
    const estimate = buildHalvingEstimate({
      height: 900_000,
      heightSource: "live",
      interval: fallbackInterval(),
      observedAt: NOW,
    });
    const cycles = buildHalvingCycles(NOW, estimate);
    const next = cycles[cycles.length - 1]!;
    assert.equal(next.dateKind, "estimated");
    assert.notEqual(next.performanceKind, "realized");
    assert.ok(next.block > LAST_HISTORICAL_HALVING.block);

    const selected = selectTimelineCycles(cycles);
    assert.equal(selected.previous?.dateKind, "historical");
    assert.equal(selected.previous?.performanceKind, "realized");
    assert.equal(selected.current.dateKind, "estimated");
  });

  it("treats the 2024 cycle as historical after T+500", () => {
    assert.ok(TODAY > addDays("2024-04-20", WINDOW_DAYS));
    const cycle = cycleFromHistorical(LAST_HISTORICAL_HALVING, NOW);
    assert.equal(cycle.cycleKind, "historical");
    assert.equal(cycle.performanceKind, "realized");
  });
});
