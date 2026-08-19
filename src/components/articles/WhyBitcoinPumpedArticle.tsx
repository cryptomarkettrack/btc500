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

export function WhyBitcoinPumpedArticle({ title, date, readTime }: ArticleProps) {
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
          <span>Updated August 19, 2026</span>
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
            Bitcoin pumped on <strong>August 19, 2026</strong> because a Treasury liquidity
            announcement hit a market already stacked with shorts. Price jumped about{" "}
            <strong>6–7%</strong> from the mid-$64,000s, reclaimed <strong>$68,000</strong>, and
            tagged a session high near <strong>$69,700</strong>. Ethereum, Solana, and the broader
            crypto book followed. This page is a living explainer — dated facts stay, later
            developments get appended.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Living article.</strong> First published August 19, 2026. We will add new
              facts here instead of forking a new URL every time the tape rips. Price and cycle
              figures below refresh with the live BTC500 feed. Commentary stays dated. This is
              market context for the{" "}
              <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
                Bitcoin 500-day cycle
              </Link>
              , not a reason to move the November 30, 2026 buy date. Not financial advice.
            </p>
          </div>

          <h2>What happened on August 19, 2026</h2>
          <p>
            Bitcoin spent weeks trapped roughly between <strong>$61,500 and $65,000</strong>.
            Implied volatility had already collapsed — we covered that in{" "}
            <Link
              to="/articles/bitcoin-volatility"
              className="font-semibold text-primary underline"
            >
              Bitcoin Volatility Is Gone
            </Link>
            . Quiet ranges invite leverage. When a real catalyst arrives, that leverage becomes
            fuel.
          </p>
          <p>
            During U.S. morning hours on Wednesday, August 19, Bitcoin broke the range. It
            reclaimed <strong>$68,000</strong>, printed as high as about{" "}
            <strong>$69,700–$69,749</strong> (CoinDesk and Bitcoin.com), then eased back toward{" "}
            <strong>$68,500</strong>. Ethereum reclaimed <strong>$2,000</strong> and traded near{" "}
            <strong>$2,080</strong>, up roughly <strong>9%</strong>. Solana traded near{" "}
            <strong>$81</strong> and XRP near <strong>$1.06</strong>, each up around{" "}
            <strong>6%</strong>. CoinDesk later showed BTC around <strong>$68,200</strong>{" "}
            (+5.6%) with ETH around <strong>$2,079</strong> (+8.9%).
          </p>
          <p>
            Earlier the same day, Bitcoin was still near <strong>$64,700</strong> while Iran
            formally rejected a temporary U.S. ceasefire and the Strait of Hormuz remained closed.
            The geopolitical tape was a headwind. The liquidity tape overrode it.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Snapshot · Aug 19, 2026</th>
                  <th className="py-3 font-semibold">Reported figure</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Bitcoin session high</td>
                  <td className="py-3">~$69,700–$69,749 (CoinDesk / Bitcoin.com)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Bitcoin after the wick</td>
                  <td className="py-3">~$68,500, about +5.5% to +7% on the day</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Ethereum</td>
                  <td className="py-3">Reclaimed $2,000; ~$2,080, about +9%</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Solana / XRP</td>
                  <td className="py-3">~$81 and ~$1.06, both about +6%</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Short liquidations</td>
                  <td className="py-3">~$1.1–$1.4B in a few hours (CoinGlass)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 pr-4">Traders liquidated (24h)</td>
                  <td className="py-3">About 114,500 accounts (CoinGlass via Bitcoin.com)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Live BTC500 spot</td>
                  <td className="py-3">
                    {livePrice != null ? formatUsd(livePrice) : "Live price loading…"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Why Bitcoin pumped: the five drivers</h2>
          <p>
            No single headline moved the whole book. Five things stacked. The Treasury move lit
            the fuse. Positioning turned it into a squeeze. Spot demand, policy theater, and a
            day-old SEC proposal kept buyers from fading the first candle.
          </p>

          <h3>1. The Treasury doubled long-end bond buybacks</h3>
          <p>
            The U.S. Treasury said it would raise the maximum size of liquidity-support buybacks
            for longer-dated Treasury securities from <strong>$2 billion to at least $4 billion
            per operation</strong>. The larger operations cover 10-to-20-year and 20-to-30-year
            nominal coupons, take effect <strong>September 9</strong>, and run through{" "}
            <strong>November 4</strong>, the end of the current refunding quarter. Treasury
            published the change as press release <strong>sb0607</strong>.
          </p>
          <p>
            That is debt management, not Federal Reserve quantitative easing. The Treasury is
            adding demand for older, less-liquid long bonds after a violent sell-off — not
            printing reserves to buy the whole curve. Markets still treated it as a liquidity
            backstop. The 30-year yield had reached about <strong>5.33–5.34%</strong>, its
            highest since 2007. After the announcement it fell roughly <strong>9 basis
            points</strong> toward <strong>5.20%</strong>. The 10-year dropped about{" "}
            <strong>6 basis points</strong> to around <strong>4.65%</strong>.
          </p>
          <div className="data-point">
            <p>
              <strong>Why crypto cares:</strong> lower long-term yields make cash-like government
              debt less competitive with risk assets. Bitcoin trades that relationship in minutes.
              Call it “mini QE” if you want — the mechanism that mattered today was yields down,
              risk bid up.
            </p>
          </div>

          <h3>2. A $1.4 billion short squeeze did the rest</h3>
          <p>
            After weeks in a tight band, shorts were crowded. Once Bitcoin punched through{" "}
            <strong>$66,000</strong>, exchanges began force-closing undercollateralized short
            positions. Forced covering is market buy orders. Those buys hit the next stop cluster,
            which hits the next one.
          </p>
          <p>
            CoinGlass data, as reported by CoinDesk, showed about <strong>$1.4 billion</strong>{" "}
            in short liquidations over roughly four hours. Bitcoin.com, also citing CoinGlass,
            put total crypto liquidations near <strong>$1.48 billion</strong> in a 60-minute
            window, the majority shorts, with short losses in the{" "}
            <strong>$1.1–$1.3 billion</strong> range. About <strong>114,538</strong> traders
            were wiped out over the prior day. The sharpest part of the candle ran for 15 to 60
            minutes.
          </p>
          <p>
            That is why the move looked violent relative to the catalyst. A $2 billion increase
            in a future Treasury operation does not, by itself, buy $1.4 billion of Bitcoin. It
            changes the risk-free rate. Leverage does the rest. Our{" "}
            <Link to="/liquidation" className="font-semibold text-primary underline">
              liquidation dashboard
            </Link>{" "}
            is the live version of this tape.
          </p>

          <h3>3. Spot ETFs and whales were already buying</h3>
          <p>
            Squeezes fade unless someone wants the coins. Spot Bitcoin ETFs had already turned
            constructive before Wednesday’s wick. SoSoValue figures cited by Altcoin Buzz showed
            two consecutive inflow sessions and about <strong>$486 million</strong> in weekly
            Bitcoin ETF inflows. Cointelegraph reported a later session adding about{" "}
            <strong>$189 million</strong>, led by BlackRock’s IBIT at{" "}
            <strong>$143.6 million</strong> and Fidelity’s FBTC at{" "}
            <strong>$23.9 million</strong>, with August net inflows approaching{" "}
            <strong>$1 billion</strong>. Bitcoin.com separately flagged a{" "}
            <strong>$297.5 million</strong> BlackRock/Fidelity rebound earlier in the week.
            Ether ETFs had taken in about <strong>$102 million</strong> since August 17. XRP
            ETFs added about <strong>$5.8 million</strong>.
          </p>
          <p>
            On-chain, the largest holders flipped from sellers to buyers. CryptoQuant data,
            reported by Bloomberg on August 18, showed wallets excluding exchanges and miners
            adding about <strong>43,000 BTC</strong> over 60 days — roughly{" "}
            <strong>$2.75–$2.9 billion</strong> — after months of distribution. Buying resumed
            near <strong>$60,000</strong>. That matches the picture in{" "}
            <Link to="/articles/strongest-hands" className="font-semibold text-primary underline">
              90 Elite Bitcoin Wallets
            </Link>
            : the strongest hands were accumulating while retail was still in fear.
          </p>
          <p>
            The Crypto Fear and Greed Index had only climbed from <strong>27 to 41</strong> —
            still Fear — and total crypto market cap had recovered from about{" "}
            <strong>$2.16 trillion</strong> on August 1 to around <strong>$2.2 trillion</strong>{" "}
            before the surge. Crowded shorts plus quiet spot bids is how you get a vertical day
            that still does not feel like a bull market.
          </p>

          <h3>4. Washington put crypto in the same room</h3>
          <p>
            The same Wednesday, the White House hosted crypto, prediction-market, and traditional
            market executives at the Eisenhower Executive Office Building. President Donald Trump
            was expected to attend. So were SEC Chair <strong>Paul Atkins</strong>, CFTC Chair{" "}
            <strong>Michael Selig</strong>, Treasury Secretary <strong>Scott Bessent</strong>, and
            Commerce Secretary <strong>Howard Lutnick</strong>.
          </p>
          <p>
            Expected industry names included Coinbase, Ripple, Gemini, Robinhood, Polymarket,
            Kalshi, and Kraken, plus Andreessen Horowitz, Chainlink, Paradigm, and the Digital
            Chamber. Traditional-market attendees reported across Bloomberg, Bitcoin.com, and
            invite-list dispatches included NYSE, Nasdaq, CME Group, Intercontinental Exchange,
            and DTCC. The meeting is a precursor to Thursday’s first CFTC Innovation Advisory
            Committee session, titled{" "}
            <strong>“Crypto’s Regulatory Evolution: From Uncertainty to Clarity.”</strong>
          </p>
          <p>
            The CLARITY Act is still the legislative prize and still not done. Senate cloture
            sits on <strong>September 15</strong>, with passage odds quoted around{" "}
            <strong>19%</strong> in recent coverage. Congress is in recess until September. The
            meeting does not pass a bill. It tells a leveraged market that the administration is
            still courting the industry in public.
          </p>

          <h3>5. The SEC proposal and FOMC minutes set the backdrop</h3>
          <p>
            On August 18 the SEC formally proposed <strong>Regulation Crypto Assets</strong>{" "}
            (file <strong>S7-2026-27</strong>) after cancelling the August 14 vote we covered in{" "}
            <Link
              to="/articles/sec-cancels-regulation-crypto"
              className="font-semibold text-primary underline"
            >
              SEC Cancels Regulation Crypto Vote
            </Link>
            . The proposal creates two Securities Act exemptions for certain crypto investment
            contracts: a startup exemption of up to <strong>$5 million over four years</strong>,
            and a fundraising exemption of up to <strong>$75 million per 12 months</strong> with
            ongoing reports. That is a policy tailwind for the sector. It is not a Bitcoin
            purchase order. Bitcoin is already treated as a digital commodity in Atkins’
            taxonomy.
          </p>
          <p>
            Wednesday also brought the minutes of the July 28–29 FOMC. The committee held the
            funds rate at <strong>3.50%–3.75%</strong> on a <strong>9–3</strong> vote. Beth
            Hammack, Neel Kashkari, and Lorie Logan wanted a 25-basis-point hike — the first
            three-member directional dissent since September 2016. Ahead of the 2:00 p.m. ET
            release, CME FedWatch priced roughly a <strong>33%</strong> chance of a September
            hike and a <strong>67%</strong> chance of no change. The morning pump predates those
            minutes. The minutes still matter for whether the hawkish minority was isolated, and
            for yields after the Treasury bounce.
          </p>

          <h2>Ethereum and the rest of the market</h2>
          <p>
            This was not a Bitcoin-only squeeze. When funding, yields, and risk appetite flip
            together, high-beta crypto usually outruns BTC on the first day. Ethereum’s reclaim
            of <strong>$2,000</strong> after weeks of failing near <strong>$1,918</strong> is
            the cleanest example. Ether ETFs had already seen about <strong>$102 million</strong>{" "}
            in fresh inflows since August 17. Solana futures open interest had climbed back
            toward <strong>$5.2 billion</strong>, its highest since mid-July, before the
            breakout. Pump.fun’s PUMP token was among the loudest alts, with 24-hour volume up
            about <strong>30%</strong> in earlier session reports.
          </p>
          <p>
            Treat alt outperformance as confirmation of risk appetite, not as a new cycle thesis.
            The same leverage that squeezed shorts today will hunt longs if yields reverse or
            the White House meeting produces nothing traders can quote.
          </p>

          <h2>What this does not change</h2>
          <p>
            A 6–7% squeeze off a six-week range is weather. The{" "}
            <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary underline">
              Bitcoin 500-day cycle
            </Link>{" "}
            is the map. We are still in the wait-to-buy window. The official BTC500 buy date
            remains <strong>{buyLabel}</strong> — 500 days before the projected April 2028
            halving at block 1,050,000. The sell date is still about{" "}
            <strong>August 26, 2029</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                <tr className="border-b border-border/60">
                  <th className="py-3 pr-4 font-semibold">Live BTC price</th>
                  <td className="py-3">
                    {livePrice != null ? formatUsd(livePrice) : "Live price loading…"} (BTC500
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

          <p>
            Past completed cycles (2012, 2016, 2020) were profitable under the same buy/sell
            rule using historical Bitstamp prices. Past performance does not guarantee future
            results. A squeeze that fails to hold <strong>$66,900–$70,000</strong> is just
            another wick inside a bear-market range. Holding those levels on spot demand — ETFs,
            whales, not just forced covering — is the difference between a day trade and a
            regime change.
          </p>

          <div className="strategy-box">
            <h3>The rule did not move</h3>
            <p className="formula">Buy Nov 30, 2026 · Sell Aug 26, 2029</p>
            <p>
              One date. No leverage. No meeting to front-run.{" "}
              <Link to="/simulator" className="font-semibold underline">
                Run the simulator
              </Link>{" "}
              if you want the history, not the candle.
            </p>
          </div>

          <h2>What to watch next</h2>
          <ul>
            <li>
              <strong>Does $68,000–$70,000 hold after the squeeze?</strong> Forced buying is
              one-and-done. Spot ETF prints over the next two sessions will tell you if real
              demand followed.
            </li>
            <li>
              <strong>Treasury yields.</strong> If the 30-year heads back toward 5.30%+, the
              “mini QE” bid fades. Buybacks themselves do not start until September 9.
            </li>
            <li>
              <strong>FOMC minutes follow-through</strong> and the September 15–16 FOMC, the
              same week as CLARITY cloture.
            </li>
            <li>
              <strong>Thursday’s CFTC Innovation Advisory Committee</strong> and any readout
              from the White House meeting.
            </li>
            <li>
              <strong>Geopolitics.</strong> Hormuz and the Iran stalemate did not drive today’s
              bid. They can still undo it.
            </li>
          </ul>

          <h2>Update log</h2>
          <p>
            This section is the changelog. New facts get a dated bullet here and, if they
            change the story, a new dated heading above. Do not rewrite August 19 out of
            existence.
          </p>
          <ul>
            <li>
              <strong>August 19, 2026 — initial publish.</strong> Documented the Treasury
              long-end buyback doubling, the CoinGlass short squeeze, ETF/whale bid, White
              House crypto meeting, August 18 SEC Regulation Crypto Assets proposal, and the
              July FOMC-minutes backdrop. Session high ~$69,700; later ~$68,500.
            </li>
          </ul>

          <h2>Sources for the August 19 tape</h2>
          <p>
            Price and liquidation prints: CoinDesk live coverage, Bitcoin.com market desk,
            CoinGlass. Treasury operations: U.S. Treasury press release sb0607; yield reaction
            via Reuters/Bitcoin.com. ETF flows: SoSoValue as cited by Altcoin Buzz and
            Cointelegraph. Whale balances: CryptoQuant via Bloomberg (August 18). Policy:
            SEC release 2026-76 / file S7-2026-27; Federal Reserve July 28–29 materials;
            Bloomberg and Bitcoin.com on the White House attendee list. Sentiment: Crypto Fear
            and Greed Index. Figures can be revised as exchanges and funds publish finals.
          </p>

          <h2>FAQ</h2>
          <div className="faq-list">
            <div>
              <h3>Why did Bitcoin pump on August 19, 2026?</h3>
              <p>
                The U.S. Treasury doubled the size of long-end bond buybacks, yields fell, and
                about $1.1–$1.4 billion of leveraged shorts were liquidated. Spot Bitcoin ETF
                inflows, whale accumulation, a White House crypto meeting, and the day-old SEC
                Regulation Crypto Assets proposal added fuel. The squeeze did the vertical work.
              </p>
            </div>
            <div>
              <h3>Did the Fed cut rates?</h3>
              <p>
                No. The July 28–29 FOMC held rates at 3.50%–3.75% on a 9–3 vote. August 19
                released those minutes. The market catalyst was Treasury buybacks and
                positioning, not a rate cut.
              </p>
            </div>
            <div>
              <h3>Are Treasury buybacks the same as quantitative easing?</h3>
              <p>
                No. Buybacks are a Treasury debt-management tool that improve liquidity in
                older long-term bonds. QE is a Federal Reserve program that expands the
                central-bank balance sheet. Traders still treated larger buybacks as extra
                demand for duration — hence the “mini QE” label.
              </p>
            </div>
            <div>
              <h3>Does this change the BTC500 buy date?</h3>
              <p>
                No. The official buy date is still November 30, 2026 — 500 days before the
                projected April 2028 halving. A one-day squeeze does not move the cycle rule.
                Past performance does not guarantee future results.
              </p>
            </div>
            <div>
              <h3>Will this page be updated?</h3>
              <p>
                Yes. New facts go in the update log, and material follow-through gets a new
                dated section. The August 19 snapshot stays so the original tape is not
                overwritten.
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}
