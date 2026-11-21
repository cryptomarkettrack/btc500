import type { ExchangeCandle } from "./market-data";

export interface ChartCandle {
  candle: ExchangeCandle;
  x: number;
  wickTop: number;
  wickBottom: number;
  bodyTop: number;
  bodyBottom: number;
  /** At least 1.5px so a flat candle is still visible. */
  bodyHeight: number;
  up: boolean;
  width: number;
}

export interface ChartGeometry {
  width: number;
  height: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
  minPrice: number;
  maxPrice: number;
  slot: number;
  candles: ChartCandle[];
  gridPrices: number[];
  y: (price: number) => number;
}

const PADDING = { left: 10, right: 64, top: 14, bottom: 26 };

/** Pure geometry for the candlestick SVG. No DOM or framework dependencies. */
export function buildChartGeometry(
  candles: ExchangeCandle[],
  width = 800,
  height = 260,
): ChartGeometry | null {
  if (candles.length === 0) return null;

  const prices = candles.flatMap((candle) => [candle.low, candle.high]);
  let min = Math.min(...prices);
  let max = Math.max(...prices);
  if (min === max) {
    min -= Math.max(1, min * 0.001);
    max += Math.max(1, max * 0.001);
  }
  const padding = (max - min) * 0.08;
  min -= padding;
  max += padding;

  const plotLeft = PADDING.left;
  const plotRight = width - PADDING.right;
  const plotTop = PADDING.top;
  const plotBottom = height - PADDING.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const slot = plotWidth / candles.length;
  const bodyWidth = Math.max(2, Math.min(12, slot * 0.6));

  const y = (price: number): number => plotTop + ((max - price) / (max - min)) * plotHeight;

  return {
    width,
    height,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    minPrice: min,
    maxPrice: max,
    slot,
    candles: candles.map((candle, index) => {
      const x = plotLeft + index * slot + slot / 2;
      const up = candle.close >= candle.open;
      const bodyTop = y(Math.max(candle.open, candle.close));
      const bodyBottom = y(Math.min(candle.open, candle.close));
      return {
        candle,
        x,
        wickTop: y(candle.high),
        wickBottom: y(candle.low),
        bodyTop,
        bodyBottom,
        bodyHeight: Math.max(1.5, bodyBottom - bodyTop),
        up,
        width: bodyWidth,
      };
    }),
    gridPrices: Array.from({ length: 5 }, (_, index) => max - (index / 4) * (max - min)).slice(
      0,
      -1,
    ),
    y,
  };
}
