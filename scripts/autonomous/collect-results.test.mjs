import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  THRESHOLDS,
  applyRule,
  askEffectSignal,
  backfillHistory,
  comparableRow,
  computeSignals,
  daysBetween,
  daysSincePositive,
  datedReportIndex,
  mergeHistory,
  parseActivity,
  parseGa4,
  parseInspection,
  parsePerformance,
  readHistory,
  shiftDays,
  trend,
  writeHistory,
} from "./collect-results.mjs";

const TODAY = "2026-10-25";

// ------------------------------------------------------------------ fixtures ---

function perfJson(overrides = {}) {
  return {
    site: "https://btc500.net/",
    window: { start: "2026-10-16", end: "2026-10-22", days: 7 },
    totals: { clicks: 8, impressions: 28, ctr: 0.28, position: 18.6 },
    queries: [
      { keys: ["btc500"], clicks: 8, impressions: 10, ctr: 0.8, position: 2 },
      { keys: ["bitcoin 500 cycle"], clicks: 0, impressions: 8, ctr: 0, position: 11 },
      {
        keys: ["when is the next bitcoin halving"],
        clicks: 0,
        impressions: 6,
        ctr: 0,
        position: 5,
      },
    ],
    pages: [
      { keys: ["https://btc500.net/"], clicks: 8, impressions: 28, ctr: 0.28, position: 18.6 },
      { keys: ["https://btc500.net/articles/x"], clicks: 0, impressions: 0, ctr: 0, position: 0 },
    ],
    ...overrides,
  };
}

function inspJson(coverage) {
  return {
    site: "https://btc500.net/",
    rows: coverage.map((label, i) => ({
      url: `https://btc500.net/page-${i}`,
      verdict: /not indexed/i.test(label) ? "NEUTRAL" : "PASS",
      coverage: label,
      indexing: "INDEXING_ALLOWED",
      robots: "ALLOWED",
      lastCrawl: "2026-10-20",
      canonicalMatch: "match",
      issues: [],
    })),
  };
}

function ga4Json(overrides = {}) {
  return {
    propertyId: "560440382",
    window: { start: "2026-10-16", end: "2026-10-22", days: 7, timeZone: "Europe/Sofia" },
    totals: {
      current: {
        sessions: 19,
        users: 11,
        newUsers: 11,
        views: 31,
        engagedSessions: 8,
        engagementRate: 0.42,
        avgDuration: 166,
      },
    },
    tables: {
      channels: [
        {
          dimensionValues: [{ value: "Direct" }],
          metricValues: [{ value: "17" }, { value: "9" }, { value: "0.4" }],
        },
        {
          dimensionValues: [{ value: "Organic Search" }],
          metricValues: [{ value: "2" }, { value: "2" }, { value: "1" }],
        },
      ],
      referrals: [],
      landing: [],
      returning: [],
      devices: [],
    },
    ...overrides,
  };
}

function row(date, overrides = {}) {
  return {
    date,
    windowDays: 7,
    ga4Days: 7,
    clicks: 8,
    impressions: 28,
    ctr: 0.28,
    position: 18.6,
    brandClicks: 6,
    nonBrandClicks: 0,
    nonBrandEnd: shiftDays(date, -3),
    pagesWithImpressions: 11,
    indexed: 6,
    totalUrls: 25,
    sessions: 19,
    organicSessions: 2,
    referralSessions: 0,
    ...overrides,
  };
}

function freshSources() {
  return [
    { id: "search-console", path: "p", missing: false, ageHours: 1 },
    { id: "indexation", path: "p", missing: false, ageHours: 1 },
    { id: "ga4", path: "p", missing: false, ageHours: 1 },
  ];
}

function signalById(signals, id) {
  const found = signals.find((s) => s.id === id);
  assert.ok(found, `signal ${id} missing`);
  return found;
}

// ------------------------------------------------------------------ parsing ---

test("parsePerformance splits brand from non-brand queries", () => {
  const perf = parsePerformance(perfJson());
  assert.equal(perf.clicks, 8);
  assert.equal(perf.impressions, 28);
  assert.equal(perf.brandClicks, 8);
  assert.equal(perf.nonBrandClicks, 0);
  assert.equal(perf.nonBrandImpressions, 14);
  assert.equal(perf.pagesWithImpressions, 1);
  assert.equal(perf.pages, 2);
  // Position 11 and 5 both sit in the 4-20 band.
  assert.equal(perf.positions4to20, 2);
  assert.equal(perf.topQueries[0].query, "btc500");
  assert.equal(perf.windowDays, 7);
});

test("parsePerformance survives a report with no query rows", () => {
  const perf = parsePerformance(perfJson({ queries: [], pages: [] }));
  assert.equal(perf.brandClicks, 0);
  assert.equal(perf.nonBrandClicks, 0);
  assert.equal(perf.hasQueryRows, false);
  assert.equal(perf.positions4to20, 0);
  assert.equal(parsePerformance(null), null);
});

test("parseInspection counts only URLs that are actually indexed", () => {
  const insp = parseInspection(
    inspJson([
      "Submitted and indexed",
      "Submitted and indexed",
      "Crawled - currently not indexed",
      "Discovered - currently not indexed",
      "Unknown",
    ]),
  );
  assert.equal(insp.total, 5);
  assert.equal(insp.indexed, 2);
  assert.equal(insp.notIndexed.length, 3);
  assert.equal(insp.coverage["Crawled - currently not indexed"], 1);
  assert.equal(parseInspection({ rows: null }), null);
});

test("parseGa4 reads sessions, the organic channel and referrals", () => {
  const ga4 = parseGa4(ga4Json());
  assert.equal(ga4.sessions, 19);
  assert.equal(ga4.organicSessions, 2);
  assert.equal(ga4.directSessions, 17);
  assert.equal(ga4.referralSessions, 0);

  const withReferral = ga4Json({
    tables: {
      channels: ga4Json().tables.channels,
      referrals: [
        { dimensionValues: [{ value: "example.com" }], metricValues: [{ value: "3" }] },
        { dimensionValues: [{ value: "news.ycombinator.com" }], metricValues: [{ value: "1" }] },
      ],
      landing: [],
      returning: [],
      devices: [],
    },
  });
  assert.equal(parseGa4(withReferral).referralSessions, 4);
  assert.equal(parseGa4(null), null);
});

test("parseActivity counts shipped cycles and failures inside the window", () => {
  const csv = [
    "timestamp,status,model,head,tests,vercel,manifest,site,archive,note",
    "2026-10-24T06:00:00+0200,shipped,m,aabbcc,pass,success,pass,200,refreshed,none",
    "2026-10-23T06:00:00+0200,deploy-failed,m,aabbcd,pass,failure,skipped,200,refreshed,none",
    "2026-10-01T06:00:00+0200,shipped,m,oldsha,pass,success,pass,200,refreshed,none",
  ].join("\n");
  const activity = parseActivity(csv, TODAY);
  assert.equal(activity.runs, 2); // the 10-01 row is outside the 7d window
  assert.equal(activity.shipped, 1);
  assert.equal(activity.failures, 1);
  assert.deepEqual(activity.failureStatuses, ["deploy-failed"]);
  assert.equal(activity.last.status, "shipped");
  assert.equal(parseActivity("", TODAY).runs, 0);
});

// ------------------------------------------------------------------ history ---

test("writeHistory and readHistory round-trip, sorted by date", () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-history-"));
  try {
    const file = join(dir, "results-history.csv");
    writeHistory(file, [row("2026-10-24"), row("2026-10-22"), row("2026-10-25")]);
    const rows = readHistory(file);
    assert.deepEqual(
      rows.map((r) => r.date),
      ["2026-10-22", "2026-10-24", "2026-10-25"],
    );
    assert.equal(rows[0].indexed, 6);
    assert.equal(rows[0].windowDays, 7);
    // Empty cells come back as null, not as zero (zero would be a claim).
    writeHistory(file, [{ ...row("2026-10-25"), sessions: null, indexed: null }]);
    assert.equal(readHistory(file)[0].sessions, null);
    assert.equal(readHistory(file)[0].indexed, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("mergeHistory keeps existing rows, fills gaps, and drops today", () => {
  const existing = [row("2026-10-24", { impressions: 999 })];
  const backfill = [row("2026-10-23"), row("2026-10-24"), row("2026-10-25")];
  const merged = mergeHistory(existing, backfill, TODAY);
  const dates = merged.map((r) => r.date);
  assert.deepEqual(dates, ["2026-10-23", "2026-10-24"]);
  assert.equal(merged.find((r) => r.date === "2026-10-24").impressions, 999); // existing wins
});

test("backfillHistory rebuilds rows from dated reports on disk", () => {
  const root = mkdtempSync(join(tmpdir(), "btc500-backfill-"));
  try {
    const gscDir = join(root, "gsc");
    const ga4Dir = join(root, "ga4");
    mkdirSync(gscDir, { recursive: true });
    mkdirSync(ga4Dir, { recursive: true });

    writeFileSync(join(gscDir, "performance-2026-10-23T03-00-12.json"), JSON.stringify(perfJson()));
    writeFileSync(
      join(gscDir, "performance-2026-10-23T04-00-00.json"),
      JSON.stringify(
        perfJson({
          window: { start: "2026-09-25", end: "2026-10-22", days: 28 },
          totals: { clicks: 40, impressions: 400, ctr: 0.1, position: 20 },
        }),
      ),
    );
    writeFileSync(
      join(gscDir, "inspection-2026-10-23T03-03-09.json"),
      JSON.stringify(inspJson(["Submitted and indexed"])),
    );
    writeFileSync(
      join(gscDir, "inspection-latest.json"),
      JSON.stringify(inspJson(["Crawled - currently not indexed"])),
    );
    writeFileSync(join(ga4Dir, "ga4-2026-10-23T03-00-15.json"), JSON.stringify(ga4Json()));

    const index = datedReportIndex(gscDir, "performance", 7);
    assert.equal(index.size, 1);
    // The 7d file wins over the 28d file fetched the same day.
    assert.match(index.get("2026-10-23").path, /T03-00-12/);

    const rows = backfillHistory({ gscDir, ga4Dir, today: TODAY });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].date, "2026-10-23");
    assert.equal(rows[0].impressions, 28);
    assert.equal(rows[0].indexed, 1);
    assert.equal(rows[0].sessions, 19);
    // Today is never backfilled; the caller writes it from the freshest reports.
    assert.equal(backfillHistory({ gscDir, ga4Dir, today: "2026-10-23" }).length, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- comparison ---

test("comparableRow only matches rows with the same window", () => {
  const rows = [
    row("2026-10-11", { impressions: 10 }),
    row("2026-10-12", { windowDays: 28, impressions: 500 }),
    row("2026-10-25", { impressions: 30 }),
  ];
  const old = comparableRow(rows, TODAY, 14, "windowDays", 7);
  assert.equal(old?.date, "2026-10-11");
  assert.equal(comparableRow(rows, TODAY, 14, "windowDays", 28)?.date, "2026-10-12");
  // 14 days before 2026-10-25 is 2026-10-11: nothing outside ±3 days matches.
  assert.equal(comparableRow(rows, TODAY, 60, "windowDays", 7), null);
});

test("trend reads the direction of a change, but not noise", () => {
  assert.equal(trend(120, 100, THRESHOLDS), "up");
  assert.equal(trend(105, 100, THRESHOLDS), "flat");
  assert.equal(trend(60, 100, THRESHOLDS), "down");
  // Below trendMinOld a fall is called noise instead of a regression.
  assert.equal(trend(20, 28, THRESHOLDS), "noisy-down");
  assert.equal(trend(35, 28, THRESHOLDS), "up");
  assert.equal(trend(null, 28, THRESHOLDS), null);
});

test("daysSincePositive walks back to the last row that recorded the signal", () => {
  const rows = [
    row("2026-10-20"),
    row("2026-10-23", { nonBrandClicks: 3, nonBrandEnd: "2026-10-22" }),
    row("2026-10-25"),
  ];
  assert.equal(daysSincePositive(rows, TODAY, "nonBrandClicks"), daysBetween("2026-10-22", TODAY));
  assert.equal(daysSincePositive(rows, TODAY, "referralSessions"), null);
  // A row for today that has the signal is zero days ago.
  const now = [row(TODAY, { referralSessions: 2 })];
  assert.equal(daysSincePositive(now, TODAY, "referralSessions"), 0);
});

test("daysBetween and shiftDays agree across a month boundary", () => {
  assert.equal(daysBetween("2026-10-01", "2026-11-10"), 40);
  assert.equal(shiftDays("2026-11-02", -7), "2026-10-26");
});

// ------------------------------------------------------------------ signals ---

test("a short history reports flat, not stalled, and never improves", () => {
  const rows = [row("2026-10-22"), row("2026-10-23"), row(TODAY)];
  const signals = computeSignals({
    rows,
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: freshSources(),
  });
  for (const signal of signals.filter((s) => s.kind === "outcome")) {
    assert.equal(signal.state, "flat", `${signal.id} should be flat, got ${signal.state}`);
    assert.match(signal.evidence, /\d/);
  }
  const rule = applyRule(signals);
  assert.equal(rule.mayClaimImproving, false);
  assert.match(rule.blockedBecause.join(" "), /positive outcome signal/);
});

test("indexation that has not moved for two weeks is stalled", () => {
  const rows = [row("2026-10-08"), row("2026-10-16"), row(TODAY)];
  const signals = computeSignals({
    rows,
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: freshSources(),
  });
  const indexation = signalById(signals, "indexation");
  assert.equal(indexation.state, "stalled");
  assert.match(indexation.evidence, /unchanged for 17d/);
});

test("more indexed pages is a green signal", () => {
  const rows = [row("2026-10-08", { indexed: 3 }), row("2026-10-16", { indexed: 4 }), row(TODAY)];
  const signals = computeSignals({
    rows,
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(9).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: freshSources(),
  });
  const indexation = signalById(signals, "indexation");
  assert.equal(indexation.state, "green");
  assert.match(indexation.evidence, /3 -> 9/);
});

test("a loss of indexed pages regresses and blocks any improving verdict", () => {
  const rows = [row("2026-10-08", { indexed: 12 }), row("2026-10-16"), row(TODAY)];
  const signals = computeSignals({
    rows,
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: freshSources(),
  });
  assert.equal(signalById(signals, "indexation").state, "regressed");
  const rule = applyRule(signals);
  assert.equal(rule.mayClaimImproving, false);
  assert.match(rule.blockedBecause.join(" "), /regressed: indexation/);
});

test("a non-brand click in the current window is green", () => {
  const perf = parsePerformance(
    perfJson({
      queries: [
        { keys: ["btc500"], clicks: 6, impressions: 10, ctr: 0.6, position: 2 },
        { keys: ["bitcoin 500 cycle"], clicks: 1, impressions: 8, ctr: 0.1, position: 11 },
      ],
    }),
  );
  const signals = computeSignals({
    rows: [row("2026-10-20"), row(TODAY, { nonBrandClicks: 1 })],
    today: TODAY,
    perf,
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: freshSources(),
  });
  assert.equal(signalById(signals, "non-brand-clicks").state, "green");
  assert.equal(perf.nonBrandClicks, 1);
});

test("zero non-brand clicks for 21 days is stalled", () => {
  const rows = [row("2026-10-01"), row("2026-10-10"), row("2026-10-20"), row(TODAY)];
  const signals = computeSignals({
    rows,
    today: TODAY,
    perf: parsePerformance(
      perfJson({
        queries: [{ keys: ["btc500"], clicks: 8, impressions: 28, ctr: 0.28, position: 2 }],
      }),
    ),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: freshSources(),
  });
  const nonBrand = signalById(signals, "non-brand-clicks");
  assert.equal(nonBrand.state, "stalled");
  assert.match(nonBrand.evidence, /24d of history/);
  assert.match(nonBrand.evidence, /21d stall bar/);
});

test("a failed run regresses deploy health", () => {
  const signals = computeSignals({
    rows: [row("2026-10-20"), row(TODAY)],
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: parseActivity(
      [
        "timestamp,status,model,head,tests,vercel,manifest,site,archive,note",
        "2026-10-24T06:00:00+0200,deploy-failed,m,aabb,pass,failure,skipped,200,refreshed,none",
        "2026-10-23T06:00:00+0200,shipped,m,aabb,pass,success,pass,200,refreshed,none",
      ].join("\n"),
      TODAY,
    ),
    sources: freshSources(),
  });
  const health = signalById(signals, "deploy-health");
  assert.equal(health.state, "regressed");
  assert.equal(applyRule(signals).mayClaimImproving, false);
});

test("shipping four cycles with nothing moving is flagged as yield without results", () => {
  const csv = [
    "timestamp,status,model,head,tests,vercel,manifest,site,archive,note",
    ...Array.from(
      { length: 5 },
      (_, i) =>
        `2026-10-2${i + 1}T06:00:00+0200,shipped,m,aabb,pass,success,pass,200,refreshed,none`,
    ),
  ].join("\n");
  const signals = computeSignals({
    rows: [row("2026-10-20"), row("2026-10-21"), row("2026-10-22"), row("2026-10-23"), row(TODAY)],
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: parseActivity(csv, TODAY),
    sources: freshSources(),
  });
  const yieldSignal = signalById(signals, "cycle-yield");
  assert.equal(yieldSignal.state, "stalled");
  assert.match(yieldSignal.evidence, /5 cycle\(s\) shipped/);
});

test("before any ask is issued there is nothing to measure", () => {
  assert.equal(
    askEffectSignal({ previousReview: { asks: [] }, ga4: parseGa4(ga4Json()), today: TODAY }),
    null,
  );
  assert.equal(
    askEffectSignal({ previousReview: null, ga4: parseGa4(ga4Json()), today: TODAY }),
    null,
  );
  // A review without owner_asks[] (an improving one) leaves no signal either.
  assert.equal(
    askEffectSignal({
      previousReview: { generated: TODAY },
      ga4: parseGa4(ga4Json()),
      today: TODAY,
    }),
    null,
  );
});

test("a fresh ask is waited on, not judged", () => {
  const ask = { id: "x-post", channel: "x", referrers: ["x.com"], by: "2026-10-24" };
  const signal = askEffectSignal({
    previousReview: { generated: "2026-10-24", asks: [ask] },
    ga4: parseGa4(ga4Json()),
    today: TODAY,
  });
  assert.equal(signal.state, "flat");
  assert.match(signal.evidence, /1d old/);
  assert.match(signal.evidence, /measurable after 2026-10-31/);
  assert.ok(THRESHOLDS.askMeasureDays >= 7);
});

test("an ask that produced a referral from its own channel is green", () => {
  const ask = { id: "x-post", channel: "x", referrers: ["x.com"], by: "2026-10-15" };
  const ga4 = parseGa4(
    ga4Json({
      tables: {
        referrals: [
          {
            dimensionValues: [{ value: "x.com" }],
            metricValues: [{ value: "3" }],
          },
        ],
        channels: [],
        landing: [],
      },
    }),
  );
  const signal = askEffectSignal({
    previousReview: { generated: "2026-10-15", asks: [ask] },
    ga4,
    today: TODAY,
  });
  assert.equal(signal.state, "green");
  assert.match(signal.evidence, /produced 3 session\(s\) from x\.com/);
});

test("an ask that produced nothing after a week is reported as stalled", () => {
  const ask = { id: "x-post", channel: "x", referrers: ["x.com"], by: "2026-10-16" };
  const signal = askEffectSignal({
    previousReview: { generated: "2026-10-16", asks: [ask] },
    ga4: parseGa4(ga4Json()),
    today: TODAY,
  });
  assert.equal(signal.state, "stalled");
  assert.match(signal.evidence, /0 referral sessions in 9d/);
  assert.match(signal.evidence, /restate it narrower/);

  // Missing GA4 is "unknown", never a pass or a failure.
  const blind = askEffectSignal({
    previousReview: { generated: "2026-10-16", asks: [ask] },
    ga4: null,
    today: TODAY,
  });
  assert.equal(blind.state, "unknown");
});

test("stale or missing reports block every claim", () => {
  const signals = computeSignals({
    rows: [row("2026-10-01"), row(TODAY, { nonBrandClicks: 5 })],
    today: TODAY,
    perf: parsePerformance(perfJson()),
    insp: parseInspection(inspJson(Array(6).fill("Submitted and indexed"))),
    ga4: parseGa4(ga4Json()),
    activity: null,
    sources: [
      { id: "search-console", path: "p", missing: true, ageHours: null },
      { id: "ga4", path: "p", missing: false, ageHours: 99 },
      { id: "indexation", path: "p", missing: false, ageHours: 1 },
    ],
  });
  assert.equal(signalById(signals, "data-freshness").state, "stale");
  assert.equal(applyRule(signals).mayClaimImproving, false);
  assert.match(applyRule(signals).blockedBecause.join(" "), /missing or stale/);
});

test("applyRule only allows an improving verdict with two outcome greens", () => {
  const base = [
    { id: "a", kind: "outcome", state: "green", evidence: "x" },
    { id: "b", kind: "outcome", state: "green", evidence: "x" },
    { id: "c", kind: "outcome", state: "flat", evidence: "x" },
    { id: "d", kind: "process", state: "stalled", evidence: "x" },
  ];
  assert.equal(applyRule(base).mayClaimImproving, true);

  const oneGreen = base.map((s, i) => (i === 1 ? { ...s, state: "flat" } : s));
  assert.equal(applyRule(oneGreen).mayClaimImproving, false);

  const withRegression = base.map((s, i) => (i === 2 ? { ...s, state: "regressed" } : s));
  assert.equal(applyRule(withRegression).mayClaimImproving, false);

  const withStale = [
    ...base,
    { id: "data-freshness", kind: "process", state: "stale", evidence: "x" },
  ];
  assert.equal(applyRule(withStale).mayClaimImproving, false);
});
