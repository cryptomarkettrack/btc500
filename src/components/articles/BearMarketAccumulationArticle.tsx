import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function BearMarketAccumulationArticle({ title, date, readTime }: ArticleProps) {
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
            Every Bitcoin cycle ends the same way: the crowd finally agrees on a bottom, and then
            the market refuses to deliver it. The consensus bottom is the one that never happens.
          </p>

          {/* Real Bottom Image */}
          <a
            href="/simulator"
            className="group block overflow-hidden rounded-[24px] border border-border/60 transition-all hover:border-primary/50 hover:shadow-lg"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/og/real-bottom.png"
              alt="Bitcoin Real Bottom — BTC500 Strategy Visualization"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--card)",
              }}
            >
              <span className="flex items-center gap-2">
                Visualization: Buying at the Real Bottom vs. Fake Bottoms
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-primary transition-all group-hover:gap-2">
                Try the Simulator
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-right h-4 w-4"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </a>

          <p>
            Right now, the market is split into three camps. The largest group expects Bitcoin to
            bottom between $40,000 and $50,000 in September or October. A second group believes the
            bottom is already behind us. A third group is waiting for a deeper flush to the
            $28,000–$33,000 range.
          </p>

          <p>
            The most popular opinion is the $40,000–$50,000 target. And that is precisely the
            problem.
          </p>

          <h2>The Consensus Bottom Is a Trap</h2>
          <p>
            When an entire market agrees on the same bottom target in the same month, that target
            loses its power. The bottom the crowd is waiting for is the bottom the market will not
            deliver in the way they expect.
          </p>

          <p>
            This isn't speculation — it's a pattern that repeats every cycle. In 2022, the crowd was
            convinced $30,000 was the floor. Analysts called it. Influencers celebrated it. Social
            media was filled with confidence. Then Bitcoin fell to $16,000.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Key insight:</strong> The market doesn't reward the consensus. It rewards the
              minority who understand that when everyone is looking at the same price level, that
              level becomes the most crowded trade in the room — and the most likely to fail.
            </p>
          </div>

          <h2>What the MA200 Weekly Actually Tells Us</h2>
          <p>
            Bitcoin has lost its 200-week moving average again. For many investors, this sounds like
            a warning. For anyone who has studied Bitcoin's history, it's the opposite.
          </p>

          <p>
            Every time Bitcoin has traded below the MA200 weekly, it has historically been a
            significant buying opportunity. The current price action sits directly at and below this
            level — the same zone where previous cycle bottoms have formed.
          </p>

          <p>
            This is not the zone where you panic. This is the zone where disciplined investors build
            positions.
          </p>

          <h2>Forced Selling Creates the Best Entries</h2>
          <p>
            The most interesting development this week involves one of Bitcoin's most prominent
            corporate holders. After years of declaring he would never sell, the CEO of Strategy
            (formerly MicroStrategy) is now reportedly considering selling $5 billion worth of
            Bitcoin — at a price point near the current accumulation zone.
          </p>

          <p>
            The man who bought at $100,000, $110,000, and $120,000 — often with leverage — is now
            facing a position that forces his hand at $60,000 instead of $120,000. This is what
            happens when you have no plan: the market makes the plan for you, and the market's plan
            is always worse than the one you refused to make yourself.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Why this matters:</strong> Forced selling from a trapped whale is exactly the
              kind of liquidity event that marks accumulation zones. When a large holder is forced
              to sell into weakness, it creates the deep prices that patient buyers have been
              waiting for.
            </p>
          </div>

          <h2>
            The BTC<span className="text-primary">500</span> Perspective: Accumulate Before
            Confirmation
          </h2>
          <p>
            Here's the fundamental truth that separates disciplined investors from the crowd:
            accumulation happens before confirmation. By the time the market officially declares a
            bull market, the biggest opportunity has already passed.
          </p>

          <p>
            The BTC<span className="text-primary">500</span> strategy is built on this exact
            principle. You buy approximately 500 days before the halving — during the bear market,
            when prices are low and sentiment is negative. You don't wait for the crowd to agree
            that the bottom is in. You buy when history says the odds are in your favor.
          </p>

          <div className="strategy-box">
            <h3>The Core Strategy</h3>
            <div className="formula">
              BUY: 500 days before halving
              <br />
              SELL: 500 days after halving
            </div>
            <p>No complex indicators. No emotional trading. Just discipline.</p>
          </div>

          <p>
            The greatest investments are made in bear markets — not after everyone agrees a bull
            market has already begun. Those who can only think in black and white fail to understand
            that the transition zone is where the biggest opportunities are created.
          </p>

          <h2>Why the Crowd Keeps Getting It Wrong</h2>
          <p>
            The crowd's behavior follows a predictable pattern. At the top, they call the cycle a
            "disgrace" and refuse to believe in the four-year cycle. At the bottom, they suddenly
            become believers — but only in the lows they've cherry-picked for themselves.
          </p>

          <p>
            If the four-year cycle is real, it applies to both the highs and the lows. You can't
            dismiss it at $120,000 and then embrace it at $50,000. That's not analysis — that's
            greed wearing the mask of conviction.
          </p>

          <ul>
            <li>
              <strong>At the top:</strong> The crowd laughs at cycle targets and calls for new ATHs.
            </li>
            <li>
              <strong>In the middle:</strong> The crowd adopts yesterday's bearish targets as their
              own.
            </li>
            <li>
              <strong>At the bottom:</strong> The crowd waits for a level that will never come,
              because everyone is waiting for it.
            </li>
          </ul>

          <h2>What History Says About Buying in Bear Markets</h2>
          <p>
            Bitcoin's halving cycle creates a recurring pattern. The 500 days before each halving
            have historically been the accumulation window — the period when prices are most
            undervalued relative to the coming cycle.
          </p>

          <p>
            The current market sits in a similar position. The bear market is real. But so is the
            opportunity it creates for those willing to act before the crowd.
          </p>

          <div className="data-point">
            <strong>Historical pattern:</strong> Investors who bought during the bear market leading
            into each halving — rather than waiting for the crowd's "confirmed bottom" — have
            consistently captured the majority of the cycle's upside. The same pattern is playing
            out now.
          </div>

          <h2>The Takeaway</h2>
          <p>
            Nobody rings a bell at the bottom. Nobody knows the exact day Bitcoin will reverse. But
            history leaves clues.
          </p>

          <p>
            The crowd waits for $40,000–$50,000 in September or October. Disciplined investors
            accumulate in the current range, knowing that the consensus bottom is the one the market
            is least likely to deliver.
          </p>

          <p>
            The investors who succeed over multiple cycles aren't usually the ones making the
            boldest predictions. They're the ones following a disciplined, repeatable strategy —
            buying when history suggests the odds are in their favor, not when the crowd finally
            agrees.
          </p>

          <p>
            That's exactly what BTC<span className="text-primary">500</span> is built around. Not
            predicting the future — but making better decisions by learning from Bitcoin's past.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Important:</strong> This article is for educational purposes only and does not
              constitute financial advice. Always do your own research and consider consulting with
              a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </motion.article>
    </>
  );
}
