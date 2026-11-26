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
import { simulatorPreviewQuery, signalPriceQuery } from "@/lib/queries";
import { SIGNAL_OG_IMAGE } from "@/lib/buy-signal";
import { waitForHalvingSeed } from "@/lib/seed-halving";
import { computeCycle } from "@/lib/phase";
import { buildHomeSnippet } from "@/lib/home-snippet";

const homePageSchema = [
  generateWebPageSchema({
    path: "/",
    name: "The Bitcoin 500-Day Halving Rule | BTC500",
    description:
      "BTC500 is a rules-based Bitcoin plan: buy 500 days before the halving, sell 500 days after. Live countdown, the full record, and a free simulator.",
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
  head: (ctx) => {
    // `loaderData` is typed `never` by this router version's self-referential
    // inference, so the loader's shape is asserted here. It is populated before
    // head runs (TanStack Start evaluates loaders first).
    const data = ctx.loaderData as
      | { halvingISO: string | null; buyDateISO: string | null }
      | undefined;
    // The two tags a stranger sees in a search result, built from the live
    // halving estimate (the same one the countdown and the pillar use) rather
    // than from a literal date. See src/lib/home-snippet.ts for why they lead
    // with the halving year instead of a term this site coined.
    const snippet = buildHomeSnippet({
      halvingISO: data?.halvingISO ?? null,
      buyDateISO: data?.buyDateISO ?? null,
      nowISO: new Date().toISOString(),
    });

    return generatePageHead({
      path: "/",
      title: snippet.title,
      description: snippet.description,
      keywords:
        "Bitcoin 500 day cycle, when is 500 days before the next bitcoin halving, Bitcoin halving countdown, BTC500, next Bitcoin halving, buy Bitcoin before halving, bitcoin 500 day rule, 500 day bitcoin strategy",
      ogTitle: "BTC500 — The Bitcoin 500-Day Halving Rule",
      ogDescription:
        "One mechanical Bitcoin rule. Buy 500 days before the halving. Sell 500 days after. Follow the live cycle.",
      ogImage: SIGNAL_OG_IMAGE,
      ogImageAlt: "BTC500 — live T-minus countdown card for the November 28, 2026 buy point",
      twitterTitle: "BTC500 — The Bitcoin 500-Day Halving Rule",
      twitterDescription:
        "One mechanical Bitcoin rule. Buy 500 days before the halving. Sell 500 days after. Follow the live cycle.",
      schema: homePageSchema,
    });
  },
  loader: async ({ context }) => {
    // Seed the shared simulator payload before render so the SSR HTML carries the real
    // completed-window stats and the ledger estimate. Without this the two useQuery reads
    // start empty on the server and the served markup shows "—" record stats and
    // "Completed-window data is loading." — the defect the 2026-10-29 review flagged on the
    // one URL Google actually serves. The loader runs before render, so the hydrated client
    // agrees instead of refetching mid-hydration.
    await context.queryClient.ensureQueryData(simulatorPreviewQuery);
    await context.queryClient.ensureQueryData(signalPriceQuery);

    // The head needs the live T-500 date, so derive it from the same seeded
    // halving snapshot the countdown renders and the pillar page uses — never a
    // literal date. The seed runs in the root loader, concurrently with this one.
    const halving = await waitForHalvingSeed(context.queryClient);
    if (!halving) return { halvingISO: null, buyDateISO: null };

    const cycle = computeCycle(
      new Date(),
      new Date(halving.nextHalvingDate),
      new Date(halving.lastHalvingDate),
    );
    return { halvingISO: halving.nextHalvingDate, buyDateISO: cycle.buyDate.toISOString() };
  },
  // The halving countdown is seeded globally by the root loader from one cached
  // tip-height call (see src/lib/seed-halving.ts), so HTML and hydration agree.
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
