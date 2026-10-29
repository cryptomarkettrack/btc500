import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  findLongerWindow,
  pagesWithImpressions,
  queriesInPositions4to20,
  reconcile,
  sumRows,
  toStoredWindow,
  type ReconciliationInput,
} from "./reconcile.ts";

const WINDOW = { start: "2026-10-20", end: "2026-10-26", days: 7 };

const row = (keys: string[], clicks: number, impressions: number, position = 5) => ({
  keys,
  clicks,
  impressions,
  ctr: impressions === 0 ? 0 : clicks / impressions,
  position,
});

/**
 * The 2026-10-29 reading of btc500.net, trimmed: 25 clicks / 94 impressions by
 * property, 25 / 133 by page, 11 page rows, 5 query rows summing to 47 because
 * Search Console anonymises rare queries.
 */
function realish(overrides: Partial<ReconciliationInput> = {}): ReconciliationInput {
  return {
    window: { start: "2026-09-29", end: "2026-10-26", days: 28 },
    propertyTotal: row([], 25, 94, 11.2),
    pageTotal: row([], 25, 133, 9.1),
    pages: [
      row(["https://btc500.net/"], 25, 92, 11.3),
      row(["https://btc500.net/articles/sec-cancels-regulation-crypto"], 0, 8, 7.3),
      row(["https://btc500.net/articles/solar-eclipse-bitcoin-halving"], 0, 6, 5.5),
      row(["https://btc500.net/articles/strongest-hands"], 0, 5, 2.2),
    ],
    queries: [
      row(["btc500"], 4, 40, 3.2),
      row(["bitcoin 500"], 0, 3, 56.3),
      row(["bitcoin plus 500"], 0, 2, 20.5),
      row(["bitcoin 500 day cycle"], 0, 1, 10.3),
    ],
    pairs: [row(["btc500", "https://btc500.net/"], 4, 40, 3.2)],
    ...overrides,
  };
}

describe("reconcile", () => {
  it("accepts a report whose page rows equal the byPage total", () => {
    const rec = reconcile(realish());
    assert.equal(rec.ok, true, rec.failures.join("; "));
    assert.equal(rec.sums.pages.impressions, 111);
    assert.equal(rec.pageTotal.impressions, 133);
    // Rows are a subset of the total here, which is allowed; the reverse is not.
    assert.equal(rec.sums.pages.impressions > rec.pageTotal.impressions, false);
  });

  it("refuses page rows that sum above the byPage total", () => {
    const rec = reconcile(realish({ pages: [row(["https://btc500.net/"], 25, 200, 11.3)] }));
    assert.equal(rec.ok, false);
    assert.match(rec.failures.join("\n"), /page rows sum to 200 impressions/);
  });

  it("refuses a byPage total below the byProperty total", () => {
    const rec = reconcile(realish({ pageTotal: row([], 25, 80, 9.1) }));
    assert.equal(rec.ok, false);
    assert.match(rec.failures.join("\n"), /below the byProperty total/);
  });

  it("refuses query rows above the byPage total", () => {
    const rec = reconcile(realish({ queries: [row(["btc500"], 4, 400, 3.2)] }));
    assert.equal(rec.ok, false);
    assert.match(rec.failures.join("\n"), /query rows sum to 400 impressions/);
  });

  it("records the anonymisation gap as a note, never as a failure", () => {
    const rec = reconcile(realish());
    assert.equal(rec.ok, true);
    assert.match(rec.warnings.join("\n"), /anonymises rare queries/);
  });

  it("refuses a shorter window that reports more impressions than the longer one", () => {
    const longer = {
      end: "2026-10-26",
      days: 28,
      propertyImpressions: 94,
      propertyClicks: 25,
      pageRows: 11,
      pages: ["https://btc500.net/"],
    };
    const rec = reconcile(
      realish({
        window: WINDOW,
        propertyTotal: row([], 5, 120, 12),
        pageTotal: row([], 5, 120, 12),
        pages: [row(["https://btc500.net/"], 5, 120, 12)],
        longerWindow: longer,
      }),
    );
    assert.equal(rec.ok, false);
    assert.match(rec.failures.join("\n"), /a subset cannot exceed its superset/);
  });

  it("refuses a page table containing URLs the longer window does not have", () => {
    const longer = {
      end: "2026-10-26",
      days: 28,
      propertyImpressions: 94,
      propertyClicks: 25,
      pageRows: 11,
      pages: ["https://btc500.net/"],
    };
    const rec = reconcile(
      realish({
        window: WINDOW,
        propertyTotal: row([], 1, 10, 18),
        pageTotal: row([], 1, 10, 18),
        pages: [row(["https://btc500.net/new-page"], 1, 10, 18)],
        longerWindow: longer,
      }),
    );
    assert.equal(rec.ok, false);
    assert.match(rec.failures.join("\n"), /URLs the 28-day window/);
  });

  it("treats fewer page rows in a shorter window as a note, not a defect", () => {
    const longer = {
      end: "2026-10-26",
      days: 28,
      propertyImpressions: 94,
      propertyClicks: 25,
      pageRows: 11,
      pages: ["https://btc500.net/"],
    };
    const rec = reconcile(
      realish({
        window: WINDOW,
        propertyTotal: row([], 1, 10, 18),
        pageTotal: row([], 1, 10, 18),
        pages: [row(["https://btc500.net/"], 1, 10, 18)],
        queries: [row(["btc500"], 1, 4, 3.5)],
        longerWindow: longer,
      }),
    );
    assert.equal(rec.ok, true, rec.failures.join("; "));
    assert.match(rec.warnings.join("\n"), /expected for a shorter window/);
  });

  it("names the window each derived field was computed from", () => {
    const rec = reconcile(realish());
    assert.equal(rec.derived.pagesWithImpressions.value, 4);
    assert.equal(rec.derived.pagesWithImpressions.from, "pages");
    assert.deepEqual(rec.derived.pagesWithImpressions.window, realish().window);
    assert.equal(rec.derived.positions4to20.value, 1);
    assert.equal(rec.derived.positions4to20.from, "queries");
    assert.match(rec.derived.positions4to20.note ?? "", /floor/);
  });
});

describe("counts", () => {
  it("sums clicks and impressions", () => {
    assert.deepEqual(sumRows([row(["a"], 1, 4), row(["b"], 0, 6)]), {
      clicks: 1,
      impressions: 10,
    });
    assert.deepEqual(sumRows([]), { clicks: 0, impressions: 0 });
  });

  it("counts pages with impressions, not page rows", () => {
    assert.equal(pagesWithImpressions([row(["a"], 0, 3), row(["b"], 0, 0)]), 1);
  });

  it("counts queries in positions 4-20 with at least one impression", () => {
    const queries = [
      row(["a"], 0, 2, 3.9),
      row(["b"], 0, 2, 4),
      row(["c"], 0, 2, 20),
      row(["d"], 0, 2, 20.1),
      row(["e"], 0, 0, 12),
    ];
    assert.equal(queriesInPositions4to20(queries), 2);
  });
});

describe("stored windows", () => {
  const stored = [
    toStoredWindow(
      { start: "2026-09-29", end: "2026-10-26", days: 28 },
      reconcile(realish()),
      realish().pages,
      "2026-10-29T04:00:00.000Z",
    ),
  ];

  it("stores the numbers the subset check compares", () => {
    assert.equal(stored[0].end, "2026-10-26");
    assert.equal(stored[0].propertyImpressions, 94);
    assert.equal(stored[0].pageRows, 4);
    assert.equal(stored[0].pages.length, 4);
  });

  it("finds the longest window on record for the same end date", () => {
    const withLonger = [
      ...stored,
      toStoredWindow(
        { start: "2026-07-29", end: "2026-10-26", days: 90 },
        reconcile(realish()),
        realish().pages,
        "2026-10-29T04:00:00.000Z",
      ),
    ];
    const found = findLongerWindow(withLonger, WINDOW);
    assert.equal(found?.days, 90);
  });

  it("returns null when no longer window shares the end date", () => {
    assert.equal(findLongerWindow(stored, { ...WINDOW, end: "2026-10-25" }), null);
    assert.equal(findLongerWindow(stored, { ...WINDOW, days: 28 }), null);
  });
});
