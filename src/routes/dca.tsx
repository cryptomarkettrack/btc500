import { createFileRoute } from "@tanstack/react-router";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { dcaQuery, simulatorQuery } from "@/lib/queries";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { DcaComparisonPage } from "@/components/dca/DcaComparisonPage";

const dcaPageSchema = generateWebPageSchema({
  path: "/dca",
  name: "DCA vs Lump Sum — BTC500 Bitcoin Halving Strategy Comparison",
  description:
    "Compare dollar-cost-averaging (DCA) vs lump sum investing with the BTC500 Bitcoin halving strategy. See if spreading your buy/sell over days beats going all-in at once.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "DCA vs Lump Sum", path: "/dca" },
  ],
});

export const Route = createFileRoute("/dca")({
  head: () =>
    generatePageHead({
      path: "/dca",
      title: "DCA vs Lump Sum — Bitcoin Halving Strategy | BTC500",
      description:
        "Compare dollar-cost-averaging (DCA) vs lump sum with the BTC500 halving strategy. See if spreading your buy/sell beats going all-in at once.",
      keywords:
        "Bitcoin DCA, lump sum vs DCA, dollar cost averaging Bitcoin, BTC500 strategy comparison, Bitcoin halving DCA, crypto investment strategy, lump sum investing",
      ogTitle: "DCA vs Lump Sum — BTC500 Bitcoin Halving Strategy Comparison",
      ogDescription:
        "Compare DCA vs lump sum investing with the BTC500 strategy. See if spreading your buy/sell over days beats going all-in at once.",
      ogImageAlt: "DCA vs Lump Sum — BTC500 Strategy Comparison",
      twitterDescription:
        "Compare DCA vs lump sum investing with the BTC500 strategy across past halving cycles.",
      schema: dcaPageSchema,
    }),
  loader: async ({ context }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData(simulatorQuery),
      context.queryClient.ensureQueryData(dcaQuery(30, 0)),
    ]);
  },
  component: DcaComparisonPage,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});
