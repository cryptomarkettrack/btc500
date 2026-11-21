import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseBinanceRows,
  parseCoinbaseRows,
  parseKrakenRows,
  PRICE_SOURCES,
} from "./market-data.ts";

const OPEN = Date.UTC(2026, 0, 1, 12, 0, 0);
const NOW = OPEN + 900_000 + 60_000;
const INTERVAL = 900_000;

describe("OHLC provider chain", () => {
  it("tries Binance last so a blocked endpoint adds no latency", () => {
    assert.deepEqual(PRICE_SOURCES, ["kraken", "coinbase", "binance"]);
  });
});

describe("provider parsers", () => {
  it("parses Binance klines and marks a closed candle final", () => {
    const rows = parseBinanceRows(
      [[OPEN, "100", "110", "95", "105", "10", OPEN + INTERVAL - 1]],
      "BTCUSDT",
      "15m",
      INTERVAL,
      NOW,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].source, "binance");
    assert.equal(rows[0].close, 105);
    assert.equal(rows[0].final, true);
  });

  it("parses Kraken OHLC seconds and the XBTUSDT pair", () => {
    const rows = parseKrakenRows(
      {
        error: [],
        result: { XBTUSDT: [[OPEN / 1000, "100", "110", "95", "105", "103", "1", "5"]] },
      },
      "BTCUSDT",
      "15m",
      INTERVAL,
      NOW,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].source, "kraken");
    assert.equal(rows[0].openTime, OPEN);
    assert.equal(rows[0].close, 105);
  });

  it("ignores Kraken error responses", () => {
    assert.deepEqual(
      parseKrakenRows({ error: ["EGeneral:offline"] }, "BTCUSDT", "15m", INTERVAL, NOW),
      [],
    );
  });

  it("parses Coinbase candles in low/high/open/close order", () => {
    const rows = parseCoinbaseRows(
      [[OPEN / 1000, 95, 110, 100, 105, 10]],
      "BTCUSDT",
      "15m",
      INTERVAL,
      NOW,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].source, "coinbase");
    assert.equal(rows[0].open, 100);
    assert.equal(rows[0].high, 110);
    assert.equal(rows[0].close, 105);
  });

  it("keeps the live candle non-final", () => {
    const rows = parseBinanceRows(
      [[OPEN, "100", "110", "95", "105", "10", OPEN + INTERVAL - 1]],
      "BTCUSDT",
      "15m",
      INTERVAL,
      OPEN + 1000,
    );
    assert.equal(rows[0].final, false);
  });

  it("rejects malformed or misaligned candles", () => {
    assert.deepEqual(
      parseBinanceRows(
        [[OPEN + 1, "100", "110", "95", "105", "10", OPEN + INTERVAL]],
        "BTCUSDT",
        "15m",
        INTERVAL,
        NOW,
      ),
      [],
    );
    assert.deepEqual(
      parseBinanceRows(
        [["bad", "100", "110", "95", "105", "10", 1]],
        "BTCUSDT",
        "15m",
        INTERVAL,
        NOW,
      ),
      [],
    );
  });
});
