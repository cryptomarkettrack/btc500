import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Building2,
  Shield,
  Zap,
} from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

function PriceCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      {subtext && <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}

function StatBar({
  label,
  value,
  color,
  width,
}: {
  label: string;
  value: string;
  color: string;
  width: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ComparisonBox({
  title,
  good,
  goodLabel,
  bad,
  badLabel,
}: {
  title: string;
  good: string;
  goodLabel: string;
  bad: string;
  badLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="mb-3 text-center text-sm font-semibold text-muted-foreground">{title}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Shield className="h-3 w-3" />
            {goodLabel}
          </div>
          <div className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {good}
          </div>
        </div>
        <div className="rounded-lg bg-red-500/10 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-red-600 dark:text-red-400">
            <Zap className="h-3 w-3" />
            {badLabel}
          </div>
          <div className="mt-1 text-sm font-bold text-red-700 dark:text-red-300">{bad}</div>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const bars = [
    { height: "50%", label: "Aug", value: "$1.10" },
    { height: "75%", label: "Sep", value: "$1.60" },
    { height: "100%", label: "Oct", value: "$1.90" },
    { height: "95%", label: "Nov", value: "$2.00" },
    { height: "100%", label: "Dec", value: "$2.14" },
    { height: "45%", label: "Mar", value: "$1.00" },
    { height: "18%", label: "Now", value: "$0.38" },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="mb-3 text-center">
        <div className="text-sm font-semibold text-muted-foreground">ONDO Token Price</div>
        <div className="text-xs text-muted-foreground/70">
          Approximate price history (not financial advice)
        </div>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-foreground/80">{bar.value}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: bar.height }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full rounded-t-md ${i === bars.length - 1 ? "bg-primary" : i === 2 ? "bg-emerald-500" : "bg-primary/40"}`}
            />
            <span className="text-[10px] text-muted-foreground">{bar.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-primary/10 p-2 text-center text-xs font-medium text-primary">
        Current price: ~$0.38 — that's about 82% cheaper than the peak!
      </div>
    </div>
  );
}

function TimelineEvent({
  year,
  event,
  icon,
}: {
  year: string;
  event: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{year}</div>
        <div className="text-sm text-muted-foreground">{event}</div>
      </div>
    </div>
  );
}

export function OndoFinanceArticle({ title, date, readTime }: ArticleProps) {
  return (
    <>
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

      <motion.article
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6 text-foreground/90 leading-relaxed">
          {/* === INTRO === */}
          <p className="lead">
            Most people in crypto are focused on trading coins on decentralized exchanges like
            Hyperliquid. But there's something much bigger happening quietly behind the scenes — and
            almost nobody is talking about it.
          </p>
          <p className="lead">
            <strong>Ondo Finance (ONDO)</strong> is building the technology that will let Wall
            Street put real stocks and ETFs on the blockchain. And the biggest financial
            institutions on Earth — BlackRock, JPMorgan, Goldman Sachs — are already using it.
          </p>

          <div className="highlight-box">
            <p>
              <strong>In plain English:</strong> Imagine if you could buy Apple stock, the S&P 500
              ETF, or a US Treasury bond directly from your crypto wallet — no brokerage account
              needed. That's exactly what Ondo is building right now. And the first trades have
              already happened.
            </p>
          </div>

          {/* === PRICE CARD === */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <PriceCard label="Current Price" value="~$0.38" subtext="At time of writing" />
            <PriceCard label="All-Time High" value="$2.14" subtext="December 2024" />
            <PriceCard label="Drop from High" value="~82%" subtext="Major discount" />
            <PriceCard
              label="Market Sentiment"
              value="Bearish"
              subtext="But fundamentals are strong"
            />
          </div>

          <div className="highlight-box">
            <p>
              <strong>Why does this matter?</strong> The price dropped 82% — but the technology
              behind Ondo actually got <em>stronger</em>. More partnerships, more products, more
              institutions using it. Usually when a company's fundamentals get better but the price
              drops, that's what investors call an opportunity.
            </p>
          </div>

          {/* === PRICE CHART === */}
          <MiniChart />

          <p>
            Look at the chart above. ONDO hit its peak around $2.14 in December 2024 when everyone
            was excited about tokenization. Then the whole crypto market pulled back and ONDO
            dropped to around $0.38. But here's the thing — while the price was falling, Ondo was{" "}
            <em>actually building</em> real partnerships with the biggest banks in the world.
          </p>

          {/* === WHAT IS TOKENIZATION === */}
          <h2>What Is Tokenization? (The Simple Version)</h2>
          <p>
            Think of it this way: right now, if you want to buy Apple stock, you need a brokerage
            account (like Charles Schwab or Fidelity). The stock gets "settled" through a company
            called DTCC, which handles basically every stock trade in America.
          </p>
          <p>
            <strong>Tokenization</strong> means putting those same stocks on the blockchain — so
            instead of needing a brokerage account, you could buy them with your crypto wallet. It's
            like turning a physical dollar into a digital dollar — same value, but now it lives on
            the internet.
          </p>

          <img
            src="/articles/ondo/ondo-logo.png"
            alt="Ondo Finance Logo"
            className="mx-auto rounded-xl"
            style={{ width: 120, height: 120 }}
          />

          <div className="strategy-box">
            <h3>Tokenization Explained with Pizza</h3>
            <p style={{ fontSize: "1.1rem" }}>
              Imagine you have a slice of pizza. Right now, that slice only exists in your kitchen.
              Tokenization is like taking a photo of that slice and turning it into a digital
              version that anyone in the world can trade — but it's backed by the real slice. That's
              what Ondo does with stocks.
            </p>
          </div>

          {/* === THE BIG NEWS === */}
          <h2>The Big News: DTCC's First Tokenized Trades</h2>
          <p>
            Here's what just happened: <strong>DTCC</strong> — the company that settles every stock
            trade in America — just processed its very first tokenized stock trades. Not a test. Not
            a demo. Real, production trades.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ComparisonBox
              title="Who's Involved"
              good="BlackRock, JPMorgan, Goldman Sachs, Vanguard"
              bad="None of these are small companies"
              goodLabel="Institutions"
              badLabel="That's huge"
            />
            <ComparisonBox
              title="What Ondo Did"
              good="Launched tokenized stocks on the same day"
              bad="Other companies are still in planning"
              goodLabel="First Mover"
              badLabel="Ahead of everyone"
            />
          </div>

          <img
            src="/articles/ondo/tokenization-dtcc.jpg"
            alt="DTCC tokenization and blockchain data visualization"
            className="w-full rounded-xl"
            style={{ maxHeight: 400, objectFit: "cover" }}
          />

          <p>
            On the same day DTCC announced these trades, Ondo launched the{" "}
            <strong>first tokenized stocks that are actually backed by real securities</strong>. The
            two they launched are:
          </p>

          <ul>
            <li>
              <strong>CRCLon</strong> — A tokenized version of Circle stock (the company behind
              USDC)
            </li>
            <li>
              <strong>SPYon</strong> — A tokenized version of SPY, the S&P 500 ETF that tracks the
              entire US stock market
            </li>
          </ul>

          <div className="strategy-box">
            <h3>What Does "on" Mean?</h3>
            <div className="formula" style={{ fontSize: "1.2rem" }}>
              SPY + ONDO = SPYon
              <br />
              CRCL + ONDO = CRCLon
            </div>
            <p>
              The "on" at the end simply means it was created by Ondo Finance. It's their branding.
              When you see "SPYon" — think "SPY by ONDO."
            </p>
          </div>

          {/* === ONDO APP === */}
          <h2>The Ondo DEX: Trade Tokenized Stocks Today</h2>
          <p>
            Here's what almost nobody knows: Ondo Finance has already launched an app where you can
            trade tokenized stocks right now. Not "coming soon" — <em>actually live</em>.
          </p>

          <img
            src="/articles/ondo/blackrock-defi.jpg"
            alt="Financial charts and stock market analysis"
            className="w-full rounded-xl"
            style={{ maxHeight: 400, objectFit: "cover" }}
          />

          <div className="highlight-box">
            <p>
              <strong>What's the difference from Hyperliquid?</strong> Everyone is talking about
              Hyperliquid for trading. But Hyperliquid is not regulated — it doesn't follow SEC
              rules. If the government decides to crack down, platforms like that could be in
              trouble. Ondo follows the rules. That's why big institutions like BlackRock use them.
            </p>
          </div>

          <ComparisonBox
            title="Ondo vs. Hyperliquid"
            good="Follows SEC regulations, backed by Wall Street"
            bad="Not regulated, could face legal issues"
            goodLabel="Ondo"
            badLabel="Hyperliquid"
          />

          <img
            src="/articles/ondo/defi-sec.jpg"
            alt="Decentralized finance and regulatory framework"
            className="w-full rounded-xl"
            style={{ maxHeight: 400, objectFit: "cover" }}
          />

          <p>
            Ondo's platform requires identity verification (KYC) — you need to prove who you are
            before you can trade. That might sound annoying, but it's actually a good thing. It
            means
            <strong> Wall Street trusts this platform</strong>. Regular DeFi platforms don't require
            this, which is exactly why institutions won't use them.
          </p>

          {/* === BY THE NUMBERS === */}
          <h2>Ondo by the Numbers</h2>
          <p>Let's look at what Ondo has already built:</p>

          <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
            <StatBar
              label="Tokenized stocks & ETFs available"
              value="430+"
              color="bg-primary"
              width="86%"
            />
            <StatBar
              label="People holding ONDO tokens"
              value="181,000+"
              color="bg-emerald-500"
              width="72%"
            />
            <StatBar
              label="Total trading volume"
              value="$1 Billion+"
              color="bg-amber-500"
              width="95%"
            />
            <StatBar
              label="BlackRock fund integration (BUIDL)"
              value="One of the largest holders"
              color="bg-blue-500"
              width="80%"
            />
          </div>

          <div className="highlight-box">
            <p>
              <strong>What do these numbers mean?</strong> 430+ tokenized assets means you could
              eventually buy hundreds of different stocks and ETFs on the blockchain. 181,000
              holders means real people are using this. And $1 billion in trading volume means the
              product actually works — it's not just an idea on paper.
            </p>
          </div>

          <img
            src="/articles/ondo/ondo-app.jpg"
            alt="Blockchain and cryptocurrency technology"
            className="w-full rounded-xl"
            style={{ maxHeight: 400, objectFit: "cover" }}
          />

          {/* === WHY ONDO IS DIFFERENT === */}
          <h2>4 Reasons Ondo Stands Out</h2>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                1
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Real Ownership, Not Just a Copy</h3>
                <p className="text-sm text-muted-foreground">
                  Most tokenized stocks in crypto are "fake" — they track the price but you don't
                  actually own anything. Ondo's stocks are backed by real DTC entitlements, which
                  means you have a real claim on actual securities. It's the difference between
                  owning a photo of gold and owning actual gold.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                2
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">The Biggest Names in Finance</h3>
                <p className="text-sm text-muted-foreground">
                  BlackRock (the world's largest asset manager), JPMorgan (America's biggest bank),
                  Goldman Sachs, and Vanguard are all involved. Ondo is one of the largest holders
                  of BlackRock's BUIDL tokenized fund. JPMorgan's infrastructure powers instant
                  redemptions. Plus connections with Circle, Coinbase, and Ripple.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                3
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Built for Regulation, Not Against It</h3>
                <p className="text-sm text-muted-foreground">
                  In crypto, most projects try to avoid regulators. Ondo does the opposite — it
                  builds <em>inside</em> SEC-approved frameworks. As governments around the world
                  tighten crypto rules, platforms that follow the rules will survive. Platforms that
                  don't might disappear overnight.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                4
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">Connecting Two Worlds</h3>
                <p className="text-sm text-muted-foreground">
                  Ondo is the bridge between Wall Street's $100+ trillion securities market and the
                  blockchain. It's not competing with other crypto projects — it's building the road
                  that lets traditional money flow into crypto. When institutions want to put real
                  assets on the blockchain, Ondo is the company they'll use.
                </p>
              </div>
            </div>
          </div>

          {/* === THE PRICE OPPORTUNITY === */}
          <h2>Why the Price Drop Might Be Misleading</h2>
          <p>Let's put the current price in perspective:</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/60 bg-card p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm font-medium">Price Today</span>
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">~$0.38</div>
              <div className="text-xs text-muted-foreground">82% below all-time high</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">All-Time High</span>
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">~$2.14</div>
              <div className="text-xs text-muted-foreground">Reached in December 2024</div>
            </div>
          </div>

          <p>
            Here's what's interesting: when ONDO was at $2.14, the technology was <em>less</em>{" "}
            mature than it is today. There were fewer partnerships, fewer tokenized assets, and DTCC
            hadn't even processed its first tokenized trade yet. Today, all of that has changed —
            but the price is 82% lower.
          </p>

          <div className="highlight-box">
            <p>
              <strong>The key question:</strong> Is it possible that the price hasn't caught up to
              the fundamentals yet? When the biggest financial institutions in the world are
              building on your technology, but the token is 82% below its peak — that's the kind of
              gap that creates opportunities. But remember: prices can always go lower, and nothing
              is guaranteed.
            </p>
          </div>

          {/* === TIMELINE === */}
          <h2>How We Got Here</h2>
          <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6">
            <TimelineEvent
              year="2024"
              event="Ondo launches tokenized US Treasury bonds (OUSG) backed by BlackRock's BUIDL"
              icon={<Building2 className="h-4 w-4" />}
            />
            <TimelineEvent
              year="Dec 2024"
              event="ONDO token reaches all-time high of $2.14 during tokenization hype"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <TimelineEvent
              year="2025"
              event="Crypto market pulls back; ONDO drops 82% despite improving fundamentals"
              icon={<TrendingDown className="h-4 w-4" />}
            />
            <TimelineEvent
              year="July 2025"
              event="DTCC processes first tokenized securities production trades with BlackRock, JPMorgan, Goldman Sachs, Vanguard"
              icon={<Zap className="h-4 w-4" />}
            />
            <TimelineEvent
              year="July 2025"
              event="Ondo launches CRCLon and SPYon — first tokenized stocks on DTC entitlements"
              icon={<Shield className="h-4 w-4" />}
            />
          </div>

          {/* === BOTTOM LINE === */}
          <h2>The Bottom Line</h2>
          <p>
            Ondo Finance is not just another crypto project making promises. It's building real
            infrastructure that the world's biggest financial institutions are already using:
          </p>

          <ul>
            <li>
              <strong>430+ tokenized stocks and ETFs</strong> ready for on-chain trading
            </li>
            <li>
              <strong>$1 billion+</strong> in trading volume — this product works
            </li>
            <li>
              <strong>BlackRock, JPMorgan, Goldman Sachs, and Vanguard</strong> are all involved
            </li>
            <li>
              <strong>DTCC integration</strong> — connected to the actual settlement system
            </li>
            <li>
              <strong>SEC-compliant</strong> — built for the regulated future of crypto
            </li>
          </ul>

          <p>
            The token is 82% below its all-time high, but the infrastructure is stronger than ever.
            In crypto, narratives change fast — but building the pipes that institutions will
            actually use is a differentiator that doesn't go away.
          </p>

          <div className="highlight-box">
            <p>
              <strong>The big picture:</strong> Tokenization isn't coming — it's already here. The
              DTCC has processed real trades. BlackRock has launched BUIDL. JPMorgan is providing
              settlement infrastructure. The question isn't whether tokenized assets will go
              mainstream. It's which platform will power that transition. Right now, Ondo is the
              front-runner.
            </p>
          </div>

          <div className="highlight-box">
            <p>
              <strong>Important:</strong> This article is for informational purposes only and does
              not constitute financial advice. Cryptocurrency investments carry significant risk,
              including the potential loss of your entire investment. Always do your own research
              and consider consulting with a financial advisor before making investment decisions.
              The prices and data mentioned are approximate and may have changed since writing.
            </p>
          </div>

          <p>
            Want to learn more? Check out the Ondo Finance website:{" "}
            <a
              href="https://ondo.finance/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              https://ondo.finance/
            </a>
          </p>
        </div>
      </motion.article>
    </>
  );
}
