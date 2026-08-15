/**
 * Canonical Bitcoin halving schedule and date helpers.
 * Used by simulator, DCA, and timeline server modules.
 */

export interface HalvingEvent {
  date: string;
  block: number;
  label: string;
}

/** Known historical halvings (approximate dates, exact block heights). */
export const HALVINGS: HalvingEvent[] = [
  { date: "2012-11-28", block: 210000, label: "2012 Halving" },
  { date: "2016-07-09", block: 420000, label: "2016 Halving" },
  { date: "2020-05-11", block: 630000, label: "2020 Halving" },
  { date: "2024-04-20", block: 840000, label: "2024 Halving" },
];

/** Add calendar days to a YYYY-MM-DD string and return YYYY-MM-DD (UTC). */
export function addDays(dateStr: string, days: number): string {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T00:00:00Z` : dateStr;
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Parse a YYYY-MM-DD (or ISO) date string to UTC midnight epoch ms. */
export function dateToMs(dateStr: string): number {
  // Prefer explicit UTC midnight for YYYY-MM-DD to avoid TZ drift
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return Date.parse(`${dateStr}T00:00:00Z`);
  }
  return new Date(dateStr).getTime();
}
