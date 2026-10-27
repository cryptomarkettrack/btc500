import { createFileRoute } from "@tanstack/react-router";
import { Bitcoin500DayCyclePage } from "@/components/cycle/Bitcoin500DayCyclePage";
import { CYCLE_FAQ } from "@/lib/cycle-faq";
import { buildCycleDatasetSchema } from "@/lib/cycle-dataset";
import { computeCycle } from "@/lib/phase";
import { buildPillarSnippet } from "@/lib/pillar-snippet";
import { btcPriceQuery, halvingQuery, simulatorQuery } from "@/lib/queries";
import {
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";

const pageSchema = [
  generateWebPageSchema({
    path: "/bitcoin-500-day-cycle",
    name: "Bitcoin 500-Day Cycle",
    description:
      "The BTC500 rule buys 500 days before each Bitcoin halving and sells 500 days after. All four completed windows with entry, exit, drawdowns and an entry-timing test.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Bitcoin 500-Day Cycle", path: "/bitcoin-500-day-cycle" },
    ],
    datePublished: "2026-08-15",
    dateModified: "2026-10-27",
  }),
  generateSpeakableSchema({
    path: "/bitcoin-500-day-cycle",
    cssSelectors: [".lead"],
  }),
  generateFaqSchema(CYCLE_FAQ),
  buildCycleDatasetSchema(),
];

export const Route = createFileRoute("/bitcoin-500-day-cycle")({
  head: (ctx) => {
    // `loaderData` is typed `never` by this router version's self-referential
    // inference, so the loader's shape is asserted here. It is populated before
    // head runs (TanStack Start evaluates loaders first).
    const data = ctx.loaderData as { buyDateISO: string | null } | undefined;
    const snippet = buildPillarSnippet({
      buyDateISO: data?.buyDateISO ?? null,
      nowISO: new Date().toISOString(),
    });

    return generatePageHead({
      path: "/bitcoin-500-day-cycle",
      title: snippet.title,
      description: snippet.description,
      keywords:
        "bitcoin 500 day cycle, 500 days before the next bitcoin halving, when is 500 days before the next bitcoin halving, Bitcoin 500 days before halving, 500 days after Bitcoin halving, Bitcoin halving cycle, when to buy Bitcoin before halving",
      ogTitle: snippet.title,
      ogDescription: snippet.description,
      ogImageAlt: "Bitcoin 500-Day Cycle — BTC500",
      twitterDescription: snippet.description,
      schema: pageSchema,
    });
  },
  loader: async ({ context }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData(simulatorQuery),
      context.queryClient.ensureQueryData(btcPriceQuery),
    ]);

    // The head needs the live T-500 date, so derive it from the same seeded
    // halving snapshot the page renders. Never a literal date.
    const halving = context.queryClient.getQueryData(halvingQuery.queryKey);
    if (!halving) return { buyDateISO: null };

    const cycle = computeCycle(
      new Date(),
      new Date(halving.nextHalvingDate),
      new Date(halving.lastHalvingDate),
    );
    return { buyDateISO: cycle.buyDate.toISOString() };
  },
  component: Bitcoin500DayCyclePage,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});
