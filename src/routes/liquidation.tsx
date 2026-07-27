import { createFileRoute } from "@tanstack/react-router";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { LiquidationDashboard } from "@/components/liquidation/LiquidationDashboard";

const liquidationSchema = generateWebPageSchema({
  path: "/liquidation",
  name: "BTC Liquidation Dashboard — Bitcoin Futures OI, Funding & Long/Short",
  description:
    "Real-time Bitcoin futures liquidation data: live open interest, funding rates, long/short ratios, taker buy/sell volume and market analysis.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Liquidation", path: "/liquidation" },
  ],
});

export const Route = createFileRoute("/liquidation")({
  component: LiquidationDashboard,
  head: () =>
    generatePageHead({
      path: "/liquidation",
      title: "BTC Liquidation Dashboard — Bitcoin Futures OI, Funding & Long/Short | BTC500",
      description:
        "Real-time Bitcoin futures liquidation data: live open interest, funding rates, long/short ratios, taker buy/sell volume and market analysis from Binance Futures. Track BTC liquidations and market sentiment.",
      keywords:
        "Bitcoin liquidation, BTC futures, crypto liquidations, open interest Bitcoin, funding rate, long short ratio, BTC perpetual futures, Binance futures, liquidation heatmap, crypto derivatives, Bitcoin OI",
      ogTitle: "BTC Liquidation Dashboard — Live Bitcoin Futures Data | BTC500",
      ogDescription:
        "Real-time Bitcoin futures liquidation dashboard with OI, funding rates, long/short ratios, taker volume and market situation analysis. Track BTC liquidations live.",
      ogImageAlt: "BTC Liquidation Dashboard — Live Bitcoin Futures Analysis",
      twitterTitle: "BTC Liquidation Dashboard — Live Bitcoin Futures Data",
      twitterDescription:
        "Real-time Bitcoin futures liquidation dashboard with OI, funding rates, and L/S ratios.",
      schema: liquidationSchema,
    }),
});
