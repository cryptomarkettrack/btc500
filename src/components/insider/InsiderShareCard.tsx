import { forwardRef } from "react";
import { BtcLogo } from "@/components/BtcLogo";
import { formatCompactUsd, formatCompactNumber } from "@/lib/format";
import type { InsiderSummary } from "@/lib/insider-trading";

interface Props {
  data: InsiderSummary;
}

const TYPE_COLORS: Record<string, string> = {
  Buy: "#16a34a",
  Sale: "#dc2626",
  "Proposed Sale": "#ea580c",
  "Option Exercise": "#9333ea",
};

/**
 * Fixed-size social card summarizing SEC Form 4 insider trading distribution.
 * Inline styles for reliable html-to-image capture.
 */
export const InsiderShareCard = forwardRef<HTMLDivElement, Props>(function InsiderShareCard(
  { data },
  ref,
) {
  const accent = "#f97316";
  const accentSoft = "#fef3e7";
  const foreground = "#0f172a";
  const muted = "#64748b";

  const totalValue =
    data.buyTotalValue + data.saleTotalValue + data.proposedSaleTotalValue + data.optionTotalValue;
  const totalCount = data.buys + data.sales + data.proposedSales + data.options;
  const countDenom = data.buys + data.sales + data.proposedSales || 1;
  const volumeDenom =
    data.buyTotalValue + data.saleTotalValue + data.proposedSaleTotalValue || 1;

  const buyCountPct = Math.round((data.buys / countDenom) * 100);
  const saleCountPct = Math.round((data.sales / countDenom) * 100);
  const proposedCountPct = Math.round((data.proposedSales / countDenom) * 100);

  const buyVolumePct = Math.round((data.buyTotalValue / volumeDenom) * 100);
  const saleVolumePct = Math.round((data.saleTotalValue / volumeDenom) * 100);
  const proposedVolumePct = Math.round((data.proposedSaleTotalValue / volumeDenom) * 100);

  const segments = [
    { name: "Buy", count: data.buys, value: data.buyTotalValue, color: TYPE_COLORS.Buy },
    { name: "Sale", count: data.sales, value: data.saleTotalValue, color: TYPE_COLORS.Sale },
    {
      name: "Proposed Sale",
      count: data.proposedSales,
      value: data.proposedSaleTotalValue,
      color: TYPE_COLORS["Proposed Sale"],
    },
    {
      name: "Option Exercise",
      count: data.options,
      value: data.optionTotalValue,
      color: TYPE_COLORS["Option Exercise"],
    },
  ].filter((s) => s.count > 0);

  const fetchLabel = data.fetchDate
    ? new Date(data.fetchDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Simple donut via conic-gradient for capture reliability (no recharts in share card)
  let angleCursor = 0;
  const conicStops: string[] = [];
  for (const s of segments) {
    const pct = totalValue > 0 ? s.value / totalValue : s.count / (totalCount || 1);
    const start = angleCursor * 360;
    angleCursor += pct;
    const end = angleCursor * 360;
    conicStops.push(`${s.color} ${start}deg ${end}deg`);
  }
  const conic = conicStops.length > 0 ? `conic-gradient(${conicStops.join(", ")})` : "#f1f5f9";

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fff",
        borderRadius: 32,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 20px 60px -20px rgba(0,0,0,0.08)",
        color: foreground,
      }}
    >
      {/* Left accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 16,
          background: accent,
        }}
      />

      {/* Watermark */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          right: -60,
          bottom: -60,
          opacity: 0.05,
        }}
      >
        <BtcLogo size={420} color="#000" />
      </div>

      {/* Header */}
      <div style={{ padding: "40px 48px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: accentSoft,
              }}
            >
              <BtcLogo size={28} color={accent} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: foreground,
                }}
              >
                BTC 500
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: muted, marginTop: 2 }}>
                Insider Trading Dashboard
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              borderRadius: 100,
              background: accentSoft,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: accent,
              }}
            >
              SEC Form 4
            </span>
          </div>
        </div>
      </div>

      {/* Hero stats */}
      <div style={{ padding: "36px 48px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#94a3b8",
                marginBottom: 6,
              }}
            >
              Transactions
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: foreground,
              }}
            >
              {formatCompactNumber(data.total)}
            </div>
          </div>
          <div style={{ width: 1, height: 64, background: "rgba(0,0,0,0.06)", marginBottom: 8 }} />
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#94a3b8",
                marginBottom: 6,
              }}
            >
              Total Value
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: accent,
              }}
            >
              {formatCompactUsd(totalValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution + donut */}
      <div
        style={{
          padding: "32px 48px 0",
          display: "flex",
          gap: 40,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Donut */}
        <div style={{ position: "relative", width: 280, height: 280, flexShrink: 0 }}>
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: conic,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 56,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em" }}>
              BUY SHARE
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: TYPE_COLORS.Buy, lineHeight: 1.1 }}>
              {buyVolumePct}%
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: muted }}>by volume</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: TYPE_COLORS.Buy,
                marginTop: 4,
              }}
            >
              {buyCountPct}%
              <span style={{ fontSize: 12, fontWeight: 600, color: muted, marginLeft: 4 }}>
                count
              </span>
            </div>
          </div>
        </div>

        {/* Legend rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {segments.map((s) => {
            const pct =
              totalValue > 0
                ? ((s.value / totalValue) * 100).toFixed(1)
                : ((s.count / (totalCount || 1)) * 100).toFixed(1);
            return (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    marginLeft: 14,
                    fontSize: 18,
                    fontWeight: 700,
                    color: foreground,
                  }}
                >
                  {s.name}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>
                    {formatCompactUsd(s.value)}
                  </div>
                  <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>
                    {s.count} txs · {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ratio bars — volume + count */}
      <div style={{ padding: "24px 48px 0", position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#94a3b8",
            marginBottom: 12,
          }}
        >
          Buy / Sale Ratio
        </div>
        <ShareRatioBar
          label="By volume"
          buyPct={buyVolumePct}
          salePct={saleVolumePct}
          proposedPct={proposedVolumePct}
        />
        <div style={{ height: 12 }} />
        <ShareRatioBar
          label="By count"
          buyPct={buyCountPct}
          salePct={saleCountPct}
          proposedPct={proposedCountPct}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "22px 48px 32px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.4 }}>
          Real-time SEC Form 4 filings · Source: Finviz
          {fetchLabel ? ` · ${fetchLabel}` : ""}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: "0.08em",
          }}
        >
          btc500.net
        </div>
      </div>
    </div>
  );
});

function ShareRatioBar({
  label,
  buyPct,
  salePct,
  proposedPct,
}: {
  label: string;
  buyPct: number;
  salePct: number;
  proposedPct: number;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          height: 28,
          width: "100%",
          overflow: "hidden",
          borderRadius: 8,
        }}
      >
        {buyPct > 0 && (
          <div
            style={{
              width: `${buyPct}%`,
              background: TYPE_COLORS.Buy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {buyPct >= 12 ? `${buyPct}% Buys` : ""}
          </div>
        )}
        {salePct > 0 && (
          <div
            style={{
              width: `${salePct}%`,
              background: TYPE_COLORS.Sale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {salePct >= 12 ? `${salePct}% Sales` : ""}
          </div>
        )}
        {proposedPct > 0 && (
          <div
            style={{
              width: `${proposedPct}%`,
              background: TYPE_COLORS["Proposed Sale"],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {proposedPct >= 12 ? `${proposedPct}% Prop.` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
