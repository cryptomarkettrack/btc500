import type { MacroRelease, MacroIndicator, BinanceKline } from "./types";

// ─── Caching ─────────────────────────────────────────────────────────────────
const dataCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = dataCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown): void {
  dataCache.set(key, { data, timestamp: Date.now() });
}

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[, %]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === "N/A" || cleaned === "---") return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ─── FRED Data Fetching ──────────────────────────────────────────────────────
// Data is pre-fetched locally and stored as public/fred-data.json.
// On the server, we read from the local JSON file.
// Run `bun run fetch-fred` to refresh the data before deploying.

const FRED_SERIES: Record<MacroIndicator, string> = {
  CPI: "CPIAUCSL",
  PPI: "PPIACO",
};

const FRED_RELEASE_DAY: Record<MacroIndicator, number> = {
  CPI: 13,
  PPI: 15,
};

function parseFRED_Csv(csvText: string, indicator: MacroIndicator): MacroRelease[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const values: Array<{ date: string; value: number }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [dateStr, valStr] = line.split(",");
    if (!dateStr || !valStr || valStr === ".") continue;
    const n = parseFloat(valStr);
    if (isNaN(n)) continue;
    values.push({ date: dateStr, value: n });
  }

  // Sort ascending
  values.sort((a, b) => a.date.localeCompare(b.date));

  const releases: MacroRelease[] = [];
  const releaseDay = FRED_RELEASE_DAY[indicator];

  for (let i = 0; i < values.length; i++) {
    const { date: dataDate, value: actual } = values[i];
    const previous = i > 0 ? values[i - 1].value : null;

    // Compute MoM % change
    let actualMoM: number | null = null;
    if (previous !== null && previous !== 0) {
      actualMoM = ((actual - previous) / previous) * 100;
      actualMoM = Math.round(actualMoM * 1000) / 1000;
    }

    let previousMoM: number | null = null;
    if (i > 1) {
      const prevPrev = values[i - 2].value;
      if (prevPrev !== 0) {
        previousMoM = ((previous! - prevPrev) / prevPrev) * 100;
        previousMoM = Math.round(previousMoM * 1000) / 1000;
      }
    }

    // Estimate release date: data for month M released ~13th/15th of M+1
    const [yearStr, monthStr] = dataDate.split("-");
    const dataMonth = parseInt(monthStr, 10);
    const dataYear = parseInt(yearStr, 10);
    const releaseMonth = dataMonth + 1;
    const releaseYear = releaseMonth > 12 ? dataYear + 1 : dataYear;
    const actualMonth = releaseMonth > 12 ? releaseMonth - 12 : releaseMonth;
    const paddedMonth = String(actualMonth).padStart(2, "0");
    const paddedDay = String(releaseDay).padStart(2, "0");
    const releaseDate = `${releaseYear}-${paddedMonth}-${paddedDay}`;

    releases.push({
      date: releaseDate,
      releaseTimeUTC: "12:30",
      indicator,
      actual: actualMoM,
      forecast: previousMoM,
      previous: previousMoM,
    });
  }

  return releases;
}

// Fetch FRED CSV from the web (used by the update script, not the server)
export async function fetchFRED_CsvFromWeb(
  indicator: MacroIndicator,
  startYear: number,
  endYear: number,
): Promise<MacroRelease[]> {
  const seriesID = FRED_SERIES[indicator];
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesID}&cosd=${startYear}-01-01&coed=${endYear}-12-31&fq=Monthly`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 BTC500 Macro Dashboard" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`FRED CSV fetch failed for ${indicator}: ${response.status}`);
  }

  const csvText = await response.text();
  return parseFRED_Csv(csvText, indicator);
}
async function readLocalFREDData(): Promise<Record<MacroIndicator, MacroRelease[]>> {
  const url =
    typeof window === "undefined" ? "https://btc500.vercel.app/fred-data.json" : "/fred-data.json";

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error("fred-data.json not found.");
  }

  return await res.json();
}

export async function fetchMacroReleases(indicator: MacroIndicator): Promise<MacroRelease[]> {
  const cacheKey = `macro_${indicator}`;
  const cached = getCached<MacroRelease[]>(cacheKey);
  if (cached) return cached;

  // Read from local pre-fetched data (works on both local dev and production)
  const allData = await readLocalFREDData();
  const releases = allData[indicator] ?? [];

  if (releases.length > 0) {
    setCache(cacheKey, releases);
  }

  return releases;
}

// ─── Bitcoin Price Fetching (Binance with CSV fallback) ──────────────────────

const BINANCE_BASE = "https://api.binance.com";
const klineCache = new Map<string, BinanceKline[]>();

// ── CSV Fallback Loading ─────────────────────────────────────────────────────

let csvPriceCache: Map<string, number> | null = null;

function parseBtcCsvDate(dateTimeStr: string): string | null {
  // Handle formats like "2013-04-28 00:00:00 UTC" -> "2013-04-28"
  const parts = dateTimeStr.split(" ");
  if (parts.length < 1) return null;
  const dateStr = parts[0];
  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  return dateStr;
}

async function loadBtcCsvData(): Promise<Map<string, number>> {
  if (csvPriceCache) return csvPriceCache;

  console.log("[CSV] Loading BTC price data from CSV...");
  const url = "/btc-usd-max.csv";

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`BTC CSV fetch failed: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.trim().split("\n");
  const priceMap = new Map<string, number>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 2) continue;

    const dateStr = parseBtcCsvDate(parts[0]);
    if (!dateStr) continue;

    const price = parseFloat(parts[1]);
    if (Number.isFinite(price) && price > 0) {
      priceMap.set(dateStr, price);
    }
  }

  console.log(`[CSV] Loaded ${priceMap.size} daily BTC prices`);
  csvPriceCache = priceMap;
  return priceMap;
}

/**
 * Create synthetic hourly klines from daily CSV data.
 * Each hour in a day gets the same close price (the daily close).
 * This provides reasonable granularity for price interpolation around
 * macro release times when Binance API is unavailable.
 */
function createHourlyKlinesFromCsv(
  priceMap: Map<string, number>,
  year: number,
  month: number,
): BinanceKline[] {
  const klines: BinanceKline[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const close = priceMap.get(dateStr);
    if (close === undefined) continue;

    // Create 24 hourly klines for this day, each using the daily close price
    for (let hour = 0; hour < 24; hour++) {
      const openTime = Date.UTC(year, month - 1, day, hour);
      const closeTime = openTime + 3599000; // just under 1 hour in ms
      klines.push({
        openTime,
        open: close,
        high: close,
        low: close,
        close,
        volume: 0,
        closeTime,
        quoteAssetVolume: 0,
        numberOfTrades: 0,
        takerBuyBaseAssetVolume: 0,
        takerBuyQuoteAssetVolume: 0,
      });
    }
  }

  return klines;
}

export async function fetchBTCMonthlyKlines(year: number, month: number): Promise<BinanceKline[]> {
  const cacheKey = `btc_kline_${year}_${month}`;
  const cached = klineCache.get(cacheKey);
  if (cached) return cached;

  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);

  const url = `${BINANCE_BASE}/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=${start}&endTime=${end}&limit=1000`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      console.warn(`[BTC] Binance API error ${response.status} — falling back to CSV`);
      throw new Error(`Binance API error: ${response.status}`);
    }

    const raw: unknown[][] = await response.json();

    const klines: BinanceKline[] = raw.map((k) => ({
      openTime: k[0] as number,
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
      closeTime: k[6] as number,
      quoteAssetVolume: parseFloat(k[7] as string),
      numberOfTrades: k[8] as number,
      takerBuyBaseAssetVolume: parseFloat(k[9] as string),
      takerBuyQuoteAssetVolume: parseFloat(k[10] as string),
    }));

    klineCache.set(cacheKey, klines);
    return klines;
  } catch (error) {
    // Fall back to CSV data when Binance API is unavailable (e.g. geo-blocked 451)
    console.warn(`[BTC] Falling back to CSV for ${year}-${String(month).padStart(2, "0")}`);
    const priceMap = await loadBtcCsvData();
    const csvKlines = createHourlyKlinesFromCsv(priceMap, year, month);

    if (csvKlines.length === 0) {
      console.error(
        `[BTC] CSV has no data for ${year}-${String(month).padStart(2, "0")}, rethrowing`,
      );
      throw error;
    }

    console.log(
      `[BTC] CSV fallback produced ${csvKlines.length} hourly klines for ${year}-${String(month).padStart(2, "0")}`,
    );
    klineCache.set(cacheKey, csvKlines);
    return csvKlines;
  }
}

export async function fetchBTCRange(startDate: Date, endDate: Date): Promise<BinanceKline[]> {
  const allKlines: BinanceKline[] = [];
  const monthsNeeded = new Set<string>();
  const cursor = new Date(startDate);
  cursor.setDate(1);
  const endMonth = new Date(endDate);
  endMonth.setDate(1);

  while (cursor <= endMonth) {
    monthsNeeded.add(`${cursor.getFullYear()}-${cursor.getMonth() + 1}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const promises = Array.from(monthsNeeded).map(async (key) => {
    const [y, m] = key.split("-").map(Number);
    return fetchBTCMonthlyKlines(y, m);
  });

  const results = await Promise.all(promises);
  for (const klines of results) {
    allKlines.push(...klines);
  }

  allKlines.sort((a, b) => a.openTime - b.openTime);
  const deduped: BinanceKline[] = [];
  let lastTime = -1;
  for (const k of allKlines) {
    if (k.openTime !== lastTime) {
      deduped.push(k);
      lastTime = k.openTime;
    }
  }

  return deduped;
}

export function findClosestCandle(
  klines: BinanceKline[],
  targetTimeMs: number,
): BinanceKline | null {
  if (klines.length === 0) return null;

  let lo = 0;
  let hi = klines.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (klines[mid].openTime < targetTimeMs) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  if (lo > 0) {
    const diffLo = Math.abs(klines[lo].openTime - targetTimeMs);
    const diffPrev = Math.abs(klines[lo - 1].openTime - targetTimeMs);
    if (diffPrev < diffLo) return klines[lo - 1];
  }

  return klines[lo];
}

export function interpolatePrice(klines: BinanceKline[], targetTimeMs: number): number | null {
  const candle = findClosestCandle(klines, targetTimeMs);
  if (!candle) return null;

  if (targetTimeMs >= candle.openTime && targetTimeMs <= candle.closeTime) {
    const progress = (targetTimeMs - candle.openTime) / (candle.closeTime - candle.openTime);
    return candle.open + (candle.close - candle.open) * progress;
  }

  return candle.close;
}
