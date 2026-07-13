import { createServerFn } from "@tanstack/react-start";

// --- Retry / timeout configuration ---
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Binance Futures API types ---

interface OpenInterestHistory {
  sumOpenInterest: number;
  sumOpenInterestValue: number;
  timestamp: number;
}

interface LongShortRatio {
  symbol: string;
  longAccount: string;
  longShortRatio: string;
  shortAccount: string;
  timestamp: number;
}

interface FundingRate {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
  markPrice: string;
}

interface TakerRatio {
  buySellRatio: string;
  sellVol: string;
  buyVol: string;
  timestamp: number;
}

interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
}

// --- Combined data type sent to client ---

export interface LiquidationData {
  openInterestHistory: {
    timestamp: number;
    oi: number;
    oiValue: number;
  }[];
  longShortRatios: {
    timestamp: number;
    longRatio: number;
    shortRatio: number;
    ratio: number;
  }[];
  topTraderRatios: {
    timestamp: number;
    longRatio: number;
    shortRatio: number;
    ratio: number;
  }[];
  fundingRates: {
    timestamp: number;
    rate: number;
    markPrice: number;
  }[];
  takerRatios: {
    timestamp: number;
    buyRatio: number;
    sellVolume: number;
    buyVolume: number;
  }[];
  klines: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  currentOI: {
    symbol: string;
    oi: number;
    time: number;
  };
  fetchDate: string;
}

// --- Fetch helpers ---

// Binance mirrors — try all CDN nodes, then fall back to OKX
const BINANCE_MIRRORS = [
  "https://fapi.binance.com",
  "https://fapi1.binance.com",
  "https://fapi2.binance.com",
  "https://fapi3.binance.com",
  "https://fapi4.binance.com",
  "https://fapi5.binance.com",
  "https://fapi6.binance.com",
  "https://fapi7.binance.com",
  "https://fapi8.binance.com",
];

const OKX_BASE = "https://www.okx.com";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

/**
 * Try fetching a single URL with retries and timeout.
 * Returns null on any non-2xx response (instead of throwing).
 */
async function tryFetch<T>(url: string, retries = MAX_RETRIES): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { headers: HEADERS }, FETCH_TIMEOUT_MS);
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[liquidation] Rate limited (429) for ${url}, waiting ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }
      if (!res.ok) {
        console.warn(`[liquidation] HTTP ${res.status} for ${url}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err: any) {
      if (attempt < retries) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }
  return null;
}

/**
 * Try multiple Binance mirrors; return first successful response.
 */
async function tryBinanceMirrors<T>(path: string): Promise<T | null> {
  for (const base of BINANCE_MIRRORS) {
    const data = await tryFetch<T>(`${base}${path}`, 1);
    if (data) return data;
  }
  return null;
}

// ---- Binance fetch helpers ----

async function fetchOpenInterestHist(
  period: string,
  limit: number,
): Promise<OpenInterestHistory[]> {
  return (
    (await tryBinanceMirrors<OpenInterestHistory[]>(
      `/futures/data/openInterestHist?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function fetchGlobalLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  return (
    (await tryBinanceMirrors<LongShortRatio[]>(
      `/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function fetchTopTraderLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  return (
    (await tryBinanceMirrors<LongShortRatio[]>(
      `/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function fetchFundingRates(limit: number): Promise<FundingRate[]> {
  return (
    (await tryBinanceMirrors<FundingRate[]>(
      `/fapi/v1/fundingRate?symbol=BTCUSDT&limit=${limit}`,
    )) ?? []
  );
}

async function fetchTakerLongShort(period: string, limit: number): Promise<TakerRatio[]> {
  return (
    (await tryBinanceMirrors<TakerRatio[]>(
      `/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function fetchKlines(interval: string, limit: number): Promise<Kline[]> {
  const raw = await tryBinanceMirrors<any[]>(
    `/fapi/v1/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`,
  );
  if (!raw) return [];
  return raw.map((k) => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: k[6],
    quoteVolume: parseFloat(k[7]),
    trades: k[8],
  }));
}

async function fetchCurrentOI() {
  const data = await tryBinanceMirrors<{ symbol: string; openInterest: string; time: number }>(
    `/fapi/v1/openInterest?symbol=BTCUSDT`,
  );
  return data ?? { symbol: "BTCUSDT", openInterest: "0", time: Date.now() };
}

// ---- OKX fallback helpers ----

async function okxFetch<T>(url: string): Promise<T | null> {
  return tryFetch<T>(url);
}

async function okxFallbackOI(period: string, limit: number): Promise<OpenInterestHistory[]> {
  const data = await okxFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/open-interest-history?instId=BTC-USDT-SWAP&period=${period}`,
  );
  if (!data || data.code !== "0" || !data.data) return [];
  return data.data.slice(-limit).map((row) => ({
    timestamp: parseInt(row[0]),
    sumOpenInterest: parseFloat(row[1]),
    sumOpenInterestValue: parseFloat(row[1]) * (parseFloat(row[2]) || 100000), // fallback BTC price approx
  }));
}

async function okxFallbackGlobalLS(period: string, limit: number): Promise<LongShortRatio[]> {
  const data = await okxFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=BTC-USDT-SWAP&period=${period}`,
  );
  if (!data || data.code !== "0" || !data.data) return [];
  return data.data.slice(-limit).map((row) => ({
    symbol: "BTCUSDT",
    longAccount: row[1],
    shortAccount: row[2],
    longShortRatio: (parseFloat(row[1]) / parseFloat(row[2])).toString(),
    timestamp: parseInt(row[0]),
  }));
}

async function okxFallbackTopTraderLS(period: string, limit: number): Promise<LongShortRatio[]> {
  const data = await okxFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/long-short-account-ratio/position?instId=BTC-USDT-SWAP&period=${period}`,
  );
  if (!data || data.code !== "0" || !data.data) return [];
  return data.data.slice(-limit).map((row) => ({
    symbol: "BTCUSDT",
    longAccount: row[1],
    shortAccount: row[2],
    longShortRatio: (parseFloat(row[1]) / parseFloat(row[2])).toString(),
    timestamp: parseInt(row[0]),
  }));
}

async function okxFallbackFunding(limit: number): Promise<FundingRate[]> {
  const data = await okxFetch<{
    code: string;
    data: { fundingTime: string; fundingRate: string; fundingRateTimestamp: string }[];
  }>(`${OKX_BASE}/api/v5/rubik/stat/funding-rate?instId=BTC-USDT-SWAP`);
  if (!data || data.code !== "0" || !data.data) return [];
  return data.data.slice(-limit).map((row) => ({
    symbol: "BTCUSDT",
    fundingTime: parseInt(row.fundingTime),
    fundingRate: row.fundingRate,
    markPrice: "0",
  }));
}

async function okxFallbackTaker(period: string, limit: number): Promise<TakerRatio[]> {
  const data = await okxFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/taker-volume-contract?ccy=BTC&instType=CONTRACTS`,
  );
  if (!data || data.code !== "0" || !data.data) return [];
  return data.data.slice(-limit).map((row) => {
    const buyVol = parseFloat(row[1]);
    const sellVol = parseFloat(row[2]);
    const total = buyVol + sellVol;
    return {
      buySellRatio: total > 0 ? (buyVol / total).toString() : "0.5",
      sellVol: row[2],
      buyVol: row[1],
      timestamp: parseInt(row[0]),
    };
  });
}

async function okxFallbackKlines(limit: number): Promise<Kline[]> {
  const data = await okxFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=4H&limit=${Math.min(limit, 300).toString()}`,
  );
  if (!data || data.code !== "0" || !data.data) return [];
  // OKX returns newest-first, reverse for chronological
  return data.data.reverse().map((k) => ({
    openTime: parseInt(k[0]),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: parseInt(k[0]) + 4 * 3600_000 - 1,
    quoteVolume: parseFloat(k[7]),
    trades: parseInt(k[8]),
  }));
}

async function okxFallbackCurrentOI() {
  const data = await okxFetch<{ code: string; data: { instId: string; oi: string; ts: string }[] }>(
    `${OKX_BASE}/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP`,
  );
  if (data?.code === "0" && data.data?.[0]) {
    return {
      symbol: data.data[0].instId,
      openInterest: data.data[0].oi,
      time: parseInt(data.data[0].ts),
    };
  }
  return { symbol: "BTCUSDT", openInterest: "0", time: Date.now() };
}

// ---- Orchestration: Binance → OKX fallback ----

async function getOpenInterestHist(period: string, limit: number): Promise<OpenInterestHistory[]> {
  const binance = await fetchOpenInterestHist(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] All Binance mirrors failed for OI hist, falling back to OKX");
  return okxFallbackOI(period, limit);
}

async function getGlobalLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  const binance = await fetchGlobalLongShort(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] All Binance mirrors failed for global LS, falling back to OKX");
  return okxFallbackGlobalLS(period, limit);
}

async function getTopTraderLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  const binance = await fetchTopTraderLongShort(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] All Binance mirrors failed for top LS, falling back to OKX");
  return okxFallbackTopTraderLS(period, limit);
}

async function getFundingRates(limit: number): Promise<FundingRate[]> {
  const binance = await fetchFundingRates(limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] All Binance mirrors failed for funding, falling back to OKX");
  return okxFallbackFunding(limit);
}

async function getTakerLongShort(period: string, limit: number): Promise<TakerRatio[]> {
  const binance = await fetchTakerLongShort(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] All Binance mirrors failed for taker, falling back to OKX");
  return okxFallbackTaker(period, limit);
}

async function getKlines(interval: string, limit: number): Promise<Kline[]> {
  const binance = await fetchKlines(interval, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] All Binance mirrors failed for klines, falling back to OKX");
  return okxFallbackKlines(limit);
}

async function getCurrentOI() {
  const binance = await fetchCurrentOI();
  if (binance.openInterest !== "0") return binance;
  console.warn("[liquidation] All Binance mirrors failed for current OI, falling back to OKX");
  return okxFallbackCurrentOI();
}

// --- Main server function ---

async function fetchLiquidationDataInternal(): Promise<LiquidationData> {
  console.log("[liquidation] Starting data fetch...");
  // Fetch all data in parallel — enough for 30d+ at 4h intervals (180+ candles)
  const [oiHist, globalLS, topLS, funding, taker, klines, currentOI] = await Promise.all([
    getOpenInterestHist("4h", 200),
    getGlobalLongShort("4h", 200),
    getTopTraderLongShort("4h", 200),
    getFundingRates(200),
    getTakerLongShort("4h", 200),
    getKlines("4h", 200),
    getCurrentOI(),
  ]);
  console.log("[liquidation] All data fetched successfully");

  return {
    openInterestHistory: oiHist.map((d) => ({
      timestamp: d.timestamp,
      oi: d.sumOpenInterest,
      oiValue: d.sumOpenInterestValue,
    })),
    longShortRatios: globalLS.map((d) => ({
      timestamp: d.timestamp,
      longRatio: parseFloat(d.longAccount),
      shortRatio: parseFloat(d.shortAccount),
      ratio: parseFloat(d.longShortRatio),
    })),
    topTraderRatios: topLS.map((d) => ({
      timestamp: d.timestamp,
      longRatio: parseFloat(d.longAccount),
      shortRatio: parseFloat(d.shortAccount),
      ratio: parseFloat(d.longShortRatio),
    })),
    fundingRates: funding.map((d) => ({
      timestamp: d.fundingTime,
      rate: parseFloat(d.fundingRate),
      markPrice: parseFloat(d.markPrice),
    })),
    takerRatios: taker.map((d) => ({
      timestamp: d.timestamp,
      buyRatio: parseFloat(d.buySellRatio),
      sellVolume: parseFloat(d.sellVol),
      buyVolume: parseFloat(d.buyVol),
    })),
    klines: klines.map((k) => ({
      timestamp: k.openTime,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
      volume: k.volume,
    })),
    currentOI: {
      symbol: currentOI.symbol,
      oi: parseFloat(currentOI.openInterest),
      time: currentOI.time,
    },
    fetchDate: new Date().toISOString(),
  };
}

export const getLiquidationData = createServerFn({ method: "GET" }).handler(async () => {
  return fetchLiquidationDataInternal();
});
