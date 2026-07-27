/**
 * Homepage FAQ copy — keep in sync with FAQPage JSON-LD in __root.tsx.
 * Visible on-page answers are required for FAQ rich results eligibility.
 */

export const FAQ_ITEMS = [
  {
    question: "What is the BTC500 strategy?",
    answer:
      "The BTC500 strategy is a simple Bitcoin investment approach: buy exactly 500 days before each halving event and sell exactly 500 days after. This rules-based method is designed to capture historically strong parts of Bitcoin's roughly four-year halving cycle without day-trading or technical analysis.",
  },
  {
    question: "When is the next Bitcoin halving?",
    answer:
      "The next Bitcoin halving is projected for around April 2028, when block height reaches 1,050,000. The exact date depends on Bitcoin's average block time. BTC500 tracks live block height and estimates the countdown automatically.",
  },
  {
    question: "How does the Bitcoin halving work?",
    answer:
      "Bitcoin halving occurs approximately every 210,000 blocks (~4 years). The block reward paid to miners is cut in half, reducing new Bitcoin supply issued each day. Scarcity from lower issuance has historically coincided with major multi-year price cycles.",
  },
  {
    question: "Is BTC500 free to use?",
    answer:
      "Yes. BTC500's countdown, simulator, timeline, bear-market indicators, liquidation dashboard, articles, and embed widgets are free. No account is required.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. BTC500 is educational software and market data tooling. Nothing on the site is financial, investment, or trading advice. Past performance does not guarantee future results. Always do your own research.",
  },
  {
    question: "What tools does BTC500 include?",
    answer:
      "BTC500 includes a live halving countdown and Cycle Command Center, investment simulator, DCA vs lump sum comparison, interactive timeline, bear market bottom indicators, futures liquidation dashboard, insider trading tracker, crypto news feed, strategy articles, and free embed widgets.",
  },
] as const;
