import { forwardRef } from "react";
import { BtcLogo } from "@/components/BtcLogo";
import { formatCompactUsd, formatCompactNumber } from "@/lib/format";
import type { InsiderTransaction } from "@/lib/insider-trading";

interface Props {
  transaction: InsiderTransaction;
}

const TYPE_META: Record<
  InsiderTransaction["type"],
  { color: string; soft: string; label: string }
> = {
  Buy: { color: "#16a34a", soft: "#e6f7ed", label: "BUY" },
  Sale: { color: "#dc2626", soft: "#fef2f2", label: "SALE" },
  "Proposed Sale": { color: "#ea580c", soft: "#fff7ed", label: "PROPOSED SALE" },
  "Option Exercise": { color: "#9333ea", soft: "#f5f3ff", label: "OPTION EXERCISE" },
};

/**
 * Fixed-size social card for a single insider transaction.
 * Inline styles for reliable html-to-image capture.
 */
export const InsiderTransactionShareCard = forwardRef<HTMLDivElement, Props>(
  function InsiderTransactionShareCard({ transaction: t }, ref) {
    const meta = TYPE_META[t.type];
    const accent = meta.color;
    const accentSoft = meta.soft;
    const foreground = "#0f172a";
    const muted = "#64748b";

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
          color: foreground,
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
            opacity: 0.05,
          }}
        >
          <BtcLogo size={420} color="#000" />
        </div>

        {/* Header */}
        <div style={{ padding: "40px 48px 0", position: "relative", zIndex: 1 }}>
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
                    color: foreground,
                  }}
                >
                  BTC 500
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: muted, marginTop: 2 }}>
                  Insider Transaction
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 22px",
                borderRadius: 100,
                background: accentSoft,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: accent,
                }}
              >
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Ticker hero */}
        <div style={{ padding: "48px 48px 0", position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#94a3b8",
              marginBottom: 12,
            }}
          >
            Ticker
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: foreground,
            }}
          >
            {t.ticker}
          </div>
          <div
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 22px",
              borderRadius: 100,
              background: accentSoft,
              border: `1.5px solid ${accent}33`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: accent,
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 800, color: accent }}>{t.type}</span>
          </div>
        </div>

        {/* Value spotlight */}
        <div
          style={{
            margin: "40px 48px 0",
            padding: "32px 36px",
            borderRadius: 24,
            background: accentSoft,
            border: `1px solid ${accent}22`,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: muted,
              marginBottom: 8,
            }}
          >
            Transaction Value
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: accent,
            }}
          >
            {formatCompactUsd(t.value)}
          </div>
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, color: muted }}>
            {formatCompactNumber(t.shares)} shares @ ${t.price.toFixed(2)}
          </div>
        </div>

        {/* Detail grid */}
        <div
          style={{
            padding: "28px 48px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            position: "relative",
            zIndex: 1,
          }}
        >
          <DetailCell label="Insider" value={t.insider || "—"} />
          <DetailCell label="Title" value={t.title || "—"} />
          <DetailCell label="Trade Date" value={t.date || "—"} />
          <DetailCell label="Filing Date" value={t.filingDate || "—"} />
          {t.held > 0 && (
            <DetailCell
              label="Shares Held After"
              value={formatCompactNumber(t.held)}
              span
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            padding: "22px 48px 32px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.4 }}>
            SEC Form 4 filing · Source: Finviz
          </div>
          <div
            style={{
              fontSize: 16,
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
  },
);

function DetailCell({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid rgba(0,0,0,0.04)",
        gridColumn: span ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "#94a3b8",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#0f172a",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: span ? "normal" : "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
