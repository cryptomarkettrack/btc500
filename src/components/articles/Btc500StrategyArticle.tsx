import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function Btc500StrategyArticle({ title, date, readTime }: ArticleProps) {
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
            What if we told you there's a Bitcoin investment strategy so simple, it can be explained
            in one sentence—yet so powerful, it has consistently outperformed nearly every other
            approach? Welcome to <strong>BTC500</strong>: buy 500 days before each halving, sell 500
            days after.
          </p>

          <div className="strategy-box">
            <h3>The Core Strategy</h3>
            <div className="formula">
              BUY: 500 days before halving
              <br />
              SELL: 500 days after halving
            </div>
            <p>That's it. No complex indicators, no daily monitoring, no emotional trading.</p>
          </div>

          <h2>Why 500 Days?</h2>
          <p>
            The number 500 isn't arbitrary. It's derived from years of historical Bitcoin data and
            represents the optimal window for capturing the majority of each halving cycle's upside.
            Here's why this specific timeframe works:
          </p>

          <ul>
            <li>
              <strong>Pre-halving accumulation phase:</strong> The 500 days before a halving
              typically represent the accumulation period where Bitcoin is still relatively
              undervalued compared to post-halving prices.
            </li>
            <li>
              <strong>Market anticipation:</strong> As the halving approaches, media coverage and
              investor interest increase, driving prices upward.
            </li>
            <li>
              <strong>Post-halving supply shock:</strong> After the halving, the reduced new supply
              creates upward price pressure that historically peaks around 500 days later.
            </li>
            <li>
              <strong>Historical validation:</strong> Backtesting this strategy across multiple
              halving cycles shows consistent outperformance versus buy-and-hold.
            </li>
          </ul>

          <h2>The Halving Cycle Explained</h2>
          <p>
            Bitcoin's halving is a pre-programmed event that occurs approximately every four years
            (or every 210,000 blocks). During a halving, the block reward for miners is cut in half,
            reducing the rate at which new Bitcoin enters circulation.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Key insight:</strong> If demand remains constant or increases while supply is
              cut in half, basic economics suggests the price should rise. This is exactly what has
              happened in each of Bitcoin's previous halving cycles.
            </p>
          </div>

          <h3>Historical Halving Dates</h3>
          <ul>
            <li>
              <strong>November 28, 2012:</strong> First halving (50 BTC → 25 BTC reward)
            </li>
            <li>
              <strong>July 9, 2016:</strong> Second halving (25 BTC → 12.5 BTC reward)
            </li>
            <li>
              <strong>May 11, 2020:</strong> Third halving (12.5 BTC → 6.25 BTC reward)
            </li>
            <li>
              <strong>April 2024:</strong> Fourth halving (6.25 BTC → 3.125 BTC reward)
            </li>
          </ul>

          <h2>Why This Strategy Works</h2>

          <h3>1. Removes Emotional Decision-Making</h3>
          <p>
            Most investors fail because they buy when prices are high (FOMO) and sell when prices
            are low (panic). The BTC500 strategy eliminates this by following a predetermined,
            rules-based approach that doesn't depend on market sentiment.
          </p>

          <h3>2. Captures the Full Cycle</h3>
          <p>
            By buying 500 days before the halving, you enter during the accumulation phase when
            prices are still relatively low. By selling 500 days after, you capture the peak of the
            post-halving rally before the next bear market begins.
          </p>

          <h3>3. Minimal Time Commitment</h3>
          <p>
            Unlike day trading or even active investing, BTC500 requires checking your portfolio
            only twice per halving cycle (roughly every 4 years). Set your buy order, set your sell
            order, and let the strategy work.
          </p>

          <h3>4. Historically Proven</h3>
          <p>
            While past performance doesn't guarantee future results, the consistency of Bitcoin's
            halving cycles makes this one of the more reliable strategies in the cryptocurrency
            space. Each halving has been followed by a significant bull run.
          </p>

          <div className="data-point">
            <strong>Historical Performance:</strong> Investors who bought 500 days before the 2020
            halving (around March 2019) and sold 500 days after (around September 2021) would have
            seen returns of approximately 400-500%, significantly outperforming a simple
            buy-and-hold strategy from the same period.
          </div>

          <h2>Understanding the Timeline</h2>
          <p>Let's break down what happens during a typical BTC500 cycle:</p>

          <ol>
            <li>
              <strong>Year 1-2 (Accumulation):</strong> You buy during the bear market/recovery
              phase. Prices are relatively low, and you're accumulating before the halving.
            </li>
            <li>
              <strong>Year 2-3 (Pre-halving rally):</strong> As the halving approaches, anticipation
              builds and prices start climbing.
            </li>
            <li>
              <strong>Halving event:</strong> The supply shock hits. Miners receive fewer rewards,
              reducing selling pressure.
            </li>
            <li>
              <strong>Year 3-4 (Bull run):</strong> The post-halving bull market typically peaks
              around 12-18 months after the halving.
            </li>
            <li>
              <strong>Year 4+ (Distribution):</strong> You sell at the peak, locking in profits
              before the next bear market.
            </li>
          </ol>

          <h2>Risk Management</h2>
          <p>
            No investment strategy is without risk. Here are important considerations for BTC500:
          </p>

          <ul>
            <li>
              <strong>Timing risk:</strong> While 500 days has worked historically, there's no
              guarantee it will work perfectly every cycle.
            </li>
            <li>
              <strong>Market conditions:</strong> External factors (regulation, macroeconomics,
              black swan events) can affect outcomes.
            </li>
            <li>
              <strong>Volatility:</strong> Bitcoin remains a volatile asset. Be prepared for
              significant drawdowns even during bull markets.
            </li>
            <li>
              <strong>Tax implications:</strong> Consult a tax professional about the tax treatment
              of your trades in your jurisdiction.
            </li>
          </ul>

          <div className="highlight-box">
            <p>
              <strong>Important:</strong> This article is for educational purposes only and does not
              constitute financial advice. Always do your own research and consider consulting with
              a financial advisor before making investment decisions.
            </p>
          </div>

          <h2>Getting Started with BTC500</h2>
          <p>Ready to implement the BTC500 strategy? Here's how to get started:</p>

          <ol>
            <li>
              <strong>Mark your calendar:</strong> Note the next halving date and calculate your buy
              date (500 days before) and sell date (500 days after).
            </li>
            <li>
              <strong>Set up your exchange:</strong> Choose a reputable cryptocurrency exchange and
              complete verification.
            </li>
            <li>
              <strong>Determine your position size:</strong> Decide how much you want to invest
              based on your risk tolerance.
            </li>
            <li>
              <strong>Place your buy order:</strong> Set a limit order for your buy date, or
              dollar-cost average in the weeks leading up to it.
            </li>
            <li>
              <strong>Set your sell order:</strong> Place your sell order in advance to remove
              emotion from the decision.
            </li>
            <li>
              <strong>Track your cycle:</strong> Use tools like the BTC500 countdown to monitor your
              progress.
            </li>
          </ol>

          <h2>The Psychology of Simple Strategies</h2>
          <p>
            In a world of complex trading algorithms, leveraged positions, and endless chart
            analysis, there's something almost rebellious about a strategy this simple. But that
            simplicity is its strength.
          </p>

          <p>
            The BTC500 strategy works because it aligns with Bitcoin's fundamental value
            proposition: a predictable, algorithmic monetary policy that creates clear supply shocks
            at regular intervals. By removing emotion, complexity, and the need for constant
            monitoring, you're free to focus on what matters—your long-term financial goals.
          </p>

          <h2>Conclusion</h2>
          <p>
            The BTC500 strategy represents one of the most elegant approaches to Bitcoin investing:
            simple enough to explain in a single sentence, yet sophisticated enough to capture the
            full power of Bitcoin's halving cycle. By buying 500 days before each halving and
            selling 500 days after, you position yourself to benefit from the supply shock while
            avoiding the inevitable bear market that follows.
          </p>

          <p>
            Remember, the best strategy is one you can stick to. BTC500's simplicity makes it easy
            to follow through on, even during volatile market conditions. As you continue your
            Bitcoin journey, keep this strategy in your toolkit—it might just be the most powerful
            tool you have.
          </p>
        </div>
      </motion.article>
    </>
  );
}
