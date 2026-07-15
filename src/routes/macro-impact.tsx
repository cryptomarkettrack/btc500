import { createFileRoute } from "@tanstack/react-router";
import type { DashboardData } from "@/lib/macro-impact/types";
import { MacroImpactPage } from "@/components/macro-impact/MacroImpactPage";

function MacroImpactLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <span className="h-5 w-5 rounded-full bg-primary/30" />
            </span>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Market Intelligence
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Macro Impact</h1>
        </div>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Fetching CPI, PPI & Bitcoin price data...
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              This may take a few seconds as we query multiple data sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/macro-impact")({
  component: () => {
    const data = Route.useLoaderData();
    return <MacroImpactPage initialData={data} />;
  },
  pendingComponent: MacroImpactLoading,
  loader: async (): Promise<DashboardData | null> => {
    try {
      const { getMacroImpactData } = await import("@/lib/macro-impact/server");
      const data = await getMacroImpactData();
      return data;
    } catch (e) {
      console.error("Failed to load macro impact data:", e);
      return null;
    }
  },
  head: () => ({
    meta: [
      { title: "Macro Impact — CPI & PPI Effect on Bitcoin | BTC500" },
      {
        name: "description",
        content:
          "Analyze how US CPI and PPI inflation releases historically affected Bitcoin. Interactive dashboard with every event, BTC performance, statistics, heatmaps, and insights.",
      },
    ],
  }),
});
