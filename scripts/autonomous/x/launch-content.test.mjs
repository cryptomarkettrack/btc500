import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const HERE = join(import.meta.dirname, "..");
const PACK_PATH = join(HERE, "x", "launch-content.json");

function loadPack() {
  const raw = readFileSync(PACK_PATH, "utf8");
  return JSON.parse(raw);
}

test("the launch content pack parses and names the objective", () => {
  const pack = loadPack();
  assert.equal(pack.schema, "btc500/x-launch-content@1");
  assert.equal(pack.handle, "@btc500halving");
  assert.equal(pack.objective, "make the @btc500halving X profile go viral");
});

test("the profile bio fits the 160 character X limit", () => {
  const bio = loadPack().profile?.bio ?? "";
  assert.ok(bio.length > 0, "bio must not be empty");
  assert.ok(bio.length <= 160, `bio is ${bio.length} chars, must be <= 160`);
});

test("the pinned post fits the 280 character X limit", () => {
  const pinned = loadPack().pinnedPost?.copy ?? "";
  assert.ok(pinned.length > 0, "pinned post must not be empty");
  assert.ok(pinned.length <= 280, `pinned post is ${pinned.length} chars, must be <= 280`);
});

test("every launch tweet fits the 280 character X limit", () => {
  const tweets = loadPack().tweets ?? [];
  assert.ok(tweets.length >= 5, "the launch pack should carry a real tweet set");
  for (const tweet of tweets) {
    const copy = tweet?.copy ?? "";
    assert.ok(copy.length > 0, `${tweet.id} must not be empty`);
    assert.ok(copy.length <= 280, `${tweet.id} is ${copy.length} chars, must be <= 280`);
    assert.ok(tweet?.hook, `${tweet.id} needs a hook`);
    assert.ok(Array.isArray(tweet?.measuredNumbers), `${tweet.id} needs measuredNumbers`);
  }
});

test("thread tweets are numbered contiguously from 1 and singles carry no index", () => {
  const tweets = loadPack().tweets ?? [];
  const thread = tweets.filter((t) => t?.type === "thread");
  assert.ok(thread.length >= 1, "at least one thread expected");
  assert.equal(thread[0].tweetIndex, 1);
  for (let i = 1; i < thread.length; i += 1) {
    assert.equal(
      thread[i].tweetIndex,
      thread[i - 1].tweetIndex + 1,
      `thread order broken at ${thread[i].id}`,
    );
  }
  for (const tweet of tweets.filter((t) => t?.type !== "thread")) {
    assert.equal(tweet.tweetIndex, undefined, `${tweet.id} is a single but carries a tweetIndex`);
  }
});
