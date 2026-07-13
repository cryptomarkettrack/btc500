import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { WhyBtc500ExistsArticle } from "@/components/articles/WhyBtc500ExistsArticle";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why BTC500 Exists: The Most Expensive Mistake Bitcoin Investors Keep Repeating",
  description:
    "Learn why the BTC500 strategy was created to help investors avoid the most common and costly mistake in Bitcoin investing - buying too early during bear markets.",
  author: {
    "@type": "Organization",
    name: "BTC500",
    url: "https://btc500.vercel.app/",
  },
  publisher: {
    "@type": "Organization",
    name: "BTC500",
    logo: {
      "@type": "ImageObject",
      url: "https://btc500.vercel.app/favicon.svg",
    },
  },
  datePublished: "2026-07-13",
  dateModified: "2026-07-13",
  image: "https://btc500.vercel.app/og/default.png",
  url: "https://btc500.vercel.app/articles/why-btc500-exists",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://btc500.vercel.app/articles/why-btc500-exists",
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
        name: "Articles",
        item: "https://btc500.vercel.app/articles",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Why BTC500 Exists",
        item: "https://btc500.vercel.app/articles/why-btc500-exists",
      },
    ],
  },
  articleSection: "Bitcoin Investment Strategy",
  wordCount: 1800,
  timeRequired: "PT7M",
  keywords:
    "Bitcoin investing mistakes, BTC500 strategy, Bitcoin bear market, buying the bottom, Bitcoin investment timing, halving cycle strategy",
};

export const Route = createFileRoute("/articles/why-btc500-exists")({
  head: () => ({
    meta: [
      { title: "Why BTC500 Exists — Articles | BTC500" },
      {
        name: "description",
        content:
          "Learn why the BTC500 strategy was created to help investors avoid the most common and costly mistake in Bitcoin investing.",
      },
      {
        name: "keywords",
        content:
          "Bitcoin investing mistakes, BTC500 strategy, buying the bottom, Bitcoin bear market, investment timing, halving cycle",
      },
      { property: "og:title", content: "Why BTC500 Exists — Articles | BTC500" },
      {
        property: "og:description",
        content:
          "Learn why the BTC500 strategy was created to help investors avoid the most common and costly mistake in Bitcoin investing.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://btc500.vercel.app/articles/why-btc500-exists" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Why BTC500 Exists — Bitcoin Investment Strategy",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Why BTC500 Exists — Articles | BTC500" },
      {
        name: "twitter:description",
        content:
          "Learn why the BTC500 strategy was created to help investors avoid the most common and costly mistake in Bitcoin investing.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
      {
        property: "article:published_time",
        content: "2026-07-13T00:00:00Z",
      },
      {
        property: "article:modified_time",
        content: "2026-07-13T00:00:00Z",
      },
    ],
    links: [
      { rel: "canonical", href: "https://btc500.vercel.app/articles/why-btc500-exists" },
      {
        rel: "alternate",
        hrefLang: "en",
        href: "https://btc500.vercel.app/articles/why-btc500-exists",
      },
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: "https://btc500.vercel.app/articles/why-btc500-exists",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(articleSchema),
      },
    ],
  }),
  component: WhyBtc500ExistsPage,
});

function WhyBtc500ExistsPage() {
  const article = {
    id: "why-btc500-exists",
    title: "Why BTC500 Exists: The Most Expensive Mistake Bitcoin Investors Keep Repeating",
    date: "July 13, 2026",
    readTime: "7 min read",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 sm:pt-16">
        {/* Back button */}
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </motion.div>

        {/* Article content */}
        <WhyBtc500ExistsArticle
          title={article.title}
          date={article.date}
          readTime={article.readTime}
        />

        {/* Back to articles CTA */}
        <motion.div
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-[24px] border border-border/60 bg-card p-8"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold">Continue Reading</h3>
            <p className="mt-2 text-muted-foreground">
              Explore more articles about the BTC500 strategy and Bitcoin investment insights.
            </p>
            <Link
              to="/articles"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Articles
            </Link>
          </div>
        </motion.div>
      </main>

      <style>{`
        .prose h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 48px;
          margin-bottom: 20px;
          color: var(--foreground);
          line-height: 1.2;
        }

        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 32px;
          margin-bottom: 16px;
          color: var(--foreground);
          line-height: 1.3;
        }

        .prose p {
          margin-bottom: 24px;
          color: var(--muted-foreground);
          line-height: 1.8;
        }

        .prose .lead {
          font-size: 1.25rem;
          color: var(--foreground);
          margin-bottom: 32px;
          line-height: 1.8;
        }

        .prose ul,
        .prose ol {
          margin-left: 32px;
          margin-bottom: 24px;
        }

        .prose li {
          margin-bottom: 12px;
          color: var(--muted-foreground);
          line-height: 1.7;
        }

        .prose strong {
          color: var(--foreground);
          font-weight: 600;
        }

        .strategy-box {
          background: linear-gradient(135deg, oklch(0.96 0.04 60 / 0.3) 0%, oklch(0.96 0.04 60 / 0.3) 100%);
          border: 2px solid var(--primary);
          padding: 32px;
          margin: 40px 0;
          border-radius: 16px;
          text-align: center;
        }

        .strategy-box h3 {
          margin-top: 0;
          color: var(--primary);
        }

        .strategy-box .formula {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          margin: 16px 0;
          line-height: 1.6;
        }

        .highlight-box {
          background: var(--muted);
          border-left: 4px solid var(--primary);
          padding: 24px;
          margin: 32px 0;
          border-radius: 8px;
        }

        .highlight-box p {
          margin: 0;
        }

        .data-point {
          background: oklch(0.98 0.05 85);
          border-left: 4px solid oklch(0.75 0.15 85);
          padding: 16px 20px;
          margin: 24px 0;
          border-radius: 8px;
        }

        .data-point strong {
          color: oklch(0.35 0.05 85);
        }

        @media (max-width: 768px) {
          .prose h2 {
            font-size: 1.5rem;
          }

          .prose h3 {
            font-size: 1.25rem;
          }

          .prose p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
