import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function BitcoinWeekAheadArticle({ title, date, readTime }: ArticleProps) {
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
            Bitcoin enters the week of <strong>August 10–16, 2026</strong> sitting above{" "}
            <strong>$65,000</strong> with three forces in play: a record wave of spot ETF buying,
            historically compressed volatility, and fresh US inflation data due mid-week. The single
            number that matters is ETF demand — institutions are already absorbing roughly{" "}
            <strong>four times</strong> the Bitcoin miners create every day.
          </p>

          <p>
            Most Monday articles chase every headline. This one does the opposite. The week ahead
            has five events worth knowing and exactly one rule that matters: the official BTC500 buy
            date — <strong>November 30, 2026</strong> — is now about <strong>112 days away</strong>.
            Everything below is context for that date, not a reason to change it.
          </p>

          {/* Hero image */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/weekly-brief/weekly-brief-hero.svg"
              alt="Bitcoin this week: five events and one rule — daily ETF flows, US CPI, options expiry, CLARITY countdown, and the official buy date November 30, 2026"
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
              The week at a glance: five events, one rule — nothing changes the November 30, 2026
              buy date.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Key takeaway:</strong> After the strongest ETF week since April ( ~$850M–$1B
              of net inflows), institutional demand has become Bitcoin&apos;s dominant buyer. That
              demand is the story this week — not BIP-110, which died over the weekend, and not the
              CLARITY Act, which is now officially a September event. And it is about to get more
              competitive: Goldman Sachs just moved into the bitcoin income ETF race with a{" "}
              <a
                href="/articles/goldman-vs-blackrock"
                className="font-semibold text-primary underline"
              >
                $2.25 billion NEOS deal aimed at BlackRock&apos;s BITA fund
              </a>
              .
            </p>
          </div>

          <h2>Bitcoin This Week at a Glance</h2>
          <p>
            Here is everything scheduled for the week of August 10–16, 2026, ranked by how much it
            can actually move Bitcoin:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 pr-4 font-semibold">When</th>
                  <th className="py-3 pr-4 font-semibold">Event</th>
                  <th className="py-3 font-semibold">Why it matters for Bitcoin</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">
                    Mon–Fri · daily
                  </td>
                  <td className="py-4 pr-4 align-top">
                    Spot ETF flow reports (IBIT, FBTC, and peers)
                  </td>
                  <td className="py-4 align-top">
                    The dominant price driver. After last week&apos;s ~$850M–$1B net inflow — the
                    best since April — every daily print tests whether institutions keep absorbing
                    supply near $65,000.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">
                    Tue–Wed · ~Aug 12
                  </td>
                  <td className="py-4 pr-4 align-top">US CPI (expected) + PPI</td>
                  <td className="py-4 align-top">
                    The week&apos;s highest-variance catalyst. Friday&apos;s shock jobs report
                    (23,000 jobs shed) opened a &ldquo;stagflation&rdquo; debate; a hot print feeds
                    the Fed-hike fear, a cool one fuels the $65,000 breakout.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Thursday</td>
                  <td className="py-4 pr-4 align-top">Weekly US jobless claims</td>
                  <td className="py-4 align-top">
                    A second read on the cooling labor market after July&apos;s surprise contraction
                    — the data point that reset rate expectations last Friday.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Friday</td>
                  <td className="py-4 pr-4 align-top">
                    Weekly BTC options expiry + US retail sales &amp; consumer sentiment
                  </td>
                  <td className="py-4 align-top">
                    Weekly expiry day can pin or squeeze price near $65K, while retail sales and
                    Michigan sentiment confirm — or kill — the stagflation narrative. The SEC also{" "}
                    <a
                      href="/articles/sec-cancels-regulation-crypto"
                      className="font-semibold text-primary underline"
                    >
                      cancelled Friday&apos;s Regulation Crypto vote
                    </a>{" "}
                    with no new date.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">All week</td>
                  <td className="py-4 pr-4 align-top">CLARITY Act — Senate in recess</td>
                  <td className="py-4 align-top">
                    No vote this week. The procedural vote now lands in September; the
                    &ldquo;countdown to the vote&rdquo; narrative starts now.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">All week</td>
                  <td className="py-4 pr-4 align-top">Coldcard exploit fallout (~$111M+)</td>
                  <td className="py-4 align-top">
                    The live test of whether &ldquo;bad news no longer matters&rdquo; holds while
                    demand is structural. Watch whether ETF flows rise anyway.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Nov 30, 2026</td>
                  <td className="py-4 pr-4 align-top">Official BTC500 buy date</td>
                  <td className="py-4 align-top">
                    112 days away. The one date none of the above can change.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="data-point">
            <strong>Note on dates:</strong> US macro releases (CPI, PPI, retail sales) follow the
            standard monthly release schedule and can shift. Treat these as expected dates and
            verify official times before acting on them.
          </div>

          <h2>What Happened Last Week in Bitcoin</h2>
          <p>
            Last week compressed three months of storylines into five days. Bitcoin reclaimed August
            highs above <strong>$65,000</strong> as a shock US jobs report — the economy shed 23,000
            jobs in July — cooled rate-hike expectations. The controversial{" "}
            <strong>BIP-110 soft fork died</strong>, mining two blocks before its minority chain
            stalled, with miner support below 3%. And the <strong>Coldcard exploit</strong> climbed
            past $111 million confirmed stolen, with a median victim loss of 1 BTC.
          </p>

          <p>
            The reaction told you everything: spot ETFs booked their best week since April even
            while the security story dominated headlines. Bitcoin priced the hack as infrastructure
            noise, not a monetary event. That is what a structural demand regime looks like.
          </p>

          <h2>Why Everyone Is Watching the ETF Flow Number</h2>
          <p>
            Last week, spot Bitcoin ETFs recorded an estimated{" "}
            <strong>$850 million to $1 billion in net inflows</strong> — the strongest weekly total
            since mid-April — with BlackRock&apos;s IBIT taking the bulk. Bitwise CIO Matt Hougan
            framed the long game: institutional capital pools hold up to{" "}
            <strong>$200 trillion</strong>, and even a 1% allocation shift into Bitcoin unlocks
            massive long-term demand.
          </p>

          <p>
            This week the question is narrower: does that demand continue at $65,000, or does it
            wait for a pullback? Every daily flow print is a real-time answer.
          </p>

          <h3>What ETF demand means for Bitcoin supply</h3>
          <p>
            The cleanest way to understand ETF flows is to compare them against what miners actually
            create — the supply the market must absorb:
          </p>

          <div className="strategy-box">
            <h3>The absorption math</h3>
            <p className="formula">
              ~$850M / week ÷ $65,000 ≈ ~13,000 BTC / week ≈ ~1,850 BTC / day
            </p>
            <p>
              Bitcoin miners currently produce about <strong>450 BTC per day</strong> (3.125 BTC per
              block). At current inflow levels, ETFs absorb roughly{" "}
              <strong>4× daily new issuance</strong>. After the 2028 halving, issuance falls to ~225
              BTC/day — meaning the same demand would absorb roughly <strong>8×</strong>.
            </p>
          </div>

          <p>
            Those are rough, flow-dependent estimates — but the direction is the point. The 2028
            halving is the first one fought with institutional demand already inside the market. The
            old &ldquo;halving is priced in&rdquo; debate assumes a retail-only buyer; it has not
            been stress-tested against four-figure daily absorption.
          </p>

          <h2>Is the $65,000 Level Important?</h2>
          <p>
            Yes — and not because of chart lore. $65,000 is the level where institutional demand has
            to prove it is real. Bitcoin has spent weeks coiling under it with implied volatility
            (DVOL) crushed near 35, historically low for this stage of a cycle. Low volatility
            before a level like this usually means a decision is approaching, not that nothing is
            happening.
          </p>

          <p>
            One honest warning alongside the bullish flows: derivatives leverage is at record
            extremes, with Binance&apos;s futures volume running roughly{" "}
            <strong>8× its spot volume</strong>. Flows can buy Bitcoin; leverage can also unwind it
            fast. The two forces are not the same.
          </p>

          <h2>Two Scenarios, One Rule</h2>

          <h3>Scenario A: inflation runs hot</h3>
          <p>
            A hot CPI print keeps the &ldquo;stagflation&rdquo; and Fed-hike fears alive, and
            Bitcoin pulls back from $65,000. What happens? Dip buyers — including ETFs — step in at
            lower levels, and the accumulation window stretches. The buy date does not move.
          </p>

          <h3>Scenario B: inflation cools</h3>
          <p>
            A cool CPI print validates the post-jobs-rate optimism, risk assets rally, and Bitcoin
            finally breaks $65,000. What happens? The market celebrates, volatility returns, and the
            buy date does not move.
          </p>

          <p>
            This is the entire BTC500 point in miniature. Five events, two plausible outcomes, and
            exactly one decision that was made months ago: buy on{" "}
            <Link to="/halving-dates" className="font-semibold text-primary underline">
              November 30, 2026
            </Link>
            , 500 days before the halving.
          </p>

          <h2>What This Means for the 2028 Halving</h2>
          <p>
            The 2028 halving, projected for around April 2028 at block height 1,050,000, will cut
            the block reward from 3.125 BTC to <strong>1.5625 BTC</strong>. If ETF demand keeps
            absorbing supply at current rates, the post-halving issuance squeeze is roughly twice as
            violent as it was in any prior cycle — on paper.
          </p>

          <p>
            That compression cuts both ways. It can accelerate the cycle — the classic
            &ldquo;front-running the halving&rdquo; behavior you see in ETF headlines today. It can
            also compress the cycle&apos;s drawdowns and top, because a market with more
            institutional money and less leverage discipline is a market that can move farther,
            faster, in both directions.
          </p>

          <p>
            History is not a prediction, but every completed cycle — 2012, 2016, 2020 — rewarded the
            investor who bought on a fixed date and held through the noise. The ETF era adds a new
            buyer, not a new rule. The{" "}
            <Link to="/" className="font-semibold text-primary underline">
              countdown
            </Link>{" "}
            still controls the story: 500 days before, buy. 500 days after, sell.
          </p>

          <h2>FAQ</h2>
          <div className="faq-list space-y-6">
            <div>
              <h3>What&apos;s happening in Bitcoin this week?</h3>
              <p>
                The week of August 10–16, 2026 features daily spot ETF flow reports, US CPI and PPI
                due mid-week, weekly jobless claims, and a Friday BTC options expiry with retail
                sales data. Bitcoin is trading near $65,000 with ETF demand absorbing roughly four
                times daily mining issuance.
              </p>
            </div>

            <div>
              <h3>Why are Bitcoin ETF flows important?</h3>
              <p>
                Spot ETFs are now Bitcoin&apos;s dominant marginal buyer. Last week they recorded
                roughly $850M–$1B in net inflows — the best week since April — which is about 4× the
                Bitcoin miners create per day at current prices.
              </p>
            </div>

            <div>
              <h3>Will Bitcoin ETFs break the halving cycle?</h3>
              <p>
                ETFs change the buyer mix, not the supply schedule. The 2028 halving still cuts new
                issuance in half. Institutional demand can compress or accelerate the cycle, but the
                500-day buy/sell rule has worked across every completed cycle so far.
              </p>
            </div>

            <div>
              <h3>Is the $65,000 level important?</h3>
              <p>
                Yes, in a practical sense. Bitcoin has been coiling under $65,000 with unusually low
                volatility (DVOL near 35). It is the level where sustained ETF demand has to prove
                itself, while record derivatives leverage (futures at ~8× spot volume on Binance)
                adds unwind risk.
              </p>
            </div>

            <div>
              <h3>When is the next Bitcoin halving and the official buy date?</h3>
              <p>
                The next halving is projected for around April 2028 at block height 1,050,000. The
                official BTC500 buy date is exactly 500 days before it:{" "}
                <strong>November 30, 2026</strong>. The sell date is 500 days after, around August
                26, 2029.
              </p>
            </div>

            <div>
              <h3>What is the BTC500 strategy?</h3>
              <p>
                Buy Bitcoin exactly 500 days before each halving, hold through the event, and sell
                exactly 500 days after. No indicators, no day trading — one fixed rule backed by
                historical cycle data and tracked publicly.
              </p>
            </div>
          </div>

          <h2>Bottom Line</h2>
          <p>
            Read the week the way a fixed-date investor should: the ETF flow reports, the CPI print,
            and the options expiry are all weather. The climate is the halving cycle, and the
            calendar already told you the most important date on it —{" "}
            <strong>November 30, 2026</strong>.
          </p>

          <p>
            Institutions are front-running the halving. That is exactly why a fixed-date rule beats
            vibes: it does not ask you to predict the CPI, chase the flows, or out-guess the
            leverage crowd. It asks you to be ready on one date, with conviction and a position size
            you can hold through noise.
          </p>

          <div className="strategy-box">
            <h3>See you in 112 days.</h3>
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
              . The date is fixed. The plan is simple.
            </p>
          </div>
        </div>
      </motion.article>
    </>
  );
}
