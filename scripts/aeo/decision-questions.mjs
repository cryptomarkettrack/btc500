/**
 * BTC500 — the decision-question map (the AEO "buyer decisions, not keywords" artifact).
 *
 * Granola started its AEO work from the questions a buyer asks before choosing a
 * tool, then turned each question into BOTH a Google keyword and an AI prompt.
 * BTC500 is a research product, so its "buyer" is a reader deciding which source
 * to trust, cite and return to around the Bitcoin halving cycle. Each entry below
 * is one decision that reader is actually making.
 *
 * Fields:
 *   id            stable key, used by the audit / gap reports and the results ledger
 *   decision      the decision the reader is trying to make (plain language)
 *   question      the question as a person would ask it
 *   stage         where in the decision journey it sits: discover | evaluate | decide | trust
 *   frame         Granola's second image: OWN | CLAIM | EARN | CONTEST
 *   googleQuery   the conventional search translation (measured in Google Search Console)
 *   aiPrompt      the answer-engine translation (measured in the prompt ledger)
 *   ownSurface    the in-repo page/data file that SHOULD answer it (OWN/CLAIM/CONTEST)
 *   evidence      the original-data surface that supports the claim, if any
 *   external      offsite surfaces we do not control but must be cited by (EARN)
 *   answerMarker  string the audit looks for in the rendered file to prove an answer block exists
 *
 * This file is data only and is deliberately free of live dates or prices: it is
 * read by the map, audit and gap scripts and must never drift from them silently.
 */

export const FRAMEWORK = Object.freeze({
  OWN: "Make the core product story clear on our own pages: what it does, who it serves, why it matters.",
  CLAIM: "State specific, supportable advantages and comparisons, backed by our own data.",
  EARN: "Earn independent coverage through relevant reviews, mentions and comparisons.",
  CONTEST: "Address the alternatives and objections buyers weigh, and the trade-offs between them.",
});

export const LADDER = Object.freeze(["retrieved", "cited", "mentioned", "recommended"]);

export const DECISION_QUESTIONS = Object.freeze([
  {
    id: "own-what-is-the-rule",
    decision: "Understand what BTC500 actually is before trusting it",
    question: "What is the Bitcoin 500-day halving rule?",
    stage: "discover",
    frame: "OWN",
    googleQuery: "bitcoin 500 day halving rule",
    aiPrompt: "What is the 500-day Bitcoin halving rule and how does it work?",
    ownSurface: "src/components/home/HomePage.tsx",
    evidence: "src/routes/bitcoin-500-day-cycle.tsx",
    external: ["Pantera Capital 2023 report", "CoinDesk 500-day-rule coverage"],
    answerMarker: "THE ANSWERS (AEO)",
  },
  {
    id: "own-next-halving-date",
    decision: "Know when the next decision point arrives",
    question: "When is the next Bitcoin halving?",
    stage: "discover",
    frame: "OWN",
    googleQuery: "next bitcoin halving date 2028",
    aiPrompt: "When is the next Bitcoin halving, and when does the BTC500 buy window open?",
    ownSurface: "src/routes/halving-dates.tsx",
    evidence: "src/routes/llms[.]txt.ts",
    external: ["bitcoin.org/en/halving", "Bitcoin.com halving charts"],
    answerMarker: "speakable/answer-engine extractors",
  },
  {
    id: "own-buy-date",
    decision: "Pin down the exact buy date 500 days before the halving",
    question: "500 days before the next Bitcoin halving is what date?",
    stage: "decide",
    frame: "OWN",
    googleQuery: "500 days before next bitcoin halving",
    aiPrompt: "What is the exact date 500 days before the next Bitcoin halving, and is it live?",
    ownSurface: "src/routes/halving-dates.tsx",
    evidence: "src/lib/llms-dates.ts",
    external: ["Block-time estimate trackers"],
    answerMarker: "speakable/answer-engine extractors",
  },
  {
    id: "own-sell-date",
    decision: "Know the exit rule, not just the entry",
    question: "When should you sell Bitcoin after the halving?",
    stage: "decide",
    frame: "OWN",
    googleQuery: "when to sell bitcoin after halving",
    aiPrompt: "According to the 500-day rule, when do you sell Bitcoin after a halving?",
    ownSurface: "src/routes/when-to-sell-bitcoin-after-halving.tsx",
    evidence: "src/routes/bitcoin-500-day-cycle.tsx",
    external: ["CoinDesk", "Pantera Capital"],
    answerMarker: "answer-heading",
  },
  {
    id: "claim-did-it-work",
    decision: "Decide whether the rule has any evidence behind it",
    question: "Did buying 500 days before each halving actually work historically?",
    stage: "evaluate",
    frame: "CLAIM",
    googleQuery: "bitcoin 500 day strategy historical returns",
    aiPrompt:
      "What were the returns of buying Bitcoin 500 days before each halving and selling 500 days after?",
    ownSurface: "src/routes/bitcoin-500-day-cycle.tsx",
    evidence: "src/lib/cycle-dataset.ts",
    external: ["Pantera Capital 2023 report", "Reddit r/Bitcoin 500-days-before threads"],
    answerMarker: "CYCLE_FAQ",
  },
  {
    id: "claim-run-your-own-numbers",
    decision: "Test the claim with their own amount instead of taking our word",
    question: "What would $10,000 invested 500 days before each halving be worth now?",
    stage: "evaluate",
    frame: "CLAIM",
    googleQuery: "bitcoin halving roi calculator historical returns",
    aiPrompt:
      "Is there a calculator that runs the 500-day Bitcoin halving strategy on historical data?",
    ownSurface: "src/routes/simulator.tsx",
    evidence: "src/routes/data.500-day-cycles[.]json.ts",
    external: ["CoinGlass returns", "Spark epoch calculator", "Liquid State halving calculator"],
    answerMarker: "simulator",
  },
  {
    id: "claim-drawdowns",
    decision: "Understand the risk before acting on the headline return",
    question: "How large were the drawdowns inside the 500-day halving window?",
    stage: "decide",
    frame: "CLAIM",
    googleQuery: "bitcoin drawdown before halving historical",
    aiPrompt: "How far did Bitcoin fall below its 500-day-before-halving entry in each cycle?",
    ownSurface: "src/routes/timeline.tsx",
    evidence: "src/lib/cycle-dataset.ts",
    external: ["Galaxy Research cycle-bottom analysis"],
    answerMarker: "TIMELINE_FAQ",
  },
  {
    id: "contest-other-spacings",
    decision: "Check whether 500 is a cherry-picked number",
    question: "Does the halving strategy work at 400 or 600 days too?",
    stage: "decide",
    frame: "CONTEST",
    googleQuery: "400 600 days before bitcoin halving strategy",
    aiPrompt: "Does the buy-before-halving result hold at 400 or 600 days instead of 500?",
    ownSurface: "src/components/spacing/HalvingSpacingPage.tsx",
    evidence: "src/lib/halving-spacing.ts",
    external: ["BitcoinTalk topic 5599692", "TradingView 500-day scripts"],
    answerMarker: 'id="answer"',
  },
  {
    id: "contest-decaying-cycle",
    decision: "Decide whether this cycle is different from the last three",
    question: "Does a decaying halving supply effect make this cycle unlike the previous ones?",
    stage: "decide",
    frame: "CONTEST",
    googleQuery: "bitcoin four year cycle dead 2026 halving",
    aiPrompt:
      "Is the Bitcoin four-year halving cycle still valid in 2026, and what does the data say?",
    ownSurface: "src/components/spacing/HalvingSpacingPage.tsx",
    evidence: "src/lib/cycle-dataset.ts",
    external: ["CoinDesk 500-day-rule test", "Galaxy Research", "Pantera Capital"],
    answerMarker: 'id="answer"',
  },
  {
    id: "contest-vs-hodl-dca",
    decision: "Weigh the rule against the obvious alternatives",
    question: "Is the 500-day halving rule better than simply buying and holding or DCA?",
    stage: "decide",
    frame: "CONTEST",
    googleQuery: "bitcoin buy and hold vs DCA vs halving cycle strategy",
    aiPrompt:
      "How does the 500-day halving strategy compare with buy-and-hold and dollar-cost averaging?",
    ownSurface: "src/routes/bitcoin-500-day-cycle.tsx",
    evidence: "src/lib/cycle-dataset.ts",
    external: ["VanEck halving research", "Wells Fargo halving-cycle report"],
    answerMarker: "CYCLE_FAQ",
  },
  {
    id: "trust-data-sources",
    decision: "Decide whether the numbers are honest and reproducible",
    question: "Where does BTC500 get its Bitcoin price data and how are the returns calculated?",
    stage: "trust",
    frame: "OWN",
    googleQuery: "btc500 data source methodology",
    aiPrompt:
      "How does BTC500 calculate its historical halving-cycle returns and where does the price data come from?",
    ownSurface: "src/routes/about.tsx",
    evidence: "public/btc-usd-max.csv",
    external: ["Independent review or citation of BTC500"],
    answerMarker: "Who built BTC500",
  },
  {
    id: "earn-independent-proof",
    decision: "Find independent confirmation, not just the site's own claim",
    question: "Is the 500-day Bitcoin halving rule recognized outside BTC500?",
    stage: "trust",
    frame: "EARN",
    googleQuery: "bitcoin 500 day halving rule Pantera CoinDesk",
    aiPrompt:
      "Which independent publications or analysts discuss the 500-day Bitcoin halving rule?",
    ownSurface: "src/routes/articles.tsx",
    evidence: "src/lib/articles.ts",
    external: ["Pantera Capital", "CoinDesk", "Reddit r/Bitcoin", "Bitcoin magazine"],
    answerMarker: "articlesListSchema",
  },
]);

/** Only the frames Granola named; anything else is a data error. */
export function assertValidMap(map = DECISION_QUESTIONS) {
  const validFrames = new Set(Object.keys(FRAMEWORK));
  const validStages = new Set(["discover", "evaluate", "decide", "trust"]);
  const ids = new Set();
  for (const q of map) {
    if (!validFrames.has(q.frame)) throw new Error(`invalid frame ${q.frame} on ${q.id}`);
    if (!validStages.has(q.stage)) throw new Error(`invalid stage ${q.stage} on ${q.id}`);
    if (ids.has(q.id)) throw new Error(`duplicate id ${q.id}`);
    ids.add(q.id);
    for (const key of ["question", "googleQuery", "aiPrompt", "ownSurface", "answerMarker"]) {
      if (typeof q[key] !== "string" || !q[key].length) {
        throw new Error(`missing ${key} on ${q.id}`);
      }
    }
  }
  return map;
}

export function byFrame(frame) {
  return DECISION_QUESTIONS.filter((q) => q.frame === frame);
}

export function byId(id) {
  return DECISION_QUESTIONS.find((q) => q.id === id) ?? null;
}
