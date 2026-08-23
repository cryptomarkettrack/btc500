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
          <span>Updated August 24, 2026</span>
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
            Bitcoin enters the week of <strong>August 24–31, 2026</strong> near{" "}
            <strong>$77,000</strong>, up roughly 20% on the week after the{" "}
            <strong>19–20 August breakout</strong> ended the $54,000–$64,000 summer range. The
            week&apos;s actual market event sits later in it: the Kansas City Fed&apos;s{" "}
            <strong>Jackson Hole Economic Symposium</strong> (Aug 27–29), where Chair Kevin
            Warsh speaks and July <strong>Core PCE</strong> prints. The official BTC500 buy date
            remains <strong>November 30, 2026</strong>.
          </p>

          <p>
            Most Monday articles chase every headline. This one does the opposite. The week has
            events worth knowing and one 500-day-cycle date that does not move with the tape: the
            official BTC500 T-500 buy date, currently <strong>{buyLabel}</strong>. Everything below
            is context for that date, not a reason to change it.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Publication:</strong> week of August 24–31, 2026 · last updated August 24,
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
              <strong>Jackson Hole Economic Symposium (Thu–Sat, Aug 27–29)</strong> — new Chair
              Kevin Warsh&apos;s first major public address since the July hold, staged on the Fed&apos;s
              own turf. The 2026 theme, <em>Financial Innovation: Implications for Payments and
              Policy</em>, is written for digital assets whether the speeches deliver or not.
            </li>
            <li>
              <strong>July Core PCE (Friday)</strong> — the Fed&apos;s preferred inflation gauge,
              two weeks after the minutes. A hot print would put the &ldquo;hold&rdquo; squarely back
              on the table heading into the September 15–16 FOMC.
            </li>
            <li>
              <strong>Spot ETF flows</strong> — whether the August bid (~$1.1 billion month-to-date
              after last week&apos;s ~$850 million) keeps absorbing supply near $77,000 after a
              20% weekly move.
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
              alt="Bitcoin this week: Jackson Hole Economic Symposium, July Core PCE, Friday options expiry, and the official BTC500 buy date November 30, 2026"
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
              The week at a glance: Jackson Hole Economic Symposium, July Core PCE, and one rule —
              nothing changes the November 30, 2026 buy date.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Key takeaway:</strong> Last week had a quiet part and a loud part. Quiet: the July
              FOMC minutes confirmed the 9–3 hold and framed the three dissenters as an isolated
              minority. Loud: the Treasury doubled long-end buybacks, a crowded short book
              unwound, and a two-day candle carried Bitcoin out of the $54k–$64k box, through
              $71,500, to the door of $78,000. That makes this a soft bull, not yet a confirmed
              one — and none of it moves{" "}
              <a href="/articles/clarity-act" className="font-semibold text-primary underline">
                CLARITY Act
              </a>{" "}
              cloture (September 15, same week as the next FOMC) or the buy date.
            </p>
          </div>

          <h2>Bitcoin This Week at a Glance</h2>
          <p>
            Here is everything scheduled for the week of August 24–31, 2026, ranked by how much it
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
                    Thu–Sat · Aug 27–29
                  </td>
                  <td className="py-4 pr-4 align-top">
                    Kansas City Fed&apos;s Jackson Hole Economic Symposium
                  </td>
                  <td className="py-4 align-top">
                    The week&apos;s marquee event — Chair Kevin Warsh&apos;s first big public speech, on
                    the Fed&apos;s own stage. The 2026 theme, <em>Financial Innovation: Implications
                    for Payments and Policy</em>, is built for the digital-asset question. Headline
                    risk for the regulation trade; not a price print.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">
                    Fri · Aug 28
                  </td>
                  <td className="py-4 pr-4 align-top">
                    July Core PCE inflation
                  </td>
                  <td className="py-4 align-top">
                    The Fed&apos;s preferred gauge, two weeks after the minutes. A hot read is the
                    fastest way to reignite the September 15–16 FOMC hike debate and pressure
                    yields — and Bitcoin&apos;s risk-asset bid with them.
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
                    Still the dominant structural buyer. August inflows have climbed past ~$1.1
                    billion after last week&apos;s ~$850 million — whether they keep absorbing
                    supply near $77,000 is this week&apos;s live question.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Thursday · Aug 27</td>
                  <td className="py-4 pr-4 align-top">Weekly US jobless claims</td>
                  <td className="py-4 align-top">
                    First labor print of the week, hours before Warsh takes the Jackson Hole stage.
                    July payrolls fell 23,000 against a forecast gain of ~83,000.
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-4 pr-4 align-top font-semibold text-primary">Friday · Aug 28</td>
                  <td className="py-4 pr-4 align-top">
                    Flash PMIs + weekly BTC/ETH options expiry (08:00 UTC)
                  </td>
                  <td className="py-4 align-top">
                    First look at September business activity, alongside PCE. Weekly Deribit expiry
                    can pin or squeeze spot in a thin Friday book.
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
            Last week was the minutes week on the calendar and a breakout week on the tape. The
            minutes were the quiet part: released Wednesday, they confirmed the July 28–29 FOMC
            hold at <strong>3.50%–3.75%</strong> on a <strong>9–3</strong> vote and framed
            Hammack, Kashkari, and Logan as an isolated minority. The loud part hit the same
            session. The U.S. Treasury doubled its maximum long-end liquidity-support buybacks
            from <strong>$2 billion to at least $4 billion</strong> per operation, the 30-year
            yield backed off its 2007-era high near <strong>5.33%</strong>, and a crowded short
            book started force-closing once <strong>$66,000</strong> broke.
          </p>

          <p>
            The result was the strongest two-day candle since April: roughly{" "}
            <strong>$1.1–$1.4 billion</strong> of shorts liquidated as Bitcoin tagged{" "}
            <strong>~$69,700</strong> on 19 August, more than <strong>$3 billion</strong> across
            crypto as it neared $72,000, and a <strong>$73,033</strong> close on 20 August. Spot
            ETFs added roughly <strong>$850 million</strong> on the week, taking August past{" "}
            <strong>~$1.1 billion</strong> month-to-date — institutional demand did not fade the
            squeeze, it joined it. The summer range is gone; spot starts this week near{" "}
            <strong>$77,000</strong>, with the first confirmation rung at $71,500 already traded
            through.
          </p>

          <p>
            Off the tape: the Wyoming Blockchain Symposium came and went without a rulemaking
            roadmap — Atkins talked, no vote landed, and{" "}
            <a
              href="/articles/sec-cancels-regulation-crypto"
              className="font-semibold text-primary underline"
            >
              Regulation Crypto
            </a>{" "}
            remains undated with CLARITY cloture still September 15. The{" "}
            <a
              href="/articles/goldman-vs-blackrock"
              className="font-semibold text-primary underline"
            >
              Goldman vs BlackRock
            </a>{" "}
            income-ETF race stayed in the headlines, and Strategy held a flat ~840,000 BTC
            treasury after last month&apos;s one-off sale.
          </p>

          <h2>The Minutes Are Out — Jackson Hole Carries the Week</h2>
          <p>
            Last week&apos;s minutes confirmed the July 28–29 FOMC held the funds rate at{" "}
            <strong>3.50%–3.75%</strong> on a <strong>9–3</strong> vote. Beth Hammack, Neel
            Kashkari, and Lorie Logan pressed for a quarter-point hike — the first three-way,
            same-direction dissent since September 2016 — but the write-up framed them as an
            isolated minority, and the median year-end dot stayed at <strong>3.8%</strong>. In
            other words: the Fed added no fuel either way. The Treasury buyback expansion and the
            short squeeze did the moving, and Bitcoin finished the week above every summer
            resistance.
          </p>

          <p>
            That clears the board for this week. The September 15–16 FOMC is now the real decision
            point, and two inputs land before it: Warsh&apos;s Jackson Hole speech and July Core
            PCE. New Chair Kevin Warsh has telegraphed comfort with the hold. The question is
            whether he uses the Fed&apos;s marquee stage to walk it back or to lock it in — and
            whether Friday&apos;s inflation print gives him room to do either.
          </p>

          <h3>Warsh speaks first at Jackson Hole — the crypto-adjacent theme helps</h3>
          <p>
            The Kansas City Fed&apos;s Jackson Hole Economic Symposium runs{" "}
            <strong>August 27–29</strong>. The 2026 theme is{" "}
            <em>Financial Innovation: Implications for Payments and Policy</em> — a title written
            for digital assets whether the speeches deliver or not. Warsh&apos;s set-piece is the
            week&apos;s highest-variance event: he has described stablecoins as &ldquo;dollar
            digitization,&rdquo; and any on-the-record enthusiasm from the Fed&apos;s chair would
            be the biggest pro-crypto headline of the year. Expect heavyweight coverage but treat
            Thursday–Saturday as headline risk, not a price print.
          </p>

          <h2>Why Everyone Is Still Watching the ETF Flow Number</h2>
          <p>
            Last week, spot Bitcoin products recorded an estimated{" "}
            <strong>$850 million in net inflows</strong>, taking August to roughly{" "}
            <strong>$1.1 billion</strong> month-to-date — the strongest stretch since April.
            That is the same structural bid described after the{" "}
            <a href="/articles/strongest-hands" className="font-semibold text-primary underline">
              strongest-hands
            </a>{" "}
            print: large holders accumulating while the tape coils.
          </p>

          <p>
            This week the question is narrower: does that demand continue at $77,000 after a
            20% weekly move, or does profit-taking pause the bid while everyone waits for
            Warsh&apos;s Jackson Hole speech? Every daily flow print is a real-time answer.
          </p>

          <h3>What ETF demand means for Bitcoin supply</h3>
          <p>
            The cleanest way to understand ETF flows is to compare them against what miners
            actually create — the supply the market must absorb:
          </p>

          <div className="strategy-box">
            <h3>The absorption math</h3>
            <p className="formula">
              ~$850M / week ÷ $77,000 ≈ ~11,000 BTC / week ≈ ~1,580 BTC / day
            </p>
            <p>
              Bitcoin miners currently produce about <strong>450 BTC per day</strong> (3.125 BTC
              per block). At recent inflow levels, ETFs absorb roughly{" "}
              <strong>3.5× daily new issuance</strong>. After the 2028 halving, issuance falls to
              ~225 BTC/day — meaning the same demand would absorb roughly <strong>7×</strong>.
            </p>
          </div>

          <p>
            Those are rough, flow-dependent estimates — but the direction is the point. The 2028
            halving is the first one fought with institutional demand already inside the market.
            The old &ldquo;halving is priced in&rdquo; debate assumes a retail-only buyer; it has
            not been stress-tested against four-figure daily absorption.
          </p>

          <h2>The Range Is Gone — Where Are the Levels Now?</h2>
          <p>
            The $63,000–$65,000 conversation is over; the tape settled it on 19–20 August. The
            structure that matters now comes from the{" "}
            <Link
              to="/articles/is-the-bottom-in"
              className="font-semibold text-primary underline"
            >
              bottom-call framework
            </Link>
            : the $54,000–$64,000 box held the June closing low of <strong>$58,566</strong>, the
            two-day candle walked through every summer resistance, and{" "}
            <strong>$71,500</strong> — the first confirmation rung — has already traded through.
            Spot sits just under <strong>$78,000</strong>. Above it,{" "}
            <strong>$82,000</strong> completes the bull confirmation. Below, $71,500 flips from
            resistance to support, with the short-term holder cost basis (~$68,500) and
            Glassnode&apos;s True Market Mean (~$75,800) marking the zone underneath.
          </p>

          <p>
            One honest warning alongside the bullish structure: derivatives leverage funded part
            of this move, Friday&apos;s weekly options expiry and the Core PCE print land on the
            same day Jackson Hole wraps, and a rejection at $78,000 without a weekly hold above
            $71,500 would be a failed flip — not a new bear, but not a green light either. Oil
            near $82 on unresolved Hormuz headlines remains the other risk-asset override — if
            that tape returns, ignore the crypto calendar for a session.
          </p>

          <h2>Two Scenarios, One Rule</h2>

          <h3>Scenario A: Warsh sounds hawkish — or PCE runs hot</h3>
          <p>
            The chair uses Jackson Hole to keep the September hike on the table, or Friday&apos;s
            Core PCE prints above the consensus ~0.2% m/m. Yields and the dollar jump, Bitcoin
            rejects at $78,000, and leveraged longs give back part of the squeeze. What happens?
            Dip buyers — including ETFs — step in at lower levels, and the accumulation window
            stretches. The buy date does not move.
          </p>

          <h3>Scenario B: Warsh locks the hold in, PCE cools</h3>
          <p>
            Jackson Hole reads as &ldquo;patience,&rdquo; Core PCE matches or beats soft
            expectations, and $78,000 flips — putting $82,000 and full bull confirmation in view.
            What happens? Momentum returns, volatility expands, and the buy date still does not
            move.
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
                The week of August 24–31, 2026 is built around the Kansas City Fed&apos;s Jackson
                Hole Economic Symposium (August 27–29), July Core PCE on Friday, daily spot ETF
                flow reports, Thursday jobless claims, and a Friday weekly BTC options expiry.
                Bitcoin enters near $77,000 after the 19–20 August breakout ended the
                $54,000–$64,000 summer range, with $78,000 the next confirmation level.
              </p>
            </div>

            <div>
              <h3>Why did the FOMC minutes matter for Bitcoin?</h3>
              <p>
                The July meeting held rates at 3.50%–3.75% on a 9–3 vote, with three policymakers
                dissenting for a hike. The minutes framed that hawkish minority as isolated and
                the median year-end dot at 3.8%, so the Fed itself added no fuel — the same-week
                rally came from the U.S. Treasury doubling long-end buybacks and a crowded short
                squeeze. The next inputs are Warsh&apos;s
                Jackson Hole speech and the July Core PCE print ahead of the September 15–16 FOMC.
              </p>
            </div>

            <div>
              <h3>Why are Bitcoin ETF flows important?</h3>
              <p>
                Spot ETFs are now Bitcoin&apos;s dominant marginal buyer. Last week they recorded
                roughly $850 million in net inflows, taking August to about $1.1 billion — which
                is roughly 3.5× the Bitcoin miners create per day at current prices.
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
            Read the week the way a fixed-date investor should: Warsh at Jackson Hole, Friday&apos;s
            Core PCE print, the daily ETF flows, and the expiry are all weather. The climate is
            the halving cycle, and the calendar already told you the most important date on it —{" "}
            <strong>November 30, 2026</strong>.
          </p>

          <p>
            Institutions are front-running the halving. That is exactly why a fixed-date rule
            beats vibes: it does not ask you to predict the speeches, chase the flows, or
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
