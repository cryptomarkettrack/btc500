/**
 * Visible FAQ + FAQPage JSON-LD for /bitcoin-500-day-cycle.
 * Answers stay conceptual; live dates and prices render in the page body.
 */

export const CYCLE_FAQ = [
  {
    question: "When is 500 days before the next Bitcoin halving?",
    answer:
      "T-500 is the calendar day 500 days before the next estimated Bitcoin halving. Because the halving is triggered at a block height (the next one is 1,050,000), that date moves if blocks arrive faster or slower than ten minutes. BTC500 shows the live T-500 date on this page and on the homepage countdown.",
  },
  {
    question: "What happens 500 days before a Bitcoin halving?",
    answer:
      "T-500 is the start of the BTC500 window, not a forecast that a bottom has printed. Historically it has fallen in the later part of the post-peak decline or the early recovery, before the halving itself. This page compares Bitcoin’s price on that date with the price at the halving and, when the window has closed, at T+500.",
  },
  {
    question: "What happens 500 days after a Bitcoin halving?",
    answer:
      "T+500 is the end of the BTC500 window — about 16 months after the event. In completed cycles it has often landed after the strongest post-halving advance. The rule then stays in cash until the next T-500. A handful of cycles is a small sample; the next window can look different.",
  },
  {
    question: "Should you buy Bitcoin before or after the halving?",
    answer:
      "BTC500 studies a fixed pre-halving entry at T-500. That is a measurement rule, not a claim that buying after the event cannot work, and not a recommendation that anyone should buy. The simulator lets you compare that window with other dates using the same historical prices. Nothing here is financial advice.",
  },
  {
    question: "Should you sell Bitcoin before the halving?",
    answer:
      "The BTC500 rule does not sell before the event. It holds from T-500 through the halving to T+500. Selling before the halving is a different strategy. Past windows do not prove the next one, and this site does not tell anyone when they should sell.",
  },
  {
    question: "When should you sell Bitcoin after the halving?",
    answer:
      "BTC500’s historical exit is T+500. That is one rules-based date, not a forecast of the cycle top. Some completed windows were still rising at that point; others had already cooled. Compare the dates on the timeline rather than treating T+500 as a guaranteed peak.",
  },
  {
    question: "How has Bitcoin performed 500 days before previous halvings?",
    answer:
      "The table on this page lists the T-500, halving, and T+500 prices from BTC500’s historical archive for the 2012, 2016, 2020, and 2024 cycles. Completed T-500 to T+500 windows in that dataset finished higher than they started. Later windows started at a higher Bitcoin price and produced smaller multiples than the earliest ones. Past performance does not guarantee future results.",
  },
] as const;
