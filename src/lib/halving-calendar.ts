/**
 * The BTC500 calendar: the next cycle rendered as three all-day events.
 *
 * Kept separate from the iCalendar formatter so the dates can be asserted
 * against the halving model in tests.
 */
import type { HalvingCycle } from "./halvings";
import type { CalendarEvent } from "./cycle-calendar";

export const CALENDAR_PATH = "/bitcoin-halving-calendar.ics";

const SITE_URL = "https://btc500.net";

function labelFor(cycle: HalvingCycle): string {
  // The halving model already appends "(estimated)" / "(live)" to the label.
  return cycle.label;
}

function longDate(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function describe(kind: "buy" | "halving" | "sell", cycle: HalvingCycle): string {
  const label = labelFor(cycle);

  if (kind === "buy") {
    return [
      `The BTC500 buy window opens 500 calendar days before the ${label}.`,
      "",
      `Halving: ${longDate(cycle.date)} at block ${cycle.block.toLocaleString("en-US")}.`,
      "Rule: buy 500 days before the halving, sell 500 days after it.",
      `Dates move with block height: ${SITE_URL}/halving-dates`,
    ].join("\n");
  }

  if (kind === "sell") {
    return [
      `The BTC500 sell window opens 500 calendar days after the ${label}.`,
      "",
      "The rule exits at this date and stays in cash until the next buy window.",
      `Full schedule: ${SITE_URL}/when-to-sell-bitcoin-after-halving`,
    ].join("\n");
  }

  return [
    `Bitcoin's ${label} — block ${cycle.block.toLocaleString("en-US")}.`,
    "",
    "The block reward is cut in half at this height. The exact day is a projection:",
    "the event fires at a block height, not on a calendar date.",
    `Live countdown and estimate: ${SITE_URL}/halving-dates`,
  ].join("\n");
}

/**
 * Three events for the next cycle. UIDs are stable per cycle and kind, so a
 * subscriber who re-imports the file updates dates instead of duplicating.
 */
export function halvingCalendarEvents(cycle: HalvingCycle): CalendarEvent[] {
  const kind = cycle.dateKind === "estimated" ? "estimated" : "confirmed";
  const base = `btc500-${cycle.number}-${cycle.block}`;
  const label = labelFor(cycle);

  return [
    {
      uid: `${base}-buy-${kind}@btc500.net`,
      date: cycle.tMinus500,
      summary: `BTC500 buy window opens (T-500) — ${label}`,
      description: describe("buy", cycle),
      url: `${SITE_URL}/halving-dates`,
      categories: ["BTC500", "Bitcoin"],
      // The useful reminder is before the window opens, not on the day.
      reminderDaysBefore: 30,
    },
    {
      uid: `${base}-halving-${kind}@btc500.net`,
      date: cycle.date,
      summary: `Bitcoin ${label}`,
      description: describe("halving", cycle),
      url: `${SITE_URL}/halving-dates`,
      categories: ["Bitcoin"],
    },
    {
      uid: `${base}-sell-${kind}@btc500.net`,
      date: cycle.tPlus500,
      summary: `BTC500 sell window (T+500) — ${label}`,
      description: describe("sell", cycle),
      url: `${SITE_URL}/when-to-sell-bitcoin-after-halving`,
      categories: ["BTC500", "Bitcoin"],
    },
  ];
}
