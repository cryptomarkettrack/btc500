import { createFileRoute } from "@tanstack/react-router";
import { HalvingSpacingPage } from "@/components/spacing/HalvingSpacingPage";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { spacingQuery } from "@/lib/queries";
import { SPACING_FAQ } from "@/lib/spacing-faq";
import {
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";

const PATH = "/halving-spacing";
const TITLE = "400 vs 500 vs 600 Days Before the Halving | BTC500";
const DESCRIPTION =
  "The BTC500 rule run at 400, 500 and 600 days' spacing on daily closes: every completed window in every spacing closed above its entry, with each window's buy, sell and lowest close.";

const pageSchema = [
  generateWebPageSchema({
    path: PATH,
    name: "Bitcoin halving spacing test — 400 vs 500 vs 600 days",
    description: DESCRIPTION,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Halving spacing test", path: PATH },
    ],
    datePublished: "2026-11-18",
    dateModified: "2026-11-18",
  }),
  generateSpeakableSchema({
    path: PATH,
    cssSelectors: ["#answer", "#spacing-table"],
  }),
  generateFaqSchema(SPACING_FAQ),
];

export const Route = createFileRoute("/halving-spacing")({
  head: () =>
    generatePageHead({
      path: PATH,
      title: TITLE,
      description: DESCRIPTION,
      keywords:
        "bitcoin halving spacing, 400 days before halving, 600 days before halving, bitcoin 500 day rule, halving cycle backtest, buy before halving",
      ogTitle: TITLE,
      ogDescription: DESCRIPTION,
      ogImageAlt: "BTC500 halving spacing test — 400, 500 and 600 days",
      twitterDescription: DESCRIPTION,
      schema: pageSchema,
      publishedTime: "2026-11-18",
      modifiedTime: "2026-11-18",
    }),
  loader: async ({ context }) => {
    // Seed the report before render so the tables are in the server HTML and a
    // crawler that does not run JavaScript still reads every number.
    await context.queryClient.ensureQueryData(spacingQuery);
  },
  component: HalvingSpacingPage,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});
