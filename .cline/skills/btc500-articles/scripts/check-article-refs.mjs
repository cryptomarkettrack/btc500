#!/usr/bin/env node
/**
 * check-article-refs.mjs — btc500.net article reference audit.
 *
 * Verifies that every article route in src/routes/ is registered in ALL of the
 * SEO/AEO references that must stay in sync:
 *
 *   - src/lib/articles.ts       (ArticleMeta — powers head/schema/listing)
 *   - public/sitemap.xml        (crawler discovery)
 *   - public/llms.txt           (AI/answer-engine short index)
 *   - public/llms-full.txt      (AI/answer-engine full knowledge base)
 *
 * Also validates that public/sitemap.xml is well-formed XML and that every
 * article route has a matching content component in src/components/articles/.
 *
 * Usage: node .cline/skills/btc500-articles/scripts/check-article-refs.mjs
 * Exit code 0 = all refs present. Exit code 1 = one or more problems (listed).
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "../../../.."); // scripts/ -> skills/ -> .cline/ -> repo root

const read = (p) => readFileSync(p, "utf8");
const errors = [];
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => errors.push(msg);

// --- Collect article slugs from route files ---------------------------------
const routesDir = resolve(root, "src/routes");
let slugs = [];
try {
  slugs = readdirSync(routesDir)
    .filter((f) => /^articles\.[^.]+\.tsx$/.test(f))
    .map((f) => f.replace(/^articles\./, "").replace(/\.tsx$/, ""));
} catch (err) {
  fail(`cannot read routes dir ${routesDir}: ${err.message}`);
}

if (slugs.length === 0) {
  fail("no article routes found under src/routes/");
  console.error("\nFAIL: " + errors.join("\n  - "));
  process.exit(1);
}

console.log(`Auditing ${slugs.length} article route(s): ${slugs.join(", ")}`);

// --- src/lib/articles.ts -----------------------------------------------------
const articlesLibPath = resolve(root, "src/lib/articles.ts");
if (existsSync(articlesLibPath)) {
  const lib = read(articlesLibPath);
  for (const slug of slugs) {
    if (lib.includes(`slug: "${slug}"`)) {
      ok(`src/lib/articles.ts has metadata for ${slug}`);
    } else {
      fail(`src/lib/articles.ts missing ArticleMeta for slug "${slug}"`);
    }
  }
} else {
  fail(`missing ${articlesLibPath}`);
}

// --- Content component -------------------------------------------------------
const componentsDir = resolve(root, "src/components/articles");
for (const slug of slugs) {
  // Derive the component path from the route's own import statement, so we
  // don't need to guess the filename from the slug (some articles use a
  // shorter component name, e.g. OndoFinanceArticle).
  const routePath = resolve(root, "src/routes", `articles.${slug}.tsx`);
  let componentName = null;
  try {
    const routeSrc = read(routePath);
    const m = routeSrc.match(/from\s+"@\/components\/articles\/([^"]+)"/);
    componentName = m ? m[1] : null;
  } catch {
    fail(`cannot read route file ${routePath}`);
  }
  const componentPath = componentName ? resolve(componentsDir, `${componentName}.tsx`) : null;
  if (componentPath && existsSync(componentPath)) {
    ok(`content component for ${slug} (${componentName}.tsx)`);
  } else {
    fail(`route ${slug} imports a missing component: @/components/articles/${componentName ?? "?"}`);
  }
}

// --- public/sitemap.xml ------------------------------------------------------
const sitemapPath = resolve(root, "public/sitemap.xml");
let sitemap = "";
if (existsSync(sitemapPath)) {
  sitemap = read(sitemapPath);
  // Minimal well-formedness check: balanced <url> and closing root tag
  const opens = (sitemap.match(/<url>/g) || []).length;
  const closes = (sitemap.match(/<\/url>/g) || []).length;
  if (opens !== closes) fail(`public/sitemap.xml unbalanced <url> tags (${opens} open / ${closes} close)`);
  if (!sitemap.includes("</urlset>")) fail("public/sitemap.xml missing closing </urlset>");
  ok("public/sitemap.xml <url> tags balanced");
} else {
  fail(`missing ${sitemapPath}`);
}

for (const slug of slugs) {
  if (sitemap.includes(`https://btc500.net/articles/${slug}</loc>`)) {
    ok(`sitemap.xml has /articles/${slug}`);
  } else {
    fail(`public/sitemap.xml missing https://btc500.net/articles/${slug}`);
  }
}

// --- public/llms.txt ---------------------------------------------------------
const llmsPath = resolve(root, "public/llms.txt");
if (existsSync(llmsPath)) {
  const llms = read(llmsPath);
  for (const slug of slugs) {
    if (llms.includes(`/articles/${slug}`)) {
      ok(`llms.txt references /articles/${slug}`);
    } else {
      fail(`public/llms.txt missing /articles/${slug}`);
    }
  }
} else {
  fail(`missing ${llmsPath}`);
}

// --- public/llms-full.txt -----------------------------------------------------
const llmsFullPath = resolve(root, "public/llms-full.txt");
if (existsSync(llmsFullPath)) {
  const full = read(llmsFullPath);
  for (const slug of slugs) {
    if (full.includes(`/articles/${slug}`)) {
      ok(`llms-full.txt references /articles/${slug}`);
    } else {
      fail(`public/llms-full.txt missing /articles/${slug}`);
    }
  }
} else {
  fail(`missing ${llmsFullPath}`);
}

// --- Summary ------------------------------------------------------------------
if (errors.length) {
  console.error(`\nFAIL (${errors.length}):\n  - ` + errors.join("\n  - "));
  process.exit(1);
}
console.log("\nAll article SEO/AEO references are in sync.");
