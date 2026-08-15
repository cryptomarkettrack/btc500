import { createFileRoute } from "@tanstack/react-router";
import { Bitcoin500DayCyclePage } from "@/components/cycle/Bitcoin500DayCyclePage";
import { CYCLE_FAQ } from "@/lib/cycle-faq";
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
      "Explore Bitcoin's historical performance from 500 days before each halving through 500 days after. Compare cycles and simulate investments with BTC500.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Bitcoin 500-Day Cycle", path: "/bitcoin-500-day-cycle" },
    ],
    datePublished: "2026-08-15",
    dateModified: "2026-08-15",
  }),
  generateSpeakableSchema({
    path: "/bitcoin-500-day-cycle",
    cssSelectors: [".lead"],
  }),
  generateFaqSchema(CYCLE_FAQ),
];

export const Route = createFileRoute("/bitcoin-500-day-cycle")({
  head: () =>
    generatePageHead({
      path: "/bitcoin-500-day-cycle",
      title: "Bitcoin 500-Day Cycle | BTC500",
      description:
        "Explore Bitcoin's historical performance from 500 days before each halving through 500 days after. Compare cycles and simulate investments with BTC500.",
      keywords:
        "bitcoin 500 day cycle, Bitcoin 500 days before halving, 500 days after Bitcoin halving, Bitcoin halving cycle, when to buy Bitcoin before halving, Bitcoin halving investment strategy",
      ogTitle: "Bitcoin 500-Day Cycle | BTC500",
      ogDescription:
        "Track Bitcoin from 500 days before each halving through 500 days after. Real cycle dates, prices, and a free simulator.",
      ogImageAlt: "Bitcoin 500-Day Cycle — BTC500",
      twitterDescription:
        "Bitcoin’s historical 500-day window around each halving, with real prices and a free simulator.",
      schema: pageSchema,
    }),
  loader: async ({ context }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData(halvingQuery),
      context.queryClient.ensureQueryData(simulatorQuery),
      context.queryClient.ensureQueryData(btcPriceQuery),
    ]);
  },
  component: Bitcoin500DayCyclePage,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});
