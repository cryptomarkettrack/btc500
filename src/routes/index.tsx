import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generateFaqSchema,
  generateHowToSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";
import { FAQ_ITEMS } from "@/lib/faq";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { HomePage } from "@/components/home/HomePage";

const homePageSchema = [
  generateWebPageSchema({
    path: "/",
    name: "Bitcoin 500-Day Cycle | BTC500",
    description:
      "BTC500 is a rules-based Bitcoin plan: buy 500 days before the halving, sell 500 days after. Live countdown, cycle score, the full record, and a free simulator.",
    breadcrumbs: [{ name: "Home", path: "/" }],
  }),
  generateSpeakableSchema({
    path: "/",
    cssSelectors: ["#hero-tagline", "#btc500-definition", "#buy-date-answer"],
  }),
  generateHowToSchema(),
  generateFaqSchema(FAQ_ITEMS),
];

export const Route = createFileRoute("/")({
  head: () =>
    generatePageHead({
      path: "/",
      title: "BTC500 — Trade the calendar, not the noise | Bitcoin 500-Day Cycle",
      description:
        "BTC500 is a rules-based Bitcoin plan: buy 500 days before the halving, sell 500 days after. Live countdown, cycle score, the full record, and a free simulator.",
      keywords:
        "Bitcoin 500 day cycle, when is 500 days before the next bitcoin halving, Bitcoin halving countdown, BTC500, next Bitcoin halving, buy Bitcoin before halving",
      ogTitle: "BTC500 — Trade the calendar, not the noise",
      ogDescription:
        "One mechanical Bitcoin rule. Buy 500 days before the halving. Sell 500 days after. Follow the live cycle.",
      ogImageAlt: "BTC500 — Bitcoin 500-Day Cycle countdown",
      twitterTitle: "BTC500 — Trade the calendar, not the noise",
      twitterDescription:
        "One mechanical Bitcoin rule. Buy 500 days before the halving. Sell 500 days after. Follow the live cycle.",
      schema: homePageSchema,
    }),
  // The halving countdown is seeded globally by the root loader from one cached
  // tip-height call (see src/lib/seed-halving.ts), so HTML and hydration agree.
  // NOTE: cycle score + simulator preview are NOT prefetched here — doing so would
  // resolve after the HTML is rendered and break hydration (server showed a skeleton,
  // client hydrated with data). Their client-side useQuery() fills them in after mount.
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
