import { createFileRoute } from "@tanstack/react-router";
import { simulatorQuery } from "@/lib/queries";
import { unavailableSimulatorResult } from "@/lib/simulator.functions";
import { SIMULATOR_FAQ } from "@/lib/simulator-faq";
import {
  mergeSimulatorSearch,
  parseSimulatorSearch,
  type SimulatorSearch,
} from "@/lib/simulator-math";
import {
  SITE_URL,
  generateDatasetSchema,
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
} from "@/lib/site";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";
import { SimulatorPage } from "@/components/simulator/SimulatorPage";

const simulatorHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to backtest the BTC500 Bitcoin strategy",
  description:
    "Enter a starting amount, choose whether to reinvest profits, pick the first halving cycle, and read the historical result of buying 500 days before each Bitcoin halving and selling 500 days after.",
  totalTime: "PT2M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "0",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Enter a starting amount",
      text: "Type a dollar amount or pick a preset from $10,000 to $1,000,000. The default is $50,000 so the historical result is easy to read.",
      url: `${SITE_URL}/simulator#sim-amount`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Choose reinvest or the same amount each cycle",
      text: "Reinvest rolls every sell into the next buy date. Same amount each cycle invests a fresh copy of your number in every window and adds the results.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Pick the first cycle",
      text: "Start in 2012, 2016, 2020, or 2024. Later start years use the same rule at a higher Bitcoin price, so the dollar result is smaller.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Read the backtest",
      text: "Compare reinvest, repeating the same cash each cycle, and buying on the first buy date and holding until the last sell date. Past performance does not guarantee future results.",
    },
  ],
};

const simulatorAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BTC500 Bitcoin Halving Simulator",
  url: `${SITE_URL}/simulator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  description:
    "Free backtest of the Bitcoin 500-day cycle: buy 500 days before each halving and sell 500 days after, using historical daily prices.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "T-500 and T+500 backtest",
    "Custom starting amount including $500 and $1,000",
    "Reinvest or repeat the same cash each cycle",
    "Buy-and-hold comparison",
    "2012, 2016, 2020, and 2024 windows",
  ],
};

const simulatorPageSchema = [
  generateWebPageSchema({
    path: "/simulator",
    name: "Bitcoin Halving Simulator — 500-Day Cycle",
    description:
      "What would $500, $1,000, or another amount have become if invested 500 days before a Bitcoin halving? Backtest the BTC500 500-day cycle with real prices.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Simulator", path: "/simulator" },
    ],
    dateModified: "2026-08-15",
  }),
  generateDatasetSchema(),
  generateFaqSchema(SIMULATOR_FAQ),
  simulatorAppSchema,
  generateSpeakableSchema({
    path: "/simulator",
    cssSelectors: [".lead"],
  }),
  simulatorHowToSchema,
];

export const Route = createFileRoute("/simulator")({
  validateSearch: (search: Record<string, unknown>): SimulatorSearch =>
    parseSimulatorSearch(search),
  head: () =>
    generatePageHead({
      path: "/simulator",
      title: "Bitcoin Halving Simulator — 500-Day Cycle | BTC500",
      description:
        "What would $500, $1,000, or another investment have become if invested 500 days before a Bitcoin halving? Real historical prices. Not financial advice.",
      keywords:
        "Bitcoin halving simulator, Bitcoin 500 day cycle, BTC500 calculator, $500 Bitcoin, $1000 Bitcoin, 500 days before Bitcoin halving, Bitcoin strategy backtest",
      ogTitle: "Bitcoin Halving Simulator — 500-Day Cycle | BTC500",
      ogDescription:
        "See what $500, $1,000, or another amount would have become across Bitcoin’s 500-day halving windows. Real prices. Not financial advice.",
      ogImageAlt: "Bitcoin Halving Simulator — 500-Day Cycle | BTC500",
      twitterDescription:
        "Backtest $500, $1,000, or any amount across Bitcoin’s 500-day halving cycle.",
      schema: simulatorPageSchema,
    }),
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(simulatorQuery);
    } catch (err) {
      console.error("[simulator] loader failed; page will render without prices:", err);
      context.queryClient.setQueryData(
        simulatorQuery.queryKey,
        unavailableSimulatorResult("unknown", "upstream", "Historical data could not be loaded."),
      );
    }
  },
  component: SimulatorRoute,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
  notFoundComponent: RouteNotFound,
});

function SimulatorRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <SimulatorPage
      search={search}
      onChange={(patch) =>
        navigate({
          search: (prev) => mergeSimulatorSearch(prev, patch),
          replace: true,
        })
      }
    />
  );
}
