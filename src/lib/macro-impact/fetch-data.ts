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

// ─── FRED CSV Data Fetching ──────────────────────────────────────────────────
// Uses FRED (Federal Reserve Economic Data) public CSV download.
// No API key required. CPI = CPIAUCSL, PPI = PPIACO.

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

export async function fetchMacroReleases(indicator: MacroIndicator): Promise<MacroRelease[]> {
  const cacheKey = `macro_${indicator}`;
  const cached = getCached<MacroRelease[]>(cacheKey);
  if (cached) return cached;

  const seriesID = FRED_SERIES[indicator];
  const now = new Date();
  const startYear = 2018;
  const endYear = now.getFullYear();

  // FRED CSV URL — no auth required
  // Fetching from 2018 onwards keeps payload small (~100 rows) to avoid timeout
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesID}&cosd=${startYear}-01-01&coed=${endYear}-12-31&fq=Monthly`;

  // Retry up to 2 times on failure
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 BTC500 Macro Dashboard",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`FRED CSV fetch failed: ${response.status}`);
      }

      const csvText = await response.text();
      const releases = parseFRED_Csv(csvText, indicator);

      if (releases.length > 0) {
        setCache(cacheKey, releases);
      }

      return releases;
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.warn(`Retry ${attempt + 1}/${MAX_RETRIES} for ${indicator} FRED fetch...`);
        continue;
      }
      console.error(
        `Error fetching ${indicator} from FRED after ${MAX_RETRIES + 1} attempts:`,
        error,
      );
      throw error;
    }
  }
  // Should never reach here, but TypeScript needs it
  throw new Error(`Failed to fetch ${indicator} from FRED`);
}

// ─── Bitcoin Price Fetching (Binance) ────────────────────────────────────────

const BINANCE_BASE = "https://api.binance.com";
const klineCache = new Map<string, BinanceKline[]>();

export async function fetchBTCMonthlyKlines(year: number, month: number): Promise<BinanceKline[]> {
  const cacheKey = `btc_kline_${year}_${month}`;
  const cached = klineCache.get(cacheKey);
  if (cached) return cached;

  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);

  const url = `${BINANCE_BASE}/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=${start}&endTime=${end}&limit=1000`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
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
