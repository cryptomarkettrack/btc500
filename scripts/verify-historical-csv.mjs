/**
 * Post-build / local check that the historical archive exists and that
 * simulator dates resolve from the CSV (no exchange calls).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseCsv(text) {
  const prices = new Map();
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const comma = line.indexOf(",");
    if (comma < 0) continue;
    const date = line.slice(0, comma).trim().split(" ")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const rest = line.slice(comma + 1);
    const next = rest.indexOf(",");
    const close = Number((next < 0 ? rest : rest.slice(0, next)).trim().replace(/^"|"$/g, ""));
    if (Number.isFinite(close) && close > 0) prices.set(date, close);
  }
  return prices;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const csvPath = join(root, "public", "btc-usd-max.csv");
if (!existsSync(csvPath)) {
  console.error("FAIL: public/btc-usd-max.csv missing");
  process.exit(1);
}

const prices = parseCsv(readFileSync(csvPath, "utf8"));
const halvings = ["2012-11-28", "2016-07-09", "2020-05-11", "2024-04-20"];
const checks = [];

for (const h of halvings) {
  for (const date of [addDays(h, -500), h, addDays(h, 500)]) {
    const price = prices.get(date);
    checks.push({ label: date, price, ok: price != null });
  }
}

const outside = ["2010-01-01", "2026-08-15"];
for (const date of outside) {
  checks.push({ label: `${date} (outside)`, price: prices.get(date) ?? null, ok: !prices.has(date) });
}

const failed = checks.filter((c) => !c.ok);
console.log(`Archive days: ${prices.size}`);
for (const c of checks) {
  console.log(`${c.ok ? "OK" : "FAIL"}  ${c.label}${c.price != null ? `  $${c.price}` : ""}`);
}

const outputCsvs = [
  join(root, "dist", "client", "btc-usd-max.csv"),
  join(root, "dist", "server", "btc-usd-max.csv"),
  join(root, ".output", "public", "btc-usd-max.csv"),
  join(root, ".vercel", "output", "static", "btc-usd-max.csv"),
].filter(existsSync);

if (outputCsvs.length) {
  console.log("Build output CSV copies:");
  for (const p of outputCsvs) console.log(`  ${p}`);
} else {
  console.log("No production output dirs yet (run after `vite build`).");
}

const serverFiles = [
  ...walk(join(root, "dist", "server")),
  ...walk(join(root, ".output", "server")),
  ...walk(join(root, ".vercel", "output", "functions")),
];
const bundled = serverFiles.some((file) => {
  if (!/\.(js|mjs|cjs)$/.test(file)) return false;
  try {
    const text = readFileSync(file, "utf8");
    return text.includes("event_date,close_price_usd") && text.includes("2011-07-17 00:00:00 UTC");
  } catch {
    return false;
  }
});
if (serverFiles.length) {
  console.log(bundled ? "OK  bundled CSV text found in server JS" : "WARN  bundled CSV text not found in server JS");
}

if (failed.length) {
  console.error(`FAIL: ${failed.length} checks failed`);
  process.exit(1);
}

console.log("OK  historical CSV verification passed");
