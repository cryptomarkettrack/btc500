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
  name: "BTC500 Embed Kit — Countdown Widgets",
  description:
    "Embed BTC500 countdown badges, compact countdowns, and full widgets on your blog, newsletter, or dashboard. Free iframe embeds with light, dark, and orange themes.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Embed Kit", path: "/embed-kit" },
  ],
});

export const Route = createFileRoute("/embed-kit")({
  head: () =>
    generatePageHead({
      path: "/embed-kit",
      title: "BTC500 Embed Kit — Free Bitcoin Countdown Widgets",
      description:
        "Embed live BTC500 countdown badges, compact countdowns, and full halving widgets. Copy iframe code for blogs, newsletters, and dashboards.",
      keywords: "Bitcoin embed widget, halving countdown embed, BTC500 widget, crypto iframe",
      ogTitle: "BTC500 Embed Kit — Free Countdown Widgets",
      ogDescription: "Drop a live BTC500 countdown on your site in one iframe.",
      ogImageAlt: "BTC500 Embed Kit",
      schema,
    }),
  component: EmbedKitPage,
});

function EmbedKitPage() {
  const [widget, setWidget] = useState<EmbedWidget>("full");
  const [theme, setTheme] = useState<EmbedTheme>("dark");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(SITE_URL);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const src = embedUrl({ widget, theme, base: origin });
  const code = iframeSnippet({ widget, theme, base: origin });

  const previewHeight = widget === "badge" ? 96 : widget === "countdown" ? 300 : 720;

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
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24 sm:pt-20">
        {/* ---- header ---- */}
        <header className="max-w-2xl">
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Embed 2.0 · free · no API key
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            Put the countdown on <span className="text-primary">your</span> site
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Three widgets, three themes, one iframe. Drop a live BTC500 countdown into a blog, a
            newsletter or a dashboard — the dates update themselves, because they come from the
            block schedule.
          </p>
        </header>

        {/* min-w-0 on columns prevents grid children from forcing page-wide overflow */}
        <div className="mt-12 grid w-full min-w-0 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-6">
          {/* ---- controls ---- */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-fit min-w-0 rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6"
          >
            <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Widget type
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {EMBED_WIDGETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWidget(w.id)}
                  aria-pressed={widget === w.id}
                  className={`lift rounded-xl border px-4 py-3 text-left ${
                    widget === w.id
                      ? "border-primary/60 bg-primary/[0.07]"
                      : "border-white/10 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        widget === w.id ? "bg-primary" : "bg-white/20"
                      }`}
                      aria-hidden="true"
                    />
                    {w.label}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {w.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="font-data mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Theme
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {EMBED_THEMES.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  aria-pressed={theme === th.id}
                  className={`press rounded-full border px-4 py-2 text-sm font-semibold ${
                    theme === th.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/15 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copy}
              className="press mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
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
              className="press mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              Open embed URL
            </a>
          </motion.div>

          {/* ---- preview + code ---- */}
          <div className="flex min-w-0 flex-col gap-4">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <span className="font-data flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                  Live preview
                </span>
                <span className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {widget} · {theme}
                </span>
              </div>
              <div
                className="w-full max-w-full overflow-hidden border-b border-white/10 bg-black/20 p-4"
                style={{ minHeight: previewHeight }}
              >
                <iframe
                  key={src}
                  src={src}
                  title={`BTC500 ${widget} preview`}
                  className="block h-full w-full max-w-full border-0"
                  style={{ minHeight: previewHeight - 32 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="min-w-0 rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="font-data flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Code2 className="h-3.5 w-3.5 shrink-0" />
                  Iframe snippet
                </div>
                <button
                  type="button"
                  onClick={copy}
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-w-full overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 font-data text-xs leading-relaxed text-foreground">
                <code className="block max-w-full whitespace-pre-wrap break-all">{code}</code>
              </pre>
              <p className="font-data mt-3 break-all text-xs text-muted-foreground">
                Direct URL:{" "}
                <a href={src} className="link-draw font-medium text-primary">
                  {src}
                </a>
              </p>
            </motion.div>

            <div className="min-w-0 rounded-2xl border border-white/10 bg-[var(--panel)] p-5 text-sm text-muted-foreground sm:p-6">
              <p className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Distribution tips
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>Use the badge in headers and newsletters.</li>
                <li>Use the compact countdown in sidebars and email digests.</li>
                <li>The full countdown works as a standalone section.</li>
                <li>Prefer the dark theme on dark sites — the tokens are baked into the embed.</li>
              </ul>
              <div className="mt-5">
                <Link to="/" className="link-draw font-semibold text-primary">
                  ← Back to the command center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
