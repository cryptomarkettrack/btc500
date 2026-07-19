import { formatUsd } from "@/lib/phase";

interface Btc500HeroProps {
  price: number | null;
  daysLeft?: number;
}

export function Btc500Hero({ price, daysLeft = 500 }: Btc500HeroProps) {
  // Calculate current position on chart (0-500 days maps to x position)
  // Buy point is at x=310, chart starts at x=10
  const progress = (500 - daysLeft) / 500; // 0 to 1
  const currentX = 10 + progress * 300; // Maps to x=10 (start) to x=310 (buy point)

  // Find approximate Y position on price curve at currentX
  // Price curve points (x, y): (10,280), (40,292), (70,300), (100,288), (130,297), (160,278),
  // (190,260), (220,268), (250,240), (280,222), (310,232), (340,200), (370,178),
  // (400,186), (430,150), (460,100), (490,115), (520,65), (550,78), (580,20),
  // (610,10), (640,20), (670,10), (700,30), (730,55), (760,100), (790,125),
  // (820,150), (850,175), (890,200)
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
  let currentY = 280; // default
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
    <div className="flex flex-col items-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5">
        <span className="block h-1.5 w-1.5 rounded-[1px] bg-primary" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          One rule · every halving cycle
        </span>
      </div>

      {/* Chart */}
      <div className="relative w-full max-w-[900px] px-4 sm:px-0">
        <svg viewBox="0 0 900 460" className="w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="fadeGrad" x1="0" y1="0" x2="0" y2="1">
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
          <text className="halving-label" x="460" y="20" textAnchor="middle">
            Halving
          </text>

          {/* Current position indicator - show when we're in the counting period or at the start */}
          {daysLeft <= 500 && daysLeft > 0 && (
            <>
              {/* Vertical line from bottom to current price position */}
              <line
                x1={currentX}
                y1={currentY}
                x2={currentX}
                y2={400}
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              {/* Pulsing dot at current position */}
              <circle cx={currentX} cy={currentY} r="6" fill="var(--primary)" opacity="0.3">
                <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={currentX} cy={currentY} r="4" fill="var(--primary)" />
              {/* Days remaining label */}
              <text
                x={currentX}
                y={currentY - 18}
                textAnchor="middle"
                className="day-label"
                style={{ fontSize: "12px", fill: "var(--primary)" }}
              >
                {daysLeft}d
              </text>
              {/* "we are here" label with black contrast - positioned right next to the dot */}
              <text
                x={currentX}
                y={currentY + 16}
                textAnchor="middle"
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  fill: "#000000",
                  fontFamily: "Space Grotesk, sans-serif",
                  letterSpacing: "0.06em",
                }}
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
          <circle className="zone-fill" cx="310" cy="415" r="38" />
          <circle className="zone-ring" cx="310" cy="415" r="38" />
          <text className="zone-label" x="310" y="408" textAnchor="middle">
            Buy
          </text>
          <text className="day-label" x="310" y="426" textAnchor="middle">
            −500d
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
          <text className="zone-label" x="740" y="48" textAnchor="middle">
            Sell
          </text>
          <text className="day-label" x="740" y="66" textAnchor="middle">
            +500d
          </text>
        </svg>
      </div>

      {/* Title */}
      <h1 className="mt-6 text-center text-5xl font-bold tracking-tight sm:text-6xl">
        BTC<span className="text-primary">500</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-md text-center font-mono text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Buy 500 days before the halving.</span>
        <br />
        <span className="font-semibold text-foreground">Sell 500 days after.</span>
      </p>

      {/* Price */}
      {price && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted/80 px-4 py-1.5">
          <span className="text-xs text-muted-foreground">BTC</span>
          <span className="text-sm font-bold">{formatUsd(price)}</span>
        </div>
      )}
    </div>
  );
}
