import { createServerFn } from "@tanstack/react-start";
import { fetchWithCache, CacheKeys, TTL } from "./price-cache";
import {
  fetchWithTimeout,
  sleep,
  DEFAULT_MAX_RETRIES,
  DEFAULT_BASE_DELAY_MS,
  DEFAULT_FETCH_TIMEOUT_MS,
  DEFAULT_USER_AGENT,
} from "./http";

// --- Retry / timeout configuration ---
const MAX_RETRIES = DEFAULT_MAX_RETRIES;
const BASE_DELAY_MS = DEFAULT_BASE_DELAY_MS;
const FETCH_TIMEOUT_MS = DEFAULT_FETCH_TIMEOUT_MS;

// --- Binance Futures API types ---

/** Binance returns numeric fields as strings; OKX path parseFloats them. */
interface OpenInterestHistory {
  sumOpenInterest: number | string;
  sumOpenInterestValue: number | string;
  timestamp: number | string;
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

export type DataSourceName = "Binance" | "OKX" | "none";

export interface LiquidationSources {
  openInterest: DataSourceName;
  longShort: DataSourceName;
  topTrader: DataSourceName;
  funding: DataSourceName;
  taker: DataSourceName;
  klines: DataSourceName;
  currentOI: DataSourceName;
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
  /** buyRatio is always buyVol / (buyVol + sellVol) in [0, 1] */
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
    /** Open interest in BTC */
    oi: number;
    /** Open interest notional in USD when available */
    oiValue: number;
    time: number;
  };
  fetchDate: string;
  /** Human-readable primary source summary, e.g. "Binance" or "Mixed (Binance + OKX)" */
  source: string;
  /** Per-metric provenance */
  sources: LiquidationSources;
  /** Public API endpoints used (for attribution UI) */
  endpoints: {
    name: string;
    url: string;
    source: DataSourceName;
  }[];
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
  "User-Agent": DEFAULT_USER_AGENT,
};

// Public docs for attribution (not necessarily the exact path called)
const ENDPOINT_DOCS = {
  binanceOIHist: "https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=4h",
  binanceGlobalLS:
    "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=4h",
  binanceTopLS:
    "https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=4h",
  binanceFunding: "https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT",
  binanceTaker:
    "https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=4h",
  binanceKlines: "https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=4h",
  binanceCurrentOI: "https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT",
  okxOIHist:
    "https://www.okx.com/api/v5/rubik/stat/contracts/open-interest-history?instId=BTC-USDT-SWAP&period=4H",
  okxGlobalLS:
    "https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=BTC-USDT-SWAP&period=1H",
  okxFunding: "https://www.okx.com/api/v5/public/funding-rate-history?instId=BTC-USDT-SWAP",
  okxTaker:
    "https://www.okx.com/api/v5/rubik/stat/taker-volume-contract?instId=BTC-USDT-SWAP&ccy=BTC",
  okxKlines: "https://www.okx.com/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=4H",
  okxCurrentOI:
    "https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP",
} as const;

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
    } catch {
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

function byTimestampAsc<T extends { timestamp: number }>(a: T, b: T): number {
  return a.timestamp - b.timestamp;
}

/**
 * Binance `buySellRatio` is buyVol/sellVol (can be > 1).
 * Normalize to share of total volume in [0, 1].
 */
function buyShareFromVolumes(buyVol: number, sellVol: number, buySellRatio?: number): number {
  const total = buyVol + sellVol;
  if (total > 0 && Number.isFinite(total)) {
    return buyVol / total;
  }
  if (buySellRatio != null && Number.isFinite(buySellRatio) && buySellRatio > 0) {
    return buySellRatio / (1 + buySellRatio);
  }
  return 0.5;
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
  // Binance kline rows: [openTime, o, h, l, c, volume, closeTime, quoteVol, trades, ...]
  const raw = await tryBinanceMirrors<(string | number)[][]>(
    `/fapi/v1/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`,
  );
  if (!raw) return [];
  return raw.map((k) => ({
    openTime: Number(k[0]),
    open: parseFloat(String(k[1])),
    high: parseFloat(String(k[2])),
    low: parseFloat(String(k[3])),
    close: parseFloat(String(k[4])),
    volume: parseFloat(String(k[5])), // base asset (BTC)
    closeTime: Number(k[6]),
    quoteVolume: parseFloat(String(k[7])),
    trades: Number(k[8]),
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
 * Returns: [[timestamp, oi_contracts, oi_btc, oi_usd], ...]
 */
async function okxOI(period: string, limit: number): Promise<OpenInterestHistory[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/open-interest-history?instId=BTC-USDT-SWAP&period=${period === "4h" ? "4H" : period}`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
  return data.data.slice(-limit).map((row) => ({
    timestamp: parseInt(row[0], 10),
    sumOpenInterest: parseFloat(row[2] || row[1]), // BTC amount
    sumOpenInterestValue: parseFloat(row[3] || "0"), // USD value
  }));
}

/**
 * OKX Long/Short Ratio
 * Returns: [[timestamp, ratio], ...]
 * Periods: 5m, 1H, 1D
 */
async function okxGlobalLS(_period: string, limit: number): Promise<LongShortRatio[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=BTC-USDT-SWAP&period=1H&ccy=BTC`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
  return data.data.slice(-limit).map((row) => {
    const ratio = parseFloat(row[1]);
    const longRatio = ratio / (1 + ratio);
    const shortRatio = 1 / (1 + ratio);
    return {
      symbol: "BTCUSDT",
      longAccount: longRatio.toFixed(4),
      shortAccount: shortRatio.toFixed(4),
      longShortRatio: row[1],
      timestamp: parseInt(row[0], 10),
    };
  });
}

/** OKX has no public top-trader L/S equivalent. */
async function okxTopTraderLS(_period: string, _limit: number): Promise<LongShortRatio[]> {
  return [];
}

/**
 * OKX Funding Rate History
 * Returns newest-first.
 */
async function okxFunding(limit: number): Promise<FundingRate[]> {
  const data = await tryFetch<{
    code: string;
    data: { fundingRate: string; fundingTime: string }[];
  }>(`${OKX_BASE}/api/v5/public/funding-rate-history?instId=BTC-USDT-SWAP&limit=${limit}`);
  if (!data || data.code !== "0" || !data.data?.length) return [];
  return data.data
    .slice(0, limit)
    .map((row) => ({
      symbol: "BTCUSDT",
      fundingTime: parseInt(row.fundingTime, 10),
      fundingRate: row.fundingRate,
      markPrice: "0",
    }))
    .sort((a, b) => a.fundingTime - b.fundingTime);
}

/**
 * OKX Taker Buy/Sell Volume
 * Returns: [[timestamp, buyVol, sellVol], ...] in BTC
 */
async function okxTaker(_period: string, limit: number): Promise<TakerRatio[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/rubik/stat/taker-volume-contract?instId=BTC-USDT-SWAP&ccy=BTC&instType=CONTRACTS`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
  // OKX returns newest-first; reverse then take last `limit` chronologically
  const chronological = [...data.data].reverse().slice(-limit);
  return chronological.map((row) => {
    const buyVol = parseFloat(row[1]);
    const sellVol = parseFloat(row[2]);
    const share = buyShareFromVolumes(buyVol, sellVol);
    return {
      buySellRatio: share.toString(),
      sellVol: row[2],
      buyVol: row[1],
      timestamp: parseInt(row[0], 10),
    };
  });
}

/**
 * OKX Klines (candles)
 * [ts, open, high, low, close, vol(contracts), volCcy(BTC), volCcyQuote(USD), confirm]
 * Newest first.
 */
async function okxKlines(limit: number): Promise<Kline[]> {
  const data = await tryFetch<{ code: string; data: string[][] }>(
    `${OKX_BASE}/api/v5/market/candles?instId=BTC-USDT-SWAP&bar=4H&limit=${Math.min(limit, 300).toString()}`,
  );
  if (!data || data.code !== "0" || !data.data?.length) return [];
  return data.data.reverse().map((k) => ({
    openTime: parseInt(k[0], 10),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    // Prefer BTC base volume (volCcy) so it matches Binance units
    volume: parseFloat(k[6] || k[5]),
    closeTime: parseInt(k[0], 10) + 4 * 3600_000 - 1,
    quoteVolume: parseFloat(k[7] || "0"),
    trades: 0,
  }));
}

/**
 * OKX Current Open Interest
 * oi = contracts, oiCcy = BTC, oiUsd = USD
 */
async function okxCurrentOI(): Promise<{
  symbol: string;
  openInterest: string;
  oiUsd: string;
  time: number;
} | null> {
  const data = await tryFetch<{
    code: string;
    data: { instId: string; oi: string; oiCcy?: string; oiUsd?: string; ts: string }[];
  }>(`${OKX_BASE}/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP`);
  if (data?.code === "0" && data.data?.[0]) {
    const row = data.data[0];
    // Prefer oiCcy (BTC amount); oi is contract count (~100× larger for BTC-USDT-SWAP)
    return {
      symbol: row.instId,
      openInterest: row.oiCcy || row.oi,
      oiUsd: row.oiUsd || "0",
      time: parseInt(row.ts, 10),
    };
  }
  return null;
}

// ============================================================
// Orchestration: try Binance mirrors first, then OKX fallback
// ============================================================

async function getOpenInterestHist(
  period: string,
  limit: number,
): Promise<{ data: OpenInterestHistory[]; source: DataSourceName }> {
  const binance = await binanceOI(period, limit);
  if (binance.length > 0) return { data: binance, source: "Binance" };
  console.warn("[liquidation] Binance OI hist unavailable, using OKX fallback");
  const okx = await okxOI(period, limit);
  return { data: okx, source: okx.length > 0 ? "OKX" : "none" };
}

async function getGlobalLongShort(
  period: string,
  limit: number,
): Promise<{ data: LongShortRatio[]; source: DataSourceName }> {
  const binance = await binanceGlobalLS(period, limit);
  if (binance.length > 0) return { data: binance, source: "Binance" };
  console.warn("[liquidation] Binance global LS unavailable, using OKX fallback");
  const okx = await okxGlobalLS(period, limit);
  return { data: okx, source: okx.length > 0 ? "OKX" : "none" };
}

async function getTopTraderLongShort(
  period: string,
  limit: number,
): Promise<{ data: LongShortRatio[]; source: DataSourceName }> {
  const binance = await binanceTopTraderLS(period, limit);
  if (binance.length > 0) return { data: binance, source: "Binance" };
  console.warn("[liquidation] Binance top trader LS unavailable, using OKX fallback");
  const okx = await okxTopTraderLS(period, limit);
  return { data: okx, source: okx.length > 0 ? "OKX" : "none" };
}

async function getFundingRates(
  limit: number,
): Promise<{ data: FundingRate[]; source: DataSourceName }> {
  const binance = await binanceFunding(limit);
  if (binance.length > 0) return { data: binance, source: "Binance" };
  console.warn("[liquidation] Binance funding unavailable, using OKX fallback");
  const okx = await okxFunding(limit);
  return { data: okx, source: okx.length > 0 ? "OKX" : "none" };
}

async function getTakerLongShort(
  period: string,
  limit: number,
): Promise<{ data: TakerRatio[]; source: DataSourceName }> {
  const binance = await binanceTaker(period, limit);
  if (binance.length > 0) return { data: binance, source: "Binance" };
  console.warn("[liquidation] Binance taker unavailable, using OKX fallback");
  const okx = await okxTaker(period, limit);
  return { data: okx, source: okx.length > 0 ? "OKX" : "none" };
}

async function getKlines(
  interval: string,
  limit: number,
): Promise<{ data: Kline[]; source: DataSourceName }> {
  const binance = await binanceKlines(interval, limit);
  if (binance.length > 0) return { data: binance, source: "Binance" };
  console.warn("[liquidation] Binance klines unavailable, using OKX fallback");
  const okx = await okxKlines(limit);
  return { data: okx, source: okx.length > 0 ? "OKX" : "none" };
}

async function getCurrentOI(): Promise<{
  data: { symbol: string; openInterest: string; oiUsd: string; time: number };
  source: DataSourceName;
}> {
  const binance = await binanceCurrentOI();
  if (binance && binance.openInterest !== "0") {
    return {
      data: {
        symbol: binance.symbol,
        openInterest: binance.openInterest,
        oiUsd: "0",
        time: binance.time,
      },
      source: "Binance",
    };
  }
  console.warn("[liquidation] Binance current OI unavailable, using OKX fallback");
  const okx = await okxCurrentOI();
  if (okx) return { data: okx, source: "OKX" };
  return {
    data: { symbol: "BTCUSDT", openInterest: "0", oiUsd: "0", time: Date.now() },
    source: "none",
  };
}

function summarizeSource(sources: LiquidationSources): string {
  const values = Object.values(sources).filter((s) => s !== "none");
  const unique = [...new Set(values)];
  if (unique.length === 0) return "Unavailable";
  if (unique.length === 1) return unique[0];
  return `Mixed (${unique.join(" + ")})`;
}

function buildEndpoints(sources: LiquidationSources) {
  const rows: { name: string; url: string; source: DataSourceName }[] = [];
  const push = (name: string, source: DataSourceName, binanceUrl: string, okxUrl: string) => {
    if (source === "none") return;
    rows.push({
      name,
      source,
      url: source === "OKX" ? okxUrl : binanceUrl,
    });
  };
  push(
    "Open Interest History",
    sources.openInterest,
    ENDPOINT_DOCS.binanceOIHist,
    ENDPOINT_DOCS.okxOIHist,
  );
  push(
    "Global Long/Short Ratio",
    sources.longShort,
    ENDPOINT_DOCS.binanceGlobalLS,
    ENDPOINT_DOCS.okxGlobalLS,
  );
  push(
    "Top Trader L/S Ratio",
    sources.topTrader,
    ENDPOINT_DOCS.binanceTopLS,
    ENDPOINT_DOCS.okxGlobalLS,
  );
  push("Funding Rate", sources.funding, ENDPOINT_DOCS.binanceFunding, ENDPOINT_DOCS.okxFunding);
  push("Taker Buy/Sell Volume", sources.taker, ENDPOINT_DOCS.binanceTaker, ENDPOINT_DOCS.okxTaker);
  push("Price Klines (4h)", sources.klines, ENDPOINT_DOCS.binanceKlines, ENDPOINT_DOCS.okxKlines);
  push(
    "Current Open Interest",
    sources.currentOI,
    ENDPOINT_DOCS.binanceCurrentOI,
    ENDPOINT_DOCS.okxCurrentOI,
  );
  return rows;
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

  const sources: LiquidationSources = {
    openInterest: oiHist.source,
    longShort: globalLS.source,
    topTrader: topLS.source,
    funding: funding.source,
    taker: taker.source,
    klines: klines.source,
    currentOI: currentOI.source,
  };

  // Binance openInterestHist returns sumOpenInterest* as strings — coerce or chart
  // points become null (Number.isFinite rejects numeric strings).
  const openInterestHistory = oiHist.data
    .map((d) => ({
      timestamp: Number(d.timestamp),
      oi: parseFloat(String(d.sumOpenInterest)),
      oiValue: parseFloat(String(d.sumOpenInterestValue || "0")),
    }))
    .filter((d) => Number.isFinite(d.timestamp) && Number.isFinite(d.oi))
    .sort(byTimestampAsc);

  const longShortRatios = globalLS.data
    .map((d) => ({
      timestamp: d.timestamp,
      longRatio: parseFloat(d.longAccount),
      shortRatio: parseFloat(d.shortAccount),
      ratio: parseFloat(d.longShortRatio),
    }))
    .sort(byTimestampAsc);

  const topTraderRatios = topLS.data
    .map((d) => ({
      timestamp: d.timestamp,
      longRatio: parseFloat(d.longAccount),
      shortRatio: parseFloat(d.shortAccount),
      ratio: parseFloat(d.longShortRatio),
    }))
    .sort(byTimestampAsc);

  const fundingRates = funding.data
    .map((d) => ({
      timestamp: d.fundingTime,
      rate: parseFloat(d.fundingRate),
      markPrice: parseFloat(d.markPrice || "0"),
    }))
    .sort(byTimestampAsc);

  // Normalize taker buy ratio to [0, 1] share of volume (Binance API gives buy/sell ratio)
  const takerRatios = taker.data
    .map((d) => {
      const buyVolume = parseFloat(d.buyVol);
      const sellVolume = parseFloat(d.sellVol);
      const rawRatio = parseFloat(d.buySellRatio);
      return {
        timestamp: d.timestamp,
        buyRatio: buyShareFromVolumes(buyVolume, sellVolume, rawRatio),
        sellVolume,
        buyVolume,
      };
    })
    .sort(byTimestampAsc);

  const mappedKlines = klines.data
    .map((k) => ({
      timestamp: k.openTime,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
      volume: k.volume,
    }))
    .sort(byTimestampAsc);

  const oiBtc = parseFloat(currentOI.data.openInterest);
  let oiValue = parseFloat(currentOI.data.oiUsd || "0");
  if (!oiValue || !Number.isFinite(oiValue)) {
    // Prefer latest OI hist USD value; else estimate from last close
    const latestHist = openInterestHistory[openInterestHistory.length - 1];
    if (latestHist?.oiValue) {
      oiValue = latestHist.oiValue;
    } else {
      const lastClose = mappedKlines[mappedKlines.length - 1]?.close ?? 0;
      oiValue = oiBtc * lastClose;
    }
  }

  return {
    openInterestHistory,
    longShortRatios,
    topTraderRatios,
    fundingRates,
    takerRatios,
    klines: mappedKlines,
    currentOI: {
      symbol: currentOI.data.symbol,
      oi: oiBtc,
      oiValue,
      time: currentOI.data.time,
    },
    fetchDate: new Date().toISOString(),
    source: summarizeSource(sources),
    sources,
    endpoints: buildEndpoints(sources),
  };
}

export const getLiquidationData = createServerFn({ method: "GET" }).handler(async () => {
  return fetchWithCache(CacheKeys.liquidation(), () => fetchLiquidationDataInternal(), {
    ttl: TTL.LIQUIDATION,
    staleWhileRevalidate: true,
  });
});
