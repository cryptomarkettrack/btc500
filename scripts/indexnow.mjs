#!/usr/bin/env node
/**
 * Submit every public URL to IndexNow (Bing, Yandex, Seznam, Naver, Yep).
 *
 * Google ignores IndexNow, but Bing powers ChatGPT search-style results and
 * Copilot, so fast re-crawl there directly helps AI answers pick up new pages.
 *
 * The key lives in public/<key>.txt and is served at https://btc500.net/<key>.txt.
 * Run after deploying: `bun run indexnow`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://btc500.net";

function findKey() {
  const pub = join(ROOT, "public");
  const keyFile = readdirSync(pub).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!keyFile) throw new Error("No IndexNow key file found in public/");
  return { key: readFileSync(join(pub, keyFile), "utf8").trim(), keyFile };
}

function sitemapUrls() {
  const xml = readFileSync(join(ROOT, "public", "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const { key, keyFile } = findKey();
const urlList = sitemapUrls();

if (urlList.length === 0) throw new Error("Sitemap contained no URLs");

const body = {
  host: new URL(SITE).host,
  key,
  keyLocation: `${SITE}/${keyFile}`,
  urlList,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// IndexNow returns 200 (accepted) or 202 (accepted, key validation pending).
console.log(`IndexNow: ${res.status} ${res.statusText} — ${urlList.length} URLs submitted`);
if (!res.ok && res.status !== 202) {
  console.error(await res.text().catch(() => ""));
  process.exit(1);
}
