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
    question: "When is 500 days before the next Bitcoin halving?",
    answer:
      "The BTC500 buy date is the calendar day 500 days before the next estimated Bitcoin halving. Because the halving is triggered by block height (1,050,000), that buy date moves if blocks come in faster or slower than ten minutes. The live date is on the BTC500 homepage countdown and the halving-dates schedule.",
  },
  {
    question: "How does the Bitcoin halving work?",
    answer:
      "Bitcoin halving occurs approximately every 210,000 blocks (~4 years). The block reward paid to miners is cut in half, reducing new Bitcoin supply issued each day. Scarcity from lower issuance has historically coincided with major multi-year price cycles.",
  },
  {
    question: "What happens to Bitcoin price after halving?",
    answer:
      "In each completed halving cycle since 2012, Bitcoin's price rose substantially in the 12–18 months after the halving before peaking and entering a new market cycle. Past performance does not guarantee future results, and the BTC500 strategy exists to capture this recurring post-halving window systematically.",
  },
  {
    question: "Is buying before a Bitcoin halving profitable?",
    answer:
      "Historically, buying roughly 500 days before each halving and selling 500 days after has been profitable in every completed cycle — including 2012, 2016 and 2020. The BTC500 simulator lets you backtest any amount against real historical prices to see these returns yourself.",
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
      "BTC500 includes a live halving countdown and Cycle Command Center, investment simulator, DCA vs lump sum comparison, interactive timeline, bear market bottom indicators, futures liquidation dashboard, Bitcoin ETF absorption board, insider trading tracker, crypto news feed, strategy articles, and free embed widgets.",
  },
  {
    question: "What is the average Bitcoin halving cycle length?",
    answer:
      "A full Bitcoin halving cycle spans roughly 4 years (approximately 210,000 blocks). The BTC500 strategy uses the 500 days before and 500 days after each halving as the buy and sell window, covering the historically strongest parts of each cycle.",
  },
  {
    question: "How much do I need to start using the BTC500 strategy?",
    answer:
      "There is no minimum. The simulator lets you enter any amount — from $100 to $1,000,000+ — and see how the same strategy would have performed across every halving cycle since 2012.",
  },
] as const;
