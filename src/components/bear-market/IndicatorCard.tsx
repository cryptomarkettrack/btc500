import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type IndicatorConfig,
  BOTTOMS,
  CHART_LINKS,
  formatValue,
  getStatusColor,
  getStatusText,
} from "@/lib/bear-market/config";

export function IndicatorCard({
  indicator,
  currentValue,
  bottomValues,
}: {
  indicator: IndicatorConfig;
  currentValue: number | null;
  bottomValues: (number | null)[];
}) {
  const status = getStatusText(indicator.name, currentValue);
  const tierLabel = indicator.tier === 1 ? "Tier 1" : indicator.tier === 2 ? "Tier 2" : "Tier 3";
  const tierColor =
    indicator.tier === 1
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : indicator.tier === 2
        ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
        : "bg-blue-500/10 text-blue-400 border-blue-500/20";
  const link = indicator.bitviewLink || CHART_LINKS[indicator.name];

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{indicator.name}</CardTitle>
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${tierColor}`}>
              {tierLabel} · {indicator.points}pt
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{indicator.description}</p>
      </CardHeader>
      <CardContent>
        {/* Current Value */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="text-lg font-bold font-mono">
              {formatValue(currentValue, indicator.apiName)}
            </div>
          </div>
          <Badge variant={getStatusColor(indicator.name, currentValue)} className="text-xs">
            {status}
          </Badge>
        </div>

        {/* Bottom Values */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">At Bear Market Bottoms</div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {BOTTOMS.map((b, i) => (
              <div key={b.label} className="text-xs">
                <div className="text-muted-foreground">{b.label}</div>
                <div className="font-mono text-[10px]">
                  {bottomValues[i] !== null ? formatValue(bottomValues[i], indicator.apiName) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threshold */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Signal:</span> {indicator.currentThreshold}
        </div>

        {/* Link to BitView */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on BitView <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
