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

// --- Source configuration ---

// Binance CDN mirrors — may bypass regional blocks
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

// --- Core fetch helpers ---

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
 * Try all Binance mirrors; return first successful response.
 */
async function tryBinanceMirrors<T>(path: string): Promise<T | null> {
  for (const base of BINANCE_MIRRORS) {
    const data = await tryFetch<T>(`${base}${path}`, 1);
    if (data) return data;
  }
  return null;
}

// ============================================================
// BINANCE data fetchers
// ============================================================

async function binanceOI(period: string, limit: number): Promise<OpenInterestHistory[]> {
  return (
    (await tryBinanceMirrors<OpenInterestHistory[]>(
      `/futures/data/openInterestHist?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function binanceGlobalLS(period: string, limit: number): Promise<LongShortRatio[]> {
  return (
    (await tryBinanceMirrors<LongShortRatio[]>(
      `/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function binanceTopTraderLS(period: string, limit: number): Promise<LongShortRatio[]> {
  return (
    (await tryBinanceMirrors<LongShortRatio[]>(
      `/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function binanceFunding(limit: number): Promise<FundingRate[]> {
  return (
    (await tryBinanceMirrors<FundingRate[]>(
      `/fapi/v1/fundingRate?symbol=BTCUSDT&limit=${limit}`,
    )) ?? []
  );
}

async function binanceTaker(period: string, limit: number): Promise<TakerRatio[]> {
  return (
    (await tryBinanceMirrors<TakerRatio[]>(
      `/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
    )) ?? []
  );
}

async function binanceKlines(interval: string, limit: number): Promise<Kline[]> {
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

async function binanceCurrentOI(): Promise<{
  symbol: string;
  openInterest: string;
  time: number;
} | null> {
  return tryBinanceMirrors<{ symbol: string; openInterest: string; time: number }>(
    `/fapi/v1/openInterest?symbol=BTCUSDT`,
  );
}

// ============================================================
// OKX data fetchers (fallback)
// ============================================================

/**
 * OKX Open Interest History
 * Endpoint: /api/v5/rubik/stat/contracts/open-interest-history
 * Returns: [[timestamp, oi_contracts, oi_btc, oi_usd], ...]
 */
async function okxOI(period: string, limit: number): Promise<OpenInterestHistory[]> {
  // OKX supports 5m, 4H, 1D — we use 4H to match Binance
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/open-interest-history?instId=BTC-USDT-SWAP&period=${period === "4h" ? "4H" : period}`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
  return data.data.slice(-limit).map((row) => ({
    timestamp: parseInt(row[0]),
    sumOpenInterest: parseFloat(row[2] || row[1]), // row[2] = BTC amount
    sumOpenInterestValue: parseFloat(row[3] || "0"), // row[3] = USD value
  }));
}

/**
 * OKX Long/Short Ratio
 * Endpoint: /api/v5/rubik/stat/contracts/long-short-account-ratio
 * Returns: [[timestamp, ratio], ...]
 * Periods: 5m, 1H, 1D
 */
async function okxGlobalLS(_period: string, limit: number): Promise<LongShortRatio[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=BTC-USDT-SWAP&period=1H&ccy=BTC`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
  // OKX only returns ratio, not long/short splits — compute approximate splits
  return data.data.slice(-limit).map((row) => {
    const ratio = parseFloat(row[1]);
    // ratio = longAccounts / shortAccounts
    // longRatio = ratio / (1 + ratio), shortRatio = 1 / (1 + ratio)
    const longRatio = ratio / (1 + ratio);
    const shortRatio = 1 / (1 + ratio);
    return {
      symbol: "BTCUSDT",
      longAccount: longRatio.toFixed(4),
      shortAccount: shortRatio.toFixed(4),
      longShortRatio: row[1],
      timestamp: parseInt(row[0]),
    };
  });
}

/**
 * OKX Top Trader L/S — no direct equivalent on OKX public API.
 * Returns empty array (Binance data only for this metric).
 */
async function okxTopTraderLS(_period: string, _limit: number): Promise<LongShortRatio[]> {
  return [];
}

/**
 * OKX Funding Rate History
 * Endpoint: /api/v5/public/funding-rate-history
 * Returns: { data: [{ fundingRate, fundingTime, ... }, ...] }
 */
async function okxFunding(limit: number): Promise<FundingRate[]> {
  const data = await tryFetch<{
    code: string;
    data: { fundingRate: string; fundingTime: string }[];
  }>(`${OKX_BASE}/api/v5/public/funding-rate-history?instId=BTC-USDT-SWAP&limit=${limit}`);
  if (!data || data.code !== "0" || !data.data?.length) return [];
  return data.data.slice(-limit).map((row) => ({
    symbol: "BTCUSDT",
    fundingTime: parseInt(row.fundingTime),
    fundingRate: row.fundingRate,
    markPrice: "0",
  }));
}

/**
 * OKX Taker Buy/Sell Volume
 * Endpoint: /api/v5/rubik/stat/taker-volume-contract
 * Returns: [[timestamp, buyVol, sellVol], ...]
 */
async function okxTaker(_period: string, limit: number): Promise<TakerRatio[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/taker-volume-contract?instId=BTC-USDT-SWAP&ccy=BTC&instType=CONTRACTS`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
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

/**
 * OKX Klines (candles)
 * Endpoint: /api/v5/market/candles
 * Returns: [[ts, open, high, low, close, vol, volCcy, ...], ...] newest first
 */
async function okxKlines(limit: number): Promise<Kline[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=4H&limit=${Math.min(limit, 300).toString()}`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
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
    trades: 0,
  }));
}

/**
 * OKX Current Open Interest
 * Endpoint: /api/v5/public/open-interest
 */
async function okxCurrentOI(): Promise<{
  symbol: string;
  openInterest: string;
  time: number;
} | null> {
  const data = await tryFetch<{
    code: string;
    data: { instId: string; oi: string; ts: string }[];
  }>(`${OKX_BASE}/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP`);
  if (data?.code === "0" && data.data?.[0]) {
    return {
      symbol: data.data[0].instId,
      openInterest: data.data[0].oi,
      time: parseInt(data.data[0].ts),
    };
  }
  return null;
}

// ============================================================
// Orchestration: try Binance mirrors first, then OKX fallback
// ============================================================

async function getOpenInterestHist(period: string, limit: number): Promise<OpenInterestHistory[]> {
  const binance = await binanceOI(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] Binance OI hist unavailable, using OKX fallback");
  return okxOI(period, limit);
}

async function getGlobalLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  const binance = await binanceGlobalLS(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] Binance global LS unavailable, using OKX fallback");
  return okxGlobalLS(period, limit);
}

async function getTopTraderLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  const binance = await binanceTopTraderLS(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] Binance top trader LS unavailable, using OKX fallback");
  return okxTopTraderLS(period, limit);
}

async function getFundingRates(limit: number): Promise<FundingRate[]> {
  const binance = await binanceFunding(limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] Binance funding unavailable, using OKX fallback");
  return okxFunding(limit);
}

async function getTakerLongShort(period: string, limit: number): Promise<TakerRatio[]> {
  const binance = await binanceTaker(period, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] Binance taker unavailable, using OKX fallback");
  return okxTaker(period, limit);
}

async function getKlines(interval: string, limit: number): Promise<Kline[]> {
  const binance = await binanceKlines(interval, limit);
  if (binance.length > 0) return binance;
  console.warn("[liquidation] Binance klines unavailable, using OKX fallback");
  return okxKlines(limit);
}

async function getCurrentOI() {
  const binance = await binanceCurrentOI();
  if (binance && binance.openInterest !== "0") return binance;
  console.warn("[liquidation] Binance current OI unavailable, using OKX fallback");
  const okx = await okxCurrentOI();
  return okx ?? { symbol: "BTCUSDT", openInterest: "0", time: Date.now() };
}

// ============================================================
// Main server function
// ============================================================

async function fetchLiquidationDataInternal(): Promise<LiquidationData> {
  console.log("[liquidation] Starting data fetch...");
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
