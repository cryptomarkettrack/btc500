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
 * The cycle card — the site's own command centre, as one image.
 *
 * Every value here comes from the site's palette (the 2026-11 dark theme) and
 * its type pair, so a card posted on X looks like a frame of the site rather
 * than a different product. Inline colours only: html-to-image cannot read a
 * custom property from a stylesheet.
 */
export const CycleShareCard = forwardRef<HTMLDivElement, Props>(function CycleShareCard(
  { cycle, price },
  ref,
) {
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";

  // The site palette, as hex for the canvas renderer.
  const ground = "#0f0d0c";
  const panel = "#171513";
  const ink = "#f7f4ef";
  const muted = "#9c968c";
  const hairline = "rgba(255,255,255,0.12)";
  const orange = "#f7931a";
  const green = "#4ade80";
  const blue = "#7cc4ff";

  const accent = buy ? orange : sell ? green : blue;
  const accentSoft = buy
    ? "rgba(247,147,26,0.16)"
    : sell
      ? "rgba(74,222,128,0.14)"
      : "rgba(124,196,255,0.14)";

  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;
  const elapsed = Math.max(0, Math.round(progress * totalDays));
  const progressPct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  const daysLabel = buy ? "days to buy" : sell ? "days to sell" : "cycle complete";
  const statusLabel = buy ? "waiting to buy" : sell ? "waiting to sell" : "cycle complete";
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
        background: ground,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        color: ink,
      }}
    >
      {/* the site's ground: one warm glow over near-black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(62% 38% at 78% 6%, rgba(247,147,26,0.22) 0%, rgba(247,147,26,0) 70%)",
        }}
      />

      {/* ---- window bar, as on the site's command centre ---- */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "26px 44px",
          borderBottom: `1px solid ${hairline}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BtcLogo size={30} color={orange} />
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: ink,
            }}
          >
            BTC<span style={{ color: orange }}>500</span>
          </span>
        </div>
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 999, background: accent }} />
          {statusLabel}
        </span>
      </div>

      {/* ---- the number ---- */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "52px 44px 0 44px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: muted,
            }}
          >
            {daysLabel}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              marginTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 168,
                fontWeight: 700,
                lineHeight: 0.86,
                letterSpacing: "-0.06em",
                color: accent,
              }}
            >
              {days}
            </span>
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 34,
                fontWeight: 500,
                color: ink,
                letterSpacing: "-0.02em",
              }}
            >
              days
            </span>
          </div>
          <div style={{ fontSize: 19, color: muted, marginTop: 14 }}>{ruleLine}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: muted,
            }}
          >
            {targetLabel}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginTop: 6,
              color: accent,
            }}
          >
            {formatDate(targetDate)}
          </div>
        </div>
      </div>

      {/* ---- the cycle map ---- */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "34px 20px 0 20px",
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          ["--background" as string]: ground,
          ["--foreground" as string]: ink,
          ["--primary" as string]: orange,
          ["--primary-soft" as string]: accentSoft,
          ["--muted" as string]: "rgba(255,255,255,0.05)",
          ["--muted-foreground" as string]: muted,
          ["--border" as string]: hairline,
          ["--chart-ink" as string]: ink,
        }}
      >
        <Btc500Hero price={price} daysLeft={Math.max(0, cycle.daysUntilBuy)} compact />
      </div>

      {/* ---- progress ---- */}
      <div style={{ position: "relative", zIndex: 1, padding: "18px 44px 0 44px" }}>
        <div
          style={{
            height: 10,
            width: "100%",
            overflow: "hidden",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: `${progressPct}%`,
              background: accent,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 14,
            color: muted,
          }}
        >
          <span>
            <span style={{ color: ink, fontWeight: 600 }}>{elapsed}</span> days elapsed
          </span>
          <span>
            <span style={{ color: ink, fontWeight: 600 }}>{totalDays}</span> day window
          </span>
        </div>
      </div>

      {/* ---- the three dated facts ---- */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: `1px solid ${hairline}`,
        }}
      >
        <Fact
          label="Next halving"
          value={formatDate(cycle.nextHalving)}
          ink={ink}
          muted={muted}
          hairline={hairline}
        />
        <Fact
          label="Buy date"
          value={formatDate(cycle.buyDate)}
          ink={ink}
          muted={muted}
          hairline={hairline}
          accent={orange}
        />
        <Fact
          label="Sell date"
          value={formatDate(cycle.sellDate)}
          ink={ink}
          muted={muted}
          hairline={hairline}
          accent={green}
        />
      </div>

      {/* ---- footer ---- */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 44px 28px 44px",
          borderTop: `1px solid ${hairline}`,
          background: panel,
        }}
      >
        <span style={{ fontSize: 17, color: muted }}>
          Buy <span style={{ color: orange, fontWeight: 700 }}>500</span> before · Sell{" "}
          <span style={{ color: green, fontWeight: 700 }}>500</span> after
        </span>
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 16,
            fontWeight: 600,
            color: orange,
          }}
        >
          btc500.net
        </span>
      </div>
    </div>
  );
});

function Fact({
  label,
  value,
  ink,
  muted,
  hairline,
  accent,
}: {
  label: string;
  value: string;
  ink: string;
  muted: string;
  hairline: string;
  accent?: string;
}) {
  return (
    <div style={{ padding: "24px 28px", borderRight: `1px solid ${hairline}` }}>
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12,
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
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginTop: 8,
          color: accent ?? ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}
