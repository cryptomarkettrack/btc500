import { createFileRoute, Link } from "@tanstack/react-router";
import { AnswerSection } from "@/components/aeo/AnswerSection";
import { LegalPage } from "@/components/LegalPage";
import {
  AUTHOR_JOB_TITLE,
  AUTHOR_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";

/** Visible answers on /about; the same list feeds FAQPage JSON-LD. */
const ABOUT_FAQ = [
  {
    question: "Where does BTC500 get its Bitcoin price data?",
    answer:
      "Historical returns use Bitstamp daily closes in a bundled archive; the live price comes from Binance, CoinGecko, Coinbase and Kraken. Block height comes from public Bitcoin blockchain APIs, ETF flows from TFTC open series (SoSoValue and Farside), and insider filings from public SEC Form 4 data. Every figure on the site is derived from the same archive, and the full dataset is downloadable as JSON.",
  },
  {
    question: "How does BTC500 calculate the buy and sell dates?",
    answer:
      "A halving happens every 210,000 blocks. BTC500 subtracts 500 calendar days from the estimated next-halving date for the buy date and adds 500 days to a known or estimated halving for the sell date. Both dates are rendered live from block height, so they move as average block time changes.",
  },
  {
    question: "Who is BTC500 for?",
    answer:
      "Self-directed Bitcoin investors and researchers who want a fixed, auditable calendar rule and the historical data behind it. It is free educational software, not a fund, broker, advisory service or source of financial advice.",
  },
];

const aboutSchema = [
  generateWebPageSchema({
    path: "/about",
    name: "About BTC500",
    description:
      "BTC500 is free educational software for the Bitcoin 500 strategy: buy 500 days before each halving and sell 500 days after.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
  }),
  generateSpeakableSchema({ path: "/about", cssSelectors: [".lead"] }),
  generateFaqSchema(ABOUT_FAQ),
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#author`,
    name: AUTHOR_NAME,
    jobTitle: AUTHOR_JOB_TITLE,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    url: `${SITE_URL}/about`,
  },
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About BTC500",
    url: `${SITE_URL}/about`,
    description: "Who built BTC500, how the strategy works, and which data sources the tools use.",
  },
  {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "BTC500 glossary",
    hasDefinedTerm: [
      {
        "@type": "DefinedTerm",
        name: "BTC500",
        description:
          "A rules-based Bitcoin approach: buy exactly 500 days before each halving and sell exactly 500 days after.",
      },
      {
        "@type": "DefinedTerm",
        name: "Bitcoin halving",
        description:
          "An automatic event every 210,000 blocks (~4 years) that cuts the miner block reward in half.",
      },
      {
        "@type": "DefinedTerm",
        name: "Buy date",
        description: "The calendar day 500 days before the next Bitcoin halving.",
      },
      {
        "@type": "DefinedTerm",
        name: "Sell date",
        description: "The calendar day 500 days after a Bitcoin halving.",
      },
    ],
  },
];

export const Route = createFileRoute("/about")({
  head: () =>
    generatePageHead({
      path: "/about",
      title: "About BTC500 — Bitcoin Halving Strategy & Methodology",
      description:
        "BTC500 is free educational software for a single Bitcoin rule: buy 500 days before each halving, sell 500 days after. Methodology, data sources, and contact.",
      keywords:
        "about BTC500, Bitcoin halving strategy, BTC500 methodology, Bitcoin countdown, who made BTC500",
      ogTitle: "About BTC500",
      ogDescription:
        "Free Bitcoin halving tools built around one rule. How it works, where the data comes from, and how to reach us.",
      schema: aboutSchema,
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <LegalPage title="About BTC500" updated="August 13, 2026">
      <p id="about-lead" className="lead text-base text-foreground">
        BTC500 is a free Bitcoin halving countdown and research site built around one rule: buy
        Bitcoin 500 days before each halving and sell 500 days after. It is educational software,
        not a fund, broker, or advisory service.
      </p>

      <AnswerSection
        className="mt-8"
        question="Where does BTC500 get its data and how are returns calculated?"
        answer="BTC500 is free educational software built around one rule: buy Bitcoin 500 days before each halving and sell 500 days after. Its historical returns use Bitstamp daily closes, and its buy and sell dates are derived live from Bitcoin block height."
        detail="The same bundled daily-close archive feeds the simulator, the cycle tables and the downloadable dataset, so the numbers cannot disagree between pages. Nothing here is financial advice."
        source={{ href: "/data/500-day-cycles.json", label: "Download the dataset and citation" }}
      />

      <section>
        <h2>What the site does</h2>
        <p>
          The homepage tracks live block height and shows the next buy date, sell date, and block
          progress. The{" "}
          <Link to="/simulator" className="text-primary">
            simulator
          </Link>{" "}
          backtests that same rule on Bitstamp daily prices for every completed cycle since 2012.
          Other tools cover{" "}
          <Link to="/dca" className="text-primary">
            DCA vs lump sum
          </Link>
          , the{" "}
          <Link to="/timeline" className="text-primary">
            cycle timeline
          </Link>
          , liquidations,{" "}
          <Link to="/bitcoin-etf" className="text-primary">
            Bitcoin ETF absorption
          </Link>
          , insider filings, and{" "}
          <Link to="/articles" className="text-primary">
            strategy articles
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Methodology</h2>
        <p>
          A Bitcoin halving occurs every 210,000 blocks. BTC500 subtracts 500 calendar days from the
          estimated next-halving date to get the buy date, and adds 500 calendar days after a known
          or estimated halving to get the sell date. The next-halving date is estimated from live
          block height and average block time; it will move as blocks come in faster or slower than
          10 minutes.
        </p>
        <p>
          Historical returns use Bitstamp daily closes. Completed cycles in the simulator are 2012,
          2016, 2020, and 2024; the 2024 window closed on 2 September 2025. Past performance does
          not guarantee future results.
        </p>
        <p>
          The{" "}
          <Link to="/bitcoin-500-day-cycle" className="text-primary">
            500-day cycle explainer
          </Link>{" "}
          also publishes what each window cost to hold and how much the exact T-500 entry date
          mattered: every completed window is re-run with the entry moved from 120 days earlier to
          120 days later, keeping the T+500 exit fixed.
        </p>
      </section>

      <section>
        <h2>Data sources</h2>
        <ul>
          <li>Historical BTC/USD prices: Bitstamp</li>
          <li>Live price: Binance, CoinGecko, Coinbase, and Kraken</li>
          <li>Block height: public Bitcoin blockchain APIs</li>
          <li>Insider filings: public SEC Form 4 data</li>
          <li>
            Bitcoin ETF flows: TFTC open series (SoSoValue aggregates and Farside issuer tables)
          </li>
        </ul>
      </section>

      <section>
        <h2>Who it is for</h2>
        <p>
          Self-directed Bitcoin investors who want a calendar rule they can audit. It is not for
          day-traders, leverage traders, or anyone looking for personalized financial advice.
        </p>
      </section>

      <section>
        <h2>Questions about BTC500</h2>
        <dl className="mt-4 space-y-5">
          {ABOUT_FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-foreground">{item.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <strong>Methodology and content responsibility:</strong> {AUTHOR_NAME} —{" "}
          {AUTHOR_JOB_TITLE}. Corrections: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Follow{" "}
          <a href="https://x.com/btc500halving" rel="noopener noreferrer me">
            @btc500halving
          </a>{" "}
          on X. Press and corrections welcome — we update articles when facts change.
        </p>
      </section>
    </LegalPage>
  );
}
