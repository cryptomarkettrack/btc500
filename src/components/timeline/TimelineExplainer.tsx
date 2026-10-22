import { Link } from "@tanstack/react-router";

/**
 * Server-rendered editorial body for /timeline.
 *
 * The page is an interactive replay tool, so on its own the HTML is an app
 * shell. Google reported it as "Crawled - currently not indexed". This block
 * gives crawlers the same explanation the chart implies, in text.
 */

export const TIMELINE_FAQ = [
  {
    question: "What is the BTC500 Time Machine?",
    answer:
      "It is an interactive replay of Bitcoin's price around every halving. You pick a day inside a 500-day buy window, before or after the halving, and the tool shows what a fixed investment would be worth at that point. The current cycle and the previous realized cycle are shown side by side so the same day offset can be compared directly.",
  },
  {
    question: "Why is the current cycle empty?",
    answer:
      "The next buy window has not opened yet. BTC500 buys exactly 500 days before a halving, so until that date arrives there are no live days to plot for the current cycle. The previous cycle stays available and is marked as realized, because its sell date has already passed.",
  },
  {
    question: "What does Compare Same Day do?",
    answer:
      "It aligns the current cycle with the previous one at the same number of days from the halving. Day 200 of the current cycle lands on day 200 of the previous cycle, so a price path can be compared like for like instead of by calendar date.",
  },
  {
    question: "Are these returns adjusted for fees and taxes?",
    answer:
      "No. The timeline uses daily closing prices only. Exchange fees, bid-ask spreads, slippage and taxes are excluded, and they reduce real-world outcomes. The figures describe the price path, not a tradable result.",
  },
  {
    question: "Does the pattern repeat?",
    answer:
      "Four completed windows all finished higher than their buy price, but four observations is a small sample and the multiples have fallen in the last two cycles. Later cycles started from a higher price and produced smaller returns. The timeline shows what happened; it does not forecast the next window.",
  },
] as const;

const COMPLETED_WINDOWS = [
  {
    cycle: "2012 Halving",
    buy: "Jul 17, 2011",
    buyPrice: "$14",
    halving: "Nov 28, 2012",
    halvingPrice: "$13",
    sell: "Apr 12, 2014",
    sellPrice: "$421",
    total: "+2,890%",
  },
  {
    cycle: "2016 Halving",
    buy: "Feb 25, 2015",
    buyPrice: "$237",
    halving: "Jul 9, 2016",
    halvingPrice: "$654",
    sell: "Nov 21, 2017",
    sellPrice: "$8,114",
    total: "+3,318%",
  },
  {
    cycle: "2020 Halving",
    buy: "Dec 28, 2018",
    buyPrice: "$3,854",
    halving: "May 11, 2020",
    halvingPrice: "$8,605",
    sell: "Sep 23, 2021",
    sellPrice: "$44,981",
    total: "+1,067%",
  },
  {
    cycle: "2024 Halving",
    buy: "Dec 7, 2022",
    buyPrice: "$16,851",
    halving: "Apr 20, 2024",
    halvingPrice: "$64,894",
    sell: "Sep 2, 2025",
    sellPrice: "$111,190",
    total: "+560%",
  },
] as const;

export function TimelineExplainer() {
  return (
    <section
      aria-labelledby="timeline-explainer"
      className="mx-auto mt-12 max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground"
    >
      <h2 id="timeline-explainer" className="text-2xl font-bold tracking-tight text-foreground">
        What the BTC500 Time Machine shows
      </h2>
      <p>
        The time machine replays Bitcoin&apos;s price history around each halving. Pick any day
        inside the window and it shows what a fixed investment bought on the buy date would be worth
        on that day, using actual daily closes rather than a smoothed line. You can drag the slider,
        press play to watch the cycle unfold in order, or jump between the current cycle and the
        previous realized one.
      </p>
      <p>
        The point is not to make past cycles look inevitable. It is to show how much of the outcome
        came from the date you entered, how much came from the date you left, and how long the
        drawdowns in between actually lasted. A rule that looks obvious on a monthly chart is harder
        to hold when it is replayed one day at a time.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        How the 500-day window works
      </h2>
      <p>
        BTC500 measures one window around each halving. The buy date is{" "}
        <strong className="text-foreground">T-500</strong>, exactly 500 calendar days before the
        event. The sell date is <strong className="text-foreground">T+500</strong>, exactly 500
        calendar days after it. The window is about 1,000 days long and contains the halving itself,
        which sits roughly in the middle.
      </p>
      <p>
        Because the halving fires at a fixed block height rather than a fixed date, both ends of the
        window move as Bitcoin&apos;s average block time drifts. The tool uses recorded dates for
        completed halvings and a live estimate for the next one, so a projected window can shift
        while a realized one cannot.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        The four completed windows
      </h2>
      <p>
        Every window below is a real date and a real daily close. The final row is the only one
        where all three prices are confirmed.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">Cycle</th>
              <th className="py-2 pr-3 font-semibold">T-500 buy</th>
              <th className="py-2 pr-3 font-semibold">Halving</th>
              <th className="py-2 pr-3 font-semibold">T+500 sell</th>
              <th className="py-2 font-semibold">T-500 → T+500</th>
            </tr>
          </thead>
          <tbody>
            {COMPLETED_WINDOWS.map((row) => (
              <tr key={row.cycle} className="border-b border-border/40 last:border-0">
                <td className="py-2 pr-3 font-semibold text-foreground">{row.cycle}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {row.buy} <span className="text-muted-foreground">{row.buyPrice}</span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {row.halving} <span className="text-muted-foreground">{row.halvingPrice}</span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {row.sell} <span className="text-muted-foreground">{row.sellPrice}</span>
                </td>
                <td className="py-2 font-semibold text-green-500">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        Why one cycle is empty
      </h2>
      <p>
        The current window only fills in after its buy date passes. Until then the top card shows
        the pending buy date and no price path, which is a correct empty state rather than a broken
        chart. When the date arrives the card starts accumulating days automatically, and the
        comparison against the previous cycle becomes a like-for-like replay rather than a
        projection.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        What the numbers mean
      </h2>
      <ul className="ml-5 list-disc space-y-2">
        <li>
          <strong className="text-foreground">Day offset</strong> — how many days have passed since
          the buy date. Day 0 is the buy, day 500 is the halving, day 1,000 is the sell.
        </li>
        <li>
          <strong className="text-foreground">Portfolio</strong> — the coin quantity bought on day 0
          valued at the selected day&apos;s close. It is not a compounded return.
        </li>
        <li>
          <strong className="text-foreground">Realized</strong> — the window has closed and every
          price is confirmed history.
        </li>
        <li>
          <strong className="text-foreground">In progress</strong> — the window is open and the last
          value is the latest close, not an exit.
        </li>
      </ul>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        What the completed cycles had in common
      </h2>
      <p>
        Three things repeat across all four windows. First, every completed cycle finished above its
        T-500 buy price, and the halving itself was never the low point of the window — price was
        usually already well above the buy date by the time the block reward halved. Second, every
        window contained a drawdown after entry, so the replay shows red days before it shows the
        result. Third, the multiplier fell each time: the 2016 window returned more than the 2020
        window, which returned more than 2024. A fixed rule can keep working while producing a
        smaller payoff.
      </p>
      <p>
        What did not repeat is the shape. The time from buy date to the cycle high differed every
        time, which is why a fixed T+500 exit and a discretionary exit are not the same strategy.
        The replay exists to make that difference visible: press play and watch how long the
        position spent underwater before it recovered.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        Limits of the comparison
      </h2>
      <p>
        Four completed cycles is a small sample, and they are not independent events — each one
        priced in the aftermath of the last. The tool also ignores exchange fees, spreads, taxes and
        the practical problem of buying a large position on a single day. Treat it as a record of
        what the calendar did, not as evidence about what it will do next.
      </p>
      <p>
        For the full T-500 and T+500 methodology see the{" "}
        <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary hover:underline">
          Bitcoin 500-day cycle
        </Link>
        , run the same dates in the{" "}
        <Link to="/simulator" className="font-semibold text-primary hover:underline">
          simulator
        </Link>
        , or read the{" "}
        <Link to="/articles/btc500-strategy" className="font-semibold text-primary hover:underline">
          strategy
        </Link>{" "}
        and the{" "}
        <Link to="/halving-dates" className="font-semibold text-primary hover:underline">
          halving dates
        </Link>
        .
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        BTC500 Time Machine — frequently asked questions
      </h2>
      <dl className="space-y-4">
        {TIMELINE_FAQ.map((item) => (
          <div key={item.question}>
            <dt className="font-semibold text-foreground">{item.question}</dt>
            <dd className="mt-1">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
