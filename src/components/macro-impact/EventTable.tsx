import type { MacroEvent } from "@/lib/macro-impact/types";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface EventTableProps {
  events: MacroEvent[];
  total: number;
}

function fmtPct(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function fmtDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function returnColor(v: number | null): string {
  if (v === null) return "text-muted-foreground/40";
  if (v > 0) return "text-green-400";
  if (v < 0) return "text-red-400";
  return "text-muted-foreground";
}

function classificationBadge(c: MacroEvent["classification"]) {
  const styles = {
    bullish_surprise: "bg-green-500/10 text-green-400",
    bearish_surprise: "bg-red-500/10 text-red-400",
    neutral: "bg-muted/60 text-muted-foreground",
  };
  const labels = {
    bullish_surprise: "Bullish",
    bearish_surprise: "Bearish",
    neutral: "Neutral",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[c]}`}
    >
      {labels[c]}
    </span>
  );
}

function ClassIcon({ classification }: { classification: MacroEvent["classification"] }) {
  if (classification === "bullish_surprise")
    return <ArrowUpRight className="h-3 w-3 text-green-400" />;
  if (classification === "bearish_surprise")
    return <ArrowDownRight className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-muted-foreground/40" />;
}

export function EventTable({ events, total }: EventTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-[24px] border border-border/60 bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No events match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-border/60 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-right">Actual</th>
              <th className="px-3 py-3 text-right">Forecast</th>
              <th className="px-3 py-3 text-right">Previous</th>
              <th className="px-3 py-3 text-center">Signal</th>
              <th className="px-3 py-3 text-right">1h</th>
              <th className="px-3 py-3 text-right">4h</th>
              <th className="px-3 py-3 text-right">24h</th>
              <th className="px-3 py-3 text-right">3d</th>
              <th className="px-3 py-3 text-right">7d</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, i) => (
              <tr
                key={`${ev.release.date}-${ev.release.indicator}-${i}`}
                className="border-b border-border/30 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                  {fmtDate(ev.release.date)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ev.release.indicator === "CPI"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-orange-500/10 text-orange-400"
                    }`}
                  >
                    {ev.release.indicator}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-xs font-medium">
                  {ev.release.actual ?? "—"}
                </td>
                <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                  {ev.release.forecast ?? "—"}
                </td>
                <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                  {ev.release.previous ?? "—"}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center gap-1">
                    <ClassIcon classification={ev.classification} />
                    {classificationBadge(ev.classification)}
                  </span>
                </td>
                <td
                  className={`px-3 py-3 text-right text-xs font-bold tabular-nums ${returnColor(ev.performance.returns.h1)}`}
                >
                  {fmtPct(ev.performance.returns.h1)}
                </td>
                <td
                  className={`px-3 py-3 text-right text-xs font-bold tabular-nums ${returnColor(ev.performance.returns.h4)}`}
                >
                  {fmtPct(ev.performance.returns.h4)}
                </td>
                <td
                  className={`px-3 py-3 text-right text-xs font-bold tabular-nums ${returnColor(ev.performance.returns.h24)}`}
                >
                  {fmtPct(ev.performance.returns.h24)}
                </td>
                <td
                  className={`px-3 py-3 text-right text-xs font-bold tabular-nums ${returnColor(ev.performance.returns.d3)}`}
                >
                  {fmtPct(ev.performance.returns.d3)}
                </td>
                <td
                  className={`px-3 py-3 text-right text-xs font-bold tabular-nums ${returnColor(ev.performance.returns.d7)}`}
                >
                  {fmtPct(ev.performance.returns.d7)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/30 px-4 py-2 text-[10px] text-muted-foreground/60">
        Showing {events.length} of {total} events
      </div>
    </div>
  );
}
