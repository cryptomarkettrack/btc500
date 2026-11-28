/**
 * Pure parsers for the exchange WebSocket tickers used in the browser.
 *
 * The live P&L is marked from a stream opened by the visitor's own browser —
 * no price is sent through or stored on our backend. These parsers keep the
 * wire formats out of the React hook and make them unit-testable.
 */

/** Binance `<symbol>@ticker` stream: last price is the `c` field. */
export function parseBinanceTickerPrice(raw: string): number | null {
  try {
    const data = JSON.parse(raw) as { c?: unknown };
    const price = Number(data?.c);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

/** Coinbase `ticker` channel: last price is the `price` field. */
export function parseCoinbaseTickerPrice(raw: string): number | null {
  try {
    const data = JSON.parse(raw) as { type?: unknown; price?: unknown };
    if (data?.type !== "ticker") return null;
    const price = Number(data.price);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

/** Kraken v2 `ticker` channel: last price is `data[0].last`. */
export function parseKrakenTickerPrice(raw: string): number | null {
  try {
    const data = JSON.parse(raw) as { channel?: unknown; data?: Array<{ last?: unknown }> };
    if (data?.channel !== "ticker") return null;
    const price = Number(data.data?.[0]?.last);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}
