import { createFileRoute } from "@tanstack/react-router";
import { PaperBuyPage } from "@/components/paper/PaperBuyPage";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { PAPER_FAQ } from "@/lib/paper-faq";
import { btcPriceQuery, simulatorQuery } from "@/lib/queries";
import {
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";

const PATH = "/paper-buy";
const TITLE = "BTC500 Public $50,000 Paper Buy — P&L Ledger";
const DESCRIPTION =
  "A public $50,000 paper Bitcoin position under the BTC500 rule: buy 500 days before the halving, sell 500 days after. Entry date, live P&L, price source and a dated daily mark.";

const pageSchema = [
  generateWebPageSchema({
    path: PATH,
    name: "BTC500 Public $50,000 Paper Buy",
    description: DESCRIPTION,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Paper Buy", path: PATH },
    ],
    datePublished: "2026-11-16",
    dateModified: "2026-11-16",
  }),
  generateSpeakableSchema({
    path: PATH,
    cssSelectors: [".lead", "#pnl", "#daily-line"],
  }),
  generateFaqSchema(PAPER_FAQ),
];

export const Route = createFileRoute("/paper-buy")({
  head: () =>
    generatePageHead({
      path: PATH,
      title: TITLE,
      description: DESCRIPTION,
      keywords:
        "bitcoin paper trading, $50,000 bitcoin, bitcoin P&L tracker, 500 day bitcoin rule, bitcoin halving strategy, public bitcoin portfolio, bitcoin cycle tracking",
      ogTitle: TITLE,
      ogDescription: DESCRIPTION,
      ogImageAlt: "BTC500 Public $50,000 Paper Buy — P&L Ledger",
      twitterDescription: DESCRIPTION,
      schema: pageSchema,
      publishedTime: "2026-11-16",
      modifiedTime: "2026-11-16",
    }),
  loader: async ({ context }) => {
    // Seed the live price and the historical cycles so the daily line and the
    // past-cycle table are present in the server-rendered HTML, not loaded later.
    await Promise.allSettled([
      context.queryClient.ensureQueryData(btcPriceQuery),
      context.queryClient.ensureQueryData(simulatorQuery),
    ]);
  },
  component: PaperBuyPage,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});
