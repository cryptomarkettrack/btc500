import { createFileRoute } from "@tanstack/react-router";
import { MacroImpactPage } from "@/components/macro-impact/MacroImpactPage";

export const Route = createFileRoute("/macro-impact")({
  component: () => <MacroImpactPage initialData={null} />,
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
