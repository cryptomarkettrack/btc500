import { forwardRef } from "react";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd } from "@/lib/format";
import type { CycleScoreResult, ScriptStatus } from "@/lib/cycle-score";
import { BtcLogo } from "./BtcLogo";
import { Btc500Hero } from "./Btc500Hero";

interface Props {
  cycle: CycleInfo;
  price: number | null;
  score: CycleScoreResult | null;
}

/**
 * Fixed-size social card for the Cycle Command Center.
 * Matches ChartShareCard / UI guidelines: light surface, soft accents,
 * pill badges, 32px radius, left accent stripe, watermark.
 * Inline colors only — required for reliable html-to-image capture.
 */
export const CycleShareCard = forwardRef<HTMLDivElement, Props>(function CycleShareCard(
  { cycle, price, score },
  ref,
) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";

  // Brand tokens aligned with UI-GUIDELINES (hex approximations of oklch)
  const primaryColor = "#f97316";
  const successColor = "#16a34a";
  const infoColor = "#2563eb";
  const destructiveColor = "#dc2626";
  const foreground = "#0f172a";
  const muted = "#64748b";
  const border = "#e2e8f0";
  const mutedBg = "#f1f5f9";
  const cardBg = "#ffffff";

  const primarySoft = "#fef3e7";
  const successSoft = "#e6f7ed";
  const infoSoft = "#eff6ff";
  const destructiveSoft = "#fef2f2";
  const mutedSoft = "#f8fafc";

  const status: ScriptStatus = score?.status ?? "awaiting_data";
  const statusStyles = statusVisual(status, {
    primaryColor,
    successColor,
    infoColor,
    destructiveColor,
    muted,
    primarySoft,
    successSoft,
    infoSoft,
    destructiveSoft,
    mutedSoft,
  });

  const phaseAccent = buy ? primaryColor : sell ? successColor : infoColor;
  const phaseSoft = buy ? primarySoft : sell ? successSoft : infoSoft;
  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const daysLabel = buy ? "Days to buy" : sell ? "Days to sell" : "Cycle done";
  const phaseLabel = buy ? "Waiting to Buy" : sell ? "Waiting to Sell" : "Cycle Complete";

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1350,
        fontFamily: "'Inter', system-ui, sans-serif",
        background: cardBg,
        borderRadius: 32,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 20px 60px -20px rgba(0,0,0,0.08)",
        color: foreground,
      }}
    >
      {/* Full-height accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 16,
          background: phaseAccent,
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
        <BtcLogo size={440} color="#000" />
      </div>

      {/* Header */}
      <div style={{ padding: "36px 48px 0 56px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: primarySoft,
              }}
            >
              <BtcLogo size={28} color={primaryColor} />
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
                BTC <span style={{ color: primaryColor }}>500</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: muted,
                  marginTop: 2,
                }}
              >
                Cycle Command Center
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 100,
                background: statusStyles.soft,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: statusStyles.color,
                }}
              >
                {score?.headline ?? "Loading"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 100,
                background: phaseSoft,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: phaseAccent,
                }}
              >
                {phaseLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy hero chart — top of share card (force light tokens for capture) */}
      <div
        style={{
          padding: "16px 48px 0 56px",
          position: "relative",
          zIndex: 1,
          // Match main-page hero type (do not inherit share-card Inter)
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          // Light-theme tokens so html-to-image stays readable on white card
          ["--background" as string]: "#ffffff",
          ["--foreground" as string]: "#0f172a",
          ["--primary" as string]: primaryColor,
          ["--primary-soft" as string]: primarySoft,
          ["--muted" as string]: mutedBg,
          ["--muted-foreground" as string]: muted,
          ["--border" as string]: border,
        }}
      >
        <Btc500Hero
          price={price}
          daysLeft={Math.max(0, cycle.daysUntilBuy)}
          compact
        />
      </div>

      {/* Main body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px 48px 0 56px",
          position: "relative",
          zIndex: 1,
          gap: 18,
        }}
      >
        {/* Score + countdown split */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 18,
          }}
        >
          {/* Cycle score card */}
          <div
            style={{
              borderRadius: 24,
              border: `1px solid ${border}`,
              background: cardBg,
              padding: "22px 26px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              Cycle score
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span
                style={{
                  fontSize: 80,
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: "-0.06em",
                  color: statusStyles.color,
                }}
              >
                {score?.score ?? "—"}
              </span>
              <span style={{ fontSize: 22, fontWeight: 600, color: muted }}>/ 100</span>
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: foreground,
                lineHeight: 1.2,
              }}
            >
              {score?.punchline ?? "Building the script…"}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.4,
                color: muted,
                maxWidth: 420,
              }}
            >
              {score?.subline ?? "Live cycle integrity vs historical halvings."}
            </div>
          </div>

          {/* Days panel */}
          <div
            style={{
              borderRadius: 24,
              border: `1px solid ${border}`,
              background: phaseSoft,
              padding: "22px 26px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: phaseAccent,
              }}
            >
              {daysLabel}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
                color: phaseAccent,
                marginTop: 4,
              }}
            >
              {days}
            </div>
            <div style={{ marginTop: "auto", display: "grid", gap: 8, paddingTop: 12 }}>
              <StatRow label="Buy" value={formatDate(cycle.buyDate)} muted={muted} fg={foreground} />
              <StatRow
                label="Halving"
                value={formatDate(cycle.nextHalving)}
                muted={muted}
                fg={foreground}
              />
              <StatRow
                label="Sell"
                value={formatDate(cycle.sellDate)}
                muted={muted}
                fg={foreground}
              />
              {price != null && (
                <StatRow label="BTC" value={formatUsd(price)} muted={muted} fg={foreground} />
              )}
            </div>
          </div>
        </div>

        {/* Next action */}
        {score && (
          <div
            style={{
              borderRadius: 20,
              background: mutedBg,
              border: `1px solid ${border}`,
              padding: "16px 22px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              Next action
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.35,
                color: foreground,
              }}
            >
              {score.action}
            </div>
          </div>
        )}

        {/* Component meters */}
        {score && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {score.components.map((c) => {
              const bar =
                c.score >= 75 ? successColor : c.score >= 50 ? primaryColor : destructiveColor;
              return (
                <div
                  key={c.id}
                  style={{
                    borderRadius: 16,
                    border: `1px solid ${border}`,
                    background: mutedSoft,
                    padding: "14px 14px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: muted,
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      marginTop: 4,
                      letterSpacing: "-0.03em",
                      color: foreground,
                    }}
                  >
                    {Math.round(c.score)}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      height: 5,
                      borderRadius: 999,
                      background: border,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, c.score))}%`,
                        height: "100%",
                        background: bar,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  {c.metric && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        color: muted,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.metric}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "28px 48px 36px 56px",
          borderTop: `1px solid ${border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 16, color: muted, fontWeight: 500 }}>
          Buy 500 days before · Sell 500 days after
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: primaryColor }}>btc500.vercel.app</div>
      </div>
    </div>
  );
});

function StatRow({
  label,
  value,
  muted,
  fg,
}: {
  label: string;
  value: string;
  muted: string;
  fg: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: muted,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color: fg }}>{value}</span>
    </div>
  );
}

function statusVisual(
  status: ScriptStatus,
  t: {
    primaryColor: string;
    successColor: string;
    infoColor: string;
    destructiveColor: string;
    muted: string;
    primarySoft: string;
    successSoft: string;
    infoSoft: string;
    destructiveSoft: string;
    mutedSoft: string;
  },
): { color: string; soft: string } {
  switch (status) {
    case "script_intact":
      return { color: t.successColor, soft: t.successSoft };
    case "late_cycle_heat":
      return { color: t.primaryColor, soft: t.primarySoft };
    case "capitulation_zone":
      return { color: t.destructiveColor, soft: t.destructiveSoft };
    case "early_cycle":
      return { color: t.infoColor, soft: t.infoSoft };
    case "mid_cycle":
      return { color: t.muted, soft: t.mutedSoft };
    default:
      return { color: t.muted, soft: t.mutedSoft };
  }
}
