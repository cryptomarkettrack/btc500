import { GA_MEASUREMENT_ID, SITE_URL } from "@/lib/site";

const PRODUCTION_HOST = new URL(SITE_URL).hostname;

/**
 * Google Analytics 4 (gtag.js).
 *
 * Loaded only on the production host so local dev, tests and Vercel preview
 * deployments never write into the real property. The bootstrap runs inline in
 * <head> (not from an effect) so the first pageview is captured before React
 * hydrates; GA4's enhanced measurement then tracks client-side route changes.
 */
export function GoogleAnalytics() {
  const bootstrap = `(function(){
  var host = window.location.hostname;
  if (host !== ${JSON.stringify(PRODUCTION_HOST)} && host !== "www.${PRODUCTION_HOST}") return;
  var id = ${JSON.stringify(GA_MEASUREMENT_ID)};
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(script);
})();`;

  return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
