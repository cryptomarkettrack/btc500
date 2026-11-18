/**
 * Questions the spacing page answers, kept in one list so the rendered FAQ and
 * the FAQPage JSON-LD cannot disagree.
 *
 * Numbers live in the table, not in these answers: the page computes them from
 * the archive, so an answer that quoted its own copy could contradict the table
 * it sits above after any data correction. Only closed, historical windows are
 * named, and the test file locks them.
 */

export interface SpacingFaqItem {
  question: string;
  answer: string;
}

export const SPACING_FAQ: ReadonlyArray<SpacingFaqItem> = [
  {
    question: "Does the 500-day rule still work if you use 400 or 600 days?",
    answer:
      "Yes. In every spacing our price archive can compute, every completed window closed above its entry price. What changes is the size of the result, and the table on this page lists each window separately instead of hiding that in an average.",
  },
  {
    question: "Why is there no 600-day result for the 2012 halving?",
    answer:
      "600 days before 28 November 2012 is 8 April 2011, which is earlier than the first day in our price archive (17 July 2011). Nothing is estimated to fill the gap — the row is marked as not computable, and the 600-day statistics are based on three windows rather than four.",
  },
  {
    question: "Why did 400 days produce a 244x result in 2012?",
    answer:
      "Because that entry fell 28 days before the 2011 low, so the multiple describes the bottom rather than any property of a 400-day window. The 500-day window for the same halving starts on the archive's first row instead and returns 29.9x. Any comparison that quotes 244x without that label is misleading.",
  },
  {
    question: "Does a longer window give a better return?",
    answer:
      "Not in this archive. The 600-day windows returned a lower median multiple than the 500-day windows and traded much further below their entry, because a longer window starting before a halving buys more of the preceding bear phase. The rule is not improved by widening it.",
  },
  {
    question: "Is this a forecast?",
    answer:
      "No. It is a robustness check on four completed halvings (three at 600 days) using daily closing prices. It says the direction of the result does not depend on the 500-day choice; it says nothing about the next cycle, and nothing here is financial advice.",
  },
];
