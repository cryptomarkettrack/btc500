/**
 * The date-first snippet for `/`.
 *
 * The homepage is the only URL Google serves (the one page with a crawl that
 * returned "Submitted and indexed"), and every impression it gets is the brand
 * query `btc500` at position 1.6. The whole non-brand footprint in 27 days is
 * two impressions at positions 38 and 69, and the old title led with
 * "The Bitcoin 500-Day Halving Rule" — a term this site invented, which no
 * stranger searches for.
 *
 * This module puts the thing a stranger does search for (the next halving and
 * its year) in front of the title and the meta description, names the buy
 * window, and keeps the brand at the end. Both strings are built from the live
 * halving estimate passed in by the route loader — never from a literal date —
 * so they cannot drift from the dates the rest of the site prints.
 *
 * When the buy date passes, the copy switches from "Buy <date>" to "Window
 * Opened <date>" instead of claiming a buy that is no longer ahead of us, and
 * when the halving itself has passed it falls back to the static snippet rather
 * than advertising a cycle that has already happened.
 */

const DAY_MS = 86_400_000;

/** The snippet served when the live estimate is unavailable (the pre-2026-11-19 copy). */
export const HOME_TITLE_FALLBACK = "BTC500 — The Bitcoin 500-Day Halving Rule";
export const HOME_DESCRIPTION_FALLBACK =
  "BTC500 is the Bitcoin 500-day rule: buy 500 days before the halving, sell 500 days after. Live countdown, the full record, and a free simulator.";

export type HomeSnippetPhase = "before" | "after" | "unknown";

export interface HomeSnippet {
  phase: HomeSnippetPhase;
  /** Halving year as printed in the title, e.g. "2028". Null when the phase is unknown. */
  halvingYear: string | null;
  /** Short buy label, e.g. "29 Nov 2026". Null when the phase is unknown. */
  buyLabelShort: string | null;
  /** Long buy label, e.g. "29 November 2026". Null when the phase is unknown. */
  buyLabelLong: string | null;
  title: string;
  description: string;
}

function parse(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** UTC day key (YYYY-MM-DD) so a time of day can never flip the phase. */
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function longDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function monthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Build the `/` title and meta description.
 *
 * `halvingISO` is the live estimate of the next halving (a block-height
 * projection, so the day can move); `buyDateISO` is that date minus 500 days,
 * computed by the same `computeCycle` the pillar page uses. Passing both keeps
 * this file free of arithmetic that could disagree with the rest of the site.
 */
export function buildHomeSnippet(input: {
  halvingISO: string | null;
  buyDateISO: string | null;
  nowISO: string;
}): HomeSnippet {
  const halving = parse(input.halvingISO);
  const buy = parse(input.buyDateISO);
  const now = parse(input.nowISO) ?? new Date();

  const unknown: HomeSnippet = {
    phase: "unknown",
    halvingYear: null,
    buyLabelShort: null,
    buyLabelLong: null,
    title: HOME_TITLE_FALLBACK,
    description: HOME_DESCRIPTION_FALLBACK,
  };

  if (!halving || !buy) return unknown;
  // A halving that has already happened means the estimate has not rolled yet:
  // never advertise a finished cycle.
  if (dayKey(buy) > dayKey(halving)) return unknown;
  if (dayKey(now) >= dayKey(halving)) return unknown;

  const halvingYear = String(halving.getUTCFullYear());
  const buyLabelShort = shortDate(buy);
  const buyLabelLong = longDate(buy);
  const halvingMonthYear = monthYear(halving);

  if (dayKey(now) < dayKey(buy)) {
    return {
      phase: "before",
      halvingYear,
      buyLabelShort,
      buyLabelLong,
      title: `Next Bitcoin Halving ${halvingYear}: Buy ${buyLabelShort} | BTC500`,
      description: `Next Bitcoin halving: projected ${halvingMonthYear}. BTC500 buys 500 days before it — ${buyLabelLong} — and sells 500 days after. Live countdown and record.`,
    };
  }

  return {
    phase: "after",
    halvingYear,
    buyLabelShort,
    buyLabelLong,
    title: `Next Bitcoin Halving ${halvingYear}: Window Opened ${buyLabelShort} | BTC500`,
    description: `The next Bitcoin halving is projected for ${halvingMonthYear}. The BTC500 buy window opened ${buyLabelLong}, 500 days before it. Live public record and countdown.`,
  };
}

/** Whole UTC days from `nowISO` to the buy date. Negative once the date has passed. */
export function daysUntilBuyDate(buyDateISO: string | null, nowISO: string): number | null {
  const buy = parse(buyDateISO);
  const now = parse(nowISO);
  if (!buy || !now) return null;
  return Math.round((Date.parse(dayKey(buy)) - Date.parse(dayKey(now))) / DAY_MS);
}
