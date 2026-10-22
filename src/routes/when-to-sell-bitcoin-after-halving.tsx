import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Calculator,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  MinusCircle,
  TrendingUp,
} from "lucide-react";
import { estimateFromHalvingInfo, estimateHalvingInfo } from "@/lib/btc.functions";
import { buildHalvingCycles, cycleDisplayLabel } from "@/lib/halvings";
import { halvingQuery, simulatorQuery } from "@/lib/queries";
import {
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";

const PATH = "/when-to-sell-bitcoin-after-halving";
const LAST_REVIEWED = "2026-10-21";

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

const FAQ = [
  {
    question: "When do you sell Bitcoin after a halving?",
    answer:
      "Under the BTC500 rule, Bitcoin is sold exactly 500 calendar days after the halving (T+500). For the 2024 halving on April 20, 2024, the sell date was September 2, 2025. For the next projected halving in April 2028, the estimated sell date is in August 2029 — the exact live date is shown at the top of this page and moves with the block-height estimate.",
  },
  {
    question: "Should you sell Bitcoin before the halving?",
    answer:
      "The BTC500 rule does not sell before the halving. It buys 500 days before the event, holds through it, and sells 500 days after. Selling early would break the rule and make the historical comparison meaningless. Whether selling early is right for you depends on your own circumstances; this page is educational, not financial advice.",
  },
  {
    question: "Has selling 500 days after the halving been profitable?",
    answer:
      "Every completed BTC500 window in the on-site archive finished higher at T+500 than at T-500. The 2012, 2016, 2020, and 2024 windows all closed positive. Four observations are a small sample and past performance does not guarantee future results.",
  },
  {
    question: "Why 500 days after the halving?",
    answer:
      "Five hundred days is a fixed, auditable window. It is long enough to include the halving and most of the historical post-halving advance, and short enough to leave the later drawdown outside the trade. It is not an optimized top-picking signal.",
  },
  {
    question: "What if the next halving date moves?",
    answer:
      "The next halving is triggered by block height 1,050,000, not a fixed calendar date. BTC500 estimates the date from live block height and the protocol schedule, then sets T+500 from that estimate. If the halving arrives earlier or later, the sell date moves with it.",
  },
  {
    question: "Is T+500 the same as the Bitcoin cycle top?",
    answer:
      "No. T+500 is a fixed exit date, not a prediction of the highest price. In some cycles price was still rising at that point; in others the strongest months were already behind it. BTC500 publishes the date so the result can be checked, not so it can be treated as a top signal.",
  },
] as const;

const pageSchema = [
  generateWebPageSchema({
    path: PATH,
    name: "When to Sell Bitcoin After a Halving (T+500 Dates)",
    description:
      "The BTC500 rule sells Bitcoin exactly 500 days after each halving. Every historical T+500 sell date, the 2024 exit, and the next estimated sell date in 2029.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "When to Sell Bitcoin", path: PATH },
    ],
    datePublished: "2026-10-21",
    dateModified: LAST_REVIEWED,
  }),
  generateSpeakableSchema({
    path: PATH,
    cssSelectors: [".lead", "#sell-date-answer"],
  }),
  generateFaqSchema(FAQ),
];

// The router codegen requires a string literal here — `createFileRoute(PATH)`
// silently fails to register the route (rebuild error), which made this URL a
// soft 404 even though the sitemap and llms.txt advertised it.
export const Route = createFileRoute("/when-to-sell-bitcoin-after-halving")({
  loader: async ({ context }) => {
    // Prefetch so the server-rendered HTML contains the real dates and returns
    // instead of placeholders. AI crawlers do not execute the client bundle.
    // The halving snapshot (live tip height) is seeded by the root loader.
    await Promise.allSettled([context.queryClient.ensureQueryData(simulatorQuery)]);
  },
  head: () =>
    generatePageHead({
      path: PATH,
      title: "When to Sell Bitcoin After a Halving (T+500 Dates) | BTC500",
      description:
        "Sell Bitcoin 500 days after the halving. See every historical T+500 sell date, the 2024 exit on September 2 2025, and the next estimated sell date in 2029.",
      keywords:
        "when to sell bitcoin after halving, sell bitcoin before halving, should you sell bitcoin before halving, bitcoin halving sell date, T+500, bitcoin 500 day cycle, when to buy bitcoin before halving, bitcoin halving 2028 sell date",
      ogTitle: "When to Sell Bitcoin After a Halving — Every T+500 Date",
      ogDescription:
        "The BTC500 exit rule: sell exactly 500 days after each halving. Historical sell dates, returns, and the next estimated exit.",
      ogImageAlt: "When to sell Bitcoin after a halving — BTC500 T+500 dates",
      twitterTitle: "When to Sell Bitcoin After a Halving (T+500 Dates)",
      twitterDescription:
        "Every historical BTC500 sell date, the 2024 exit, and the next estimated sell date in 2029.",
      schema: pageSchema,
    }),
  component: WhenToSellPage,
});

function WhenToSellPage() {
  const halvingRes = useQuery(halvingQuery);
  const simulatorRes = useQuery(simulatorQuery);

  const info = halvingRes.data ?? estimateHalvingInfo();
  const schedule = buildHalvingCycles(Date.now(), estimateFromHalvingInfo(info));
  const nextCycle =
    schedule.find((c) => c.dateKind === "estimated") ?? schedule[schedule.length - 1]!;
  const lastCycle = schedule.find((c) => c.date === "2024-04-20") ?? schedule[schedule.length - 2]!;
  const nextSellDate = nextCycle.tPlus500;
  const lastSellDate = lastCycle.tPlus500;
  const nextSellDays = daysUntil(nextSellDate);

  const results = simulatorRes.data?.cycles ?? [];
  const completed = results.filter((c) => c.returnPercent !== null);
  const profitable = completed.filter((c) => (c.returnPercent ?? 0) > 0).length;
  const best = completed.reduce<(typeof completed)[number] | null>(
    (top, c) => (top === null || (c.returnPercent ?? 0) > (top.returnPercent ?? 0) ? c : top),
    null,
  );
  const weakest = completed.reduce<(typeof completed)[number] | null>(
    (low, c) => (low === null || (c.returnPercent ?? 0) < (low.returnPercent ?? 0) ? c : low),
    null,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 sm:pt-16">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              The exit rule · T+500
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            When to sell Bitcoin <span className="text-primary">after a halving</span>
          </h1>
          <p className="lead mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The BTC500 rule sells exactly <strong className="text-foreground">500 days</strong>{" "}
            after each Bitcoin halving — no chart reading, no top-picking. Here is every historical
            sell date and the next one on the calendar.
          </p>
        </header>

        {/* Answer-first block: direct, dated, and easy for answer engines to quote. */}
        <section
          id="sell-date-answer"
          aria-labelledby="answer-heading"
          className="mt-10 rounded-[28px] border border-primary/25 bg-primary-soft/40 p-6 sm:p-8"
        >
          <h2 id="answer-heading" className="text-lg font-semibold">
            The short answer
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
            Under the BTC500 rule, you sell Bitcoin on <strong>T+500</strong>: 500 calendar days
            after the halving. The 2024 halving sell date was{" "}
            <strong>{longDate(lastSellDate)}</strong>. The next estimated sell date is{" "}
            <strong>{longDate(nextSellDate)}</strong>, 500 days after the projected{" "}
            {longDate(nextCycle.date)} halving.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <AnswerStat label="2024 sell date" value={longDate(lastSellDate)} note="Historical" />
            <AnswerStat
              label="Next sell date"
              value={longDate(nextSellDate)}
              note={`${nextSellDays.toLocaleString("en-US")} days away · estimated`}
            />
            <AnswerStat
              label="Current phase"
              value={nextSellDays > 0 ? "Waiting to sell" : "Window closed"}
              note={`Halving ${longDate(nextCycle.date)}`}
            />
          </div>
        </section>

        <section className="mt-16" aria-labelledby="dates-heading">
          <h2 id="dates-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Every BTC500 sell date
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Buy at T−500, hold through the halving, sell at T+500. Each row uses the recorded
            halving date and the same daily price archive as the{" "}
            <Link to="/simulator" className="font-semibold text-primary hover:underline">
              simulator
            </Link>
            .
          </p>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-border/60 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <caption className="sr-only">
                  Bitcoin halving buy dates, sell dates, and BTC500 returns
                </caption>
                <thead className="border-b border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Cycle
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Buy (T−500)
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Halving
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Sell (T+500)
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((cycle) => {
                    const result = results.find((row) => row.halvingDate === cycle.date);
                    const isNext = cycle.block === nextCycle.block;
                    const ret = result?.returnPercent ?? null;
                    return (
                      <tr
                        key={cycle.block}
                        className={`border-b border-border/40 last:border-0 ${isNext ? "bg-primary-soft/30" : ""}`}
                      >
                        <th scope="row" className="px-5 py-4 font-semibold">
                          {cycleDisplayLabel(cycle)}
                          {isNext && (
                            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                              Next
                            </span>
                          )}
                        </th>
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {longDate(cycle.tMinus500)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {longDate(cycle.date)}
                          {cycle.dateKind === "estimated" && (
                            <span className="ml-1 text-xs">(est.)</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {longDate(cycle.tPlus500)}
                        </td>
                        <td className="px-5 py-4">
                          {ret !== null ? (
                            <span className="font-semibold text-success">+{ret.toFixed(0)}%</span>
                          ) : (
                            <span className="text-muted-foreground">Open</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Result = price at T+500 vs price at T−500, before fees and taxes. Historical prices from
            the on-site Bitstamp archive. Past performance does not guarantee future results.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="before-heading">
          <h2 id="before-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Should you sell Bitcoin before the halving?
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-border/60 bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MinusCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                What the BTC500 rule does
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The rule does{" "}
                <strong className="text-foreground">not sell before the halving</strong>. It buys at
                T−500, holds through the event, and exits at T+500. Selling early would break the
                fixed window, so the historical record would no longer describe the strategy you
                actually followed.
              </p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                What the record shows
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                All{" "}
                <strong className="text-foreground">
                  {completed.length > 0 ? completed.length : 4} completed windows
                </strong>{" "}
                finished higher at T+500 than at T−500. The weakest completed window was still
                positive, which is why the rule waits through the halving instead of trading the
                headline.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            That does not mean holding is right for everyone. It means the rule is internally
            consistent: the entry, the hold, and the exit are all defined before the trade. If you
            need the money sooner, or your risk tolerance is different, the calendar should not
            override that. Nothing on this page is financial advice.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="record-heading">
          <h2 id="record-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            The exit, in numbers
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-border/60 bg-card p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Completed windows
              </div>
              <div className="mt-2 text-4xl font-bold tracking-tight">
                {profitable}/{completed.length || 4}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">finished higher at T+500</div>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-card p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Best window
              </div>
              <div className="mt-2 text-4xl font-bold tracking-tight text-success">
                {best?.returnPercent != null ? `+${best.returnPercent.toFixed(0)}%` : "+3,318%"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {best?.label ?? "2016 Halving"}
              </div>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-card p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Weakest completed
              </div>
              <div className="mt-2 text-4xl font-bold tracking-tight">
                {weakest?.returnPercent != null ? `+${weakest.returnPercent.toFixed(0)}%` : "+560%"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {weakest?.label ?? "2024 Halving"}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Computed from the daily archive at each cycle&apos;s exact T−500 and T+500 dates. No
            compounding, fees, or taxes.
          </p>
        </section>

        <section className="mt-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Selling after the halving: common questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-border/60 bg-card open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                  <h3 className="flex-1 text-sm font-semibold text-foreground sm:text-base">
                    {item.question}
                  </h3>
                  <span className="text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[28px] border border-border/60 bg-card p-8 text-center sm:p-12">
          <TrendingUp className="mx-auto h-7 w-7 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            See what the full window did
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Run any amount through every completed BTC500 window, from the{" "}
            {longDate(lastCycle.tMinus500)} buy to the {longDate(lastSellDate)} sell.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Calculator className="h-4 w-4" />
              Open the simulator
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/halving-dates"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
            >
              <CalendarDays className="h-4 w-4" />
              Full halving schedule
            </Link>
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Last reviewed {longDate(LAST_REVIEWED)}. Historical prices from the on-site daily archive.
          The next halving and sell dates are estimates based on block height. Not financial advice.
        </p>
      </main>
    </div>
  );
}

function AnswerStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-4 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-base font-bold leading-snug">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
    </div>
  );
}
