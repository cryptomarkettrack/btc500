/**
 * Google Analytics 4 Data API client.
 *
 * Reuses the service-account key and token minting from the Search Console
 * tooling. The key's `client_email` must be a Viewer on the GA4 property, and
 * the Google Analytics Data API must be enabled in the Cloud project that owns
 * the key.
 *
 *   scripts/analytics/fetch-ga4.ts --realtime
 *   scripts/analytics/fetch-ga4.ts --days=28
 */
import { ConfigError, getAccessTokenForScope } from "../search-console/client.ts";

export const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const API_BASE = "https://analyticsdata.googleapis.com/v1beta";

/** BTC500's GA4 property (Admin -> Property settings; not the G- measurement id). */
const DEFAULT_PROPERTY_ID = "560440382";

export type DimensionValue = { value?: string };
export type MetricValue = { value?: string };

export type ReportRow = {
  dimensionValues?: DimensionValue[];
  metricValues?: MetricValue[];
};

export type RunReportResponse = {
  rows?: ReportRow[];
  totals?: ReportRow[];
  rowCount?: number;
  metadata?: { currencyCode?: string; timeZone?: string };
};

export type ReportRequest = {
  dateRanges: { startDate: string; endDate: string }[];
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  limit?: number;
  orderBys?: { metric: { metricName: string }; desc?: boolean }[];
  dimensionFilter?: unknown;
};

export type RealtimeRequest = {
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  limit?: number;
};

/** Validate a property id and strip an optional `properties/` prefix. */
export function resolveProperty(explicit?: string): string {
  const id = (explicit ?? process.env.GA4_PROPERTY_ID ?? DEFAULT_PROPERTY_ID).replace(
    /^properties\//u,
    "",
  );
  if (!/^\d+$/u.test(id)) {
    throw new ConfigError(
      `GA4 property id must be numeric (got "${id}").\n` +
        "Use Admin -> Property settings (e.g. 560440382), not the G- measurement id.",
    );
  }
  return id;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessTokenForScope(ANALYTICS_SCOPE);
  const response = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    let detail = text.slice(0, 400);
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string; status?: string } };
      detail = parsed.error?.message ?? detail;
    } catch {
      // Keep the raw body when Google returns HTML (e.g. a wrong property id).
    }
    const hint =
      response.status === 403 && /has not been used|disabled/u.test(detail)
        ? "\nEnable the Google Analytics Data API in the Cloud project that owns the service account."
        : response.status === 403
          ? "\nAdd the service account's client_email as a Viewer in GA4 Admin -> Property access management."
          : "";
    throw new ConfigError(`GA4 request failed (${response.status}): ${detail}${hint}`);
  }
  return JSON.parse(text) as T;
}

export function runReport(propertyId: string, body: ReportRequest): Promise<RunReportResponse> {
  return post<RunReportResponse>(`properties/${propertyId}:runReport`, body);
}

export function runRealtimeReport(
  propertyId: string,
  body: RealtimeRequest,
): Promise<RunReportResponse> {
  return post<RunReportResponse>(`properties/${propertyId}:runRealtimeReport`, body);
}

export function metricValue(row: ReportRow | undefined, index: number): number {
  const raw = row?.metricValues?.[index]?.value;
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

export function dimensionValue(row: ReportRow, index: number): string {
  return row.dimensionValues?.[index]?.value ?? "(not set)";
}
