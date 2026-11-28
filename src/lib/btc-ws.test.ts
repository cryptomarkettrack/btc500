import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseBinanceTickerPrice,
  parseCoinbaseTickerPrice,
  parseKrakenTickerPrice,
} from "./btc-ws.ts";

describe("browser WebSocket ticker parsers", () => {
  it("reads the last price from a Binance ticker frame", () => {
    const frame = JSON.stringify({
      e: "24hrTicker",
      s: "BTCUSDT",
      c: "59885.41000000",
      o: "60000.00000000",
    });
    assert.equal(parseBinanceTickerPrice(frame), 59_885.41);
  });

  it("reads the last price from a Coinbase ticker frame", () => {
    const frame = JSON.stringify({
      type: "ticker",
      product_id: "BTC-USD",
      price: "59890.12",
    });
    assert.equal(parseCoinbaseTickerPrice(frame), 59_890.12);
  });

  it("reads the last price from a Kraken v2 ticker frame", () => {
    const frame = JSON.stringify({
      channel: "ticker",
      type: "snapshot",
      data: [{ symbol: "BTC/USD", last: 59_696.0 }],
    });
    assert.equal(parseKrakenTickerPrice(frame), 59_696);
    assert.equal(
      parseKrakenTickerPrice(
        JSON.stringify({ method: "subscribe", result: { channel: "ticker" } }),
      ),
      null,
    );
  });

  it("ignores unrelated frames, malformed JSON and non-positive prices", () => {
    for (const raw of [
      "not json",
      JSON.stringify({ c: "0" }),
      JSON.stringify({ c: "abc" }),
      JSON.stringify({}),
    ]) {
      assert.equal(parseBinanceTickerPrice(raw), null, raw);
    }
    assert.equal(
      parseCoinbaseTickerPrice(JSON.stringify({ type: "snapshot", price: "100" })),
      null,
    );
    assert.equal(parseCoinbaseTickerPrice(JSON.stringify({ type: "ticker", price: "-1" })), null);
  });
});
