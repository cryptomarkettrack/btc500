import { useNow } from "@/hooks/use-now";
import type { SignalPriceData } from "@/lib/buy-signal.functions";
import {
  BUY_POINT_LABEL,
  CYCLE_HIGH_USD,
  daysToBuyPoint,
  drawdownFromHigh,
} from "@/lib/buy-signal";
import { formatIsoDay, formatUsd } from "@/lib/format";

/** Three live-context cards shared by the homepage hero and the viral page. */
export function SignalContextStrip({ signal }: { signal: SignalPriceData }) {
  const now = useNow(60_000);
  const drawdown = drawdownFromHigh(signal.price);
  const days = daysToBuyPoint(now);

  return (
    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
      <Card
        label="BTC price · last close"
        value={signal.price == null ? "—" : formatUsd(signal.price)}
        detail={
          signal.date
            ? `${formatIsoDay(signal.date)} close · ${signal.source}`
            : "Archive unavailable"
        }
      />
      <Card
        label={`Drawdown from $${CYCLE_HIGH_USD.toLocaleString("en-US")} high`}
        value={drawdown == null ? "—" : `${drawdown.toFixed(2)}%`}
        detail="October 2025 cycle high"
        tone={drawdown != null && drawdown < 0 ? "loss" : undefined}
      />
      <Card
        label={days >= 0 ? "Days until buy point" : "Days since buy point"}
        value={days === 0 ? "TODAY" : String(Math.abs(days))}
        detail={`Buy point ${BUY_POINT_LABEL}`}
        tone="accent"
      />
    </dl>
  );
}

function Card({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "accent" | "loss";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--panel)] px-4 py-3.5">
      <dt className="font-data text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd
        suppressHydrationWarning
        className={`font-data mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl ${
          tone === "accent"
            ? "text-primary"
            : tone === "loss"
              ? "text-destructive"
              : "text-foreground"
        }`}
      >
        {value}
      </dd>
      <dd className="font-data mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {detail}
      </dd>
    </div>
  );
}
