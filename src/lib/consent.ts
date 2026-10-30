/**
 * Analytics consent — Google Consent Mode v2.
 *
 * Google Analytics 4 is the only tag on the site and it is configured with
 * `analytics_storage: "denied"` before it loads, so no `_ga` cookie is written
 * until the visitor accepts the banner (see `src/components/ConsentBanner.tsx`).
 *
 * Denying *storage* rather than the tag is deliberate: GA4 keeps sending
 * cookieless aggregate pings, so the site can still tell which pages are read
 * without identifying anyone. That keeps the 7-day and 28-day readings usable
 * while making the privacy page's "cookies only if you accept" claim true.
 *
 * Advertising signals stay denied permanently — BTC500 runs no ads, no
 * remarketing and no ad-personalisation, so nothing ever grants them.
 */

/** localStorage key holding the visitor's choice. Versioned so a copy change can re-ask. */
export const CONSENT_STORAGE_KEY = "btc500.consent.v1";

export type ConsentChoice = "granted" | "denied";

/** Consent Mode v2 defaults, sent before `gtag("config")`. */
export const CONSENT_MODE_DEFAULT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

export const CONSENT_MODE_GRANTED = { analytics_storage: "granted" } as const;

export const CONSENT_MODE_DENIED = { analytics_storage: "denied" } as const;

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/** Anything other than an explicit choice is treated as "not asked yet". */
export function parseConsentChoice(raw: unknown): ConsentChoice | null {
  return raw === "granted" || raw === "denied" ? raw : null;
}

/** localStorage, or null when the browser blocks it (private mode, disabled storage). */
export function browserStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readConsentChoice(
  storage: ReadableStorage | null = browserStorage(),
): ConsentChoice | null {
  if (!storage) return null;
  try {
    return parseConsentChoice(storage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeConsentChoice(
  choice: ConsentChoice,
  storage: WritableStorage | null = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage full or blocked: the choice still applies for this page view.
  }
}

/** Push the visitor's decision into Consent Mode. No-op if the tag never loaded. */
export function applyConsentChoice(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag !== "function") return;
  gtag("consent", "update", choice === "granted" ? CONSENT_MODE_GRANTED : CONSENT_MODE_DENIED);
}
