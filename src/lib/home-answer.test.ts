import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildHomeAnswer, formatDayMonthYear } from "./home-answer.ts";

const BUY = "2026-11-28T00:00:00.000Z";
const HALVING = "2028-04-11T00:00:00.000Z";

describe("buildHomeAnswer", () => {
  it("answers the query with the live date while the buy date is ahead", () => {
    const answer = buildHomeAnswer({
      buyDateISO: BUY,
      nextHalvingISO: HALVING,
      nowISO: "2026-10-29T06:00:00.000Z",
    });

    assert.equal(answer.phase, "before");
    assert.equal(answer.dateLabel, "28 November 2026");
    assert.match(answer.h1, /^500 days before the next Bitcoin halving is 28 November 2026$/);
    assert.ok(answer.h1Html.includes("28 November 2026"));
    assert.ok(answer.h1Html.includes("text-primary"));
    assert.ok(answer.leadAnswer.includes("500 days before the next Bitcoin halving"));
    assert.ok(answer.leadAnswer.includes("28 November 2026"));
  });

  it("puts the query and the date inside the first 40 words of the page", () => {
    const answer = buildHomeAnswer({
      buyDateISO: BUY,
      nextHalvingISO: HALVING,
      nowISO: "2026-10-29T06:00:00.000Z",
    });
    // The eyebrow renders above the lead paragraph, so it counts.
    const firstForty = `${answer.eyebrow} ${answer.lead}`.split(/\s+/).slice(0, 40).join(" ");
    assert.ok(firstForty.toLowerCase().includes("500 days before the next bitcoin halving"));
    assert.ok(firstForty.includes("28 November 2026"));
  });

  it("keeps the halving estimate on the subline so the H1 stays one sentence", () => {
    const answer = buildHomeAnswer({
      buyDateISO: BUY,
      nextHalvingISO: HALVING,
      nowISO: "2026-10-29T06:00:00.000Z",
    });
    assert.ok(answer.subline.includes("11 April 2028"));
    assert.ok(answer.subline.includes("trade the calendar, not the noise"));
    assert.ok(!answer.h1.includes("estimated"));
  });

  it("switches tense on the buy date instead of promising a date that arrived", () => {
    const answer = buildHomeAnswer({
      buyDateISO: BUY,
      nextHalvingISO: HALVING,
      nowISO: "2026-11-28T00:00:00.000Z",
    });
    assert.equal(answer.phase, "after");
    assert.ok(answer.h1.startsWith("The 500-day Bitcoin window opened on 28 November 2026"));
    assert.ok(!answer.h1.includes("next Bitcoin halving"));
    assert.ok(answer.lead.toLowerCase().includes("500 days before the next bitcoin halving"));
  });

  it("falls back to a dateless H1 when the model gives no date", () => {
    const answer = buildHomeAnswer({
      buyDateISO: null,
      nextHalvingISO: null,
      nowISO: "2026-10-29T06:00:00.000Z",
    });
    assert.equal(answer.phase, "unknown");
    assert.equal(answer.dateLabel, null);
    assert.ok(!/\b20\d\d\b/.test(answer.h1));
    assert.ok(!/\b20\d\d\b/.test(answer.lead));
  });

  it("formats dates in UTC so a time of day cannot shift the day", () => {
    assert.equal(formatDayMonthYear(new Date("2026-11-28T23:30:00.000Z")), "28 November 2026");
    assert.equal(formatDayMonthYear(new Date("2026-01-01T00:00:00.000Z")), "1 January 2026");
  });
});
