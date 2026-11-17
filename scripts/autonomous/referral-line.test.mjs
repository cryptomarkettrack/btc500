import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  ASKED_CHANNELS,
  askedChannelsLine,
  externalAudienceLine,
  namedSourceRows,
  namedSourcesLine,
  newestReport,
  referralLine,
  referralRows,
  reportDays,
  sourceTotalRows,
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
  // Sessions sum across landings (7); users do not — one person is not two
  // because they landed on two pages (mandate referral-instrument-1116).
  assert.match(line, /t\.co 7\/5 → \//);
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

// --- one user count per source (mandate referral-instrument-1116) ------------
//
// The line the 2026-11-14 review made mandatory overstated people on its first
// day: it printed `26 sessions / 22 users` because it summed `users` across
// each source's landing rows. bitcointalk.org has four landing rows in the
// 7d window ending 2026-11-15 (pillar 2/2, /liquidation 1/1, /simulator 1/1,
// /timeline 1/1), so it printed 5/5 where the report's own Referral table says
// 5 sessions / 2 users, and the property total was 40 users.

const sourceTotalRow = (channel, source, sessions, users) => ({
  dimensionValues: [{ value: channel }, { value: source }],
  metricValues: [{ value: String(sessions) }, { value: String(users) }],
});

/** The 2026-11-16 report's named-source table, verbatim (partial where Direct). */
const todayRows = () =>
  namedSourceRows([
    namedRow("Direct", "(direct)", "/", 68, 15),
    namedRow("Direct", "(direct)", "/bitcoin-500-day-cycle", 17, 1),
    namedRow("Organic Search", "google", "/", 9, 5),
    namedRow("Referral", "github.com", "/", 9, 1),
    namedRow("Organic Social", "facebook.com", "/", 6, 6),
    namedRow("Direct", "(direct)", "(not set)", 3, 3),
    namedRow("Direct", "(direct)", "/timeline", 3, 2),
    namedRow("Organic Social", "t.co", "/", 3, 3),
    namedRow("Organic Social", "x", "/bitcoin-500-day-cycle", 2, 2),
    namedRow("Referral", "bitcointalk.org", "/bitcoin-500-day-cycle", 2, 2),
    namedRow("AI Assistant", "chatgpt.com", "/bitcoin-500-day-cycle", 1, 1),
    namedRow("Referral", "bitcointalk.org", "/liquidation", 1, 1),
    namedRow("Referral", "bitcointalk.org", "/simulator", 1, 1),
    namedRow("Referral", "bitcointalk.org", "/timeline", 1, 1),
    namedRow("Unassigned", "(not set)", "/", 1, 1),
  ]);

const todayTotals = () =>
  sourceTotalRows([
    sourceTotalRow("Direct", "(direct)", 92, 20),
    sourceTotalRow("Organic Search", "google", 9, 5),
    sourceTotalRow("Referral", "github.com", 9, 1),
    sourceTotalRow("Organic Social", "facebook.com", 6, 6),
    sourceTotalRow("Referral", "bitcointalk.org", 5, 2),
    sourceTotalRow("Organic Social", "t.co", 3, 3),
    sourceTotalRow("Organic Social", "x", 2, 2),
    sourceTotalRow("AI Assistant", "chatgpt.com", 1, 1),
    sourceTotalRow("Unassigned", "(not set)", 1, 1),
  ]);

test("regression: bitcointalk.org prints 5/2, not 5/5, for the 2026-11-16 file", () => {
  const line = externalAudienceLine(todayRows(), {
    start: "2026-11-09",
    end: "2026-11-15",
    days: 7,
  });
  assert.match(line, /bitcointalk\.org 5\/2 → \/bitcoin-500-day-cycle/);
  assert.doesNotMatch(line, /bitcointalk\.org 5\/5/);
  // 19 users, not the inflated 22 the sum produced.
  assert.match(line, /26 sessions \/ 19 users/);
  assert.match(
    namedSourcesLine(todayRows(), { start: "2026-11-09", end: "2026-11-15", days: 7 }),
    /bitcointalk\.org 5\/2/,
  );
});

test("the per-source table wins over the landing rows when the report has one", () => {
  const line = externalAudienceLine(todayRows(), undefined, { sourceTotals: todayTotals() });
  assert.match(line, /bitcointalk\.org 5\/2/);
  assert.match(line, /26 sessions \/ 19 users/);
});

test("external users never exceed the GA4 property's own user total", () => {
  const users = (line) => Number(/\/ (\d+) users/.exec(line)[1]);
  // Property total 40, honest external 19: no cap, nothing hidden.
  const honest = externalAudienceLine(todayRows(), undefined, {
    sourceTotals: todayTotals(),
    propertyUsers: 40,
  });
  assert.equal(users(honest), 19);
  assert.doesNotMatch(honest, /capped/);
  // A table that double-counts people across sources cannot print more people
  // than the property has, and says so instead of silently dropping the excess.
  const inflated = externalAudienceLine(todayRows(), undefined, {
    sourceTotals: sourceTotalRows([
      sourceTotalRow("Organic Social", "facebook.com", 6, 30),
      sourceTotalRow("Organic Social", "t.co", 3, 30),
    ]),
    propertyUsers: 40,
  });
  assert.equal(users(inflated), 40);
  assert.match(inflated, /users capped at the property total of 40/);
});

test("every window of the real corpus keeps users <= sessions and <= the property total", () => {
  const cases = [
    { rows: reviewWindowRows(), propertyUsers: 40 },
    { rows: todayRows(), propertyUsers: 40, sourceTotals: todayTotals() },
  ];
  for (const { rows, propertyUsers, sourceTotals } of cases) {
    const line = externalAudienceLine(rows, window7d, { propertyUsers, sourceTotals });
    const [, sessions, users] = /: (\d+) sessions \/ (\d+) users/.exec(line);
    assert.ok(Number(users) <= Number(sessions), line);
    assert.ok(Number(users) <= propertyUsers, line);
  }
});

test("asked channels lists all seven asked destinations, including the ones that sent nothing", () => {
  const line = askedChannelsLine(todayRows(), {
    start: "2026-11-09",
    end: "2026-11-15",
    days: 7,
  });
  assert.match(line, /^asked channels 7d:/);
  for (const source of ASKED_CHANNELS) assert.match(line, new RegExp(`${source} \\d+/\\d+`));
  assert.match(line, /bitcointalk\.org 5\/2/);
  assert.match(line, /t\.co 3\/3/);
  assert.match(line, /x\.com 0\/0/);
  assert.match(line, /theblock\.co 0\/0/);
  assert.match(line, /lopp\.net 0\/0/);
  assert.match(line, /\(window 2026-11-09 → 2026-11-15\)$/);
});

test("asked channels says none of them sent a visitor rather than printing seven bare zeros", () => {
  const line = askedChannelsLine([], window7d);
  assert.match(line, /none of them sent a visitor/);
  assert.doesNotMatch(line, /capped/);
});

test("a 28-day report labels the asked-channels line 28d", () => {
  assert.match(
    askedChannelsLine(namedSourceRows([namedRow("Referral", "lopp.net", "/", 2, 2)]), window28d),
    /^asked channels 28d: .*lopp\.net 2\/2/,
  );
  assert.match(askedChannelsLine([], undefined), /^asked channels \(window unknown\):/);
});

test("the collector's per-source table parses to one row per source", () => {
  const rows = sourceTotalRows([
    sourceTotalRow("Referral", "bitcointalk.org", 5, 2),
    sourceTotalRow("Organic Social", "T.CO", 3, 3),
    { dimensionValues: [{ value: "Referral" }], metricValues: [{ value: "1" }, { value: "1" }] },
  ]);
  assert.deepEqual(rows, [
    { channel: "Referral", source: "bitcointalk.org", sessions: 5, users: 2 },
    { channel: "Organic Social", source: "t.co", sessions: 3, users: 3 },
  ]);
});
