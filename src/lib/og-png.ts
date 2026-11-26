/**
 * Dependency-free 1200x630 PNG renderer for /api/og.
 *
 * TanStack Start has no `next/og` equivalent and the project ships no image
 * library, so the card is rasterised here with a 5x7 bitmap font and encoded
 * with node:zlib (PNG colour type 6, filter 0). Nothing is fetched from a
 * renderer service and no dependency is added.
 */

import { deflateSync } from "node:zlib";

type Rgb = readonly [number, number, number];

const WIDTH = 1200;
const HEIGHT = 630;
const BG: Rgb = [13, 14, 17];
const PANEL: Rgb = [22, 25, 30];
const ORANGE: Rgb = [247, 147, 26];
const WHITE: Rgb = [246, 246, 242];
const MUTED: Rgb = [154, 160, 170];
const GREEN: Rgb = [74, 205, 130];

const FONT: Record<string, string> = {
  "0": "01110/10001/10011/10101/11001/10001/01110",
  "1": "00100/01100/00100/00100/00100/00100/01110",
  "2": "01110/10001/00001/00010/00100/01000/11111",
  "3": "11111/00010/00100/00010/00001/10001/01110",
  "4": "00010/00110/01010/10010/11111/00010/00010",
  "5": "11111/10000/11110/00001/00001/10001/01110",
  "6": "00110/01000/10000/11110/10001/10001/01110",
  "7": "11111/00001/00010/00100/01000/01000/01000",
  "8": "01110/10001/10001/01110/10001/10001/01110",
  "9": "01110/10001/10001/01111/00001/00010/01100",
  A: "01110/10001/10001/11111/10001/10001/10001",
  B: "11110/10001/10001/11110/10001/10001/11110",
  C: "01111/10000/10000/10000/10000/10000/01111",
  D: "11110/10001/10001/10001/10001/10001/11110",
  E: "11111/10000/10000/11110/10000/10000/11111",
  F: "11111/10000/10000/11110/10000/10000/10000",
  G: "01111/10000/10000/10011/10001/10001/01111",
  H: "10001/10001/10001/11111/10001/10001/10001",
  I: "01110/00100/00100/00100/00100/00100/01110",
  J: "00111/00010/00010/00010/00010/10010/01100",
  K: "10001/10010/10100/11000/10100/10010/10001",
  L: "10000/10000/10000/10000/10000/10000/11111",
  M: "10001/11011/10101/10101/10001/10001/10001",
  N: "10001/11001/10101/10011/10001/10001/10001",
  O: "01110/10001/10001/10001/10001/10001/01110",
  P: "11110/10001/10001/11110/10000/10000/10000",
  Q: "01110/10001/10001/10001/10101/10010/01101",
  R: "11110/10001/10001/11110/10100/10010/10001",
  S: "01111/10000/10000/01110/00001/00001/11110",
  T: "11111/00100/00100/00100/00100/00100/00100",
  U: "10001/10001/10001/10001/10001/10001/01110",
  V: "10001/10001/10001/10001/10001/01010/00100",
  W: "10001/10001/10001/10101/10101/11011/10001",
  X: "10001/10001/01010/00100/01010/10001/10001",
  Y: "10001/10001/01010/00100/00100/00100/00100",
  Z: "11111/00001/00010/00100/01000/10000/11111",
  a: "00000/00000/01110/00001/01111/10001/01111",
  b: "10000/10000/10110/11001/10001/10001/11110",
  c: "00000/00000/01111/10000/10000/10000/01111",
  d: "00001/00001/01101/10011/10001/10001/01111",
  e: "00000/00000/01110/10001/11111/10000/01111",
  f: "00110/01001/01000/11100/01000/01000/01000",
  g: "00000/01111/10001/10001/01111/00001/01110",
  h: "10000/10000/10110/11001/10001/10001/10001",
  i: "00100/00000/01100/00100/00100/00100/01110",
  j: "00010/00000/00110/00010/00010/10010/01100",
  k: "10000/10000/10010/10100/11000/10100/10010",
  l: "01100/00100/00100/00100/00100/00100/01110",
  m: "00000/00000/11010/10101/10101/10101/10101",
  n: "00000/00000/10110/11001/10001/10001/10001",
  o: "00000/00000/01110/10001/10001/10001/01110",
  p: "00000/11110/10001/10001/11110/10000/10000",
  q: "00000/01111/10001/10001/01111/00001/00001",
  r: "00000/00000/10110/11001/10000/10000/10000",
  s: "00000/00000/01111/10000/01110/00001/11110",
  t: "01000/01000/11100/01000/01000/01001/00110",
  u: "00000/00000/10001/10001/10001/10011/01101",
  v: "00000/00000/10001/10001/10001/01010/00100",
  w: "00000/00000/10001/10001/10101/10101/01010",
  x: "00000/00000/10001/01010/00100/01010/10001",
  y: "00000/10001/10001/10001/01111/00001/01110",
  z: "00000/00000/11111/00010/00100/01000/11111",
  " ": "00000/00000/00000/00000/00000/00000/00000",
  ".": "00000/00000/00000/00000/00000/01100/01100",
  ",": "00000/00000/00000/00000/01100/01100/01000",
  ":": "00000/01100/01100/00000/01100/01100/00000",
  "-": "00000/00000/00000/11111/00000/00000/00000",
  $: "00100/01111/10100/01110/00101/11110/00100",
  "%": "11001/11010/00010/00100/01000/01011/10011",
  "+": "00000/00100/00100/11111/00100/00100/00000",
  "?": "01110/10001/00001/00010/00100/00000/00100",
  "!": "00100/00100/00100/00100/00100/00000/00100",
  "/": "00001/00010/00010/00100/01000/01000/10000",
};

const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;

function glyph(character: string): string[] | null {
  const key = character === "−" || character === "·" ? (character === "−" ? "-" : ".") : character;
  const definition = FONT[key];
  return definition ? definition.split("/") : null;
}

function fill(rgba: Uint8Array, x: number, y: number, width: number, height: number, color: Rgb) {
  for (let row = Math.max(0, y); row < Math.min(HEIGHT, y + height); row += 1) {
    for (let col = Math.max(0, x); col < Math.min(WIDTH, x + width); col += 1) {
      const offset = (row * WIDTH + col) * 4;
      rgba[offset] = color[0];
      rgba[offset + 1] = color[1];
      rgba[offset + 2] = color[2];
      rgba[offset + 3] = 255;
    }
  }
}

function text(rgba: Uint8Array, value: string, x: number, y: number, scale: number, color: Rgb) {
  let cursor = x;
  for (const character of value) {
    const rows = glyph(character);
    if (rows) {
      for (let row = 0; row < GLYPH_HEIGHT; row += 1) {
        for (let col = 0; col < GLYPH_WIDTH; col += 1) {
          if (rows[row][col] === "1") {
            fill(rgba, cursor + col * scale, y + row * scale, scale, scale, color);
          }
        }
      }
    }
    cursor += (GLYPH_WIDTH + 1) * scale;
  }
}

export interface SignalCard {
  /** Calendar days to the buy point, computed server-side at request time. */
  tMinusDays: string;
  /** "T-minus 2 days" / "Buy window is OPEN" headline. */
  headline: string;
  /** Formatted last close, e.g. "$60,374". */
  price: string;
  /** Formatted drawdown, e.g. "−52.16%". */
  drawdown: string;
}

/** Render the card into an RGBA buffer. */
function rasterize(card: SignalCard): Uint8Array {
  const rgba = new Uint8Array(WIDTH * HEIGHT * 4);
  fill(rgba, 0, 0, WIDTH, HEIGHT, BG);
  fill(rgba, 0, 0, WIDTH, 10, ORANGE);
  fill(rgba, 60, 104, 1080, 2, PANEL);
  fill(rgba, 60, 332, 1080, 2, PANEL);

  text(rgba, "btc500.net", 60, 48, 5, ORANGE);
  text(rgba, "LIVE 500-DAY SIGNAL", 798, 54, 3, MUTED);

  text(rgba, card.headline, 60, 160, card.headline.length > 16 ? 8 : 11, WHITE);
  text(rgba, "Bitcoin 500-Day Buy Point: Nov 28, 2026", 60, 270, 4, ORANGE);

  text(rgba, `LAST CLOSE ${card.price}`, 60, 372, 5, WHITE);
  text(rgba, `${card.drawdown} FROM OCT 2025 HIGH`, 60, 428, 4, GREEN);

  text(rgba, "BUY 500D BEFORE HALVING . SELL 500D AFTER", 60, 530, 3, MUTED);
  text(rgba, `T-MINUS ${card.tMinusDays} DAYS - BTC500.NET/API/OG`, 60, 580, 2, MUTED);

  return rgba;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

/** Encode an RGBA buffer as a PNG (8-bit, colour type 6). */
function encodePng(rgba: Uint8Array): Uint8Array {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  const header = new DataView(ihdr.buffer);
  header.setUint32(0, WIDTH);
  header.setUint32(4, HEIGHT);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = WIDTH * 4;
  const scanlines = new Uint8Array((stride + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    scanlines[y * (stride + 1)] = 0;
    scanlines.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  return concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(scanlines, { level: 9 })),
    pngChunk("IEND", new Uint8Array(0)),
  ]);
}

/** Public entry point used by the /api/og route. */
export function renderSignalOgImage(card: SignalCard): Uint8Array {
  return encodePng(rasterize(card));
}
