import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, SITE_URL, generatePageHead, generateWebPageSchema } from "@/lib/site";

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

      <section>
        <h2>What the site does</h2>
        <p>
          The homepage tracks live block height and shows the next buy date, sell date, and cycle
          score. The{" "}
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
          ,{" "}
          <Link to="/bear-market" className="text-primary">
            bear-market indicators
          </Link>
          , liquidations, insider filings, and{" "}
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
          2016, and 2020. The 2024 cycle is still open until its sell date. Past performance does
          not guarantee future results.
        </p>
      </section>

      <section>
        <h2>Data sources</h2>
        <ul>
          <li>Historical BTC/USD prices: Bitstamp</li>
          <li>Live price: Binance, CoinGecko, Coinbase, and Kraken</li>
          <li>Block height: public Bitcoin blockchain APIs</li>
          <li>On-chain bottom indicators: public on-chain series used in the cycle score</li>
          <li>Insider filings: public SEC Form 4 data</li>
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
        <h2>Contact</h2>
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
