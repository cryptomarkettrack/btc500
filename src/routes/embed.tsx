import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { computeCycle, formatDate, formatUsd, formatUtc } from "@/lib/phase";
import { BtcLogo } from "@/components/BtcLogo";
import { SITE_URL } from "@/lib/site";
import { halvingQuery, btcPriceQuery, cycleScoreQuery } from "@/lib/queries";
import {
  parseEmbedTheme,
  parseEmbedWidget,
  themeTokens,
  type EmbedTheme,
  type EmbedWidget,
} from "@/lib/embed";
import type { CycleScoreResult } from "@/lib/cycle-score";
import type { CycleInfo } from "@/lib/phase";

export const Route = createFileRoute("/embed")({
  validateSearch: (search: Record<string, unknown>) => ({
    widget: parseEmbedWidget(search.widget),
    theme: parseEmbedTheme(search.theme),
  }),
  head: () => ({
    meta: [
      { title: "BTC500 Embed Widget" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(halvingQuery);
    context.queryClient.ensureQueryData(btcPriceQuery);
    context.queryClient.prefetchQuery(cycleScoreQuery);
  },
  component: Embed,
});

function Embed() {
  const { widget, theme } = Route.useSearch();
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const priceRes = useSuspenseQuery(btcPriceQuery);
  const scoreRes = useQuery(cycleScoreQuery);
  const now = new Date();

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );

  const price = priceRes.data?.price ?? null;
  const score = scoreRes.data ?? null;
  const tokens = themeTokens(theme);

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100%",
        background: tokens.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {widget === "badge" && <BadgeWidget cycle={cycle} theme={theme} score={score} />}
      {widget === "countdown" && <CountdownWidget cycle={cycle} theme={theme} price={price} />}
      {widget === "score" && (
        <ScoreWidget cycle={cycle} theme={theme} score={score} price={price} />
      )}
      {widget === "full" && <FullWidget cycle={cycle} theme={theme} price={price} score={score} />}
    </div>
  );
}

function BadgeWidget({
  cycle,
  theme,
  score,
}: {
  cycle: CycleInfo;
  theme: EmbedTheme;
  score: CycleScoreResult | null;
}) {
  const t = themeTokens(theme);
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";
  const accent = buy ? t.primary : sell ? t.success : "#2563eb";
  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const label = buy ? "to buy" : sell ? "to sell" : "done";

  return (
    <a
      href={SITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 999,
        background: t.card,
        border: `1px solid ${t.border}`,
        color: t.text,
        textDecoration: "none",
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <BtcLogo size={22} color={t.primary} />
      <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}>
        BTC<span style={{ color: t.primary }}>500</span>
      </span>
      <span
        style={{
          width: 1,
          height: 16,
          background: t.border,
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>
        {days}d {label}
      </span>
      {score && (
        <>
          <span style={{ width: 1, height: 16, background: t.border }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>score {score.score}</span>
        </>
      )}
    </a>
  );
}

function CountdownWidget({
  cycle,
  theme,
  price,
}: {
  cycle: CycleInfo;
  theme: EmbedTheme;
  price: number | null;
}) {
  const t = themeTokens(theme);
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";
  const accent = buy ? t.primary : sell ? t.success : "#2563eb";
  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        margin: "0 auto",
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        padding: 20,
        boxSizing: "border-box",
        color: t.text,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BtcLogo size={24} color={t.primary} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            BTC<span style={{ color: t.primary }}>500</span>
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: accent,
            background: t.soft,
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          {buy ? "Buy window" : sell ? "Sell window" : "Complete"}
        </span>
      </div>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: t.muted,
          }}
        >
          {buy ? "Days until buy" : sell ? "Days until sell" : "Cycle complete"}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: accent,
            marginTop: 6,
          }}
        >
          {days}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          height: 8,
          borderRadius: 999,
          background: theme === "dark" ? "#1f2937" : "#f1f5f9",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: accent,
            borderRadius: 999,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: t.muted,
        }}
      >
        <span>Buy {formatDate(cycle.buyDate)}</span>
        {price != null ? (
          <span>{formatUsd(price)}</span>
        ) : (
          <span>Sell {formatDate(cycle.sellDate)}</span>
        )}
      </div>
      <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: t.muted }}>
        {SITE_URL.replace("https://", "")}
      </div>
    </div>
  );
}

function ScoreWidget({
  cycle,
  theme,
  score,
  price,
}: {
  cycle: CycleInfo;
  theme: EmbedTheme;
  score: CycleScoreResult | null;
  price: number | null;
}) {
  const t = themeTokens(theme);
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";
  const accent = buy ? t.primary : sell ? t.success : "#2563eb";
  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const statusColor =
    score?.status === "script_intact"
      ? t.success
      : score?.status === "late_cycle_heat"
        ? t.primary
        : score?.status === "capitulation_zone"
          ? "#dc2626"
          : accent;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        margin: "0 auto",
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        padding: 22,
        boxSizing: "border-box",
        color: t.text,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BtcLogo size={24} color={t.primary} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            BTC<span style={{ color: t.primary }}>500</span>
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: statusColor,
            background: t.soft,
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          {score?.headline ?? "Loading"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 18 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: t.muted,
              textTransform: "uppercase",
            }}
          >
            Cycle score
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              color: statusColor,
            }}
          >
            {score?.score ?? "—"}
          </div>
        </div>
        <div style={{ paddingBottom: 8, flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{score?.punchline ?? "…"}</div>
          <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>
            {days}d {buy ? "to buy" : sell ? "to sell" : "done"}
            {price != null ? ` · ${formatUsd(price)}` : ""}
          </div>
        </div>
      </div>

      {score && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {score.components.slice(0, 4).map((c) => (
            <div
              key={c.id}
              style={{
                background: theme === "dark" ? "#0b0f14" : t.soft,
                borderRadius: 12,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.muted,
                  textTransform: "uppercase",
                }}
              >
                {c.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                {Math.round(c.score)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: t.muted }}>
        {SITE_URL.replace("https://", "")}
      </div>
    </div>
  );
}

function FullWidget({
  cycle,
  theme,
  price,
  score,
}: {
  cycle: CycleInfo;
  theme: EmbedTheme;
  price: number | null;
  score: CycleScoreResult | null;
}) {
  const t = themeTokens(theme);
  const buy = cycle.phase === "wait-buy";
  const sell = cycle.phase === "wait-sell";
  const accent = buy ? t.primary : sell ? t.success : "#2563eb";
  const accentSoft = t.soft;
  const days = buy ? cycle.daysUntilBuy : sell ? cycle.daysUntilSell : 0;
  const totalDays = 500;
  const elapsed = totalDays - days;
  const progress = buy ? cycle.buyProgress : sell ? cycle.sellProgress : 1;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        padding: 24,
        boxSizing: "border-box",
        color: t.text,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BtcLogo size={36} color={t.primary} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            BTC<span style={{ color: t.primary }}>500</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {score && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 100,
                background: accentSoft,
                fontSize: 12,
                fontWeight: 700,
                color: accent,
              }}
            >
              Score {score.score} · {score.punchline}
            </div>
          )}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 100,
              background: accentSoft,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: accent,
            }}
          >
            {buy ? "Waiting to Buy" : sell ? "Waiting to Sell" : "Cycle Complete"}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: t.muted,
            marginBottom: 8,
          }}
        >
          {buy ? "Days Until Buy Window" : sell ? "Days Until Sell Window" : "Cycle Complete"}
        </div>
        <div style={{ fontSize: 14, color: t.muted, marginBottom: 16 }}>
          {buy ? "500 days before halving" : sell ? "500 days after halving" : "Next cycle loading"}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-0.07em",
              color: accent,
            }}
          >
            {days}
          </span>
          <span style={{ fontSize: 22, fontWeight: 500, color: t.muted, paddingBottom: 12 }}>
            days
          </span>
        </div>

        <div style={{ width: "100%", maxWidth: 480, margin: "28px auto 0" }}>
          <div
            style={{
              height: 10,
              width: "100%",
              overflow: "hidden",
              borderRadius: 999,
              background: theme === "dark" ? "#1f2937" : "#f1f5f9",
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
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: t.muted,
            }}
          >
            <span style={{ fontWeight: 600 }}>{Math.max(0, elapsed)} days elapsed</span>
            <span style={{ fontWeight: 600 }}>{totalDays} days total</span>
          </div>
        </div>

        {score && (
          <div
            style={{
              marginTop: 22,
              textAlign: "left",
              background: theme === "dark" ? "#0b0f14" : t.soft,
              borderRadius: 16,
              padding: "14px 16px",
              border: `1px solid ${t.border}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: t.muted,
              }}
            >
              Next action
            </div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
              {score.action}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: `1px solid ${t.border}`,
          paddingTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          fontSize: 13,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: t.muted,
              marginBottom: 4,
            }}
          >
            Next Halving
          </div>
          <div style={{ fontWeight: 700 }}>{formatDate(cycle.nextHalving)}</div>
          <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
            {formatUtc(cycle.nextHalving)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: t.muted,
              marginBottom: 4,
            }}
          >
            Buy Date
          </div>
          <div style={{ fontWeight: 700 }}>{formatDate(cycle.buyDate)}</div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: t.muted,
              marginBottom: 4,
            }}
          >
            Sell Date
          </div>
          <div style={{ fontWeight: 700 }}>{formatDate(cycle.sellDate)}</div>
          {price != null && (
            <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{formatUsd(price)}</div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          textAlign: "center",
          fontSize: 12,
          color: t.muted,
          letterSpacing: "0.06em",
          fontWeight: 500,
        }}
      >
        {SITE_URL.replace("https://", "")}
      </div>
    </div>
  );
}
