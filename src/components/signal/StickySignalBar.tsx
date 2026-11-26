import { Twitter } from "lucide-react";
import { BuyPointCountdown } from "./BuyPointCountdown";
import { SHARE_TWEET, SIGNAL_URL } from "@/lib/buy-signal";

function tweetIntent(): string {
  const intent = new URL("https://twitter.com/intent/tweet");
  intent.searchParams.set("text", SHARE_TWEET);
  intent.searchParams.set("url", SIGNAL_URL);
  return intent.toString();
}

/**
 * Persistent share bar: stays pinned from any scroll position so a visitor who
 * lands mid-page on a citation can still see the countdown and share it.
 */
export function StickySignalBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-data text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            btc500.net
          </span>
          <span className="hidden h-3 w-px bg-white/15 sm:block" />
          <BuyPointCountdown compact />
        </div>
        <a
          href={tweetIntent()}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Twitter className="h-3.5 w-3.5" />
          Share on X
        </a>
      </div>
    </div>
  );
}
