interface StatsCardProps {
  label: string;
  sublabel: string;
  value: string;
  accent: "green" | "red" | "neutral";
  detail?: string;
}

const accentStyles = {
  green: "border-green-500/30 bg-green-500/5",
  red: "border-red-500/30 bg-red-500/5",
  neutral: "border-border/60 bg-card",
};

const valueStyles = {
  green: "text-green-400",
  red: "text-red-400",
  neutral: "text-foreground",
};

export function StatsCard({ label, sublabel, value, accent, detail }: StatsCardProps) {
  return (
    <div
      className={`rounded-[24px] border p-5 transition-all hover:scale-[1.02] ${accentStyles[accent]}`}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mb-2 text-[11px] text-muted-foreground/60">{sublabel}</div>
      <div className={`text-2xl font-bold tracking-tight ${valueStyles[accent]}`}>{value}</div>
      {detail && <div className="mt-2 text-[11px] text-muted-foreground/60">{detail}</div>}
    </div>
  );
}
