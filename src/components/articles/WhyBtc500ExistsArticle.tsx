import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function WhyBtc500ExistsArticle({ title, date, readTime }: ArticleProps) {
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
            Every Bitcoin cycle has one thing in common. People become convinced the bottom is
            already in. Then Bitcoin proves them wrong.
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-arrow-right h-4 w-4"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </a>

          <p>
            In 2022, many investors believed $30,000 was the ultimate buying opportunity. Analysts
            called it the bottom. Influencers celebrated. Social media was filled with confidence.
          </p>

          <p>Then Bitcoin fell to $16,000.</p>

          <p>That wasn't a small correction. It was another 47% decline.</p>

          <h2>The Difference Between Buying Early and Buying Right</h2>
          <p>Imagine you had $30,000 available.</p>

          <div className="strategy-box">
            <h3>Investor A</h3>
            <div className="formula">
              Bought 1 BTC at $30,000.
              <br />
              Watched the investment fall to $16,000.
              <br />
              Held through the pain.
              <br />
              When Bitcoin reached $120,000, the portfolio was worth $120,000.
            </div>
            <p>A fantastic return.</p>
          </div>

          <p>But now look at Investor B.</p>

          <div className="strategy-box">
            <h3>Investor B</h3>
            <div className="formula">
              Instead of rushing in, they waited.
              <br />
              They bought near $16,000.
              <br />
              With the same $30,000, they accumulated almost 2 BTC.
              <br />
              When Bitcoin reached $120,000, their holdings were worth approximately $240,000.
            </div>
            <p>Same capital. Same bull market. Double the outcome.</p>
          </div>

          <p>The difference wasn't predicting the top. It was waiting for a better entry.</p>

          <h2>Why This Happens Every Cycle</h2>
          <p>During every bear market, Bitcoin creates multiple "fake bottoms."</p>

          <p>Price stabilizes. Volatility drops. Everyone starts saying: "The bottom is in."</p>

          <p>Then another wave of selling arrives.</p>

          <p>This pattern repeats because markets are driven by psychology, not certainty.</p>

          <p>Nobody knows the exact bottom while it's happening.</p>

          <h2>BTC500 Is Built Around This Reality</h2>
          <p>BTC500 isn't about predicting tomorrow's candle.</p>

          <p>It's about using one of Bitcoin's strongest historical patterns:</p>

          <div className="highlight-box">
            <p>
              <strong>
                Buying approximately 500 days before a halving and holding until 500 days after.
              </strong>
            </p>
          </div>

          <p>
            This strategy doesn't require catching the absolute bottom. Instead, it helps investors
            avoid buying too early, when history shows the market often has significant downside
            remaining.
          </p>

          <p>
            Rather than relying on emotions, headlines, or influencers, BTC500 tracks where we are
            in the current halving cycle and compares it with previous ones.
          </p>

          <h2>Time in the Market Is Important—But Timing Still Matters</h2>
          <p>You'll often hear: "Time in the market beats timing the market."</p>

          <p>Over decades, that's generally true.</p>

          <p>
            But Bitcoin is unlike most traditional assets. Its four-year halving cycle creates
            recurring periods where timing has historically had a meaningful impact on long-term
            returns.
          </p>

          <p>Buying months too early can mean:</p>

          <ul>
            <li>Sitting through a 40–60% drawdown.</li>
            <li>Carrying unnecessary risk.</li>
            <li>Owning significantly less Bitcoin than you could have.</li>
          </ul>

          <p>
            The goal isn't to find the exact bottom. The goal is to buy when history suggests the
            odds are increasingly in your favor.
          </p>

          <h2>The Takeaway</h2>
          <p>Nobody rings a bell at the bottom.</p>

          <p>Nobody knows the exact day Bitcoin will reverse.</p>

          <p>But history leaves clues.</p>

          <p>
            The investors who succeed over multiple cycles aren't usually the ones making the
            boldest predictions. They're the ones following a disciplined, repeatable strategy.
          </p>

          <p>
            That's exactly why BTC500 exists. Not to predict the future—but to help you make better
            decisions by learning from Bitcoin's past.
          </p>
        </div>
      </motion.article>
    </>
  );
}
