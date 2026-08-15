export const SIMULATOR_FAQ = [
  {
    question: "What does the BTC500 simulator calculate?",
    answer:
      "It backtests one fixed rule against historical Bitcoin prices: buy exactly 500 days before each halving and sell exactly 500 days after. You pick a dollar amount, a first cycle, and whether profits are reinvested or the same amount is used in every window.",
  },
  {
    question: "What is the difference between reinvest and same amount each cycle?",
    answer:
      "Reinvest rolls the entire exit of one cycle into the next buy date. That is a single starting stake compounding across every selected window. Same amount each cycle invests a fresh copy of your number in every window and adds the results — closer to depositing the same cash each cycle and taking profits off the table.",
  },
  {
    question: "Why is the 2012 cycle so much larger than later ones?",
    answer:
      "Bitcoin was cheap and the market was small. A 500-day window around the 2012 halving captured a much larger multiple than later cycles. Starting in 2016, 2020, or 2024 still uses the same rule — the dollar result is smaller because the entry price was higher. The simulator lets you switch start years to see that gap.",
  },
  {
    question: "Does reinvesting beat buying Bitcoin and never selling?",
    answer:
      "Not always, and the comparison is on the page. Buy-and-hold from the first buy date to the last sell date stays in Bitcoin through every crash. BTC500 is in cash between sell and the next buy, which historically skipped the 2018 and 2022 drawdowns and missed whatever happened in those cash windows. Compare the three columns rather than assuming either path wins.",
  },
  {
    question: "Are fees, taxes, and slippage included?",
    answer:
      "No. The numbers use historical daily prices only. Exchange fees, spreads, taxes, and the difficulty of placing large orders in 2011–2013 are not modeled. Treat the result as a backtest of dates and prices, not a brokerage statement.",
  },
  {
    question: "Can this predict the next cycle?",
    answer:
      "No. A handful of completed halvings is a small sample. Later cycles have produced smaller multiples as Bitcoin matured. The next window can be better, worse, or fail. Past performance does not guarantee future results, and nothing here is financial advice.",
  },
  {
    question: "What would $500 or $1,000 have become?",
    answer:
      "Use the starting-amount field or the $500 and $1,000 presets. The result is the same rule applied to that cash: buy 500 days before each selected halving and sell 500 days after, using historical daily prices. Change the first cycle to see how much of the dollar result comes from 2012 versus later windows.",
  },
] as const;
