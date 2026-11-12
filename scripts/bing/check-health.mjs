#!/usr/bin/env node
/**
 * Bing readiness check — the keyless half of the Bing story.
 *
 * Everything here runs against production with no API key and no Bing account
 * login, so it can run every day without asking anything of anyone. It answers
 * one question: if Bing crawled btc500.net right now, would it find a
 * complete, crawlable, current copy of the site?
 *
 * Checks:
 *   1. robots.txt is served, names the sitemap, and does not block msnbot
 *   2. sitemap.xml is served and every URL in it returns 200 without redirecting
 *   3. every sitemap <lastmod> is not older than the last commit to the route
 *      it points at (a stale lastmod is a page Bing is never asked to revisit)
 *   4. the IndexNow key file is served with the right content
 *   5. an IndexNow push of every sitemap URL is accepted
 *   6. the Bing verification meta tag is present in the homepage HTML
 *   7. /llms.txt and /llms-full.txt are served (the AI-answer surfaces)
 *
 * Usage:
 *   node scripts/bing/check-health.mjs [--site=https://btc500.net]
 *
 * Writes scripts/bing/output/health-latest.json and prints a verdict.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");
const OUTPUT_DIR = resolve(HERE, "output");

const args = process.argv.slice(2);
const siteArg = args.find((a) => a.startsWith("--site="));
const SITE = (
  siteArg ? siteArg.split("=")[1] : process.env.BING_SITE || "https://btc500.net"
).replace(/\/+$/, "");

const findings = [];

function finding(severity, id, message, detail) {
  findings.push({ severity, id, message, detail: detail ?? null });
}

/** Git's last commit date for a path, as YYYY-MM-DD. */
function lastCommitDate(path) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", path], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Map a public path to the route file that renders it. */
function routeFileFor(path) {
  const clean = path.replace(/\/$/, "") || "/";
  const routes = join(REPO_ROOT, "src", "routes");
  if (!existsSync(routes)) return null;
  const files = readdirSync(routes);
  // "/articles/foo" -> "articles.foo"; "/" -> "index"
  const base = clean === "/" ? "index" : clean.replace(/^\//, "").split("/").join(".");
  // Dot routes escape their extension: "data.500-day-cycles[.]json.ts"
  const candidates = [base, base.replace(/\.([^.]+)$/u, "[.]$1")];

  for (const candidate of candidates) {
    const match = files.find(
      (f) => f.startsWith(`${candidate}.`) || f.startsWith(`${candidate}[.]`),
    );
    if (match) return join(routes, match);
  }
  return null;
}

/**
 * Every repo path whose changes affect a URL. The homepage is special: its
 * markup lives in src/components/home, which the sitemap generator treats as
 * shared and excludes from the lastmod derivation — so a home redesign moves
 * the homepage without moving its lastmod.
 */
function sourcesForPath(path) {
  const clean = path.replace(/\/$/, "") || "/";
  const sources = [];
  if (clean === "/") {
    sources.push("src/routes/index.tsx");
    const home = join(REPO_ROOT, "src", "components", "home");
    if (existsSync(home)) sources.push("src/components/home");
  }
  const file = routeFileFor(clean);
  if (file) sources.push(file.replace(`${REPO_ROOT}/`, ""));
  return sources;
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      ...options,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timer);
  }
}

async function checkRobots() {
  const { response, text } = await fetchText(`${SITE}/robots.txt`);
  if (!response.ok) {
    finding("fail", "robots-unreachable", `robots.txt returned ${response.status}`, SITE);
    return { sitemapUrls: [] };
  }

  const groups = text.split(/\n\s*\n/);
  const wildcardGroup = groups.find((g) => /^\s*User-agent:\s*\*/im.test(g)) ?? "";
  const bingGroup = groups.find((g) => /^\s*User-agent:\s*msnbot/im.test(g)) ?? "";
  const bingRules = (bingGroup || wildcardGroup).split("\n");
  const bingBlocked = bingRules.some((line) => /^\s*disallow:\s*\/\s*$/im.test(line));

  if (!/^\s*sitemap:\s*https?:\/\//im.test(text)) {
    finding("fail", "robots-no-sitemap", "robots.txt does not point at a sitemap", null);
  }
  if (!bingGroup) {
    finding(
      "warn",
      "robots-no-msnbot-group",
      "robots.txt has no explicit msnbot group (it relies on the wildcard group)",
      "Bing honours its own named group when present; naming it removes ambiguity.",
    );
  }
  if (bingBlocked) {
    finding("fail", "robots-blocks-msnbot", "robots.txt blocks msnbot for the whole site", null);
  }

  const sitemapUrls = [...text.matchAll(/^\s*Sitemap:\s*(\S+)/gim)].map((m) => m[1].trim());
  return { sitemapUrls };
}

async function checkSitemap(sitemapUrls) {
  const { response, text } = await fetchText(`${SITE}/sitemap.xml`);
  if (!response.ok) {
    finding("fail", "sitemap-unreachable", `sitemap.xml returned ${response.status}`, SITE);
    return [];
  }

  const entries = [];
  for (const block of text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block[1]);
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(block[1]);
    entries.push({ url: loc[1].trim(), lastmod: lastmod ? lastmod[1].trim() : null });
  }

  if (entries.length === 0) finding("fail", "sitemap-empty", "sitemap.xml contains no URLs", null);

  // robots.txt should name this same sitemap.
  for (const declared of sitemapUrls) {
    if (!declared.includes("/sitemap.xml")) continue;
    const declaredCount = await sitemapUrlCount(declared);
    if (declaredCount != null && declaredCount !== entries.length) {
      finding(
        "warn",
        "sitemap-count-mismatch",
        `robots.txt names a sitemap with ${declaredCount} URLs; /sitemap.xml has ${entries.length}`,
        declared,
      );
    }
  }

  return entries;
}

async function sitemapUrlCount(url) {
  try {
    const { response, text } = await fetchText(url);
    if (!response.ok) return null;
    return (text.match(/<url>/g) ?? []).length;
  } catch {
    return null;
  }
}

async function checkUrlStatuses(entries) {
  let failures = 0;
  let redirects = 0;

  for (const entry of entries) {
    let response;
    try {
      response = await fetch(entry.url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      finding(
        "fail",
        "url-unreachable",
        `${entry.url} did not respond`,
        String(error.message ?? error),
      );
      failures += 1;
      continue;
    }
    if (response.status >= 300 && response.status < 400) {
      redirects += 1;
      finding(
        "warn",
        "url-redirects",
        `${entry.url} redirects (${response.status} -> ${response.headers.get("location")})`,
        "Sitemap URLs should return 200 directly.",
      );
    } else if (response.status !== 200) {
      failures += 1;
      finding("fail", "url-status", `${entry.url} returned ${response.status}`, null);
    }
  }

  if (redirects === 0 && failures === 0) {
    finding("ok", "url-status", `All ${entries.length} sitemap URLs return 200`, null);
  }
}

async function checkLastmod(entries) {
  let stale = 0;
  for (const entry of entries) {
    if (!entry.lastmod) continue;
    const sources = sourcesForPath(new URL(entry.url).pathname);
    for (const source of sources) {
      const committed = lastCommitDate(source);
      if (!committed) continue;
      if (entry.lastmod < committed) {
        stale += 1;
        finding(
          "warn",
          "sitemap-lastmod-stale",
          `${entry.url} says lastmod ${entry.lastmod}; ${source} was committed ${committed}`,
          "Bing and Google use lastmod to decide what to recrawl, so a stale date means a changed page is never revisited.",
        );
      }
    }
  }
  if (stale === 0) {
    finding(
      "ok",
      "sitemap-lastmod",
      "No sitemap lastmod is older than the last commit behind its page",
      null,
    );
  }
}

async function checkIndexNowKey() {
  const pub = join(REPO_ROOT, "public");
  const keyFile = readdirSync(pub).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!keyFile) {
    finding("fail", "indexnow-key-missing", "No IndexNow key file in public/", null);
    return null;
  }
  const expected = readFileSync(join(pub, keyFile), "utf8").trim();
  try {
    const { response, text } = await fetchText(`${SITE}/${keyFile}`);
    if (!response.ok) {
      finding("fail", "indexnow-key-unreachable", `${keyFile} returned ${response.status}`, SITE);
      return null;
    }
    if (text.trim() !== expected) {
      finding("fail", "indexnow-key-mismatch", `${keyFile} does not contain the key`, null);
      return null;
    }
    finding("ok", "indexnow-key", `IndexNow key ${keyFile} is served correctly`, null);
    return { key: expected, keyFile };
  } catch (error) {
    finding("fail", "indexnow-key-unreachable", `${keyFile} could not be fetched`, String(error));
    return null;
  }
}

async function checkIndexNowPush(entries, keyInfo) {
  if (!keyInfo) return;
  const urls = entries.map((entry) => entry.url).slice(0, 500);
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE).host,
        key: keyInfo.key,
        keyLocation: `${SITE}/${keyInfo.keyFile}`,
        urlList: urls,
      }),
    });
    if (response.status === 200 || response.status === 202) {
      finding(
        "ok",
        "indexnow-accepted",
        `IndexNow accepted ${urls.length} URL(s) (HTTP ${response.status})`,
        response.status === 202 ? "Key validation pending." : null,
      );
    } else {
      finding(
        "fail",
        "indexnow-rejected",
        `IndexNow returned HTTP ${response.status}`,
        await response.text(),
      );
    }
  } catch (error) {
    finding("fail", "indexnow-error", "IndexNow push failed", String(error));
  }
}

async function checkVerificationMeta() {
  try {
    const { response, text } = await fetchText(`${SITE}/`);
    if (!response.ok) {
      finding("fail", "home-unreachable", `Homepage returned ${response.status}`, null);
      return;
    }
    if (!/name=["']msvalidate\.01["']/i.test(text)) {
      finding(
        "fail",
        "bing-verification-missing",
        "The homepage has no msvalidate.01 meta tag",
        "Bing Webmaster Tools cannot verify the site without it (or a BingSiteAuth.xml file).",
      );
    } else {
      finding(
        "ok",
        "bing-verification",
        "The msvalidate.01 meta tag is present in the homepage HTML",
        null,
      );
    }
    if (!/<link[^>]+rel=["']canonical["']/i.test(text)) {
      finding("warn", "canonical-missing", "The homepage has no rel=canonical link", null);
    }
  } catch (error) {
    finding("fail", "home-unreachable", "The homepage could not be fetched", String(error));
  }
}

async function checkAiSurfaces() {
  for (const path of ["/llms.txt", "/llms-full.txt", "/feed.xml"]) {
    try {
      const { response } = await fetchText(`${SITE}${path}`);
      if (!response.ok) {
        finding("warn", "ai-surface", `${path} returned ${response.status}`, null);
      }
    } catch (error) {
      finding("warn", "ai-surface", `${path} could not be fetched`, String(error));
    }
  }
}

async function main() {
  const robots = await checkRobots();
  const entries = await checkSitemap(robots.sitemapUrls);
  await checkUrlStatuses(entries);
  await checkLastmod(entries);
  const keyInfo = await checkIndexNowKey();
  await checkIndexNowPush(entries, keyInfo);
  await checkVerificationMeta();
  await checkAiSurfaces();

  const failures = findings.filter((f) => f.severity === "fail");
  const warnings = findings.filter((f) => f.severity === "warn");
  const verdict = failures.length ? "fail" : warnings.length ? "warn" : "ok";

  const report = {
    site: SITE,
    generated: new Date().toISOString(),
    verdict,
    counts: {
      fail: failures.length,
      warn: warnings.length,
      ok: findings.length - failures.length - warnings.length,
    },
    sitemapUrls: entries.length,
    findings,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  writeFileSync(
    resolve(OUTPUT_DIR, `health-${stamp}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    resolve(OUTPUT_DIR, "health-latest.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  for (const item of findings) {
    const mark = item.severity === "fail" ? "FAIL" : item.severity === "warn" ? "WARN" : "ok  ";
    console.log(`${mark} ${item.id}: ${item.message}${item.detail ? ` (${item.detail})` : ""}`);
  }
  console.log(
    `Bing health: ${verdict.toUpperCase()} — ${entries.length} sitemap URLs, ` +
      `${failures.length} failure(s), ${warnings.length} warning(s)`,
  );
  console.log(`Report: ${resolve(OUTPUT_DIR, "health-latest.json")}`);

  process.exitCode = failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(`bing health check crashed: ${error?.stack ?? error}`);
  process.exit(1);
});
