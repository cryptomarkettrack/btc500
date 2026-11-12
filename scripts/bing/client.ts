/**
 * Shared helpers for the Bing Webmaster Tools API.
 *
 * Bing is the index that feeds Copilot and most answer engines, so it is the
 * one search surface this project cannot afford to be invisible in. Google is
 * measured through Search Console; Bing is measured through this API.
 *
 * Auth is an API key (Bing Webmaster Tools -> Settings -> API Access ->
 * Generate). It is resolved from, in order:
 *   1. $BING_API_KEY
 *   2. .env.local / .env at the project root
 *   3. scripts/bing/api-key.txt (gitignored)
 *
 * Endpoint shapes follow the JSON/HTTP protocol:
 *   GET/POST https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=KEY
 * Responses are OData-ish: { "d": <payload> }.
 *
 * Note: Bing retired the legacy POX/SOAP protocols on 2026-08-31. JSON/HTTP
 * over ssl.bing.com is the supported path; do not reintroduce POX calls.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(SCRIPT_DIR, "../..");
export const OUTPUT_DIR = resolve(SCRIPT_DIR, "output");

const API_BASE = "https://ssl.bing.com/webmaster/api.svc/json";

/** The site as Bing knows it. Override with BING_SITE if the property differs. */
export const DEFAULT_SITE = "https://btc500.net";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** Load `.env.local` / `.env` from the project root if present. */
export function loadDotEnv(): void {
  for (const name of [".env.local", ".env"]) {
    const file = resolve(PROJECT_ROOT, name);
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch {
      // A malformed env file must not stop a read-only report.
    }
  }
}

export function siteUrl(): string {
  const fromEnv = process.env.BING_SITE;
  if (!fromEnv) return DEFAULT_SITE;
  return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
}

function apiKeyFile(): string {
  return resolve(SCRIPT_DIR, "api-key.txt");
}

/** The Bing API key, or null when the account has not been connected yet. */
export function readApiKey(): string | null {
  const fromEnv = process.env.BING_API_KEY;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  const file = apiKeyFile();
  if (existsSync(file)) {
    const value = readFileSync(file, "utf8").trim();
    if (value) return value;
  }
  return null;
}

/** The API key, or a ConfigError explaining exactly what to do about it. */
export function requireApiKey(): string {
  const key = readApiKey();
  if (!key) {
    throw new ConfigError(
      [
        "No Bing Webmaster API key found.",
        "",
        "Setup (see scripts/bing/SETUP.txt for the long version):",
        "  1. Sign in at https://www.bing.com/webmasters",
        "  2. Add and verify btc500.net (the meta tag is already deployed:",
        '     <meta name="msvalidate.01" content="32EF2D70FCF8C7EF70C2E55E1F326804">)',
        "  3. Settings -> API Access -> Generate API Key.",
        "  4. Put it in .env.local at the project root as:",
        "       BING_API_KEY=your-key-here",
        "     or save it to scripts/bing/api-key.txt (gitignored).",
      ].join("\n"),
    );
  }
  return key;
}

type RequestInit2 = {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

/** Call a Bing Webmaster API method and return the `d` payload. */
export async function bingRequest<T = unknown>(
  method: string,
  init: RequestInit2 = {},
): Promise<T> {
  const key = requireApiKey();
  const url = new URL(`${API_BASE}/${method}`);
  url.searchParams.set("apikey", key);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      ...(init.body === undefined ? {} : { "content-type": "application/json; charset=utf-8" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `${method} -> ${response.status} ${response.statusText}\n${text.slice(0, 800)}\n` +
        "If this says 401/403 the API key is wrong or the site is not verified for this account.",
    );
  }

  let parsed: { d?: T } | undefined;
  try {
    parsed = JSON.parse(text) as { d?: T };
  } catch {
    throw new Error(`${method} -> 200 but the body was not JSON:\n${text.slice(0, 400)}`);
  }
  return (parsed.d ?? null) as T;
}

/** Bing serialises .NET dates as "/Date(1316213995266-0700)/". */
export function parseBingDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^\/Date\((-?\d+)([+-]\d{4})?\)\/$/.exec(value.trim());
  if (match) {
    const ms = Number(match[1]);
    if (Number.isFinite(ms)) return new Date(ms).toISOString();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/** Read the first present key from a loosely typed API payload. */
export function pick<T = unknown>(
  row: Record<string, unknown> | null | undefined,
  keys: string[],
): T | undefined {
  if (!row) return undefined;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key] as T;
  }
  return undefined;
}

export function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export type BingUrlInfo = {
  Url: string;
  HttpStatus?: number;
  IsPage?: boolean;
  DocumentSize?: number;
  AnchorCount?: number;
  TotalChildUrlCount?: number;
  DiscoveryDate?: string;
  LastCrawledDate?: string;
};

export type BingKeyword = {
  Query?: string;
  Clicks?: number;
  Impressions?: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
  AvgClickCTR?: number;
};

/** Sitemap URLs from the generated public/sitemap.xml. */
export function sitemapUrls(): { url: string; lastmod: string | null }[] {
  const file = resolve(PROJECT_ROOT, "public", "sitemap.xml");
  const xml = readFileSync(file, "utf8");
  const out: { url: string; lastmod: string | null }[] = [];
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block[1]);
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(block[1]);
    out.push({ url: loc[1].trim(), lastmod: lastmod ? lastmod[1].trim() : null });
  }
  return out;
}

/** Minimal `--flag=value` parser shared by the Bing scripts. */
export function parseFlags(argv: string[]): Map<string, string> {
  const flags = new Map<string, string>();
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      flags.set("_", `${flags.get("_") ?? ""} ${arg}`.trim());
      continue;
    }
    const match = /^--([a-z-]+)(?:=(.*))?$/u.exec(arg);
    if (!match) throw new ConfigError(`Unrecognised argument: ${arg}`);
    flags.set(match[1], match[2] ?? "true");
  }
  return flags;
}
