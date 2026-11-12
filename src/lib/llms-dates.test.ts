import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import type { HalvingInfo } from "./btc.functions.ts";
import { LLMS_TOKENS, llmsTokenValues, renderLlmsText } from "./llms-dates.ts";

const template = (name: string) =>
  readFileSync(new URL(`../content/${name}`, import.meta.url), "utf8");

/** Minimal HalvingInfo: only the two dates this module reads matter. */
const halving = {
  nextHalvingDate: "2028-04-12T00:00:00.000Z",
  lastHalvingDate: "2024-04-20T00:00:00.000Z",
} as HalvingInfo;

const now = new Date("2026-11-12T00:00:00.000Z");

describe("llms date tokens", () => {
  it("derives every value from the live model, not from a literal", () => {
    const values = llmsTokenValues(halving, now);
    assert.equal(values.BUY_DATE, "November 29, 2026");
    assert.equal(values.HALVING_DATE, "April 12, 2028");
    assert.equal(values.SELL_DATE, "August 25, 2029");
    assert.equal(values.BUY_DATE_ISO, "2026-11-29");
    assert.equal(values.SELL_DATE_ISO, "2029-08-25");
  });

  it("renders both documents with no token left behind", () => {
    for (const name of ["llms.txt", "llms-full.txt"]) {
      const out = renderLlmsText(template(name), halving, now);
      assert.ok(!out.includes("{{"), `${name} still contains a token after rendering`);
      assert.ok(out.includes("November 29, 2026"), `${name} does not state the rendered buy date`);
      assert.ok(out.includes("August 25, 2029"), `${name} does not state the rendered sell date`);
      assert.ok(
        out.includes("rendered live from Bitcoin's current block height"),
        `${name} lost its method note`,
      );
    }
  });

  it("never states the live estimate as a literal date", () => {
    // A hardcoded date is stale by construction — it can only be right on the day
    // it was written. That is how /llms.txt said November 28, 2026 while
    // /halving-dates rendered November 29, 2026 (review date-consistency-1112).
    const literal = /block-height estimate (?:is|for the next sell date is) [A-Z][a-z]+ \d/;
    // ~April 11, 2028 estimate / 2026-11-28 (current estimate) in the table
    const tableLiteral = /\| Next \(~[A-Z][a-z]+ \d/;

    for (const name of ["llms.txt", "llms-full.txt"]) {
      const body = template(name);
      assert.ok(!literal.test(body), `${name} hardcodes the live buy/sell date`);
      assert.ok(!tableLiteral.test(body), `${name} hardcodes the live dates in the table row`);
    }

    assert.ok(template("llms.txt").includes("{{BUY_DATE}}"));
    assert.ok(template("llms.txt").includes("{{SELL_DATE}}"));
    for (const token of LLMS_TOKENS) {
      assert.ok(
        template("llms-full.txt").includes(`{{${token}}}`),
        `llms-full.txt lost its ${token} token`,
      );
    }
  });

  it("throws on an unknown token instead of leaking it", () => {
    assert.throws(() => renderLlmsText("{{NOT_A_TOKEN}}", halving, now), /unknown token/);
  });
});
