/**
 * Extractable copy for /is-now-the-buy-point.
 *
 * The visible H2/H2 answer strings and the FAQPage JSON-LD are built from these
 * constants so the schema can never drift from what a reader (or an answer
 * engine) actually sees. No number here is invented: the 180-day deviation is
 * the maximum `daysEntryToLow` in the repo's own backtest (128/180/41/12).
 */

export const BUY_POINT_H1 = "Is Now the Buy Point for Bitcoin? The 500-Day Rule Says Yes";

export const BUY_POINT_LEAD =
  "Yes — November 28, 2026 is the 500-day buy point before the projected April 2028 halving. " +
  "The rule has been completed four times since 2012 and has never missed a cycle low by more than 180 days.";

export interface CopySection {
  id: string;
  question: string;
  answer: string;
  /** Sections 4–7 are also emitted as FAQPage questions. */
  faq: boolean;
}

export const BUY_POINT_SECTIONS: readonly CopySection[] = [
  {
    id: "what-is-the-rule",
    question: "What is the 500-day rule?",
    answer:
      "The 500-day rule buys Bitcoin exactly 500 days before a halving and sells exactly 500 days after it. It is a fixed calendar rule with no indicators, so both dates are known before the trade.",
    faq: false,
  },
  {
    id: "why-this-date-matters",
    question: "Why November 28, 2026 matters",
    answer:
      "November 28, 2026 is 500 calendar days before the projected April 11, 2028 halving at block 1,050,000. The live price card below shows where Bitcoin sits relative to the October 2025 high.",
    faq: false,
  },
  {
    id: "last-four-times",
    question: "What happened the last four times",
    answer:
      "All four completed 500-day windows since 2012 ended in positive territory. The table below is built from the same daily-close archive that powers the simulator.",
    faq: false,
  },
  {
    id: "should-i-buy",
    question: "Should I buy Bitcoin before the halving?",
    answer:
      "Yes — per the rule, the buy point is 500 days before the halving. For this cycle that is November 28, 2026.",
    faq: true,
  },
  {
    id: "should-i-sell",
    question: "Should I sell Bitcoin before the halving?",
    answer:
      "No — the rule sells 500 days after the halving, not before. Selling before the halving would break the rule.",
    faq: true,
  },
  {
    id: "next-halving",
    question: "When is the next Bitcoin halving?",
    answer:
      "The next halving is projected for April 11, 2028 at block 1,050,000 — see /halving-dates for the live estimate.",
    faq: true,
  },
  {
    id: "financial-advice",
    question: "Is this financial advice?",
    answer: "No — this is historical information, not financial advice.",
    faq: true,
  },
];

export const BUY_POINT_FAQ = BUY_POINT_SECTIONS.filter((section) => section.faq).map(
  ({ question, answer }) => ({ question, answer }),
);
