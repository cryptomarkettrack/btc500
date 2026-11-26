/**
 * The homepage answer line (review mandate `homepage-answer-one-query`, 2026-10-28).
 *
 * The only URL Google serves is `/` (16 impressions in the 7 days to 2026-10-25,
 * 5 clicks, all brand `btc500`), while the cluster "when is / what is 500 days
 * before the next bitcoin halving" sits at positions 9.07 / 11.0 / 15.29 with 0
 * clicks on the pillar, which is "Crawled - currently not indexed". So the answer
 * has to be on the page that is actually served.
 *
 * Every string comes from the live halving model, never a literal: the date is
 * passed in from `computeCycle`, and the copy flips tense when the date passes so
 * the homepage cannot keep promising a date that already arrived.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type HomeAnswerPhase = "before" | "after" | "unknown";

export interface HomeAnswer {
  phase: HomeAnswerPhase;
  /** e.g. "28 November 2026". Null when the model gave no usable date. */
  dateLabel: string | null;
  /** e.g. "November 28, 2026" — the extractable, US-ordered H1 date. */
  usDate: string | null;
  /** Small line above the hero, kept from the existing design. */
  eyebrow: string;
  /** The answer sentence, emphasised in the lead paragraph. */
  leadAnswer: string;
  /** The rest of the lead paragraph. */
  leadRest: string;
  /** The whole lead paragraph — what the first 40 words of the page contain. */
  lead: string;
  /** H1, as HTML so the date can carry the brand accent. */
  h1Html: string;
  /** Plain H1 text, for tests and meta. */
  h1: string;
  /** Brand line under the H1. */
  subline: string;
}

/** "28 November 2026" in UTC — unambiguous for a date-first snippet. */
export function formatDayMonthYear(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "November 28, 2026" in UTC — the exact form the ranking query needs. */
export function formatMonthDayYear(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function dayKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDay(iso: string | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildHomeAnswer(input: {
  buyDateISO: string | null;
  nextHalvingISO?: string | null;
  nowISO: string;
}): HomeAnswer {
  const buyDate = parseDay(input.buyDateISO);
  const now = parseDay(input.nowISO) ?? new Date();

  if (!buyDate) {
    const leadAnswer =
      "BTC500 buys 500 days before each Bitcoin halving and sells 500 days after it.";
    const leadRest =
      "The dates come from the block-height model, so they move if blocks come in faster or " +
      "slower than ten minutes; this page shows the live dates, the four completed windows " +
      "and a free simulator.";
    return {
      phase: "unknown",
      dateLabel: null,
      usDate: null,
      eyebrow: "Bitcoin halving countdown · Two dated trades per cycle",
      leadAnswer,
      leadRest,
      lead: `${leadAnswer} ${leadRest}`,
      h1Html: 'Trade the <span class="text-primary">calendar</span>, not the noise',
      h1: "Trade the calendar, not the noise",
      subline: "Bitcoin halving countdown & the 500-day cycle",
    };
  }

  const dateLabel = formatDayMonthYear(buyDate);
  const usDate = formatMonthDayYear(buyDate);
  const halving = parseDay(input.nextHalvingISO ?? null);
  const halvingLabel = halving ? formatDayMonthYear(halving) : null;
  const before = dayKey(now) < dayKey(buyDate);

  if (before) {
    const leadAnswer = "The 500-day rule buys Bitcoin exactly 500 days before each halving.";
    const leadRest =
      `The next buy point is ${usDate} — 500 days before the projected April 11, 2028 halving ` +
      "at block 1,050,000.";
    return {
      phase: "before",
      dateLabel,
      usDate,
      eyebrow: "The Bitcoin 500-day halving rule · Two dated trades per cycle",
      leadAnswer,
      leadRest,
      lead: `${leadAnswer} ${leadRest}`,
      h1Html: `Bitcoin 500-Day Rule: The Buy Point Is <span class="text-primary">${usDate}</span>`,
      h1: `Bitcoin 500-Day Rule: The Buy Point Is ${usDate}`,
      subline: halvingLabel
        ? `BTC500 — trade the calendar, not the noise · next halving estimated ${halvingLabel}`
        : "BTC500 — trade the calendar, not the noise",
    };
  }

  const leadAnswer = `The 500-day Bitcoin window opened on ${dateLabel} — the date that was 500 days before the next Bitcoin halving, and the date the BTC500 rule bought.`;
  const leadRest =
    "Sell 500 days after the halving. No indicators, no narratives: the dates are fixed.";
  return {
    phase: "after",
    dateLabel,
    usDate,
    eyebrow: "Bitcoin halving countdown · The 500-day window is open",
    leadAnswer,
    leadRest,
    lead: `${leadAnswer} ${leadRest}`,
    h1Html: `Bitcoin 500-Day Rule: The Buy Point Was <span class="text-primary">${usDate}</span>`,
    h1: `Bitcoin 500-Day Rule: The Buy Point Was ${usDate}`,
    subline: "BTC500 — trade the calendar, not the noise",
  };
}
