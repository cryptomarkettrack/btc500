import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { addDays } from "./halvings.ts";
import {
  ETF_LAUNCH_DATE,
  FOURTH_HALVING_DATE,
  POST_2024_DAILY_ISSUANCE_BTC,
  PRE_2024_DAILY_ISSUANCE_BTC,
  TPLUS500_2024,
  absorptionRegime,
  buildAbsorptionSnapshot,
  computeStreak,
  dailyIssuanceBtc,
  enrichDay,
  etfCyclePhase,
  intensityFor,
  usdToBtc,
  type EtfFlowDay,
} from "./etf-analysis.ts";
import { parseTftcDay, parseTftcPayload } from "./etf-parse.ts";

describe("dailyIssuanceBtc", () => {
  it("uses 900 BTC/day before the 2024 halving and 450 after", () => {
    assert.equal(PRE_2024_DAILY_ISSUANCE_BTC, 900);
    assert.equal(POST_2024_DAILY_ISSUANCE_BTC, 450);
    assert.equal(dailyIssuanceBtc("2024-04-19"), 900);
    assert.equal(dailyIssuanceBtc(FOURTH_HALVING_DATE), 450);
    assert.equal(dailyIssuanceBtc("2026-08-19"), 450);
  });
});

describe("usdToBtc + enrichDay", () => {
  it("converts dollar flow at that day's close and compares to issuance", () => {
    const day = enrichDay({
      date: "2024-04-22",
      netFlowUsd: 900_000_000,
      btcCloseUsd: 60_000,
      totalNetAssetsUsd: null,
      perEtfUsd: { IBIT: 600_000_000, FBTC: 300_000_000 },
    });
    assert.equal(day.netFlowBtc, 15_000);
    assert.equal(day.issuanceBtc, 450);
    assert.equal(day.extraBtc, 14_550);
    assert.equal(day.absorptionRatio, 15_000 / 450);
    assert.equal(day.direction, "in");
    assert.equal(day.phase, "hold-window");
    assert.equal(day.perEtfBtc?.IBIT, 10_000);
  });

  it("returns null BTC when the close is missing", () => {
    assert.equal(usdToBtc(100, null), null);
    assert.equal(usdToBtc(100, 0), null);
  });
});

describe("absorptionRegime", () => {
  it("classifies squeeze, absorb, leak, dump, and idle", () => {
    assert.equal(absorptionRegime(900, 450), "squeezing");
    assert.equal(absorptionRegime(450, 450), "absorbing");
    assert.equal(absorptionRegime(200, 450), "leaking");
    assert.equal(absorptionRegime(-100, 450), "dumping");
    assert.equal(absorptionRegime(0, 450), "idle");
  });
});

describe("computeStreak", () => {
  it("counts consecutive signed sessions and skips flats", () => {
    const days = [
      { date: "2026-08-17", netFlowUsd: 10, direction: "in" as const },
      { date: "2026-08-18", netFlowUsd: 20, direction: "in" as const },
      { date: "2026-08-19", netFlowUsd: 0, direction: "flat" as const },
      { date: "2026-08-20", netFlowUsd: 30, direction: "in" as const },
    ].map((row) =>
      enrichDay({
        date: row.date,
        netFlowUsd: row.netFlowUsd,
        btcCloseUsd: 60_000,
        totalNetAssetsUsd: null,
        perEtfUsd: null,
      }),
    );
    const streak = computeStreak(days);
    assert.equal(streak.direction, "in");
    assert.equal(streak.days, 3);
  });
});

describe("buildAbsorptionSnapshot", () => {
  it("splits the 2024 cycle, rolls 7-day issuance, and builds a heatmap", () => {
    const raw: EtfFlowDay[] = [];
    raw.push({
      date: "2024-04-19",
      netFlowUsd: 900_000_000,
      btcCloseUsd: 60_000,
      totalNetAssetsUsd: null,
      perEtfUsd: { IBIT: 900_000_000 },
    });
    raw.push({
      date: FOURTH_HALVING_DATE,
      netFlowUsd: 0,
      btcCloseUsd: 64_000,
      totalNetAssetsUsd: null,
      perEtfUsd: { IBIT: 0 },
    });
    raw.push({
      date: "2024-04-22",
      netFlowUsd: -45_000_000,
      btcCloseUsd: 66_000,
      totalNetAssetsUsd: 10_000_000_000,
      perEtfUsd: { IBIT: -45_000_000 },
    });
    raw.push({
      date: addDays(TPLUS500_2024, 1),
      netFlowUsd: 225_000_000,
      btcCloseUsd: 75_000,
      totalNetAssetsUsd: 12_000_000_000,
      perEtfUsd: { IBIT: 100_000_000, FBTC: 125_000_000 },
    });

    const snapshot = buildAbsorptionSnapshot(raw, {
      sourceName: "fixture",
      sourceUrl: "https://example.test",
      attribution: "test",
      sources: "test",
      license: "CC BY 4.0",
      updatedThrough: raw[raw.length - 1]!.date,
      fetchDate: "2026-08-21T00:00:00.000Z",
    });

    assert.equal(snapshot.days.length, 4);
    assert.equal(etfCyclePhase("2024-04-19"), "pre-halving");
    assert.equal(snapshot.phaseLedger[0]?.phase, "pre-halving");
    assert.equal(snapshot.phaseLedger[0]?.etfBtc, 15_000);
    assert.ok(snapshot.rolling7d.issuanceBtc >= 450 * 7);
    assert.equal(snapshot.issuers[0]?.ticker, "IBIT");
    assert.ok(snapshot.heatmap.length >= 1);
    assert.equal(snapshot.dayRegime, "squeezing");
    assert.equal(snapshot.estimatedHoldingsBtc, 12_000_000_000 / 75_000);
    assert.equal(ETF_LAUNCH_DATE, "2024-01-11");
  });
});

describe("intensityFor", () => {
  it("steps up as flow grows versus issuance", () => {
    assert.equal(intensityFor(0, 450), 0);
    assert.equal(intensityFor(50, 450), 1);
    assert.equal(intensityFor(200, 450), 2);
    assert.equal(intensityFor(500, 450), 3);
    assert.equal(intensityFor(900, 450), 4);
  });
});

describe("parseTftcPayload", () => {
  it("accepts the TFTC JSON shape and drops malformed rows", () => {
    const parsed = parseTftcPayload({
      attribution: "TFTC",
      sources: "SoSoValue; Farside",
      license: "https://creativecommons.org/licenses/by/4.0/",
      url: "https://www.tftc.io/bitcoin-etf-flows",
      updatedThrough: "2024-01-24",
      days: [
        {
          date: "2024-01-11",
          netFlowUsd: 655_300_000,
          btcCloseUsd: 46_269,
          perEtfUsd: { IBIT: 111_700_000, GBTC: -95_100_000 },
        },
        { date: "nope" },
        {
          date: "2024-01-12",
          netFlowUsd: 203_000_000,
          btcCloseUsd: 43_645,
          perEtfUsd: { IBIT: 386_000_000 },
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          date: `2024-01-${String(13 + i).padStart(2, "0")}`,
          netFlowUsd: 1_000_000 * (i + 1),
          btcCloseUsd: 40_000,
          perEtfUsd: { IBIT: 1_000_000 * (i + 1) },
        })),
      ],
    });
    assert.ok(parsed.days.length >= 12);
    assert.equal(parsed.days[0]?.date, "2024-01-11");
    assert.equal(parseTftcDay(null), null);
  });
});
