import { forwardRef } from "react";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { BtcLogo } from "./BtcLogo";

interface Props {
  cycle: CycleInfo;
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard({ cycle }, ref) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";

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
      ref={ref}
      style={{
        width: 1080,
        height: 1350,
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
      {/* Full-height accent stripe on the left */}
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

      {/* watermark */}
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

      {/* ========== TOP SECTION ========== */}
      <div
        style={{
          padding: "44px 48px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header row */}
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
                Halving Cycle Strategy
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: accent,
              }}
            >
              {buy ? "Waiting to Buy" : sell ? "Waiting to Sell" : "Cycle Complete"}
            </span>
          </div>
        </div>
      </div>

      {/* ========== HERO COUNTDOWN ========== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 44px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#94a3b8",
            marginBottom: 6,
          }}
        >
          {buy ? "Days Until Buy Window" : sell ? "Days Until Sell Window" : "Cycle Complete"}
        </div>

        <div
          style={{
            fontSize: 17,
            color: "#64748b",
            marginBottom: 24,
          }}
        >
          {buy ? "500 days before halving" : sell ? "500 days after halving" : "Next cycle loading"}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              fontSize: 280,
              fontWeight: 800,
              lineHeight: 0.8,
              letterSpacing: "-0.07em",
              color: accent,
            }}
          >
            {days}
          </span>
          <span
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: "#94a3b8",
              paddingBottom: 32,
            }}
          >
            days
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 700, marginTop: 36 }}>
          <div
            style={{
              height: 14,
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
              }}
            />
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              color: "#94a3b8",
            }}
          >
            <span style={{ fontWeight: 600, color: "#475569" }}>
              {Math.max(0, elapsed)} days elapsed
            </span>
            <span style={{ fontWeight: 600, color: "#475569" }}>{totalDays} days total</span>
          </div>
        </div>
      </div>

      {/* ========== BOTTOM BAR ========== */}
      <div
        style={{
          padding: "32px 48px 36px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#94a3b8",
                marginBottom: 6,
              }}
            >
              Next Halving
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {formatDate(cycle.nextHalving)}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
              {formatUtc(cycle.nextHalving)}
            </div>
          </div>
          <MiniStat label="Buy Date" value={formatDate(cycle.buyDate)} />
          <MiniStat label="Sell Date" value={formatDate(cycle.sellDate)} />
        </div>
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 13,
            color: "#94a3b8",
            letterSpacing: "0.08em",
            fontWeight: 500,
          }}
        >
          btc500.vercel.app
        </div>
      </div>
    </div>
  );
});

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#94a3b8",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}
