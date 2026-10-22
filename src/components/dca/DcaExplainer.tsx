import { Link } from "@tanstack/react-router";

/**
 * Server-rendered editorial body for /dca.
 *
 * The page is a calculator, so the raw HTML is mostly inputs and empty result
 * slots. Google reported the URL as "Crawled - currently not indexed". This
 * block explains the model in text so the page stands on its own.
 */

export const DCA_FAQ = [
  {
    question: "Is DCA better than lump sum for Bitcoin?",
    answer:
      "Neither wins in general. Inside a fixed two-date window the answer depends on the price path between the two dates: spreading buys helps when price falls after the signal, and hurts when price rises. Across the completed BTC500 cycles the split is close to even, which is why this page reports the result per cycle instead of claiming a winner.",
  },
  {
    question: "Does the BTC500 rule itself use DCA?",
    answer:
      "No. BTC500 is defined as a single buy 500 days before the halving and a single sell 500 days after it. This page exists to test whether overriding that with a spread of orders would have improved the outcome, and to show that the answer is not consistent.",
  },
  {
    question: "How many days should the DCA window be?",
    answer:
      "There is no optimal number that holds across cycles. A short window (1–7 days) behaves almost like a lump sum and mostly changes execution risk. A long window (30–90 days) moves a meaningful part of the position away from the signal date, which is where the differences come from. The page defaults to 30 days as a middle setting, not as a recommendation.",
  },
  {
    question: "Are fees and taxes included?",
    answer:
      "No. The comparison uses daily closing prices and ignores exchange fees, bid-ask spreads, slippage and taxes. Those costs rise with the number of orders, so the real-world gap between a lump sum and a 30-day spread is slightly worse for the DCA side than the numbers shown here.",
  },
  {
    question: "Should I DCA into the next halving window?",
    answer:
      "That is a personal decision about behaviour and cash flow, not something the historical table settles. Spreading orders can make a large position easier to execute and easier to hold through a drawdown, but it also removes part of the position from the exact signal date. The tool shows the cost of that trade-off in past cycles so it can be judged with numbers rather than intuition.",
  },
] as const;

export function DcaExplainer() {
  return (
    <section
      aria-labelledby="dca-explainer"
      className="mx-auto mt-10 max-w-3xl space-y-5 px-1 text-sm leading-relaxed text-muted-foreground"
    >
      <h2 id="dca-explainer" className="text-2xl font-bold tracking-tight text-foreground">
        What this comparison actually measures
      </h2>
      <p>
        Two ways of entering the same trade. A <strong className="text-foreground">lump sum</strong>{" "}
        buys everything on the signal date and sells everything on the exit date. A{" "}
        <strong className="text-foreground">DCA</strong> spread splits the same total into equal
        daily orders across a number of days and uses the average price it paid. Both end up holding
        the same coin count target; the difference is the entry and exit price they achieved.
      </p>
      <p>
        That means the question is not &ldquo;is dollar-cost averaging good?&rdquo; It is narrower:
        inside a fixed window with a known start and a known end, did spreading orders add or remove
        value? The table above answers that per cycle for whatever amount and day counts you choose.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        Why the window changes the answer
      </h2>
      <p>
        BTC500 fixes both ends of the trade in advance: buy at T-500, sell at T+500. A DCA spread
        moves part of the position off those dates, so its result depends on which direction price
        moved immediately after the signal.
      </p>
      <ul className="ml-5 list-disc space-y-2">
        <li>
          If price <strong className="text-foreground">falls</strong> after the buy signal, a spread
          buys more of the position cheaper and beats the lump sum.
        </li>
        <li>
          If price <strong className="text-foreground">rises</strong> after the buy signal, a spread
          pays progressively more and loses to the lump sum.
        </li>
        <li>
          On the exit side the effect mirrors: selling into a falling market beats selling all at
          once, and selling into a rising market loses to it.
        </li>
      </ul>
      <p>
        Because the four completed cycles had very different paths off the buy date, the winner
        flips between them. A strategy that wins in two cycles and loses in two is not a rule — it
        is a coin flip with extra steps, fees and admin.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        How the numbers are calculated
      </h2>
      <ol className="ml-5 list-decimal space-y-2">
        <li>
          The investment amount is divided into equal daily slices across the chosen buy days.
        </li>
        <li>
          Each slice is filled at that day&apos;s closing price. Days without a price are skipped
          and the day count drops accordingly, which is why some cycles show fewer days used.
        </li>
        <li>
          The average price paid is the arithmetic mean of the slices, not the price on the first or
          last day.
        </li>
        <li>
          The same logic is applied to the sell side; a sell-days value of 0 means the whole
          position exits on the signal date.
        </li>
        <li>
          The multiplier is average sell price divided by average buy price, and the return is that
          multiplier applied to the amount entered.
        </li>
      </ol>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        The costs a backtest hides
      </h2>
      <p>
        Every extra order has a cost the daily-close model does not see. Exchange fees are charged
        per fill, the spread is crossed each time, and a large order placed in slices can move the
        book. On the tax side, more fills usually means more lots, more records and — depending on
        jurisdiction — more taxable events. None of that appears in the multiplier above, and all of
        it leans against the DCA side of the comparison.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        When spreading orders is the right call
      </h2>
      <p>
        DCA is usually chosen for reasons the table cannot score. A position that is too large to
        execute in one order, cash that arrives in instalments, or a holder who would abandon the
        plan after a single bad fill are all legitimate reasons to spread. In those cases the
        comparison is not &ldquo;which made more money&rdquo; but &ldquo;which version of this plan
        actually gets completed.&rdquo; A slightly lower multiplier that you finish beats a higher
        one you exit early.
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        Limits of this model
      </h2>
      <p>
        Prices are daily closes, fees and taxes are excluded, and four completed cycles is a small
        sample. The tool also assumes the full amount is available on day one, which is precisely
        the situation DCA is meant to avoid. Read the result as a description of the price path, not
        as a forecast for the next window.
      </p>
      <p>
        For the underlying dates see{" "}
        <Link to="/halving-dates" className="font-semibold text-primary hover:underline">
          Bitcoin halving dates
        </Link>
        , replay the cycles day by day in the{" "}
        <Link to="/timeline" className="font-semibold text-primary hover:underline">
          time machine
        </Link>
        , or run a single entry and exit in the{" "}
        <Link to="/simulator" className="font-semibold text-primary hover:underline">
          simulator
        </Link>
        .
      </p>

      <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
        DCA vs lump sum — frequently asked questions
      </h2>
      <dl className="space-y-4">
        {DCA_FAQ.map((item) => (
          <div key={item.question}>
            <dt className="font-semibold text-foreground">{item.question}</dt>
            <dd className="mt-1">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
