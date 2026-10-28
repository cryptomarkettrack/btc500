import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { newestReport, referralLine, referralRows } from "./referral-line.mjs";

const ga4Row = (source, sessions) => ({
  dimensionValues: [{ value: source }],
  metricValues: [{ value: String(sessions) }, { value: "1" }],
});

test("parses the GA4 referral table shape", () => {
  const rows = referralRows([ga4Row("github.com", 7), ga4Row("x.com", 2)]);
  assert.deepEqual(rows, [
    { source: "github.com", sessions: 7 },
    { source: "x.com", sessions: 2 },
  ]);
});

test("ignores rows without a source or a numeric session count", () => {
  const rows = referralRows([
    { dimensionValues: [{ value: "" }], metricValues: [{ value: "3" }] },
    { dimensionValues: [{ value: "reddit.com" }], metricValues: [{ value: "n/a" }] },
    {},
  ]);
  assert.deepEqual(rows, []);
});

test("names every channel the review asks about, including zeros", () => {
  const line = referralLine([]);
  assert.equal(
    line,
    "referrals 7d: github.com 0, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0",
  );
});

test("counts twitter.com and t.co as x.com", () => {
  const line = referralLine([
    { source: "twitter.com", sessions: 1 },
    { source: "t.co", sessions: 2 },
    { source: "X.com", sessions: 4 },
  ]);
  assert.match(line, /x\.com 7/);
});

test("keeps unasked referrers as evidence instead of dropping them", () => {
  const line = referralLine(
    [
      { source: "github.com", sessions: 3 },
      { source: "newsletter.example", sessions: 5 },
      { source: "other.example", sessions: 2 },
    ],
    "2026-10-21 → 2026-10-27",
  );
  assert.equal(
    line,
    "referrals 7d: github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 — other: newsletter.example 5, other.example 2 (window 2026-10-21 → 2026-10-27)",
  );
});

test("reads the newest report in a directory and survives a missing one", () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-referral-"));
  assert.equal(newestReport(dir), null);

  writeFileSync(
    join(dir, "ga4-2026-10-26T07-30-03.json"),
    JSON.stringify({ window: { start: "2026-10-19", end: "2026-10-25" }, tables: {} }),
  );
  writeFileSync(
    join(dir, "ga4-2026-10-27T07-30-04.json"),
    JSON.stringify({
      window: { start: "2026-10-21", end: "2026-10-27" },
      tables: { referrals: [ga4Row("bitcointalk.org", 2)] },
    }),
  );

  const found = newestReport(dir);
  assert.equal(found.report.window.end, "2026-10-27");
  assert.match(referralLine(referralRows(found.report.tables.referrals)), /bitcointalk\.org 2/);

  rmSync(dir, { recursive: true, force: true });
});
