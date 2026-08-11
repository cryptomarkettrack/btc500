import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function StrongestHandsArticle({ title, date, readTime }: ArticleProps) {
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
            Bitcoin&apos;s strongest hands are getting stronger. On-chain data published Monday
            shows the number of elite wallets holding more than 10,000 BTC has climbed to{" "}
            <strong>90</strong> — a six-month high — building on an earlier wave of accumulation by
            mid-sized whales. And the trend didn&apos;t pause for any of this summer&apos;s scares.
          </p>

          <p>
            If you follow the headlines, this summer has been full of reasons to worry: a major
            hardware wallet exploit, a stalled regulatory bill, and the kind of low-volatility
            compression that makes short-term traders nervous. But the wallets holding the most
            Bitcoin don&apos;t trade on headlines. They&apos;ve been quietly accumulating through
            all of it.
          </p>

          {/* Hero image */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/strongest-hands/strongest-hands-hero.svg"
              alt="Bitcoin's Strongest Hands Are Back — 90 elite wallets holding over 10,000 BTC each hit a six-month high in August 2026, a combined 900,000+ BTC."
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
              Ninety wallets, each holding more than 10,000 BTC, now represent a combined holding of
              900,000+ coins — worth over $58 billion at current prices.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Key takeaway:</strong> The count of elite wallets holding 10,000+ BTC just hit
              a six-month high of 90. That&apos;s the most patient, least reactive cohort in Bitcoin
              — and they kept accumulating through the Coldcard exploit and the CLARITY Act delay.
              The signal is accumulation, not panic.
            </p>
          </div>

          <h2>What the data actually shows</h2>
          <p>
            The headline number is simple: 90 wallets, each containing more than 10,000 BTC. That is
            a six-month high, according to on-chain data reported by CoinDesk on August 11, 2026.
            These are the wallets on-chain analysts often call the &ldquo;strongest hands&rdquo; —
            the cohort that holds through volatility, sells last, and tends to accumulate
            aggressively during periods of market uncertainty.
          </p>

          <p>
            Do the math: 90 wallets times 10,000 BTC equals a combined floor of 900,000 BTC. At the
            current price around $65,000, that&apos;s north of <strong>$58 billion</strong> in value
            controlled by a tiny sliver of the network. These wallets represent far less than 0.1%
            of all Bitcoin addresses, yet they hold a disproportionate share of total supply.
          </p>

          <p>
            The data also confirmed what on-chain analysts had been tracking for weeks: the
            accumulation didn&apos;t start with the big wallets. Mid-sized whales — those in the
            1,000-to-10,000 BTC range — had already been building positions earlier in the summer.
            The large wallets appear to be following the same pattern, which is exactly how
            smart-money accumulation tends to ripple outward: mid-sized players move first, and the
            biggest wallets confirm the trend.
          </p>

          {/* Trend chart */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/strongest-hands/whale-accumulation-chart.svg"
              alt="Illustrative six-month trend chart showing elite Bitcoin wallet count (10,000+ BTC) rising to a six-month high of 90, with accumulation continuing through the Coldcard exploit and CLARITY Act delays."
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
              Illustrative directional trend based on reported data. The endpoint — 90 elite wallets
              (10,000+ BTC) — reflects the six-month high reported by CoinDesk on August 11, 2026.
            </figcaption>
          </figure>

          <h2>Accumulating through the noise</h2>
          <p>
            If you were reading crypto Twitter this summer, you might have thought the sky was
            falling. The Coldcard seed-generation vulnerability — a flaw that potentially exposed
            funds across an estimated 1.4 million wallets — dominated headlines for days. Shortly
            after, the CLARITY Act, the most important pending crypto regulation in the US, was
            punted past the August recess without a procedural vote, creating another round of
            &ldquo;the government doesn&apos;t get it&rdquo; anxiety.
          </p>

          <p>Neither event stopped the accumulation.</p>

          <p>
            That&apos;s the key insight. When mid-sized and large Bitcoin holders keep buying
            through a security scare and a regulatory delay, they&apos;re telling you something
            about their time horizon. They&apos;re not trading the next two weeks. They&apos;re
            positioning for the next two years.
          </p>

          <div className="data-point">
            <strong>Smart money ignores the weather:</strong> The Coldcard exploit was a real
            security event — but it affected hardware wallet firmware, not the Bitcoin protocol
            itself. The CLARITY Act delay was procedural, not a rejection. Neither changed the
            issuance schedule, the network fundamentals, or the halving timeline. The strongest
            hands know the difference.
          </div>

          <p>
            This is not unique to this cycle. In every prior halving cycle, the wallets that
            accumulated the most aggressively in the 12-to-18 months before the halving were the
            ones that captured the largest gains in the 12-to-18 months after it. The pattern is
            well documented: strong hands buy the uncertainty, weak hands sell the headlines, and
            the halving cuts new supply in half regardless.
          </p>

          <h2>What this says about the cycle</h2>
          <p>
            Bitcoin&apos;s next halving is projected for <strong>April 13, 2028</strong>, at block
            height 1,050,000. That event will cut the block reward from 3.125 BTC to 1.5625 BTC,
            halving the rate at which new coins enter circulation. It is the single most predictable
            supply shock in any major asset class.
          </p>

          <p>
            The BTC500 strategy is built around that event. The official buy date is{" "}
            <strong>November 30, 2026</strong> — exactly 500 days before the projected halving. From
            today, that&apos;s <strong>111 days away</strong>.
          </p>

          {/* Timeline image */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/strongest-hands/halving-cycle-timeline.svg"
              alt="BTC500 cycle map: whales accumulating now (August 2026), BTC500 buy date November 30 2026 (500 days before halving), halving April 13 2028 at block 1,050,000, and sell date August 26 2029 (500 days after halving)."
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
              The full BTC500 cycle: buy 500 days before the halving, sell 500 days after. No
              indicators, no timing — one fixed calendar rule.
            </figcaption>
          </figure>

          <p>
            What the whale accumulation tells us is that the smartest, most patient capital in the
            market is building positions now — 111 days before the official buy date. This is not
            unusual: whale accumulation tends to intensify in the 12-to-18 months leading into a
            halving. The BTC500 rule doesn&apos;t try to front-run or match whale timing. It picks
            one date, sticks to it, and ignores the noise in between.
          </p>

          <p>
            That&apos;s the real advantage of a fixed-date strategy. Whales have sophisticated
            on-chain analytics, dedicated research teams, and billions in capital to deploy on their
            preferred timeline. A rules-based investor has something just as powerful: a calendar, a
            plan, and the discipline not to deviate from it.
          </p>

          <h2>What it does NOT mean</h2>
          <p>
            It&apos;s tempting to read a whale accumulation headline and reach for the buy button.
            Don&apos;t. A few things worth keeping in mind:
          </p>

          <ul>
            <li>
              <strong>On-chain data lags.</strong> Wallet analytics show what happened, not what
              will happen. By the time a trend is reported in the media, the smartest money may
              already be rotating, hedging, or simply pausing.
            </li>
            <li>
              <strong>Whale accumulation is not a price prediction.</strong> Elite wallets
              accumulate because they have a long-term thesis on Bitcoin supply scarcity, not
              because they know what happens next quarter. Accumulation can continue for months
              before a price response, or it can coincide with a further drawdown.
            </li>
            <li>
              <strong>Whales can sell too.</strong> The same wallets that accumulate can distribute.
              On-chain data gives you a snapshot, not a guarantee. The reason the BTC500 rule works
              is that it doesn&apos;t depend on interpreting these signals correctly.
            </li>
            <li>
              <strong>It&apos;s one data point among many.</strong> ETF flows, corporate treasuries,
              miner behavior, and macro conditions all play a role. Whale accumulation is a useful
              signal — it is not the only signal.
            </li>
          </ul>

          <h2>How a rules-based investor should think about it</h2>
          <p>
            If you&apos;re following the BTC500 strategy, whale accumulation news should make you
            feel <em>more confident</em> in the approach — not more tempted to change it.
          </p>

          <p>
            The strongest hands in the market are accumulating ahead of the halving. That&apos;s the
            same window the BTC500 buy date targets. The difference is that whales pick their own
            entry points based on on-chain analysis, macro conditions, and proprietary research. You
            pick one date — <strong>November 30, 2026</strong> — and let the calendar do the work.
          </p>

          <div className="highlight-box">
            <p>
              <strong>The bottom line on whale accumulation:</strong> Ninety elite wallets now hold
              10,000+ BTC each, a six-month high. They accumulated through security scares and
              regulatory delays. That behavior tells you the smart money sees a multi-year
              opportunity. The BTC500 rule captures the same opportunity with one fixed date, no
              analysis required. 111 days to go.
            </p>
          </div>

          <div className="strategy-box">
            <h3>See you in 111 days.</h3>
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
              <h3>What are Bitcoin&apos;s &ldquo;strongest hands&rdquo;?</h3>
              <p>
                &ldquo;Strongest hands&rdquo; refers to the wallets and holders who accumulate
                Bitcoin and hold it through volatility, drawdowns, and bear markets. On-chain
                analysts typically track this cohort by wallet size, with wallets holding 1,000+ BTC
                or 10,000+ BTC representing the most patient, least reactive holders on the network.
              </p>
            </div>

            <div>
              <h3>How many elite wallets are there holding 10,000+ BTC?</h3>
              <p>
                As of August 11, 2026, on-chain data shows 90 wallets each holding more than 10,000
                BTC. That is a six-month high and represents a combined holding of over 900,000 BTC
                — more than 4% of Bitcoin&apos;s total circulating supply.
              </p>
            </div>

            <div>
              <h3>What does a six-month high of 90 elite wallets mean?</h3>
              <p>
                It means the most patient cohort in Bitcoin has been quietly building positions over
                the past six months. A rising count of 10,000+ BTC wallets is generally interpreted
                as a bullish on-chain signal: large holders are adding to their positions rather
                than distributing.
              </p>
            </div>

            <div>
              <h3>Does whale accumulation mean the price will go up?</h3>
              <p>
                Not necessarily in the short term. Whale accumulation is a bullish signal on a
                multi-month to multi-year timeframe, but on-chain data lags and can reflect activity
                that has already been priced in. The BTC500 strategy doesn&apos;t rely on
                interpreting whale behavior — it uses a fixed calendar rule that captures the full
                halving cycle.
              </p>
            </div>

            <div>
              <h3>How does this relate to the next halving and the BTC500 buy date?</h3>
              <p>
                The next Bitcoin halving is projected for April 13, 2028, at block height 1,050,000.
                The official BTC500 buy date is November 30, 2026 — exactly 500 days before the
                halving. Whale accumulation ahead of the halving is consistent with the cycle timing
                the BTC500 strategy is built around. From August 11, 2026, there are 111 days until
                the buy date.
              </p>
            </div>
          </div>

          <h2>Bottom Line</h2>
          <p>
            The strongest hands in Bitcoin just hit a six-month high. Ninety wallets — each holding
            more than 10,000 BTC — have been accumulating through a security scare, a regulatory
            delay, and the kind of market noise that usually sends retail to the exits.
          </p>

          <p>
            That tells you something important: the most patient capital in the market is
            positioning for the halving, not trading the next two weeks. The BTC500 strategy
            captures the same cycle thesis with one fixed date and zero interpretation.
          </p>

          <p>
            <strong>November 30, 2026</strong> is 111 days away. The whales are already in position.
            The calendar says it&apos;s almost time.
          </p>
        </div>
      </motion.article>
    </>
  );
}
