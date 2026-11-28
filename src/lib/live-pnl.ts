/**
 * Live P&L for the public $50,000 BTC500 paper position.
 *
 * The hero on `/` leads with this number once the T−500 buy point has passed.
 * Every input is passed in — the buy timestamp, the price at that timestamp and
 * the live mark — so the model never reaches into the clock or the network and
 * the same figures can be rendered on the server and in the browser.
 *
 * Honesty rules: no entry price or no live mark means no P&L. Nothing is
 * substituted, annualised or forecast, and the result stays clearly labelled
 * as a paper position, not a real trade or a promise.
 */

import { BUY_POINT_ISO } from "./buy-signal.ts";
import { formatUsd } from "./format.ts";

export const LIVE_PNL_NOTIONAL_USD = 50_000;

export type LivePnlState = "open" | "unavailable";

export interface LivePnl {
  state: LivePnlState;
  notionalUSD: number;
  buyPointISO: string;
  /** Hourly BTC/USD close at the exact buy timestamp. */
  entryPriceUSD: number | null;
  /** Latest BTC/USD spot price from the site's live feed. */
  currentPriceUSD: number | null;
  btcHeld: number | null;
  valueUSD: number | null;
  profitUSD: number | null;
  /** Fractional return: 0.08 means +8%. */
  returnFraction: number | null;
  isProfit: boolean;
  hoursHeld: number;
  daysHeld: number;
  /** One short, dated line that can be quoted or shared. */
  quote: string;
  statusNote: string;
}

function positive(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

/** Derive the whole live position from passed inputs. Pure: same inputs → same output. */
export function buildLivePnl(input: {
  nowISO: string;
  buyPointISO?: string;
  entryPriceUSD: number | null;
  currentPriceUSD: number | null;
}): LivePnl {
  const buyPointISO = input.buyPointISO ?? BUY_POINT_ISO;
  const now = Date.parse(input.nowISO);
  const buyPoint = Date.parse(buyPointISO);
  const entry = positive(input.entryPriceUSD);
  const mark = positive(input.currentPriceUSD);
  const canMark =
    entry !== null &&
    mark !== null &&
    Number.isFinite(now) &&
    Number.isFinite(buyPoint) &&
    now >= buyPoint;

  const hoursHeld =
    canMark && Number.isFinite(now) ? Math.max(0, Math.floor((now - buyPoint) / 3_600_000)) : 0;

  const btcHeld = canMark && entry !== null ? LIVE_PNL_NOTIONAL_USD / entry : null;
  const valueUSD = btcHeld !== null && mark !== null ? btcHeld * mark : null;
  const profitUSD = valueUSD !== null ? valueUSD - LIVE_PNL_NOTIONAL_USD : null;
  const returnFraction = profitUSD !== null ? profitUSD / LIVE_PNL_NOTIONAL_USD : null;
  const isProfit = profitUSD !== null && profitUSD >= 0;

  const statusNote = canMark
    ? `${formatUsd(LIVE_PNL_NOTIONAL_USD)} paper position, opened at the T−500 buy point and marked against the live BTC price. Not a real trade or financial advice.`
    : "Position is open but P&L is unavailable: a verified entry price and a live BTC mark are both required. No number is published until then.";

  let quote: string;
  if (canMark && profitUSD !== null && returnFraction !== null) {
    const sign = profitUSD >= 0 ? "+" : "−";
    quote = `Day ${Math.floor(hoursHeld / 24)} · ${formatUsd(LIVE_PNL_NOTIONAL_USD)} paper: entry ${formatUsd(entry!)} → mark ${formatUsd(mark!)} · ${sign}${formatUsd(Math.abs(profitUSD))} (${sign}${(Math.abs(returnFraction) * 100).toFixed(2)}%).`;
  } else {
    quote = `BTC500 paper buy · ${formatUsd(LIVE_PNL_NOTIONAL_USD)} · P&L pending a verified entry price and live mark.`;
  }

  return {
    state: canMark ? "open" : "unavailable",
    notionalUSD: LIVE_PNL_NOTIONAL_USD,
    buyPointISO,
    entryPriceUSD: canMark ? entry : null,
    currentPriceUSD: canMark ? mark : null,
    btcHeld,
    valueUSD,
    profitUSD,
    returnFraction,
    isProfit,
    hoursHeld,
    daysHeld: Math.floor(hoursHeld / 24),
    quote,
    statusNote,
  };
}
