#!/usr/bin/env node
/**
 * Generate and verify public/sitemap.xml.
 *
 * Why this exists: the sitemap was hand-maintained, so its `<lastmod>` dates
 * drifted away from the real content dates (e.g. /embed-kit claimed
 * 2026-07-27 while the page had been rebuilt on 2026-11-11, and /simulator
 * claimed a date before its last edit). Google uses `lastmod` to decide what
 * to recrawl, so a stale date means a changed page is never revisited.
 *
 * Usage:
 *   node scripts/sitemap.mjs            # regenerate public/sitemap.xml
 *   node scripts/sitemap.mjs --check    # fail if the committed file is stale
 *   node scripts/sitemap.mjs --verify   # fetch every URL, check it is indexable
 *
 * URL set: one entry per indexable route. Legal pages (/privacy, /terms) and
 * the embed endpoint are deliberately left out; archived articles are left out
 * because they are served with `noindex, nofollow`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://btc500.net";
const SITEMAP_PATH = join(ROOT, "public", "sitemap.xml");

/** Routes that are indexable but intentionally not advertised in the sitemap. */
const EXCLUDED_ROUTES = new Set(["privacy", "terms", "embed"]);

/**
 * Component folders shared by every page — a change there is not a page change.
 *
 * src/components/home/ used to be listed here. It was wrong: those components
 * are imported only by src/routes/index.tsx (the homepage), so excluding them
 * hid the 2026-11-11 homepage redesign from the sitemap. The homepage then
 * carried a lastmod of 2026-10-29 while its markup had changed, and both
 * Google and Bing read that date as "nothing to revisit here".
 */
const SHARED_COMPONENT_PREFIXES = [
  "src/components/ui/",
  "src/components/route/",
];

/** Components shared across pages that still do not change a single page's content. */
const SHARED_COMPONENT_FILES = new Set([
  "src/components/Nav.tsx",
  "src/components/Footer.tsx",
  "src/components/GoogleAnalytics.tsx",
  "src/components/ConsentBanner.tsx",
  "src/components/PageBreadcrumbs.tsx",
  "src/components/ShareButton.tsx",
  "src/components/LegalPage.tsx",
]);

function routeUrl(routeFile) {
  const name = routeFile.replace(/\.tsx$/u, "");
  if (name === "index") return "/";
  if (name.startsWith("articles.")) return `/articles/${name.slice("articles.".length)}`;
  return `/${name}`;
}

function archivedSlugs() {
  const src = readFileSync(join(ROOT, "src", "lib", "article-archive.ts"), "utf8");
  const block = src.match(/ARCHIVED_ARTICLE_SLUGS\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/u);
  if (!block) return new Set();
  return new Set([...block[1].matchAll(/"([^"]+)"/gu)].map((m) => m[1]));
}

/** Local component files a route renders directly, minus the shared ones. */
function pageComponents(routeFileAbs) {
  const src = readFileSync(routeFileAbs, "utf8");
  const files = new Set();
  for (const m of src.matchAll(/from\s+"@\/([^"]+)"/gu)) {
    const rel = `src/${m[1]}`;
    if (SHARED_COMPONENT_PREFIXES.some((p) => rel.startsWith(p))) continue;
    if (SHARED_COMPONENT_FILES.has(rel)) continue;
    for (const candidate of [
      join(ROOT, `${rel}.tsx`),
      join(ROOT, rel, "index.tsx"),
      join(ROOT, rel),
    ]) {
      if (candidate.endsWith(".tsx") && existsSync(candidate)) {
        files.add(candidate);
        break;
      }
    }
  }
  return files;
}

/** Last commit date that touched any of these paths, as YYYY-MM-DD. */
function lastModified(paths) {
  let newest = "";
  for (const p of paths) {
    const rel = p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p;
    let out = "";
    try {
      out = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
        cwd: ROOT,
        encoding: "utf8",
      }).trim();
    } catch {
      out = "";
    }
    if (out > newest) newest = out;
  }
  if (newest) return newest;
  // No history for this path (new, uncommitted file): fall back to its mtime.
  try {
    return statSync(p).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Whether git can answer "when did this path last change?" truthfully.
 * A shallow clone (what Vercel builds from) only has the newest commit, so
 * dates for older files would be wrong — never trust them, never let them
 * break a build.
 */
function gitHistoryIsUsable() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd: ROOT, stdio: "ignore" });
  } catch {
    return false;
  }
  try {
    return (
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        cwd: ROOT,
        encoding: "utf8",
      }).trim() !== "true"
    );
  } catch {
    return false;
  }
}

/** lastmod values already in the committed sitemap, keyed by loc. */
function committedLastmods() {
  const map = new Map();
  if (!existsSync(SITEMAP_PATH)) return map;
  const xml = readFileSync(SITEMAP_PATH, "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/gu)) {
    map.set(m[1].trim(), m[2].trim());
  }
  return map;
}

function collect() {
  const routesDir = join(ROOT, "src", "routes");
  const archived = archivedSlugs();
  const usable = gitHistoryIsUsable();
  const committed = committedLastmods();
  const urls = [];

  for (const file of readdirSync(routesDir)) {
    if (!file.endsWith(".tsx")) continue;
    const name = file.replace(/\.tsx$/u, "");
    if (name === "__root") continue;
    if (EXCLUDED_ROUTES.has(name)) continue;
    if (name.startsWith("articles.")) {
      const slug = name.slice("articles.".length);
      if (archived.has(slug)) continue;
    }
    const routePath = join("src", "routes", file);
    const routeAbs = join(ROOT, routePath);
    const loc = `${SITE}${routeUrl(file)}`;
    const lastmod = usable
      ? lastModified([routeAbs, ...pageComponents(routeAbs)])
      : (committed.get(loc) ?? new Date().toISOString().slice(0, 10));
    urls.push({ loc, lastmod });
  }

  // Homepage first, then alphabetical, so the file is byte-stable across runs.
  urls.sort((a, b) => {
    if (a.loc === `${SITE}/`) return -1;
    if (b.loc === `${SITE}/`) return 1;
    return a.loc.localeCompare(b.loc);
  });
  return { urls, usable };
}

function render(urls) {
  const body = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${body}\n\n</urlset>\n`;
}

async function verify(urls) {
  let failures = 0;
  for (const u of urls) {
    const res = await fetch(u.loc, { redirect: "manual" });
    const html = res.status === 200 ? await res.text() : "";
    const robots = /<meta name="robots" content="([^"]*)"/u.exec(html)?.[1] ?? "(none)";
    const canonical = /<link rel="canonical" href="([^"]*)"/u.exec(html)?.[1] ?? "(none)";
    const indexable = robots.includes("index") && !robots.includes("noindex");
    const selfCanonical = canonical === u.loc;
    const ok = res.status === 200 && indexable && selfCanonical;
    if (!ok) failures += 1;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${String(res.status).padEnd(3)} ${u.loc}` +
        `${indexable ? "" : " robots=" + robots}` +
        `${selfCanonical ? "" : " canonical=" + canonical}`,
    );
  }
  console.log(
    failures === 0
      ? `\nAll ${urls.length} sitemap URLs are indexable.`
      : `\n${failures} URL(s) failed.`,
  );
  return failures === 0;
}

const mode = process.argv[2] ?? "";

if (mode === "--verify") {
  const ok = await verify(collect().urls);
  process.exit(ok ? 0 : 1);
} else {
  const { urls, usable } = collect();
  const xml = render(urls);
  if (mode === "--check") {
    if (!usable) {
      console.log(
        "public/sitemap.xml not checked: this checkout has no usable git history (shallow clone). Run `npm run sitemap` on a full checkout.",
      );
      process.exit(0);
    }
    const current = existsSync(SITEMAP_PATH) ? readFileSync(SITEMAP_PATH, "utf8") : "";
    if (current === xml) {
      console.log(`public/sitemap.xml is up to date (${urls.length} URLs).`);
      process.exit(0);
    }
    console.error("public/sitemap.xml is stale — run: node scripts/sitemap.mjs");
    process.exit(1);
  }
  writeFileSync(SITEMAP_PATH, xml);
  console.log(`Wrote public/sitemap.xml with ${urls.length} URLs.`);
  for (const u of urls) console.log(`  ${u.lastmod}  ${u.loc}`);
}
