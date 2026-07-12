import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHalvingInfo, getBtcPrice } from "@/lib/btc.functions";
import { computeCycle, formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { BtcLogo } from "@/components/BtcLogo";

const halvingQuery = queryOptions({
  queryKey: ["halving"],
  queryFn: () => getHalvingInfo(),
  staleTime: 60 * 60_000,
  refetchInterval: 60 * 60_000,
});

const priceQuery = queryOptions({
  queryKey: ["btc-price"],
  queryFn: () => getBtcPrice(),
  staleTime: 60_000,
  refetchInterval: 60_000,
});

export const Route = createFileRoute("/embed")({
  head: () => ({
    meta: [{ title: "BTC500 Embed" }, { name: "robots", content: "noindex" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(halvingQuery);
    context.queryClient.ensureQueryData(priceQuery);
  },
  component: Embed,
});

function Embed() {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const priceRes = useSuspenseQuery(priceQuery);
  const now = new Date();

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );

  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";
  const price = priceRes.data?.price ?? null;
  const investment = 50000;
  const value = sell && price ? (investment / 60000) * price : 0;
  const pnl = value - investment;
  const pnlPct = investment ? (pnl / investment) * 100 : 0;

  const primaryColor = "#f97316";
  const sellColor = "#16a34a";
  const completeColor = "#2563eb";
  const accent = buy ? primaryColor : sell ? sellColor : completeColor;
  const accentSoft = buy ? "#fef3e7" : sell ? "#e6f7ed" : "#f1f5f9";
  const accentBg = buy ? "#fff7ed" : sell ? "#f0fdf4" : "#eff6ff";

  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const elapsed = totalDays - days;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fff",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BtcLogo size={40} color="#000" />
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            BTC 500
          </div>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 100,
            background: accentSoft,
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: accent,
          }}
        >
          {buy ? "Waiting to Buy" : sell ? "Waiting to Sell" : "Cycle Complete"}
        </div>
      </div>

      {/* Countdown */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#94a3b8",
            marginBottom: 8,
          }}
        >
          {buy ? "Days Until Buy Window" : sell ? "Days Until Sell Window" : "Cycle Complete"}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#64748b",
            marginBottom: 24,
          }}
        >
          {buy ? "500 days before halving" : sell ? "500 days after halving" : "Next cycle loading"}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 120,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-0.07em",
              color: accent,
            }}
          >
            {days}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#94a3b8",
              paddingBottom: 16,
            }}
          >
            days
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 500, margin: "32px auto 0" }}>
          <div
            style={{
              height: 12,
              width: "100%",
              overflow: "hidden",
              borderRadius: 999,
              background: "#f1f5f9",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: accent,
                width: `${progress * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            <span style={{ fontWeight: 600, color: "#475569" }}>
              {Math.max(0, elapsed)} days elapsed
            </span>
            <span style={{ fontWeight: 600, color: "#475569" }}>{totalDays} days total</span>
          </div>
        </div>

        {/* Sell stats */}
        {sell && price ? (
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 24,
              fontSize: 20,
              color: "#334155",
              background: accentBg,
              borderRadius: 16,
              padding: "16px 24px",
              border: `1px solid ${accentSoft}`,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                Value
              </div>
              <div style={{ fontWeight: 700 }}>{formatUsd(value)}</div>
            </div>
            <div style={{ width: 1, background: accentSoft }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                Profit
              </div>
              <div style={{ fontWeight: 700, color: sellColor }}>
                +{formatUsd(pnl)} ({pnlPct.toFixed(0)}%)
              </div>
            </div>
            <div style={{ width: 1, background: accentSoft }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                BTC Price
              </div>
              <div style={{ fontWeight: 700 }}>{formatUsd(price)}</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom info */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingTop: 20,
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          fontSize: 13,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#94a3b8",
              marginBottom: 4,
            }}
          >
            Next Halving
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatDate(cycle.nextHalving)}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {formatUtc(cycle.nextHalving)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#94a3b8",
              marginBottom: 4,
            }}
          >
            Buy Date
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatDate(cycle.buyDate)}</div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#94a3b8",
              marginBottom: 4,
            }}
          >
            Sell Date
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatDate(cycle.sellDate)}</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 12,
          color: "#94a3b8",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}
      >
        btc500.vercel.app
      </div>
    </div>
  );
}
