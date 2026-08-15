import { createFileRoute } from "@tanstack/react-router";
import { simulatorQuery } from "@/lib/queries";
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

const simulatorPageSchema = [
  generateWebPageSchema({
    path: "/simulator",
    name: "BTC500 Simulator — What $50,000 Did Across Bitcoin Halvings",
    description:
      "Backtest the BTC500 rule with real Bitcoin prices. Reinvest $50,000 through every completed cycle since 2012, or run the same amount in each 500-day window.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Simulator", path: "/simulator" },
    ],
    dateModified: "2026-08-15",
  }),
  generateDatasetSchema(),
  generateFaqSchema(SIMULATOR_FAQ),
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
      title: "BTC500 Simulator — What $50,000 Did Across Bitcoin Halvings",
      description:
        "Backtest the BTC500 rule with real prices. Reinvest $50,000 through every completed cycle since 2012, or run the same amount each window.",
      keywords:
        "Bitcoin halving simulator, BTC500 calculator, Bitcoin investment returns, $50000 Bitcoin, reinvest Bitcoin halving, halving cycle returns, Bitcoin strategy backtest, crypto investment calculator, Bitcoin profit calculator",
      ogTitle: "BTC500 Simulator — What $50,000 Did Across Bitcoin Halvings",
      ogDescription:
        "Reinvest $50,000 through every completed BTC500 window since 2012, or run the same amount each cycle. Real historical prices. Not financial advice.",
      ogImageAlt: "BTC500 Simulator — Bitcoin Investment Returns Calculator",
      twitterDescription:
        "Backtest the BTC500 rule with $50,000 across every completed Bitcoin halving cycle.",
      schema: simulatorPageSchema,
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(simulatorQuery),
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
