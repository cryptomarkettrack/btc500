import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { addDays } from "./halvings.ts";
import {
  isCoveredByDataset,
  lookupHistoricalPrice,
  lookupHistoricalPriceRange,
  needsExternalFallback,
  parseHistoricalCsv,
} from "./historical-csv.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const csvText = readFileSync(join(root, "public", "btc-usd-max.csv"), "utf8");

describe("parseHistoricalCsv", () => {
  it("skips the header, empty closes, and invalid rows", () => {
    const parsed = parseHistoricalCsv(
      [
        "event_date,close_price_usd,market_cap_usd,volume_usd",
        "2011-07-17 00:00:00 UTC,14.07,0,0",
        "2011-07-18 00:00:00 UTC,13.9,0,0",
        '2026-07-12 00:00:00 UTC,"",1,1',
        "not-a-date,10,0,0",
        "2011-07-19 00:00:00 UTC,-1,0,0",
        "",
      ].join("\n"),
      "fixture",
    );

    assert.equal(parsed.size, 2);
    assert.equal(parsed.firstDate, "2011-07-17");
    assert.equal(parsed.lastDate, "2011-07-18");
    assert.equal(parsed.prices.get("2011-07-17"), 14.07);
    assert.equal(parsed.prices.has("2026-07-12"), false);
  });

  it("returns an empty dataset for blank input", () => {
    const parsed = parseHistoricalCsv("");
    assert.equal(parsed.size, 0);
    assert.equal(parsed.firstDate, null);
    assert.equal(parsed.lastDate, null);
  });
});

describe("coverage helpers", () => {
  it("treats dates on or before the last print as covered", () => {
    assert.equal(isCoveredByDataset("2026-07-11", "2026-07-11"), true);
    assert.equal(isCoveredByDataset("2026-07-10", "2026-07-11"), true);
    assert.equal(isCoveredByDataset("2026-07-12", "2026-07-11"), false);
  });

  it("does not request an external fallback when the dataset is empty", () => {
    assert.equal(needsExternalFallback("2024-04-20", null), false);
    assert.equal(needsExternalFallback("2026-08-15", "2026-07-11"), true);
    assert.equal(needsExternalFallback("2025-09-02", "2026-07-11"), false);
  });
});

describe("lookupHistoricalPrice", () => {
  const dataset = parseHistoricalCsv(
    [
      "event_date,close_price_usd",
      "2011-07-17 00:00:00 UTC,14.07",
      "2011-07-19 00:00:00 UTC,13.8",
    ].join("\n"),
  );

  it("returns the exact close when present", () => {
    assert.equal(lookupHistoricalPrice(dataset, "2011-07-17"), 14.07);
  });

  it("fills a one-day hole inside the archive", () => {
    assert.equal(lookupHistoricalPrice(dataset, "2011-07-18"), 14.07);
  });

  it("returns null outside the archive", () => {
    assert.equal(lookupHistoricalPrice(dataset, "2011-07-16"), null);
    assert.equal(lookupHistoricalPrice(dataset, "2011-07-21"), null);
  });
});

describe("bundled btc-usd-max.csv", () => {
  const dataset = parseHistoricalCsv(csvText, "public/btc-usd-max.csv");

  it("loads thousands of daily closes from 2011 through 2026", () => {
    assert.ok(dataset.size > 4000, `expected a large archive, got ${dataset.size}`);
    assert.equal(dataset.firstDate, "2011-07-17");
    assert.ok(dataset.lastDate && dataset.lastDate >= "2026-07-10", String(dataset.lastDate));
  });

  it("covers every completed BTC500 buy / halving / sell date", () => {
    const checkpoints = [
      "2011-07-17", // 2012 T-500
      "2012-11-28",
      addDays("2012-11-28", 500),
      addDays("2016-07-09", -500),
      "2016-07-09",
      addDays("2016-07-09", 500),
      addDays("2020-05-11", -500),
      "2020-05-11",
      addDays("2020-05-11", 500),
      addDays("2024-04-20", -500),
      "2024-04-20",
      addDays("2024-04-20", 500),
    ];

    for (const date of checkpoints) {
      const price = lookupHistoricalPrice(dataset, date);
      assert.ok(price && price > 0, `missing archive price for ${date}`);
    }
  });

  it("does not invent prices for dates before or after the archive", () => {
    assert.equal(lookupHistoricalPrice(dataset, "2010-01-01"), null);
    assert.equal(lookupHistoricalPrice(dataset, "2026-08-15"), null);
    assert.equal(needsExternalFallback("2010-01-01", dataset.lastDate), false);
    assert.equal(needsExternalFallback("2026-08-15", dataset.lastDate), true);
  });

  it("returns a dense range for the 2024 cycle without holes large enough to drop the window", () => {
    const start = addDays("2024-04-20", -500);
    const end = addDays("2024-04-20", 500);
    const range = lookupHistoricalPriceRange(dataset, start, end);
    assert.ok(range.size > 900, `2024 window should be almost daily, got ${range.size}`);
    assert.ok(range.get(start));
    assert.ok(range.get("2024-04-20"));
    assert.ok(range.get(end));
  });
});
