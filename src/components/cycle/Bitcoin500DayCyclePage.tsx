import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  ChevronDown,
  LineChart,
} from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { trackCta } from "@/lib/analytics";
import { CYCLE_FAQ } from "@/lib/cycle-faq";
import { formatSignedPercent, observeCycles } from "@/lib/cycle-stats";
import { formatIsoDay, formatUsd } from "@/lib/format";
import { computeCycle } from "@/lib/phase";
import { btcPriceQuery, halvingQuery, simulatorQuery } from "@/lib/queries";
import { isCycleComplete } from "@/lib/simulator-math";
import { CurrentCycleState } from "@/components/cycle/CurrentCycleState";
import type { CycleResult } from "@/lib/simulator.functions";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Bitcoin500DayCyclePage() {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const { data: simulator } = useSuspenseQuery(simulatorQuery);
  const priceRes = useQuery(btcPriceQuery);
  const now = useNow(60_000);

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );
  const stats = observeCycles(simulator.cycles);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5">
            <span className="block h-1.5 w-1.5 rounded-[1px] bg-primary" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              The BTC500 window
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            Bitcoin <span className="text-primary">500-Day</span> Cycle
          </h1>
          <p className="lead mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            BTC500 tracks Bitcoin&apos;s historical performance from 500 days before each halving
            through 500 days after it.
          </p>
        </header>

        <CurrentCycleState
          cycle={cycle}
          price={priceRes.data?.price ?? null}
          height={halving.height}
          nextHalvingBlock={halving.nextHalvingBlock}
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/simulator"
            onClick={() => trackCta("pillar_hero", "/simulator")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <Calculator className="h-4 w-4" />
            Explore the BTC500 Simulator
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/timeline"
            onClick={() => trackCta("pillar_hero", "/timeline")}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <LineChart className="h-4 w-4" />
            View the Bitcoin Timeline
          </Link>
        </div>

        <WhatIsSection />
        <HistoricalSection cycles={simulator.cycles} />
        <ObservationsSection cycles={simulator.cycles} stats={stats} />
        <BuySection cycleBuyDate={cycle.buyDate} />
        <SellSection cycleSellDate={cycle.sellDate} />
        <FaqSection />
        <FinalCta />

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Historical prices from the on-site daily archive. Past performance does not guarantee
          future results. Nothing on this page is financial advice.
        </p>
      </main>
    </div>
  );
}

function WhatIsSection() {
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="what-is-heading"
    >
      <h2 id="what-is-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        What is the Bitcoin 500-day cycle?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>
          Bitcoin cuts the miner block reward in half every 210,000 blocks — roughly every four
          years. BTC500 does not try to pick the exact bottom or top of that cycle. It measures one
          fixed window around the event and shows what historically happened inside it.
        </p>
        <p>
          <strong className="text-foreground">T-500</strong> is the calendar day 500 days before a
          halving. <strong className="text-foreground">T+500</strong> is the calendar day 500 days
          after it. The window is about 1,000 days long. Cycles are compared by lining those two
          dates up across the 2012, 2016, 2020, and 2024 halvings, using the same daily price
          archive as the{" "}
          <Link to="/simulator" className="font-semibold text-primary hover:underline">
            simulator
          </Link>
          .
        </p>
        <p>
          The 500-day span is a simple, auditable rule — not an optimized curve-fit. It is long
          enough to include the pre-halving stretch and most of the historical post-halving advance,
          and short enough to leave the later drawdown outside the window. Other windows exist. This
          one is published so it can be checked.
        </p>
        <p>
          Historical performance is not a guarantee of future results. Four halvings is a small
          sample. Later cycles have produced smaller multiples as Bitcoin matured. The next window
          can be better, worse, or fail.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <TermCard
          term="T-500"
          title="500 days before"
          body="The buy date in the BTC500 rule. Price on this day is the window’s starting print."
        />
        <TermCard
          term="Halving"
          title="Reward cut"
          body="The block-height event that halves new issuance. BTC500 records the price on that date too."
        />
        <TermCard
          term="T+500"
          title="500 days after"
          body="The sell date in the BTC500 rule. If that day has not arrived, the window is still open."
        />
      </div>
    </motion.section>
  );
}

function TermCard({ term, title, body }: { term: string; title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
        {term}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function HistoricalSection({ cycles }: { cycles: CycleResult[] }) {
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="historical-heading"
    >
      <h2 id="historical-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        Historical Bitcoin halving cycles
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Each row is a real date and a daily close from BTC500&apos;s price archive. Missing prices
        stay blank — they are not filled in. Replay the same windows on the{" "}
        <Link to="/timeline" className="font-semibold text-primary hover:underline">
          Bitcoin timeline
        </Link>
        .
      </p>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <caption className="sr-only">
              Bitcoin price at T-500, the halving, and T+500 for each completed BTC500 cycle
            </caption>
            <thead className="border-b border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Cycle</th>
                <th className="px-5 py-3">T-500</th>
                <th className="px-5 py-3">Halving</th>
                <th className="px-5 py-3">T+500</th>
                <th className="px-5 py-3">Price at T-500</th>
                <th className="px-5 py-3">Price at halving</th>
                <th className="px-5 py-3">Price at T+500</th>
                <th className="px-5 py-3">T-500 → halving</th>
                <th className="px-5 py-3">T-500 → T+500</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((row) => (
                <tr key={row.halvingDate} className="border-b border-border/40 last:border-0">
                  <th scope="row" className="px-5 py-3.5 font-semibold text-foreground">
                    {row.label}
                    {!isCycleComplete(row) && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Open
                      </span>
                    )}
                  </th>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatIsoDay(row.buyDate)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatIsoDay(row.halvingDate)}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatIsoDay(row.sellDate)}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {row.buyPrice != null ? formatUsd(row.buyPrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {row.halvingPrice != null ? formatUsd(row.halvingPrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {row.sellPrice != null ? formatUsd(row.sellPrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    <Signed value={row.toHalvingPercent} />
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    <Signed value={row.returnPercent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cycles.map((row) => (
          <article
            key={`${row.label}-card`}
            className="rounded-[24px] border border-border/60 bg-card p-5"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {row.label}
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Halving" value={formatIsoDay(row.halvingDate)} />
              <Row label="T-500" value={formatIsoDay(row.buyDate)} />
              <Row label="T+500" value={formatIsoDay(row.sellDate)} />
              <Row
                label="T-500 price"
                value={row.buyPrice != null ? formatUsd(row.buyPrice) : "—"}
              />
              <Row
                label="Halving price"
                value={row.halvingPrice != null ? formatUsd(row.halvingPrice) : "—"}
              />
              <Row
                label="T+500 price"
                value={row.sellPrice != null ? formatUsd(row.sellPrice) : "—"}
              />
            </dl>
          </article>
        ))}
      </div>
    </motion.section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Signed({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const color = value > 0 ? "var(--success)" : value < 0 ? "var(--destructive)" : undefined;
  return <span style={{ color }}>{formatSignedPercent(value)}</span>;
}

function ObservationsSection({
  cycles,
  stats,
}: {
  cycles: CycleResult[];
  stats: ReturnType<typeof observeCycles>;
}) {
  const completed = cycles.filter(isCycleComplete);

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="observations-heading"
    >
      <h2 id="observations-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        What happened historically?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {stats.completedCount === 0 ? (
          <p>
            Completed T-500 to T+500 prices are not available yet for this dataset, so there is
            nothing to summarize.
          </p>
        ) : (
          <>
            <p>
              {stats.completedCount} completed{" "}
              {stats.completedCount === 1 ? "window" : "windows"} in this archive
              {stats.allCompletedPositive
                ? " finished higher at T+500 than at T-500"
                : " have a recorded T-500 and T+500 price"}
              {stats.averageReturnPercent != null && (
                <>
                  . The simple average of those window returns is{" "}
                  <strong className="text-foreground">
                    {formatSignedPercent(stats.averageReturnPercent)}
                  </strong>
                </>
              )}
              . That average is a description of a small sample, not a forecast.
            </p>
            {stats.largest && stats.smallest && stats.largest !== stats.smallest && (
              <p>
                The largest completed multiple was the{" "}
                <strong className="text-foreground">{stats.largest.label}</strong> (
                {formatSignedPercent(stats.largest.returnPercent)}). The smallest was the{" "}
                <strong className="text-foreground">{stats.smallest.label}</strong> (
                {formatSignedPercent(stats.smallest.returnPercent)}). After the earliest windows,
                later cycles started at a higher Bitcoin price and the same rule produced a
                smaller multiple.
              </p>
            )}
            <p>
              {stats.toHalvingCompletedCount > 0
                ? stats.allToHalvingPositive
                  ? "In every cycle with both a T-500 print and a halving-day print, Bitcoin was also higher on the halving date than at T-500. That still left a large share of the full-window move for the months after the event in the completed samples."
                  : "The move from T-500 to the halving date was not uniformly positive. The table above is the record; it is not an argument that the next pre-halving stretch must rise."
                : "Halving-day prices are incomplete in this dataset, so the first half of the window is not summarized here."}
            </p>
            <p>
              Between T+500 and the next T-500 the rule is in cash. That gap historically covered
              the 2018 and 2022 drawdowns. It also means the rule did not own Bitcoin in those
              stretches. Compare the same dates against buy-and-hold in the simulator before
              treating the cash window as an advantage.
            </p>
          </>
        )}
      </div>

      {completed.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Completed windows"
            value={`${stats.completedCount}`}
            hint="T-500 and T+500 both printed"
          />
          <StatTile
            label="Average window return"
            value={formatSignedPercent(stats.averageReturnPercent)}
            hint="Simple mean, not a forecast"
          />
          <StatTile
            label="Largest completed window"
            value={stats.largest ? formatSignedPercent(stats.largest.returnPercent) : "—"}
            hint={stats.largest?.label ?? ""}
          />
        </div>
      )}
    </motion.section>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card px-5 py-5 text-center">
      <div className="text-2xl font-bold text-primary sm:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function BuySection({ cycleBuyDate }: { cycleBuyDate: Date }) {
  const buyLabel = cycleBuyDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="buy-heading"
    >
      <h2 id="buy-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        When to buy Bitcoin before the halving?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>
          BTC500’s historical entry is T-500 — 500 days before the next estimated halving. The live
          date for the current cycle is <strong className="text-foreground">{buyLabel}</strong>. It
          will move if blocks run faster or slower than ten minutes.
        </p>
        <p>
          That date is a rule, not a claim that it is the best day, the cheapest day, or the right
          day for a given person. Some investors buy earlier. Some wait until after the event. The
          point of publishing T-500 is that it can be backtested. Open the simulator on a $500 or
          $1,000 starting amount to see what that rule did in previous windows.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/simulator"
          search={{ amount: 500 }}
          onClick={() => trackCta("pillar_buy", "/simulator")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          <Calculator className="h-4 w-4" />
          Simulate $500 at T-500
        </Link>
        <Link
          to="/articles/btc500-strategy"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold transition-all hover:border-primary/40 hover:text-primary"
        >
          <BookOpen className="h-4 w-4" />
          Read the strategy
        </Link>
      </div>
    </motion.section>
  );
}

function SellSection({ cycleSellDate }: { cycleSellDate: Date }) {
  const sellLabel = cycleSellDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="sell-heading"
    >
      <h2 id="sell-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        When to sell Bitcoin after the halving?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>
          BTC500’s historical exit is T+500. For the current estimated halving that date is{" "}
          <strong className="text-foreground">{sellLabel}</strong>. The rule does not sell before
          the halving and does not trail a moving average. It uses one calendar date.
        </p>
        <p>
          T+500 is not a forecast of the cycle top. In some completed windows price was still
          advancing at that point; in others the strongest months were already behind it. Selling
          then also means sitting out until the next T-500. That is a tradeoff, not a guarantee.
          Nothing on this site is financial advice.
        </p>
      </div>
      <div className="mt-6">
        <Link
          to="/halving-dates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <CalendarDays className="h-4 w-4" />
          See every buy, halving, and sell date
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.section>
  );
}

function FaqSection() {
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="cycle-faq-heading"
    >
      <div className="mb-8 text-center">
        <h2 id="cycle-faq-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Direct answers about T-500, T+500, and what the historical record actually shows.
        </p>
      </div>
      <div className="mx-auto max-w-3xl space-y-3">
        {CYCLE_FAQ.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-border/60 bg-card open:shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
              <h3 className="flex-1 text-sm font-semibold text-foreground sm:text-base">
                {item.question}
              </h3>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </motion.section>
  );
}

function FinalCta() {
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
    >
      <div className="rounded-[32px] border border-border/60 bg-card p-10 text-center sm:p-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Try the BTC<span className="text-primary">500</span> Simulator
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          See what an investment made 500 days before previous Bitcoin halvings would have done.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/simulator"
            onClick={() => trackCta("pillar_final", "/simulator")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Calculator className="h-4 w-4" />
            Open the simulator
          </Link>
          <Link
            to="/articles/bitcoin-week-ahead"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold transition-all hover:border-primary/40 hover:text-primary"
          >
            This week&apos;s outlook
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
