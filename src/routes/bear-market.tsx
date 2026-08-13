import { createFileRoute } from "@tanstack/react-router";
import { getBearMarketData, type BearMarketIndicatorData } from "@/lib/bear-market.functions";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { BearMarketDashboard } from "@/components/bear-market/BearMarketDashboard";

const bearMarketSchema = generateWebPageSchema({
  path: "/bear-market",
  name: "Bitcoin Bear Market Bottom Indicators — On-Chain Signal Score",
  description:
    "Track Bitcoin bear market bottom signals with live on-chain indicators: MVRV, NUPL, Puell Multiple, SOPR and more. Composite score across historical cycle bottoms.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Bear Market", path: "/bear-market" },
  ],
});

export const Route = createFileRoute("/bear-market")({
  component: BearMarketRoute,
  loader: async (): Promise<BearMarketIndicatorData | null> => {
    try {
      return await getBearMarketData();
    } catch (e) {
      console.error("[bear-market] Loader error:", e);
      return null;
    }
  },
  head: () =>
    generatePageHead({
      path: "/bear-market",
      title: "Bitcoin Bear Market Bottom Indicators | BTC500",
      description:
        "Track Bitcoin bear market bottom signals with live on-chain indicators like MVRV, NUPL, Puell Multiple and SOPR — a composite cycle-bottom score.",
      keywords:
        "Bitcoin bear market, bottom indicators, MVRV, NUPL, Puell Multiple, on-chain analysis, Bitcoin bottom, cycle bottom score",
      ogTitle: "Bitcoin Bear Market Bottom Indicators | BTC500",
      ogDescription: "Live on-chain bear market bottom score using historical cycle indicators.",
      ogImageAlt: "Bitcoin Bear Market Bottom Indicators Dashboard",
      schema: bearMarketSchema,
    }),
});

function BearMarketRoute() {
  const initialData = Route.useLoaderData();
  return <BearMarketDashboard initialData={initialData} />;
}
