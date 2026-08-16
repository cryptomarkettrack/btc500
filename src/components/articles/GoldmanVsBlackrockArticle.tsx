import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function GoldmanVsBlackrockArticle({ title, date, readTime }: ArticleProps) {
  return (
    <>
      {/* Article header */}
      <motion.header
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Article</span>
          <span>·</span>
          <Clock className="h-4 w-4" />
          <span>{readTime}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      </motion.header>

      {/* Article content */}
      <motion.article
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p className="lead">
            Goldman Sachs is buying into the bitcoin income ETF business for{" "}
            <strong>$2.25 billion</strong>, an acquisition that expands the bank&apos;s
            derivative-powered ETF platform to <strong>$130 billion</strong> in total assets and
            positions it directly against BlackRock&apos;s rival income fund. The deal — reported
            August 12, 2026 — is the clearest sign yet that Wall Street is moving from &ldquo;own
            bitcoin&rdquo; to &ldquo;manufacture a product that pays income from bitcoin&rdquo;
            as institutional demand matures.
          </p>

          <p>
            The structure matters more than the headline. NEOS — the ETF issuer Goldman is
            acquiring — runs a family of <strong>covered-call bitcoin ETFs</strong> that sell
            options on their bitcoin exposure to generate monthly income. Goldman&apos;s move turns
            the bank from a buyer of bitcoin ETFs into an operator of the yield products built on
            top of them. According to analysts cited by CoinDesk, the deal &ldquo;takes direct aim
            at BlackRock&apos;s rival BITA fund&rdquo; — a fund that pioneered the same
            income-generating category.
          </p>
{/* Hero image */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/goldman-vs-blackrock/etf-war-hero.svg"
              alt="Goldman Sachs vs BlackRock bitcoin ETF war — Goldman's $2.25 billion NEOS buyout builds a $130 billion derivative ETF platform, going head to head with BlackRock's BITA income fund."
              width={1536}
              height={1024}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
            <figcaption
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--muted-foreground)",
                background: "var(--card)",
              }}
            >
              Goldman&apos;s $2.25 billion NEOS acquisition builds the largest derivative-powered ETF
              platform outside BlackRock — and sets up a direct contest over bitcoin income products.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Key takeaway:</strong> The ETF race has entered a new phase. The first wave
              was about custody and exposure — who can hold bitcoin most efficiently. The second
              wave is about yield — who can manufacture income from the same bitcoin while
              keeping the exposure. Goldman just bought a seat at that table for $2.25 billion.
            </p>
          </div>

          <h2>What a &ldquo;bitcoin income ETF&rdquo; actually is</h2>
          <p>
            A covered-call bitcoin ETF holds bitcoin exposure and simultaneously sells call
            options against it. The premium collected from those options becomes the &ldquo;income&rdquo;
            the fund pays out — usually monthly. In exchange, the fund caps its upside: if bitcoin
            rallies hard, the option buyer captures gains above the strike price.
          </p>

          <p>
            That tradeoff is precisely why these products attract a different investor than a
            plain spot ETF. Retirees, wealth managers, and institutions that need cash flow but
            want bitcoin exposure can buy a product that pays while it holds. BlackRock saw this
            with BITA. Goldman is betting it can do it at scale — and across its entire{" "}
            <strong>$130 billion</strong> derivative platform.
          </p>

          <h2>Why this is a war, not a product launch</h2>
          <p>
            The numbers frame the competition. Goldman&apos;s NEOS deal pushes its ETF platform to
            $130 billion in assets, per analyst estimates. BlackRock&apos;s bitcoin income fund
            already owns the category&apos;s first-mover position. Both are now competing for the
            same institutional allocation dollars — and for the custody relationships underneath
            them.
          </p>

          <div className="data-point">
            <strong>ETF flows context:</strong> Cumulative net inflows into US spot bitcoin ETFs
            stood at <strong>$52.5 billion</strong> as of August 11, 2026, with the prior week
            averaging roughly <strong>$850M–$1B in daily net inflows</strong> — around 4x daily
            mining issuance at the time. Daily flows are still the single biggest institutional
            tell in the market.
          </div>

          <p>
            The other heavyweight is moving in the opposite direction — temporarily. Strategy
            (formerly MicroStrategy) sold <strong>1,690 BTC</strong> in a share-sale raise of{" "}
            <strong>$653 million</strong>, growing its dollar reserves to $4.65 billion while its
            treasury still holds <strong>840,447 BTC</strong>. Its CEO says accumulation will
            resume this year; the firm has bought 175,000 BTC and sold just 7,000 since January —
            a net buyer by a factor of <strong>25x</strong>.
          </p>

          <p>
            Add Fidelity&apos;s filing to add staking to its nearly <strong>$900 million</strong>{" "}
            ether ETF, and the institutional picture sharpens: the biggest asset managers are all
            building yield, income, and staking layers on top of crypto exposure. Spot products
            were the opening move. Income products are the follow-up — and the race just got a new
            favorite.
          </p>

          <h2>The supply math behind the noise</h2>
          <p>
            Strip out the brand-name headlines and the signal is about who holds bitcoin — and how
            long they hold it. A covered-call fund holds its bitcoin position; it doesn&apos;t
            trade it away for income. A staking-enabled ether ETF holds and locks its ether. Both
            reduce the float available to short-term traders.
          </p>

          <p>
            This matters even more as the halving approaches. The next halving — projected for{" "}
            <strong>April 2028</strong> at block height <strong>1,050,000</strong> — cuts new
            supply issuance in half. When daily ETF demand is already running at multiples of daily
            miner issuance, and the newest institutional products hold rather than trade, the
            supply side of the equation tightens in both directions: less new supply entering, more
            supply leaving the active float.
          </p>

          <p>
            Bitcoin itself was trading near <strong>$64,000</strong> on August 12, 2026, holding
            steady after US CPI inflation slowed to <strong>3.4%</strong> as expected — with
            September Fed rate-pause odds near 60%. The macro backdrop remains the tide; the ETF
            custody race is the current beneath it.
          </p>
<h2>How a rules-based investor should think about it</h2>
          <p>
            For the BTC500 strategy, the ETF war is a confirmation, not a new signal. Each new
            institutional product — spot, then income, then staking — adds demand that is structural
            rather than speculative. That is exactly the kind of holder behavior that historically
            strengthens the halving cycle: fewer coins available, held for longer, by buyers who
            don&apos;t exit on red days.
          </p>

          <p>
            What the ETF war does <em>not</em> do is change the date. The strategy still says buy{" "}
            <strong>500 days before</strong> the halving — <strong>November 30, 2026</strong> — and
            sell <strong>500 days after</strong>, around <strong>August 26, 2029</strong>. Institutions
            debate product design; the calendar doesn&apos;t care which fund wins.
          </p>

          <div className="highlight-box">
            <p>
              <strong>The bottom line on the ETF war:</strong> Goldman&apos;s $2.25 billion NEOS
              buyout turns the bitcoin income ETF category into a genuine two-front competition
              with BlackRock, on a $130 billion platform. The category&apos;s defining trait is that
              it <em>holds</em> bitcoin while paying income — the opposite of speculative trading.
              For a cycle-timed investor, that is structurally supportive supply behavior heading
              into a halving, and it changes nothing about the buy date. 110 days to go.
            </p>
          </div>

          <div className="strategy-box">
            <h3>See you in 110 days.</h3>
            <p className="formula">Nov 30, 2026 — the official BTC500 buy date</p>
            <p>
              Check the live{" "}
              <Link to="/" className="font-semibold text-primary underline">
                halving countdown
              </Link>
              , run the numbers on the{" "}
              <Link to="/simulator" className="font-semibold text-primary underline">
                investment simulator
              </Link>
              , and review every cycle on the{" "}
              <Link to="/timeline" className="font-semibold text-primary underline">
                timeline
              </Link>
              .
            </p>
          </div>

          <h2>FAQ</h2>
          <div className="faq-list space-y-6">
<div>
              <h3>What is the Goldman Sachs NEOS deal?</h3>
              <p>
                Goldman Sachs is acquiring NEOS, an ETF issuer focused on covered-call bitcoin
                income products, in a transaction valued at $2.25 billion. The deal expands
                Goldman&apos;s derivative-powered ETF platform to roughly $130 billion in total
                assets, per analysts, and positions the bank directly against BlackRock&apos;s BITA
                income fund.
              </p>
            </div>

            <div>
              <h3>What is a bitcoin income ETF and how does it work?</h3>
              <p>
                A bitcoin income ETF (typically a covered-call fund) holds bitcoin exposure and
                sells call options against it, collecting option premiums that are paid out as
                income. It trades away some upside in exchange for regular cash flow.
              </p>
            </div>

            <div>
              <h3>Why is Goldman buying into bitcoin income ETFs?</h3>
              <p>
                Goldman is competing for the same institutional allocation dollars as BlackRock.
                Income-generating bitcoin products appeal to wealth managers and institutions that
                want exposure plus cash flow, and Goldman&apos;s $130 billion derivative platform
                gives it distribution scale to make the category its own.
              </p>
            </div>

            <div>
              <h3>Does the ETF war affect the bitcoin price?</h3>
              <p>
                Indirectly, on the supply side. Income and staking products hold their bitcoin or
                ether rather than trading it, which tightens available float at a time when spot
                ETF daily inflows are already running at multiples of daily mining issuance.
              </p>
            </div>

            <div>
              <h3>How does this relate to the next halving and the BTC500 buy date?</h3>
              <p>
                The next Bitcoin halving is projected for April 2028 at block height 1,050,000. The
                official BTC500 buy date is November 30, 2026 — exactly 500 days before the halving.
                Institutional products that hold bitcoin reduce float and tend to strengthen the
                halving-cycle dynamics the strategy is built around. From August 12, 2026, there
                are 110 days until the buy date.
              </p>
            </div>
          </div>

          <h2>Bottom Line</h2>
          <p>
            Goldman&apos;s $2.25 billion move into bitcoin income ETFs turns a product niche into a
            two-front institutional war. Covered-call funds hold bitcoin and pay income; staking
            ETFs lock ether. Both behaviors reduce sellable float — a structural tailwind heading
            into the April 2028 halving.
          </p>

          <p>
            The BTC500 strategy was built for exactly this kind of market: institutional noise is
            rising, but the rule stays fixed. <strong>November 30, 2026</strong> is 110 days away.
            The ETF platforms will keep competing for allocation. The calendar is waiting for
            everyone.
          </p>

          <h2>Related Reading</h2>
          <ul>
            <li>
              <a href="/articles/sec-cancels-regulation-crypto" className="font-semibold text-primary underline">
                SEC Cancels Regulation Crypto Vote
              </a>{" "}
              — Friday&apos;s offering-rules meeting was pulled with no new date; Bitcoin&apos;s
              classification does not change.
            </li>
            <li>
              <a href="/articles/bitcoin-week-ahead" className="font-semibold text-primary underline">
                Bitcoin This Week (Aug 17–23, 2026)
              </a>{" "}
              — FOMC minutes, Jackson Hole, ETF flows, and why institutional demand is still the story.
            </li>
            <li>
              <a href="/articles/strongest-hands" className="font-semibold text-primary underline">
                Bitcoin&apos;s Strongest Hands Are Back
              </a>{" "}
              — 90 elite wallets now hold 10,000+ BTC each as accumulation continues through the noise.
            </li>
          </ul>

          <p>
            <em>
              BTC500 is free educational software. Nothing on this page is financial advice.
              Historical performance does not guarantee future results.
            </em>
          </p>
        </div>
      </motion.article>
    </>
  );
}
