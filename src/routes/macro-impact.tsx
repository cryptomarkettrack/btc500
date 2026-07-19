import { createFileRoute } from "@tanstack/react-router";
import { MacroImpactPage } from "@/components/macro-impact/MacroImpactPage";

const macroImpactPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Macro Impact — CPI & PPI Effect on Bitcoin",
  url: "https://btc500.vercel.app/macro-impact",
  description:
    "Analyze how US CPI and PPI inflation releases historically affected Bitcoin prices. Interactive dashboard with every event, BTC performance statistics, heatmaps, and actionable insights.",
  dateModified: "2026-07-19",
  datePublished: "2024-01-15",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://btc500.vercel.app/macro-impact",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://btc500.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Macro Impact",
        item: "https://btc500.vercel.app/macro-impact",
      },
    ],
  },
};

export const Route = createFileRoute("/macro-impact")({
  component: () => <MacroImpactPage initialData={null} />,
  head: () => ({
    meta: [
      { title: "Macro Impact — US CPI & PPI Effect on Bitcoin Price | BTC500" },
      {
        name: "description",
        content:
          "Analyze how US CPI and PPI inflation releases historically affected Bitcoin prices. Interactive dashboard with every event, BTC performance statistics, heatmaps, and actionable trading insights.",
      },
      {
        name: "keywords",
        content:
          "CPI Bitcoin, PPI Bitcoin, inflation Bitcoin, macro impact crypto, Bitcoin CPI reaction, Bitcoin PPI reaction, US inflation crypto, Bitcoin macro dashboard, Fed Bitcoin, interest rates Bitcoin",
      },
      { property: "og:title", content: "Macro Impact — US CPI & PPI Effect on Bitcoin | BTC500" },
      {
        property: "og:description",
        content:
          "See how US CPI and PPI releases historically moved Bitcoin prices. Interactive dashboard with every event, heatmaps, stats, and insights.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://btc500.vercel.app/macro-impact" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Macro Impact Dashboard — CPI & PPI Effect on Bitcoin",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Macro Impact — US CPI & PPI Effect on Bitcoin" },
      {
        name: "twitter:description",
        content: "See how US CPI and PPI releases historically moved Bitcoin prices.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
    ],
    links: [{ rel: "canonical", href: "https://btc500.vercel.app/macro-impact" }],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(macroImpactPageSchema),
      },
    ],
  }),
});
