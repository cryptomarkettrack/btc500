/**
 * Pure historical BTC daily-close dataset helpers.
 * No filesystem, no network — safe to unit-test and import anywhere.
 */

import { completenessFromCounts, type Completeness, type DataResult } from "./data-status.ts";

export const HISTORICAL_CSV_FILENAME = "btc-usd-max.csv";

export type HistoricalRangeResult = DataResult<Map<string, number>>;

export interface HistoricalCsvDataset {
  prices: Map<string, number>;
  firstDate: string | null;
  lastDate: string | null;
  size: number;
  source: string;
}

export function emptyHistoricalCsvDataset(source = "missing"): HistoricalCsvDataset {
  return { prices: new Map(), firstDate: null, lastDate: null, size: 0, source };
}

function isIsoDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseClosePrice(raw: string): number | null {
  const trimmed = raw.trim().replace(/^"|"$/g, "");
  if (!trimmed) return null;
  const price = Number(trimmed);
  if (!Number.isFinite(price) || price <= 0) return null;
  return price;
}

/**
 * Parse the on-site BTC daily close CSV (`event_date,close_price_usd,...`).
 * Invalid / empty close prices are skipped rather than failing the load.
 */
export function parseHistoricalCsv(text: string, source = "parsed"): HistoricalCsvDataset {
  const prices = new Map<string, number>();
  if (!text) return emptyHistoricalCsvDataset(source);

  const lines = text.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const comma = line.indexOf(",");
    if (comma < 0) continue;

    const dateStr = line.slice(0, comma).trim().split(" ")[0];
    if (!isIsoDay(dateStr)) continue;

    const rest = line.slice(comma + 1);
    const nextComma = rest.indexOf(",");
    const closeRaw = nextComma < 0 ? rest : rest.slice(0, nextComma);
    const closePrice = parseClosePrice(closeRaw);
    if (closePrice === null) continue;

    prices.set(dateStr, closePrice);
  }

  const dates = [...prices.keys()].sort();
  return {
    prices,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    size: prices.size,
    source,
  };
}

/** True when `dateStr` is on or before the last day present in the dataset. */
export function isCoveredByDataset(dateStr: string, lastDate: string | null): boolean {
  return lastDate != null && dateStr <= lastDate;
}

/**
 * External fallbacks (Bitstamp, etc.) are only legitimate for dates AFTER the
 * last bundled print. An empty dataset must not trigger years of API backfill.
 */
export function needsExternalFallback(dateStr: string, lastDate: string | null): boolean {
  if (!lastDate) return false;
  return dateStr > lastDate;
}

function shiftIsoDay(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Exact date first. If the date sits inside the dataset range but that day is
 * missing, accept a print within `maxDeltaDays` (default 1) so a single hole
 * does not drop a whole cycle. Dates outside the range stay null.
 */
export function lookupHistoricalPrice(
  dataset: HistoricalCsvDataset,
  dateStr: string,
  maxDeltaDays = 1,
): number | null {
  const exact = dataset.prices.get(dateStr);
  if (exact !== undefined) return exact;

  if (!dataset.firstDate || !dataset.lastDate) return null;
  if (dateStr < dataset.firstDate || dateStr > dataset.lastDate) return null;

  for (let delta = 1; delta <= maxDeltaDays; delta++) {
    const before = dataset.prices.get(shiftIsoDay(dateStr, -delta));
    if (before !== undefined) return before;
    const after = dataset.prices.get(shiftIsoDay(dateStr, delta));
    if (after !== undefined) return after;
  }

  return null;
}

export function eachIsoDay(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime()) || current > end) {
    return days;
  }
  while (current <= end) {
    days.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}

export function lookupHistoricalPriceRange(
  dataset: HistoricalCsvDataset,
  startDate: string,
  endDate: string,
): Map<string, number> {
  const result = new Map<string, number>();
  if (!dataset.size) return result;

  for (const dateStr of eachIsoDay(startDate, endDate)) {
    const price = dataset.prices.get(dateStr);
    if (price !== undefined) result.set(dateStr, price);
  }

  return result;
}

/**
 * Inclusive range assessment. Dates after `asOfDay` are not expected and are
 * not counted as missing — a live cycle must not look incomplete because
 * tomorrow has no close yet.
 */
export function assessPriceRange(
  prices: Map<string, number>,
  startDate: string,
  endDate: string,
  source: string,
  asOfDay?: string,
): HistoricalRangeResult {
  const lastExpected = asOfDay && asOfDay < endDate ? asOfDay : endDate;
  const expected = startDate <= lastExpected ? eachIsoDay(startDate, lastExpected) : [];
  const missingDates = expected.filter((d) => !prices.has(d));
  const completeness: Completeness =
    expected.length === 0
      ? prices.size === 0
        ? "empty"
        : "partial"
      : completenessFromCounts(expected.length, expected.length - missingDates.length);

  return {
    data: prices,
    completeness,
    source,
    missingDates,
  };
}
