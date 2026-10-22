import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildIcs,
  escapeIcsText,
  foldIcsLine,
  nextIcsDay,
  toIcsDay,
  type CalendarEvent,
} from "./cycle-calendar.ts";
import { halvingCalendarEvents } from "./halving-calendar.ts";
import type { HalvingCycle } from "./halvings.ts";

const encoder = new TextEncoder();

const EVENT: CalendarEvent = {
  uid: "btc500-test@btc500.net",
  date: "2026-11-28",
  summary: "BTC500 buy window opens (T-500)",
  description: "Line one\nLine two, with a comma; and a semicolon.",
  url: "https://btc500.net/halving-dates",
  categories: ["BTC500", "Bitcoin"],
  reminderDaysBefore: 30,
};

const NOW = new Date("2026-10-22T14:30:00.000Z");

describe("iCalendar dates", () => {
  it("formats date-only values", () => {
    assert.equal(toIcsDay("2026-11-28"), "20261128");
  });

  it("rejects malformed input instead of shipping a broken calendar", () => {
    assert.throws(() => toIcsDay("28/11/2026"));
    assert.throws(() => toIcsDay("2026-11-28T00:00:00Z"));
  });

  it("computes the exclusive DTEND across month and year boundaries", () => {
    assert.equal(nextIcsDay("2026-11-30"), "20261201");
    assert.equal(nextIcsDay("2026-12-31"), "20270101");
    assert.equal(nextIcsDay("2028-02-28"), "20280229");
  });
});

describe("iCalendar text", () => {
  it("escapes the characters RFC 5545 reserves", () => {
    assert.equal(escapeIcsText("a,b;c\\d"), "a\\,b\\;c\\\\d");
    assert.equal(escapeIcsText("two\nlines"), "two\\nlines");
  });

  it("folds long lines at 75 octets and keeps UTF-8 intact", () => {
    const line = `DESCRIPTION:${"bitcoin ⚡ ".repeat(20)}`;
    const folded = foldIcsLine(line);
    const physical = folded.split("\r\n");

    assert.ok(physical.length > 1);
    for (const chunk of physical) {
      assert.ok(encoder.encode(chunk).length <= 75, `line too long: ${chunk.length}`);
    }
    for (const chunk of physical.slice(1)) {
      assert.ok(chunk.startsWith(" "), "continuation lines must start with a space");
    }
    // Unfolding restores the original value with no replacement characters.
    const unfolded = physical.map((chunk, i) => (i === 0 ? chunk : chunk.slice(1))).join("");
    assert.equal(unfolded, line);
    assert.ok(!unfolded.includes("\uFFFD"));
  });
});

describe("buildIcs", () => {
  const ics = buildIcs([EVENT], {
    name: "BTC500 — Bitcoin halving & 500-day windows",
    description: "Dates are estimates.",
    now: NOW,
  });

  it("emits a single CRLF-terminated calendar", () => {
    assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
    assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
    assert.equal(ics.match(/BEGIN:VCALENDAR/gu)?.length, 1);
    assert.equal(ics.match(/END:VCALENDAR/gu)?.length, 1);
    // No bare LF / CR may survive: mail and calendar parsers are strict here.
    assert.equal(ics.replace(/\r\n/gu, "").includes("\n"), false);
  });

  it("writes the all-day event with a stable UID and a reminder", () => {
    assert.match(ics, /UID:btc500-test@btc500\.net\r\n/u);
    assert.match(ics, /DTSTART;VALUE=DATE:20261128\r\n/u);
    assert.match(ics, /DTEND;VALUE=DATE:20261129\r\n/u);
    assert.match(ics, /DTSTAMP:20261022T143000Z\r\n/u);
    assert.match(ics, /TRIGGER:-P30D\r\n/u);
    assert.match(ics, /TRANSP:TRANSPARENT\r\n/u);
  });

  it("keeps every physical line inside the 75-octet limit", () => {
    for (const line of ics.split("\r\n")) {
      assert.ok(encoder.encode(line).length <= 75, `too long: ${line}`);
    }
  });

  it("omits the reminder block when none is requested", () => {
    const noReminder = buildIcs([{ ...EVENT, reminderDaysBefore: undefined }], {
      name: "x",
      description: "y",
      now: NOW,
    });
    assert.equal(noReminder.includes("BEGIN:VALARM"), false);
  });
});

describe("halvingCalendarEvents", () => {
  const cycle: HalvingCycle = {
    number: 5,
    block: 1_050_000,
    label: "2028 Halving (estimated)",
    dateKind: "estimated",
    date: "2028-04-11",
    timestamp: "2028-04-11T21:26:42.493Z",
    tMinus500: "2026-11-28",
    tPlus500: "2029-08-24",
    cycleKind: "future",
    performanceKind: "projected",
    source: "fallback-protocol",
    confidence: "medium",
  };

  const events = halvingCalendarEvents(cycle);

  it("renders the buy, halving and sell dates as three events", () => {
    assert.deepEqual(
      events.map((event) => event.date),
      ["2026-11-28", "2028-04-11", "2029-08-24"],
    );
    assert.deepEqual(
      events.map((event) => event.categories?.[0]),
      ["BTC500", "Bitcoin", "BTC500"],
    );
  });

  it("uses unique UIDs that remain stable when the estimate changes", () => {
    const uids = events.map((event) => event.uid);
    assert.equal(new Set(uids).size, 3);

    const moved = halvingCalendarEvents({ ...cycle, date: "2028-04-13", tMinus500: "2026-11-30" });
    assert.deepEqual(
      moved.map((event) => event.uid),
      uids,
    );
  });

  it("marks estimated dates as estimates in the summary", () => {
    assert.ok(events[0]?.summary.includes("(estimated)"));
    assert.ok(events[0]?.summary.includes("T-500"));
  });
});
