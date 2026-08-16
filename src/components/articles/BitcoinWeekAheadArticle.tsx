import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { formatUsd } from "@/lib/format";
import { computeCycle } from "@/lib/phase";
import { btcPriceQuery, halvingQuery } from "@/lib/queries";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function BitcoinWeekAheadArticle({ title, date, readTime }: ArticleProps) {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const priceRes = useQuery(btcPriceQuery);
  const now = useNow(60_000);
  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );
  const buyLabel = cycle.buyDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const livePrice = priceRes.data?.price ?? null;
  const cyclePhase =
    cycle.phase === "wait-buy"
      ? `Waiting to buy · ${cycle.daysUntilBuy} days to T-500`
      : cycle.phase === "wait-sell"
        ? `In the window · ${cycle.daysUntilSell} days to T+500`
        : "500-day window complete";

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
          <span>Published {date}</span>
          <span>·</span>
          <span>Updated August 17, 2026</span>
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
            Bitcoin enters the week of <strong>August 17–23, 2026</strong> near{" "}
            <strong>$63,100</strong> after last Wednesday&apos;s in-line CPI print failed to break
            the $63,000–$65,000 range. The week&apos;s actual market event is Wednesday&apos;s{" "}
            <strong>FOMC minutes</strong> from the 9–3 July hold — three regional presidents
            dissented for a hike. The official BTC500 buy date remains{" "}
            <strong>November 30, 2026</strong>.
          </p>

          <p>
            Most Monday articles chase every headline. This one does the opposite. The week has
            events worth knowing and one 500-day-cycle date that does not move with the tape: the
            official BTC500 T-500 buy date, currently <strong>{buyLabel}</strong>. Everything below
            is context for that date, not a reason to change it.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Publication:</strong> week of August 17–23, 2026 · last updated August 17,
              2026. Price and cycle figures below refresh with the live BTC500 feed. Weekly
              commentary stays dated so this page can be updated in place rather than forked.
            </p>
          </div>

          <h2>Where the 500-day cycle sits this week</h2>
          <p>
            This is a weekly market outlook with BTC500 cycle context — not a generic Bitcoin news
            desk. The{" "}
            <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
              Bitcoin 500-day cycle
            </Link>{" "}
            is the map; the tape this week is weather.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">BTC price</th>
                  <td className="py-3">
                    {livePrice != null ? formatUsd(livePrice) : "Live price loading…"} (spot, BTC500
                    feed)
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Cycle position</th>
                  <td className="py-3">{cyclePhase}</td>
                </tr>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">T-500 / buy date</th>
                  <td className="py-3">{buyLabel}</td>
                </tr>
                <tr>
                  <th className="py-3 pr-4 font-semibold">Halving / T+500</th>
                  <td className="py-3">
                    Next halving ~
                    {cycle.nextHalving.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}{" "}
                    · T+500{" "}
                    {cycle.sellDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>What BTC500 is watching this week</h2>
          <ul>
            <li>
              <strong>FOMC minutes (Wednesday, 2:00 p.m. ET)</strong> — how isolated the three July
              hike dissenters were, and whether new Chair Kevin Warsh&apos;s first meeting minutes
              sound like a pause or a lean toward tightness.
            </li>
            <li>
              <strong>Wyoming Blockchain Symposium (Mon–Thu, Jackson Hole)</strong> — SEC Chair
              Paul Atkins, Senators Cynthia Lummis and Tim Scott, and a 500-person institutional
              room one week before the Fed&apos;s own Jackson Hole symposium.
            </li>
            <li>
              <strong>Spot ETF flows</strong> — whether the August bid (~$650 million month-to-date
              after last week&apos;s ~$850 million–$1.1 billion) keeps absorbing issuance near
              $63,000.
            </li>
            <li>
              <strong>The T-500 clock</strong> — none of the above moves{" "}
              <Link to="/simulator" className="font-semibold text-primary underline">
                the 500-day rule
              </Link>
              . They only change how noisy the wait feels.
            </li>
          </ul>

          {/* Hero image */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/weekly-brief/weekly-brief-hero.svg"
              alt="Bitcoin this week: FOMC minutes, Wyoming Blockchain Symposium, Friday options expiry, and the official BTC500 buy date November 30, 2026"
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
              The week at a glance: FOMC minutes, Jackson Hole, and one rule — nothing changes the
              November 30, 2026 buy date.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Key takeaway:</strong> Last week&apos;s in-line CPI removed a tail risk and
              still could not produce a rally. That is the current regime: ETF demand is the
              structural bid, leverage is the unwind risk, and the tape is waiting for a story.
              Wednesday&apos;s minutes are that story.{" "}
              <a href="/articles/clarity-act" className="font-semibold text-primary underline">
                CLARITY Act
              </a>{" "}
              cloture is now officially a September 15 event — the same week as the next FOMC. And
              Atkins speaking in Jackson Hole this week is a preview, not a vote.
            </p>
          </div>

          <h2>Bitcoin This Week at a Glance</h2>
          <p>
            Here is everything scheduled for the week of August 17–23, 2026, ranked by how much it
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
                    Wed · Aug 19 · 2:00 p.m. ET
                  </td>
                  <td className="py-4 pr-4 align-top">
                    FOMC minutes (July 28–29 meeting)
                  </td>
                  <td className="py-4 align-top">
                    The week&apos;s highest-variance print. The committee held at 3.50%–3.75% on a
                    9–3 vote; Hammack, Kashkari, and Logan dissented for a 25 bp hike — the first
                    three-way, same-direction dissent since 2016.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">
                    Mon–Thu · Aug 17–20
                  </td>
                  <td className="py-4 pr-4 align-top">
                    Wyoming Blockchain Symposium (SALT + Kraken, Jackson Hole)
                  </td>
                  <td className="py-4 align-top">
                    Invitation-only, ~500 people. Atkins, Lummis, Scott, Emmer, Novogratz. Headline
                    catalyst for the regulation trade, not a CPI-style price print. The Fed&apos;s
                    own Jackson Hole symposium follows Aug 27–29.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">
                    Mon–Fri · daily
                  </td>
                  <td className="py-4 pr-4 align-top">
                    Spot ETF flow reports (IBIT, FBTC, and peers)
                  </td>
                  <td className="py-4 align-top">
                    Still the dominant structural buyer. August inflows have already topped ~$650
                    million after last week&apos;s ~$850 million–$1.1 billion — the best week since
                    April.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Thursday</td>
                  <td className="py-4 pr-4 align-top">Weekly US jobless claims</td>
                  <td className="py-4 align-top">
                    First labor print the July minutes cannot already contain. July payrolls fell
                    23,000 against a forecast gain of ~83,000.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Friday</td>
                  <td className="py-4 pr-4 align-top">
                    Flash PMIs + weekly BTC/ETH options expiry (08:00 UTC)
                  </td>
                  <td className="py-4 align-top">
                    First look at August business activity, two days after the minutes. Weekly
                    Deribit expiry can pin or squeeze spot in a thin Friday book.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Mon / Thu</td>
                  <td className="py-4 pr-4 align-top">
                    Token unlocks (CRO ~$64M Mon; ZRO ~$25M Thu)
                  </td>
                  <td className="py-4 align-top">
                    Not a Bitcoin supply event. Single-name altcoin weather. ZRO&apos;s ~3.3% of
                    max supply to partners and contributors is the one with a history of volatility.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">All week</td>
                  <td className="py-4 pr-4 align-top">CLARITY Act — Senate in recess</td>
                  <td className="py-4 align-top">
                    No vote this week. Majority Leader Thune filed cloture for{" "}
                    <strong>September 15</strong> — the same week as the next FOMC. The{" "}
                    <a
                      href="/articles/sec-cancels-regulation-crypto"
                      className="font-semibold text-primary underline"
                    >
                      Regulation Crypto vote
                    </a>{" "}
                    remains undated.
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Nov 30, 2026</td>
                  <td className="py-4 pr-4 align-top">Official BTC500 buy date</td>
                  <td className="py-4 align-top">
                    {cycle.daysUntilBuy} days away. The one date none of the above can change.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="data-point">
            <strong>Note on dates:</strong> US macro releases (FOMC minutes, jobless claims, PMIs)
            follow the official calendar and can shift. Token-unlock dollar values move with price.
            Treat these as expected dates and verify official times before acting on them.
          </div>

          <h2>What Happened Last Week in Bitcoin</h2>
          <p>
            Last week was supposed to be the CPI week. July inflation came in as expected, stocks
            liked it more than crypto did, and Bitcoin slipped toward <strong>$63,500</strong>{" "}
            before settling near <strong>$63,100</strong>. The print removed a tail risk. It did
            not give anyone a reason to chase. That is what a range looks like when the buyer is
            institutional and the catalyst is &ldquo;good enough.&rdquo;
          </p>

          <p>
            The more useful story was demand, not inflation. Digital-asset products booked roughly{" "}
            <strong>$1.1 billion</strong> in combined inflows, with Bitcoin products around{" "}
            <strong>$850 million</strong> — a turnaround from the weak stretch in July. August
            Bitcoin ETF inflows have already run past <strong>$650 million</strong>.{" "}
            <a
              href="/articles/goldman-vs-blackrock"
              className="font-semibold text-primary underline"
            >
              Holding-style products
            </a>{" "}
            and spot funds are still the marginal buyer. The{" "}
            <a href="/articles/bip-110-rejection" className="font-semibold text-primary underline">
              BIP-110 fork
            </a>{" "}
            died over the prior weekend. CLARITY slipped to a September 15 cloture vote. Strategy
            sold 1,690 BTC (~$109 million) to fund preferred-stock buybacks — the treasury still
            holds about 840,000 BTC. One sale is not a trend. It is a reminder that the largest
            corporate buyer is no longer a one-way bid every week.
          </p>

          <h2>Why Wednesday&apos;s Minutes Matter More Than Last Week&apos;s CPI</h2>
          <p>
            The July 28–29 FOMC held the funds rate at <strong>3.50%–3.75%</strong>. The vote was{" "}
            <strong>9–3</strong>. Beth Hammack, Neel Kashkari, and Lorie Logan wanted a
            quarter-point hike — the first time since September 2016 that three policymakers
            aligned on one directional dissent. The dot plot moved with them: the median year-end
            rate rose to <strong>3.8%</strong>, which still implies one 25-basis-point hike is in
            the staff&apos;s base case.
          </p>

          <p>
            New Chair Kevin Warsh was presiding over his first meeting. The post-meeting statement
            was a hold. The minutes will show how close the committee came to something else —
            how many other members &ldquo;could have gone either way,&rdquo; and whether the
            labor-market deterioration that showed up <em>after</em> the meeting (July payrolls{" "}
            <strong>−23,000</strong>) is even in the room.
          </p>

          <p>
            A hawkish read is a dollar-up, yields-up, Bitcoin-down setup. A dovish read — dissent
            framed as isolated, more weight on jobs — is the opposite. Minutes rarely invent a new
            policy path. They often reprice the odds by a few percentage points. In a
            $63,000–$65,000 range, that is enough to move the tape and not enough to move{" "}
            {buyLabel}.
          </p>

          <h3>Jackson Hole is the sequel, not this week&apos;s close</h3>
          <p>
            The Kansas City Fed&apos;s Jackson Hole Economic Symposium runs{" "}
            <strong>August 27–29</strong>. The 2026 theme is{" "}
            <em>Financial Innovation: Implications for Payments and Policy</em> — a title written
            for digital assets whether the speeches deliver or not. This week&apos;s Wyoming
            Blockchain Symposium (August 17–20, Four Seasons, Teton Village) is the crypto
            industry&apos;s version of the same valley: Atkins on the record, Lummis and Scott in
            the room, CLARITY as the subtext. Treat Monday–Thursday as headline risk. Treat next
            week as the speech.
          </p>

          <h2>Why Everyone Is Still Watching the ETF Flow Number</h2>
          <p>
            Last week, spot Bitcoin products recorded an estimated{" "}
            <strong>$850 million to $1.1 billion in net inflows</strong> — the strongest weekly
            total since mid-April. August is already more than <strong>$650 million</strong> to the
            good. That is the same structural bid described after the{" "}
            <a href="/articles/strongest-hands" className="font-semibold text-primary underline">
              strongest-hands
            </a>{" "}
            print: large holders accumulating while the tape coils.
          </p>

          <p>
            This week the question is narrower: does that demand continue at $63,000 after a
            nothing-burger CPI, or does it wait for the minutes? Every daily flow print is a
            real-time answer.
          </p>

          <h3>What ETF demand means for Bitcoin supply</h3>
          <p>
            The cleanest way to understand ETF flows is to compare them against what miners
            actually create — the supply the market must absorb:
          </p>

          <div className="strategy-box">
            <h3>The absorption math</h3>
            <p className="formula">
              ~$850M / week ÷ $63,100 ≈ ~13,500 BTC / week ≈ ~1,920 BTC / day
            </p>
            <p>
              Bitcoin miners currently produce about <strong>450 BTC per day</strong> (3.125 BTC
              per block). At recent inflow levels, ETFs absorb roughly{" "}
              <strong>4× daily new issuance</strong>. After the 2028 halving, issuance falls to
              ~225 BTC/day — meaning the same demand would absorb roughly <strong>8×</strong>.
            </p>
          </div>

          <p>
            Those are rough, flow-dependent estimates — but the direction is the point. The 2028
            halving is the first one fought with institutional demand already inside the market.
            The old &ldquo;halving is priced in&rdquo; debate assumes a retail-only buyer; it has
            not been stress-tested against four-figure daily absorption.
          </p>

          <h2>Is the $63,000–$65,000 Range Important?</h2>
          <p>
            Yes — and not because of chart lore. $65,000 was the level where institutional demand
            had to prove it was real. It could not hold the break. $63,000 is now the level where
            that same bid has to prove it is still there after a quiet CPI. Bitcoin has spent weeks
            coiling in this band. Low realized movement before a minutes print usually means a
            decision is approaching, not that nothing is happening.
          </p>

          <p>
            One honest warning alongside the bullish flows: derivatives leverage remains elevated,
            and Friday&apos;s weekly options expiry sits two days after the minutes. Flows can buy
            Bitcoin; leverage can also unwind it fast. The two forces are not the same. Oil near
            $82 on unresolved Hormuz headlines is the other risk-asset override — if that tape
            returns, ignore the crypto calendar for a session.
          </p>

          <h2>Two Scenarios, One Rule</h2>

          <h3>Scenario A: minutes sound hawkish</h3>
          <p>
            The write-up shows broader support for a hike, Warsh sounds tighter than the
            statement, and Bitcoin pulls back from $63,000. What happens? Dip buyers — including
            ETFs — step in at lower levels, and the accumulation window stretches. The buy date
            does not move.
          </p>

          <h3>Scenario B: dissent looks isolated</h3>
          <p>
            The minutes frame the three dissenters as a minority, claims stay soft, flash PMIs
            cool, and Bitcoin retests last week&apos;s $65,400 high. What happens? The market
            celebrates, volatility returns, and the buy date does not move.
          </p>

          <p>
            This is the entire BTC500 point in miniature. A packed calendar, two plausible
            outcomes, and exactly one decision that was made months ago: buy on{" "}
            <Link to="/halving-dates" className="font-semibold text-primary underline">
              November 30, 2026
            </Link>
            , 500 days before the halving.
          </p>

          <h2>What This Means for the 2028 Halving</h2>
          <p>
            The 2028 halving, projected for around April 2028 at block height 1,050,000, will cut
            the block reward from 3.125 BTC to <strong>1.5625 BTC</strong>. If ETF demand keeps
            absorbing supply at current rates, the post-halving issuance squeeze is roughly twice
            as violent as it was in any prior cycle — on paper.
          </p>

          <p>
            That compression cuts both ways. It can accelerate the cycle — the classic
            &ldquo;front-running the halving&rdquo; behavior you see in ETF headlines today. It
            can also compress the cycle&apos;s drawdowns and top, because a market with more
            institutional money and less leverage discipline is a market that can move farther,
            faster, in both directions.
          </p>

          <p>
            History is not a prediction, but every completed cycle — 2012, 2016, 2020 — rewarded
            the investor who bought on a fixed date and held through the noise. Past performance
            does not guarantee future results. The ETF era adds a new buyer, not a new rule. The{" "}
            <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
              500-day cycle
            </Link>{" "}
            still controls the story: 500 days before, buy. 500 days after, sell.
          </p>

          <h2>FAQ</h2>
          <div className="faq-list space-y-6">
            <div>
              <h3>What&apos;s happening in Bitcoin this week?</h3>
              <p>
                The week of August 17–23, 2026 is built around Wednesday&apos;s FOMC minutes, the
                Wyoming Blockchain Symposium in Jackson Hole, daily spot ETF flow reports, Thursday
                jobless claims, and Friday flash PMIs plus a weekly BTC options expiry. Bitcoin is
                trading near $63,100 after last week&apos;s in-line CPI failed to break the range.
              </p>
            </div>

            <div>
              <h3>Why do the FOMC minutes matter for Bitcoin?</h3>
              <p>
                The July meeting held rates at 3.50%–3.75% on a 9–3 vote, with three regional
                presidents dissenting for a hike. The minutes show whether that hawkish minority
                was isolated or close to swaying the committee — the main near-term input for
                yields, the dollar, and risk assets including Bitcoin.
              </p>
            </div>

            <div>
              <h3>Why are Bitcoin ETF flows important?</h3>
              <p>
                Spot ETFs are now Bitcoin&apos;s dominant marginal buyer. Last week they recorded
                roughly $850 million–$1.1 billion in net inflows — the best week since April —
                which is about 4× the Bitcoin miners create per day at current prices.
              </p>
            </div>

            <div>
              <h3>Will Bitcoin ETFs break the halving cycle?</h3>
              <p>
                ETFs change the buyer mix, not the supply schedule. The 2028 halving still cuts
                new issuance in half. Institutional demand can compress or accelerate the cycle,
                but the 500-day buy/sell rule has worked across every completed cycle so far. Past
                performance does not guarantee future results.
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
                exactly 500 days after. The{" "}
                <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
                  500-day cycle explainer
                </Link>{" "}
                has the dates and prices. Nothing here is financial advice. BTC500 is educational
                software, not an investment advisor.
              </p>
            </div>
          </div>

          <h2>Bottom Line</h2>
          <p>
            Read the week the way a fixed-date investor should: the FOMC minutes, Atkins in
            Jackson Hole, the ETF prints, and Friday&apos;s expiry are all weather. The climate is
            the halving cycle, and the calendar already told you the most important date on it —{" "}
            <strong>November 30, 2026</strong>.
          </p>

          <p>
            Institutions are front-running the halving. That is exactly why a fixed-date rule
            beats vibes: it does not ask you to predict the minutes, chase the flows, or
            out-guess the leverage crowd. It asks you to be ready on one date, with conviction and
            a position size you can hold through noise.
          </p>

          <div className="strategy-box">
            <h3>See you in {cycle.daysUntilBuy} days.</h3>
            <p className="formula">Nov 30, 2026 — the official BTC500 buy date</p>
            <p>
              Check the live{" "}
              <Link to="/" className="font-semibold text-primary underline">
                cycle countdown
              </Link>
              , read the{" "}
              <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
                500-day cycle
              </Link>
              , run the{" "}
              <Link to="/simulator" className="font-semibold text-primary underline">
                simulator
              </Link>
              , and walk the{" "}
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
