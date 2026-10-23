import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { trackCta } from "@/lib/analytics";

interface StickyCtaProps {
  /** e.g. "214d to buy", "Buy window open", "312d to sell" */
  label: string;
}

/**
 * Mobile-only sticky CTA pinned to the bottom of the viewport — live countdown
 * plus a shortcut to the simulator. Adapted from the BTC500 growth redesign;
 * hidden on sm+ screens where the hero CTAs are visible.
 */
export function StickyCta({ label }: StickyCtaProps) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur sm:hidden">
      <span className="font-data text-[11px] leading-tight font-medium text-muted-foreground">
        <strong className="font-semibold text-primary">{label}</strong>
      </span>
      <Link
        to="/simulator"
        onClick={() => trackCta("sticky_cta", "/simulator")}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-all active:scale-95"
      >
        See returns
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
