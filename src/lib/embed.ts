/**
 * Embed widget config — shared between /embed and /embed-kit.
 */

import { SITE_URL } from "./site";

export type EmbedWidget = "full" | "countdown" | "badge" | "score";
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
  {
    id: "score",
    label: "Cycle score",
    description: "Script-integrity score card for dashboards and blogs.",
  },
];

export const EMBED_THEMES: { id: EmbedTheme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "orange", label: "Bitcoin orange" },
];

export function parseEmbedWidget(value: unknown): EmbedWidget {
  if (value === "countdown" || value === "badge" || value === "score" || value === "full") {
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
    score: { width: 400, height: 320 },
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
}

export function themeTokens(theme: EmbedTheme): EmbedThemeTokens {
  if (theme === "dark") {
    return {
      bg: "#0b0f14",
      card: "#111827",
      text: "#f8fafc",
      muted: "#94a3b8",
      border: "#1f2937",
      primary: "#f97316",
      success: "#22c55e",
      soft: "#1c1917",
    };
  }
  if (theme === "orange") {
    return {
      bg: "#fff7ed",
      card: "#ffffff",
      text: "#0f172a",
      muted: "#9a3412",
      border: "#fdba74",
      primary: "#ea580c",
      success: "#16a34a",
      soft: "#ffedd5",
    };
  }
  return {
    bg: "#ffffff",
    card: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    primary: "#f97316",
    success: "#16a34a",
    soft: "#fef3e7",
  };
}
