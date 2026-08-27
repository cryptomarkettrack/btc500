import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { computeCycle } from "@/lib/phase";
import { btcPriceQuery, halvingQuery } from "@/lib/queries";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

const CLOSE_USD = 80_161.51;
const AUG18_USD = 64_680.71;
const MOVE_PCT = 27;
const SESSIONS = 9;
const EMA10 = 75_781.56;
const SMA200 = 69_224.09;
const SMA50 = 66_427.09;
const VWMA20 = 74_119.26;
const UB = 83_872.39;
const LB = 55_548.94;
const RSI = 82.2;
const ATR = 2_244;
const TARGET85 = 85_000;
const ENTRY_HIGH = 76_500;
const ENTRY_MID = 75_000;
const ENTRY_LOW = 73_500;
const STOP_72 = 72_500;

function formatM(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function Bitcoin80KBreakoutArticle({ title, date, readTime }: ArticleProps) {
  const { data: halving } = useSuspenseQuery(halvingQuery);
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
          <span>Market analysis, dated 27 August 2026</span>
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
            Bitcoin crossed <strong>$80,000</strong> for the first time in this cycle. The verified
            27 August 2026 close is <strong>$80,161.51</strong> — a <strong>+{MOVE_PCT}%</strong>{" "}
            move in just <strong>nine sessions</strong> off the 18 August base of $64,681. The
            technical read is genuinely bullish: a fresh golden cross, the 200-day SMA turning up
            from a four-month decline, and the strongest momentum in 90 days. But the honest verdict
            for an investor who is <em>not</em> already long is <strong>&ldquo;good trend, wrong
            entry.&rdquo;</strong> The official BTC500 buy date remains{" "}
            <strong>November 30, 2026</strong>.
          </p>

          <p>
            This article is written the way BTC500 writes everything: the tape is{" "}
            <em>weather</em>, the halving cycle is the <em>climate</em>, and a fixed rule — buy 500
            days before each halving, sell 500 days after — is the plan. None of the numbers below
            move that date. They only describe where the market sits relative to it, and where the
            risk lives for anyone who trades with indicators instead of a calendar.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Publication:</strong> market analysis for August 27, 2026, written from a
              multi-analyst BTC-USD technical report that ran a full bull vs. bear head-to-head and
              a consolidated verdict. Figures below refresh with the live BTC500 feed; the dated
              close and indicator readings remain as of 27 August 2026.
            </p>
          </div>

          <h2>What actually happened</h2>
          <p>
            For two and a half months Bitcoin sat in a <strong>$60,000&ndash;$68,000</strong>{" "}
            accumulation block. Then, beginning 19 August, it broke the top on rising volume and
            ran — from a $64,680.71 print on the 18th to $80,161.51 on the 27th,{" "}
            <strong>+{MOVE_PCT}% in {SESSIONS} sessions</strong>. The 21 August session posted the
            heaviest volume in 60 days, and the breakout extended on{" "}
            <strong>widening participation</strong>: higher short-term moving averages being chased
            up by the 20-day volume-weighted average is a hallmark of fresh bids joining the trend.
          </p>

          <div className="data-point">
            <strong>Close (27 Aug):</strong> {formatM(CLOSE_USD)}
          </div>
          <div className="data-point">
            <strong>{SESSIONS}-session move:</strong> +{MOVE_PCT}% from {formatM(AUG18_USD)} (18 Aug
            close)
          </div>
          <div className="data-point">
            <strong>Underlying base:</strong> the $60,000&ndash;$68,000 range held for about ten
            weeks, with June&rsquo;s low near $60,922
          </div>

          <h2>Why the bulls are structurally justified</h2>
          <p>
            There is a real difference between a trend that is stretched and a trend that is fake.
            This one has the components of a genuine regime change rather than a short squeeze:
          </p>
          <ul>
            <li>
              <strong>A fresh 10/50 golden cross</strong> printed around 19 August — the short-term
              moving average crossing cleanly above the medium-term one after months of chop. It has
              not failed yet.
            </li>
            <li>
              <strong>The 200-day SMA turned up.</strong> It was declining from roughly $84,000 in
              late April, carved a low near <strong>$68,981</strong> around 21 August, and is now
              inflecting higher with price sitting about <strong>15% above it</strong>. A
              flattening 200 SMA is the market&rsquo;s own admission that the average buyer over the
              last 200 days has been accumulating, not distributing.
            </li>
            <li>
              <strong>Momentum is expanding, not just printing.</strong> MACD flipped positive on 18
              August and its histogram is at the highest value in the 90-day lookback — the
              strongest run of bullish momentum since spring.
            </li>
            <li>
              <strong>Price cleared every major average.</strong> It trades above the 10 EMA, the 50
              SMA, and the 200 SMA at the same time, with all three sloping up.
            </li>
          </ul>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Indicator</th>
                  <th className="py-3 pr-4 font-semibold">27 Aug level</th>
                  <th className="py-3 font-semibold">State</th>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">10-day EMA</td>
                  <td className="py-3 pr-4">{formatM(EMA10)}</td>
                  <td className="py-3">Price +5.8% — bullish</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">50-day SMA</td>
                  <td className="py-3 pr-4">{formatM(SMA50)}</td>
                  <td className="py-3">Price +20.6% — bull regime</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">200-day SMA</td>
                  <td className="py-3 pr-4">{formatM(SMA200)}</td>
                  <td className="py-3">Turning up — long-term flip</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">20-day VWMA</td>
                  <td className="py-3 pr-4">{formatM(VWMA20)}</td>
                  <td className="py-3">Volume confirming the move</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">MACD histogram</td>
                  <td className="py-3 pr-4">+1,306</td>
                  <td className="py-3">90-day high, still expanding</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">RSI (14)</td>
                  <td className="py-3 pr-4">{RSI.toFixed(1)}</td>
                  <td className="py-3">Overbought — see the bear case</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Why the bears have a point too</h2>
          <p>
            A real trend can still be a bad place to <em>buy</em>. The bear case in the report is
            honest and specific, and it matters more for someone deploying new money than for
            someone already long:
          </p>
          <ul>
            <li>
              <strong>{SESSIONS} sessions with no pullback.</strong> The move was vertical, not
              measured. Vertical advances tend to re-test their breakout level before they
              continue.
            </li>
            <li>
              <strong>RSI is {RSI.toFixed(1)},</strong> above 70 since 19 August and as high as ~86
              on 21 August. That is overbought by any measure. Worse, RSI ticked lower while price
              made a higher high on 27 August (82.2 at $80,161 vs ~86 at ~$78,335 on 21 August) — a{" "}
              <em>mild bearish divergence</em>. Not a trend end by itself, but a yellow flag, not a
              green one.
            </li>
            <li>
              <strong>The volatility bands are asymmetric.</strong> The 20-day Bollinger upper band
              sits at <strong>{formatM(UB)}</strong> — just ~4.6% above price — while the lower band
              sits near <strong>{formatM(LB)}</strong>, ~31% below. The market&rsquo;s own pricing
              of near-term expected range is skewed heavily to the downside from here.
            </li>
            <li>
              <strong>The breakout level is unconfirmed.</strong> Nine sessions up 27% with no
              re-test means no one has yet proven the old $68,000 area holds as support on a dip.
            </li>
          </ul>

          <div className="highlight-box">
            <p>
              <strong>The resolution:</strong> these two cases are not contradictory. In the first,
              powerful leg of a new trend it is common for the <em>structure</em> to be bullish
              while the <em>entry</em> is poor. The honest read on 27 August is not
              &ldquo;bull&rdquo; or &ldquo;bear&rdquo; — it is what the report called it:{" "}
              <strong>HOLD</strong>. The move is real; the price to get long is wrong.
            </p>
          </div>

          <h2>Where the levels actually sit</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Your call</th>
                  <th className="py-3 pr-4 font-semibold">Level</th>
                  <th className="py-3 font-semibold">Why it matters</th>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Hard stop (daily close)</td>
                  <td className="py-3 pr-4">{formatM(EMA10)}</td>
                  <td className="py-3">Close below the 10 EMA breaks short-term structure.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Scale-in #1</td>
                  <td className="py-3 pr-4">{formatM(ENTRY_HIGH)}</td>
                  <td className="py-3">Ladder placed under / at the 10 EMA.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Scale-in #2</td>
                  <td className="py-3 pr-4">{formatM(ENTRY_MID)}</td>
                  <td className="py-3">Old breakout support + VWMA confluence.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Scale-in #3 (deep)</td>
                  <td className="py-3 pr-4">${ENTRY_LOW.toLocaleString()}</td>
                  <td className="py-3">Deeper re-test of the breakout zone, if it prints.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Stops on new entries</td>
                  <td className="py-3 pr-4">{formatM(STOP_72)}</td>
                  <td className="py-3">Below the entry ladder, on a closing basis.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Immediate upside</td>
                  <td className="py-3 pr-4">{formatM(UB)}</td>
                  <td className="py-3">Bollinger upper band — ~4.6% away.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Partial-profit target</td>
                  <td className="py-3 pr-4">{formatM(TARGET85)}</td>
                  <td className="py-3">Take ~25–30% off into strength.</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Thesis invalidation</td>
                  <td className="py-3 pr-4">{formatM(SMA200)}</td>
                  <td className="py-3">Close below the 200 SMA = the breakout failed.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="data-point">
            <strong>Why &ldquo;do not add at $80k&rdquo; is not the same as bearish:</strong> the
            trend is confirmed and a trend-follower should not fight it. But chasing a +27% vertical
            with a stop ~9.6% away is asymmetric risk for someone <em>starting</em> a position on 27
            August. A planned entry in the <strong>$74k&ndash;$76k</strong> zone converts roughly the
            same thesis into a much better ratio. Sizing should also shrink relative to mid-August:
            the ATR has expanded ~88% to about <strong>$2,244</strong> a day, so the same dollar
            position carries far more per-session noise.
          </div>

          <h2>Why the fixed date still beats the tape</h2>
          <p>
            Now the part that matters most on this site. Every number above is a reason the newsdesk
            will talk loudly this week — and none of it changes the BTC500 rule.{" "}
            <Link
              to="/articles/btc500-strategy"
              className="font-semibold text-primary underline"
            >
              The strategy
            </Link>{" "}
            buys on the calendar, not on the RSI. The official buy date — exactly 500 days before
            the projected <strong>April 2028</strong> halving — is <strong>{buyLabel}</strong>.
          </p>
          <p>
            What this breakout does change is the <em>character</em> of the wait. Our prior article
            called the summer range the likely base. A pullback into <strong>$74k&ndash;$76k</strong>{" "}
            now lines up neatly with the entry zone a patient buyer would prefer. If there is no
            pullback and price runs to <strong>$85,000</strong> and <strong>$90,000</strong>, those
            become backdrop noise — the November date still arrives with the calendar&rsquo;s honest
            arithmetic: <strong>past performance does not guarantee future results.</strong>
          </p>

          <div className="highlight-box">
            <p>
              In weakness: <strong>no new long should start above $80k.</strong> In strength: the{" "}
              <strong>10 EMA daily close</strong> is your line in the sand, and a close below the{" "}
              <strong>200 SMA at $69,224</strong> is the clearest sign the whole base was a head
              fake. In every case, the fixed date buys through the very noise the indicators are
              debating.
            </p>
          </div>

          <h2>Bottom Line</h2>
          <p>
            Do not chase a nine-session vertical through overbought air that is already ticking into
            a mild divergence. Do not fight the breakout either — it is the most constructive week
            of the cycle since spring, with volume confirmation and a turning 200-day average, the
            kind of ownership transfer that historically precedes a longer cycle. The one number a
            holder must respect is the daily close below <strong>$75,781 (10 EMA)</strong>; below
            it, the read is no longer &ldquo;fresh leg of a breakout.&rdquo;
          </p>
          <p>
            And behind all of it sits the crypto-as-asset class calendar:{" "}
            <strong>{buyLabel}</strong>. The tape gives news; the halving gives the plan.
          </p>

          <div className="strategy-box">
            <h3>See you in {cycle.daysUntilBuy} days.</h3>
            <p className="formula">{buyLabel} — the official BTC500 buy date</p>
            <p>
              Check the live{" "}
              <Link to="/" className="font-semibold text-primary underline">
                cycle countdown
              </Link>
              , read the{" "}
              <Link
                to="/articles/btc500-strategy"
                className="font-semibold text-primary underline"
              >
                BTC500 strategy
              </Link>
              , revisit{" "}
              <Link
                to="/articles/is-the-bottom-in"
                className="font-semibold text-primary underline"
              >
                Is the Bottom In?
              </Link>
              , and walk the{" "}
              <Link to="/timeline" className="font-semibold text-primary underline">
                timeline
              </Link>
              . The date is fixed. The plan is simple.
            </p>
          </div>

          <h2>Sources & notes</h2>
          <p>
            Technical levels and the bull/bear head-to-head draw on a TradingAgents daily report for
            BTC-USD dated 27 August 2026 — verified snapshot close $80,161.51; 10 EMA $75,781.56; 50
            SMA $66,427.09; 200 SMA $69,224.09; 20-day Bollinger upper $83,872.39 / lower $55,548.94;
            RSI(14) 82.2; ATR(14) ~$2,244, roughly 88% above mid-August&rsquo;s ~$1,194; VWMA(20)
            $74,119.26; 21 August session volume ~$74.5B, the heaviest of the advance. Companion
            BTC500 notes:{" "}
            <Link
              to="/articles/is-the-bottom-in"
              className="font-semibold text-primary underline"
            >
              Is the Bottom In?
            </Link>
            ,{" "}
            <Link
              to="/articles/why-bitcoin-pumped"
              className="font-semibold text-primary underline"
            >
              Why Bitcoin Pumped
            </Link>
            , and{" "}
            <Link
              to="/articles/bitcoin-week-ahead"
              className="font-semibold text-primary underline"
            >
              the week of 24–31 August
            </Link>
            . Figures are daily in nature and can be revised as exchanges and funds publish finals.{" "}
            <strong>BTC500 is educational software — this is not financial advice.</strong>
          </p>

          <h2>FAQ</h2>
          <div className="faq-list">
            <div>
              <h3>Is Bitcoin&rsquo;s $80,000 breakout real?</h3>
              <p>
                The structure says yes. The breakout came on the heaviest volume in 60 days, price
                cleared every major moving average, the 10/50 golden cross is intact, and the
                200-day SMA has turned up. What is unconfirmed is the <em>entry</em> — a +27% move
                with no pullback has not yet tested the old breakout level as support.
              </p>
            </div>
            <div>
              <h3>Should I buy Bitcoin at $80,000 right now?</h3>
              <p>
                Not as a chase. The ratio at that price is different from the same trend bought at a
                pullback. The consolidated team view was “hold”: keep existing exposure with a stop
                below the 10 EMA, and scale new money at $76k–$76.5k, then $75k, then $73.5k–$74k,
                with stops below $72,500.
              </p>
            </div>
            <div>
              <h3>What level invalidates this Bitcoin breakout?</h3>
              <p>
                For short-term structure, a daily close below the 10-day EMA near $75,781. For the
                whole thesis, a daily close below the 200-day SMA near $69,224. Shorting an intact
                trend is not a high-probability tactic even when the entry at $80k is poor. If a
                pullback reaches $68k–$72k with RSI resetting toward 40–50, that becomes the higher-
                conviction re-entry zone.
              </p>
            </div>
            <div>
              <h3>How overbought is Bitcoin in late August 2026?</h3>
              <p>
                RSI(14) is about 82 on 27 August — above 70 since 19 August and as high as ~86 on 21
                August. That is overbought but not the single-session blowoff that often marks a top.
                It is also flattening at fresh highs, a mild divergence worth honoring with tighter
                stops rather than a trigger to short.
              </p>
            </div>
            <div>
              <h3>What are Bitcoin&rsquo;s next upside targets?</h3>
              <p>
                The 20-day Bollinger upper band near $83,872 comes first, then round-number $85,000
                where trend followers often trim ~25–30%, then $90,000. If the breakout fails
                instead, the pool of stopped-out longs makes $68k–$72k the likely re-test zone.
              </p>
            </div>
            <div>
              <h3>Does this change the BTC500 buy date?</h3>
              <p>
                No. The official buy date remains {buyLabel} — exactly 500 days before the projected
                April 2028 halving. A pullback into $74k–$76k would sit attractively in front of that
                date, but the calendar does not move with the RSI. Past performance does not
                guarantee future results.
              </p>
            </div>
            <div>
              <h3>What is the BTC500 strategy?</h3>
              <p>
                Buy Bitcoin exactly 500 days before each halving, hold through the event, and sell
                exactly 500 days after. No indicators, no day trading — one fixed rule tracked
                publicly against historical cycle data. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}