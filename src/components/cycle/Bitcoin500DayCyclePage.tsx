import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  LineChart,
} from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { trackCta } from "@/lib/analytics";
import { CYCLE_FAQ } from "@/lib/cycle-faq";
import { CALENDAR_PATH } from "@/lib/halving-calendar";
import { formatSignedPercent, observeCycles } from "@/lib/cycle-stats";
import { type CycleRisk, type RiskSummary, summarizeRisk } from "@/lib/cycle-risk";
import {
  TIMING_OFFSET_DAYS,
  describeOffset,
  summarizeTiming,
  type CycleTiming,
} from "@/lib/cycle-timing";
import { formatIsoDay, formatUsd } from "@/lib/format";
import { computeCycle } from "@/lib/phase";
import { btcPriceQuery, halvingQuery, simulatorQuery } from "@/lib/queries";
import { isCycleComplete } from "@/lib/simulator-math";
import { CurrentCycleState } from "@/components/cycle/CurrentCycleState";
import { CYCLE_DATASET_PATH } from "@/lib/cycle-dataset";
import { buildPillarSnippet } from "@/lib/pillar-snippet";
import type { CycleResult, SimulatorArchiveRange } from "@/lib/simulator.functions";

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
  const riskSummary = summarizeRisk(simulator.risk);
  // Same function the route head uses, so the title, description and first
  // sentence of the page cannot say different things about the date.
  const snippet = buildPillarSnippet({
    buyDateISO: cycle.buyDate.toISOString(),
    nowISO: now.toISOString(),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5">
            <span className="block h-1.5 w-1.5 rounded-[1px] bg-primary" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              The Bitcoin 500-day halving rule
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            Bitcoin <span className="text-primary">500-Day</span> Rule
          </h1>
          <p className="lead mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {snippet.lead}
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
        <RiskSection risk={simulator.risk} />
        <TimingSection timing={simulator.timing} />
        <BuySection cycleBuyDate={cycle.buyDate} />
        <SellSection cycleSellDate={cycle.sellDate} />
        <CitationSection archive={simulator.archive} riskSummary={riskSummary} />
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
        What is the Bitcoin 500-day rule?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>
          Bitcoin cuts the miner block reward in half every 210,000 blocks — roughly every four
          years. The Bitcoin 500-day rule is the fixed-window framing of that event: buy at T-500,
          exactly 500 days before the halving, and sell at T+500, exactly 500 days after it. BTC500
          does not try to pick the exact bottom or top of that cycle. It measures one fixed window
          around the event and shows what historically happened inside it.
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
              {stats.completedCount} completed {stats.completedCount === 1 ? "window" : "windows"}{" "}
              in this archive
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
                later cycles started at a higher Bitcoin price and the same rule produced a smaller
                multiple.
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

function RiskSection({ risk }: { risk: CycleRisk[] }) {
  const summary = summarizeRisk(risk);
  const worst = summary.worst;
  const rows = risk.filter((row) => row.buyPrice != null && row.lowPrice != null);

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="risk-heading"
    >
      <h2 id="risk-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        How deep did Bitcoin draw down inside the window?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {summary.analyzedCount === 0 || rows.length === 0 ? (
          <p>
            The price archive does not have enough daily closes yet to measure drawdowns inside the
            window. Nothing is estimated here.
          </p>
        ) : (
          <>
            <p>
              {summary.allBelowEntry ? (
                <>
                  In all {summary.analyzedCount} windows with a T-500 print in the archive, Bitcoin
                  closed below the entry price at least one day before the halving.
                </>
              ) : (
                <>
                  In {summary.belowEntryCount} of the {summary.analyzedCount} windows with a T-500
                  print in the archive, Bitcoin closed below the entry price at least one day before
                  the halving.
                </>
              )}{" "}
              {worst &&
                worst.buyPrice != null &&
                worst.lowPrice != null &&
                worst.lowDate != null &&
                worst.lowVsEntryPercent != null && (
                  <>
                    The deepest was the <strong className="text-foreground">{worst.label}</strong>:{" "}
                    {formatRiskPrice(worst.buyPrice)} at T-500, then a low close of{" "}
                    {formatRiskPrice(worst.lowPrice)} on {formatIsoDay(worst.lowDate)} —{" "}
                    {formatSignedPercent(worst.lowVsEntryPercent, 1)} from entry,{" "}
                    {formatDays(worst.daysEntryToLow)} later.
                  </>
                )}
            </p>
            <p>
              Across those windows the median lowest close was{" "}
              <strong className="text-foreground">
                {formatSignedPercent(summary.medianLowVsEntryPercent, 1)}
              </strong>{" "}
              below the T-500 price, and it arrived {formatDays(summary.medianDaysToLow)} after the
              buy. Before the halving, a holder sat below the entry price on a median of{" "}
              {formatDayCount(summary.medianDaysBelowEntryBeforeHalving)} daily closes — the 2012
              window is the extreme case, with almost the whole pre-halving stretch underwater.
            </p>
            <p>
              These are daily closes, so intraday lows were deeper than any number here. Where a
              window would start before the price archive does, the first available close is used as
              its entry. Four cycles is a small sample: the next window can trade below entry for
              longer, or not at all. A drawdown table is a description of the past, not a forecast
              and not advice.
            </p>
          </>
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-[24px] border border-border/60 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <caption className="sr-only">
                Lowest daily close after each T-500 entry, how long it took to arrive, and the worst
                close-to-close drawdown inside each BTC500 window
              </caption>
              <thead className="border-b border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Cycle</th>
                  <th className="px-5 py-3">T-500 entry</th>
                  <th className="px-5 py-3">Lowest close</th>
                  <th className="px-5 py-3">vs entry</th>
                  <th className="px-5 py-3">Days to low</th>
                  <th className="px-5 py-3">Closes below entry before halving</th>
                  <th className="px-5 py-3">Worst peak-to-trough close</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.halvingDate} className="border-b border-border/40 last:border-0">
                    <th scope="row" className="px-5 py-3.5 font-semibold text-foreground">
                      {row.label}
                    </th>
                    <td className="px-5 py-3.5 font-semibold">
                      {formatRiskPrice(row.buyPrice)}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {formatIsoDay(row.buyDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      {formatRiskPrice(row.lowPrice)}
                      {row.lowDate && (
                        <span className="ml-2 font-normal text-muted-foreground">
                          {formatIsoDay(row.lowDate)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      <SignedPercent value={row.lowVsEntryPercent} digits={1} />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDays(row.daysEntryToLow)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {row.daysBelowEntryBeforeHalving == null
                        ? "—"
                        : `${row.daysBelowEntryBeforeHalving} of ${row.observedDaysBeforeHalving}`}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatSignedPercent(row.maxDrawdownPercent, 1)}
                      {row.maxDrawdownDate && (
                        <span className="ml-1 text-xs">({formatIsoDay(row.maxDrawdownDate)})</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Median lowest close"
            value={formatSignedPercent(summary.medianLowVsEntryPercent, 1)}
            hint="vs the T-500 entry price"
          />
          <StatTile
            label="Deepest close below entry"
            value={worst ? formatSignedPercent(worst.lowVsEntryPercent, 0) : "—"}
            hint={worst?.label ?? ""}
          />
          <StatTile
            label="Median days to the low"
            value={formatDays(summary.medianDaysToLow)}
            hint="After the T-500 buy"
          />
        </div>
      )}

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Worst peak-to-trough close is the largest fall from a running high inside the window — what
        a holder who did not sell the high actually sat through. Compare the same dates with a
        different entry on the{" "}
        <Link to="/simulator" className="font-semibold text-primary hover:underline">
          simulator
        </Link>
        , or read{" "}
        <Link
          to="/when-to-sell-bitcoin-after-halving"
          className="font-semibold text-primary hover:underline"
        >
          what happened at each T+500 sell date
        </Link>
        .
      </p>
    </motion.section>
  );
}

function TimingSection({ timing }: { timing: CycleTiming[] }) {
  const summary = summarizeTiming(timing);
  const rows = timing.filter((row) => row.baselineMultiple != null);
  const earlier = summary.earlier;
  const later = summary.later;
  const thirtyEarlier = summary.offsets.find((row) => row.offsetDays === -30) ?? null;
  const thirtyLater = summary.offsets.find((row) => row.offsetDays === 30) ?? null;
  const hasComparison =
    rows.length > 0 &&
    earlier != null &&
    later != null &&
    thirtyEarlier != null &&
    thirtyLater != null &&
    earlier.cycleCount > 0;

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="timing-heading"
    >
      <h2 id="timing-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        Does the exact buy date matter?
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {!hasComparison ? (
          <p>
            The price archive does not cover enough days around T-500 to test alternative entry
            dates. Nothing is estimated here.
          </p>
        ) : (
          <>
            <p>
              The rule fixes one entry date, so the fair challenge is whether that date carries the
              result. This test keeps the T+500 exit where the rule puts it and moves only the entry
              — from 120 days earlier to 120 days later — then compares each completed-window
              multiple with the multiple from entering on T-500 itself.
            </p>
            <p>
              Every earlier entry in this archive did worse. In the {earlier.cycleCount} windows
              where the archive reaches back 120 days before T-500, a T-620 entry (120 days early)
              produced a smaller multiple in all {earlier.cycleCount} — median{" "}
              <strong className="text-foreground">
                {formatSignedPercent(earlier.medianVsT500Percent, 1)}
              </strong>
              , worst {formatSignedPercent(earlier.worstVsT500Percent, 1)} in the{" "}
              {earlier.worstLabel}. Thirty days early pointed the same way:{" "}
              {thirtyEarlier.worsenedCount} of {thirtyEarlier.cycleCount} windows lower, median{" "}
              {formatSignedPercent(thirtyEarlier.medianVsT500Percent, 1)}.
            </p>
            <p>
              Entering late was close to a coin flip for the first two months. A T-530 entry (30
              days after the signal) changed the multiple by{" "}
              {formatSignedPercent(thirtyLater.worstVsT500Percent, 1)} to{" "}
              {formatSignedPercent(thirtyLater.bestVsT500Percent, 1)} — higher in{" "}
              {thirtyLater.improvedCount} of {thirtyLater.cycleCount} windows, median{" "}
              <strong className="text-foreground">
                {formatSignedPercent(thirtyLater.medianVsT500Percent, 1)}
              </strong>
              . By 120 days late the median was {formatSignedPercent(later.medianVsT500Percent, 1)},
              lower in {later.worsenedCount} of {later.cycleCount}. Part of that is arithmetic: the
              exit stays fixed, so a later entry holds Bitcoin for fewer days.
            </p>
            <p>
              The exception is the 2012 window, where entering 120 days late would have produced{" "}
              {formatSignedPercent(later.bestVsT500Percent, 1)} more than the exact date. The
              archive begins on that window&apos;s T-500 itself (17 July 2011), so there is no
              earlier print to test, and the months after that entry included a fall from $14.07 to
              $2.30. That is the honest shape of this test: the date is not a knife-edge, but
              whether a nearby date beat it depended on what price did next — which no calendar
              could know in advance.
            </p>
            <p>
              This test covers {summary.cycleCount} completed windows, uses daily closes only, and
              ignores fees and taxes. A different four years could invert the pattern. It is a
              description of the past, not a forecast and not advice.
            </p>
          </>
        )}
      </div>

      {hasComparison && (
        <>
          <div className="mt-8 overflow-hidden rounded-[24px] border border-border/60 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[64rem] text-left text-sm">
                <caption className="sr-only">
                  Change in the completed-window multiple for each cycle when the BTC500 entry moves
                  from 120 days before T-500 to 120 days after it, with the T+500 exit fixed
                </caption>
                <thead className="border-b border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Cycle</th>
                    {TIMING_OFFSET_DAYS.map((offset) => (
                      <th key={offset} className="px-3 py-3 text-right">
                        {offset === 0 ? "T-500" : formatOffsetHeader(offset)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.halvingDate} className="border-b border-border/40 last:border-0">
                      <th scope="row" className="px-4 py-3.5 font-semibold text-foreground">
                        {row.label}
                      </th>
                      {TIMING_OFFSET_DAYS.map((offset) => {
                        const entry = row.entries.find((item) => item.offsetDays === offset);
                        return (
                          <td key={offset} className="px-3 py-3.5 text-right font-semibold">
                            {offset === 0 ? (
                              <span className="font-normal text-muted-foreground">base</span>
                            ) : entry?.vsT500Percent == null ? (
                              <span className="font-normal text-muted-foreground">—</span>
                            ) : (
                              <SignedPercent value={entry.vsT500Percent} digits={1} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-muted/20">
                    <th scope="row" className="px-4 py-3.5 font-semibold text-foreground">
                      Median
                    </th>
                    {summary.offsets.map((row) => (
                      <td
                        key={row.offsetDays}
                        className="px-3 py-3.5 text-right font-semibold text-muted-foreground"
                      >
                        {formatSignedPercent(row.medianVsT500Percent, 1)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatTile
              label="120 days early"
              value={formatSignedPercent(earlier.medianVsT500Percent, 1)}
              hint={`Median vs T-500 · ${earlier.worsenedCount} of ${earlier.cycleCount} worse`}
            />
            <StatTile
              label="30 days late"
              value={formatSignedPercent(thirtyLater.medianVsT500Percent, 1)}
              hint="Median vs T-500 · roughly a coin flip"
            />
            <StatTile
              label="120 days late"
              value={formatSignedPercent(later.medianVsT500Percent, 1)}
              hint={`Median vs T-500 · ${later.worsenedCount} of ${later.cycleCount} worse`}
            />
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Each column is an offset from T-500 in calendar days — for example {describeOffset(-60)}{" "}
            means entering at T-560. “Base” is the exact T-500 entry the rule publishes; “—” means
            the archive has no print for that day. Compare any two dates yourself in the{" "}
            <Link to="/simulator" className="font-semibold text-primary hover:underline">
              simulator
            </Link>
            , or see what each window cost to hold in the{" "}
            <Link
              to="/when-to-sell-bitcoin-after-halving"
              className="font-semibold text-primary hover:underline"
            >
              sell-date record
            </Link>
            .
          </p>
        </>
      )}
    </motion.section>
  );
}

function formatOffsetHeader(offset: number): string {
  return offset < 0 ? `−${Math.abs(offset)}` : `+${offset}`;
}

function formatRiskPrice(value: number | null): string {
  if (value == null) return "—";
  const digits = Math.abs(value) < 100 ? 2 : 0;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDays(value: number | null): string {
  if (value == null) return "—";
  const rounded = Math.round(value);
  return `${rounded} ${rounded === 1 ? "day" : "days"}`;
}

function formatDayCount(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value)}`;
}

function SignedPercent({ value, digits = 0 }: { value: number | null; digits?: number }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const color = value > 0 ? "var(--success)" : value < 0 ? "var(--destructive)" : undefined;
  return <span style={{ color }}>{formatSignedPercent(value, digits)}</span>;
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
          day for a given person. Some investors buy earlier. Some wait until after the event.{" "}
          <a href="#timing-heading" className="font-semibold text-primary hover:underline">
            The timing test above
          </a>{" "}
          shows what missing T-500 by up to four months did in each completed window. The point of
          publishing T-500 is that it can be backtested — open the simulator on a $500 or $1,000
          starting amount to see what that rule did.
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
        <a
          href={CALENDAR_PATH}
          download
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold transition-all hover:border-primary/40 hover:text-primary"
        >
          <CalendarPlus className="h-4 w-4" />
          Add {buyLabel} to your calendar
        </a>
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
      <div className="mt-6 flex flex-wrap gap-5">
        <Link
          to="/when-to-sell-bitcoin-after-halving"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <CalendarDays className="h-4 w-4" />
          Every historical sell date, explained
          <ArrowRight className="h-4 w-4" />
        </Link>
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

function CitationSection({
  archive,
  riskSummary,
}: {
  archive?: SimulatorArchiveRange;
  riskSummary: RiskSummary;
}) {
  const range =
    archive?.firstDate && archive.lastDate ? `${archive.firstDate} to ${archive.lastDate}` : null;
  const rows = archive?.rows ? archive.rows.toLocaleString("en-US") : null;
  const year = archive?.lastDate?.slice(0, 4) ?? "2026";
  const median = riskSummary.medianLowVsEntryPercent;
  const quotable =
    riskSummary.allBelowEntry && median != null
      ? `In all ${riskSummary.analyzedCount} completed BTC500 windows, Bitcoin closed below its T-500 entry price at some point; the median lowest close was ${Math.abs(median).toFixed(1)}% below entry.`
      : null;

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mt-20"
      aria-labelledby="method-heading"
    >
      <h2 id="method-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
        Method, data and how to cite this page
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Every figure above is computed from the same daily-close archive that powers the simulator.
        Nothing is hand-entered, and a day with no print is left out rather than interpolated.
      </p>

      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
        <dl className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Data source
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              BTC500&apos;s own Bitcoin daily-close archive
              {rows ? ` — ${rows} daily closes` : ""}
              {range ? `, ${range}` : ""}, in USD.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Windows
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              T-500 and T+500 are 500 calendar days before and after each halving date, taken from
              the protocol block heights (210,000 / 420,000 / 630,000 / 840,000).
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Drawdowns
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              The lowest close inside the window against the T-500 close. Only daily closes are
              available, so intraday lows were deeper than shown — every drawdown here is a lower
              bound.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Timing test
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">
              The T+500 exit stays fixed and the entry moves ±120 days. Each row is the change in
              the T+500 multiple against the exact T-500 entry.
            </dd>
          </div>
        </dl>

        {quotable ? (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              The finding in one sentence
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{quotable}</p>
          </div>
        ) : null}

        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Cite this as
          </p>
          <code className="mt-2 block rounded-xl bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
            BTC500 ({year}). “Bitcoin 500-Day Cycle: T-500 to T+500 record, 2011–{year}”.
            https://btc500.net/bitcoin-500-day-cycle
          </code>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Machine-readable copy, updated daily and open to any origin:{" "}
          <a href={CYCLE_DATASET_PATH} className="font-semibold text-primary hover:underline">
            /data/500-day-cycles.json
          </a>{" "}
          — entry, halving and exit closes, per-window drawdowns, the timing deltas and the method
          above. Historical observations only; past performance does not guarantee future results.
        </p>
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
