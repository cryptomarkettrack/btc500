import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildChartGeometry } from "./chart.ts";
import type { ExchangeCandle } from "./market-data.ts";

function candle(openTime: number, open: number, close: number): ExchangeCandle {
  return {
    symbol: "BTCUSDT",
    timeframe: "15m",
    openTime,
    closeTime: openTime + 900_000 - 1,
    open,
    high: Math.max(open, close) + 10,
    low: Math.min(open, close) - 10,
    close,
    final: true,
    source: "kraken",
  };
}

describe("candle chart geometry", () => {
  it("has nothing to draw without candles", () => {
    assert.equal(buildChartGeometry([]), null);
  });

  it("maps the price range onto the plot area", () => {
    const geometry = buildChartGeometry([candle(0, 100, 110), candle(900_000, 110, 90)], 800, 260)!;
    assert.ok(geometry.y(geometry.maxPrice) < geometry.y(geometry.minPrice));
    assert.equal(geometry.gridPrices.length, 4);
  });

  it("draws an up candle with the body above its wick base and a down candle below", () => {
    const geometry = buildChartGeometry([candle(0, 100, 110), candle(900_000, 110, 90)], 800, 260)!;
    const [up, down] = geometry.candles;
    assert.equal(up.up, true);
    assert.equal(down.up, false);
    assert.ok(up.bodyTop < up.bodyBottom);
    assert.ok(down.bodyTop < down.bodyBottom);
    assert.ok(up.wickTop <= up.bodyTop);
    assert.ok(up.wickBottom >= up.bodyBottom);
  });

  it("spaces candles evenly from left to right", () => {
    const geometry = buildChartGeometry(
      [candle(0, 100, 100), candle(1, 100, 100), candle(2, 100, 100)],
      600,
      260,
    )!;
    const [a, b, c] = geometry.candles;
    assert.ok(a.x < b.x && b.x < c.x);
    assert.equal(Math.round(b.x - a.x), Math.round(c.x - b.x));
  });

  it("gives a flat candle a visible body", () => {
    const geometry = buildChartGeometry([candle(0, 100, 100)], 800, 260)!;
    const only = geometry.candles[0];
    assert.equal(only.up, true);
    assert.ok(only.bodyHeight >= 1.5);
  });
});
