import { motion } from "framer-motion";
import { BookOpen, Clock, ExternalLink } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function RuplArticle({ title, date, readTime }: ArticleProps) {
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
            When analyzing Bitcoin's market cycles, one of the most powerful on-chain indicators is
            the <strong>Net Unrealized Profit/Loss (NUPL)</strong> — also known as Relative
            Unrealized Profit/Loss. It reveals whether the market as a whole is sitting on profits
            or losses, and more importantly, it maps directly to the emotional phases of every
            Bitcoin cycle.
          </p>

          <div className="strategy-box">
            <h3>What is NUPL?</h3>
            <div className="formula">
              NUPL = Market Cap − Realized Cap
              <br />
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                (Total Profit / Loss held across all Bitcoin wallets)
              </span>
            </div>
            <p>
              When NUPL is positive, the market is in profit. When negative, the market is at a
              loss. The magnitude tells you just how deep into greed or fear the market has moved.
            </p>
          </div>

          {/* RUPL Chart Image */}
          <h2>Bitcoin RUPL Chart</h2>
          <p>
            The chart below shows Bitcoin's Relative Unrealized Profit/Loss over time. Each colored
            band corresponds to a distinct phase of market sentiment — from disbelief and hope all
            the way to euphoria and capitulation.
          </p>

          <a
            href="https://www.bitcoinmagazinepro.com/charts/relative-unrealized-profit--loss/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-[24px] border border-border/60 transition-all hover:border-primary/50 hover:shadow-lg"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/og/rupl-chart.jpeg"
              alt="Bitcoin Relative Unrealized Profit/Loss (NUPL) Chart — Bitcoin Magazine Pro"
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
              <span className="flex items-center gap-2">Source: Bitcoin Magazine Pro</span>
              <span className="flex items-center gap-1.5 font-semibold text-primary transition-all group-hover:gap-2">
                View full chart on Bitcoin Magazine Pro
                <ExternalLink className="h-4 w-4" />
              </span>
            </div>
          </a>

          <h2>The Five Phases of NUPL</h2>
          <p>
            NUPL doesn't just show profit and loss — it maps to the emotional cycle of the market.
            Each phase has historically aligned with specific periods in Bitcoin's four-year halving
            cycle.
          </p>

          <div className="highlight-box" style={{ borderLeftColor: "oklch(0.65 0.15 35)" }}>
            <p>
              <strong>Phase 1 — Disbelief (Green / 0–0.25):</strong> After a bear market, price
              begins recovering but most investors remain skeptical. NUPL is positive but low.
              Historically this occurs in the early post-halving period.
            </p>
          </div>

          <div className="highlight-box" style={{ borderLeftColor: "oklch(0.72 0.19 55)" }}>
            <p>
              <strong>Phase 2 — Hope & Optimism (Yellow / 0.25–0.50):</strong> The market gains
              momentum. More investors become profitable. This phase often begins around the halving
              event itself, as supply constraints start to take effect.
            </p>
          </div>

          <div className="highlight-box" style={{ borderLeftColor: "oklch(0.6 0.15 184)" }}>
            <p>
              <strong>Phase 3 — Belief (Teal / 0.50–0.75):</strong> The bull market is well
              underway. The majority of Bitcoin holders are in profit, and confidence is building.
              This maps to the mid-cycle rally period.
            </p>
          </div>

          <div className="highlight-box" style={{ borderLeftColor: "oklch(0.7 0.15 130)" }}>
            <p>
              <strong>Phase 4 — Euphoria (Green high / 0.75–1.0):</strong> The peak of the cycle.
              NUPL reaches its maximum as almost every holder is in significant profit. This has
              historically coincided with the cycle top, roughly 500–600 days after the halving.
            </p>
          </div>

          <div className="highlight-box" style={{ borderLeftColor: "oklch(0.577 0.245 27)" }}>
            <p>
              <strong>Phase 5 — Capitulation (Red / below 0):</strong> The bear market takes hold.
              NUPL turns negative as the majority of holders are at a loss. This is the phase where
              weak hands sell, setting the stage for the next cycle.
            </p>
          </div>

          <h2>
            Why NUPL Matters for the BTC<span className="text-primary">500</span> Strategy
          </h2>
          <p>
            The BTC<span className="text-primary">500</span> strategy and NUPL are natural
            companions. Here's how they align:
          </p>

          <ul>
            <li>
              <strong>Buying at "Disbelief":</strong> The 500-day pre-halving buy window typically
              places you in the Disbelief or early Hope phase — when NUPL is low but positive. This
              is precisely when Bitcoin is most undervalued relative to the coming cycle.
            </li>
            <li>
              <strong>Holding through the cycle:</strong> As the halving approaches and passes, NUPL
              moves through Optimism into Belief. This is your holding period — and NUPL confirms
              you're on the right track.
            </li>
            <li>
              <strong>Selling at "Euphoria":</strong> The 500-day post-halving sell window targets
              the Euphoria phase. When NUPL enters the 0.75–1.0 range, it signals that almost the
              entire market is in profit — historically a reliable indicator that the cycle top is
              near.
            </li>
            <li>
              <strong>Avoiding "Capitulation":</strong> By selling 500 days after the halving, you
              exit before the NUPL turns negative. This is the key to locking in profits and
              avoiding the bear market.
            </li>
          </ul>

          <div className="data-point">
            <strong>Historical Correlation:</strong> In the 2020 halving cycle, NUPL entered the
            Euphoria band in early 2021, around 10 months after the halving. The BTC
            <span className="text-primary">500</span> sell date (500 days post-halving, September
            2021) fell squarely within this euphoric territory — just before the eventual downturn.
          </div>

          <h2>How NUPL is Calculated</h2>
          <p>Understanding the math behind NUPL helps you trust the signal:</p>

          <ol>
            <li>
              <strong>Market Cap</strong> = Current price × Total circulating supply (what the
              market says Bitcoin is worth right now).
            </li>
            <li>
              <strong>Realized Cap</strong> = Each UTXO valued at the price when it last moved (what
              Bitcoin holders actually paid, on average).
            </li>
            <li>
              <strong>NUPL</strong> = (Market Cap − Realized Cap) ÷ Market Cap
            </li>
          </ol>

          <p>
            The result is a ratio between -1 and +1 that represents the average unrealized profit or
            loss across all Bitcoin holders. When the ratio is normalized in this way, it's often
            called <strong>Relative Unrealized Profit/Loss (RUPL)</strong>.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Key insight:</strong> Realized Cap removes the noise of short-term price
              volatility by looking at the cost basis of the entire market. When price surges far
              above what most people paid, NUPL rises. When price drops below the average cost
              basis, NUPL turns negative.
            </p>
          </div>

          <h2>Practical Ways to Use NUPL</h2>

          <h3>1. Cycle Timing</h3>
          <p>
            Track NUPL alongside the BTC<span className="text-primary">500</span> countdown. When
            NUPL dips into the Disbelief range after a bear market, it's a confirmation signal that
            the next accumulation window is opening. When NUPL enters Euphoria, it's time to prepare
            your sell orders.
          </p>

          <h3>2. Risk Management</h3>
          <p>
            During the holding period (between your buy and sell dates), NUPL can help you stay calm
            during corrections. If NUPL remains positive and above 0.25, the cycle is still intact.
            Sharp drops into negative territory warrant attention.
          </p>

          <h3>3. Comparing Cycles</h3>
          <p>
            By normalizing NUPL as a ratio, you can compare different halving cycles directly. The
            peaks of each cycle's Euphoria phase provide a consistent reference point for
            understanding where we are in the current cycle.
          </p>

          <h2>Limitations to Keep in Mind</h2>
          <p>No indicator is perfect. Here are the key limitations of NUPL:</p>

          <ul>
            <li>
              <strong>Lagging indicator:</strong> NUPL confirms trends rather than predicting them.
              It's excellent for validation, less useful for precise timing.
            </li>
            <li>
              <strong>Extreme readings can persist:</strong> The Euphoria phase can last for months,
              making it difficult to pinpoint the exact top.
            </li>
            <li>
              <strong>Doesn't account for external factors:</strong> Regulatory changes,
              macroeconomic conditions, or black swan events can override on-chain signals.
            </li>
            <li>
              <strong>Best used in combination:</strong> NUPL works best alongside other indicators
              like the Puell Multiple, MVRV Z-Score, and the BTC
              <span className="text-primary">500</span> timeline.
            </li>
          </ul>

          <div className="data-point">
            <strong>
              For BTC<span className="text-primary">500</span> users:
            </strong>{" "}
            NUPL is best used as a confirmation tool within the BTC
            <span className="text-primary">500</span> framework. The strategy's fixed buy/sell dates
            provide the structure; NUPL provides the conviction. When both align — you're buying in
            Disbelief and selling in Euphoria — you have the highest probability of success.
          </div>

          <h2>Bringing It All Together</h2>
          <p>
            The Relative Unrealized Profit/Loss (NUPL) chart is one of the most transparent windows
            into Bitcoin market psychology. It strips away the noise and shows you, at a glance,
            whether the market is driven by fear or greed, despair or euphoria.
          </p>

          <p>
            For BTC<span className="text-primary">500</span> practitioners, NUPL serves as the
            perfect companion indicator. It validates that the strategy's fixed windows align with
            the actual emotional and financial state of the market. When the countdown says "buy"
            and NUPL says "disbelief," the stars are aligned. When the countdown says "sell" and
            NUPL says "euphoria," it's time to act.
          </p>

          <p>
            Use the chart above to understand the current market phase, and cross-reference it with
            your BTC<span className="text-primary">500</span> timeline to make informed, confident
            decisions throughout each halving cycle. For the latest interactive data, visit{" "}
            <a
              href="https://www.bitcoinmagazinepro.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary)", textDecoration: "underline" }}
            >
              Bitcoin Magazine Pro
            </a>
            .
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
