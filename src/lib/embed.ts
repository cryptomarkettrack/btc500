/**
 * Embed widget config — shared between /embed and /embed-kit.
 */

import { SITE_URL } from "./site";

export type EmbedWidget = "full" | "countdown" | "badge";
export type EmbedTheme = "light" | "dark" | "orange";

export const EMBED_WIDGETS: { id: EmbedWidget; label: string; description: string }[] = [
  {
    id: "full",
    label: "Full countdown",
    description: "Classic embed with phase, countdown, progress, and key dates.",
  },
  {
    id: "countdown",
    label: "Compact countdown",
    description: "Minimal days-left widget for sidebars and newsletters.",
  },
  {
    id: "badge",
    label: "Pill badge",
    description: "Tiny status chip — perfect for headers and footers.",
  },
];

export const EMBED_THEMES: { id: EmbedTheme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "orange", label: "Bitcoin orange" },
];

export function parseEmbedWidget(value: unknown): EmbedWidget {
  if (value === "countdown" || value === "badge" || value === "full") {
    return value;
  }
  return "full";
}

export function parseEmbedTheme(value: unknown): EmbedTheme {
  if (value === "dark" || value === "orange" || value === "light") return value;
  return "light";
}

export function embedUrl(opts: {
  widget?: EmbedWidget;
  theme?: EmbedTheme;
  base?: string;
}): string {
  const base = opts.base ?? SITE_URL;
  const params = new URLSearchParams();
  if (opts.widget && opts.widget !== "full") params.set("widget", opts.widget);
  if (opts.theme && opts.theme !== "light") params.set("theme", opts.theme);
  const qs = params.toString();
  return `${base}/embed${qs ? `?${qs}` : ""}`;
}

export function iframeSnippet(opts: {
  widget?: EmbedWidget;
  theme?: EmbedTheme;
  base?: string;
  width?: number | string;
  height?: number | string;
}): string {
  const widget = opts.widget ?? "full";
  const theme = opts.theme ?? "light";
  const src = embedUrl({ widget, theme, base: opts.base });

  const defaults: Record<EmbedWidget, { width: number | string; height: number }> = {
    full: { width: 600, height: 720 },
    countdown: { width: 360, height: 280 },
    badge: { width: 320, height: 72 },
  };

  const d = defaults[widget];
  const width = opts.width ?? d.width;
  const height = opts.height ?? d.height;

  return `<iframe src="${src}" width="${width}" height="${height}" frameborder="0" loading="lazy" style="border:0;border-radius:16px;max-width:100%;overflow:hidden;" title="BTC500 ${widget}"></iframe>`;
}

export interface EmbedThemeTokens {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  success: string;
  soft: string;
  /** Track colour behind the progress bar. */
  track: string;
}

/**
 * The three embed themes, in the site's 2026-11 art direction: warm paper,
 * near-black (the site's own ground) and an orange-tinted paper.
 */
export function themeTokens(theme: EmbedTheme): EmbedThemeTokens {
  if (theme === "dark") {
    return {
      bg: "#0f0d0c",
      card: "#171513",
      text: "#f7f4ef",
      muted: "#9c968c",
      border: "rgba(255,255,255,0.14)",
      primary: "#f7931a",
      success: "#4ade80",
      soft: "rgba(247,147,26,0.16)",
      track: "rgba(255,255,255,0.10)",
    };
  }
  if (theme === "orange") {
    return {
      bg: "#fff3e6",
      card: "#ffffff",
      text: "#1a120a",
      muted: "#8a6a4b",
      border: "#f0d3b2",
      primary: "#c2410c",
      success: "#15803d",
      soft: "#ffe9d2",
      track: "#f6e4d2",
    };
  }
  return {
    bg: "#f7f4ef",
    card: "#fffdf9",
    text: "#14120f",
    muted: "#6f6a63",
    border: "#e4ded4",
    primary: "#c2410c",
    success: "#15803d",
    soft: "#fdeedd",
    track: "#ece6dc",
  };
}
