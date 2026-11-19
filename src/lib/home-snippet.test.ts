import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HOME_DESCRIPTION_FALLBACK,
  HOME_TITLE_FALLBACK,
  buildHomeSnippet,
  daysUntilBuyDate,
} from "./home-snippet.ts";

/** The shape the site serves today: live estimate 2028-04-12 → T-500 = 2026-11-29. */
const HALVING = "2028-04-12T09:04:00.000Z";
const BUY = "2026-11-29T00:00:00.000Z";

describe("buildHomeSnippet", () => {
  it("leads with the halving year and names the buy window while it is ahead", () => {
    const snippet = buildHomeSnippet({
      halvingISO: HALVING,
      buyDateISO: BUY,
      nowISO: "2026-11-19T04:00:00.000Z",
    });

    assert.equal(snippet.phase, "before");
    assert.equal(snippet.halvingYear, "2028");
    assert.equal(snippet.title, "Next Bitcoin Halving 2028: Buy 29 Nov 2026 | BTC500");
    assert.ok(snippet.title.startsWith("Next Bitcoin Halving 2028"));
    assert.ok(snippet.title.endsWith("| BTC500"));
    assert.ok(snippet.description.includes("April 2028"));
    assert.ok(snippet.description.includes("29 November 2026"));
    assert.ok(snippet.description.includes("500 days"));
  });

  it("keeps the title and description inside SERP-sized lengths", () => {
    const snippet = buildHomeSnippet({
      halvingISO: HALVING,
      buyDateISO: BUY,
      nowISO: "2026-11-19T04:00:00.000Z",
    });
    assert.ok(snippet.title.length <= 60, `title is ${snippet.title.length}`);
    assert.ok(snippet.description.length <= 165, `description is ${snippet.description.length}`);
  });

  it("takes the year and month from the date passed in, never from a literal", () => {
    const snippet = buildHomeSnippet({
      halvingISO: "2032-04-15T00:00:00.000Z",
      buyDateISO: "2030-12-02T00:00:00.000Z",
      nowISO: "2029-06-01T00:00:00.000Z",
    });

    assert.equal(snippet.halvingYear, "2032");
    assert.ok(snippet.title.includes("2032"));
    assert.ok(snippet.description.includes("April 2032"));
    assert.ok(!snippet.title.includes("2028"));
  });

  it("stops promising a buy date that has arrived", () => {
    const onTheDay = buildHomeSnippet({
      halvingISO: HALVING,
      buyDateISO: BUY,
      nowISO: "2026-11-29T12:00:00.000Z",
    });

    assert.equal(onTheDay.phase, "after");
    assert.ok(!onTheDay.title.includes("Buy 29 Nov 2026"));
    assert.ok(onTheDay.title.includes("Window Opened 29 Nov 2026"));
    assert.ok(onTheDay.description.includes("opened 29 November 2026"));
  });

  it("falls back to the static snippet when the estimate has not rolled past the halving", () => {
    const afterHalving = buildHomeSnippet({
      halvingISO: "2028-04-12T09:04:00.000Z",
      buyDateISO: BUY,
      nowISO: "2028-04-20T00:00:00.000Z",
    });

    assert.equal(afterHalving.phase, "unknown");
    assert.equal(afterHalving.title, HOME_TITLE_FALLBACK);
    assert.equal(afterHalving.description, HOME_DESCRIPTION_FALLBACK);
  });

  it("falls back to the static snippet when no estimate is available", () => {
    const missing = buildHomeSnippet({
      halvingISO: null,
      buyDateISO: null,
      nowISO: "2026-11-19T04:00:00.000Z",
    });

    assert.equal(missing.phase, "unknown");
    assert.equal(missing.title, HOME_TITLE_FALLBACK);
    assert.equal(missing.description, HOME_DESCRIPTION_FALLBACK);
    assert.ok(!missing.title.includes("2028"), "must not invent a halving year");
  });

  it("never puts a buy date ahead of its own halving on the page", () => {
    const broken = buildHomeSnippet({
      halvingISO: HALVING,
      buyDateISO: "2028-05-01T00:00:00.000Z",
      nowISO: "2026-11-19T04:00:00.000Z",
    });
    assert.equal(broken.phase, "unknown");
  });
});

describe("daysUntilBuyDate", () => {
  it("counts whole UTC days to the buy date", () => {
    assert.equal(daysUntilBuyDate(BUY, "2026-11-19T04:00:00.000Z"), 10);
    assert.equal(daysUntilBuyDate(BUY, "2026-11-29T23:00:00.000Z"), 0);
    assert.equal(daysUntilBuyDate(BUY, "2026-11-30T01:00:00.000Z"), -1);
    assert.equal(daysUntilBuyDate(null, "2026-11-19T04:00:00.000Z"), null);
  });
});
