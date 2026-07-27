import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Code2, Copy, ExternalLink, LayoutTemplate, Sparkles } from "lucide-react";
import {
  EMBED_THEMES,
  EMBED_WIDGETS,
  embedUrl,
  iframeSnippet,
  type EmbedTheme,
  type EmbedWidget,
} from "@/lib/embed";
import { SITE_URL, generatePageHead, generateWebPageSchema } from "@/lib/site";

const schema = generateWebPageSchema({
  path: "/embed-kit",
  name: "BTC500 Embed Kit — Countdown & Cycle Score Widgets",
  description:
    "Embed BTC500 countdown badges, cycle score cards, and full widgets on your blog, newsletter, or dashboard. Free iframe embeds with light, dark, and orange themes.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Embed Kit", path: "/embed-kit" },
  ],
});

export const Route = createFileRoute("/embed-kit")({
  head: () =>
    generatePageHead({
      path: "/embed-kit",
      title: "BTC500 Embed Kit — Free Bitcoin Countdown & Cycle Score Widgets",
      description:
        "Embed live BTC500 countdown badges, cycle score cards, and full halving widgets. Copy iframe code for blogs, newsletters, and dashboards.",
      keywords:
        "Bitcoin embed widget, halving countdown embed, BTC500 widget, crypto iframe, Bitcoin cycle score widget",
      ogTitle: "BTC500 Embed Kit — Free Countdown Widgets",
      ogDescription: "Drop a live BTC500 countdown or cycle score on your site in one iframe.",
      ogImageAlt: "BTC500 Embed Kit",
      schema,
    }),
  component: EmbedKitPage,
});

function EmbedKitPage() {
  const [widget, setWidget] = useState<EmbedWidget>("full");
  const [theme, setTheme] = useState<EmbedTheme>("light");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(SITE_URL);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const src = embedUrl({ widget, theme, base: origin });
  const code = iframeSnippet({ widget, theme, base: origin });

  const previewHeight =
    widget === "badge" ? 96 : widget === "countdown" ? 300 : widget === "score" ? 340 : 720;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <LayoutTemplate className="h-3.5 w-3.5 text-primary" />
            Embed 2.0
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Embed Kit</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Drop a live BTC<span className="text-primary">500</span> countdown or cycle score on
            blogs, newsletters, and dashboards. Free, no API key.
          </p>
        </header>

        {/* min-w-0 on columns prevents grid children from forcing page-wide overflow */}
        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-8">
          {/* Controls */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-fit min-w-0 rounded-[24px] border border-border/60 bg-card p-5 sm:p-6"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Widget type
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {EMBED_WIDGETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWidget(w.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    widget === w.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm font-semibold">{w.label}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {w.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Theme
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {EMBED_THEMES.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    theme === th.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copy}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied iframe
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy iframe code
                </>
              )}
            </button>

            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              Open embed URL
            </a>
          </motion.div>

          {/* Preview + code */}
          <div className="flex min-w-0 flex-col gap-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="min-w-0 rounded-[24px] border border-border/60 bg-card p-4 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                Live preview
              </div>
              <div
                className="w-full max-w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/30"
                style={{ height: previewHeight }}
              >
                <iframe
                  key={src}
                  src={src}
                  title={`BTC500 ${widget} preview`}
                  className="block h-full w-full max-w-full border-0"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="min-w-0 rounded-[24px] border border-border/60 bg-card p-4 sm:p-6"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Code2 className="h-3.5 w-3.5 shrink-0" />
                  Iframe snippet
                </div>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/80"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-w-full overflow-x-auto rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-foreground">
                <code className="block max-w-full whitespace-pre-wrap break-all">{code}</code>
              </pre>
              <p className="mt-3 break-all text-xs text-muted-foreground">
                Direct URL:{" "}
                <a
                  href={src}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {src}
                </a>
              </p>
            </motion.div>

            <div className="min-w-0 rounded-[24px] border border-border/60 bg-card p-5 text-sm text-muted-foreground sm:p-6">
              <p className="font-semibold text-foreground">Distribution tips</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Use the badge in headers and newsletters.</li>
                <li>Use cycle score on research blogs and dashboards.</li>
                <li>Full countdown works great as a standalone section.</li>
                <li>Prefer dark theme on dark sites — tokens are baked into the embed.</li>
              </ul>
              <div className="mt-4">
                <Link to="/" className="font-semibold text-primary hover:underline">
                  ← Back to Command Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
