import { createFileRoute } from "@tanstack/react-router";
import { Bitcoin500DayCyclePage } from "@/components/cycle/Bitcoin500DayCyclePage";
import { CYCLE_FAQ } from "@/lib/cycle-faq";
import { buildCycleDatasetSchema } from "@/lib/cycle-dataset";
import { computeCycle } from "@/lib/phase";
import { buildPillarSnippet } from "@/lib/pillar-snippet";
import { btcPriceQuery, halvingQuery, simulatorQuery } from "@/lib/queries";
import {
  generateFaqSchema,
  generateGraphSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
  SITE_URL,
} from "@/lib/site";
import { RoutePending } from "@/components/route/RoutePending";
import { RouteDataError, RouteNotFound } from "@/components/route/RouteDataError";

const PATH = "/bitcoin-500-day-cycle";

/**
 * The site's three-step rule, stated verbatim by the How It Works cards on the
 * homepage and described in this page's "What is the Bitcoin 500-day rule?"
 * section. No step wording or duration is invented here.
 */
const ruleSteps = [
  {
    name: "Buy 500 days before",
    text: "Put the buy order on the date the countdown names — 500 days before the next halving, whatever day that lands on.",
    url: `${SITE_URL}/#step-buy`,
  },
  {
    name: "Hold through the halving",
    text: "Hold the position as the event passes. Supply halves; the window does the waiting.",
    url: `${SITE_URL}/#step-hold`,
  },
  {
    name: "Sell 500 days after",
    text: "Exit on the dated T+500 date, then wait for the next cycle. Two trades, every four years.",
    url: `${SITE_URL}/#step-sell`,
  },
];

function buildPageSchema({ title, description }: { title: string; description: string }) {
  const orgRef = { "@id": `${SITE_URL}/#organization` };

  return generateGraphSchema([
    generateWebPageSchema({
      path: PATH,
      name: "The Bitcoin 500-Day Halving Rule",
      description:
        "The Bitcoin 500-day rule buys 500 days before each Bitcoin halving and sells 500 days after. All four completed windows with entry, exit, drawdowns and an entry-timing test from a daily close archive.",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Bitcoin 500-Day Cycle", path: PATH },
      ],
      datePublished: "2026-08-15",
      dateModified: "2026-10-27",
    }),
    generateSpeakableSchema({
      path: PATH,
      cssSelectors: [".lead"],
    }),
    generateFaqSchema(CYCLE_FAQ),
    buildCycleDatasetSchema(),
    {
      "@type": "Article",
      headline: title,
      description,
      author: orgRef,
      publisher: orgRef,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${PATH}` },
      about: [
        { "@type": "Thing", name: "Bitcoin halving" },
        { "@type": "Thing", name: "BTC500 strategy" },
      ],
      dateModified: new Date().toISOString().slice(0, 10),
    },
    {
      "@type": "HowTo",
      name: "Bitcoin 500-Day Rule",
      description:
        "The Bitcoin 500-day rule is the fixed-window framing of that event: buy at T-500, exactly 500 days before the halving, and sell at T+500, exactly 500 days after it.",
      totalTime: "P1000D",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
      step: ruleSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        ...step,
      })),
    },
  ]);
}

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
      path: PATH,
      ogType: "article",
      title: snippet.title,
      description: snippet.description,
      keywords:
        "bitcoin 500 day cycle, 500 days before the next bitcoin halving, when is 500 days before the next bitcoin halving, Bitcoin 500 days before halving, 500 days after Bitcoin halving, Bitcoin halving cycle, when to buy Bitcoin before halving",
      ogTitle: snippet.title,
      ogDescription: snippet.description,
      ogImageAlt: "Bitcoin 500-Day Cycle — BTC500",
      twitterDescription: snippet.description,
      schema: buildPageSchema({ title: snippet.title, description: snippet.description }),
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
