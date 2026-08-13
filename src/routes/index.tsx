import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cycleScoreQuery, halvingQuery, simulatorPreviewQuery } from "@/lib/queries";
import { generatePageHead, generateSpeakableSchema, generateWebPageSchema } from "@/lib/site";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { HomePage } from "@/components/home/HomePage";

const homePageSchema = [
  generateWebPageSchema({
    path: "/",
    name: "BTC500 — Bitcoin Halving Countdown & Investment Strategy",
    description:
      "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell exactly 500 days after. Live Cycle Command Center, script integrity score, block progress, historical returns & investment simulator.",
    breadcrumbs: [{ name: "Home", path: "/" }],
  }),
  generateSpeakableSchema({
    path: "/",
    cssSelectors: ["#hero-tagline"],
  }),
];

export const Route = createFileRoute("/")({
  head: () =>
    generatePageHead({
      path: "/",
      title: "BTC500 — Bitcoin Halving Countdown & Strategy",
      description:
        "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell 500 days after, with a live cycle score and investment simulator.",
      keywords:
        "Bitcoin halving, BTC500, Bitcoin strategy, Bitcoin countdown, cycle score, buy Bitcoin, crypto halving, Bitcoin investment, halving countdown, Bitcoin trading, Bitcoin price, block height",
      ogTitle: "BTC500 — Bitcoin Halving Countdown & Investment Strategy",
      ogDescription:
        "Buy 500 days before halving. Sell 500 days after. Live cycle score, command center, and historical returns.",
      ogImageAlt: "BTC500 — Bitcoin Halving Countdown & Strategy Dashboard",
      twitterTitle: "BTC500 — Bitcoin Halving Countdown & Strategy",
      twitterDescription:
        "Buy 500 days before halving. Sell 500 days after. Track live cycle score.",
      schema: homePageSchema,
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(halvingQuery);
    // Warm the down-page stats (cycle score + simulator preview) in PARALLEL with a single
    // cap so they render in the first-pass HTML when fast, but never block TTFB for ~16s
    // (the previous two sequential 8s races caused the 10s+ server response time).
    await Promise.race([
      Promise.all([
        context.queryClient.ensureQueryData(cycleScoreQuery),
        context.queryClient.ensureQueryData(simulatorPreviewQuery),
      ]),
      new Promise((resolve) => setTimeout(resolve, 6_000)),
    ]);
  },
  component: HomePage,
  pendingComponent: Pending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});

function Pending() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-6 p-0 sm:p-5">
          {/* Header skeleton */}
          <header className="mb-4 text-center sm:mb-6">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-10 w-56 rounded-lg" />
              <Skeleton className="h-20 w-full max-w-[300px] rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </header>

          {/* Main hero card skeleton */}
          <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-8 shadow-sm sm:p-12">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
              {/* Countdown block skeleton */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-28 rounded-md" />
                    <Skeleton className="mt-1.5 h-5 w-44 rounded-md" />
                  </div>
                </div>
                <div className="mt-4">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <div className="mt-2 flex items-baseline gap-3">
                    <Skeleton className="h-32 w-48 rounded-lg sm:h-40" />
                    <Skeleton className="h-8 w-12 rounded-md" />
                  </div>
                  <div className="mt-6">
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="mt-2 flex justify-between">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Next halving skeleton */}
              <div className="flex flex-col justify-center md:border-l md:border-border/60 md:pl-14">
                <Skeleton className="h-3 w-24 rounded-md" />
                <div className="mt-3 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-10 w-44 rounded-lg sm:h-12" />
                </div>
                <Skeleton className="mt-2 h-4 w-36 rounded-md" />
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 rounded-2xl" />
                  <Skeleton className="h-16 rounded-2xl" />
                </div>
                <div className="mt-8 rounded-2xl bg-muted/60 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-md" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                  <Skeleton className="mt-3 h-2 w-full rounded-full" />
                  <div className="mt-2 flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                  <Skeleton className="mx-auto mt-2 h-4 w-32 rounded-md" />
                </div>
              </div>
            </div>
          </section>

          {/* Secondary card skeleton */}
          <section className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div>
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="mt-1.5 h-5 w-44 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-20 rounded-md" />
              <Skeleton className="h-12 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </section>
        </div>

        <Skeleton className="mx-auto mt-16 h-4 w-96 rounded-md" />
      </main>
    </div>
  );
}
