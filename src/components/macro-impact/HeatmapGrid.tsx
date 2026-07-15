import type { HeatmapCell } from "@/lib/macro-impact/types";

interface HeatmapGridProps {
  title: string;
  cells: HeatmapCell[];
  unit?: string;
}

function getHeatColor(value: number | null, allValues: number[]): string {
  if (value === null) return "bg-muted/30 text-muted-foreground/40";
  const max = Math.max(...allValues.filter((v) => v !== null).map(Math.abs), 0.01);
  const intensity = Math.min(Math.abs(value) / max, 1);
  if (value > 0) {
    if (intensity > 0.7) return "bg-green-500/30 text-green-400";
    if (intensity > 0.3) return "bg-green-500/15 text-green-400";
    return "bg-green-500/8 text-green-400/70";
  }
  if (value < 0) {
    if (intensity > 0.7) return "bg-red-500/30 text-red-400";
    if (intensity > 0.3) return "bg-red-500/15 text-red-400";
    return "bg-red-500/8 text-red-400/70";
  }
  return "bg-muted/30 text-muted-foreground";
}

export function HeatmapGrid({ title, cells, unit = "" }: HeatmapGridProps) {
  const validValues = cells.map((c) => c.value).filter((v): v is number => v !== null);

  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={`flex flex-col items-center justify-center rounded-lg px-1 py-2 text-center transition-colors ${getHeatColor(cell.value, validValues)}`}
          >
            <span className="text-[10px] font-bold tabular-nums">
              {cell.value !== null
                ? `${cell.value > 0 ? "+" : ""}${cell.value.toFixed(1)}${unit}`
                : "—"}
            </span>
            <span className="mt-0.5 text-[8px] text-muted-foreground/60">{cell.label}</span>
            {cell.count > 0 && (
              <span className="text-[7px] text-muted-foreground/40">n={cell.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
