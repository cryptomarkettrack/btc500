import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { renderCommit, renderFile, renderNotify } from "./render-asks.mjs";

const CONTENT =
  "The 500-day window opens 28 Nov 2026. Where does this cycle sit against 2016/2020/2024? Updated daily: https://btc500.net/bitcoin-500-day-cycle";

function reviewFixture(overrides = {}) {
  return {
    schema: 1,
    generated: "2026-10-26",
    verdict: "stagnant",
    why: ["Indexation has not moved because nothing earns a crawl."],
    owner_asks: [
      {
        id: "x-cycle-window-post",
        channel: "x",
        action: "Post this from @btc500halving today between 15:00 and 17:00 UTC",
        content: CONTENT,
        url: "https://btc500.net/bitcoin-500-day-cycle",
        because: "0 non-brand clicks in 24d",
        measure: "GA4 referral sessions from x.com/twitter.com within 7 days",
        referrers: ["x.com", "twitter.com"],
        by: "2026-10-27",
      },
      {
        id: "awesome-list-link",
        channel: "github",
        action: "Open a PR adding btc500.net to a Bitcoin awesome list",
        content: "Added btc500.net — a live 500-day cycle model with a halving calendar.",
        url: "https://btc500.net/bitcoin-500-day-cycle",
        because: "19/25 URLs not indexed; the site has no external signal",
        measure: "referral sessions from github.com",
        referrers: ["github.com"],
        by: "2026-10-30",
      },
    ],
    ...overrides,
  };
}

test("the copy-paste file carries the post verbatim, never re-wrapped", () => {
  const text = renderFile(reviewFixture(), { path: "/state/owner-asks.txt" });
  assert.match(text, /ASKS FOR THE OWNER/);
  assert.match(text, /verdict=stagnant/);
  assert.match(text, /\[1\/2\] X post from @btc500halving — by 2026-10-27/);
  assert.match(text, /DO {6}Post this from @btc500halving/);
  assert.match(text, /POST \(copy and paste, no edits needed\)/);
  assert.match(text, /PROVE {3}GA4 referral sessions from x\.com/);
  // The content sits between the markers, unchanged, on one line.
  const block = text.split("--------8<--------")[1].trim();
  assert.equal(block, CONTENT);
  assert.match(text, /\[2\/2\] Link from a repo or list — by 2026-10-30/);
});

test("a review with no asks renders nothing at all", () => {
  assert.equal(renderFile(reviewFixture({ owner_asks: [] })), "");
  assert.equal(renderNotify(reviewFixture({ owner_asks: [] })), "");
  assert.equal(renderCommit(reviewFixture({ owner_asks: [] })), "");
  assert.equal(renderFile({}), "");
});

test("the notification leads with the first post, short enough for a phone", () => {
  const body = renderNotify(reviewFixture());
  assert.match(body, /2 asks for you \(stagnant review 2026-10-26\)/);
  assert.match(body, /\[1\] X post from @btc500halving by 2026-10-27/);
  assert.ok(body.includes(CONTENT), "the first post must be readable inline");
  assert.ok(body.length < 900, `notification body is ${body.length} characters`);

  // Long content is truncated rather than cut off mid-notification.
  const long = reviewFixture();
  long.owner_asks[0].content = "y".repeat(600);
  assert.ok(renderNotify(long).length < 900);
});

test("the commit body carries the ask for anyone reading the log", () => {
  const body = renderCommit(reviewFixture());
  assert.match(body, /ASKS FOR THE OWNER \(from the results review\)/);
  assert.match(body, /\[1\] X post from @btc500halving — by 2026-10-27/);
  assert.match(body, /copy-paste:/);
  assert.ok(body.includes(CONTENT));
  assert.match(body, /why: {3}0 non-brand clicks/);
  assert.match(body, /proof: GA4 referral sessions/);
  // The post itself stays on one unindented line: the owner copies it whole.
  assert.equal(body.split("copy-paste:\n")[1].split("\n")[0], CONTENT);
});

test("the CLI writes owner-asks.txt and reports the count", async () => {
  const repo = mkdtempSync(join(tmpdir(), "btc500-asks-repo-"));
  const state = mkdtempSync(join(tmpdir(), "btc500-asks-state-"));
  try {
    const { mkdirSync, writeFileSync } = await import("node:fs");
    mkdirSync(join(repo, "scripts", "autonomous"), { recursive: true });
    writeFileSync(
      join(repo, "scripts", "autonomous", "review-latest.json"),
      JSON.stringify(reviewFixture(), null, 2),
    );

    const { execFileSync } = await import("node:child_process");
    const out = execFileSync(
      process.execPath,
      [
        join(import.meta.dirname, "render-asks.mjs"),
        "--format",
        "file",
        "--repo",
        repo,
        "--state-dir",
        state,
      ],
      { encoding: "utf8" },
    );
    assert.match(out, /asks=2 file=/);
    const written = readFileSync(join(state, "owner-asks.txt"), "utf8");
    assert.ok(written.includes(CONTENT));

    const notify = execFileSync(
      process.execPath,
      [join(import.meta.dirname, "render-asks.mjs"), "--format", "notify", "--repo", repo],
      { encoding: "utf8" },
    );
    assert.match(notify, /2 asks for you/);

    // Nothing to ask of the owner is a clean, empty result — not an error.
    writeFileSync(join(repo, "scripts", "autonomous", "review-latest.json"), '{"owner_asks":[]}');
    const none = execFileSync(
      process.execPath,
      [
        join(import.meta.dirname, "render-asks.mjs"),
        "--format",
        "file",
        "--repo",
        repo,
        "--state-dir",
        state,
      ],
      { encoding: "utf8" },
    );
    assert.match(none, /asks=0/);
    assert.ok(existsSync(join(state, "owner-asks.txt")));
  } finally {
    rmSync(repo, { recursive: true, force: true });
    rmSync(state, { recursive: true, force: true });
  }
});
