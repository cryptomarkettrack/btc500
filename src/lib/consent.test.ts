import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONSENT_MODE_DEFAULT,
  CONSENT_MODE_DENIED,
  CONSENT_MODE_GRANTED,
  CONSENT_STORAGE_KEY,
  applyConsentChoice,
  parseConsentChoice,
  readConsentChoice,
  writeConsentChoice,
  type ConsentChoice,
} from "./consent.ts";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    dump: () => Object.fromEntries(data),
  };
}

describe("consent choice parsing", () => {
  it("accepts only the two explicit choices", () => {
    assert.equal(parseConsentChoice("granted"), "granted");
    assert.equal(parseConsentChoice("denied"), "denied");
  });

  it("treats anything else as 'not asked yet'", () => {
    for (const raw of [null, undefined, "", "yes", "true", "GRANTED", 1, {}]) {
      assert.equal(parseConsentChoice(raw), null);
    }
  });
});

describe("stored consent", () => {
  it("returns null when nothing has been stored", () => {
    assert.equal(readConsentChoice(fakeStorage()), null);
  });

  it("round-trips a choice through storage", () => {
    const storage = fakeStorage();
    writeConsentChoice("granted", storage);
    assert.equal(storage.dump()[CONSENT_STORAGE_KEY], "granted");
    assert.equal(readConsentChoice(storage), "granted");

    writeConsentChoice("denied", storage);
    assert.equal(readConsentChoice(storage), "denied");
  });

  it("survives a storage that throws (private mode)", () => {
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    assert.equal(readConsentChoice(throwing), null);
    assert.doesNotThrow(() => writeConsentChoice("denied", throwing));
  });

  it("is a no-op without storage (server render)", () => {
    assert.equal(readConsentChoice(null), null);
    assert.doesNotThrow(() => writeConsentChoice("granted", null));
  });
});

describe("Consent Mode payloads", () => {
  it("denies analytics and every ad signal by default", () => {
    assert.deepEqual(CONSENT_MODE_DEFAULT, {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });

  it("only ever moves analytics_storage — ad signals are never granted", () => {
    assert.deepEqual(CONSENT_MODE_GRANTED, { analytics_storage: "granted" });
    assert.deepEqual(CONSENT_MODE_DENIED, { analytics_storage: "denied" });
    for (const payload of [CONSENT_MODE_GRANTED, CONSENT_MODE_DENIED]) {
      assert.equal("ad_storage" in payload, false);
      assert.equal("ad_user_data" in payload, false);
      assert.equal("ad_personalization" in payload, false);
    }
  });

  it("pushes a consent update through gtag when the tag is present", () => {
    const calls: unknown[][] = [];
    const scope = globalThis as { window?: unknown };
    const previous = scope.window;
    scope.window = {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
    };
    try {
      applyConsentChoice("granted");
      applyConsentChoice("denied");
    } finally {
      scope.window = previous;
    }

    assert.deepEqual(calls, [
      ["consent", "update", CONSENT_MODE_GRANTED],
      ["consent", "update", CONSENT_MODE_DENIED],
    ]);
  });

  it("does not throw when the tag never loaded", () => {
    const scope = globalThis as { window?: unknown };
    const previous = scope.window;
    scope.window = {};
    try {
      assert.doesNotThrow(() => applyConsentChoice("granted" as ConsentChoice));
    } finally {
      scope.window = previous;
    }
  });
});
