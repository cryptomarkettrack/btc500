import { createServerFn } from "@tanstack/react-start";

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

const BASE = "https://fapi.binance.com";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function fetchJson<T>(url: string): Promise<T> {
  console.log(`[liquidation] Fetching: ${url}`);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    console.error(`[liquidation] HTTP ${res.status} for ${url}`);
    throw new Error(`Binance API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  console.log(`[liquidation] OK: ${url}`);
  return data as T;
}

async function fetchOpenInterestHist(
  period: string,
  limit: number,
): Promise<OpenInterestHistory[]> {
  return fetchJson(
    `${BASE}/futures/data/openInterestHist?symbol=BTCUSDT&period=${period}&limit=${limit}`,
  );
}

async function fetchGlobalLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  return fetchJson(
    `${BASE}/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
  );
}

async function fetchTopTraderLongShort(period: string, limit: number): Promise<LongShortRatio[]> {
  return fetchJson(
    `${BASE}/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
  );
}

async function fetchFundingRates(limit: number): Promise<FundingRate[]> {
  return fetchJson(`${BASE}/fapi/v1/fundingRate?symbol=BTCUSDT&limit=${limit}`);
}

async function fetchTakerLongShort(period: string, limit: number): Promise<TakerRatio[]> {
  return fetchJson(
    `${BASE}/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=${period}&limit=${limit}`,
  );
}

async function fetchKlines(interval: string, limit: number): Promise<Kline[]> {
  const raw = await fetchJson<any[]>(
    `${BASE}/fapi/v1/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`,
  );
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
  return fetchJson<{ symbol: string; openInterest: string; time: number }>(
    `${BASE}/fapi/v1/openInterest?symbol=BTCUSDT`,
  );
}

// --- Main server function ---

async function fetchLiquidationDataInternal(): Promise<LiquidationData> {
  console.log("[liquidation] Starting data fetch...");
  // Fetch all data in parallel — enough for 30d+ at 4h intervals (180+ candles)
  const [oiHist, globalLS, topLS, funding, taker, klines, currentOI] = await Promise.all([
    fetchOpenInterestHist("4h", 200).catch((e) => {
      console.error("[liquidation] OI hist failed:", e);
      return [] as OpenInterestHistory[];
    }),
    fetchGlobalLongShort("4h", 200).catch((e) => {
      console.error("[liquidation] Global LS failed:", e);
      return [] as LongShortRatio[];
    }),
    fetchTopTraderLongShort("4h", 200).catch((e) => {
      console.error("[liquidation] Top LS failed:", e);
      return [] as LongShortRatio[];
    }),
    fetchFundingRates(200).catch((e) => {
      console.error("[liquidation] Funding failed:", e);
      return [] as FundingRate[];
    }),
    fetchTakerLongShort("4h", 200).catch((e) => {
      console.error("[liquidation] Taker failed:", e);
      return [] as TakerRatio[];
    }),
    fetchKlines("4h", 200).catch((e) => {
      console.error("[liquidation] Klines failed:", e);
      return [] as Kline[];
    }),
    fetchCurrentOI().catch((e) => {
      console.error("[liquidation] Current OI failed:", e);
      return { symbol: "BTCUSDT", openInterest: "0", time: Date.now() };
    }),
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
