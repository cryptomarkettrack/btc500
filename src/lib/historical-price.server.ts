/**
 * Historical BTC prices for simulator / DCA / timeline / cycle-score.
 * Bundled CSV first. Exchange APIs only for dates after the last CSV print.
 *
 * Range lookups return completeness metadata so partial archives cannot be
 * mistaken for a finished dataset.
 */

import { fetchBtcPriceFromBitstamp, fetchBtcPricesFromBitstampRange } from "./bitstamp-fetcher";
import { fetchBtcPriceFromBlockchain } from "./blockchain-price";
import {
  assessPriceRange,
  lookupHistoricalPrice,
  lookupHistoricalPriceRange,
  needsExternalFallback,
  type HistoricalCsvDataset,
  type HistoricalRangeResult,
} from "./historical-csv";
import { loadHistoricalCsvDataset } from "./historical-csv.server";
import { CacheKeys, fetchWithCache, TTL } from "./price-cache";

export async function getHistoricalDataset(): Promise<HistoricalCsvDataset> {
  return loadHistoricalCsvDataset();
}

export async function getBtcPriceFromCsv(dateStr: string): Promise<number | null> {
  try {
    const dataset = await loadHistoricalCsvDataset();
    return lookupHistoricalPrice(dataset, dateStr);
  } catch (err) {
    console.error(`[CSV] Error loading price for ${dateStr}:`, err);
    return null;
  }
}

export async function getBtcPricesFromCsvRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  try {
    const dataset = await loadHistoricalCsvDataset();
    return lookupHistoricalPriceRange(dataset, startDate, endDate);
  } catch (err) {
    console.error("[CSV] Error loading price range:", err);
    return new Map();
  }
}

async function fetchRecentFallbackPrice(dateStr: string): Promise<number | null> {
  try {
    return await fetchWithCache(
      CacheKeys.historicalPrice(dateStr),
      () => fetchBtcPriceFromBitstamp(dateStr),
      { ttl: TTL.HISTORICAL_PRICE, staleWhileRevalidate: false },
    );
  } catch (err) {
    console.error(`[historical-price] Bitstamp fallback failed for ${dateStr}:`, err);
    return null;
  }
}

/**
 * One date: bundled CSV (with a 1-day hole fill), then:
 * - before the first CSV day → last-resort blockchain.info
 * - after the last CSV day → short Bitstamp timeout
 * Dates inside the covered era never hit an exchange.
 */
export async function getHistoricalBtcPrice(dateStr: string): Promise<number | null> {
  const dataset = await loadHistoricalCsvDataset();
  const csvPrice = lookupHistoricalPrice(dataset, dateStr);
  if (csvPrice !== null) return csvPrice;

  if (dataset.firstDate && dateStr < dataset.firstDate) {
    return fetchBtcPriceFromBlockchain(dateStr);
  }

  if (needsExternalFallback(dateStr, dataset.lastDate)) {
    return fetchRecentFallbackPrice(dateStr);
  }

  return null;
}

/**
 * Inclusive date range with completeness metadata.
 * CSV covers the archive; at most one Bitstamp range request fills the tail
 * after the last bundled day. Missing days are listed, never invented.
 */
export async function getHistoricalBtcPricesRange(
  startDate: string,
  endDate: string,
  asOfDay?: string,
): Promise<HistoricalRangeResult> {
  const dataset = await loadHistoricalCsvDataset();
  const result = lookupHistoricalPriceRange(dataset, startDate, endDate);
  const sources = [dataset.source];

  if (needsExternalFallback(endDate, dataset.lastDate)) {
    const tailStart =
      dataset.lastDate && startDate <= dataset.lastDate ? nextIsoDay(dataset.lastDate) : startDate;
    if (tailStart && tailStart <= endDate) {
      try {
        const tail = await fetchWithCache(
          CacheKeys.historicalRange(tailStart, endDate),
          () => fetchBtcPricesFromBitstampRange(tailStart, endDate),
          { ttl: TTL.HISTORICAL_RANGE, staleWhileRevalidate: false },
        );
        let added = 0;
        for (const [date, price] of tail) {
          if (!result.has(date)) {
            result.set(date, price);
            added += 1;
          }
        }
        if (added > 0) sources.push("bitstamp-tail");
      } catch (err) {
        console.error(
          `[historical-price] recent tail ${tailStart}→${endDate} failed; returning CSV-only range:`,
          err,
        );
        sources.push("bitstamp-tail-failed");
      }
    }
  }

  return assessPriceRange(result, startDate, endDate, sources.join("+"), asOfDay);
}

function nextIsoDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
