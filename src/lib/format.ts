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

/** Compact USD: $1.23B / $45.6M / $1.2K / $99 */
export function formatCompactUsd(value: number, options?: { maxFractionDigits?: number }): string {
  const digits = options?.maxFractionDigits;
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(digits ?? 2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(digits ?? 2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(digits ?? 1)}K`;
  }
  return `$${value}`;
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
