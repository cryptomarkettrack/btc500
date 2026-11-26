import { createFileRoute } from "@tanstack/react-router";
import { BuyPointPage } from "@/components/signal/BuyPointPage";
import { BUY_POINT_FAQ, BUY_POINT_H1, BUY_POINT_LEAD } from "@/lib/buy-point-copy";
import { SIGNAL_OG_IMAGE, toBacktestRows } from "@/lib/buy-signal";
import { simulatorPreviewQuery, signalPriceQuery } from "@/lib/queries";
import { generateFaqSchema, generateGraphSchema, generatePageHead, SITE_URL } from "@/lib/site";

const PATH = "/is-now-the-buy-point";
const TODAY = new Date().toISOString().slice(0, 10);
const orgRef = { "@id": `${SITE_URL}/#organization` };

/**
 * One @graph for this page only. WebSite / Organization / WebApplication are
 * already emitted by __root.tsx and must not be re-declared here.
 */
const pageSchema = generateGraphSchema([
  {
    "@type": "Article",
    headline: BUY_POINT_H1,
    description: BUY_POINT_LEAD,
    datePublished: TODAY,
    dateModified: TODAY,
    author: orgRef,
    publisher: orgRef,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${PATH}` },
  },
  generateFaqSchema(BUY_POINT_FAQ),
]);

export const Route = createFileRoute("/is-now-the-buy-point")({
  head: () =>
    generatePageHead({
      path: PATH,
      title: BUY_POINT_H1,
      description: BUY_POINT_LEAD,
      keywords:
        "is now the buy point for bitcoin, buy bitcoin 500 days before halving, 500 day rule, November 28 2026",
      ogTitle: "Is Now the Buy Point for Bitcoin? 500-Day Rule Says Yes",
      ogDescription: BUY_POINT_LEAD,
      ogImage: SIGNAL_OG_IMAGE,
      ogImageAlt: "BTC500 live T-minus countdown card for the November 28, 2026 buy point",
      twitterTitle: "Is Now the Buy Point for Bitcoin? 500-Day Rule Says Yes",
      twitterDescription: BUY_POINT_LEAD,
      ogType: "article",
      publishedTime: TODAY,
      modifiedTime: TODAY,
      schema: pageSchema,
    }),
  loader: async ({ context }) => {
    const [signal, simulator] = await Promise.all([
      context.queryClient.ensureQueryData(signalPriceQuery),
      context.queryClient.ensureQueryData(simulatorPreviewQuery),
    ]);
    return { signal, rows: toBacktestRows(simulator.cycles) };
  },
  component: BuyPointRoute,
});

function BuyPointRoute() {
  const { signal, rows } = Route.useLoaderData();
  return <BuyPointPage signal={signal} rows={rows} />;
}
