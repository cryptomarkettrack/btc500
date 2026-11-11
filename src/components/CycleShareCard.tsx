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
 * Fixed-size social card for the cycle.
 *
 * Art direction matches the site (2026-11): near-black warm ground, Bitcoin
 * orange as the only saturated colour, Space Grotesk for the display and IBM
 * Plex Mono for the data. Inline colours only — html-to-image cannot read
 * custom properties from a stylesheet.
 */
export const CycleShareCard = forwardRef<HTMLDivElement, Props>(function CycleShareCard(
  { cycle, price },
  ref,
) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";

  // Brand tokens — the dark counterparts of the site's oklch palette
  const primaryColor = "#f7931a";
  const successColor = "#4ade80";
  const infoColor = "#7cc4ff";
  const foreground = "#f7f4ef";
  const muted = "#9c968c";
  const border = "rgba(255,255,255,0.14)";
  const mutedBg = "rgba(255,255,255,0.05)";
  const cardBg = "#0f0d0c";

  const primarySoft = "rgba(247,147,26,0.16)";
  const successSoft = "rgba(74,222,128,0.14)";
  const infoSoft = "rgba(124,196,255,0.14)";

  const phaseAccent = buy ? primaryColor : sell ? successColor : infoColor;
  const phaseSoft = buy ? primarySoft : sell ? successSoft : infoSoft;

  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;
  const elapsed = Math.max(0, Math.round(progress * totalDays));
  const progressPct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  const daysLabel = buy
    ? "Days until buy window"
    : sell
      ? "Days until sell window"
      : "Cycle complete";
  const statusLabel = buy ? "Waiting to buy" : sell ? "Waiting to sell" : "Cycle complete";
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
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        background: cardBg,
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${border}`,
        color: foreground,
      }}
    >
      {/* the one ground: a warm glow behind the chart */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(70% 45% at 72% 26%, rgba(247,147,26,0.20) 0%, rgba(247,147,26,0) 68%)",
        }}
      />

      {/* Watermark */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          right: -60,
          bottom: -60,
          opacity: 0.03,
        }}
      >
        <BtcLogo size={440} color="#ffffff" />
      </div>

      {/* Header — brand + status pill */}
      <div style={{ padding: "32px 48px 0 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: primarySoft,
                border: `1px solid ${primaryColor}55`,
              }}
            >
              <BtcLogo size={26} color={primaryColor} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: foreground,
                }}
              >
                BTC <span style={{ color: primaryColor }}>500</span>
              </div>
              <div
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
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
              padding: "10px 18px",
              borderRadius: 100,
              background: phaseSoft,
              border: `1px solid ${phaseAccent}66`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: phaseAccent,
                // Solid ring only — soft glow shadows smear under html-to-image
                boxShadow: `0 0 0 4px ${phaseSoft}`,
              }}
            />
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: phaseAccent,
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main focus: chart + days left (stacked, centered) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px 40px 0 40px",
          position: "relative",
          zIndex: 1,
          gap: 8,
        }}
      >
        {/* Strategy chart */}
        <div
          style={{
            width: "100%",
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            ["--background" as string]: cardBg,
            ["--foreground" as string]: foreground,
            ["--primary" as string]: primaryColor,
            ["--primary-soft" as string]: primarySoft,
            ["--muted" as string]: mutedBg,
            ["--muted-foreground" as string]: muted,
            ["--border" as string]: border,
            ["--chart-ink" as string]: foreground,
          }}
        >
          <Btc500Hero price={price} daysLeft={Math.max(0, cycle.daysUntilBuy)} compact />
        </div>

        {/* Giant centered days-left — co-primary focus under chart */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "12px 0 8px",
          }}
        >
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: phaseAccent,
            }}
          >
            {daysLabel}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: muted,
              marginTop: 6,
            }}
          >
            {ruleLine}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 16,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 180,
                fontWeight: 700,
                lineHeight: 0.85,
                letterSpacing: "-0.07em",
                color: phaseAccent,
              }}
            >
              {days}
            </span>
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 38,
                fontWeight: 500,
                color: foreground,
                paddingBottom: 18,
                letterSpacing: "-0.02em",
              }}
            >
              days
            </span>
          </div>

          {/* Compact meta under the number */}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: muted,
                }}
              >
                {targetLabel}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: foreground,
                  marginTop: 4,
                  letterSpacing: "-0.03em",
                }}
              >
                {formatDate(targetDate)}
              </div>
            </div>
            <div
              style={{
                width: 1,
                height: 36,
                background: border,
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 100,
                background: phaseSoft,
                border: `1px solid ${phaseAccent}55`,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 14,
                fontWeight: 600,
                color: phaseAccent,
              }}
            >
              {progressPct}% of window
            </div>
          </div>

          {/* Progress track — full width, centered under number */}
          <div style={{ width: "100%", maxWidth: 720, marginTop: 22 }}>
            <div
              style={{
                height: 12,
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
                  // Flat fill — glow box-shadows blur under html-to-image capture
                  background: phaseAccent,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 13,
                fontWeight: 500,
                color: muted,
              }}
            >
              <span>
                <span style={{ color: foreground, fontWeight: 600 }}>{elapsed}</span> days elapsed
              </span>
              <span>
                <span style={{ color: foreground, fontWeight: 600 }}>{totalDays}</span> day window
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key facts strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          padding: "8px 40px 0 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <FactTile
          label="BTC price"
          value={price != null ? formatUsd(price) : "—"}
          accent={primaryColor}
          border={border}
          muted={muted}
          foreground={foreground}
        />
        <FactTile
          label="Next halving"
          value={formatDate(cycle.nextHalving)}
          accent={infoColor}
          border={border}
          muted={muted}
          foreground={foreground}
        />
        <FactTile
          label={buy ? "Sell date" : "Buy date"}
          value={formatDate(buy ? cycle.sellDate : cycle.buyDate)}
          accent={sell || buy ? successColor : infoColor}
          border={border}
          muted={muted}
          foreground={foreground}
        />
      </div>

      {/* Footer — rule + site */}
      <div
        style={{
          marginTop: 16,
          padding: "18px 48px 28px 48px",
          borderTop: `1px solid ${border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 16, color: muted, fontWeight: 500 }}>
          Buy <span style={{ color: primaryColor, fontWeight: 700 }}>500</span> before · Sell{" "}
          <span style={{ color: successColor, fontWeight: 700 }}>500</span> after
        </div>
        <div
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 16,
            fontWeight: 600,
            color: primaryColor,
          }}
        >
          btc500.net
        </div>
      </div>
    </div>
  );
});

function FactTile({
  label,
  value,
  accent,
  border,
  muted,
  foreground,
}: {
  label: string;
  value: string;
  accent: string;
  border: string;
  muted: string;
  foreground: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${border}`,
        background: "rgba(255,255,255,0.04)",
        padding: "14px 18px",
      }}
    >
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: foreground,
          marginTop: 6,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          height: 3,
          width: 32,
          borderRadius: 999,
          background: accent,
        }}
      />
    </div>
  );
}
