import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, generatePageHead, generateWebPageSchema } from "@/lib/site";

const termsSchema = generateWebPageSchema({
  path: "/terms",
  name: "Terms of Use — BTC500",
  description:
    "Terms for using BTC500. Educational software only. Not financial advice. No warranty.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Terms", path: "/terms" },
  ],
});

export const Route = createFileRoute("/terms")({
  head: () =>
    generatePageHead({
      path: "/terms",
      title: "Terms of Use | BTC500",
      description:
        "BTC500 is free educational software. These terms cover acceptable use, the not-financial-advice disclaimer, and limitation of liability.",
      keywords: "BTC500 terms of use, Bitcoin countdown disclaimer",
      ogTitle: "Terms of Use — BTC500",
      ogDescription: "Educational software only. Not financial advice. No warranty.",
      schema: termsSchema,
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="August 13, 2026">
      <p>By using btc500.net you agree to these terms. If you do not agree, do not use the site.</p>

      <section>
        <h2>Educational software, not advice</h2>
        <p>
          BTC500 publishes countdowns, historical calculations, market data, and commentary for
          education. Nothing on this site is financial, investment, tax, or trading advice. Bitcoin
          is volatile. You can lose money. Past performance — including every figure in the
          simulator — does not guarantee future results. Do your own research.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          The site is provided &quot;as is.&quot; Halving dates are estimates based on block time.
          Prices, indicators, news items, and filings can be delayed, incomplete, or wrong. We do
          not warrant uninterrupted access or error-free data.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not scrape the site in a way that degrades service for other visitors</li>
          <li>Do not imply that BTC500 manages money or recommends a specific trade for you</li>
          <li>
            Embed widgets are welcome via the{" "}
            <Link to="/embed-kit" className="text-primary">
              embed kit
            </Link>
            ; do not wrap them in a way that misrepresents the data
          </li>
        </ul>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, BTC500 and its operators are not liable for any
          loss or damage arising from use of the site, including trading losses.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also the{" "}
          <Link to="/privacy" className="text-primary">
            privacy policy
          </Link>{" "}
          and{" "}
          <Link to="/about" className="text-primary">
            about
          </Link>{" "}
          page.
        </p>
      </section>
    </LegalPage>
  );
}
