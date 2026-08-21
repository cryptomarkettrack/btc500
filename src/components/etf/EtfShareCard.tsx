import { forwardRef } from "react";
import { BtcLogo } from "@/components/BtcLogo";
import { formatIsoDay, formatSignedBtc, formatSignedCompactUsd } from "@/lib/format";
import { regimeCopy, type EtfAbsorptionSnapshot } from "@/lib/etf-analysis";

interface Props {
  data: EtfAbsorptionSnapshot;
}

/**
 * Fixed-size social card for the ETF absorption board.
 * Inline styles so html-to-image does not depend on CSS variables.
 */
export const EtfShareCard = forwardRef<HTMLDivElement, Props>(function EtfShareCard({ data }, ref) {
  const primary = "#f97316";
  const foreground = "#0f172a";
  const muted = "#64748b";
  const border = "#e2e8f0";
  const cardBg = "#ffffff";
  const latest = data.latest;
  const etfBtc = latest.netFlowBtc ?? 0;
  const squeeze = etfBtc >= latest.issuanceBtc;
  const accent = squeeze ? "#16a34a" : etfBtc < 0 ? "#dc2626" : primary;
  const copy = regimeCopy(data.dayRegime);
  const ratio =
    latest.absorptionRatio != null ? `${latest.absorptionRatio.toFixed(1)}× issuance` : "—";

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
      <div style={{ height: 12, background: accent }} />
      <div style={{ padding: "48px 56px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BtcLogo size={44} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
              BTC<span style={{ color: primary }}>500</span>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              ETF absorption board
            </div>
          </div>
        </div>

        <h1
          style={{
            marginTop: 36,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
          }}
        >
          Did Bitcoin ETFs eat today&apos;s new coins?
        </h1>
        <p style={{ marginTop: 12, fontSize: 18, color: muted }}>
          {formatIsoDay(latest.date)} · {copy.headline}
        </p>

        <div
          style={{
            marginTop: 36,
            borderRadius: 28,
            border: `1px solid ${border}`,
            padding: "36px 40px",
            background: "#fafafa",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: muted }}>
            LAST SESSION
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 56,
              fontWeight: 800,
              color: accent,
              letterSpacing: "-0.04em",
            }}
          >
            {formatSignedBtc(etfBtc)}
          </div>
          <div style={{ marginTop: 4, fontSize: 20, color: muted }}>
            {formatSignedCompactUsd(latest.netFlowUsd)} · {ratio}
          </div>
          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Stat label="Miners minted" value={formatSignedBtc(latest.issuanceBtc)} muted={muted} />
            <Stat
              label="Extra coins"
              value={latest.extraBtc == null ? "—" : formatSignedBtc(latest.extraBtc)}
              muted={muted}
            />
            <Stat
              label="7-day absorption"
              value={data.rolling7d.ratio == null ? "—" : `${data.rolling7d.ratio.toFixed(2)}×`}
              muted={muted}
            />
            <Stat
              label="Streak"
              value={
                data.streak.days
                  ? `${data.streak.days}d ${data.streak.direction === "in" ? "in" : "out"}`
                  : "—"
              }
              muted={muted}
            />
          </div>
        </div>

        <p style={{ marginTop: 28, fontSize: 18, lineHeight: 1.45, color: foreground }}>
          {copy.detail} CoinGlass counts dollars. This board counts coins versus new supply.
        </p>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
          }}
        >
          <div style={{ fontSize: 16, color: muted }}>btc500.net/bitcoin-etf</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: primary }}>Not financial advice</div>
        </div>
      </div>
    </div>
  );
});

function Stat({ label, value, muted }: { label: string; value: string; muted: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: muted }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
