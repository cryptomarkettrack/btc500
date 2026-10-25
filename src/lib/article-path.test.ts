import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articleSlugFromPath } from "./article-path.ts";

describe("articleSlugFromPath", () => {
  it("extracts a slug from an article pathname", () => {
    assert.equal(
      articleSlugFromPath("/articles/solar-eclipse-bitcoin-halving"),
      "solar-eclipse-bitcoin-halving",
    );
    assert.equal(
      articleSlugFromPath("/articles/solar-eclipse-bitcoin-halving/"),
      "solar-eclipse-bitcoin-halving",
    );
  });

  it("ignores the article index and other routes", () => {
    assert.equal(articleSlugFromPath("/articles"), null);
    assert.equal(articleSlugFromPath("/articles/"), null);
    assert.equal(articleSlugFromPath("/articles//"), null);
    assert.equal(articleSlugFromPath("/"), null);
    assert.equal(articleSlugFromPath("/news"), null);
  });
});
