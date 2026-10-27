import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPillarSnippet, daysUntilBuyDate } from "./pillar-snippet.ts";

const BUY = "2026-11-28T00:00:00.000Z";

describe("buildPillarSnippet", () => {
  it("leads with the date and the exact query phrase while the buy date is ahead", () => {
    const snippet = buildPillarSnippet({ buyDateISO: BUY, nowISO: "2026-10-27T06:00:00.000Z" });

    assert.equal(snippet.phase, "before");
    assert.equal(snippet.buyLabel, "November 28, 2026");
    assert.ok(snippet.title.includes("November 28, 2026"));
    assert.ok(snippet.title.includes("500 Days Before the Next Bitcoin Halving"));
    assert.ok(snippet.description.includes("November 28, 2026"));
    assert.ok(snippet.description.includes("500 days before the next Bitcoin halving"));

    const firstForty = snippet.lead.split(/\s+/).slice(0, 40).join(" ").toLowerCase();
    assert.ok(firstForty.includes("november 28, 2026"));
    assert.ok(firstForty.includes("500 days before the next bitcoin halving"));
  });

  it("keeps the meta description inside a SERP-sized length", () => {
    const snippet = buildPillarSnippet({ buyDateISO: BUY, nowISO: "2026-10-27T06:00:00.000Z" });
    assert.ok(snippet.description.length <= 165, `description is ${snippet.description.length}`);
    assert.ok(snippet.title.length <= 65, `title is ${snippet.title.length}`);
  });

  it("switches to past tense on the buy date instead of promising a date that arrived", () => {
    const onTheDay = buildPillarSnippet({
      buyDateISO: BUY,
      nowISO: "2026-11-28T12:00:00.000Z",
    });
    assert.equal(onTheDay.phase, "after");
    assert.ok(onTheDay.title.includes("November 28, 2026"));
    assert.ok(!onTheDay.title.includes("Next"));
    assert.ok(onTheDay.lead.toLowerCase().includes("500 days before the next bitcoin halving"));
  });

  it("falls back to a dateless snippet when the model gives no date", () => {
    const snippet = buildPillarSnippet({ buyDateISO: null, nowISO: "2026-10-27T06:00:00.000Z" });
    assert.equal(snippet.phase, "unknown");
    assert.equal(snippet.buyLabel, null);
    assert.ok(!/\b20\d\d\b/.test(snippet.title));
    assert.ok(snippet.lead.includes("500 days before"));
  });
});

describe("daysUntilBuyDate", () => {
  it("counts whole UTC days to the buy date and goes negative after it", () => {
    assert.equal(daysUntilBuyDate(BUY, "2026-10-27T06:00:00.000Z"), 32);
    assert.equal(daysUntilBuyDate(BUY, "2026-11-28T23:00:00.000Z"), 0);
    assert.equal(daysUntilBuyDate(BUY, "2026-12-01T00:00:00.000Z"), -3);
    assert.equal(daysUntilBuyDate(null, "2026-12-01T00:00:00.000Z"), null);
  });
});
