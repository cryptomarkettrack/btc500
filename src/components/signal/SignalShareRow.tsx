import { useEffect, useState } from "react";
import { Check, Link2, Share2, Twitter } from "lucide-react";
import { SHARE_TWEET, SIGNAL_OG_IMAGE, SIGNAL_URL } from "@/lib/buy-signal";

function tweetIntent(): string {
  const intent = new URL("https://twitter.com/intent/tweet");
  intent.searchParams.set("text", SHARE_TWEET);
  // The shared page declares the live card as og:image / twitter:image, so the
  // link always previews the request-time countdown from /api/og.
  intent.searchParams.set("url", SIGNAL_URL);
  return intent.toString();
}

/**
 * Share row for the buy signal. Each link previews the dynamic OG card because
 * both pages wire `/api/og` as og:image and twitter:image.
 */
export function SignalShareRow({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SIGNAL_URL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Bitcoin 500-Day Buy Signal",
          text: `${SHARE_TWEET}\n${SIGNAL_OG_IMAGE}`,
          url: SIGNAL_URL,
        });
        return;
      } catch {
        // User dismissed the sheet — fall through to the X intent.
      }
    }
    window.open(tweetIntent(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-6"}`}>
      <a
        href={tweetIntent()}
        target="_blank"
        rel="noopener noreferrer"
        className="press inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        <Twitter className="h-4 w-4" />
        Share on X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="press inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={share}
        className="press inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"
      >
        <Share2 className="h-4 w-4" />
        Share this signal
      </button>
      {!compact && (
        <a
          href={SIGNAL_OG_IMAGE}
          target="_blank"
          rel="noopener noreferrer"
          className="font-data ml-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-primary"
        >
          Preview live card ↗
        </a>
      )}
    </div>
  );
}
