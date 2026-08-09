import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Calculator, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { HALVINGS, addDays } from "@/lib/halvings";
import { halvingQuery, simulatorQuery } from "@/lib/queries";

const halvingDatesSchema = generateWebPageSchema({
  path: "/halving-dates",
  name: "Bitcoin Halving Dates — Complete Schedule 2012–2028",
  description:
    "Every Bitcoin halving date from 2012 to 2028, with block heights, buy and sell windows, and the BTC500 strategy applied to each cycle.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Halving Dates", path: "/halving-dates" },
  ],
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "When is the next Bitcoin halving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The next Bitcoin halving is projected for around April 2028, when block height reaches 1,050,000. The exact date depends on Bitcoin's average block time.",
      },
    },
    {
      "@type": "Question",
      name: "What are all the Bitcoin halving dates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bitcoin halvings occurred on November 28, 2012, July 9, 2016, May 11, 2020, and April 20, 2024. The next halving is projected for around April 2028.",
      },
    },
    {
      "@type": "Question",
      name: "How often does Bitcoin halve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bitcoin halves approximately every 210,000 blocks, which is roughly every four years. The block reward paid to miners is cut in half at each halving.",
      },
    },
  ],
};

export const Route = createFileRoute("/halving-dates")({
  loader: async ({ context }) => {
    // Ensure the halving countdown + simulator data are in the server-rendered
    // HTML so crawlers see the actual cycle returns (not "—" placeholders).
    await Promise.allSettled([
      context.queryClient.ensureQueryData(halvingQuery),
      context.queryClient.ensureQueryData(simulatorQuery),
    ]);
  },
  head: () =>
    generatePageHead({
      path: "/halving-dates",
      title: "Bitcoin Halving Dates — Complete Schedule 2012–2028 | BTC500",
      description:
        "Every Bitcoin halving date from 2012 to 2028, with block heights, buy and sell windows, and the BTC500 strategy applied to each cycle.",
      keywords:
        "Bitcoin halving dates, Bitcoin halving schedule, when is the next Bitcoin halving, Bitcoin halving 2028, Bitcoin halving history, Bitcoin halving 2012 2016 2020 2024, Bitcoin halving block height",
      ogTitle: "Bitcoin Halving Dates — Complete Schedule 2012–2028",
      ogDescription:
        "Every Bitcoin halving date, block height, and the BTC500 buy/sell windows for each cycle.",
      ogImageAlt: "Bitcoin Halving Dates — Complete Schedule | BTC500",
      twitterTitle: "Bitcoin Halving Dates — Complete Schedule 2012–2028",
      twitterDescription: "Every Bitcoin halving date, block height, and BTC500 buy/sell windows.",
      schema: [halvingDatesSchema, faqSchema],
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

function HalvingDates() {
  const halvingRes = useQuery(halvingQuery);
  const simulatorRes = useQuery(simulatorQuery);

  const nextHalvingDate = halvingRes.data?.nextHalvingDate
    ? halvingRes.data.nextHalvingDate.split("T")[0]
    : "2028-04-20";
  const nextHalvingBlock = halvingRes.data?.nextHalvingBlock ?? 1050000;

  const cycles = simulatorRes.data?.cycles ?? [];

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
            Every Bitcoin halving from 2012 to 2028, with block heights and the BTC
            <span className="text-primary">500</span> buy and sell windows for each cycle.
          </p>
        </header>

        {/* Next halving highlight */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-orange-500/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Next Bitcoin Halving</div>
                <div className="text-2xl font-bold sm:text-3xl">{formatDate(nextHalvingDate)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Block height {nextHalvingBlock.toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:items-end">
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Buy window: {formatDate(addDays(nextHalvingDate, -500))}
                </Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Sell window: {formatDate(addDays(nextHalvingDate, 500))}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Halving schedule table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Complete Halving Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-semibold">Halving</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Block</th>
                  <th className="py-3 pr-4 font-semibold">Buy Window</th>
                  <th className="py-3 pr-4 font-semibold">Sell Window</th>
                  <th className="py-3 font-semibold">Return</th>
                </tr>
              </thead>
              <tbody>
                {HALVINGS.map((halving) => {
                  const cycle = getCycle(halving.date);
                  const buyDate = addDays(halving.date, -500);
                  const sellDate = addDays(halving.date, 500);
                  const isNext = halving.date === "2024-04-20";
                  return (
                    <tr key={halving.block} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-semibold">
                        {halving.label}
                        {isNext && (
                          <Badge className="ml-2 text-[10px]" variant="secondary">
                            Current
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">{formatDate(halving.date)}</td>
                      <td className="py-3 pr-4 font-mono">{halving.block.toLocaleString()}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{formatDate(buyDate)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{formatDate(sellDate)}</td>
                      <td className="py-3 font-semibold">
                        {cycle?.returnPercent != null ? (
                          <span
                            className={cycle.returnPercent > 0 ? "text-green-500" : "text-red-500"}
                          >
                            {cycle.returnPercent > 0 ? "+" : ""}
                            {cycle.returnPercent.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* What is a halving */}
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              What Is a Bitcoin Halving?
            </CardTitle>
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
              The BTC
              <span className="text-primary">500</span> strategy uses the halving as its anchor: buy
              exactly <strong className="text-foreground">500 days before</strong> each halving and
              sell exactly <strong className="text-foreground">500 days after</strong>. The table
              above shows those windows for every cycle.
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-foreground">When is the next Bitcoin halving?</h3>
              <p className="mt-1 text-muted-foreground">
                The next Bitcoin halving is projected for around April 2028, when block height
                reaches 1,050,000. The exact date depends on Bitcoin's average block time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                What are all the Bitcoin halving dates?
              </h3>
              <p className="mt-1 text-muted-foreground">
                Bitcoin halvings occurred on November 28, 2012, July 9, 2016, May 11, 2020, and
                April 20, 2024. The next halving is projected for around April 2028.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">How often does Bitcoin halve?</h3>
              <p className="mt-1 text-muted-foreground">
                Bitcoin halves approximately every 210,000 blocks, which is roughly every four
                years. The block reward paid to miners is cut in half at each halving.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-3">
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
