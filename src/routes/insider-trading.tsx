import { createFileRoute } from "@tanstack/react-router";
import {
  getInsiderTrading,
  type InsiderSummary,
} from "@/lib/insider-trading";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { InsiderTradingDashboard } from "@/components/insider/InsiderTradingDashboard";

const insiderSchema = generateWebPageSchema({
  path: "/insider-trading",
  name: "Insider Trading Dashboard — SEC Form 4 Buy vs Sell Analysis",
  description:
    "Real-time insider trading data from SEC Form 4 filings. Analyze insider buy vs sell ratios and track corporate insider transactions.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Insider Trading", path: "/insider-trading" },
  ],
});

export const Route = createFileRoute("/insider-trading")({
  component: InsiderTradingRoute,
  loader: async (): Promise<InsiderSummary | null> => {
    try {
      return await getInsiderTrading();
    } catch (e) {
      console.error("[insider-trading] Loader error:", e);
      return null;
    }
  },
  errorComponent: ({ error }: { error: Error }) => {
    console.error("[insider-trading] Route error:", error);
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Insider Trading Dashboard</h1>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 mb-2">Failed to load insider trading data</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || "Please try again later"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  },
  head: () =>
    generatePageHead({
      path: "/insider-trading",
      title: "Insider Trading Dashboard — SEC Form 4 Buy vs Sell Analysis | BTC500",
      description:
        "Real-time insider trading data from SEC Form 4 filings. Analyze insider buy vs sell ratios, track corporate insider transactions, and identify market sentiment trends with interactive charts.",
      keywords:
        "insider trading, SEC Form 4, insider buying, insider selling, corporate insiders, stock market insider transactions, insider trading dashboard, buy sell ratio, insider sentiment, SEC filings",
      ogTitle: "Insider Trading Dashboard — SEC Form 4 Analysis | BTC500",
      ogDescription:
        "Real-time insider trading data from SEC Form 4 filings. Track insider buy vs sell ratios, transaction values, and identify market sentiment from corporate executives.",
      ogImageAlt: "Insider Trading Dashboard — SEC Form 4 Buy vs Sell Analysis",
      twitterTitle: "Insider Trading Dashboard — SEC Form 4 Analysis",
      twitterDescription:
        "Real-time SEC insider trading data. Analyze corporate insider buy/sell ratios.",
      schema: insiderSchema,
    }),
});

function InsiderTradingRoute() {
  const initialData = Route.useLoaderData();
  return <InsiderTradingDashboard initialData={initialData} />;
}
