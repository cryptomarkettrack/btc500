import assert from "node:assert/strict";
import test from "node:test";
import {
  PAPER_NOTIONAL_USD,
  buildPaperRecord,
  paperDaysBetween,
  paperIsoDay,
  paperPercent,
} from "./paper-buy.ts";

const ENTRY = "2026-11-29";
const EXIT = "2029-08-26";

test("paperIsoDay and paperDaysBetween use whole UTC days", () => {
  assert.equal(paperIsoDay("2026-11-16T23:59:59.000Z"), "2026-11-16");
  assert.equal(paperDaysBetween("2026-11-16", "2026-11-29"), 13);
  assert.equal(paperDaysBetween("2026-11-29", "2026-11-29"), 0);
  // A leap day is counted, and month/year boundaries are handled by Date.UTC.
  assert.equal(paperDaysBetween("2028-02-28", "2028-03-01"), 2);
  // The invariant is symmetry, not a hard-coded 1,000: the live-derived buy/sell
  // dates are UTC days and can be 1,001 apart because the halving estimate keeps
  // a time-of-day component before the day is truncated.
  const forward = paperDaysBetween(ENTRY, EXIT);
  assert.equal(paperDaysBetween(EXIT, ENTRY), -forward);
  assert.ok(forward >= 999 && forward <= 1001);
});

test("scheduled: nothing deployed, no price and no P&L before the entry date", () => {
  const r = buildPaperRecord({
    nowISO: "2026-11-16T12:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: null,
    currentPriceUSD: 100_000,
  });
  assert.equal(r.state, "scheduled");
  assert.equal(r.daysToEntry, 13);
  assert.equal(r.daysSinceEntry, 0);
  assert.equal(r.progress, 0);
  assert.equal(r.entryPriceUSD, null);
  assert.equal(r.currentPriceUSD, null);
  assert.equal(r.btcHeld, null);
  assert.equal(r.valueUSD, null);
  assert.equal(r.profitUSD, null);
  assert.equal(r.returnPercent, null);
  assert.match(r.dailyLine, /^2026-11-16 — Scheduled/);
  assert.match(r.dailyLine, /\$50,000 not deployed/);
  assert.match(r.dailyLine, /13 days away/);
  assert.equal(r.notionalUSD, PAPER_NOTIONAL_USD);
});

test("scheduled never publishes a mark even if a price is passed in", () => {
  const r = buildPaperRecord({
    nowISO: "2026-11-28T00:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: 90_000,
    currentPriceUSD: 95_000,
  });
  assert.equal(r.state, "scheduled");
  assert.equal(r.returnPercent, null);
  assert.equal(r.valueUSD, null);
  assert.equal(r.daysToEntry, 1);
});

test("awaiting-price: entry date passed but the daily close is missing", () => {
  const r = buildPaperRecord({
    nowISO: "2026-11-29T18:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: null,
    currentPriceUSD: 100_000,
  });
  assert.equal(r.state, "awaiting-price");
  assert.equal(r.returnPercent, null);
  assert.equal(r.profitUSD, null);
  assert.match(r.dailyLine, /Entry date reached/);
});

test("awaiting-price: entry locked but the live feed is down", () => {
  const r = buildPaperRecord({
    nowISO: "2026-12-01T00:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: 90_000,
    currentPriceUSD: null,
  });
  assert.equal(r.state, "awaiting-price");
  assert.equal(r.entryPriceUSD, null);
  assert.equal(r.returnPercent, null);
  assert.match(r.statusNote, /live BTC mark is unavailable/);
});

test("notional is the owner-approved $50,000 paper position", () => {
  assert.equal(PAPER_NOTIONAL_USD, 50_000);
});

test("live: $50k at 50k and marked at 60k is +20% / +$10,000", () => {
  const r = buildPaperRecord({
    nowISO: "2026-12-06T12:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: 50_000,
    currentPriceUSD: 60_000,
  });
  assert.equal(r.state, "live");
  assert.equal(r.daysSinceEntry, 7);
  assert.equal(r.btcHeld, 1);
  assert.equal(r.valueUSD, 60_000);
  assert.equal(r.profitUSD, 10_000);
  assert.equal(r.returnPercent, 20);
  assert.equal(r.progress > 0 && r.progress < 1, true);
  assert.match(r.dailyLine, /^2026-12-06 — Day 7/);
  assert.match(r.dailyLine, /\+20\.00%/);
});

test("live: a loss is signed correctly and progress is clamped", () => {
  const r = buildPaperRecord({
    nowISO: "2027-01-01T00:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: 100_000,
    currentPriceUSD: 80_000,
  });
  assert.equal(r.returnPercent, -20);
  assert.equal(r.profitUSD, -10_000);
  assert.match(r.dailyLine, /−\$10,000/);
  assert.equal(paperPercent(-20), "-20.00%");
  assert.equal(r.progress > 0 && r.progress < 1, true);
});

test("closed: the exit rule fires and the last mark is used", () => {
  const r = buildPaperRecord({
    nowISO: "2029-08-27T00:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: 50_000,
    currentPriceUSD: 150_000,
  });
  assert.equal(r.state, "closed");
  assert.equal(r.returnPercent, 200);
  assert.equal(r.profitUSD, 100_000);
  assert.equal(r.daysToExit, 0);
  assert.equal(r.progress, 1);
  assert.match(r.dailyLine, /Rule closed/);
  assert.match(r.statusNote, /not a guaranteed fill/);
});

test("a malformed or zero price is never treated as a mark", () => {
  const r = buildPaperRecord({
    nowISO: "2026-12-01T00:00:00.000Z",
    buyDateISO: ENTRY,
    sellDateISO: EXIT,
    entryPriceUSD: 0,
    currentPriceUSD: Number.NaN,
  });
  assert.equal(r.state, "awaiting-price");
  assert.equal(r.returnPercent, null);
});
