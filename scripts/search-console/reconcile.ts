/**
 * Reconciliation rules for the Search Console performance report.
 *
 * Why this file exists (review mandate `gsc-report-reconcile`, 2026-10-28):
 * every impressions or pages conclusion since 2026-10-22 was read off a report
 * whose tables did not add up — a 7-day page table with 1 row / 16 impressions
 * against a 28-day table with 11 rows / 135 impressions and a 96 total. The
 * cause is not lost rows, it is two aggregation semantics in one document:
 *
 *   - the totals call uses the API default, `byProperty`, which counts one
 *     impression once for the whole property even when several of our URLs
 *     appeared in the same results page;
 *   - a `page` dimension call cannot use `byProperty` (the API rejects it with
 *     "'BY_PROPERTY' is not a valid aggregation type"), so page rows are
 *     `byPage` and legitimately sum above the property total.
 *
 * Measured on the 2026-09-29 → 2026-10-26 window: property total 25 clicks /
 * 94 impressions, page rows 25 / 133, and the `byPage` totals call returns
 * exactly 25 / 133. So the fix is to fetch both totals under known semantics,
 * print every table's own sum next to them, and refuse to write a report whose
 * arithmetic does not hold.
 *
 * The rules are pure so they can be tested without the API.
 */
import type { SearchAnalyticsRow } from "./client.ts";

export type Sum = { clicks: number; impressions: number };

export type Window = { start: string; end: string; days: number };

export type StoredWindow = {
  end: string;
  days: number;
  propertyImpressions: number;
  propertyClicks: number;
  pageRows: number;
  pages: string[];
  generated?: string;
};

export type ReconciliationInput = {
  window: Window;
  /** `byProperty` total — deduplicated, what Search Console's UI shows. */
  propertyTotal: SearchAnalyticsRow | undefined;
  /** `byPage` total — must equal the sum of the page rows. */
  pageTotal: SearchAnalyticsRow | undefined;
  pages: SearchAnalyticsRow[];
  queries: SearchAnalyticsRow[];
  pairs: SearchAnalyticsRow[];
  /** A stored report for the same end date with a longer window, if any. */
  longerWindow?: StoredWindow | null;
};

export type Derived = {
  value: number;
  /** Which table the value was computed from. */
  from: "pages" | "queries";
  /** The window the table was fetched for. */
  window: Window;
  /** Aggregation used for that table. */
  aggregation: "byPage";
  note?: string;
};

export type Reconciliation = {
  ok: boolean;
  failures: string[];
  warnings: string[];
  sums: { pages: Sum; queries: Sum; pairs: Sum };
  propertyTotal: Sum;
  pageTotal: Sum;
  derived: { pagesWithImpressions: Derived; positions4to20: Derived };
};

const EMPTY: Sum = { clicks: 0, impressions: 0 };

export function sumRows(rows: SearchAnalyticsRow[]): Sum {
  return rows.reduce<Sum>(
    (total, row) => ({
      clicks: total.clicks + (Number(row.clicks) || 0),
      impressions: total.impressions + (Number(row.impressions) || 0),
    }),
    { ...EMPTY },
  );
}

function toSum(row: SearchAnalyticsRow | undefined): Sum {
  if (!row) return { ...EMPTY };
  return {
    clicks: Number(row.clicks) || 0,
    impressions: Number(row.impressions) || 0,
  };
}

/** Rows that actually received impressions — the only ones worth counting. */
export function pagesWithImpressions(pages: SearchAnalyticsRow[]): number {
  return pages.filter((row) => (Number(row.impressions) || 0) > 0).length;
}

/** Queries sitting on page 1–2 (positions 4–20) with at least one impression. */
export function queriesInPositions4to20(queries: SearchAnalyticsRow[]): number {
  return queries.filter((row) => {
    const position = Number(row.position);
    return (
      (Number(row.impressions) || 0) > 0 &&
      Number.isFinite(position) &&
      position >= 4 &&
      position <= 20
    );
  }).length;
}

function pageKeys(rows: SearchAnalyticsRow[]): string[] {
  return rows.map((row) => String(row.keys?.[0] ?? "")).filter(Boolean);
}

/**
 * Check one report against its own totals and, when available, against the
 * longer window for the same end date.
 *
 * Fatal (the caller must not write the report):
 *   - page rows sum above the byPage total, in clicks or impressions;
 *   - query rows sum above the byPage total;
 *   - the byPage total is below the byProperty total (impossible by definition);
 *   - a shorter window reports more impressions or more page rows than the
 *     stored longer window with the same end date;
 *   - a shorter window contains a page URL the longer window does not.
 *
 * Recorded, never fatal: the query table sums below the total because Search
 * Console anonymises rare queries, and a shorter window legitimately contains
 * fewer page rows than a longer one. Making either of those fatal would
 * suppress every report — which is the failure this mandate is fixing, not a
 * fix for it.
 */
export function reconcile(input: ReconciliationInput): Reconciliation {
  const failures: string[] = [];
  const warnings: string[] = [];

  const sums = {
    pages: sumRows(input.pages),
    queries: sumRows(input.queries),
    pairs: sumRows(input.pairs),
  };
  const propertyTotal = toSum(input.propertyTotal);
  const pageTotal = toSum(input.pageTotal);

  if (!input.propertyTotal) {
    failures.push("no byProperty total returned for this window");
  }
  if (!input.pageTotal) {
    failures.push("no byPage total returned for this window");
  }

  if (sums.pages.impressions > pageTotal.impressions) {
    failures.push(
      `page rows sum to ${sums.pages.impressions} impressions, above the byPage total ` +
        `${pageTotal.impressions}`,
    );
  }
  if (sums.pages.clicks > pageTotal.clicks) {
    failures.push(
      `page rows sum to ${sums.pages.clicks} clicks, above the byPage total ` +
        `${pageTotal.clicks}`,
    );
  }
  if (sums.queries.impressions > pageTotal.impressions) {
    failures.push(
      `query rows sum to ${sums.queries.impressions} impressions, above the byPage total ` +
        `${pageTotal.impressions}`,
    );
  }
  if (pageTotal.impressions < propertyTotal.impressions) {
    failures.push(
      `byPage total (${pageTotal.impressions}) is below the byProperty total ` +
        `(${propertyTotal.impressions}); byPage must be the larger of the two`,
    );
  }

  if (sums.pages.impressions < pageTotal.impressions) {
    warnings.push(
      `page rows sum to ${sums.pages.impressions} of ${pageTotal.impressions} impressions — ` +
        "rows were truncated or withheld by the API",
    );
  }
  if (sums.queries.impressions < pageTotal.impressions) {
    warnings.push(
      `query rows sum to ${sums.queries.impressions} of ${pageTotal.impressions} impressions — ` +
        "Search Console anonymises rare queries, so the query table is a floor, not a share",
    );
  }

  const longer = input.longerWindow ?? null;
  if (longer && longer.days > input.window.days) {
    if (propertyTotal.impressions > longer.propertyImpressions) {
      failures.push(
        `this ${input.window.days}-day window reports ${propertyTotal.impressions} impressions, ` +
          `more than the stored ${longer.days}-day window to ${longer.end} ` +
          `(${longer.propertyImpressions}); a subset cannot exceed its superset`,
      );
    }
    if (input.pages.length > longer.pageRows) {
      failures.push(
        `this ${input.window.days}-day window has ${input.pages.length} page rows, more than the ` +
          `stored ${longer.days}-day window to ${longer.end} (${longer.pageRows})`,
      );
    }
    const known = new Set(longer.pages);
    const extra = pageKeys(input.pages).filter((page) => !known.has(page));
    if (extra.length > 0) {
      failures.push(
        `page table contains URLs the ${longer.days}-day window to ${longer.end} does not: ` +
          extra.join(", "),
      );
    }
    if (input.pages.length < longer.pageRows) {
      warnings.push(
        `page table has ${input.pages.length} rows against ${longer.pageRows} in the ` +
          `${longer.days}-day window to ${longer.end} — expected for a shorter window, and not ` +
          "a signal on its own (the 2026-10-28 review read it as one)",
      );
    }
  } else {
    warnings.push(
      "no stored longer window with the same end date — the subset check was skipped " +
        "(`--days=28` before `--days=7` fills it in)",
    );
  }

  const derived = {
    pagesWithImpressions: {
      value: pagesWithImpressions(input.pages),
      from: "pages" as const,
      window: input.window,
      aggregation: "byPage" as const,
    },
    positions4to20: {
      value: queriesInPositions4to20(input.queries),
      from: "queries" as const,
      window: input.window,
      aggregation: "byPage" as const,
      note: "query rows are anonymised, so this is a floor",
    },
  };

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    sums,
    propertyTotal,
    pageTotal,
    derived,
  };
}

/** The record kept between runs so the subset check has something to compare to. */
export function toStoredWindow(
  window: Window,
  reconciliation: Reconciliation,
  pages: SearchAnalyticsRow[],
  generated: string,
): StoredWindow {
  return {
    end: window.end,
    days: window.days,
    propertyImpressions: reconciliation.propertyTotal.impressions,
    propertyClicks: reconciliation.propertyTotal.clicks,
    pageRows: pages.length,
    pages: pageKeys(pages),
    generated,
  };
}

/**
 * Pick the longer window already on record for this end date. Used by the
 * subset check; returns null when nothing longer has been stored yet.
 */
export function findLongerWindow(stored: StoredWindow[], window: Window): StoredWindow | null {
  const candidates = stored.filter((row) => row.end === window.end && row.days > window.days);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, row) => (row.days > best.days ? row : best));
}
