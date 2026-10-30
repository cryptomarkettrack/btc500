import { GA_MEASUREMENT_ID, SITE_URL } from "@/lib/site";
import { CONSENT_MODE_DEFAULT, CONSENT_MODE_GRANTED, CONSENT_STORAGE_KEY } from "@/lib/consent";

const PRODUCTION_HOST = new URL(SITE_URL).hostname;
const WWW_HOST = `www.${PRODUCTION_HOST}`;

/**
 * Google Analytics 4 (gtag.js) with Google Consent Mode v2.
 *
 * Loaded only on the production host so local dev, tests and Vercel preview
 * deployments never write into the real property. The bootstrap runs inline in
 * <head> (not from an effect) so the first pageview is captured before React
 * hydrates; GA4's enhanced measurement then tracks client-side route changes.
 *
 * Consent: `analytics_storage` is denied *before* `gtag("config")`, so no `_ga`
 * cookie is written until the visitor accepts the banner. A returning visitor
 * whose stored choice is "granted" is upgraded in the same inline script, which
 * keeps the first hit of the session attributed. See src/lib/consent.ts.
 */
export function GoogleAnalytics() {
  const bootstrap = `(function(){
  var host = window.location.hostname;
  if (host !== ${JSON.stringify(PRODUCTION_HOST)} && host !== ${JSON.stringify(WWW_HOST)}) return;
  var id = ${JSON.stringify(GA_MEASUREMENT_ID)};
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("consent", "default", ${JSON.stringify(CONSENT_MODE_DEFAULT)});
  var granted = false;
  try { granted = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}) === "granted"; } catch (e) {}
  if (granted) gtag("consent", "update", ${JSON.stringify(CONSENT_MODE_GRANTED)});
  gtag("js", new Date());
  gtag("config", id);
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(script);
})();`;

  return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
