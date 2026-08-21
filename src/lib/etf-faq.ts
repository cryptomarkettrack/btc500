/**
 * Visible FAQ + FAQPage JSON-LD for /bitcoin-etf.
 */

export const ETF_FAQ = [
  {
    question: "What are Bitcoin ETF inflows and outflows?",
    answer:
      "Inflows are net creations of US spot Bitcoin ETF shares. Authorized participants buy bitcoin to back those shares, so an inflow is bitcoin taken off the market. Outflows are redemptions: shares are retired and bitcoin is sold back into the market. BTC500 converts those dollar prints into BTC and compares them with miner issuance.",
  },
  {
    question: "Why look at ETF flows in bitcoin instead of dollars?",
    answer:
      "A $500 million inflow at $40,000 buys more coins than the same dollar print at $90,000. Dollar tables mix price with demand. Absorption asks a cleaner question: how many coins did the funds take, and was that more or less than miners created that day?",
  },
  {
    question: "How is miner issuance calculated?",
    answer:
      "Bitcoin targets 144 blocks per day. Before the 20 April 2024 halving the block subsidy was 6.25 BTC (900 BTC/day). After it, the subsidy is 3.125 BTC (450 BTC/day). Rolling windows sum that daily issuance across calendar days, including weekends when ETFs do not trade.",
  },
  {
    question: "What does squeezing, absorbing, or leaking mean?",
    answer:
      "Squeezing means ETFs took at least 1.2× the new coins miners created. Absorbing means they roughly matched issuance. Leaking means miners added more coins than ETFs removed. Dumping means the funds had net redemptions, so coins went back to the market. A single session is noise; the 7-day and 30-day windows are the signal.",
  },
  {
    question: "How do Bitcoin ETF flows sit in the 500-day cycle?",
    answer:
      "US spot Bitcoin ETFs launched on 11 January 2024, inside the 2024 cycle's T-500 to halving buy window. BTC500 splits the flow record into that pre-halving stretch, the hold window through T+500 (2 September 2025), and the period after T+500 while the next buy date approaches. Past windows do not guarantee the next one.",
  },
  {
    question: "Where does this Bitcoin ETF data come from?",
    answer:
      "Daily net flows and per-fund breakdowns come from TFTC's open JSON series (CC BY 4.0), compiled from SoSoValue aggregates and issuer disclosures as tabulated by Farside Investors. Figures can revise as issuers finalize creations and redemptions after the US cash close. Nothing here is financial advice.",
  },
  {
    question: "Do ETF holdings equal cumulative net inflows?",
    answer:
      "No. Grayscale's GBTC already held a large bitcoin stack before it converted into an ETF, so current AUM includes coins that were never an 'inflow' after 11 January 2024. Cumulative net flow in BTC is the coins created minus redeemed since launch. AUM divided by the bitcoin price is a mark-to-market holdings estimate.",
  },
] as const;
