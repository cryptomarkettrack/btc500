import { forwardRef } from "react";
import { BtcLogo } from "./BtcLogo";

interface IndicatorData {
  name: string;
  current: number | null;
  status: string;
  tier: number;
}

interface Props {
  compositeScore: number;
  scoreLabel: string;
  triggeredCount: number;
  totalIndicators: number;
  indicators: IndicatorData[];
}

function getStatusColorHex(status: string): string {
  if (status.includes("✅")) return "#16a34a";
  if (status.includes("⚠️")) return "#d97706";
  if (status.includes("❌")) return "#dc2626";
  return "#64748b";
}

export const BearMarketShareCard = forwardRef<HTMLDivElement, Props>(function BearMarketShareCard(
  { compositeScore, scoreLabel, triggeredCount, totalIndicators, indicators },
  ref,
) {
  const accent =
    compositeScore >= 15
      ? "#16a34a"
      : compositeScore >= 10
        ? "#d97706"
        : compositeScore >= 5
          ? "#eab308"
          : "#dc2626";
  const accentSoft =
    compositeScore >= 15
      ? "#e6f7ed"
      : compositeScore >= 10
        ? "#fef3c7"
        : compositeScore >= 5
          ? "#fefce8"
          : "#fef2f2";

  // Group by tier
  const tier1 = indicators.filter((i) => i.tier === 1);
  const tier2 = indicators.filter((i) => i.tier === 2);
  const tier3 = indicators.filter((i) => i.tier === 3);

  const triggeredTier1 = tier1.filter((i) => i.status.includes("✅")).length;
  const triggeredTier2 = tier2.filter((i) => i.status.includes("✅")).length;
  const triggeredTier3 = tier3.filter((i) => i.status.includes("✅")).length;

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
          opacity: 0.06,
        }}
      >
        <BtcLogo size={420} color="#000" />
      </div>

      {/* ========== HEADER ========== */}
      <div
        style={{
          padding: "40px 48px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
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
                  color: "#0f172a",
                }}
              >
                BTC 500
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: 2,
                }}
              >
                Bear Market Bottom Indicator
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: accent,
              }}
            >
              Live in Analysis
            </span>
          </div>
        </div>
      </div>

      {/* ========== SCORE SECTION ========== */}
      <div
        style={{
          padding: "28px 48px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {/* Score */}
          <div style={{ textAlign: "center" }}>
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
              Score
            </div>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "center" }}
            >
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  color: accent,
                }}
              >
                {compositeScore}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              >
                / 30
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 72, background: "rgba(0,0,0,0.06)" }} />

          {/* Verdict */}
          <div style={{ flex: 1 }}>
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
              Verdict
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: accent,
                lineHeight: 1.1,
              }}
            >
              {scoreLabel}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              height: 10,
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
                width: `${(compositeScore / 30) * 100}%`,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            <span style={{ fontWeight: 600, color: "#475569" }}>
              {triggeredCount} of {totalIndicators} indicators triggered
            </span>
            <span style={{ fontWeight: 600, color: "#475569" }}>30 pts max</span>
          </div>
        </div>
      </div>

      {/* ========== TIER BREAKDOWNS ========== */}
      <div
        style={{
          padding: "20px 48px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tier badges */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <TierBadge
            label="Tier 1"
            triggered={triggeredTier1}
            total={tier1.length}
            color="#dc2626"
            points="3pt"
          />
          <TierBadge
            label="Tier 2"
            triggered={triggeredTier2}
            total={tier2.length}
            color="#d97706"
            points="2pt"
          />
          <TierBadge
            label="Tier 3"
            triggered={triggeredTier3}
            total={tier3.length}
            color="#2563eb"
            points="1pt"
          />
        </div>

        {/* Indicators grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {indicators.map((ind) => {
            const color = getStatusColorHex(ind.status);
            const triggered = ind.status.includes("✅");
            const caution = ind.status.includes("⚠️");

            return (
              <div
                key={ind.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 10,
                  background: triggered ? "#f0fdf4" : caution ? "#fffbeb" : "#f8fafc",
                  border: `1px solid ${triggered ? "rgba(22,163,74,0.12)" : caution ? "rgba(217,119,6,0.10)" : "rgba(0,0,0,0.04)"}`,
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                {/* Name */}
                <div
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {ind.name}
                </div>
                {/* Tier pill */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: ind.tier === 1 ? "#dc2626" : ind.tier === 2 ? "#d97706" : "#2563eb",
                    marginRight: 10,
                    letterSpacing: "0.05em",
                  }}
                >
                  T{ind.tier}
                </div>
                {/* Status text */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color,
                    textAlign: "right",
                    minWidth: 120,
                  }}
                >
                  {ind.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <div
        style={{
          marginTop: "auto",
          padding: "18px 48px 28px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            lineHeight: 1.4,
          }}
        >
          15 on-chain indicators • Data from BitView
        </div>
        <div
          style={{
            fontSize: 14,
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

function TierBadge({
  label,
  triggered,
  total,
  color,
  points,
}: {
  label: string;
  triggered: number;
  total: number;
  color: string;
  points: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px",
        borderRadius: 10,
        background: `${color}08`,
        border: `1px solid ${color}20`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
      <span style={{ fontSize: 12, color: "#64748b" }}>
        {triggered}/{total}
      </span>
      <span style={{ fontSize: 10, color: "#94a3b8" }}>({points})</span>
    </div>
  );
}
