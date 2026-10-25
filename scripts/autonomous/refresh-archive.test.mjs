import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  HEADER,
  parseArchive,
  midnightPoints,
  planAppend,
  overlapStats,
  validateOverlap,
  refreshArchive,
} from "./refresh-archive.mjs";

function makeArchive(startDay, days, base = 100) {
  const rows = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(`${startDay}T00:00:00Z`).getTime() + i * 86_400_000;
    const day = new Date(date).toISOString().slice(0, 10);
    rows.push(`${day} 00:00:00 UTC,${base + i},1000,200`);
  }
  return [HEADER, ...rows, ""].join("\n");
}

// A chart that agrees with the archive: a row dated X closes at the 00:00 UTC
// print of X+1.
function makeChart(startDay, days, base = 100, scale = 1) {
  const prices = [];
  const market_caps = [];
  const total_volumes = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(`${startDay}T00:00:00Z`).getTime() + i * 86_400_000;
    const label = new Date(day).toISOString();
    prices.push([Date.parse(label), (base + i - 1) * scale]);
    market_caps.push([Date.parse(label), 1000]);
    total_volumes.push([Date.parse(label), 200]);
  }
  // Trailing intraday point, as the real API returns. It must be ignored.
  prices.push([Date.parse("2026-02-20T12:34:56.000Z"), 9999]);
  return { prices, market_caps, total_volumes };
}

test("parseArchive keeps raw rows and drops rows without a usable close", () => {
  const text = [
    HEADER,
    "2026-01-01 00:00:00 UTC,100,1000,200",
    '2026-01-02 00:00:00 UTC,"",1000,200',
    "2026-01-03 00:00:00 UTC,102,1000,200",
    "",
  ].join("\n");
  const archive = parseArchive(text);
  assert.equal(archive.validRows.length, 2);
  assert.equal(archive.lastDate, "2026-01-03");
  assert.equal(archive.dropped.length, 1);
  assert.equal(archive.validRows[0].raw, "2026-01-01 00:00:00 UTC,100,1000,200");
});

test("midnightPoints ignores intraday points", () => {
  const points = midnightPoints(makeChart("2026-01-01", 10));
  assert.equal(points.size, 10);
  assert.ok(!points.has("2026-02-20"));
});

test("planAppend pairs each new row with the print of the following day", () => {
  const archive = parseArchive(makeArchive("2026-01-01", 10));
  const points = midnightPoints(makeChart("2026-01-01", 20));
  const plan = planAppend({ points, lastDate: archive.lastDate, today: "2026-01-31" });
  assert.equal(plan.rows[0].date, "2026-01-11");
  // row 2026-01-11 closes at the 2026-01-12 print, which the fixture builds as 110
  assert.equal(plan.rows[0].raw, "2026-01-11 00:00:00 UTC,110,1000,200");
  assert.equal(plan.rows.at(-1).date, "2026-01-19");
  assert.equal(plan.targetLast, "2026-01-19");
});

test("planAppend stops at the horizon instead of inventing today's close", () => {
  const archive = parseArchive(makeArchive("2026-01-01", 10));
  const points = midnightPoints(makeChart("2026-01-01", 40));
  const plan = planAppend({ points, lastDate: archive.lastDate, today: "2026-01-15" });
  assert.equal(plan.rows.at(-1).date, "2026-01-14");
});

test("overlapStats passes on a matching source and fails on a shifted one", () => {
  const archive = parseArchive(makeArchive("2026-01-01", 60));
  const good = overlapStats({
    points: midnightPoints(makeChart("2026-01-01", 70)),
    validRows: archive.validRows,
  });
  assert.equal(good.days, 60);
  assert.equal(validateOverlap(good).ok, true);

  const bad = overlapStats({
    points: midnightPoints(makeChart("2026-01-01", 70, 100, 1.05)),
    validRows: archive.validRows,
  });
  const verdict = validateOverlap(bad);
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /median drift/);
});

test("refreshArchive refuses to write when the source disagrees", async () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-archive-"));
  try {
    const path = join(dir, "btc-usd-max.csv");
    writeFileSync(path, makeArchive("2026-01-01", 60));
    const before = readFileSync(path, "utf8");
    const result = await refreshArchive({
      write: true,
      today: "2026-03-01",
      paths: [path, join(dir, "missing.csv")],
      fetchImpl: async () => ({
        ok: true,
        json: async () => makeChart("2026-01-01", 70, 100, 1.05),
      }),
    });
    assert.equal(result.state, "mismatch");
    assert.equal(readFileSync(path, "utf8"), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refreshArchive appends validated rows and repairs the invalid tail", async () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-archive-"));
  try {
    const path = join(dir, "btc-usd-max.csv");
    // The real file ends with a row whose close is empty. Append one.
    const text = `${makeArchive("2026-01-01", 60)}2026-03-02 00:00:00 UTC,"",0,0\n`;
    writeFileSync(path, text);
    const result = await refreshArchive({
      write: true,
      today: "2026-03-05",
      paths: [path],
      fetchImpl: async () => ({ ok: true, json: async () => makeChart("2026-01-01", 70) }),
    });
    assert.equal(result.state, "refreshed");
    assert.ok(result.appended > 0);
    const written = readFileSync(path, "utf8")
      .split("\n")
      .filter((l) => l.trim());
    assert.equal(written[0], HEADER);
    assert.ok(!written.some((l) => l.includes('"",0,0')));
    // every row parses
    assert.equal(parseArchive(readFileSync(path, "utf8")).dropped.length, 0);
    assert.equal(result.overlap.days, 60);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refreshArchive reports fresh when the archive is already current", async () => {
  const dir = mkdtempSync(join(tmpdir(), "btc500-archive-"));
  try {
    const path = join(dir, "btc-usd-max.csv");
    const chart = makeChart("2026-01-01", 70);
    writeFileSync(path, makeArchive("2026-01-01", 60));
    // Last row is 2026-03-01, so "today" = 2026-03-02 leaves nothing to add.
    const result = await refreshArchive({
      write: true,
      today: "2026-03-02",
      paths: [path],
      fetchImpl: async () => ({ ok: true, json: async () => chart }),
    });
    assert.equal(result.state, "fresh");
    assert.equal(result.appended, 0);
    assert.equal(result.written.length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
