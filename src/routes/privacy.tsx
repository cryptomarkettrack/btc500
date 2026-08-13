import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, generatePageHead, generateWebPageSchema } from "@/lib/site";

const privacySchema = generateWebPageSchema({
  path: "/privacy",
  name: "Privacy Policy — BTC500",
  description:
    "How BTC500 handles visitor data. No accounts. Analytics via Vercel. Contact for requests.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Privacy", path: "/privacy" },
  ],
});

export const Route = createFileRoute("/privacy")({
  head: () =>
    generatePageHead({
      path: "/privacy",
      title: "Privacy Policy | BTC500",
      description:
        "BTC500 does not require an account. This policy explains analytics, third-party data, and how to contact us about your information.",
      keywords: "BTC500 privacy policy, Bitcoin countdown privacy",
      ogTitle: "Privacy Policy — BTC500",
      ogDescription: "How BTC500 handles visitor data. No accounts required.",
      schema: privacySchema,
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 13, 2026">
      <p>
        BTC500 (btc500.net) is a free informational website. We do not create user accounts, we do
        not sell a subscription, and we do not ask for your name, wallet, or payment details.
      </p>

      <section>
        <h2>What we collect</h2>
        <p>
          The site uses <strong>Vercel Analytics</strong> for aggregated page views and custom
          events such as button clicks on tools. That data is used to see which pages and tools
          people use. We do not use it to build advertising profiles, and we do not sell it.
        </p>
        <p>
          Standard server logs (IP address, user agent, requested URL) may be processed by our
          hosting provider (Vercel) to operate and secure the site.
        </p>
      </section>

      <section>
        <h2>What we do not collect</h2>
        <ul>
          <li>No account registration or login</li>
          <li>No email list on this site unless you write to us first</li>
          <li>No wallet addresses, API keys, or private keys</li>
          <li>No payment information</li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          Price, block-height, news, and filings data are fetched from public APIs (including
          exchanges, CoinGecko, and public SEC sources). Those providers have their own privacy
          policies. Embed widgets you place on another site only load the BTC500 embed page you
          choose.
        </p>
      </section>

      <section>
        <h2>Cookies and similar tech</h2>
        <p>
          We do not set marketing cookies. Hosting and analytics may use strictly necessary or
          first-party measurement storage as described by Vercel. You can block analytics in your
          browser if you prefer.
        </p>
      </section>

      <section>
        <h2>Requests</h2>
        <p>
          To ask a question about this policy, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
