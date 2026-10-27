/**
 * The date-first snippet for /bitcoin-500-day-cycle.
 *
 * The page ranks for "when is 500 days before the next bitcoin halving" and
 * friends but its title used to be "Bitcoin 500-Day Cycle | BTC500", which
 * answers none of them. This module puts the actual date and the exact phrase
 * in the title, the meta description and the first sentence of the page — all
 * three from one function, so they cannot drift apart.
 *
 * The date comes from the live halving model (passed in by the route loader),
 * never from a literal. When the current buy date has passed, the copy switches
 * to "window opened" instead of claiming a date that is no longer ahead of us,
 * so the snippet cannot silently become false.
 */

const DAY_MS = 86_400_000;

export type PillarPhase = "before" | "after" | "unknown";

export interface PillarSnippet {
  phase: PillarPhase;
  /** Long-form UTC date, e.g. "November 28, 2026". Null when the date is unusable. */
  buyLabel: string | null;
  title: string;
  description: string;
  /** First sentence(s) of the page body; the required phrase lives here. */
  lead: string;
}

/** UTC day key (YYYY-MM-DD) so a time of day can never flip the phase. */
function dayKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDay(iso: string | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function buildPillarSnippet(input: {
  buyDateISO: string | null;
  nowISO: string;
}): PillarSnippet {
  const buyDate = parseDay(input.buyDateISO);
  const now = parseDay(input.nowISO) ?? new Date();

  if (!buyDate) {
    return {
      phase: "unknown",
      buyLabel: null,
      title: "500 Days Before the Next Bitcoin Halving | BTC500",
      description:
        "Bitcoin's performance from 500 days before each halving to 500 days after, with drawdowns and an entry-timing test from a daily close archive.",
      lead: "BTC500 measures one fixed window around every Bitcoin halving — 500 days before the event to 500 days after it — and publishes what that window paid, how deep it drew down, and what moving the entry date costs.",
    };
  }

  const buyLabel = formatLongDate(buyDate);
  const before = dayKey(now) < dayKey(buyDate);

  if (before) {
    return {
      phase: "before",
      buyLabel,
      title: `${buyLabel}: 500 Days Before the Next Bitcoin Halving`,
      description: `500 days before the next Bitcoin halving is ${buyLabel} — the BTC500 buy date. Four completed windows, their drawdowns and the entry-timing test.`,
      lead: `${buyLabel} is 500 days before the next Bitcoin halving — the date the BTC500 rule buys. This page shows what that window paid in all four completed cycles, how far below the entry price Bitcoin traded inside it, and what moving the entry date costs.`,
    };
  }

  return {
    phase: "after",
    buyLabel,
    title: `The Bitcoin 500-Day Cycle: Entry Was ${buyLabel}`,
    description: `The Bitcoin 500-day window opened ${buyLabel}: entry, exit, worst drawdown and the entry-timing test for all four completed halving windows.`,
    lead: `The current 500-day window opened on ${buyLabel} — the date that was 500 days before the next Bitcoin halving, and the date the BTC500 rule bought. This page shows what the four completed windows paid and what moving the entry date cost.`,
  };
}

/** Whole UTC days from `nowISO` to the buy date. Negative once the date has passed. */
export function daysUntilBuyDate(buyDateISO: string | null, nowISO: string): number | null {
  const buyDate = parseDay(buyDateISO);
  const now = parseDay(nowISO);
  if (!buyDate || !now) return null;
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const b = Date.UTC(buyDate.getUTCFullYear(), buyDate.getUTCMonth(), buyDate.getUTCDate());
  return Math.round((b - a) / DAY_MS);
}
