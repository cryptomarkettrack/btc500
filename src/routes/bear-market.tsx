import { createFileRoute } from "@tanstack/react-router";
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
  component: BearMarketDashboard,
  head: () =>
    generatePageHead({
      path: "/bear-market",
      title: "Bitcoin Bear Market Bottom Indicators — On-Chain Signal Score | BTC500",
      description:
        "Track Bitcoin bear market bottom signals with live on-chain indicators: MVRV, NUPL, Puell Multiple, SOPR and more. Composite score across historical cycle bottoms.",
      keywords:
        "Bitcoin bear market, bottom indicators, MVRV, NUPL, Puell Multiple, on-chain analysis, Bitcoin bottom, cycle bottom score",
      ogTitle: "Bitcoin Bear Market Bottom Indicators | BTC500",
      ogDescription:
        "Live on-chain bear market bottom score using historical cycle indicators.",
      ogImageAlt: "Bitcoin Bear Market Bottom Indicators Dashboard",
      schema: bearMarketSchema,
    }),
});
