#!/usr/bin/env node
/**
 * Pull Google Analytics 4 data and write a prioritised markdown report.
 *
 *   node scripts/analytics/fetch-ga4.ts
 *   node scripts/analytics/fetch-ga4.ts --days=7
 *   node scripts/analytics/fetch-ga4.ts --realtime
 *
 * Reads the same service-account key as the Search Console tooling. The key's
 * client_email must be a Viewer on the GA4 property and the Google Analytics
 * Data API must be enabled in the Cloud project that owns the key.
 *
 * Writes to scripts/analytics/output/ (gitignored).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ConfigError,
  loadDotEnv,
  parseFlags,
  PROJECT_ROOT,
  shiftDays,
} from "../search-console/client.ts";
import { num, pct, table } from "../search-console/report.ts";
import {
  dimensionValue,
  metricValue,
  resolveProperty,
  runRealtimeReport,
  runReport,
  type ReportRow,
  type RunReportResponse,
} from "./client.ts";

const HELP = `Google Analytics 4 report

Usage:
  node scripts/analytics/fetch-ga4.ts [options]

Options:
  --days=N          Window length in days. Default: 28
  --property=ID     GA4 property id. Default: $GA4_PROPERTY_ID or 560440382
  --realtime        Show the last 30 minutes instead of the report
  --help            Show this message

Environment:
  GA4_PROPERTY_ID   Default property id (numeric, not the G- measurement id)

Setup:
  1. Enable the Google Analytics Data API in the Cloud project that owns the
     service-account key.
  2. In GA4: Admin -> Property access management -> add the key's client_email
     as a Viewer.
`;

const OUTPUT_DIR = resolvePath(PROJECT_ROOT, "scripts/analytics/output");

const TOTALS_METRICS = [
  "sessions",
  "totalUsers",
  "newUsers",
  "screenPageViews",
  "engagedSessions",
  "engagementRate",
  "averageSessionDuration",
];

type Totals = {
  sessions: number;
  users: number;
  newUsers: number;
  views: number;
  engagedSessions: number;
  engagementRate: number;
  avgDuration: number;
};

function readTotals(row: ReportRow | undefined): Totals {
  return {
    sessions: metricValue(row, 0),
    users: metricValue(row, 1),
    newUsers: metricValue(row, 2),
    views: metricValue(row, 3),
    engagedSessions: metricValue(row, 4),
    engagementRate: metricValue(row, 5),
    avgDuration: metricValue(row, 6),
  };
}

function totalsBody(startDate: string, endDate: string) {
  return {
    dateRanges: [{ startDate, endDate }],
    metrics: TOTALS_METRICS.map((name) => ({ name })),
  };
}

function delta(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return "0";
  const sign = diff > 0 ? "+" : "";
  const relative = previous > 0 ? ` (${sign}${pct(diff / previous)})` : "";
  return `${sign}${num(diff)}${relative}`;
}

function duration(seconds: number): string {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

function rowsOf(report: RunReportResponse): ReportRow[] {
  return report.rows ?? [];
}

function summaryLine(current: Totals, previous: Totals | undefined): string {
  const now =
    `Sessions: ${num(current.sessions)}   Users: ${num(current.users)}   ` +
    `Views: ${num(current.views)}   Engagement: ${pct(current.engagementRate)}`;
  if (!previous) return now;
  return (
    `${now}\n` +
    `vs previous: sessions ${delta(current.sessions, previous.sessions)}, ` +
    `users ${delta(current.users, previous.users)}, ` +
    `views ${delta(current.views, previous.views)}`
  );
}

function writeReport(name: string, markdown: string, data: unknown) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/:/gu, "-").replace(/\..+$/u, "");
  const markdownPath = resolvePath(OUTPUT_DIR, `${name}-${stamp}.md`);
  const jsonPath = resolvePath(OUTPUT_DIR, `${name}-${stamp}.json`);
  const json = JSON.stringify(data, null, 2);
  writeFileSync(markdownPath, markdown, "utf8");
  writeFileSync(jsonPath, json, "utf8");
  writeFileSync(resolvePath(OUTPUT_DIR, `${name}-latest.md`), markdown, "utf8");
  writeFileSync(resolvePath(OUTPUT_DIR, `${name}-latest.json`), json, "utf8");
  return { markdownPath, jsonPath };
}

async function realtime(propertyId: string): Promise<void> {
  const report = await runRealtimeReport(propertyId, {
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    dimensions: [{ name: "unifiedScreenName" }],
    limit: 20,
  });

  const rows = rowsOf(report);
  let users = 0;
  let views = 0;
  for (const row of rows) {
    users += metricValue(row, 0);
    views += metricValue(row, 1);
  }

  console.log(`Property: ${propertyId}`);
  console.log("Window:   last 30 minutes (realtime)");
  console.log(`Active users: ${num(users)}   Views: ${num(views)}`);
  console.log("");
  if (rows.length === 0) {
    console.log("No realtime rows. If you just deployed the tag, load the site once.");
    return;
  }
  console.log(
    table(
      ["Page", "Active users", "Views"],
      rows.map((row) => [
        dimensionValue(row, 0),
        num(metricValue(row, 0)),
        num(metricValue(row, 1)),
      ]),
    ),
  );
}

async function main(): Promise<void> {
  loadDotEnv();
  const flags = parseFlags(process.argv.slice(2));
  if (flags.has("help")) {
    console.log(HELP);
    return;
  }

  const propertyId = resolveProperty(flags.get("property"));
  if (flags.has("realtime")) {
    await realtime(propertyId);
    return;
  }

  const days = Number(flags.get("days") ?? 28);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new ConfigError("--days must be an integer between 1 and 365");
  }

  const currentRange = { startDate: `${days}daysAgo`, endDate: "yesterday" };
  const previousRange = {
    startDate: `${days * 2}daysAgo`,
    endDate: `${days + 1}daysAgo`,
  };

  const [currentReport, previousReport, channels, landing, returning, devices, referrals] =
    await Promise.all([
      runReport(propertyId, totalsBody(currentRange.startDate, currentRange.endDate)),
      runReport(propertyId, totalsBody(previousRange.startDate, previousRange.endDate)),
      runReport(propertyId, {
        dateRanges: [currentRange],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "engagementRate" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      runReport(propertyId, {
        dateRanges: [currentRange],
        dimensions: [{ name: "landingPage" }],
        metrics: [
          { name: "sessions" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 15,
      }),
      runReport(propertyId, {
        dateRanges: [currentRange],
        dimensions: [{ name: "newVsReturning" }],
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      }),
      runReport(propertyId, {
        dateRanges: [currentRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }, { name: "engagementRate" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
      runReport(propertyId, {
        dateRanges: [currentRange],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
        dimensionFilter: {
          filter: {
            fieldName: "sessionDefaultChannelGroup",
            stringFilter: { matchType: "EXACT", value: "Referral" },
          },
        },
      }),
    ]);

  const current = readTotals(rowsOf(currentReport)[0]);
  const previous = rowsOf(previousReport)[0] ? readTotals(rowsOf(previousReport)[0]) : undefined;
  const hasData = rowsOf(currentReport).length > 0;
  const timeZone = currentReport.metadata?.timeZone ?? "UTC";
  const end = shiftDays(new Date().toISOString().slice(0, 10), -1);
  const start = shiftDays(end, -(days - 1));

  const lines: string[] = [];
  lines.push("# GA4 performance — BTC500", "");
  lines.push(`Property: ${propertyId} (${timeZone})`);
  lines.push(`Window:   ${days} days (${start} → ${end})`);
  lines.push(`Generated: ${new Date().toISOString()}`, "");

  if (!hasData) {
    lines.push("> **No processed rows for this window.** GA4 standard reports lag 24–48 h,");
    lines.push("> so a new property or a tag installed today can legitimately be empty.");
    lines.push("> Use `--realtime` to confirm hits are arriving.", "");
  }

  lines.push("## Totals", "");
  lines.push(
    table(
      ["Metric", "Current", "Previous", "Change"],
      [
        [
          "Sessions",
          num(current.sessions),
          num(previous?.sessions ?? 0),
          delta(current.sessions, previous?.sessions ?? 0),
        ],
        [
          "Users",
          num(current.users),
          num(previous?.users ?? 0),
          delta(current.users, previous?.users ?? 0),
        ],
        [
          "New users",
          num(current.newUsers),
          num(previous?.newUsers ?? 0),
          delta(current.newUsers, previous?.newUsers ?? 0),
        ],
        [
          "Page views",
          num(current.views),
          num(previous?.views ?? 0),
          delta(current.views, previous?.views ?? 0),
        ],
        [
          "Engaged sessions",
          num(current.engagedSessions),
          num(previous?.engagedSessions ?? 0),
          delta(current.engagedSessions, previous?.engagedSessions ?? 0),
        ],
        [
          "Engagement rate",
          pct(current.engagementRate),
          pct(previous?.engagementRate ?? 0),
          delta(current.engagementRate, previous?.engagementRate ?? 0),
        ],
        [
          "Avg session",
          duration(current.avgDuration),
          duration(previous?.avgDuration ?? 0),
          delta(current.avgDuration, previous?.avgDuration ?? 0),
        ],
      ],
    ),
    "",
  );

  lines.push("## Acquisition channels", "");
  lines.push(
    table(
      ["Channel", "Sessions", "Users", "Engagement"],
      rowsOf(channels).map((row) => [
        dimensionValue(row, 0),
        num(metricValue(row, 0)),
        num(metricValue(row, 1)),
        pct(metricValue(row, 2)),
      ]),
    ),
    "",
  );

  lines.push("## Landing pages", "");
  lines.push(
    table(
      ["Landing page", "Sessions", "Engagement", "Avg session"],
      rowsOf(landing).map((row) => [
        dimensionValue(row, 0),
        num(metricValue(row, 0)),
        pct(metricValue(row, 1)),
        duration(metricValue(row, 2)),
      ]),
    ),
    "",
  );

  lines.push("## New vs returning", "");
  lines.push(
    table(
      ["Type", "Users", "Sessions"],
      rowsOf(returning).map((row) => [
        dimensionValue(row, 0),
        num(metricValue(row, 0)),
        num(metricValue(row, 1)),
      ]),
    ),
    "",
  );

  lines.push("## Devices", "");
  lines.push(
    table(
      ["Device", "Sessions", "Engagement"],
      rowsOf(devices).map((row) => [
        dimensionValue(row, 0),
        num(metricValue(row, 0)),
        pct(metricValue(row, 1)),
      ]),
    ),
    "",
  );

  lines.push("## Referral sources", "");
  lines.push(
    table(
      ["Source", "Sessions", "Users"],
      rowsOf(referrals).map((row) => [
        dimensionValue(row, 0),
        num(metricValue(row, 0)),
        num(metricValue(row, 1)),
      ]),
    ),
    "",
  );

  const markdown = lines.join("\n");
  const { markdownPath, jsonPath } = writeReport("ga4", markdown, {
    propertyId,
    window: { start, end, days, timeZone },
    totals: { current, previous },
    tables: {
      channels: rowsOf(channels),
      landing: rowsOf(landing),
      returning: rowsOf(returning),
      devices: rowsOf(devices),
      referrals: rowsOf(referrals),
    },
  });

  console.log("");
  console.log(`Property: ${propertyId}   Window: ${days} days (${start} → ${end})`);
  console.log(summaryLine(current, previous));
  if (!hasData) {
    console.log(
      "No processed rows for this window. GA4 standard reports lag 24–48 h; use --realtime to confirm hits.",
    );
  }
  console.log("");
  console.log(`Report: ${markdownPath}`);
  console.log(`Raw:    ${jsonPath}`);
}

const invokedDirectly =
  process.argv[1] !== undefined && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error: unknown) => {
    if (error instanceof ConfigError) {
      console.error(`\n${error.message}\n`);
      process.exit(1);
    }
    console.error(error);
    process.exit(1);
  });
}
