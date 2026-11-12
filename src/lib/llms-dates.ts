/**
 * Renders the placeholder tokens in the LLM-facing documents
 * (`/llms.txt`, `/llms-full.txt`) from the live halving model.
 *
 * Why this exists: those two files are the surface an answer engine reads and
 * quotes, and they were the only quoteable surfaces still carrying a hardcoded
 * date. On 2026-11-12 `/llms.txt` said "November 28, 2026" twice while
 * `/bitcoin-500-day-cycle` and `/halving-dates` rendered "November 29, 2026"
 * and the X bio said "Nov 30, 2026" — three surfaces, three dates, on the one
 * number the site exists to state. The buy date is derived from live block
 * height, so a literal in a text file is stale by construction: it can only be
 * correct on the day it was written.
 *
 * The templates therefore keep their prose unchanged and carry tokens
 * (`{{BUY_DATE}}`, `{{HALVING_DATE}}`, `{{SELL_DATE}}`, `{{BUY_DATE_ISO}}`,
 * `{{SELL_DATE_ISO}}`), filled here from the same `computeCycle` the pages use.
 * Any token without a value throws instead of shipping a literal `{{…}}` to a
 * crawler.
 */

import type { HalvingInfo } from "./btc.functions.ts";
import { computeCycle } from "./phase.ts";
import { formatLongDate } from "./pillar-snippet.ts";

export const LLMS_TOKENS = [
  "BUY_DATE",
  "HALVING_DATE",
  "SELL_DATE",
  "BUY_DATE_ISO",
  "SELL_DATE_ISO",
] as const;

export type LlmsToken = (typeof LLMS_TOKENS)[number];

const TOKEN_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Values for every token, derived from the live model — never from a literal. */
export function llmsTokenValues(
  halving: HalvingInfo,
  now: Date = new Date(),
): Record<string, string> {
  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );

  return {
    BUY_DATE: formatLongDate(cycle.buyDate),
    HALVING_DATE: formatLongDate(cycle.nextHalving),
    SELL_DATE: formatLongDate(cycle.sellDate),
    BUY_DATE_ISO: isoDay(cycle.buyDate),
    SELL_DATE_ISO: isoDay(cycle.sellDate),
  };
}

/** Replace every `{{TOKEN}}` in a template. Unknown tokens throw, never leak. */
export function renderLlmsText(
  template: string,
  halving: HalvingInfo,
  now: Date = new Date(),
): string {
  const values = llmsTokenValues(halving, now);

  return template.replace(TOKEN_PATTERN, (match, token: string) => {
    const value = values[token];
    if (value === undefined) throw new Error(`[llms] unknown token ${match}`);
    return value;
  });
}
