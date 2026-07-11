import { useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";

interface Props {
  captureRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Walk the element tree once, collecting original inline styles and applying
 * resolved computed values for CSS custom properties. Returns a restore
 * function that re-applies the original inline styles.
 */
function inlineComputedStyles(root: HTMLElement): () => void {
  const restoreFns: Array<() => void> = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const el = node as HTMLElement;
    const cs = getComputedStyle(el);
    const prevInline = new Map<string, string>();

    // Read original inline values before we overwrite
    const props: string[] = [
      "backgroundColor",
      "color",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "boxShadow",
      "fill",
      "stroke",
    ];
    const styleAny = el.style as unknown as Record<string, string>;
    for (const p of props) {
      prevInline.set(p, styleAny[p]);
    }

    // Background
    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") el.style.backgroundColor = bg;

    // Text colour
    el.style.color = cs.color;

    // Border colours
    const bt = cs.borderTopColor;
    if (bt && bt !== "rgba(0, 0, 0, 0)") el.style.borderTopColor = bt;
    const br = cs.borderRightColor;
    if (br && br !== "rgba(0, 0, 0, 0)") el.style.borderRightColor = br;
    const bb = cs.borderBottomColor;
    if (bb && bb !== "rgba(0, 0, 0, 0)") el.style.borderBottomColor = bb;
    const bl = cs.borderLeftColor;
    if (bl && bl !== "rgba(0, 0, 0, 0)") el.style.borderLeftColor = bl;

    // Box shadow
    const bs = cs.boxShadow;
    if (bs && bs !== "none") el.style.boxShadow = bs;

    // SVG fill / stroke
    if (el instanceof SVGElement) {
      const fill = cs.fill;
      if (fill && fill !== "" && !fill.startsWith("var(")) el.style.fill = fill;
      const stroke = cs.stroke;
      if (stroke && stroke !== "" && !stroke.startsWith("var(")) el.style.stroke = stroke;
    }

    restoreFns.push(() => {
      const styleAny = el.style as unknown as Record<string, string>;
      for (const p of props) {
        const val = prevInline.get(p);
        if (val !== undefined) styleAny[p] = val;
      }
    });
  }

  return () => {
    for (const fn of restoreFns) fn();
  };
}

export function ShareButton({ captureRef }: Props) {
  const [busy, setBusy] = useState(false);

  async function download() {
    const el = captureRef.current;
    if (!el) return;
    setBusy(true);

    // Temporarily inline computed values for CSS custom properties
    const restore = inlineComputedStyles(el);

    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `btc500-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      // Restore original styles so the page isn't affected
      restore();
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Generate today's X card
    </button>
  );
}
