#!/usr/bin/env node
/**
 * Verdict validator — the mechanical half of the accountability loop.
 *
 * The reviewer is a model; this is not. It reads `review-latest.json` against
 * the data in `review-input.json` and answers one question: is this verdict
 * allowed by the evidence? A reviewer that claims improvement while
 * `rule.mayClaimImproving` is false is rejected here, loudly, instead of
 * quietly becoming the record of a week that gained nothing.
 *
 * Exit codes: 0 valid, 1 invalid, 2 missing or unreadable review file.
 *
 * Usage:
 *   node scripts/autonomous/validate-review.mjs --today 2026-10-26 \
 *     --mode daily [--state-dir DIR] [--repo DIR]
 */

import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = join(HERE, "..", "..");
const DEFAULT_STATE_DIR =
  process.env.BTC500_REVIEW_STATE_DIR ||
  process.env.BTC500_GROWTH_STATE_DIR ||
  join(homedir(), ".local", "state", "btc500-growth");

const VERDICTS = ["improving", "stagnant", "failing"];
const SIGNAL_STATES = ["green", "flat", "stalled", "regressed", "stale", "unknown"];
const CHANNELS = ["x", "reply", "community", "newsletter", "email", "embed", "github", "other"];
const SITE_URL = "https://btc500.net";
/** X counts a link as 23 characters; keep the whole post inside 280 anyway. */
const X_CONTENT_MAX = 280;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MANDATE_MAX_AGE_DAYS = 14;
const ASK_MAX = 5;

function shiftDays(date, days) {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

function isFilled(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * @returns {{ok: boolean, errors: string[], summary: object}}
 */
export function validateReview(review, input, { today, mode }) {
  const errors = [];
  const rule = input?.rule ?? {};
  const streak = input?.reviewStreak?.nonImproving ?? 0;

  if (!review || typeof review !== "object" || Array.isArray(review)) {
    return { ok: false, errors: ["the review file is not a JSON object"], summary: {} };
  }

  // The seed file (or an empty write) means no review happened at all — the
  // caller reports that as "absent" rather than "wrong", because the two need
  // different follow-ups.
  if (!isFilled(review.generated)) {
    return {
      ok: false,
      errors: ["no verdict was produced: generated is empty (this is still the seed file)"],
      summary: {
        verdict: null,
        mode: null,
        signals: 0,
        mandates: 0,
        targets: 0,
        selfChanges: 0,
        ownerAsks: 0,
        mayClaimImproving: rule.mayClaimImproving ?? null,
        streak,
      },
      absent: true,
    };
  }

  // 1. Freshness and mode: yesterday's verdict cannot pass for today.
  if (review.generated !== today) {
    errors.push(`generated is ${JSON.stringify(review.generated)}, expected today (${today})`);
  }
  if (review.mode !== mode) {
    errors.push(`mode is ${JSON.stringify(review.mode)}, expected ${mode}`);
  }

  // 2. The verdict must be one of the three, and must obey the rule.
  if (!VERDICTS.includes(review.verdict)) {
    errors.push(`verdict ${JSON.stringify(review.verdict)} is not one of ${VERDICTS.join("/")}`);
  }
  if (rule.mayClaimImproving === false && review.verdict === "improving") {
    errors.push(
      `verdict "improving" is not allowed: ${rule.blockedBecause?.join("; ") || "the data does not show improvement"}`,
    );
  }
  const improving = review.verdict === "improving";

  // 3. Signals: enough of them, each pointing at something measurable.
  const signals = Array.isArray(review.signals) ? review.signals : [];
  if (signals.length < 3) {
    errors.push(`signals has ${signals.length} entries, expected at least 3`);
  }
  signals.forEach((signal, i) => {
    if (!isFilled(signal?.id)) errors.push(`signals[${i}] is missing an id`);
    if (!SIGNAL_STATES.includes(signal?.state)) {
      errors.push(
        `signals[${i}] state ${JSON.stringify(signal?.state)} is not one of ${SIGNAL_STATES.join("/")}`,
      );
    }
    if (!isFilled(signal?.note) && !isFilled(signal?.evidence)) {
      errors.push(`signals[${i}] (${signal?.id ?? "?"}) has no note quoting a number`);
    }
  });

  // 4. A non-improving verdict must explain itself and order a change.
  const why = Array.isArray(review.why) ? review.why.filter(isFilled) : [];
  if (!improving && why.length === 0) {
    errors.push("why[] must explain a stagnant or failing verdict");
  }

  const mandates = Array.isArray(review.mandates) ? review.mandates : [];
  if (!improving && mandates.length === 0) {
    errors.push("mandates[] must contain at least one action for the next cycle");
  }
  if (!improving && mandates.length > 5) {
    errors.push(`mandates has ${mandates.length} entries, the cap is 5`);
  }
  mandates.forEach((mandate, i) => {
    if (!isFilled(mandate?.id)) errors.push(`mandates[${i}] is missing an id`);
    if (!isFilled(mandate?.action))
      errors.push(`mandates[${i}] (${mandate?.id ?? "?"}) is missing an action`);
    if (!isFilled(mandate?.because))
      errors.push(`mandates[${i}] (${mandate?.id ?? "?"}) is missing the evidence (because)`);
    if (!DATE_RE.test(mandate?.due ?? "")) {
      errors.push(
        `mandates[${i}] (${mandate?.id ?? "?"}) due ${JSON.stringify(mandate?.due)} is not a date`,
      );
    } else if (mandate.due < today) {
      errors.push(`mandates[${i}] (${mandate.id}) is due ${mandate.due}, which is already past`);
    } else if (mandate.due > shiftDays(today, MANDATE_MAX_AGE_DAYS)) {
      errors.push(
        `mandates[${i}] (${mandate.id}) is due ${mandate.due}, more than ${MANDATE_MAX_AGE_DAYS} days out`,
      );
    }
  });

  // 5. Targets: something measurable must be promised, with a date.
  const targets = Array.isArray(review.targets) ? review.targets : [];
  if (targets.length === 0) {
    errors.push("targets[] must hold at least one measurable goal");
  }
  targets.forEach((target, i) => {
    for (const key of ["metric", "current", "target", "by"]) {
      if (!isFilled(target?.[key])) errors.push(`targets[${i}] is missing ${key}`);
    }
    if (isFilled(target?.by) && !DATE_RE.test(target.by)) {
      errors.push(`targets[${i}].by ${JSON.stringify(target.by)} is not a date`);
    }
  });

  // 6. Owner asks: when the site is not gaining, the reviewer must order an
  //    action only the owner can take — a finished artifact, not an idea.
  //    The automation cannot post, pitch or build links by itself.
  const asks = Array.isArray(review.owner_asks) ? review.owner_asks : [];
  if (!improving && asks.length === 0) {
    errors.push(
      "owner_asks[] must hold at least one concrete action for the owner " +
        "(a post to publish, a link to earn, a pitch to send) — no results means " +
        "something new has to happen outside this repository",
    );
  }
  if (asks.length > ASK_MAX) {
    errors.push(`owner_asks has ${asks.length} entries, the cap is ${ASK_MAX}`);
  }
  asks.forEach((ask, i) => {
    const who = `owner_asks[${i}] (${ask?.id ?? "?"})`;
    if (!isFilled(ask?.id)) errors.push(`owner_asks[${i}] is missing an id`);
    if (!CHANNELS.includes(ask?.channel)) {
      errors.push(
        `${who} channel ${JSON.stringify(ask?.channel)} is not one of ${CHANNELS.join("/")}`,
      );
    }
    if (!isFilled(ask?.action))
      errors.push(`${who} is missing an action (what exactly to do, where, when)`);
    if (!isFilled(ask?.content)) {
      errors.push(`${who} is missing content — the verbatim text the owner copies and pastes`);
    } else if (
      (ask.channel === "x" || ask.channel === "reply") &&
      ask.content.length > X_CONTENT_MAX
    ) {
      errors.push(`${who} content is ${ask.content.length} characters; X allows ${X_CONTENT_MAX}`);
    }
    if (!isFilled(ask?.url)) {
      errors.push(
        `${who} is missing a url — an ask that does not point at the site cannot grow it`,
      );
    } else if (!ask.url.startsWith(SITE_URL)) {
      errors.push(`${who} url must start with ${SITE_URL} (got ${ask.url})`);
    }
    if (!isFilled(ask?.because)) errors.push(`${who} is missing the evidence (because)`);
    if (!isFilled(ask?.measure))
      errors.push(`${who} is missing measure — how the next review proves it worked`);
    if (!DATE_RE.test(ask?.by ?? "")) {
      errors.push(`${who} by ${JSON.stringify(ask?.by)} is not a date`);
    } else if (ask.by < today) {
      errors.push(
        `${who} is due ${ask.by}, which is already past — restate it narrower instead of letting it lapse`,
      );
    } else if (ask.by > shiftDays(today, MANDATE_MAX_AGE_DAYS)) {
      errors.push(`${who} is due ${ask.by}, more than ${MANDATE_MAX_AGE_DAYS} days out`);
    }
  });

  // 7. Three consecutive non-improving reviews means the approach is wrong:
  //    the reviewer must have changed the machine, not repeated itself.
  const selfChanges = Array.isArray(review.self_changes)
    ? review.self_changes.filter(isFilled)
    : [];
  if (streak >= 3 && selfChanges.length === 0) {
    errors.push(
      `${streak} consecutive non-improving reviews: self_changes[] must record a change to how we work`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      verdict: review.verdict ?? null,
      mode: review.mode ?? null,
      signals: signals.length,
      mandates: mandates.length,
      targets: targets.length,
      selfChanges: selfChanges.length,
      ownerAsks: asks.length,
      mayClaimImproving: rule.mayClaimImproving ?? null,
      streak,
    },
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function main(argv) {
  let today = null;
  let mode = "daily";
  let stateDir = DEFAULT_STATE_DIR;
  let repo = DEFAULT_REPO;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--today" && argv[i + 1]) today = argv[++i];
    else if (argv[i] === "--mode" && argv[i + 1]) mode = argv[++i];
    else if (argv[i] === "--state-dir" && argv[i + 1]) stateDir = resolve(argv[++i]);
    else if (argv[i] === "--repo" && argv[i + 1]) repo = resolve(argv[++i]);
  }
  if (!today || !DATE_RE.test(today)) {
    console.error("validate-review: --today YYYY-MM-DD is required");
    return 2;
  }

  const reviewPath = join(repo, "scripts", "autonomous", "review-latest.json");
  if (!existsSync(reviewPath)) {
    console.error(`FAIL: ${reviewPath} does not exist`);
    return 2;
  }
  let review;
  try {
    review = readJson(reviewPath);
  } catch (error) {
    console.error(`FAIL: ${reviewPath} is not readable JSON: ${error?.message ?? error}`);
    return 2;
  }

  const inputPath = join(stateDir, "review-input.json");
  if (!existsSync(inputPath)) {
    console.error(`FAIL: ${inputPath} is missing — run collect-results.mjs first`);
    return 2;
  }
  let input;
  try {
    input = readJson(inputPath);
  } catch (error) {
    console.error(`FAIL: ${inputPath} is not readable JSON: ${error?.message ?? error}`);
    return 2;
  }

  const { ok, errors, summary, absent } = validateReview(review, input, { today, mode });
  console.log(
    `check: verdict=${summary.verdict} mode=${summary.mode} signals=${summary.signals} ` +
      `mandates=${summary.mandates} targets=${summary.targets} self_changes=${summary.selfChanges} ` +
      `asks=${summary.ownerAsks} ` +
      `rule.may_claim_improving=${summary.mayClaimImproving} streak=${summary.streak}`,
  );
  if (absent) {
    for (const error of errors) console.log(`FAIL: ${error}`);
    return 2;
  }
  if (ok) {
    console.log(`PASS: the verdict is allowed by the data (generated ${today}, mode ${mode})`);
    return 0;
  }
  for (const error of errors) console.log(`FAIL: ${error}`);
  return 1;
}

/**
 * True only when this file is the process entry point — compare real paths,
 * because macOS `/var/folders` is a symlink to `/private/var`.
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
      console.error(`validate-review crashed: ${error?.stack ?? error}`);
      process.exit(2);
    });
}

export { VERDICTS, SIGNAL_STATES, shiftDays };
