#!/usr/bin/env node
/**
 * Tell Bing that every URL on the site is new or changed.
 *
 * Two channels, both pushed from the same sitemap:
 *
 *   IndexNow        api.indexnow.org  — no key, no quota, reaches Bing plus
 *                     Yandex, Seznam, Naver and Yep. This is the push that
 *                     matters for answer engines, which read Bing's index.
 *   URL Submission  ssl.bing.com      — Bing's own API, uses the daily quota
 *                     (10,000/day). Bing pushes back at you with crawl
 *                     latency and indexing stats, so it is worth spending
 *                     only on URLs that changed.
 *
 * Usage:
 *   node scripts/bing/submit-urls.ts            # every sitemap URL
 *   node scripts/bing/submit-urls.ts --changed  # only URLs whose lastmod moved
 *   node scripts/bing/submit-urls.ts --dry-run
 *
 * Needs a Bing API key for the URL Submission half; without one, IndexNow
 * still runs, because that is the half that needs no credentials.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import {
  ConfigError,
  bingRequest,
  loadDotEnv,
  OUTPUT_DIR,
  parseFlags,
  PROJECT_ROOT,
  readApiKey,
  siteUrl,
  sitemapUrls,
} from "./client.ts";

const HELP = `Bing submission

Usage:
  node scripts/bing/submit-urls.ts [options]

Options:
  --changed      Only submit URLs whose <lastmod> is newer than the previous run
  --dry-run      Print what would be submitted and exit
  --help         Show this message

Environment:
  BING_API_KEY   Bing Webmaster API key (IndexNow does not need one)
  BING_SITE      Default site, same as --site
`;

const STATE_FILE = resolvePath(OUTPUT_DIR, "submitted.json");

function readState() {
  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function submitIndexNow(urls, key, keyFile) {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteUrl()).host,
      key,
      keyLocation: `${siteUrl()}/${keyFile}`,
      urlList: urls,
    }),
  });
  const body = await response.text().catch(() => "");
  return { status: response.status, body: body.slice(0, 300) };
}

async function main() {
  loadDotEnv();
  const flags = parseFlags(process.argv.slice(2));
  if (flags.get("help") === "true") {
    console.log(HELP);
    return;
  }

  const site = siteUrl();
  const entries = sitemapUrls();
  if (entries.length === 0) {
    console.error("public/sitemap.xml contains no URLs — nothing to submit.");
    process.exit(1);
  }

  const state = readState();
  const previous = state.lastmod ?? {};
  const changedOnly = flags.get("changed") === "true";
  const targets = changedOnly
    ? entries.filter((entry) => previous[entry.url] !== entry.lastmod)
    : entries;

  console.log(`Site:    ${site}`);
  console.log(`Sitemap: ${entries.length} URLs (${targets.length} to submit)`);

  if (flags.get("dry-run") === "true") {
    for (const entry of targets) console.log(`  ${entry.url}  lastmod=${entry.lastmod ?? "—"}`);
    return;
  }

  const urls = targets.map((entry) => entry.url);

  // --- IndexNow (no key required) ------------------------------------------
  let indexNow = { status: 0, body: "skipped" };
  const pub = resolvePath(PROJECT_ROOT, "public");
  const keyFile = readdirSync(pub).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!keyFile) {
    console.error("No IndexNow key file in public/ — skipping the IndexNow push.");
  } else {
    const key = readFileSync(resolvePath(pub, keyFile), "utf8").trim();
    try {
      indexNow = await submitIndexNow(urls.slice(0, 10_000), key, keyFile);
      console.log(`IndexNow: HTTP ${indexNow.status}`);
      if (indexNow.status !== 200 && indexNow.status !== 202) {
        console.error(`IndexNow rejected the push: ${indexNow.body}`);
      }
    } catch (error) {
      console.error(`IndexNow push failed: ${error?.message ?? error}`);
    }
  }

  // --- Bing URL Submission API (key required) -------------------------------
  let quota = null;
  let submitted = 0;
  if (readApiKey()) {
    try {
      quota = await bingRequest("GetUrlSubmissionQuota", { query: { siteUrl: site } });
    } catch (error) {
      console.error(`Could not read the submission quota: ${error?.message ?? error}`);
    }

    const BATCH = 500;
    for (let i = 0; i < urls.length; i += BATCH) {
      const batch = urls.slice(i, i + BATCH);
      try {
        await bingRequest("SubmitUrlBatch", {
          method: "POST",
          body: { siteUrl: site, urlList: batch },
        });
        submitted += batch.length;
        console.log(`Submitted ${batch.length} URL(s) to the Bing API`);
      } catch (error) {
        console.error(`Bing API batch failed: ${error?.message ?? error}`);
        break;
      }
    }
  } else {
    console.log(
      "Bing URL Submission API: skipped (no API key). IndexNow already told Bing —\n" +
        "see scripts/bing/SETUP.txt if you want the extra quota and the crawl stats.",
    );
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(
    STATE_FILE,
    `${JSON.stringify({ submittedAt: new Date().toISOString(), lastmod: Object.fromEntries(entries.map((e) => [e.url, e.lastmod])) }, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log(`IndexNow HTTP ${indexNow.status}   Bing API URLs submitted: ${submitted}`);
}

const invokedDirectly =
  process.argv[1] !== undefined && resolvePath(process.argv[1]).endsWith("submit-urls.ts");

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
