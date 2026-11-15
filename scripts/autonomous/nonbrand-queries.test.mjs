import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  COPY_WORK_INDEX_FLOOR,
  copyFloorLine,
  newestReport,
  nonBrandRows,
  nonBrandTableText,
  readIndexed,
  reportDays,
} from "./nonbrand-queries.mjs";

// Shapes taken from the real 28d report written 2026-11-15T05:00:55Z:
// 4 query rows (one brand), 4 pairs, query rows summing to 23 of 105
// impressions because Search Console anonymises rare queries.
const report28d = {
  window: { start: "2026-10-16", end: "2026-11-12", days: 28, dataState: "all" },
  totals: { clicks: 12, impressions: 61, ctr: 0.1967, position: 14.36 },
  queries: [
    { keys: ["btc500"], clicks: 5, impressions: 19, ctr: 0.263, position: 2.42 },
    {
      keys: ["500 days before next bitcoin halving"],
      clicks: 0,
      impressions: 1,
      ctr: 0,
      position: 38,
    },
    { keys: ["bitcoin 500"], clicks: 0, impressions: 2, ctr: 0, position: 54 },
    { keys: ["btc 500"], clicks: 0, impressions: 1, ctr: 0, position: 63 },
  ],
  pairs: [
    { keys: ["btc500", "https://btc500.net/"], clicks: 5, impressions: 19, position: 2.42 },
    {
      keys: ["500 days before next bitcoin halving", "https://btc500.net/"],
      clicks: 0,
      impressions: 1,
      position: 38,
    },
    { keys: ["bitcoin 500", "https://btc500.net/"], clicks: 0, impressions: 2, position: 54 },
    { keys: ["btc 500", "https://btc500.net/"], clicks: 0, impressions: 1, position: 63 },
  ],
  reconciliation: {
    ok: true,
    warnings: [
      "query rows sum to 23 of 105 impressions — Search Console anonymises rare queries, so the query table is a floor, not a share",
    ],
  },
};

test("drops brand queries using the collector's own rule and keeps the rest", () => {
  const rows = nonBrandRows(report28d);
  assert.deepEqual(
    rows.map((r) => r.query),
    ["bitcoin 500", "500 days before next bitcoin halving"],
  );
  // `btc 500` is a brand query under BRAND_RE (`btc\s*500`) and must not appear
  // in a table titled "non-brand".
  assert.equal(
    rows.some((r) => /^btc 500$/i.test(r.query)),
    false,
  );
});

test("attaches the landing page that carried most impressions for the query", () => {
  const report = {
    ...report28d,
    pairs: [
      { keys: ["bitcoin 500", "https://btc500.net/"], impressions: 1 },
      { keys: ["bitcoin 500", "https://btc500.net/bitcoin-500-day-cycle"], impressions: 2 },
    ],
  };
  const [row] = nonBrandRows(report);
  assert.equal(row.landing, "https://btc500.net/bitcoin-500-day-cycle");
});

test("prints the mandated table shape with its window and the anonymisation note", () => {
  const text = nonBrandTableText(report28d, null);
  assert.match(text, /^non-brand queries 28d \(window 2026-10-16 → 2026-11-12\):/);
  assert.match(text, /query \| clicks \| impressions \| position \| landing page/);
  assert.match(text, /bitcoin 500 \| 0 \| 2 \| 54 \| https:\/\/btc500\.net\//);
  assert.match(text, /500 days before next bitcoin halving \| 0 \| 1 \| 38 \|/);
  assert.match(text, /anonymises rare queries/);
  assert.doesNotMatch(text, /btc500 \|/);
});

test("says 'none visible (anonymised)' rather than 0 when the query table is empty", () => {
  const text = nonBrandTableText(
    {
      window: { start: "2026-10-16", end: "2026-11-12", days: 28 },
      queries: [{ keys: ["btc500"], clicks: 5, impressions: 19, position: 2.4 }],
      pairs: [],
    },
    null,
  );
  assert.match(text, /non-brand queries: none visible in 28d \(anonymised\)/);
  assert.doesNotMatch(text, /non-brand queries: 0$/m);
});

test("the floor line forbids copy work below indexed 5 and permits it at 5", () => {
  assert.equal(COPY_WORK_INDEX_FLOOR, 5);
  const below = copyFloorLine({
    indexed: 1,
    total: 21,
    current: "1/21",
    generated: "2026-11-14T07:33:04.132Z",
  });
  assert.match(below, /none permitted until indexed >= 5 — indexed 1\/21/);
  const at = copyFloorLine({
    indexed: 5,
    total: 21,
    current: "5/21",
    generated: "2026-12-01T00:00:00Z",
  });
  assert.match(at, /permitted — indexed is at or above 5/);
  // Unreadable indexation is said out loud, never assumed.
  assert.match(copyFloorLine(null), /indexed not quoted — no review-input\.json/);
});

test("reads today's indexed level from the collector's own review-input", () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-nonbrand-"));
  assert.equal(readIndexed(dir), null);
  writeFileSync(
    join(dir, "review-input.json"),
    JSON.stringify({
      generated: "2026-11-14T07:33:04.132Z",
      signals: [
        { id: "indexation", current: "1/21" },
        { id: "bing-indexation", current: "0/21" },
      ],
    }),
  );
  const reading = readIndexed(dir);
  assert.equal(reading.indexed, 1);
  assert.equal(reading.total, 21);
  assert.equal(reading.current, "1/21");
  rmSync(dir, { recursive: true, force: true });
});

test("picks the report of the requested window, never by filename alone", () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-nonbrand-dir-"));
  assert.equal(newestReport(dir, { days: 28 }), null);
  // A newer filename carrying a 7-day window: the ordering bug this guards is
  // the one that printed a 28-day report as "referrals 7d".
  writeFileSync(
    join(dir, "performance-2026-11-15T09-00-00.json"),
    JSON.stringify({ window: { start: "2026-11-05", end: "2026-11-11", days: 7 }, queries: [] }),
  );
  writeFileSync(join(dir, "performance-2026-11-15T05-00-55.json"), JSON.stringify(report28d));
  assert.equal(reportDays(newestReport(dir, { days: 28 }).report), 28);
  assert.equal(reportDays(newestReport(dir, { days: 7 }).report), 7);
  rmSync(dir, { recursive: true, force: true });
});
