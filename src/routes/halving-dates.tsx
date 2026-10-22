import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Calculator,
  Clock,
  ArrowRight,
  BookOpen,
  Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generatePageHead, generateSpeakableSchema, generateWebPageSchema } from "@/lib/site";
import { buildHalvingCycles } from "@/lib/halvings";
import { CALENDAR_PATH } from "@/lib/halving-calendar";
import { estimateFromHalvingInfo, estimateHalvingInfo } from "@/lib/btc.functions";
import { halvingQuery, simulatorQuery } from "@/lib/queries";

const PATH = "/halving-dates";
const TITLE = "When Is the Next Bitcoin Halving? Dates 2012–2028 | BTC500";
const DESCRIPTION =
  "The next Bitcoin halving is estimated for April 2028 at block 1,050,000. Every halving date since 2012 with block heights, block rewards, BTC price at the halving and the BTC500 buy and sell windows.";

/** Visible FAQ. The FAQPage schema below is generated from this same list. */
const FAQ: { q: string; a: string }[] = [
  {
    q: "When is the next Bitcoin halving?",
    a: "The next Bitcoin halving is estimated for around April 2028, when the block height reaches 1,050,000. Because the event is triggered by block height and not by a calendar date, the exact day moves as Bitcoin's average block time drifts above or below ten minutes. The live estimate is shown at the top of this page.",
  },
  {
    q: "When is 500 days before the next Bitcoin halving?",
    a: "The BTC500 buy date is 500 calendar days before the estimated halving. That date moves whenever the halving estimate moves, so it is recomputed from live block height rather than fixed in advance. The buy and sell windows for every cycle are in the schedule table on this page, and the current pair can be downloaded as a calendar file.",
  },
  {
    q: "What are all the Bitcoin halving dates?",
    a: "Bitcoin has halved four times: 28 November 2012 (block 210,000), 9 July 2016 (block 420,000), 11 May 2020 (block 630,000) and 20 April 2024 (block 840,000). The next halving is estimated for April 2028 at block 1,050,000.",
  },
  {
    q: "How often does Bitcoin halve?",
    a: "Bitcoin halves every 210,000 blocks. At the protocol's ten-minute target block time that works out to roughly four years, but the real gap varies: the four completed halvings arrived 1,319, 1,402 and 1,440 days apart, all slightly longer than four calendar years.",
  },
  {
    q: "What is the block reward after each halving?",
    a: "The subsidy started at 50 BTC per block. It fell to 25 BTC in 2012, 12.5 BTC in 2016, 6.25 BTC in 2020 and 3.125 BTC in 2024. After the 2028 halving it becomes 1.5625 BTC per block.",
  },
  {
    q: "Why does the halving date move?",
    a: "The halving fires at a fixed block height, not on a fixed date. Bitcoin targets one block every ten minutes, but hash rate growth makes blocks arrive faster on average, which pulls the halving earlier, while difficulty adjustments and hash rate declines pull it later. Any published date is an estimate until the block is mined.",
  },
  {
    q: "Does the halving cause a Bitcoin bull market?",
    a: "Every completed halving was followed by a higher price 500 days later, but four observations is a very small sample and the returns have shrunk each cycle. The supply cut is real and mechanical; the price response is not guaranteed. Treat the dates as a schedule, not a forecast.",
  },
  {
    q: "What is the BTC500 strategy?",
    a: "Buy Bitcoin exactly 500 days before each halving, hold through the event, and sell exactly 500 days after. It uses one calendar rule instead of indicators, so every historical window can be checked against the same price archive.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const halvingDatesSchema = generateWebPageSchema({
  path: PATH,
  name: "Bitcoin Halving Dates — Complete Schedule 2012–2028",
  description: DESCRIPTION,
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Halving Dates", path: PATH },
  ],
  datePublished: "2026-08-15",
  dateModified: "2026-10-22",
});

export const Route = createFileRoute("/halving-dates")({
  loader: async ({ context }) => {
    // Ensure the halving countdown + simulator data are in the server-rendered
    // HTML so crawlers see the actual cycle returns (not "—" placeholders).
    // The halving snapshot is seeded by the root loader (live tip height).
    await Promise.allSettled([context.queryClient.ensureQueryData(simulatorQuery)]);
  },
  head: () =>
    generatePageHead({
      path: PATH,
      title: TITLE,
      description: DESCRIPTION,
      keywords:
        "Bitcoin halving dates, Bitcoin halving schedule, when is the next bitcoin halving, next Bitcoin halving date, Bitcoin halving 2028, Bitcoin halving history, Bitcoin halving 2012 2016 2020 2024, Bitcoin halving block height, Bitcoin block reward halving",
      ogTitle: "Bitcoin Halving Dates — Complete Schedule 2012–2028",
      ogDescription:
        "Every Bitcoin halving date, block height, block reward and the BTC500 buy/sell windows for each cycle.",
      ogImageAlt: "Bitcoin Halving Dates — Complete Schedule | BTC500",
      twitterTitle: "Bitcoin Halving Dates — Complete Schedule 2012–2028",
      twitterDescription:
        "Every Bitcoin halving date, block height, block reward and the BTC500 buy/sell windows.",
      schema: [
        halvingDatesSchema,
        faqSchema,
        generateSpeakableSchema({
          path: PATH,
          cssSelectors: ["#next-halving-answer", "#buy-date-answer"],
        }),
      ],
      publishedTime: "2026-08-15",
      modifiedTime: "2026-10-22",
    }),
  component: HalvingDates,
});

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Subsidy paid per block *after* halving `n` (n = 1 → 25 BTC, after 2012). */
function blockSubsidyAfter(n: number): number {
  return 50 / 2 ** n;
}

function formatSubsidy(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} BTC`;
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime();
  return Math.round(ms / 86_400_000);
}

const REWARD_ERAS = [
  { era: "2009 – 2012", blocks: "0 – 209,999", subsidy: 50, daily: 7_200 },
  { era: "2012 – 2016", blocks: "210,000 – 419,999", subsidy: 25, daily: 3_600 },
  { era: "2016 – 2020", blocks: "420,000 – 629,999", subsidy: 12.5, daily: 1_800 },
  { era: "2020 – 2024", blocks: "630,000 – 839,999", subsidy: 6.25, daily: 900 },
  { era: "2024 – 2028", blocks: "840,000 – 1,049,999", subsidy: 3.125, daily: 450 },
  { era: "2028 – 2032", blocks: "1,050,000 – 1,259,999", subsidy: 1.5625, daily: 225 },
];

function SectionHeading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
}

function HalvingDates() {
  const halvingRes = useQuery(halvingQuery);
  const simulatorRes = useQuery(simulatorQuery);

  const info = halvingRes.data ?? estimateHalvingInfo();
  const schedule = buildHalvingCycles(Date.now(), estimateFromHalvingInfo(info));
  const nextCycle =
    schedule.find((c) => c.dateKind === "estimated") ?? schedule[schedule.length - 1]!;
  const nextHalvingDate = nextCycle.date;
  const nextHalvingBlock = nextCycle.block;

  const todayIso = new Date().toISOString().slice(0, 10);
  const daysToNextHalving = Math.max(0, daysBetween(todayIso, nextHalvingDate));

  const cycles = simulatorRes.data?.cycles ?? [];
  const dataUnavailable =
    simulatorRes.data?.status === "unavailable" || simulatorRes.data?.status === "error";

  const getCycle = (halvingDate: string) => cycles.find((c) => c.halvingDate === halvingDate);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bitcoin Halving Dates</h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Every Bitcoin halving from 2012 to 2028, with block heights, block rewards and the BTC
            <span className="text-primary">500</span> buy and sell windows for each cycle.
          </p>
        </header>

        {/* The answer. Kept in plain text near the top with a stable id so
            speakable/answer-engine extractors can target it. */}
        <p
          id="next-halving-answer"
          className="mx-auto mb-4 max-w-3xl text-center text-base leading-relaxed text-muted-foreground"
        >
          The next Bitcoin halving is estimated for{" "}
          <strong className="text-foreground">{formatDate(nextHalvingDate)}</strong>, at block
          height <strong className="text-foreground">{nextHalvingBlock.toLocaleString()}</strong> —
          about{" "}
          <strong className="text-foreground">{daysToNextHalving.toLocaleString()} days</strong>{" "}
          from today. Bitcoin has halved four times: 28 November 2012, 9 July 2016, 11 May 2020 and
          20 April 2024. Each event cuts the block reward in half.
        </p>

        {/* Direct answer to the site's highest-intent non-brand query
            ("when is 500 days before the next bitcoin halving"), which ranks on
            page 1 but previously had no date in the snippet. */}
        <p
          id="buy-date-answer"
          className="mx-auto mb-8 max-w-3xl text-center text-base leading-relaxed text-muted-foreground"
        >
          500 days before the next Bitcoin halving is{" "}
          <strong className="text-foreground">{formatDate(nextCycle.tMinus500)}</strong> — the BTC
          <span className="text-primary">500</span> buy date for this cycle. The matching sell date
          is <strong className="text-foreground">{formatDate(nextCycle.tPlus500)}</strong>.{" "}
          <a
            href={CALENDAR_PATH}
            download
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            Add both dates to your calendar
          </a>
          .
        </p>

        {/* Next halving highlight */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/10 to-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Next Bitcoin Halving</div>
                <div className="text-2xl font-bold sm:text-3xl">{formatDate(nextHalvingDate)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Block height {nextHalvingBlock.toLocaleString()} ·{" "}
                  {daysToNextHalving.toLocaleString()} days away
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:items-end">
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Buy window: {formatDate(nextCycle.tMinus500)}
                </Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Sell window: {formatDate(nextCycle.tPlus500)}
                </Badge>
                <a
                  href={CALENDAR_PATH}
                  download
                  className="mt-1 inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Add to calendar (.ics)
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Halving schedule table */}
        <Card className="mb-8">
          <CardHeader>
            <SectionHeading id="halving-schedule">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Bitcoin halving dates in order
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-semibold">Halving</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Block</th>
                  <th className="py-3 pr-4 font-semibold">Block reward</th>
                  <th className="py-3 pr-4 font-semibold">BTC price</th>
                  <th className="py-3 pr-4 font-semibold">Buy (T-500)</th>
                  <th className="py-3 pr-4 font-semibold">Sell (T+500)</th>
                  <th className="py-3 font-semibold">Return</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((halving) => {
                  const cycle = getCycle(halving.date);
                  const kindLabel =
                    halving.cycleKind === "current"
                      ? "Current"
                      : halving.cycleKind === "future"
                        ? "Upcoming"
                        : null;
                  const returnIsRealized = halving.performanceKind === "realized";
                  return (
                    <tr key={halving.block} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-semibold">
                        {halving.dateKind === "historical"
                          ? `${halving.date.slice(0, 4)} Halving`
                          : halving.label}
                        {kindLabel && (
                          <Badge className="ml-2 text-[10px]" variant="secondary">
                            {kindLabel}
                          </Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        {formatDate(halving.date)}
                        {halving.dateKind === "estimated" && (
                          <span className="ml-1 text-xs text-muted-foreground">est.</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-mono">{halving.block.toLocaleString()}</td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        {formatSubsidy(blockSubsidyAfter(halving.number))}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{formatUsd(cycle?.halvingPrice)}</td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        {formatDate(halving.tMinus500)}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        {formatDate(halving.tPlus500)}
                      </td>
                      <td className="py-3 font-semibold">
                        {returnIsRealized && cycle?.returnPercent != null ? (
                          <span
                            className={
                              cycle.returnPercent > 0 ? "text-success" : "text-destructive"
                            }
                          >
                            {cycle.returnPercent > 0 ? "+" : ""}
                            {cycle.returnPercent.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {dataUnavailable ? "unavailable" : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              Historical dates and block heights are recorded facts. The 2028 row is an estimate
              derived from live block height and the recent average block interval, so its date
              moves. BTC prices are daily closes from the bundled Bitstamp archive.
            </p>
          </CardContent>
        </Card>

        {/* What is a halving */}
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <SectionHeading>
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                What is a Bitcoin halving?
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              A Bitcoin halving is an event that cuts the block reward paid to miners in half. It
              happens automatically every{" "}
              <strong className="text-foreground">210,000 blocks</strong> — roughly every four
              years. This reduces the new supply of Bitcoin entering circulation, which has
              historically coincided with major multi-year price cycles.
            </p>
            <p>
              The rule is enforced by the protocol, not by an organisation. Each block carries a
              coinbase transaction that pays the miner the current subsidy plus fees. At block
              height 210,000, 420,000, 630,000, 840,000 and so on, every node on the network
              independently halves the number it will accept. Nobody schedules the event and nobody
              can delay it.
            </p>
            <p>
              The BTC<span className="text-primary">500</span> strategy uses the halving as its
              anchor: buy exactly <strong className="text-foreground">500 days before</strong> each
              halving and sell exactly <strong className="text-foreground">500 days after</strong>.
              The table above shows those windows for every cycle.
            </p>
          </CardContent>
        </Card>

        {/* Reward eras */}
        <Card className="mb-8">
          <CardHeader>
            <SectionHeading id="block-reward">The block reward after each halving</SectionHeading>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-semibold">Era</th>
                  <th className="py-3 pr-4 font-semibold">Block range</th>
                  <th className="py-3 pr-4 font-semibold">Subsidy per block</th>
                  <th className="py-3 font-semibold">New BTC per day</th>
                </tr>
              </thead>
              <tbody>
                {REWARD_ERAS.map((row) => (
                  <tr key={row.era} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4 font-semibold">{row.era}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {row.blocks}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{formatSubsidy(row.subsidy)}</td>
                    <td className="py-3 tabular-nums text-muted-foreground">
                      {row.daily.toLocaleString()} BTC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              New BTC per day assumes the protocol target of 144 blocks per day. Halvings continue
              until the subsidy rounds to zero, with the final bitcoin expected to be mined around
              2140. After that, miners are paid by transaction fees alone.
            </p>
          </CardContent>
        </Card>

        {/* Why the date moves */}
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <SectionHeading id="why-dates-move">Why the halving date moves</SectionHeading>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Bitcoin targets one block every ten minutes. Every 2,016 blocks the network re-targets
              difficulty so that the average holds, but the adjustment is slow and the hash rate
              keeps changing. A stretch of fast blocks pulls the next halving earlier; a stretch of
              slow blocks pushes it later.
            </p>
            <p>
              The four completed halvings were <strong className="text-foreground">1,319</strong>,{" "}
              <strong className="text-foreground">1,402</strong> and{" "}
              <strong className="text-foreground">1,440</strong> days apart — all slightly longer
              than four calendar years. That drift is why this page estimates the next date from
              live block height and the recently observed block interval instead of printing a fixed
              calendar day.
            </p>
            <p>
              If live network data is unavailable, the estimate falls back to the protocol
              ten-minute target and is labelled as a fallback rather than presented as a live
              reading.
            </p>
          </CardContent>
        </Card>

        {/* Did it cause a bull market */}
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <SectionHeading id="halving-and-price">
              Does the halving cause a Bitcoin bull market?
            </SectionHeading>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Every completed halving was followed by a higher price 500 days later, and the
              pre-halving stretch was positive in three of four cycles. The supply cut is real:
              daily issuance fell from 7,200 BTC in 2012 to roughly 450 BTC today.
            </p>
            <p>
              But four observations is a very small sample, and the last two cycles produced much
              smaller multiples than the ones before them. The 2012 window returned around 2,890%,
              the 2016 window around 3,318%, the 2020 window around 1,067% and the 2024 window
              around 560%. A smaller multiple is not the same thing as a broken rule, but it is also
              not a promise that the next window repeats.
            </p>
            <p>
              Run the same windows yourself on the{" "}
              <Link to="/simulator" className="font-semibold text-primary hover:underline">
                simulator
              </Link>{" "}
              before treating any of this as a forecast.
            </p>
          </CardContent>
        </Card>

        {/* ETF cross-link */}
        <Card className="mb-8">
          <CardHeader>
            <SectionHeading id="etf-flows">
              <span className="inline-flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Where the halving meets ETF demand
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The halving controls how many new coins miners create. Spot Bitcoin ETFs control who
              absorbs them. Track both sides of that ledger on the{" "}
              <Link to="/bitcoin-etf" className="font-semibold text-primary hover:underline">
                Bitcoin ETF flows dashboard
              </Link>
              , which converts each session&apos;s dollar flows into BTC and stacks them against
              daily miner issuance.
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <SectionHeading>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Bitcoin halving dates — frequently asked questions
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {FAQ.map((item) => {
              const liveNote =
                item.q === "When is 500 days before the next Bitcoin halving?"
                  ? `Right now that is ${formatDate(nextCycle.tMinus500)} (estimated), 500 days before the estimated halving on ${formatDate(nextCycle.date)}. The matching sell date is ${formatDate(nextCycle.tPlus500)}.`
                  : item.q === "When is the next Bitcoin halving?"
                    ? `The current estimate is ${formatDate(nextCycle.date)} at block ${nextCycle.block.toLocaleString()}.`
                    : null;
              return (
                <div key={item.q}>
                  <h3 className="font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-1 text-muted-foreground">
                    {item.a}
                    {liveNote ? ` ${liveNote}` : ""}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/bitcoin-500-day-cycle"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <BookOpen className="h-4 w-4" />
            Bitcoin 500-Day Cycle
          </Link>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <Calculator className="h-4 w-4" />
            Calculate Your Returns
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/timeline"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <Clock className="h-4 w-4" />
            Explore the Timeline
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Historical prices from Bitstamp. Past performance does not guarantee future results.
        </p>
      </main>
    </div>
  );
}
