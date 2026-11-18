import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseHistoricalCsv } from "./historical-csv.ts";
import { computeSpacingReport, buildSpacingDataset } from "./halving-spacing.ts";
import { addDays } from "./halvings.ts";

const HALVING = { date: "2020-05-11", block: 630_000, label: "2020 Halving" };

/** A tiny contiguous series: $100 every day, so any window returns 1.00x. */
function flatDataset(start: string, days: number, price = 100) {
  const prices = new Map<string, number>();
  for (let i = 0; i < days; i++) prices.set(addDays(start, i), price);
  return {
    prices,
    firstDate: addDays(start, 0),
    lastDate: addDays(start, days - 1),
    size: prices.size,
    source: "test",
  };
}

test("entry and exit are exactly S calendar days either side of the halving", () => {
  // Long enough to cover the 500-day exit (2021-09-23) as well as the entry.
  const report = computeSpacingReport(flatDataset("2018-01-01", 1500), {
    spacings: [400, 500],
    halvings: [HALVING],
  });
  const at400 = report.windows.find((w) => w.spacingDays === 400)!;
  assert.equal(at400.entryDate, addDays(HALVING.date, -400));
  assert.equal(at400.exitDate, addDays(HALVING.date, 400));
  const at500 = report.windows.find((w) => w.spacingDays === 500)!;
  assert.equal(at500.entryDate, "2018-12-28");
  assert.equal(at500.exitDate, "2021-09-23");
  // $100 in, $100 out.
  assert.equal(at500.multiple, 1);
  assert.equal(at500.status, "complete");
});

test("a window whose entry predates the archive is skipped with a reason, not interpolated", () => {
  // 500 days before the 2012 halving is 2011-07-17; 600 days is 2011-04-08.
  const report = computeSpacingReport(flatDataset("2011-07-17", 2000), {
    spacings: [500, 600],
    halvings: [{ date: "2012-11-28", block: 210_000, label: "2012 Halving" }],
  });
  const at500 = report.windows.find((w) => w.spacingDays === 500)!;
  const at600 = report.windows.find((w) => w.spacingDays === 600)!;
  assert.equal(at500.status, "complete");
  assert.equal(at500.entryDate, "2011-07-17");
  assert.equal(at600.status, "entry-before-archive");
  assert.equal(at600.entryPrice, null);
  assert.equal(at600.multiple, null);
  assert.match(at600.note ?? "", /first row/);
  const summary600 = report.spacings.find((s) => s.spacingDays === 600)!;
  assert.equal(summary600.computedWindows, 0);
  assert.equal(summary600.skippedWindows, 1);
  assert.equal(summary600.allClosedAboveEntry, null);
});

test("the in-window low is measured against that window's own entry close", () => {
  const prices = new Map<string, number>([
    ["2018-12-28", 100],
    ["2019-01-01", 60],
    ["2019-06-01", 140],
    ["2021-09-23", 200],
  ]);
  const report = computeSpacingReport(
    { prices, firstDate: "2018-12-28", lastDate: "2021-09-23" },
    { spacings: [500], halvings: [HALVING] },
  );
  const window = report.windows[0]!;
  assert.equal(window.multiple, 2);
  assert.equal(window.lowPrice, 60);
  assert.equal(window.lowDate, "2019-01-01");
  assert.equal(window.lowVsEntryPercent, -40);
  const summary = report.spacings[0]!;
  assert.equal(summary.windowsBelowEntry, 1);
  assert.equal(summary.worstLowVsEntryPercent, -40);
  assert.equal(summary.allClosedAboveEntry, true);
});

test("medians use the middle of an even count rather than rounding to one side", () => {
  // Build four synthetic halvings with multiples 2x, 4x, 6x and 10x.
  const prices = new Map<string, number>();
  const halvings = [
    { date: "2020-05-11", block: 630_000, label: "A" },
    { date: "2020-05-12", block: 630_001, label: "B" },
    { date: "2020-05-13", block: 630_002, label: "C" },
    { date: "2020-05-14", block: 630_003, label: "D" },
  ];
  for (const [i, multiple] of [2, 4, 6, 10].entries()) {
    const h = halvings[i]!;
    prices.set(addDays(h.date, -500), 100);
    prices.set(h.date, 100);
    prices.set(addDays(h.date, 500), 100 * multiple);
  }
  const sorted = [...prices.keys()].sort();
  const report = computeSpacingReport(
    { prices, firstDate: sorted[0]!, lastDate: sorted[sorted.length - 1]! },
    { spacings: [500], halvings },
  );
  const summary = report.spacings[0]!;
  assert.equal(summary.computedWindows, 4);
  assert.equal(summary.medianMultiple, 5);
  assert.equal(summary.worstMultiple, 2);
  assert.equal(summary.bestMultiple, 10);
});

test("the dataset carries the method, the skips and the bottom-artefact label", () => {
  const report = computeSpacingReport(flatDataset("2011-07-17", 3000), {
    spacings: [400, 500, 600],
    halvings: [{ date: "2012-11-28", block: 210_000, label: "2012 Halving" }],
  });
  const json = buildSpacingDataset(report, {
    generated: "2026-11-18T04:00:00.000Z",
    site: "https://btc500.net",
  });
  assert.equal(json.schema, "btc500/halving-spacing@1");
  assert.equal(json.page, "https://btc500.net/halving-spacing");
  assert.match(json.citation, /400, 500 and 600 days/);
  const at400 = json.windows.find((w) => w.spacingDays === 400)!;
  assert.match(at400.note ?? "", /artefact/);
  const at600 = json.windows.find((w) => w.spacingDays === 600)!;
  assert.equal(at600.status, "entry-before-archive");
  // Rounded for citation stability.
  assert.equal(json.spacings.length, 3);
});

/**
 * The locking test: the 500-day row here must be the simulator's own record.
 * These are closed windows against an append-only archive, so the multiples
 * cannot legitimately move; if they do, the page and /data/500-day-cycles.json
 * would be quoting two histories and a human needs to look.
 */
test("500-day windows on the real archive reproduce the published simulator record", () => {
  const csv = readFileSync(new URL("../../public/btc-usd-max.csv", import.meta.url), "utf8");
  const dataset = parseHistoricalCsv(csv, "test");
  const report = computeSpacingReport(dataset);

  const at500 = report.spacings.find((s) => s.spacingDays === 500)!;
  assert.equal(at500.computedWindows, 4);
  const multiples = report.windows
    .filter((w) => w.spacingDays === 500)
    .map((w) => Math.round(w.multiple! * 10_000) / 10_000);
  assert.deepEqual(multiples, [29.8977, 34.1823, 11.6699, 6.5983]);

  const entryDates = report.windows.filter((w) => w.spacingDays === 500).map((w) => w.entryDate);
  assert.deepEqual(entryDates, ["2011-07-17", "2015-02-25", "2018-12-28", "2022-12-07"]);
});

test("on the real archive every computable spacing closed above its entry, and 600 skips 2012", () => {
  const csv = readFileSync(new URL("../../public/btc-usd-max.csv", import.meta.url), "utf8");
  const report = computeSpacingReport(parseHistoricalCsv(csv, "test"));

  for (const summary of report.spacings) {
    assert.equal(summary.allClosedAboveEntry, true, `${summary.spacingDays}-day spacing`);
    assert.ok(summary.computedWindows >= 3, `${summary.spacingDays}-day has enough windows`);
  }
  const at600 = report.windows.filter((w) => w.spacingDays === 600);
  assert.equal(at600.filter((w) => w.status === "entry-before-archive").length, 1);
  const skipped = at600.find((w) => w.status === "entry-before-archive")!;
  assert.equal(skipped.label, "2012 Halving");
  assert.equal(skipped.entryDate, "2011-04-08");
});
