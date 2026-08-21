import type { EtfFlowDay } from "./etf-analysis";

export const TFTC_ETF_JSON_URL = "https://www.tftc.io/bitcoin-etf-flows/data.json";

interface TftcPayload {
  name?: unknown;
  attribution?: unknown;
  sources?: unknown;
  license?: unknown;
  url?: unknown;
  updatedThrough?: unknown;
  days?: unknown;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asIsoDay(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function parsePerEtf(value: unknown): Record<string, number> | null {
  if (value == null) return null;
  if (typeof value !== "object") return null;
  const out: Record<string, number> = {};
  for (const [ticker, usd] of Object.entries(value as Record<string, unknown>)) {
    const n = asFiniteNumber(usd);
    if (n == null) continue;
    out[ticker.toUpperCase()] = n;
  }
  return Object.keys(out).length ? out : null;
}

export function parseTftcDay(raw: unknown): EtfFlowDay | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const date = asIsoDay(row.date);
  const netFlowUsd = asFiniteNumber(row.netFlowUsd);
  if (!date || netFlowUsd == null) return null;

  const btcClose = asFiniteNumber(row.btcCloseUsd);
  const aum = asFiniteNumber(row.totalNetAssetsUsd);

  return {
    date,
    netFlowUsd,
    btcCloseUsd: btcClose != null && btcClose > 0 ? btcClose : null,
    totalNetAssetsUsd: aum != null && aum > 0 ? aum : null,
    perEtfUsd: parsePerEtf(row.perEtfUsd),
  };
}

export function parseTftcPayload(raw: unknown): {
  days: EtfFlowDay[];
  attribution: string;
  sources: string;
  license: string;
  sourceUrl: string;
  updatedThrough: string;
} {
  if (!raw || typeof raw !== "object") {
    throw new Error("ETF payload was not an object");
  }
  const payload = raw as TftcPayload;
  if (!Array.isArray(payload.days)) {
    throw new Error("ETF payload missing days[]");
  }

  const days = payload.days
    .map(parseTftcDay)
    .filter((d): d is EtfFlowDay => d != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (days.length < 10) {
    throw new Error(`ETF payload too short (${days.length} days)`);
  }

  const updatedThrough = asIsoDay(payload.updatedThrough) ?? days[days.length - 1]!.date;

  return {
    days,
    attribution:
      typeof payload.attribution === "string" && payload.attribution
        ? payload.attribution
        : "TFTC — tftc.io/bitcoin-etf-flows",
    sources:
      typeof payload.sources === "string" && payload.sources
        ? payload.sources
        : "SoSoValue; Farside Investors",
    license:
      typeof payload.license === "string" && payload.license
        ? payload.license
        : "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl: typeof payload.url === "string" && payload.url ? payload.url : TFTC_ETF_JSON_URL,
    updatedThrough,
  };
}
