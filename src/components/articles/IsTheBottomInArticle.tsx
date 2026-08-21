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

const ATH_USD = 126_198.07;
const ATH_LABEL = "October 6, 2025";
const JUNE_LOW_USD = 58_566;
const BOX_LOW_USD = 54_000;
const BOX_HIGH_USD = 64_000;
const FLIP_715 = 71_500;
const FLIP_78 = 78_000;
const FLIP_82 = 82_000;

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function IsTheBottomInArticle({ title, date, readTime }: ArticleProps) {
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
  const liveDrawdown =
    livePrice != null && livePrice > 0 ? ((ATH_USD - livePrice) / ATH_USD) * 100 : null;
  const juneDrawdown = ((ATH_USD - JUNE_LOW_USD) / ATH_USD) * 100;
  const bounceFromJune =
    livePrice != null && livePrice > 0 ? ((livePrice - JUNE_LOW_USD) / JUNE_LOW_USD) * 100 : null;
  const above715 =
    livePrice != null && livePrice > 0 ? livePrice >= FLIP_715 : null;
  const above78 =
    livePrice != null && livePrice > 0 ? livePrice >= FLIP_78 : null;
  const above82 =
    livePrice != null && livePrice > 0 ? livePrice >= FLIP_82 : null;

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
          <span>Updated August 21, 2026</span>
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
            Yes — the low is in the <strong>$54,000–$64,000</strong> box. Bitcoin closed 30 June
            at <strong>$58,566</strong> and spent the summer there. On 20 August it smashed
            through a stack of bear-market resistances into the $70,000s. That is the start of a{" "}
            <strong>soft bull</strong>, not the all-clear. <strong>$71,500</strong> is being
            tested. <strong>$78,000</strong> and <strong>$82,000</strong> still have to flip. The{" "}
            <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
              Bitcoin 500-day cycle
            </Link>{" "}
            buy date does not move: <strong>{buyLabel}</strong>. Not financial advice.
          </p>

          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/is-the-bottom-in/og-is-the-bottom-in.svg"
              alt="Is the bottom for Bitcoin in? Verdict as of 21 August 2026: the $54k–$64k box was the low. Soft bull now. Confirmation at $78k then $82k. BTC500 buy date 30 November 2026."
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
              The box was the low. $71,500 is the first flip. $78,000 then $82,000 confirm the
              bull. The buy date is still a calendar, not a wick.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Verdict, 21 August 2026:</strong> the summer base between $54,000 and
              $64,000 was the cycle low. The ladder from here is $71,500, then $78,000, then
              $82,000. We are in a soft bull — the transition, not the trophy. A weekly hold
              above $71,500 is the next proof. $78,000 and $82,000 still have to flip before
              the bull is fully confirmed. Past performance does not guarantee future results.
            </p>
          </div>

          <h2>The tape on 21 August 2026</h2>
          <p>
            Bitcoin set its record at <strong>$126,198</strong> on {ATH_LABEL}. It then spent
            ten months grinding lower. The closing low of this drawdown is{" "}
            <strong>$58,566 on 30 June 2026</strong> — inside the $54k–$64k accumulation box.
            VanEck&apos;s 18 August ChainCheck treats that June print near{" "}
            <strong>$58,500</strong> as a potential trough. Price then spent July and early
            August in a tight band around the low-$60,000s, which is the top of the same box.
          </p>
          <p>
            On{" "}
            <Link
              to="/articles/why-bitcoin-pumped"
              className="font-semibold text-primary underline"
            >
              19 August
            </Link>{" "}
            Bitcoin tagged about <strong>$69,700</strong> after the U.S. Treasury doubled
            long-end buybacks and roughly <strong>$1.1–$1.4 billion</strong> of shorts were
            liquidated. CoinMarketCap shows a 20 August close of <strong>$73,033</strong>.
            Cointelegraph reported more than <strong>$3 billion</strong> of crypto short
            liquidations as Bitcoin neared $72,000. That two-day candle walked through the
            resistances that had capped the entire summer.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Snapshot</th>
                  <th className="py-3 font-semibold">Figure</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">All-time high</td>
                  <td className="py-3">$126,198 · {ATH_LABEL}</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Closing low so far</td>
                  <td className="py-3">
                    $58,566 · 30 June 2026 (−{formatPct(juneDrawdown)} from ATH) · inside the
                    $54k–$64k box
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">19 August session high</td>
                  <td className="py-3">~$69,700 (CoinDesk / Bitcoin.com)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">20 August close</td>
                  <td className="py-3">$73,033 (CoinMarketCap)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Live BTC500 spot</td>
                  <td className="py-3">
                    {livePrice != null ? formatUsd(livePrice) : "Live price loading…"}
                    {liveDrawdown != null ? ` · ${formatPct(liveDrawdown)} below ATH` : ""}
                    {bounceFromJune != null
                      ? ` · +${formatPct(bounceFromJune)} off the June close`
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">BTC500 buy date</td>
                  <td className="py-3">
                    {buyLabel}
                    {cycle.phase === "wait-buy" ? ` · ${cycle.daysUntilBuy} days` : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>The map: box, then three flips</h2>
          <p>
            The structure is a box and three doors. The box is roughly{" "}
            <strong>${BOX_LOW_USD.toLocaleString()}–${BOX_HIGH_USD.toLocaleString()}</strong> —
            the summer base, and the buying area through July. Above it, the weekly candle of
            19–20 August punched through about $64,500, $68,000, and $71,800 in one go. Next
            come <strong>$78,000</strong> and then <strong>$82,000</strong>. Until $82,000
            flips, this is a soft bull, not a finished regime change.
          </p>
          <p>
            That is a structure call, not a new price target. The low is in. Two or three
            doors still have to open before the bull is fully confirmed.
          </p>
          <p>
            The box is the part that already happened. The June close of $58,566 sits inside it.
            July and early August never left it. The people who waited for $40,000–$50,000 —
            Galaxy&apos;s Q4 base, the 77% washout template, the “30% below the 200-week”
            analog — were waiting for a wick the market did not deliver. That is the{" "}
            <Link
              to="/articles/bear-market-accumulation"
              className="font-semibold text-primary underline"
            >
              consensus bottom trap
            </Link>{" "}
            in real time: the crowded map was $40k–$50k in September. The print was $58,566 in
            June.
          </p>

          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/is-the-bottom-in/confirmation-ladder.svg"
              alt="Bitcoin confirmation ladder, 21 August 2026: $54k–$64k box done, $71,500 being tested, $78,000 next, $82,000 opens the bull."
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
              Confirmation is a sequence. The box is done. $71,500 is the live test. $78,000
              and $82,000 are still ahead.
            </figcaption>
          </figure>

          <h2>The confirmation ladder</h2>
          <p>
            A flip here means trade significantly above the level, or post a{" "}
            <strong>weekly close</strong> above it. Tagging a number mid-week after a
            liquidation cascade is the first half of that test. The week still has to close.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Level</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 font-semibold">Status · 21 August</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">$54,000–$64,000 box</td>
                  <td className="py-3 pr-4">The low. Summer base. June close inside it.</td>
                  <td className="py-3">Done. $58,566 is the print.</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">$71,500</td>
                  <td className="py-3 pr-4">
                    First flip. Daily 200 EMA sat near $71,700 on 20 August.
                  </td>
                  <td className="py-3">
                    {above715 == null
                      ? "Live test — weekly close still due"
                      : above715
                        ? "Traded through. Weekly close still due."
                        : "Not holding on this print. Weekly close still due."}
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">$78,000</td>
                  <td className="py-3 pr-4">
                    Regime-shift close. 21Shares wanted this area on a weekly basis back in
                    June. Glassnode&apos;s True Market Mean was ~$75,800 on 19 August.
                  </td>
                  <td className="py-3">
                    {above78 ? "Traded through. Weekly close still due." : "Not yet."}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">$82,000</td>
                  <td className="py-3 pr-4">
                    Full bull above this line.
                  </td>
                  <td className="py-3">
                    {above82 ? "Traded through. Weekly close still due." : "Not yet."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="data-point">
            <p>
              <strong>Soft bull means transition, not trophy.</strong> Saying the bear is over{" "}
              <em>and</em> that $78,000 and $82,000 still have to flip is the same sentence:
              the low is in, the bull is not fully confirmed. That is the honest read of the
              chart. Live spot on this page is{" "}
              {livePrice != null ? formatUsd(livePrice) : "loading"}.
            </p>
          </div>

          <h2>Why this week counts</h2>
          <p>
            The last 72 hours are the event that moved the structure. We already wrote the 19
            August tape:{" "}
            <Link
              to="/articles/why-bitcoin-pumped"
              className="font-semibold text-primary underline"
            >
              Treasury long-end buybacks, a $1.4 billion short squeeze, ETF inflows, a White
              House crypto meeting
            </Link>
            . SoSoValue figures for 19 August show U.S. spot Bitcoin ETFs taking in about{" "}
            <strong>$517 million</strong> that day and about <strong>$1.21 billion</strong> over
            30 days. Cointelegraph then printed more than $3 billion of short liquidations as
            price neared $72,000.
          </p>
          <p>
            Forced covering is not a cycle by itself. It is how a boxed-in market leaves the
            box. The 200-day moving average that VanEck had near <strong>$69,884</strong> on 12
            August — when spot was still 9% below it — has been reclaimed. As of 20 August the
            50-day SMA sat at $63,976 and the 200-day at $69,005, with Bitcoin trading above
            both. That is the golden-cross setup. It is not the golden cross until it prints
            and holds.
          </p>
          <p>
            Independent on-chain maps rhyme with the same ladder. CryptoGoos&apos;s rule is the
            clean version: two weekly closes above short-term-holder realized price confirm a
            new bull; a single breakout that fails is the 2018 analog. Captain Altcoin noted
            Bitcoin had already broken above that short-term-holder cost basis during this
            move. One weekly close is a start. Two are the regime.
          </p>
          <p>
            Elite wallets were already accumulating inside the box —{" "}
            <Link to="/articles/strongest-hands" className="font-semibold text-primary underline">
              90 addresses holding 10,000+ BTC
            </Link>{" "}
            hit a six-month high on 11 August. CryptoQuant via Bloomberg showed wallets
            excluding exchanges and miners adding about 43,000 BTC over 60 days. The strongest
            hands bought the box. The squeeze is what forced everyone else to notice.
          </p>

          <h2>What this does not erase</h2>
          <p>
            A shallower trough was the live assumption before this week. VanEck fired 8 of 12
            capitulation signals as of 12 August and said this cycle should not copy 2022
            because there has been no Celsius, no Three Arrows, and no FTX. They still placed
            the historical transition in September through November. The box says the low
            already printed inside that window&apos;s left edge.
          </p>
          <p>
            The BTC500{" "}
            <Link to="/bear-market" className="font-semibold text-primary underline">
              bear-market composite
            </Link>{" "}
            still does not look like 2018 or 2022. Mid-August snapshot: MVRV 1.22 (historical
            bottoms were under 1.0), NUPL still positive, Puell 0.74 (not miner capitulation),
            drawdown about 40% at live spot versus 77–85% at prior troughs. RHODL and Reserve
            Risk were already in the green band. Read that as this cycle being shallower — the
            VanEck point — not as a reason to wait for $29,000. Primary on-chain flushes are a
            2018/2022 template. This week is a structure break, not a 77% replica.
          </p>
          <p>
            Galaxy&apos;s $40,000–$46,000 Q4 base, Cowen&apos;s late September, Brandt&apos;s ~4
            October, and CryptoQuant&apos;s September–November cluster are still the crowded
            desk view. They are the map of people who need another leg down. If the box was the
            low, that wick does not arrive. The calendar is not useless: it is when{" "}
            <em>they</em> expected the low. It is also when BTC500 buys.
          </p>

          <h2>Invalidation is on the same chart</h2>
          <p>
            A thesis without a kill switch is a slogan. The kill switch is the box.
          </p>
          <ul>
            <li>
              <strong>Weekly close back inside $54,000–$64,000</strong>, especially below
              $64,500, turns this candle into a bear-market rally. Soft bull on pause.
            </li>
            <li>
              <strong>Weekly close below the 30 June print of $58,566</strong> ends “the bottom
              is in.” Then the Q4 camp gets its second chance.
            </li>
            <li>
              <strong>Rejection at $78,000 without a weekly hold above $71,500</strong> is a
              failed flip, not a new bear by itself. It puts the squeeze back in the “weather”
              column until the next weekly close.
            </li>
            <li>
              <strong>Jackson Hole is 27–29 August.</strong> A mid-week squeeze does not
              pre-clear a Fed weekend. The weekly close after that symposium is the first real
              $71,500 test.
            </li>
          </ul>

          <h2>You still do not need the exact wick</h2>
          <p>
            Buyers who sat in the $54k–$64k box through July already have the low. Four-year-cycle
            buyers marked September and October and are still waiting. BTC500 does neither. The
            rule is one line, and it does not move because a two-day candle was violent:
          </p>

          <div className="strategy-box">
            <h3>BTC500</h3>
            <p className="formula">
              Buy 500 days before the halving
              <br />
              Sell 500 days after
            </p>
            <p>
              Official buy date: <strong>{buyLabel}</strong>
              {cycle.phase === "wait-buy" ? ` · ${cycle.daysUntilBuy} days` : ""}
            </p>
            <p>
              If the box was the low, {buyLabel} is still early-bull. If $78,000 rejects and
              the box breaks, the date is still the date. Past performance does not guarantee
              future results. Educational software, not financial advice.
            </p>
          </div>

          <p>
            That is the point of a calendar. Structure can be right and you can still be early,
            late, or emotional. The{" "}
            <Link to="/simulator" className="font-semibold text-primary underline">
              simulator
            </Link>{" "}
            runs the windows against real prices. The{" "}
            <Link to="/bear-market" className="font-semibold text-primary underline">
              bear-market page
            </Link>{" "}
            is the live composite. The{" "}
            <Link to="/" className="font-semibold text-primary underline">
              homepage
            </Link>{" "}
            cycle score rolls price path, drawdown, phase, and on-chain heat into one number so
            you do not have to relitigate every candle.
          </p>

          <h2>What to watch next</h2>
          <ul>
            <li>
              <strong>This week&apos;s close versus $71,500.</strong> Trade through it is not
              enough. The weekly close is.
            </li>
            <li>
              <strong>A weekly hold, then $78,000.</strong> That is the 21Shares regime-shift
              line and the next door on the ladder.
            </li>
            <li>
              <strong>$82,000.</strong> Full bull above this line. Until then it is a soft bull.
            </li>
            <li>
              <strong>Spot follow-through after the shorts are gone.</strong> ETF prints that
              stay bid. Forced covering is one-and-done.
            </li>
            <li>
              <strong>The box.</strong> Lose it on a weekly close and this page&apos;s verdict
              is wrong.
            </li>
            <li>
              <strong>The date.</strong> Nothing here moves {buyLabel}.
            </li>
          </ul>

          <h2>Sources for the 21 August tape</h2>
          <p>
            Structure: weekly BTCUSDT map — $54k–$64k summer box, then $71,500 / $78,000 /
            $82,000. Price: Forbes Advisor, 20 August 2026 (ATH $126,198 on 6 October 2025);
            24/7 Wall St., 10 August 2026 (30 June close $58,566); CoinMarketCap 20 August close
            $73,033; Cointelegraph, 20 August (short liquidations past $3 billion). On-chain
            and cycle: VanEck Mid-August 2026 Bitcoin ChainCheck (Matthew Sigel, 18 August);
            Glassnode True Market Mean ~$75,800 and short-term holder cost basis ~$68,500 as of
            19 August; BTC500 BitView composite. Flows: SoSoValue 19 August ETF dashboard.
            Macro: Federal Reserve Bank of Kansas City, Jackson Hole 27–29 August 2026. Prior
            BTC500 notes:{" "}
            <Link
              to="/articles/why-bitcoin-pumped"
              className="font-semibold text-primary underline"
            >
              Why Bitcoin Pumped
            </Link>
            ,{" "}
            <Link
              to="/articles/bitcoin-week-ahead"
              className="font-semibold text-primary underline"
            >
              week of 17–23 August
            </Link>
            . Figures can be revised as exchanges and funds publish finals.
          </p>

          <h2>FAQ</h2>
          <div className="faq-list">
            <div>
              <h3>Is the bottom for Bitcoin in as of 21 August 2026?</h3>
              <p>
                Yes — in the $54,000–$64,000 box. The closing low is $58,566 on 30 June 2026.
                Bitcoin is in a soft-bull transition after smashing through summer resistances
                on 19–20 August. Full confirmation is a weekly hold above $71,500, then $78,000,
                then $82,000. The BTC500 buy date remains 30 November 2026.
              </p>
            </div>
            <div>
              <h3>What was the Bitcoin low in 2026?</h3>
              <p>
                The lowest closing print in this drawdown is $58,566 on 30 June 2026, about 54%
                below the 6 October 2025 record of $126,198. That print sits inside the
                $54,000–$64,000 accumulation box. VanEck describes a potential trough near
                $58,500 on the same date.
              </p>
            </div>
            <div>
              <h3>What levels confirm the Bitcoin bull market?</h3>
              <p>
                Three flips, in order: $71,500 (trade significantly above it or a weekly close
                above it), $78,000 (same rule; the regime-shift close), and $82,000 (full bull
                above this line). Until $82,000 flips, call it a soft bull.
              </p>
            </div>
            <div>
              <h3>What would invalidate this Bitcoin bottom call?</h3>
              <p>
                A weekly close back inside the $54,000–$64,000 box, especially below $64,500,
                pauses the soft-bull read. A weekly close below the 30 June print of $58,566
                ends “the bottom is in.” Rejection at $78,000 without a weekly hold above
                $71,500 is a failed flip, not automatically a new bear.
              </p>
            </div>
            <div>
              <h3>Does this change the BTC500 buy date?</h3>
              <p>
                No. The official buy date remains {buyLabel} — 500 days before the projected
                April 2028 halving. If the box was the low, that date is still early-bull. If
                the box breaks, the date is still the date. Past performance does not guarantee
                future results.
              </p>
            </div>
            <div>
              <h3>What is the BTC500 strategy?</h3>
              <p>
                Buy Bitcoin exactly 500 days before each halving, hold through the event, and
                sell exactly 500 days after. No indicators, no day trading — one fixed rule
                tracked publicly against historical cycle data. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}
