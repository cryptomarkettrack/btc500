/**
 * Shared authentication and HTTP helpers for the Search Console API.
 *
 * Uses a plain JWT service-account flow over `fetch()` so these scripts stay
 * dependency-free and run directly under Node's native TypeScript stripping
 * (`node scripts/search-console/<script>.ts`). No `googleapis` package needed.
 *
 * Credentials are resolved from, in order:
 *   1. $GSC_CREDENTIALS (path relative to the project root, or absolute)
 *   2. scripts/search-console/credentials.json
 */
import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(SCRIPT_DIR, "../..");
export const OUTPUT_DIR = resolve(SCRIPT_DIR, "output");

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://searchconsole.googleapis.com/";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

/** Thrown for setup problems, so callers can print a clean message without a stack. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export type ServiceAccountKey = {
  client_email: string;
  private_key: string;
};

export type SearchAnalyticsRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/** Load `.env.local` / `.env` from the project root if present. */
export function loadDotEnv(): void {
  for (const name of [".env.local", ".env"]) {
    const file = resolve(PROJECT_ROOT, name);
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch {
      // A malformed env file should not stop a read-only report.
    }
  }
}

function credentialsFile(): string {
  const fromEnv = process.env.GSC_CREDENTIALS;
  if (!fromEnv) return resolve(SCRIPT_DIR, "credentials.json");
  return isAbsolute(fromEnv) ? fromEnv : resolve(PROJECT_ROOT, fromEnv);
}

export function readServiceAccount(): ServiceAccountKey {
  const file = credentialsFile();
  if (!existsSync(file)) {
    throw new ConfigError(
      [
        `No service-account key found at ${file}.`,
        "",
        "Setup (see scripts/search-console/SETUP.txt for the long version):",
        '  1. Enable the "Google Search Console API" in Google Cloud Console.',
        "  2. Create a service account and download a JSON key.",
        "  3. Save it as scripts/search-console/credentials.json",
        "     or set GSC_CREDENTIALS=/path/to/key.json",
        "  4. In Search Console -> Settings -> Users and permissions, add the",
        '     key\'s client_email as a user with "Full" permission.',
      ].join("\n"),
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new ConfigError(`${file} is not valid JSON: ${(error as Error).message}`);
  }

  const key = parsed as Partial<ServiceAccountKey>;
  if (!key.client_email || !key.private_key) {
    throw new ConfigError(`${file} is missing "client_email" or "private_key".`);
  }
  return { client_email: key.client_email, private_key: key.private_key };
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=+$/u, "")
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_");
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessToken(key: ServiceAccountKey, scope: string = SCOPE): Promise<string> {
  const cached = tokenCache.get(scope);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  );

  const signingInput = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const assertion = `${signingInput}.${base64url(signer.sign(key.private_key))}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    const detail = payload.error_description ?? payload.error ?? "unknown error";
    throw new ConfigError(
      `Token exchange failed (${response.status}): ${detail}\n` +
        "Check that the service account key is valid and that its client_email " +
        "has been granted access to the target Google property.",
    );
  }

  const entry = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };
  tokenCache.set(scope, entry);
  return entry.token;
}

/**
 * Mint (or reuse) an OAuth token for any Google API scope using the same
 * service-account key. Used by the GA4 tooling with analytics.readonly.
 */
export async function getAccessTokenForScope(scope: string): Promise<string> {
  return getAccessToken(readServiceAccount(), scope);
}

type RequestInit2 = {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

/** Call the Search Console API. Paths are relative to https://searchconsole.googleapis.com/ */
export async function gscRequest<T>(path: string, init: RequestInit2 = {}): Promise<T> {
  const token = await getAccessToken(readServiceAccount());
  const url = new URL(path.replace(/^\/+/u, ""), API_BASE);

  for (const [key, value] of Object.entries(init.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      authorization: `Bearer ${token}`,
      ...(init.body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${init.method ?? "GET"} ${url.pathname} -> ${response.status}\n${detail}`);
  }

  return (await response.json()) as T;
}

type SiteEntry = { siteUrl: string; permissionLevel?: string };

/**
 * Pick the property to query.
 *
 * Order of preference: $GSC_SITE, then the URL-prefix property for btc500.net
 * (the site verifies via an HTML file, which is a URL-prefix method), then the
 * domain property, then anything matching btc500.net, then a lone property.
 */
export async function resolveSite(explicit?: string): Promise<string> {
  const fromEnv = explicit ?? process.env.GSC_SITE;
  if (fromEnv) return fromEnv;

  const site = "btc500.net";
  const { siteEntry = [] } = await gscRequest<{ siteEntry?: SiteEntry[] }>("webmasters/v3/sites");
  const usable = siteEntry.filter((entry) => entry.permissionLevel !== "siteUnverifiedUser");

  if (usable.length === 0) {
    throw new ConfigError(
      "The service account can see no Search Console properties.\n" +
        "Add its client_email under Settings -> Users and permissions in Search Console, " +
        "or set GSC_SITE=https://btc500.net/ explicitly.",
    );
  }

  const preferred =
    usable.find((entry) => entry.siteUrl.replace(/\/$/u, "") === `https://${site}`) ??
    usable.find((entry) => entry.siteUrl === `sc-domain:${site}`) ??
    usable.find((entry) => entry.siteUrl.includes(site));

  if (preferred) return preferred.siteUrl;
  if (usable.length === 1) return usable[0].siteUrl;

  throw new ConfigError(
    `Found ${usable.length} properties but none match ${site}:\n` +
      usable.map((entry) => `  - ${entry.siteUrl}`).join("\n") +
      "\nSet GSC_SITE to the one you want.",
  );
}

/** Paginate a searchAnalytics query until `maxRows` are collected. */
export async function querySearchAnalytics(
  site: string,
  body: Record<string, unknown>,
  maxRows: number,
): Promise<SearchAnalyticsRow[]> {
  const rowLimit = 25_000;
  const rows: SearchAnalyticsRow[] = [];
  let startRow = 0;

  while (rows.length < maxRows) {
    const page = await gscRequest<{ rows?: SearchAnalyticsRow[] }>(
      `webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
      {
        method: "POST",
        body: { ...body, rowLimit, startRow },
      },
    );

    const batch = page.rows ?? [];
    rows.push(...batch);

    if (batch.length < rowLimit) break;
    startRow += batch.length;
  }

  return rows.slice(0, maxRows);
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** ISO date (YYYY-MM-DD) for `days` before today. */
export function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

/** Shift an ISO date by `delta` days. */
export function shiftDays(iso: string, delta: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new ConfigError(`Invalid date: ${iso}`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** Minimal `--flag=value` parser shared by both scripts. */
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
