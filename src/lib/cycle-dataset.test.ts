import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CYCLE_DATASET_PATH,
  CYCLE_DATASET_SCHEMA,
  buildCycleDataset,
  buildCycleDatasetSchema,
} from "./cycle-dataset.ts";
import { HALVINGS, WINDOW_DAYS, addDays } from "./halvings.ts";
import { assembleSimulatorResult } from "./simulator-result.ts";

const ARCHIVE = {
  firstDate: "2011-07-17",
  lastDate: "2026-10-26",
  rows: 5578,
  source: "btc-usd-max.csv",
};

function fixturePrices(): Map<string, number> {
  const prices = new Map<string, number>();
  for (const halving of HALVINGS) {
    const buy = addDays(halving.date, -WINDOW_DAYS);
    prices.set(buy, 100.126);
    prices.set(halving.date, 200.004);
    prices.set(addDays(halving.date, WINDOW_DAYS), 400.008);
    // One deep print inside the window, so the drawdown fields are populated.
    prices.set(addDays(buy, 10), 50);
  }
  return prices;
}

function fixtureResult() {
  const prices = fixturePrices();
  return assembleSimulatorResult((d) => prices.get(d) ?? null, "fixture", prices.size, {
    firstDate: ARCHIVE.firstDate,
    lastDate: ARCHIVE.lastDate,
    rows: prices.size,
  });
}

describe("buildCycleDataset", () => {
  const dataset = buildCycleDataset(fixtureResult(), {
    generated: "2026-10-27T05:00:00.000Z",
    site: "https://btc500.net",
    archive: ARCHIVE,
  });

  it("carries a stable schema id and one entry per halving", () => {
    assert.equal(dataset.schema, CYCLE_DATASET_SCHEMA);
    assert.equal(dataset.cycles.length, HALVINGS.length);
    assert.equal(dataset.page, "https://btc500.net/bitcoin-500-day-cycle");
    assert.equal(dataset.archive.lastDate, "2026-10-26");
    assert.equal(dataset.archive.rows, 5578);
  });

  it("rounds prices and percents so the published numbers are stable", () => {
    const first = dataset.cycles[0]!;
    assert.equal(first.entry.price, 100.13);
    assert.equal(first.halving.price, 200);
    assert.equal(first.exit.price, 400.01);
    assert.equal(first.returnPercent, 299.5);
    assert.equal(first.multiple, 3.995);
  });

  it("keeps the T-500 / halving / T+500 dates from the halving model", () => {
    for (const [index, halving] of HALVINGS.entries()) {
      const cycle = dataset.cycles[index]!;
      assert.equal(cycle.halvingDate, halving.date);
      assert.equal(cycle.entry.date, addDays(halving.date, -WINDOW_DAYS));
      assert.equal(cycle.exit.date, addDays(halving.date, WINDOW_DAYS));
      assert.equal(cycle.label, halving.label);
    }
  });

  it("reports the drawdown against the entry close", () => {
    const first = dataset.cycles[0]!;
    assert.equal(first.drawdown.lowPrice, 50);
    assert.equal(first.drawdown.lowVsEntryPercent, -50.06);
    assert.equal(first.drawdown.windowClosed, true);
    assert.equal(dataset.summary.risk.medianLowVsEntryPercent, -50.06);
    assert.equal(dataset.summary.risk.allBelowEntry, true);
  });

  it("lists the timing offsets with the exact entry as the zero row", () => {
    const first = dataset.cycles[0]!;
    const exact = first.timing.find((row) => row.offsetDays === 0);
    assert.equal(exact?.entryPrice, 100.13);
    assert.equal(exact?.vsT500Percent, 0);
    assert.equal(dataset.summary.timing.cycleCount, HALVINGS.length);
    assert.equal(dataset.summary.timing.offsets.length, 9);
  });

  it("is JSON-serialisable and cites its own URL and year", () => {
    const json = JSON.stringify(dataset);
    const parsed = JSON.parse(json) as typeof dataset;
    assert.equal(parsed.cycles.length, HALVINGS.length);
    assert.ok(dataset.citation.includes("https://btc500.net/data/500-day-cycles.json"));
    assert.ok(dataset.citation.includes("(2026)"));
  });

  it("leaves a missing print as null instead of inventing one", () => {
    const empty = buildCycleDataset(
      assembleSimulatorResult(() => null, "missing", 0),
      { generated: "2026-10-27T05:00:00.000Z", site: "https://btc500.net", archive: ARCHIVE },
    );
    for (const cycle of empty.cycles) {
      assert.equal(cycle.entry.price, null);
      assert.equal(cycle.exit.price, null);
      assert.equal(cycle.returnPercent, null);
      assert.equal(cycle.timing.length, 9);
      assert.ok(cycle.timing.every((row) => row.vsT500Percent === null));
    }
    assert.equal(empty.summary.risk.analyzedCount, 0);
  });
});

describe("buildCycleDatasetSchema", () => {
  it("points at the JSON endpoint as a free Dataset with a JSON download", () => {
    const schema = buildCycleDatasetSchema();
    assert.equal(schema["@type"], "Dataset");
    assert.equal(schema.url, `https://btc500.net${CYCLE_DATASET_PATH}`);
    assert.equal(schema.isAccessibleForFree, true);
    assert.equal(schema.distribution[0]!.encodingFormat, "application/json");
    assert.ok(schema.distribution[0]!.contentUrl.endsWith(CYCLE_DATASET_PATH));
  });
});
