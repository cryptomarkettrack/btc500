import { useEffect, useRef, useState } from "react";
import { parseBinanceTickerPrice, parseCoinbaseTickerPrice } from "@/lib/btc-ws";

/**
 * Browser-side BTC/USD price stream.
 *
 * The visitor's browser opens the exchange socket directly and the P&L is
 * recomputed in React on each tick. No price is posted to, cached by or
 * fetched again from our backend: the SSR value is only the seed shown until
 * the first ticker frame arrives. If WebSockets are blocked, the existing
 * server-function polling remains the fallback.
 */

interface Provider {
  name: string;
  url: string;
  subscribe?: object;
  parse: (raw: string) => number | null;
}

const PROVIDERS: readonly Provider[] = [
  {
    name: "Binance",
    url: "wss://stream.binance.com:9443/ws/btcusdt@ticker",
    parse: parseBinanceTickerPrice,
  },
  {
    name: "Coinbase",
    url: "wss://ws-feed.exchange.coinbase.com",
    subscribe: { type: "subscribe", product_ids: ["BTC-USD"], channels: ["ticker"] },
    parse: parseCoinbaseTickerPrice,
  },
];

/** At most one React update per this many ms — the ticker prints about 1/s. */
const MIN_UPDATE_MS = 900;
const OPEN_TIMEOUT_MS = 5_000;
const SILENCE_TIMEOUT_MS = 12_000;
const MAX_RECONNECT_MS = 30_000;

export interface LivePrice {
  price: number | null;
  /** True once a real exchange frame has replaced the server-rendered seed. */
  streaming: boolean;
  /** Exchange name currently streaming, or null. */
  provider: string | null;
}

export function useLiveBtcPrice(seedPrice: number | null, enabled = true): LivePrice {
  // The first client render matches the server exactly; frames arrive after mount.
  const [price, setPrice] = useState<number | null>(seedPrice);
  const [streaming, setStreaming] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const lastUpdate = useRef(-Infinity);

  // Keep the server seed visible until a socket frame replaces it, including
  // when the seed query refreshes while the socket is still connecting.
  useEffect(() => {
    if (!streaming && seedPrice != null) setPrice(seedPrice);
  }, [seedPrice, streaming]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof WebSocket === "undefined") return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let providerIndex = 0;
    let failures = 0;

    const scheduleReconnect = (delivered: boolean) => {
      if (disposed) return;
      failures = delivered ? 0 : failures + 1;
      if (failures >= 2) {
        providerIndex = (providerIndex + 1) % PROVIDERS.length;
        failures = 0;
      }
      const delay = Math.min(MAX_RECONNECT_MS, 1_000 * 2 ** failures) + Math.random() * 400;
      reconnectTimer = setTimeout(connect, delay);
    };

    function connect() {
      if (disposed) return;
      const config = PROVIDERS[providerIndex]!;
      let delivered = false;
      let opened = false;
      let silenceTimer: ReturnType<typeof setTimeout> | undefined;

      try {
        socket = new WebSocket(config.url);
      } catch {
        scheduleReconnect(false);
        return;
      }
      const current = socket;

      const close = () => {
        try {
          current.close();
        } catch {
          // Already closed — nothing to do.
        }
      };
      const openTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
        if (!opened) close();
      }, OPEN_TIMEOUT_MS);

      current.onopen = () => {
        opened = true;
        clearTimeout(openTimer);
        if (config.subscribe) current.send(JSON.stringify(config.subscribe));
        silenceTimer = setTimeout(close, SILENCE_TIMEOUT_MS);
      };

      current.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        const next = config.parse(event.data);
        delivered = true;
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(close, SILENCE_TIMEOUT_MS);
        }
        if (next === null) return;
        const now = Date.now();
        if (now - lastUpdate.current < MIN_UPDATE_MS) return;
        lastUpdate.current = now;
        if (disposed) return;
        setPrice(next);
        setStreaming(true);
        setProvider(config.name);
      };

      current.onerror = close;

      current.onclose = () => {
        if (openTimer) clearTimeout(openTimer);
        if (silenceTimer) clearTimeout(silenceTimer);
        if (disposed) return;
        if (delivered) setStreaming(false);
        scheduleReconnect(delivered);
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const current = socket;
      if (current) {
        current.onclose = null;
        current.onmessage = null;
        current.onerror = null;
        current.onopen = null;
        try {
          current.close();
        } catch {
          // Already closed.
        }
      }
    };
  }, [enabled]);

  return { price, streaming, provider };
}
