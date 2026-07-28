import { forwardRef } from "react";
import type { CycleInfo } from "@/lib/phase";
import { formatDate, formatUsd } from "@/lib/format";
import { BtcLogo } from "./BtcLogo";
import { Btc500Hero } from "./Btc500Hero";

interface Props {
  cycle: CycleInfo;
  price: number | null;
}

/**
 * Fixed-size social card for the Cycle Command Center.
 * Attention-first layout: brand header, strategy chart, giant countdown,
 * progress bar, and key dates. Inline colors only for html-to-image capture.
 */
export const CycleShareCard = forwardRef<HTMLDivElement, Props>(function CycleShareCard(
  { cycle, price },
  ref,
) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";

  // Brand tokens aligned with UI-GUIDELINES (hex approximations of oklch)
  const primaryColor = "#f97316";
  const successColor = "#16a34a";
  const infoColor = "#2563eb";
  const foreground = "#0f172a";
  const muted = "#64748b";
  const border = "#e2e8f0";
  const mutedBg = "#f1f5f9";
  const cardBg = "#ffffff";

  const primarySoft = "#fef3e7";
  const successSoft = "#e6f7ed";
  const infoSoft = "#eff6ff";

  const phaseAccent = buy ? primaryColor : sell ? successColor : infoColor;
  const phaseSoft = buy ? primarySoft : sell ? successSoft : infoSoft;
  const phaseDeep = buy ? "#9a3412" : sell ? "#14532d" : "#1e3a8a";

  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;
  const elapsed = Math.max(0, Math.round(progress * totalDays));
  const progressPct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  const daysLabel = buy ? "Days until buy window" : sell ? "Days until sell window" : "Cycle complete";
  const statusLabel = buy ? "Waiting to Buy" : sell ? "Waiting to Sell" : "Cycle Complete";
  const targetDate = buy ? cycle.buyDate : sell ? cycle.sellDate : cycle.nextHalving;
  const targetLabel = buy ? "Buy date" : sell ? "Sell date" : "Next cycle";
  const ruleLine = buy
    ? "500 days before the next halving"
    : sell
      ? "500 days after the last halving"
      : "One rule · every cycle";

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

      {/* Soft phase glow behind hero */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: "50%",
          bottom: 180,
          transform: "translateX(-50%)",
          width: 720,
          height: 320,
          borderRadius: "50%",
          background: phaseAccent,
          opacity: 0.08,
          filter: "blur(40px)",
        }}
      />

      {/* Header — brand + status pill */}
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
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: muted,
                  marginTop: 2,
                }}
              >
                Halving cycle strategy
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 100,
              background: phaseSoft,
              border: `2px solid ${phaseAccent}`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: phaseAccent,
                boxShadow: `0 0 0 4px ${phaseSoft}, 0 0 12px ${phaseAccent}`,
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: phaseAccent,
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Strategy chart — primary visual */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4px 40px 0 48px",
          position: "relative",
          zIndex: 1,
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          ["--background" as string]: "#ffffff",
          ["--foreground" as string]: "#0f172a",
          ["--primary" as string]: primaryColor,
          ["--primary-soft" as string]: primarySoft,
          ["--muted" as string]: mutedBg,
          ["--muted-foreground" as string]: muted,
          ["--border" as string]: border,
        }}
      >
        <Btc500Hero price={price} daysLeft={Math.max(0, cycle.daysUntilBuy)} compact />
      </div>

      {/* Giant countdown hero — scroll-stopper */}
      <div
        style={{
          margin: "0 40px 0 48px",
          borderRadius: 28,
          background: `linear-gradient(145deg, ${phaseSoft} 0%, #ffffff 55%, ${phaseSoft} 100%)`,
          border: `2px solid ${phaseAccent}`,
          boxShadow: `0 12px 40px -16px ${phaseAccent}88, 0 1px 2px rgba(0,0,0,0.04)`,
          padding: "28px 36px 32px",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* Corner accent mark */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "0 72px 72px 0",
            borderColor: `transparent ${phaseAccent} transparent transparent`,
            opacity: 0.9,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: phaseAccent,
              }}
            >
              {daysLabel}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: muted,
                marginTop: 6,
              }}
            >
              {ruleLine}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
              <span
                style={{
                  fontSize: 148,
                  fontWeight: 900,
                  lineHeight: 0.85,
                  letterSpacing: "-0.07em",
                  color: phaseAccent,
                  textShadow: `0 8px 32px ${phaseAccent}44`,
                }}
              >
                {days}
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: phaseDeep,
                  paddingBottom: 14,
                  letterSpacing: "-0.02em",
                }}
              >
                days
              </span>
            </div>
          </div>

          <div
            style={{
              flexShrink: 0,
              textAlign: "right",
              paddingBottom: 18,
              paddingRight: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              {targetLabel}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: foreground,
                marginTop: 6,
                letterSpacing: "-0.03em",
              }}
            >
              {formatDate(targetDate)}
            </div>
            <div
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 100,
                background: cardBg,
                border: `1px solid ${border}`,
                fontSize: 13,
                fontWeight: 700,
                color: phaseAccent,
              }}
            >
              {progressPct}% of window
            </div>
          </div>
        </div>

        {/* Progress track */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              height: 16,
              width: "100%",
              overflow: "hidden",
              borderRadius: 999,
              background: mutedBg,
              border: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${phaseAccent}cc, ${phaseAccent})`,
                boxShadow: `0 0 16px ${phaseAccent}66`,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 600,
              color: muted,
            }}
          >
            <span>
              <span style={{ color: foreground, fontWeight: 800 }}>{elapsed}</span> days elapsed
            </span>
            <span>
              <span style={{ color: foreground, fontWeight: 800 }}>{totalDays}</span> day window
            </span>
          </div>
        </div>
      </div>

      {/* Key facts strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          padding: "20px 40px 0 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <FactTile
          label="BTC price"
          value={price != null ? formatUsd(price) : "—"}
          accent={primaryColor}
          soft={primarySoft}
          border={border}
          muted={muted}
          foreground={foreground}
        />
        <FactTile
          label="Next halving"
          value={formatDate(cycle.nextHalving)}
          accent={infoColor}
          soft={infoSoft}
          border={border}
          muted={muted}
          foreground={foreground}
        />
        <FactTile
          label={buy ? "Sell date" : "Buy date"}
          value={formatDate(buy ? cycle.sellDate : cycle.buyDate)}
          accent={sell || buy ? successColor : infoColor}
          soft={sell || buy ? successSoft : infoSoft}
          border={border}
          muted={muted}
          foreground={foreground}
        />
      </div>

      {/* Footer — rule + site */}
      <div
        style={{
          marginTop: 22,
          padding: "22px 48px 30px 56px",
          borderTop: `1px solid ${border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 17, color: muted, fontWeight: 600 }}>
          Buy <span style={{ color: primaryColor, fontWeight: 800 }}>500</span> before · Sell{" "}
          <span style={{ color: successColor, fontWeight: 800 }}>500</span> after
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: primaryColor }}>btc500.vercel.app</div>
      </div>
    </div>
  );
});

function FactTile({
  label,
  value,
  accent,
  soft,
  border,
  muted,
  foreground,
}: {
  label: string;
  value: string;
  accent: string;
  soft: string;
  border: string;
  muted: string;
  foreground: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid ${border}`,
        background: soft,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: foreground,
          marginTop: 8,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 10,
          height: 3,
          width: 36,
          borderRadius: 999,
          background: accent,
        }}
      />
    </div>
  );
}
