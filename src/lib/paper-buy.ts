/**
 * BTC500 public paper-buy record — pure model.
 *
 * No network, no filesystem, no React. Every figure rendered on /paper-buy is
 * derived here so the record is reproducible from its inputs and unit-testable.
 *
 * The public promise (made in the 2026-11-12 BitcoinTalk topic) is fixed:
 *   - Notional: $50,000 paper. No real money, no leverage, no discretionary exits.
 *   - Entry: the cycle's T-500 buy date, read from the site's live halving model.
 *     It is never a literal, because the halving date is a live estimate.
 *   - Entry price: that date's BTC/USD daily close from the bundled archive,
 *     using the same CSV-first + Bitstamp-tail fallback as the rest of the site,
 *     and published only once that UTC day has closed (the tail fallback's
 *     in-progress candle is the live mark, not a close).
 *   - Exit: T+500 after the halving, also live-derived and disclosed as an estimate.
 *
 * Honesty rules enforced by this module:
 *   - Before the entry date nothing is deployed: no price and no P&L exist.
 *   - On the entry day itself the close is not final yet, so no entry price and
 *     no P&L are published — a supplied value is discarded, never labelled.
 *   - If the entry close or the live mark is unavailable, the record says so and
 *     publishes no P&L. It never substitutes today's price for the entry price.
 *   - A paper result is not a guaranteed fill and not financial advice.
 */

export const PAPER_NOTIONAL_USD = 50_000;

export type PaperRecordState = "scheduled" | "awaiting-price" | "live" | "closed";

export interface PaperRecordInput {
  /** Current instant (ISO). Only the UTC calendar day is used. */
  nowISO: string;
  /** T-500 buy date from the live halving model (YYYY-MM-DD or ISO). */
  buyDateISO: string;
  /** T+500 sell date from the live halving model (YYYY-MM-DD or ISO). */
  sellDateISO: string;
  /** BTC/USD daily close on the entry date, from the price archive. */
  entryPriceUSD: number | null;
  /** Latest BTC/USD price from the site's live price feed. */
  currentPriceUSD: number | null;
}

export interface PaperRecord {
  state: PaperRecordState;
  notionalUSD: number;
  todayISO: string;
  entryDateISO: string;
  sellDateISO: string;
  daysToEntry: number;
  daysToExit: number;
  daysSinceEntry: number;
  totalWindowDays: number;
  progress: number;
  entryPriceUSD: number | null;
  currentPriceUSD: number | null;
  btcHeld: number | null;
  valueUSD: number | null;
  profitUSD: number | null;
  returnPercent: number | null;
  statusNote: string;
  /** One dated, quotable line that changes once a day. */
  dailyLine: string;
}

/** UTC calendar day (YYYY-MM-DD) from any ISO string or date literal. */
export function paperIsoDay(iso: string): string {
  return iso.slice(0, 10);
}

/** Whole UTC days from `fromISO` to `toISO`. Identical on server and client. */
export function paperDaysBetween(fromISO: string, toISO: string): number {
  const from = Date.parse(`${paperIsoDay(fromISO)}T00:00:00Z`);
  const to = Date.parse(`${paperIsoDay(toISO)}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

function positive(value: number | null): number | null {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function paperMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function paperPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function paperLongDate(iso: string): string {
  return new Date(`${paperIsoDay(iso)}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Build the complete, state-aware record. Pure: same inputs → same output. */
export function buildPaperRecord(input: PaperRecordInput): PaperRecord {
  const today = paperIsoDay(input.nowISO);
  const entry = paperIsoDay(input.buyDateISO);
  const exit = paperIsoDay(input.sellDateISO);

  const totalWindowDays = Math.max(0, paperDaysBetween(entry, exit));
  const daysToEntry = Math.max(0, paperDaysBetween(today, entry));
  const daysToExit = Math.max(0, paperDaysBetween(today, exit));
  const daysSinceEntry = Math.max(0, paperDaysBetween(entry, today));
  const progress = totalWindowDays > 0 ? clamp01(daysSinceEntry / totalWindowDays) : 0;

  // The entry price is a *daily close*, and a close does not exist until its
  // UTC day has ended: Bitstamp (the tail fallback) returns today's in-progress
  // candle, which is the live mark. A value handed in for the entry day itself
  // is therefore dropped here rather than published as an entry price that
  // would change once the day closes.
  const entryDayComplete = today > entry;
  const entryPrice = entryDayComplete ? positive(input.entryPriceUSD) : null;
  const currentPrice = positive(input.currentPriceUSD);

  let state: PaperRecordState;
  let statusNote: string;

  if (today < entry) {
    state = "scheduled";
    statusNote = `No position is open. The ${paperMoney(PAPER_NOTIONAL_USD)} stays in the paper cash balance until the buy date.`;
  } else if (!entryDayComplete) {
    state = "awaiting-price";
    statusNote = `The buy date is today. That day's BTC/USD close is only final at 00:00 UTC, so no entry price and no P&L are published yet — a live mark is never used as the entry price.`;
  } else if (entryPrice === null) {
    state = "awaiting-price";
    statusNote =
      "The buy date has passed, but that date's daily close is not in the archive yet. No entry price and no P&L are published.";
  } else if (currentPrice === null) {
    state = "awaiting-price";
    statusNote =
      "The entry price is locked, but a live BTC mark is unavailable. No P&L is published until a mark returns.";
  } else if (today > exit) {
    state = "closed";
    statusNote =
      "The T+500 exit rule has fired. The figure shown uses the last available mark, not a guaranteed fill.";
  } else {
    state = "live";
    statusNote = "Position open under the rule, marked against the site's live BTC price.";
  }

  const canMark =
    (state === "live" || state === "closed") && entryPrice !== null && currentPrice !== null;

  let btcHeld: number | null = null;
  let valueUSD: number | null = null;
  let profitUSD: number | null = null;
  let returnPercent: number | null = null;

  if (canMark && entryPrice !== null && currentPrice !== null) {
    btcHeld = PAPER_NOTIONAL_USD / entryPrice;
    valueUSD = btcHeld * currentPrice;
    profitUSD = valueUSD - PAPER_NOTIONAL_USD;
    returnPercent = (profitUSD / PAPER_NOTIONAL_USD) * 100;
  }

  let dailyLine: string;
  if (state === "scheduled") {
    dailyLine = `${today} — Scheduled. ${paperMoney(PAPER_NOTIONAL_USD)} not deployed. Entry ${paperLongDate(entry)} (T−500), ${daysToEntry} days away. Exit rule T+500 on ${paperLongDate(exit)}.`;
  } else if (state === "awaiting-price") {
    dailyLine = `${today} — Entry date reached (${paperLongDate(entry)}). ${statusNote}`;
  } else if (state === "closed") {
    dailyLine = `${today} — Rule closed. Entry ${paperMoney(entryPrice!)} on ${paperLongDate(entry)}. Final mark ${paperMoney(currentPrice!)}. ${paperPercent(returnPercent!)} (${profitUSD! >= 0 ? "+" : "−"}${paperMoney(Math.abs(profitUSD!))}).`;
  } else {
    dailyLine = `${today} — Day ${daysSinceEntry}. Entry ${paperMoney(entryPrice!)} on ${paperLongDate(entry)}. Mark ${paperMoney(currentPrice!)}. ${paperPercent(returnPercent!)} (${profitUSD! >= 0 ? "+" : "−"}${paperMoney(Math.abs(profitUSD!))}). Exit ${paperLongDate(exit)} in ${daysToExit} days.`;
  }

  return {
    state,
    notionalUSD: PAPER_NOTIONAL_USD,
    todayISO: today,
    entryDateISO: entry,
    sellDateISO: exit,
    daysToEntry,
    daysToExit,
    daysSinceEntry,
    totalWindowDays,
    progress,
    entryPriceUSD: canMark ? entryPrice : null,
    currentPriceUSD: canMark ? currentPrice : null,
    btcHeld,
    valueUSD,
    profitUSD,
    returnPercent,
    statusNote,
    dailyLine,
  };
}
