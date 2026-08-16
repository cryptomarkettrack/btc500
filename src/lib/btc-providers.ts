/**
 * Validated parsers and provider runners for live BTC price / block APIs.
 * Pure helpers live here so tests can cover malformed payloads without I/O.
 */

import { z } from "zod";

export const MIN_PLAUSIBLE_BLOCK_HEIGHT = 800_000;
export const MAX_PLAUSIBLE_BLOCK_HEIGHT = 20_000_000;
export const MIN_PLAUSIBLE_BTC_USD = 100;
export const MAX_PLAUSIBLE_BTC_USD = 10_000_000;
/** Bitcoin genesis is 1231006505; reject timestamps outside a wide but finite window. */
const MIN_BLOCK_TIMESTAMP_SEC = 1_231_006_505;
const MAX_BLOCK_TIMESTAMP_SEC = 2_200_000_000;

export function parsePositiveFinite(value: unknown): number | null {
  const n =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function parseBtcUsdPrice(value: unknown): number | null {
  const n = parsePositiveFinite(value);
  if (n === null || n < MIN_PLAUSIBLE_BTC_USD || n > MAX_PLAUSIBLE_BTC_USD) return null;
  return n;
}

export function parseBlockHeight(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < MIN_PLAUSIBLE_BLOCK_HEIGHT || n > MAX_PLAUSIBLE_BLOCK_HEIGHT) {
    return null;
  }
  return n;
}

const blockSummarySchema = z.object({
  height: z.number().int().positive(),
  timestamp: z.number().int().positive(),
});

export function parseBlockSummaries(
  json: unknown,
): Array<{ height: number; timestampSec: number }> {
  if (!Array.isArray(json)) return [];
  const out: Array<{ height: number; timestampSec: number }> = [];
  for (const row of json) {
    const parsed = blockSummarySchema.safeParse(row);
    if (!parsed.success) continue;
    const { height, timestamp } = parsed.data;
    if (timestamp < MIN_BLOCK_TIMESTAMP_SEC || timestamp > MAX_BLOCK_TIMESTAMP_SEC) continue;
    if (height < 1 || height > MAX_PLAUSIBLE_BLOCK_HEIGHT) continue;
    out.push({ height, timestampSec: timestamp });
  }
  return out;
}

const binanceTickerSchema = z.object({ price: z.string() });
const coingeckoSchema = z.object({ bitcoin: z.object({ usd: z.number() }) });
const coinbaseSchema = z.object({ data: z.object({ amount: z.string() }) });
const krakenSchema = z.object({
  result: z.record(z.object({ c: z.array(z.string()).min(1) })),
});

export function parseBinanceBtcUsd(json: unknown): number | null {
  const parsed = binanceTickerSchema.safeParse(json);
  return parsed.success ? parseBtcUsdPrice(parsed.data.price) : null;
}

export function parseCoingeckoBtcUsd(json: unknown): number | null {
  const parsed = coingeckoSchema.safeParse(json);
  return parsed.success ? parseBtcUsdPrice(parsed.data.bitcoin.usd) : null;
}

export function parseCoinbaseBtcUsd(json: unknown): number | null {
  const parsed = coinbaseSchema.safeParse(json);
  return parsed.success ? parseBtcUsdPrice(parsed.data.data.amount) : null;
}

export function parseKrakenBtcUsd(json: unknown): number | null {
  const parsed = krakenSchema.safeParse(json);
  if (!parsed.success) return null;
  const key = Object.keys(parsed.data.result)[0];
  if (!key) return null;
  return parseBtcUsdPrice(parsed.data.result[key]!.c[0]);
}

export interface ProviderAttempt<T> {
  name: string;
  fetch: () => Promise<T>;
}

export async function firstSuccessfulProvider<T>(
  providers: ReadonlyArray<ProviderAttempt<T>>,
  isValid: (value: T) => boolean,
): Promise<{ value: T; provider: string } | null> {
  for (const provider of providers) {
    try {
      const value = await provider.fetch();
      if (isValid(value)) return { value, provider: provider.name };
    } catch {
      // Provider unavailable or malformed — fall through.
    }
  }
  return null;
}

export async function readJsonIfOk(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function readTextIfOk(response: Response): Promise<string> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}
