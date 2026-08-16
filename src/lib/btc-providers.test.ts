import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  firstSuccessfulProvider,
  parseBinanceBtcUsd,
  parseBlockHeight,
  parseBlockSummaries,
  parseBtcUsdPrice,
  parseCoinbaseBtcUsd,
  parseCoingeckoBtcUsd,
  parseKrakenBtcUsd,
  parsePositiveFinite,
} from "./btc-providers.ts";

describe("numeric validation", () => {
  it("rejects NaN, infinite, and non-positive values", () => {
    assert.equal(parsePositiveFinite(Number.NaN), null);
    assert.equal(parsePositiveFinite(Number.POSITIVE_INFINITY), null);
    assert.equal(parsePositiveFinite(-1), null);
    assert.equal(parsePositiveFinite(0), null);
    assert.equal(parsePositiveFinite("12.5"), 12.5);
  });

  it("rejects implausible BTC prices", () => {
    assert.equal(parseBtcUsdPrice("50"), null);
    assert.equal(parseBtcUsdPrice(20_000_000), null);
    assert.equal(parseBtcUsdPrice(67000), 67000);
  });
});

describe("block height validation", () => {
  it("accepts a plausible integer tip and rejects junk", () => {
    assert.equal(parseBlockHeight("912345"), 912345);
    assert.equal(parseBlockHeight(" 912345\n"), 912345);
    assert.equal(parseBlockHeight("912345.2"), null);
    assert.equal(parseBlockHeight("-1"), null);
    assert.equal(parseBlockHeight("not-a-height"), null);
    assert.equal(parseBlockHeight("100"), null);
  });
});

describe("price provider payloads", () => {
  it("parses each known live shape", () => {
    assert.equal(parseBinanceBtcUsd({ price: "67000.12" }), 67000.12);
    assert.equal(parseCoingeckoBtcUsd({ bitcoin: { usd: 67000 } }), 67000);
    assert.equal(parseCoinbaseBtcUsd({ data: { amount: "67000.5" } }), 67000.5);
    assert.equal(parseKrakenBtcUsd({ result: { XXBTZUSD: { c: ["67001.0", "1"] } } }), 67001);
  });

  it("rejects malformed payloads instead of leaking NaN", () => {
    assert.equal(parseBinanceBtcUsd({ price: "nope" }), null);
    assert.equal(parseBinanceBtcUsd({}), null);
    assert.equal(parseCoingeckoBtcUsd({ bitcoin: { usd: -3 } }), null);
    assert.equal(parseCoinbaseBtcUsd({ data: {} }), null);
    assert.equal(parseKrakenBtcUsd({ result: {} }), null);
    assert.equal(parseKrakenBtcUsd({ error: ["busy"] }), null);
  });
});

describe("block samples", () => {
  it("keeps valid height/timestamp pairs and drops the rest", () => {
    const parsed = parseBlockSummaries([
      { height: 900000, timestamp: 1_700_000_000 },
      { height: "x", timestamp: 1_700_000_000 },
      { height: 900001, timestamp: 10 },
      null,
    ]);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0]?.height, 900000);
  });
});

describe("provider fallback", () => {
  it("returns the first valid provider and skips failures", async () => {
    const result = await firstSuccessfulProvider(
      [
        {
          name: "bad",
          fetch: async () => {
            throw new Error("timeout");
          },
        },
        { name: "malformed", fetch: async () => Number.NaN },
        { name: "ok", fetch: async () => 67000 },
      ],
      (n) => Number.isFinite(n) && n > 0,
    );
    assert.deepEqual(result, { value: 67000, provider: "ok" });
  });

  it("returns null when every provider fails", async () => {
    const result = await firstSuccessfulProvider(
      [
        {
          name: "a",
          fetch: async () => {
            throw new Error("down");
          },
        },
        { name: "b", fetch: async () => Number.NaN },
      ],
      (n) => Number.isFinite(n),
    );
    assert.equal(result, null);
  });
});
