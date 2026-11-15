import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  externalAudienceLine,
  namedSourceRows,
  namedSourcesLine,
  newestReport,
  referralLine,
  referralRows,
  reportDays,
} from "./referral-line.mjs";

const ga4Row = (source, sessions) => ({
  dimensionValues: [{ value: source }],
  metricValues: [{ value: String(sessions) }, { value: "1" }],
});

const window7d = { start: "2026-10-27", end: "2026-11-02", days: 7 };
const window28d = { start: "2026-10-06", end: "2026-11-02", days: 28 };

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
  const line = referralLine([], window7d);
  assert.equal(
    line,
    "referrals 7d: github.com 0, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-10-27 → 2026-11-02)",
  );
});

test("counts twitter.com and t.co as x.com", () => {
  const line = referralLine(
    [
      { source: "twitter.com", sessions: 1 },
      { source: "t.co", sessions: 2 },
      { source: "X.com", sessions: 4 },
    ],
    window7d,
  );
  assert.match(line, /x\.com 7/);
});

test("keeps unasked referrers as evidence instead of dropping them", () => {
  const line = referralLine(
    [
      { source: "github.com", sessions: 3 },
      { source: "newsletter.example", sessions: 5 },
      { source: "other.example", sessions: 2 },
    ],
    { start: "2026-10-21", end: "2026-10-27", days: 7 },
  );
  assert.equal(
    line,
    "referrals 7d: github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 — other: newsletter.example 5, other.example 2 (window 2026-10-21 → 2026-10-27)",
  );
});

test("labels a 28-day report as 28d, never as 7d", () => {
  const line = referralLine([{ source: "github.com", sessions: 15 }], window28d);
  assert.match(line, /^referrals 28d: github\.com 15/);
  assert.doesNotMatch(line, /referrals 7d/);
});

test("derives the window from the report's dates when it does not state days", () => {
  assert.equal(reportDays({ window: { start: "2026-10-27", end: "2026-11-02" } }), 7);
  assert.equal(reportDays({ window: { start: "2026-10-06", end: "2026-11-02" } }), 28);
  assert.equal(reportDays({}), null);
  assert.equal(
    referralLine([], { start: "2026-10-27", end: "2026-11-02" }),
    "referrals 7d: github.com 0, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-10-27 → 2026-11-02)",
  );
});

test("says 'window unknown' rather than guessing 7d", () => {
  assert.match(referralLine([]), /^referrals \(window unknown\):/);
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
  assert.match(
    referralLine(referralRows(found.report.tables.referrals), found.report.window),
    /bitcointalk\.org 2/,
  );

  rmSync(dir, { recursive: true, force: true });
});

test("regression: a 28-day report generated after the 7-day one cannot print as referrals 7d", () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-referral-regression-"));
  // The 7-day report is generated first, the 28-day report second, so filename
  // order picks the 28-day one — the exact ordering that produced "15 github
  // sessions" under a 7-day label on 2026-11-02.
  writeFileSync(
    join(dir, "ga4-2026-11-02T04-02-50.json"),
    JSON.stringify({
      window: window7d,
      tables: { referrals: [ga4Row("github.com", 12)] },
    }),
  );
  writeFileSync(
    join(dir, "ga4-2026-11-02T04-02-55.json"),
    JSON.stringify({
      window: window28d,
      tables: { referrals: [ga4Row("github.com", 15)] },
    }),
  );
  // The copy the runner leaves behind is the last report written — the 28-day one.
  writeFileSync(
    join(dir, "ga4-latest.json"),
    JSON.stringify({ window: window28d, tables: { referrals: [ga4Row("github.com", 15)] } }),
  );

  const seven = newestReport(dir, { days: 7 });
  assert.equal(seven.report.window.days, 7);
  const sevenLine = referralLine(referralRows(seven.report.tables.referrals), seven.report.window);
  assert.match(sevenLine, /^referrals 7d: github\.com 12/);
  assert.doesNotMatch(sevenLine, /github\.com 15/);

  const twentyEight = newestReport(dir, { days: 28 });
  const twentyEightLine = referralLine(
    referralRows(twentyEight.report.tables.referrals),
    twentyEight.report.window,
  );
  assert.match(twentyEightLine, /^referrals 28d: github\.com 15/);

  // Without a filter the newest *window* wins, and its own label follows it.
  const newest = newestReport(dir);
  assert.match(
    referralLine(referralRows(newest.report.tables.referrals), newest.report.window),
    /^referrals 28d:/,
  );

  rmSync(dir, { recursive: true, force: true });
});

// --- named sources (mandate named-source-ledger-1113) -----------------------
//
// The Referral table cannot see t.co, facebook.com or chatgpt.com: GA4 files
// them under Organic Social and AI Assistant. 21 readings printed "0 named
// non-github referral sessions" while nine of them were in the same window.

const namedRow = (channel, source, landing, sessions, users) => ({
  dimensionValues: [{ value: channel }, { value: source }, { value: landing }],
  metricValues: [{ value: String(sessions) }, { value: String(users) }],
});

test("named sources counts a source filed under Organic Social (the regression)", () => {
  const rows = namedSourceRows([
    namedRow("Organic Social", "t.co", "/", 3, 3),
    namedRow("Organic Social", "facebook.com", "/", 6, 6),
    namedRow("AI Assistant", "chatgpt.com", "/bitcoin-500-day-cycle", 2, 2),
    namedRow("Referral", "github.com", "/", 8, 1),
    namedRow("Direct", "(direct)", "/", 70, 16),
  ]);
  const line = namedSourcesLine(rows, window7d);
  assert.match(line, /^named sources 7d:/);
  assert.match(line, /t\.co 3\/3 → \//);
  assert.match(line, /facebook\.com 6\/6 → \//);
  assert.match(line, /chatgpt\.com 2\/2 → \/bitcoin-500-day-cycle/);
  assert.doesNotMatch(line, /github\.com/);
  assert.doesNotMatch(line, /\(direct\)/);
});

test("named sources keeps the landing page that carried most sessions", () => {
  const line = namedSourcesLine(
    namedSourceRows([
      namedRow("Organic Social", "t.co", "/bitcoin-500-day-cycle", 2, 2),
      namedRow("Organic Social", "t.co", "/", 5, 5),
    ]),
    window7d,
  );
  assert.match(line, /t\.co 7\/7 → \//);
});

test("named sources says none instead of printing an empty list", () => {
  assert.equal(
    namedSourcesLine([], window7d),
    "named sources 7d: none outside Direct and github.com (window 2026-10-27 → 2026-11-02)",
  );
  assert.match(
    namedSourcesLine(namedSourceRows([namedRow("Referral", "github.com", "/", 8, 1)]), window7d),
    /none outside Direct and github\.com/,
  );
});

test("named sources carries the report's own window label", () => {
  const line = namedSourcesLine(
    namedSourceRows([namedRow("Organic Social", "t.co", "/", 1, 1)]),
    window28d,
  );
  assert.match(line, /^named sources 28d:/);
  assert.match(line, /\(window 2026-10-06 → 2026-11-02\)$/);
});

// --- external audience (mandate external-audience-line-1114) -----------------
//
// The 2026-11-14 review made this the headline: 108 sessions read as growth
// until it is split into Direct 79/17 and github.com 8/1. The line must print
// sessions AND users, and must never let Direct or github.com inflate it.

const externalRow = namedRow;

const reviewWindowRows = () =>
  namedSourceRows([
    externalRow("Direct", "(direct)", "/", 54, 12),
    externalRow("Direct", "(direct)", "/bitcoin-500-day-cycle", 20, 2),
    externalRow("Direct", "(direct)", "/halving-dates", 5, 3),
    externalRow("Referral", "github.com", "/", 8, 1),
    externalRow("Organic Social", "facebook.com", "/", 6, 6),
    externalRow("Organic Social", "t.co", "/", 3, 3),
    externalRow("Organic Social", "x", "/bitcoin-500-day-cycle", 2, 2),
    externalRow("Organic Search", "google", "/", 5, 2),
    externalRow("AI Assistant", "chatgpt.com", "/bitcoin-500-day-cycle", 2, 2),
    externalRow("Referral", "bitcointalk.org", "/bitcoin-500-day-cycle", 1, 1),
    externalRow("Unassigned", "(not set)", "/", 3, 3),
  ]);

test("external audience reproduces the review's 19 sessions / 16 users baseline", () => {
  const line = externalAudienceLine(reviewWindowRows(), {
    start: "2026-11-07",
    end: "2026-11-13",
    days: 7,
  });
  assert.equal(
    line,
    'external audience 7d: 19 sessions / 16 users (facebook.com 6/6 → /, google 5/2 → /, t.co 3/3 → /, chatgpt.com 2/2 → /bitcoin-500-day-cycle, x 2/2 → /bitcoin-500-day-cycle, bitcointalk.org 1/1 → /bitcoin-500-day-cycle) (window 2026-11-07 → 2026-11-13) — unattributed 3 sessions / 3 users ("(not set)")',
  );
});

test("external audience never omits the user count and never counts Direct or github.com", () => {
  const line = externalAudienceLine(reviewWindowRows(), window7d);
  // A line without users is the defect this mandate exists to fix.
  assert.match(line, /^\w[\w ]* \d+d: \d+ sessions \/ \d+ users \(/);
  assert.match(line, /\d+ sessions \/ \d+ users/);
  assert.doesNotMatch(line, /direct/i);
  assert.doesNotMatch(line, /github\.com/);
  // The two inflated sources are 79 sessions; a line that included them could
  // not read 19.
  assert.match(line, /19 sessions \/ 16 users/);
});

test("external audience reports unattributed sessions separately instead of dropping them", () => {
  const line = externalAudienceLine(
    namedSourceRows([
      externalRow("Organic Social", "facebook.com", "/", 6, 6),
      externalRow("Unassigned", "(not set)", "/", 3, 3),
    ]),
    window7d,
  );
  assert.match(line, /6 sessions \/ 6 users/);
  assert.match(line, /unattributed 3 sessions \/ 3 users/);
});

test("external audience says none instead of printing a bare zero", () => {
  const line = externalAudienceLine(
    namedSourceRows([
      externalRow("Direct", "(direct)", "/", 70, 16),
      externalRow("Referral", "github.com", "/", 8, 1),
    ]),
    window7d,
  );
  assert.equal(
    line,
    "external audience 7d: 0 sessions / 0 users (none outside Direct, github.com and unattributed) (window 2026-10-27 → 2026-11-02)",
  );
});

test("external audience labels its own window and never guesses 7d", () => {
  assert.match(externalAudienceLine([], undefined), /^external audience \(window unknown\):/);
  assert.match(
    externalAudienceLine([], window28d),
    /^external audience 28d: 0 sessions \/ 0 users/,
  );
});
