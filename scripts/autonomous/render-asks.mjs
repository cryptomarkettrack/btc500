#!/usr/bin/env node
/**
 * Owner-ask renderer — the human half of the review loop.
 *
 * When the site is not gaining, the most valuable thing the reviewer can
 * produce is an action only the owner can take: a post from @btc500halving, a
 * community comment, a newsletter pitch. This turns `owner_asks[]` in
 * `review-latest.json` into three surfaces the owner actually sees:
 *
 *   --format file     <state>/owner-asks.txt  (copy-paste ready, phone-friendly)
 *   --format notify   a short body for the notification
 *   --format commit   a body for the review's commit message
 *
 * `content` is never re-wrapped or trimmed: what the reviewer wrote is what
 * the owner copies, character for character.
 *
 * Usage:
 *   node scripts/autonomous/render-asks.mjs [--format file|notify|commit] \
 *     [--state-dir DIR] [--repo DIR]
 */

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = join(HERE, "..", "..");
const DEFAULT_STATE_DIR =
  process.env.BTC500_REVIEW_STATE_DIR ||
  process.env.BTC500_GROWTH_STATE_DIR ||
  join(homedir(), ".local", "state", "btc500-growth");

const CHANNEL_LABEL = {
  x: "X post",
  reply: "X reply",
  community: "Community post",
  newsletter: "Newsletter pitch",
  email: "Email",
  embed: "Embed offer",
  github: "Link from a repo or list",
  other: "Other",
};

/** Where the ask should be posted from / to, for the human reading it. */
function channelHint(ask) {
  if (ask.channel === "x" || ask.channel === "reply") return "from @btc500halving";
  return "";
}

export function labelFor(ask) {
  const base = CHANNEL_LABEL[ask?.channel] ?? "Ask";
  const hint = channelHint(ask);
  return hint ? `${base} ${hint}` : base;
}

function asksOf(review) {
  return Array.isArray(review?.owner_asks) ? review.owner_asks : [];
}

function whyLine(review) {
  const why = Array.isArray(review?.why)
    ? review.why.filter((w) => typeof w === "string" && w.trim())
    : [];
  return why[0] ?? "";
}

function truncate(text, max) {
  const value = String(text ?? "");
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/** Copy-paste file: one block per ask, content verbatim and never wrapped. */
export function renderFile(review, { path } = {}) {
  const asks = asksOf(review);
  if (!asks.length) return "";
  const lines = [];
  lines.push("ASKS FOR THE OWNER");
  lines.push(
    `review ${review.generated ?? "?"} (verdict=${review.verdict ?? "?"}) — ` +
      "the automation cannot do these without you.",
  );
  const why = whyLine(review);
  if (why) lines.push(`why: ${why}`);
  if (path) lines.push(`file: ${path}`);
  lines.push("");
  asks.forEach((ask, i) => {
    lines.push(`[${i + 1}/${asks.length}] ${labelFor(ask)} — by ${ask.by ?? "?"}`);
    lines.push(`DO      ${ask.action ?? ""}`);
    if (ask.content) {
      lines.push("POST (copy and paste, no edits needed)");
      lines.push("--------8<--------");
      lines.push(String(ask.content));
      lines.push("--------8<--------");
    }
    lines.push(`WHY     ${ask.because ?? ""}`);
    lines.push(`PROVE   ${ask.measure ?? ""}`);
    if (ask.url) lines.push(`LINK    ${ask.url}`);
    lines.push("");
  });
  lines.push("Report back by editing nothing: the next review measures PROVE itself.");
  lines.push("");
  return lines.join("\n");
}

/** Notification body: short enough for a phone, with the first post inline. */
export function renderNotify(review) {
  const asks = asksOf(review);
  if (!asks.length) return "";
  const lines = [];
  lines.push(
    `${asks.length} ask${asks.length === 1 ? "" : "s"} for you ` +
      `(${review.verdict ?? "?"} review ${review.generated ?? ""}):`,
  );
  const first = asks[0];
  lines.push(`[1] ${labelFor(first)} by ${first.by ?? "?"} — ${truncate(first.action ?? "", 120)}`);
  if (first.content) lines.push(truncate(String(first.content), 300));
  for (let i = 1; i < Math.min(asks.length, 3); i++) {
    lines.push(
      `[${i + 1}] ${labelFor(asks[i])} by ${asks[i].by ?? "?"} — ${truncate(asks[i].action ?? "", 90)}`,
    );
  }
  return lines.join("\n");
}

/** Commit body: the owner reads commits, so the ask travels in one. */
export function renderCommit(review) {
  const asks = asksOf(review);
  if (!asks.length) return "";
  const lines = ["ASKS FOR THE OWNER (from the results review)", ""];
  asks.forEach((ask, i) => {
    lines.push(`[${i + 1}] ${labelFor(ask)} — by ${ask.by ?? "?"}`);
    lines.push(`${ask.action ?? ""}`);
    if (ask.content) {
      lines.push(`copy-paste:`);
      lines.push(String(ask.content));
    }
    lines.push(`  why:   ${ask.because ?? ""}`);
    lines.push(`  proof: ${ask.measure ?? ""}`);
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}

async function main(argv) {
  let format = "file";
  let stateDir = DEFAULT_STATE_DIR;
  let repo = DEFAULT_REPO;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--format" && argv[i + 1]) format = argv[++i];
    else if (argv[i] === "--state-dir" && argv[i + 1]) stateDir = resolve(argv[++i]);
    else if (argv[i] === "--repo" && argv[i + 1]) repo = resolve(argv[++i]);
  }
  if (!["file", "notify", "commit"].includes(format)) {
    console.error(`render-asks: unknown --format ${format} (file|notify|commit)`);
    return 2;
  }

  const reviewPath = join(repo, "scripts", "autonomous", "review-latest.json");
  let review = null;
  if (existsSync(reviewPath)) {
    try {
      review = JSON.parse(readFileSync(reviewPath, "utf8"));
    } catch {
      review = null;
    }
  }
  if (!review || !asksOf(review).length) {
    if (format === "file") console.log("asks=0 (nothing to ask of the owner)");
    return 0;
  }

  if (format === "notify" || format === "commit") {
    const body = format === "notify" ? renderNotify(review) : renderCommit(review);
    process.stdout.write(body ? `${body}\n` : "");
    return 0;
  }

  const outPath = join(stateDir, "owner-asks.txt");
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(outPath, renderFile(review, { path: outPath }), "utf8");
  console.log(`asks=${asksOf(review).length} file=${outPath}`);
  return 0;
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
      console.error(`render-asks crashed: ${error?.stack ?? error}`);
      process.exit(2);
    });
}

export { CHANNEL_LABEL, DEFAULT_STATE_DIR };
