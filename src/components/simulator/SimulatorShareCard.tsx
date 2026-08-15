import { forwardRef } from "react";
import { formatIsoDay, formatMultiple, formatUsd } from "@/lib/format";
import type { SimulatorRun } from "@/lib/simulator-math";
import { BtcLogo } from "@/components/BtcLogo";

interface Props {
  run: SimulatorRun;
}

/**
 * Fixed-size social card for a simulator result.
 * Inline hex colors so html-to-image does not depend on CSS variables.
 */
export const SimulatorShareCard = forwardRef<HTMLDivElement, Props>(function SimulatorShareCard(
  { run },
  ref,
) {
  const primary = "#f97316";
  const success = "#16a34a";
  const foreground = "#0f172a";
  const muted = "#64748b";
  const border = "#e2e8f0";
  const mutedBg = "#f8fafc";
  const cardBg = "#ffffff";
  const completed = run.cycles.filter((c) => c.complete);

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
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 16,
          background: primary,
        }}
      />
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

      <div style={{ padding: "48px 56px 0 64px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: muted,
            }}
          >
            BTC500 Simulator
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: primary,
            }}
          >
            Hypothetical backtest
          </div>
        </div>

        <div style={{ marginTop: 28, fontSize: 22, fontWeight: 600, color: muted }}>
          {formatUsd(run.startAmount)} ·{" "}
          {run.mode === "compound" ? "reinvested" : "same amount each cycle"} · from {run.startYear}
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 0.95,
            color:
              run.finalValue !== null && run.finalValue >= run.totalInvested ? success : foreground,
          }}
        >
          {run.finalValue !== null ? formatUsd(run.finalValue) : "—"}
        </div>

        <div style={{ marginTop: 16, fontSize: 22, fontWeight: 600, color: muted }}>
          {run.blendedMultiple !== null ? `${formatMultiple(run.blendedMultiple)} · ` : ""}
          {run.completedCount} completed window{run.completedCount === 1 ? "" : "s"}
        </div>
      </div>

      <div style={{ padding: "40px 56px 0 64px", position: "relative", zIndex: 1, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: muted,
            marginBottom: 16,
          }}
        >
          Cycle path
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {completed.map((cycle) => (
            <div
              key={cycle.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: mutedBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "18px 24px",
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: foreground }}>
                  {cycle.label}
                </div>
                <div style={{ marginTop: 4, fontSize: 16, color: muted }}>
                  {formatIsoDay(cycle.buyDate)} → {formatIsoDay(cycle.sellDate)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: success }}>
                  {cycle.endCapital !== null ? formatUsd(cycle.endCapital) : "—"}
                </div>
                <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600, color: muted }}>
                  {cycle.returnMultiplier !== null ? formatMultiple(cycle.returnMultiplier) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "28px 56px 36px 64px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `1px solid ${border}`,
          marginTop: 28,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: foreground }}>
            BTC<span style={{ color: primary }}>500</span>.net
          </div>
          <div style={{ marginTop: 6, fontSize: 15, color: muted, maxWidth: 640 }}>
            Buy 500 days before each halving. Sell 500 days after. Past performance does not
            guarantee future results.
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: muted,
          }}
        >
          Not financial advice
        </div>
      </div>
    </div>
  );
});
