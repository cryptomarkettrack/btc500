import { forwardRef } from "react";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { BtcLogo } from "./BtcLogo";

interface Props {
  cycle: CycleInfo;
  price?: number | null;
  investment?: number;
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { cycle, price, investment = 50000 },
  ref,
) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";
  const value = sell && price ? (investment / 60000) * price : 0;
  const pnl = value - investment;
  const pnlPct = investment ? (pnl / investment) * 100 : 0;

  const primaryColor = "#f97316";
  const sellColor = "#16a34a";
  const completeColor = "#2563eb";
  const accent = buy ? primaryColor : sell ? sellColor : completeColor;
  const accentSoft = buy ? "#fef3e7" : sell ? "#e6f7ed" : "#f1f5f9";

  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const elapsed = totalDays - days;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;

  return (
    <div
      ref={ref}
      style={{
        width: 1600,
        height: 900,
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fff",
        borderRadius: 32,
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 20px 60px -20px rgba(0,0,0,0.08)",
        padding: 48,
      }}
    >
      {/* watermark */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          right: -64,
          bottom: -64,
          opacity: 0.06,
        }}
      >
        <BtcLogo size={420} color="#000" />
      </div>

      <div
        style={{
          display: "grid",
          gap: 40,
          gridTemplateColumns: "1.2fr 1fr",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Countdown block */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span
              style={{
                display: "inline-flex",
                height: 44,
                width: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: accentSoft,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: accent,
                }}
              >
                {buy ? "Waiting to Buy" : sell ? "Waiting to Sell" : "Cycle Complete"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
                {buy
                  ? "500 days before halving"
                  : sell
                    ? "500 days after halving"
                    : "Next cycle loading"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Days Left
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span
                style={{
                  fontSize: 160,
                  fontWeight: 700,
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                  color: accent,
                }}
              >
                {days}
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 500,
                  color: "#64748b",
                  paddingBottom: 16,
                }}
              >
                days
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                marginTop: 24,
                height: 8,
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
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: "#64748b",
              }}
            >
              <span>{Math.max(0, elapsed)} days elapsed</span>
              <span>{totalDays} days total</span>
            </div>
          </div>

          {/* Sell phase stats */}
          {sell && price ? (
            <div
              style={{ marginTop: 24, display: "flex", gap: 48, fontSize: 30, color: "#334155" }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    opacity: 0.6,
                  }}
                >
                  Value
                </div>
                <div style={{ fontWeight: 600 }}>{formatUsd(value)}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    opacity: 0.6,
                  }}
                >
                  Profit
                </div>
                <div style={{ fontWeight: 600, color: sellColor }}>
                  +{formatUsd(pnl)} ({pnlPct.toFixed(0)}%)
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    opacity: 0.6,
                  }}
                >
                  BTC
                </div>
                <div style={{ fontWeight: 600 }}>{formatUsd(price)}</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Next halving block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderLeft: "1px solid rgba(0,0,0,0.06)",
            paddingLeft: 56,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#64748b",
            }}
          >
            Next Halving
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.8 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#0f172a",
              }}
            >
              {formatDate(cycle.nextHalving)}
            </span>
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
            {formatUtc(cycle.nextHalving)}
          </div>

          <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <MiniStat label="Buy Date" value={formatDate(cycle.buyDate)} />
            <MiniStat label="Sell Date" value={formatDate(cycle.sellDate)} />
          </div>
        </div>
      </div>
    </div>
  );
});

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 16,
        background: "rgba(0,0,0,0.03)",
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#64748b",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{value}</div>
    </div>
  );
}
