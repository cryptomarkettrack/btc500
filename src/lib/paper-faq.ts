/**
 * Visible FAQ for the public paper-buy record.
 * The route generates its FAQPage schema from this same list, so the structured
 * data and the on-page copy can never drift apart.
 */
export const PAPER_FAQ: { question: string; answer: string }[] = [
  {
    question: "What is the BTC500 paper buy?",
    answer:
      "It is a public, paper-only $50,000 position that follows the BTC500 rule exactly: buy 500 days before a Bitcoin halving and sell 500 days after. No real money is used, there is no leverage, and there are no discretionary exits. It exists so the rule can be checked in public rather than argued about.",
  },
  {
    question: "When is the entry date and how is it chosen?",
    answer:
      "The entry date is the cycle's T-500 date, derived live from Bitcoin block height and the protocol halving schedule rather than picked by hand. That means the published date can move while the halving is still an estimate. The current date is shown at the top of this page and on the homepage countdown.",
  },
  {
    question: "What price is used for the entry and the daily mark?",
    answer:
      "The entry price is the BTC/USD daily close on the entry date from the site's bundled historical archive, with the same Bitstamp fallback the simulator uses for dates beyond the archive. The daily mark uses the site's live price feed. If either price is unavailable, no P&L is published rather than estimated.",
  },
  {
    question: "How is the P&L calculated?",
    answer:
      "The position holds a fixed number of BTC bought with $50,000 at the entry daily close. Unrealised P&L is that BTC amount times the current mark, minus $50,000, expressed in dollars and as a percentage. Before the entry date no position exists, so the ledger reports no P&L rather than a made-up number. The historical table shows the same calculation applied to the four completed cycles.",
  },
  {
    question: "When does the position close?",
    answer:
      "At T+500: exactly 500 calendar days after the halving. That date is also an estimate while the halving is in the future, so it can move. The page shows the current estimate and discloses it as such.",
  },
  {
    question: "Is this financial advice or a real fund?",
    answer:
      "No. This is an educational paper record. Nothing is bought or sold, no money is managed, and a paper result is not a guaranteed fill or a prediction. Historical results for the rule are a small sample and do not guarantee future results.",
  },
];
