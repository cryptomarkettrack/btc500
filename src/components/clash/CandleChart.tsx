import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeFormatter } from "@/hooks/use-local-time";
import type { ExchangeCandle } from "@/lib/clash/binance";
import { buildChartGeometry } from "@/lib/clash/chart";

interface CandleChartProps {
  candles: ExchangeCandle[];
  /** Open time of the candle the player can currently predict. */
  liveOpenTime: number;
  formatTime: TimeFormatter;
  timeZone: string;
}

/** Lightweight SVG candlestick chart — no extra chart dependency or hydration gap. */
export function CandleChart({ candles, liveOpenTime, formatTime, timeZone }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visible = width < 520 ? candles.slice(-24) : candles;
  const geometry = buildChartGeometry(visible, width, 260);
  const last = visible.at(-1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">BTC / USDT · 15m candles</CardTitle>
            <CardDescription>
              Recent Binance spot candles · times in {timeZone} · live candle in orange
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-500" /> Up
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-red-500" /> Down
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-orange-500 bg-orange-500/20" /> Now
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full">
          {!geometry ? (
            <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Chart unavailable — exchange data could not be loaded.
            </div>
          ) : (
            <svg
              width="100%"
              height={geometry.height}
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
              role="img"
              aria-label={`BTC USDT 15 minute candles. Last price ${last?.close.toLocaleString("en-US") ?? "unavailable"} dollars.`}
              className="block overflow-visible"
            >
              {geometry.gridPrices.map((price) => {
                const y = geometry.y(price);
                return (
                  <g key={price}>
                    <line
                      x1={geometry.plotLeft}
                      x2={geometry.plotRight}
                      y1={y}
                      y2={y}
                      className="stroke-border/70"
                      strokeWidth={1}
                    />
                    <text
                      x={geometry.width - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-muted-foreground font-mono text-[10px]"
                    >
                      {price >= 1000 ? Math.round(price).toLocaleString("en-US") : price.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {geometry.candles.map(
                ({ candle, x, wickTop, wickBottom, bodyTop, bodyHeight, up, width: bodyWidth }) => {
                  const isLive = candle.openTime === liveOpenTime;
                  return (
                    <g key={candle.openTime}>
                      <title>
                        {`${formatTime(candle.openTime)} · O ${candle.open.toFixed(2)} · H ${candle.high.toFixed(2)} · L ${candle.low.toFixed(2)} · C ${candle.close.toFixed(2)}${isLive ? " · live" : ""}`}
                      </title>
                      {isLive && (
                        <rect
                          x={x - geometry.slot / 2}
                          y={geometry.plotTop}
                          width={geometry.slot}
                          height={geometry.plotBottom - geometry.plotTop}
                          className="fill-orange-500/10"
                        />
                      )}
                      <line
                        x1={x}
                        x2={x}
                        y1={wickTop}
                        y2={wickBottom}
                        className={up ? "stroke-emerald-500" : "stroke-red-500"}
                        strokeWidth={1.5}
                      />
                      <rect
                        x={x - bodyWidth / 2}
                        y={bodyTop}
                        width={bodyWidth}
                        height={bodyHeight}
                        rx={1}
                        className={up ? "fill-emerald-500" : "fill-red-500"}
                      />
                    </g>
                  );
                },
              )}

              {last && (
                <g>
                  <line
                    x1={geometry.plotLeft}
                    x2={geometry.plotRight}
                    y1={geometry.y(last.close)}
                    y2={geometry.y(last.close)}
                    className="stroke-orange-500/60"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={geometry.plotRight + 2}
                    y={geometry.y(last.close) - 9}
                    width={geometry.width - geometry.plotRight - 6}
                    height={18}
                    rx={3}
                    className="fill-orange-500"
                  />
                  <text
                    x={geometry.plotRight + (geometry.width - geometry.plotRight) / 2 - 2}
                    y={geometry.y(last.close) + 3.5}
                    textAnchor="middle"
                    className="fill-white font-mono text-[10px] font-semibold"
                  >
                    {last.close >= 1000
                      ? Math.round(last.close).toLocaleString("en-US")
                      : last.close.toFixed(2)}
                  </text>
                </g>
              )}

              {visible.length > 0 && (
                <g className="fill-muted-foreground font-mono text-[10px]">
                  <text x={geometry.plotLeft} y={geometry.height - 6} textAnchor="start">
                    {formatTime(visible[0].openTime)}
                  </text>
                  <text
                    x={(geometry.plotLeft + geometry.plotRight) / 2}
                    y={geometry.height - 6}
                    textAnchor="middle"
                  >
                    {formatTime(visible[Math.floor(visible.length / 2)].openTime)}
                  </text>
                  <text x={geometry.plotRight} y={geometry.height - 6} textAnchor="end">
                    {formatTime(visible[visible.length - 1].openTime)}
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
