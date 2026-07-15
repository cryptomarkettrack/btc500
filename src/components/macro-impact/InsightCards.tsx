import type { MacroInsight } from "@/lib/macro-impact/types";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface InsightCardsProps {
  insights: MacroInsight[];
}

function insightStyle(type: MacroInsight["type"]) {
  switch (type) {
    case "positive":
      return "border-green-500/30 bg-green-500/5";
    case "negative":
      return "border-red-500/30 bg-red-500/5";
    case "neutral":
      return "border-border/60 bg-card";
  }
}

function insightIcon(type: MacroInsight["type"]) {
  switch (type) {
    case "positive":
      return <TrendingUp className="h-5 w-5 text-green-400" />;
    case "negative":
      return <TrendingDown className="h-5 w-5 text-red-400" />;
    case "neutral":
      return <Info className="h-5 w-5 text-blue-400" />;
  }
}

function insightMetricStyle(type: MacroInsight["type"]) {
  switch (type) {
    case "positive":
      return "text-green-400";
    case "negative":
      return "text-red-400";
    case "neutral":
      return "text-blue-400";
  }
}

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`rounded-[24px] border p-6 transition-all hover:scale-[1.01] ${insightStyle(insight.type)}`}
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              {insightIcon(insight.type)}
              <h3 className="text-sm font-semibold leading-tight">{insight.title}</h3>
            </div>
            {insight.metric && (
              <span
                className={`ml-2 shrink-0 text-lg font-bold ${insightMetricStyle(insight.type)}`}
              >
                {insight.metric}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{insight.description}</p>
        </div>
      ))}
    </div>
  );
}
