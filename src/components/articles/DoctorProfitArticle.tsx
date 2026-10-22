import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

const posts = [
  {
    when: "1 Oct",
    post: "Opens a swing short at $86,200, with adds between $86,500 and $89,500. First target $79,000; deepest case $69,000–$71,000.",
    takeaway: "A defined bearish trade inside a bull market — not a call for a new bear market.",
  },
  {
    when: "7 Oct",
    post: "Explains the ladder: several orders, 2x leverage, an average near $87,900 if all fill. Says altcoin volume is roughly 4x Bitcoin’s and he is out of ONDO and HBAR.",
    takeaway: "Leverage and position sizing are disclosed, and risk is cut elsewhere in the book.",
  },
  {
    when: "12 Oct",
    post: "Closes the short near $80,600, buys spot, and flips bullish. Target $94,000. Path: reclaim $82,000, chop between $82,000 and $88,000, then break out.",
    takeaway: "The flip is pre-announced with a level, not just a change of mood.",
  },
  {
    when: "15 Oct",
    post: "Bitcoin retests the daily MA50. He expects the average to hold and price to keep moving higher.",
    takeaway: "Trend-following logic: the moving average is the line in the sand.",
  },
  {
    when: "18 Oct",
    post: "The Big Sunday Report: the bearish RSI divergence he flagged at $87,000 played out, the correction is “completed,” and he is long at $81,000 with 4x leverage.",
    takeaway: "The core thesis: the $86,000–$88,000 zone he shorted is supposed to become support.",
  },
  {
    when: "20 Oct",
    post: "A non-market post arguing that Europe should adopt Palantir-style surveillance integrated with digital IDs and wallets.",
    takeaway: "Not every post is analysis. Judge the feed, not only the calls.",
  },
  {
    when: "21 Oct",
    post: "“Trust the support. Ignore the Black Monday nonsense.”",
    takeaway: "Reaffirms the $81,000–$82,000 floor after a scare.",
  },
  {
    when: "21 Oct",
    post: "Warns that Monero’s open interest is at a record, meaning an unusually large pile of leveraged positions is sitting in perpetual futures.",
    takeaway: "A leverage warning that applies to crypto broadly, not just XMR.",
  },
  {
    when: "21 Oct",
    post: "Says a quick pump to $86,000 is possible within hours or days, followed by a stronger move to $94,000.",
    takeaway: "A momentum call layered on top of the swing thesis.",
  },
  {
    when: "Oct 2025",
    post: "Says he sold every coin near the $124,000 top, shorted the decline, and covered near $60,000.",
    takeaway: "The origin story behind the current confidence. It is not independently audited.",
  },
];

const faqs = [
  {
    q: "What did Doctor Profit predict for Bitcoin in October 2026?",
    a: "He first built a short at $86,200 with a $79,000 target, then closed it near $80,600 and flipped long at $81,000. His public target after the flip is $94,000, with $82,000 as the first confirmation level and a $82,000–$88,000 range in between.",
  },
  {
    q: "Did Doctor Profit call the 2025 Bitcoin top?",
    a: "He publicly says he sold his coins near the $124,000 top and shorted the move toward $60,000. The posts are public, but exact fills, position size, and account performance are not independently auditable from the free feed.",
  },
  {
    q: "What is Doctor Profit’s current Bitcoin target?",
    a: "As of 21 October 2026 his stated target is $94,000. The path he describes is a reclaim of $82,000, sideways trading between $82,000 and $88,000, and then a breakout. A quick squeeze to $86,000 may come first.",
  },
  {
    q: "What would invalidate the bullish call?",
    a: "A failure to reclaim $82,000, a daily close back below $81,000, and especially a break of $79,000. He has described $79,000 as the level that would force a reassessment of the whole setup.",
  },
  {
    q: "Is Doctor Profit’s analysis financial advice?",
    a: "No. His bio describes the content as educational only and explicitly says it is not financial advice. BTC500 is not affiliated with Doctor Profit and does not receive compensation from him.",
  },
  {
    q: "How does this affect the BTC500 buy date?",
    a: "It does not. The BTC500 rule buys exactly 500 days before each halving and sells 500 days after. The next buy window opens in late November 2026; the exact UTC date is maintained on the 500-day cycle page. A trader’s target does not move the calendar.",
  },
];

export function DoctorProfitArticle({ title, date, readTime }: ArticleProps) {
  return (
    <>
      <motion.header
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Article</span>
          <span>·</span>
          <Clock className="h-4 w-4" />
          <span>{readTime}</span>
          <span>·</span>
          <span>Published {date}</span>
          <span>·</span>
          <span>Updated October 21, 2026</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      </motion.header>

      <motion.article
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p className="lead">
            Doctor Profit spent the first week of October building a Bitcoin short at{" "}
            <strong>$86,200</strong> and telling roughly 522,000 followers that his target was{" "}
            <strong>$79,000</strong>. Less than two weeks later he had closed it near{" "}
            <strong>$80,600</strong>, bought spot, and raised a <strong>$94,000</strong> target.
            On 21 October he added that a quick squeeze to <strong>$86,000</strong> could come
            first, followed by a stronger move to <strong>$94,000</strong>.
          </p>

          <p>
            That is not a contradiction. It is a trade. But the speed of the flip — and the
            certainty of the language around it — makes a useful case study in how to read a
            high-follower trader without outsourcing your own risk management.
          </p>

          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/doctor-profit-bitcoin-october-2026/og-doctor-profit-bitcoin-october-2026.svg"
              alt="Doctor Profit October 2026 Bitcoin flip: short at $86,200, long at $81,000, target $94,000, first confirmation $82,000, invalidation $79,000."
              width={1200}
              height={630}
              style={{ width: "100%", height: "auto", display: "block" }}
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
              The public level map as of 21 October 2026: short $86,200, exit near $80,600, long
              $81,000, target $94,000. The $82,000 reclaim is the first test; $79,000 is the
              invalidation.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Snapshot, 21 October 2026:</strong> short $86,200 → exit near $80,600 →
              long $81,000 (4x) → first confirmation $82,000 → range $82,000–$88,000 → target
              $94,000. Invalidation: loss of $81,000–$82,000, then $79,000. These are his
              published levels, paraphrased. Not financial advice.
            </p>
          </div>

          <h2>Who is Doctor Profit?</h2>
          <p>
            Doctor Profit is a pseudonymous trader who posts as{" "}
            <a
              href="https://x.com/DrProfitCrypto"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              @DrProfitCrypto
            </a>{" "}
            on X. His bio describes him as an elite trader focused on Bitcoin, stocks, and
            trading psychology, with the standard disclaimer that the content is educational and
            not financial advice. He also sells a premium subscription, which matters when
            reading the free feed: every public post is both analysis and marketing.
          </p>
          <p>
            His public story is that he sold the 2025 top near $124,000, shorted the decline, and
            covered near $60,000. That sequence is the foundation of his current credibility. It
            is also the part an outsider cannot verify. We can verify what he posted and when. We
            cannot verify the fills, the size, or the equity curve behind them.
          </p>

          <h2>The last ten posts, in order</h2>
          <p>
            The feed reads like a trade journal if you put it in sequence. The important detail is
            not the direction — it is that the invalidation and the next level were published
            before the move.
          </p>

          <div className="overflow-x-auto" style={{ margin: "28px 0" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                  <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>When</th>
                  <th style={{ padding: "10px 12px" }}>What he posted</th>
                  <th style={{ padding: "10px 12px" }}>The market takeaway</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((row) => (
                  <tr
                    key={`${row.when}-${row.post.slice(0, 24)}`}
                    style={{ borderBottom: "1px solid var(--border)", verticalAlign: "top" }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        color: "var(--foreground)",
                      }}
                    >
                      {row.when}
                    </td>
                    <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>
                      {row.post}
                    </td>
                    <td style={{ padding: "12px", color: "var(--muted-foreground)" }}>
                      {row.takeaway}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>The trade logic: why $82,000 matters more than $94,000</h2>
          <p>
            The $94,000 number is the headline. The actual thesis is a level flip. In early
            October, Bitcoin was pressing toward $87,000 while the daily RSI was making a lower
            high. That is a bearish divergence, and it was the reason he wanted to short rather
            than chase. When price fell to roughly $80,300, the RSI reset to the same zone as the
            previous bounce and price returned to the trendline he calls the orange line. He
            covered the short, bought spot, and flipped the narrative.
          </p>
          <p>
            The bullish leg is unusually specific. First, Bitcoin has to reclaim{" "}
            <strong>$82,000</strong>, the old resistance that previously marked the start of the
            bull market. Second, it
            has to hold a range between <strong>$82,000 and $88,000</strong>. Third, the{" "}
            <strong>$86,000–$88,000</strong> band has to behave like accumulation rather than
            distribution — buyers absorbing the same supply that rejected price on the way up.
            Only then does <strong>$94,000</strong> become the next objective.
          </p>
          <p>
            That third step is the weak link. The $86,000–$88,000 zone is exactly where he built
            the short. If the same sellers show up again, the range fails. If spot buyers absorb
            them, the former resistance becomes support and the target opens. The battlefield is
            therefore $86,000–$88,000, not $94,000.
          </p>

          <div
            style={{
              display: "grid",
              gap: 10,
              margin: "28px 0",
              padding: "20px",
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "var(--card)",
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--muted-foreground)" }}>
              LEVEL MAP
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>$94,000</strong>
              <span style={{ color: "var(--muted-foreground)" }}>Stated target</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>$86,000–$88,000</strong>
              <span style={{ color: "var(--muted-foreground)" }}>Must absorb supply</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>$82,000</strong>
              <span style={{ color: "var(--muted-foreground)" }}>First confirmation</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>$81,000</strong>
              <span style={{ color: "var(--muted-foreground)" }}>Long entry / support</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>$79,000</strong>
              <span style={{ color: "var(--muted-foreground)" }}>Thesis invalidation</span>
            </div>
          </div>

          <p>
            He has also been explicit about what would change his mind. A daily close back below
            $81,000 would weaken the setup. A failure to reclaim $82,000 would keep the market
            trapped in the low $80,000s. A break of $79,000 would force a full reassessment. That
            is more useful than the target, because it tells you where the idea is wrong.
          </p>

          <h2>The Monero warning is the more useful post</h2>
          <p>
            Among the ten posts, the Monero warning is the one that generalises best. Record open
            interest means a record amount of leveraged exposure is sitting in perpetual futures.
            Open interest is not directional on its own; it is fuel. Crowded positioning plus
            funding costs plus a sharp move can produce a liquidation cascade that has little to
            do with the underlying story.
          </p>
          <p>
            The same lens applies to Bitcoin. After a large rally and a sharp pullback, perp
            positioning matters more than headlines. A push into $86,000 on rising open interest
            is more fragile than the same push driven by spot demand. That is the practical
            takeaway from the XMR post: watch the leverage, not just the price.
          </p>

          <h2>What the posts leave out</h2>
          <ul>
            <li>
              <strong>Fills and size are paywalled.</strong> The free post says he entered at
              $81,000. The exact order, size, and timing allegedly live in the premium feed. You
              cannot audit the edge from the public timeline.
            </li>
            <li>
              <strong>The feed is a highlight reel by construction.</strong> He did publish the
              $79,000 target before the drop, which deserves credit. But one correctly called
              sequence is not a full track record, and losing trades get less airtime than
              winning ones.
            </li>
            <li>
              <strong>Targets move.</strong> Mid-October coverage referenced a $92,000 objective;
              by 18–21 October the public target was $94,000, after a $79,000 downside target
              earlier in the month. That is normal for a discretionary trader, but it means a
              target is a scenario, not a promise.
            </li>
            <li>
              <strong>Leverage is doing the work.</strong> A 4x long from $81,000 is a different
              risk object from spot. A 4x position can be liquidated by roughly a 25% adverse
              move, less after fees, and crypto can deliver that over a weekend.
            </li>
            <li>
              <strong>Some posts are politics, not markets.</strong> The Palantir and digital-ID
              post is an opinion about surveillance and policy. It tells you about the author’s
              worldview, not Bitcoin’s next move.
            </li>
            <li>
              <strong>The free feed is also a funnel.</strong> Many posts end with an invitation
              to the paid subscription. That does not make the analysis wrong, but it does mean
              the confidence is partly a sales asset.
            </li>
          </ul>

          <h2>The BTC500 read: a target is not a timetable</h2>
          <p>
            The 500-day rule does not need Doctor Profit to be right. It buys exactly 500 days
            before each halving and sells exactly 500 days after, whatever the tape does. At the
            time of writing the next buy window is roughly 38 days away, in late November 2026.
            The exact UTC date is maintained on the{" "}
            <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
              Bitcoin 500-day cycle
            </Link>{" "}
            page.
          </p>
          <p>
            A $94,000 target and a $79,000 invalidation are both compatible with that calendar.
            The difference is that the calendar does not require you to guess which one prints
            first. If you want to use trader commentary, use it as a scenario generator rather
            than a signal service:
          </p>
          <ul>
            <li>Write the level down before the move, not after it.</li>
            <li>Define invalidation before entry, not after the drawdown.</li>
            <li>Size the position so that being wrong is boring.</li>
            <li>Check whether the call was public before the move it describes.</li>
            <li>Ignore the follower count. It is a distribution metric, not an accuracy metric.</li>
          </ul>

          <h2>Bottom line</h2>
          <p>
            Doctor Profit’s October flip is coherent: short the divergence, cover the flush, buy
            the retest, target the range high. The $94,000 call is a scenario with a clear
            invalidation, not a prophecy. The useful part is the level map — $82,000 reclaim,
            $86,000–$88,000 absorption, $94,000 objective, $79,000 invalidation. The part to
            ignore is the certainty.
          </p>
          <p>
            For a BTC500 reader, the trade and the calendar answer different questions. The trade
            asks what happens next week. The calendar asks where you want to be 500 days before
            the halving. You can follow the first without letting it change the second.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Disclosure:</strong> BTC500 is not affiliated with Doctor Profit and
              receives no compensation from him. Public posts are paraphrased and shortened; no
              post is reproduced in full. Prices and levels are as posted on 21 October 2026 and
              were not independently verified. This is market commentary, not financial advice.
            </p>
          </div>

          <h2>Sources</h2>
          <ul>
            <li>
              <a
                href="https://x.com/DrProfitCrypto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                Doctor Profit (@DrProfitCrypto) on X
              </a>{" "}
              — public timeline read on 21 October 2026.
            </li>
            <li>
              <a
                href="https://www.kucoin.com/news/flash/doctor-profit-bitcoin-s-correction-completed-81-000-82-000-usd-as-strong-support-target-remains-94-000-usd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                KuCoin flash, 20 October 2026
              </a>{" "}
              — summary of the $81,000 long and $94,000 target.
            </li>
            <li>
              <a
                href="https://captainaltcoin.com/correction-is-over-analyst-who-called-the-60k-bitcoin-bottom-makes-a-bold-prediction/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                CaptainAltcoin, 12 October 2026
              </a>{" "}
              — coverage of the short cover and the flip.
            </li>
          </ul>

          <h2>FAQ</h2>
          <div className="faq-list">
            {faqs.map((item) => (
              <div key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </>
  );
}

export { faqs as doctorProfitFaqs };
