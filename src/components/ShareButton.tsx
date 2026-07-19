import { useState, useCallback } from "react";
import { toCanvas } from "html-to-image";
import { Download, Copy, Loader2, Check, Code2, X } from "lucide-react";

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

    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") el.style.backgroundColor = bg;

    el.style.color = cs.color;

    const bt = cs.borderTopColor;
    if (bt && bt !== "rgba(0, 0, 0, 0)") el.style.borderTopColor = bt;
    const br = cs.borderRightColor;
    if (br && br !== "rgba(0, 0, 0, 0)") el.style.borderRightColor = br;
    const bb = cs.borderBottomColor;
    if (bb && bb !== "rgba(0, 0, 0, 0)") el.style.borderBottomColor = bb;
    const bl = cs.borderLeftColor;
    if (bl && bl !== "rgba(0, 0, 0, 0)") el.style.borderLeftColor = bl;

    const bs = cs.boxShadow;
    if (bs && bs !== "none") el.style.boxShadow = bs;

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
  const [copied, setCopied] = useState(false);
  const [iframeCopied, setIframeCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const download = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    setBusy(true);

    const restore = inlineComputedStyles(el);

    try {
      const canvas = await toCanvas(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fff",
      });

      const dataUrl = canvas.toDataURL("image/png");
      const fileName = `btc500-${new Date().toISOString().slice(0, 10)}.png`;

      // Check if we're on iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      if (isIOS) {
        // For iOS Safari, show in-page modal with preview and download button
        setPreviewUrl(dataUrl);
        setShowPreview(true);
      } else {
        // For other browsers, use the standard download approach
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } finally {
      restore();
      setBusy(false);
    }
  }, [captureRef]);

  const copyToClipboard = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    setBusy(true);

    const restore = inlineComputedStyles(el);

    let canvas: HTMLCanvasElement | undefined;
    try {
      canvas = await toCanvas(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fff",
      });

      if (!canvas) {
        throw new Error("Failed to generate canvas");
      }

      // Convert canvas to blob using the native Canvas API
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas!.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) {
        throw new Error("Canvas toBlob returned null");
      }

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy image to clipboard", err);

      // Fallback: try writing a data URL as text so user can manually copy
      try {
        const dataUrl = canvas?.toDataURL("image/png");
        if (dataUrl) {
          await navigator.clipboard.writeText(dataUrl);
        }
      } catch {
        // ignore fallback failure
      }
    } finally {
      restore();
      setBusy(false);
    }
  }, [captureRef]);

  const copyIframeCode = useCallback(async () => {
    const origin = window.location.origin;
    const iframeCode = `<iframe src="${origin}/embed" width="600" height="800" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`;

    try {
      await navigator.clipboard.writeText(iframeCode);
      setIframeCopied(true);
      setTimeout(() => setIframeCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy iframe code", err);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={download}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Generate today's X card
        </button>
        <button
          onClick={copyToClipboard}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-foreground/5 disabled:opacity-50 sm:w-auto"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy image to clipboard
            </>
          )}
        </button>
        <button
          onClick={copyIframeCode}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-foreground/5 disabled:opacity-50 sm:w-auto"
        >
          {iframeCopied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Code2 className="h-4 w-4" />
              Copy embed code
            </>
          )}
        </button>
      </div>

      {/* iOS Preview Modal */}
      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-black hover:bg-black/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewUrl}
              alt="BTC500 Card Preview"
              className="max-w-full h-auto rounded-lg"
            />
            <a
              href={previewUrl}
              download={`btc500-${new Date().toISOString().slice(0, 10)}.png`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download Image
            </a>
          </div>
        </div>
      )}
    </>
  );
}
