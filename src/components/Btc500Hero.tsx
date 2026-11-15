import { useId, type CSSProperties, type ReactNode } from "react";
import { formatUsd } from "@/lib/phase";
import { WINDOW_DAYS } from "@/lib/halvings";

interface Btc500HeroProps {
  price: number | null;
  /** Days until buy (wait-buy phase). */
  daysLeft?: number;
  /** Days until sell (wait-sell phase). */
  daysUntilSell?: number;
  /** Label shown at the buy point, e.g. "bought Nov 4, 2026". */
  buyDateLabel?: string;
  /** Current cycle phase, used to place the "where we are" market marker. */
  phase?: "wait-buy" | "wait-sell" | "done";
  /** Hide brand title / price when embedded in a share card that already has them. */
  compact?: boolean;
  /** Custom H1 text (HTML string). Defaults to the BTC500 brand block. */
  title?: string;
  /** For screen-readers / crawlers, a keyword-rich H1 when `title` is used. */
  srTitle?: string;
  /** Replaces the default buy/sell tagline under the H1. */
  tagline?: ReactNode;
  /**
   * Primary answer (days to the next dated action + date), rendered directly
   * under the H1 and above the illustration so it is visible above the fold.
   */
  countdown?: ReactNode;
}

/** Match styles.css hero labels — inline so share-card Inter root cannot override. */
const FONT_GROTESK = '"Space Grotesk", system-ui, sans-serif';
const FONT_MONO = '"IBM Plex Mono", ui-monospace, monospace';

const styleHalvingLabel: CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontWeight: 600,
  fontSize: "12px",
  letterSpacing: "0.18em",
  fill: "var(--muted-foreground)",
  textTransform: "uppercase",
};

const styleZoneLabel: CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontWeight: 700,
  fontSize: "19px",
  fill: "var(--foreground)",
};

const styleDayLabel: CSSProperties = {
  fontFamily: FONT_MONO,
  fontWeight: 600,
  fontSize: "11px",
  fill: "var(--primary)",
  letterSpacing: "0.05em",
};

const styleWeAreHere: CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "11px",
  fontWeight: 700,
  fill: "var(--chart-ink, #000000)",
  letterSpacing: "0.06em",
};

export function Btc500Hero({
  price,
  daysLeft = 500,
  daysUntilSell,
  buyDateLabel,
  phase,
  compact = false,
  title,
  srTitle,
  tagline,
  countdown,
}: Btc500HeroProps) {
  const reactId = useId();
  const fadeGradId = `fadeGrad-${reactId.replace(/:/g, "")}`;

  // Price curve points — must mirror the `price-line` path exactly:
  // M 10 380 L 40 392 L 70 400 L 100 388 L 130 397 L 160 378 L 190 360 L 220 368
  // L 250 340 L 280 322 L 310 332 L 340 300 L 370 278 L 400 286 L 430 250
  // L 460 200 L 490 215 L 520 165 L 550 178 L 580 120 L 610 95 L 640 108 L 670 60
  // L 700 80 L 730 105 L 760 150 L 790 175 L 820 210 L 850 235 L 890 260
  const pricePoints: [number, number][] = [
    [10, 380],
    [40, 392],
    [70, 400],
    [100, 388],
    [130, 397],
    [160, 378],
    [190, 360],
    [220, 368],
    [250, 340],
    [280, 322],
    [310, 332],
    [340, 300],
    [370, 278],
    [400, 286],
    [430, 250],
    [460, 200],
    [490, 215],
    [520, 165],
    [550, 178],
    [580, 120],
    [610, 95],
    [640, 108],
    [670, 60],
    [700, 80],
    [730, 105],
    [760, 150],
    [790, 175],
    [820, 210],
    [850, 235],
    [890, 260],
  ];

  // Find Y on the illustrated price curve at a given x by interpolating between points.
  function interpolateY(x: number): number {
    let y = 280; // default
    for (let i = 0; i < pricePoints.length - 1; i++) {
      const [x1, y1] = pricePoints[i];
      const [x2, y2] = pricePoints[i + 1];
      if (x >= x1 && x <= x2) {
        const t = (x - x1) / (x2 - x1);
        y = y1 + t * (y2 - y1);
        break;
      }
    }
    return y;
  }

  // Determine the "where we are" market marker on the chart based on cycle phase.
  let markerX = 310; // default: buy point
  let showMarker = false;

  if (phase === "wait-buy" && daysLeft != null && daysLeft > 0 && daysLeft <= 500) {
    showMarker = true;
    const progress = (500 - daysLeft) / 500;
    markerX = 10 + progress * 300; // start (x=10) → buy point (x=310)
  } else if (
    phase === "wait-sell" &&
    daysUntilSell != null &&
    daysUntilSell >= 0
  ) {
    showMarker = true;
    // During the holding phase we can still be before the halving (between the
    // T-500 buy and the halving), so days-until-sell spans up to ~2×WINDOW_DAYS.
    // Place the marker on the buy→halving leg while pre-halving, halving→sell after.
    const daysSinceBuy = Math.max(0, 2 * WINDOW_DAYS - daysUntilSell);
    const daysSinceHalving = daysSinceBuy - WINDOW_DAYS;
    if (daysSinceHalving < 0) {
      // holding before the halving → between buy (x=310) and halving (x=460)
      markerX = 310 + (daysSinceBuy / WINDOW_DAYS) * 150;
      // keep the full-height marker clear of the bought-callout zone near the buy point
      markerX = Math.max(markerX, 356);
    } else {
      markerX = 460 + (daysSinceHalving / WINDOW_DAYS) * 210; // halving (x=460) → sell point (x=670)
    }
  } else if (phase === "done") {
    showMarker = true;
    markerX = 670; // sell point
  }

  const markerY = interpolateY(markerX);

  return (
    <div className="flex flex-col items-center">
      {/* Badge — hide in compact share-card embeds so the chart stays the focus */}
      {!compact && (
        <div className="order-1 inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5">
          <span className="block h-1.5 w-1.5 rounded-[1px] bg-primary" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            One rule · every halving cycle
          </span>
        </div>
      )}

      {/* Chart */}
      {/* Illustration sits after the answer + CTAs in visual order (flex `order`)
          so the countdown and H1 are the first things painted above the fold. */}
      <div
        className={`relative order-last mt-6 w-full max-w-[780px] ${compact ? "mt-0 px-0" : "px-4 sm:px-0"}`}
      >
        <svg viewBox="0 0 900 460" className="w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={fadeGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal grid */}
          <line className="grid-line" x1="0" y1="100" x2="900" y2="100" />
          <line className="grid-line" x1="0" y1="220" x2="900" y2="220" />
          <line className="grid-line" x1="0" y1="340" x2="900" y2="340" />

          {/* Realistic-ish BTC path */}
          <path
            className="price-fill"
            style={{ fill: `url(#${fadeGradId})` }}
            d="
              M 10 380
              L 40 392 L 70 400 L 100 388 L 130 397 L 160 378
              L 190 360 L 220 368 L 250 340 L 280 322 L 310 332
              L 340 300 L 370 278 L 400 286 L 430 250
              L 460 200 L 490 215 L 520 165 L 550 178 L 580 120
              L 610 95 L 640 108 L 670 60 L 700 80 L 730 105
              L 760 150 L 790 175 L 820 210 L 850 235 L 890 260
              L 890 460 L 10 460 Z"
          />

          <path
            className="price-line"
            d="
              M 10 380
              L 40 392 L 70 400 L 100 388 L 130 397 L 160 378
              L 190 360 L 220 368 L 250 340 L 280 322 L 310 332
              L 340 300 L 370 278 L 400 286 L 430 250
              L 460 200 L 490 215 L 520 165 L 550 178 L 580 120
              L 610 95 L 640 108 L 670 60 L 700 80 L 730 105
              L 760 150 L 790 175 L 820 210 L 850 235 L 890 260"
          />

          {/* Halving vertical rule */}
          <line className="halving-rule" x1="460" y1="30" x2="460" y2="430" />
          <text
            className="halving-label"
            x="460"
            y="20"
            textAnchor="middle"
            style={styleHalvingLabel}
          >
            Halving
          </text>

          {/* Current position / market marker — "where we are" on the chart */}
          {showMarker && (
            <>
              {/* Pulsing dot at current position — same treatment as the bought circle */}
              <circle
                suppressHydrationWarning
                cx={markerX}
                cy={markerY}
                r="8"
                fill={phase === "wait-sell" ? "var(--success)" : "var(--primary)"}
                stroke="var(--background)"
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
              <circle
                suppressHydrationWarning
                cx={markerX}
                cy={markerY}
                r="4"
                fill={phase === "wait-sell" ? "var(--success)" : "var(--primary)"}
                stroke="var(--background)"
                strokeWidth="3"
              />
              {/* Callout line from the dot up to the label, like the buy callout */}
              <line className="callout-line" x1={markerX} y1={markerY} x2={markerX} y2={markerY - 22} />
              {/* "we are here" label with black contrast — above the dot */}
              <text
                suppressHydrationWarning
                x={markerX}
                y={markerY - 22}
                textAnchor="middle"
                style={styleWeAreHere}
              >
                we are here
              </text>
            </>
          )}

          {/* BUY callout: point on curve ~310,332 */}
          <circle
            cx="310"
            cy="332"
            r="8"
            fill="var(--primary)"
            stroke="var(--background)"
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
          <circle
            cx="310"
            cy="332"
            r="6"
            fill="var(--primary)"
            stroke="var(--background)"
            strokeWidth="2.5"
          />
          <line className="callout-line" x1="310" y1="332" x2="310" y2="378" />
          <circle className="zone-fill" cx="310" cy="415" r="44" />
          <circle className="zone-ring" cx="310" cy="415" r="44" />
          <text className="zone-label" x="310" y="408" textAnchor="middle" style={{ ...styleZoneLabel, fill: phase === "wait-sell" || phase === "done" ? "var(--success)" : "var(--primary)" }}>
            {phase === "wait-sell" || phase === "done" ? "bought" : "to buy"}
          </text>
          <text className="day-label" x="310" y="422" textAnchor="middle" style={{ ...styleDayLabel, fontSize: "11px", fill: phase === "wait-sell" || phase === "done" ? "var(--success)" : "var(--primary)" }}>
            {buyDateLabel ?? "−500d"}
          </text>

          {/* SELL callout: point on curve ~670,60 */}
          <circle
            cx="670"
            cy="60"
            r="8"
            fill="var(--primary)"
            stroke="var(--background)"
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
          <circle
            cx="670"
            cy="60"
            r="6"
            fill="var(--primary)"
            stroke="var(--background)"
            strokeWidth="2.5"
          />
          <line className="callout-line" x1="670" y1="60" x2="670" y2="24" />

          {/* sell circle positioned above-right of the peak, clear of the halving label */}
          <circle className="zone-fill" cx="740" cy="55" r="38" />
          <circle className="zone-ring" cx="740" cy="55" r="38" />
          <line className="callout-line" x1="670" y1="60" x2="712" y2="56" />
          <text className="zone-label" x="740" y="48" textAnchor="middle" style={styleZoneLabel}>
            Sell
          </text>
          <text className="day-label" x="740" y="66" textAnchor="middle" style={styleDayLabel}>
            +500d
          </text>
        </svg>
      </div>

      {/* Title — keep brand front-and-center; expand keywords for crawlers */}
      {!compact &&
        (title ? (
          <h1
            className="order-2 mt-6 text-center text-4xl font-bold tracking-tight sm:text-6xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        ) : (
          <h1 className="mt-6 text-center text-5xl font-bold tracking-tight sm:text-6xl">
            BTC<span className="text-primary">500</span>
            <span className="sr-only"> — Bitcoin Halving Countdown and Investment Strategy</span>
          </h1>
        ))}
      {!compact && srTitle && <span className="sr-only">{srTitle}</span>}

      {/* Subtitle — hide in compact so share cards lead with chart + numbers */}
      {!compact && (
        <p
          id="hero-tagline"
          className="order-3 mt-4 max-w-xl text-center text-sm leading-relaxed text-muted-foreground"
          style={{ fontFamily: FONT_MONO }}
        >
          {tagline ?? (
            <>
              <span className="font-semibold text-foreground">
                Buy 500 days before the halving.
              </span>
              <br />
              <span className="font-semibold text-foreground">Sell 500 days after.</span>
            </>
          )}
        </p>
      )}

      {/* Primary answer: the number the visitor came for, above the illustration */}
      {!compact && countdown && <div className="order-4 mt-5 w-full">{countdown}</div>}

      {/* Price */}
      {!compact && price && (
        <div className="order-5 mt-4 inline-flex items-center gap-2 rounded-full bg-muted/80 px-4 py-1.5">
          <span className="text-xs text-muted-foreground">BTC</span>
          <span className="text-sm font-bold">{formatUsd(price)}</span>
        </div>
      )}
    </div>
  );
}
