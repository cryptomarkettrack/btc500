#!/usr/bin/env node
/**
 * Verify that production actually serves what the day's commit claims.
 *
 * The runner used to curl the homepage right after a push and record "200",
 * which only proved the *previous* deployment was still up (deploys take ~60s).
 * Now the agent commits a manifest next to its change:
 *
 *   scripts/autonomous/last-deploy.json
 *   {
 *     "generated": "2026-10-25",
 *     "summary": "timing table on the pillar page",
 *     "checks": [
 *       { "path": "/bitcoin-500-day-cycle", "contains": "120 days early", "status": 200 },
 *       { "path": "/about", "contains": "timing test" }
 *     ]
 *   }
 *
 * After the Vercel commit status turns green this script fetches each URL and
 * looks for the exact string in the served HTML. A manifest from an earlier day
 * proves nothing about today's deploy, so it is reported as `stale` instead of
 * silently passing.
 *
 * Exit codes: 0 pass, 1 a check failed, 2 unverified (missing/stale manifest).
 *
 * Usage:
 *   node scripts/autonomous/verify-deploy.mjs --site https://btc500.net --today 2026-10-25
 */

import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const MANIFEST_PATH = join(HERE, "last-deploy.json");
export const MAX_CHECKS = 10;

function parseArgs(argv) {
  const args = { site: "https://btc500.net", today: null, manifest: MANIFEST_PATH };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--site" && argv[i + 1]) args.site = argv[++i].replace(/\/$/, "");
    else if (argv[i] === "--today" && argv[i + 1]) args.today = argv[++i];
    else if (argv[i] === "--manifest" && argv[i + 1]) args.manifest = argv[++i];
  }
  if (!args.today) {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    args.today = new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }
  return args;
}

/**
 * Pure part: decide whether a manifest is usable for a given day and what to
 * check. Exported for tests.
 */
export function planChecks(manifest, today) {
  if (!manifest || typeof manifest !== "object")
    return { state: "absent", reason: "manifest unreadable", checks: [] };
  if (!Array.isArray(manifest.checks) || manifest.checks.length === 0) {
    return { state: "absent", reason: "no checks declared", checks: [] };
  }
  if (!manifest.generated)
    return { state: "stale", reason: "manifest has no generated date", checks: [] };
  if (manifest.generated !== today) {
    return {
      state: "stale",
      reason: `generated ${manifest.generated}, today is ${today}`,
      checks: [],
    };
  }
  const checks = manifest.checks
    .slice(0, MAX_CHECKS)
    .filter((check) => check && check.path && check.contains);
  if (checks.length === 0)
    return { state: "absent", reason: "checks lack path or contains", checks: [] };
  return { state: "ready", reason: null, checks, truncated: manifest.checks.length > MAX_CHECKS };
}

async function runCheck(site, check, fetchImpl) {
  const url = `${site}${check.path.startsWith("/") ? "" : "/"}${check.path}`;
  const expectedStatus = Number.isFinite(check.status) ? check.status : 200;
  try {
    const response = await fetchImpl(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    const matched = body.includes(check.contains);
    const statusOk = response.status === expectedStatus;
    return {
      path: check.path,
      status: response.status,
      expectedStatus,
      matched,
      ok: statusOk && matched,
      detail: !statusOk
        ? `status ${response.status} != ${expectedStatus}`
        : !matched
          ? "string not served"
          : "ok",
    };
  } catch (error) {
    return {
      path: check.path,
      status: 0,
      expectedStatus,
      matched: false,
      ok: false,
      detail: error?.message ?? "fetch failed",
    };
  }
}

export async function verifyDeploy({
  site,
  today,
  manifestPath = MANIFEST_PATH,
  fetchImpl = fetch,
} = {}) {
  if (!existsSync(manifestPath)) {
    return { state: "absent", reason: "last-deploy.json is missing from the commit", checks: [] };
  }
  let manifest = null;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return { state: "absent", reason: "last-deploy.json is not valid JSON", checks: [] };
  }
  const plan = planChecks(manifest, today);
  if (plan.state !== "ready") return plan;

  const results = [];
  for (const check of plan.checks) results.push(await runCheck(site, check, fetchImpl));
  const failed = results.filter((r) => !r.ok);
  return {
    state: failed.length === 0 ? "pass" : "fail",
    reason: failed.length ? `${failed.length}/${results.length} checks failed` : null,
    summary: manifest.summary ?? "",
    checks: results,
  };
}

async function main(argv) {
  const args = parseArgs(argv);
  const result = await verifyDeploy({
    site: args.site,
    today: args.today,
    manifestPath: args.manifest,
  });

  console.log(`state=${result.state}`);
  console.log(
    `manifest=${result.reason ?? "ok"}${result.summary ? ` summary=${result.summary}` : ""}`,
  );
  for (const check of result.checks ?? []) {
    console.log(
      `check ${check.ok ? "ok" : "FAIL"} ${check.path} status=${check.status} matched=${check.matched} ${check.detail}`,
    );
  }
  if (result.state === "pass") return 0;
  if (result.state === "fail") return 1;
  return 2;
}

/**
 * True only when this file is the process entry point. `pathToFileURL(argv[1])`
 * is not enough: on macOS `/var/folders` is a symlink to `/private/var`, so a
 * module started by absolute path compares unequal to `import.meta.url` and the
 * CLI silently does nothing. Compare real paths instead.
 */
function isEntryPoint() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return pathToFileURL(process.argv[1]).href === import.meta.url;
  }
}

if (isEntryPoint()) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(`deploy verification crashed: ${error?.stack ?? error}`);
      process.exit(2);
    });
}
