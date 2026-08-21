/**
 * Shared number / money / date formatters used across dashboards.
 */

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatUtc(d: Date): string {
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")} UTC`;
}

/** ISO date (YYYY-MM-DD) → "16 Jul 2011" in UTC. */
export function formatIsoDay(iso: string): string {
  const value = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00Z` : iso;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** BTC amount with enough precision to stay readable at any stack size. */
export function formatBtc(n: number): string {
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
  const body = `${abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })} BTC`;
  return n < 0 ? `−${body}` : body;
}

/** Signed BTC: +1,440 BTC / −210 BTC / 0 BTC */
export function formatSignedBtc(n: number): string {
  if (n > 0) return `+${formatBtc(n)}`;
  return formatBtc(n);
}

/** Return multiple: 87,800x / 34.2x / 6.18x */
export function formatMultiple(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 100) return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}x`;
  if (n >= 10) return `${n.toFixed(1)}x`;
  return `${n.toFixed(2)}x`;
}

/** Compact USD: $1.23B / $45.6M / $1.2K / $99 */
export function formatCompactUsd(value: number, options?: { maxFractionDigits?: number }): string {
  const digits = options?.maxFractionDigits;
  const abs = Math.abs(value);
  let body: string;
  if (abs >= 1_000_000_000) {
    body = `$${(abs / 1_000_000_000).toFixed(digits ?? 2)}B`;
  } else if (abs >= 1_000_000) {
    body = `$${(abs / 1_000_000).toFixed(digits ?? 2)}M`;
  } else if (abs >= 1_000) {
    body = `$${(abs / 1_000).toFixed(digits ?? 1)}K`;
  } else {
    body = `$${abs}`;
  }
  if (value < 0) return `−${body}`;
  return body;
}

/** Signed compact USD: +$517.19M / −$144.6M / $0 */
export function formatSignedCompactUsd(
  value: number,
  options?: { maxFractionDigits?: number },
): string {
  if (value > 0) return `+${formatCompactUsd(value, options)}`;
  return formatCompactUsd(value, options);
}

/** Compact plain number: 1.23M / 45.6K / 99 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatPrice(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(v: number, fractionDigits = 2): string {
  return `${(v * 100).toFixed(fractionDigits)}%`;
}

export function formatBps(v: number, fractionDigits = 1): string {
  return `${(v * 10000).toFixed(fractionDigits)} bps`;
}

/** Chart-friendly timestamp: M/D HH:MM */
export function formatChartTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
