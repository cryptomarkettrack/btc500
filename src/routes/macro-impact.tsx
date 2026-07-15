import { createFileRoute } from "@tanstack/react-router";
import { getMacroImpactData } from "@/lib/macro-impact/server";
import type { DashboardData } from "@/lib/macro-impact/types";
import { MacroImpactPage } from "@/components/macro-impact/MacroImpactPage";

export const Route = createFileRoute("/macro-impact")({
  component: () => {
    const data = Route.useLoaderData();
    return <MacroImpactPage initialData={data} />;
  },
  loader: async (): Promise<DashboardData | null> => {
    try {
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