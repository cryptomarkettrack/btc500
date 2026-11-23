#!/usr/bin/env node
// model-select.mjs — pick the free OpenCode models with the most usable quota.
//
// There is no per-model remaining-quota API: /api/experimental/usage/limits
// only reports Go allowance / Console budgets, and is null without a Console
// sign-in. This tool therefore does the next best thing:
//
//   1. list models from the live registry and keep only cost=0, active ones;
//   2. probe the top candidates with a one-line "reply OK" prompt, which
//      distinguishes "free usage limit reached" and "model unavailable" from
//      a model that can actually run right now;
//   3. cache the result (6h by default) so repeated cycles do not burn quota;
//   4. write an ordered model list for the runner scripts, with hy4 weighted
//      first (two attempts) and DeepSeek next because it finishes fast.
//
// Usage:
//   node scripts/autonomous/model-select.mjs --out FILE [--cache-hours 6]
//   node scripts/autonomous/model-select.mjs --force --json
//
// Only free models from the `opencode` provider can ever be selected.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE =
  process.env.BTC500_GROWTH_STATE_DIR ||
  join(process.env.HOME, ".local/state/btc500-growth");
const LEDGER = join(STATE, "model-quota.json");
const PROBE_TIMEOUT = 90_000;
const PREFERRED = ["hy4-flash-free", "deepseek-v4.1-flash-free"];

function args() {
  const o = { out: null, cacheHours: 6, force: false, json: false };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === "--out") o.out = process.argv[++i];
    else if (a === "--cache-hours") o.cacheHours = Number(process.argv[++i]) || 6;
    else if (a === "--force") o.force = true;
    else if (a === "--json") o.json = true;
  }
  return o;
}

function api(path) {
  const r = spawnSync("opencode", ["api", "get", path], {
    encoding: "utf8",
    timeout: 30_000,
  });
  if (r.status !== 0) throw new Error(`opencode api ${path} failed: ${r.stderr || r.status}`);
  return JSON.parse(r.stdout);
}

/** Free, active models from the live registry — never a paid model. */
function freeModels() {
  const data = api("/api/model")?.data;
  if (!Array.isArray(data)) throw new Error("unexpected /api/model response");
  return data
    .filter((m) => m.providerID === "opencode" && m.status === "active" && m.enabled !== false)
    .filter((m) => Array.isArray(m.cost) && m.cost.every((c) => Number(c?.input || 0) === 0 && Number(c?.output || 0) === 0))
    .filter((m) => m.id.endsWith("-free") || /free/i.test(m.name || ""))
    .map((m) => m.id);
}

function readLedger() {
  try {
    return JSON.parse(readFileSync(LEDGER, "utf8"));
  } catch {
    return { probedAt: 0, results: {} };
  }
}

function probe(id) {
  const r = spawnSync(
    "opencode",
    [
      "run",
      "--model", `opencode/${id}`,
      "--archived",
      "--title", "btc500-model-probe",
      "Reply with exactly OK. Do not use tools or edit files.",
    ],
    { encoding: "utf8", timeout: PROBE_TIMEOUT, cwd: REPO },
  );
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  if (/Free usage limit reached|usage limit/i.test(out)) return { ok: false, reason: "free limit" };
  if (/Model unavailable/i.test(out)) return { ok: false, reason: "unavailable" };
  if (/\bOK\b/.test(out)) return { ok: true, reason: "ok" };
  return { ok: false, reason: `no response (rc=${r.status})` };
}

function rank(ids, results) {
  const score = (id) => {
    let s = 0;
    if (PREFERRED[0] === id) s += 100;
    if (PREFERRED[1] === id) s += 60;
    if (results[id]?.ok) s += 30;
    if (results[id]?.reason === "free limit") s -= 80;
    if (results[id]?.reason === "unavailable") s -= 100;
    return s;
  };
  return [...ids].sort((a, b) => score(b) - score(a));
}

function main() {
  const o = args();
  mkdirSync(STATE, { recursive: true });
  const ledger = readLedger();
  const fresh = Date.now() - (ledger.probedAt || 0) < o.cacheHours * 3_600_000;
  const ids = freeModels();
  let results = ledger.results || {};

  if (!o.force && fresh && Array.isArray(ledger.models) && ledger.models.length) {
    // Reuse the cached verdict; still keep the registry's current free list.
    for (const id of ids) if (results[id] === undefined) results[id] = { ok: true, reason: "unprobed" };
  } else {
    const candidates = rank(ids, results).slice(0, 5);
    for (const id of candidates) {
      const result = probe(id);
      results[id] = { ...result, at: Date.now() };
      console.error(`${id}: ${result.reason}`);
      if (result.ok && Object.values(results).filter((r) => r.ok).length >= 3) break;
    }
    ledger.probedAt = Date.now();
  }

  const ordered = rank(ids, results).filter((id) => results[id]?.reason !== "unavailable");
  const selected = [];
  for (const id of ordered) {
    selected.push(`opencode/${id}`);
    if (id === PREFERRED[0]) selected.push(`opencode/${id}`); // extra weight for hy4
  }
  // Hard guard: only free provider models can leave this script.
  const allowed = new Set(ids.map((id) => `opencode/${id}`));
  const models = selected.filter((m) => allowed.has(m));

  Object.assign(ledger, { results, models, generatedAt: Date.now(), count: models.length });
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n");

  const out = o.out && resolve(o.out);
  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, models.join("\n") + "\n");
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    freeModels: ids,
    selected: models,
    results,
    cached: !o.force && fresh,
  };
  if (o.json) console.log(JSON.stringify(payload, null, 2));
  else if (out) console.log(`Selected ${models.length} free models -> ${out}`);
  else console.log(models.join("\n"));
}

main();
