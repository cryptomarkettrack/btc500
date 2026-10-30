import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  applyConsentChoice,
  readConsentChoice,
  writeConsentChoice,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * Analytics consent banner — the only control that can grant `analytics_storage`
 * to Google Analytics (see src/lib/consent.ts).
 *
 * Rendered `hidden` on the server and in the first client render: the server
 * cannot read localStorage, and rendering the banner visible then hiding it
 * would flash for every returning visitor. An effect resolves the stored choice
 * after hydration — no choice keeps it visible, a stored choice removes it.
 * Hydration-safe because both sides start from `resolved: false`.
 *
 * Not rendered inside /embed widgets, which must stay chrome-free.
 */
export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setChoice(readConsentChoice());
    setResolved(true);
  }, []);

  if (choice !== null) return null;

  const decide = (next: ConsentChoice) => {
    writeConsentChoice(next);
    applyConsentChoice(next);
    setChoice(next);
  };

  return (
    <div
      id="consent-banner"
      hidden={!resolved}
      role="region"
      aria-label="Analytics consent"
      className="fixed inset-x-3 bottom-20 z-50 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[26rem] sm:-translate-x-1/2"
    >
      <p className="text-sm font-semibold text-foreground">Analytics cookies</p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        BTC500 uses Google Analytics to count visits and see which pages are read. It writes a
        cookie only if you accept — decline and every page still works.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all active:scale-95"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/40 active:scale-95"
        >
          Decline
        </button>
        <Link
          to="/privacy"
          className="ml-auto text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Privacy
        </Link>
      </div>
    </div>
  );
}
