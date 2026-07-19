import { forwardRef } from "react";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { BtcLogo } from "./BtcLogo";

interface Props {
  cycle: CycleInfo;
  price: number | null;
  daysLeft: number;
}

export const ChartShareCard = forwardRef<HTMLDivElement, Props>(function ChartShareCard(
  { cycle, price, daysLeft },
  ref,
) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";

  const primaryColor = "#f97316";
  const sellColor = "#16a34a";
  const completeColor = "#2563eb";
  const accent = buy ? primaryColor : sell ? sellColor : completeColor;
  const accentSoft = buy ? "#fef3e7" : sell ? "#e6f7ed" : "#f1f5f9";

  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const elapsed = totalDays - days;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;

  // Calculate current position on chart (0-500 days maps to x position)
  const chartProgress = (500 - daysLeft) / 500; // 0 to 1
  const currentX = 10 + chartProgress * 300; // Maps to x=10 (start) to x=310 (buy point)

  // Price curve points for interpolation
  const pricePoints: [number, number][] = [
    [10, 280],
    [40, 292],
    [70, 300],
    [100, 288],
    [130, 297],
    [160, 278],
    [190, 260],
    [220, 268],
    [250, 240],
    [280, 222],
    [310, 232],
    [340, 200],
    [370, 178],
    [400, 186],
    [430, 150],
    [460, 100],
    [490, 115],
    [520, 65],
    [550, 78],
    [580, 20],
    [610, 10],
    [640, 20],
    [670, 10],
    [700, 30],
    [730, 55],
    [760, 100],
    [790, 125],
    [820, 150],
    [850, 175],
    [890, 200],
  ];

  // Find Y at currentX by interpolating between points
  let currentY = 280;
  for (let i = 0; i < pricePoints.length - 1; i++) {
    const [x1, y1] = pricePoints[i];
    const [x2, y2] = pricePoints[i + 1];
    if (currentX >= x1 && currentX <= x2) {
      const t = (currentX - x1) / (x2 - x1);
      currentY = y1 + t * (y2 - y1);
      break;
    }
  }

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

      {/* ========== CHART SECTION ========== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "32px 48px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Chart */}
        <div style={{ width: "100%", maxWidth: 900 }}>
          <svg
            viewBox="0 0 900 460"
            style={{ width: "100%", height: "auto" }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="chartFadeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.14" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid */}
            <line x1="0" y1="100" x2="900" y2="100" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="220" x2="900" y2="220" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="340" x2="900" y2="340" stroke="#e2e8f0" strokeWidth="1" />

            {/* Realistic-ish BTC path */}
            <path
              d="
                M 10 380
                L 40 392 L 70 400 L 100 388 L 130 397 L 160 378
                L 190 360 L 220 368 L 250 340 L 280 322 L 310 332
                L 340 300 L 370 278 L 400 286 L 430 250
                L 460 200 L 490 215 L 520 165 L 550 178 L 580 120
                L 610 95 L 640 108 L 670 60 L 700 80 L 730 105
                L 760 150 L 790 175 L 820 210 L 850 235 L 890 260
                L 890 460 L 10 460 Z"
              fill="url(#chartFadeGrad)"
            />

            <path
              d="
                M 10 380
                L 40 392 L 70 400 L 100 388 L 130 397 L 160 378
                L 190 360 L 220 368 L 250 340 L 280 322 L 310 332
                L 340 300 L 370 278 L 400 286 L 430 250
                L 460 200 L 490 215 L 520 165 L 550 178 L 580 120
                L 610 95 L 640 108 L 670 60 L 700 80 L 730 105
                L 760 150 L 790 175 L 820 210 L 850 235 L 890 260"
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Halving vertical rule */}
            <line
              x1="460"
              y1="30"
              x2="460"
              y2="430"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="2 5"
            />
            <text
              x="460"
              y="20"
              textAnchor="middle"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.18em",
                fill: "#64748b",
              }}
            >
              Halving
            </text>

            {/* Current position indicator */}
            {daysLeft <= 500 && daysLeft > 0 && (
              <>
                {/* Vertical line from bottom to current price position */}
                <line
                  x1={currentX}
                  y1={currentY}
                  x2={currentX}
                  y2={400}
                  stroke={primaryColor}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                {/* Pulsing dot at current position */}
                <circle cx={currentX} cy={currentY} r="6" fill={primaryColor} opacity="0.3">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.1;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={currentX} cy={currentY} r="4" fill={primaryColor} />
                {/* Days remaining label */}
                <text
                  x={currentX}
                  y={currentY - 18}
                  textAnchor="middle"
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 600,
                    fontSize: "12px",
                    fill: primaryColor,
                    letterSpacing: "0.05em",
                  }}
                >
                  {daysLeft}d
                </text>
                {/* "we are here" label */}
                <text
                  x={currentX}
                  y={currentY + 16}
                  textAnchor="middle"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    fill: "#000000",
                    letterSpacing: "0.06em",
                  }}
                >
                  we are here
                </text>
              </>
            )}

            {/* BUY callout */}
            <circle
              cx="310"
              cy="332"
              r="8"
              fill={primaryColor}
              stroke="#fff"
              strokeWidth="3"
              opacity="0.2"
            >
              <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.2;0.05;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="310" cy="332" r="6" fill={primaryColor} stroke="#fff" strokeWidth="2.5" />
            <line
              x1="310"
              y1="332"
              x2="310"
              y2="378"
              stroke={primaryColor}
              strokeWidth="2"
              opacity="0.7"
            />
            <circle cx="310" cy="415" r="38" fill="#fef3e7" opacity="0.3" />
            <circle cx="310" cy="415" r="38" fill="none" stroke={primaryColor} strokeWidth="2.5" />
            <text
              x="310"
              y="408"
              textAnchor="middle"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "19px",
                fill: "#0f172a",
              }}
            >
              Buy
            </text>
            <text
              x="310"
              y="426"
              textAnchor="middle"
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 600,
                fontSize: "11px",
                fill: primaryColor,
                letterSpacing: "0.05em",
              }}
            >
              −500d
            </text>

            {/* SELL callout */}
            <circle
              cx="670"
              cy="60"
              r="8"
              fill={primaryColor}
              stroke="#fff"
              strokeWidth="3"
              opacity="0.2"
            >
              <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.2;0.05;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="670" cy="60" r="6" fill={primaryColor} stroke="#fff" strokeWidth="2.5" />
            <line
              x1="670"
              y1="60"
              x2="670"
              y2="24"
              stroke={primaryColor}
              strokeWidth="2"
              opacity="0.7"
            />
            <circle cx="740" cy="55" r="38" fill="#fef3e7" opacity="0.3" />
            <circle cx="740" cy="55" r="38" fill="none" stroke={primaryColor} strokeWidth="2.5" />
            <line
              x1="670"
              y1="60"
              x2="712"
              y2="56"
              stroke={primaryColor}
              strokeWidth="2"
              opacity="0.7"
            />
            <text
              x="740"
              y="48"
              textAnchor="middle"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "19px",
                fill: "#0f172a",
              }}
            >
              Sell
            </text>
            <text
              x="740"
              y="66"
              textAnchor="middle"
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 600,
                fontSize: "11px",
                fill: primaryColor,
                letterSpacing: "0.05em",
              }}
            >
              +500d
            </text>
          </svg>
        </div>

        {/* Countdown below chart */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
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
            {buy
              ? "500 days before halving"
              : sell
                ? "500 days after halving"
                : "Next cycle loading"}
          </div>

          <div
            style={{ display: "flex", alignItems: "baseline", gap: 12, justifyContent: "center" }}
          >
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
