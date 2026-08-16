import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { BitcoinCasinoSearchArticle } from "@/components/articles/BitcoinCasinoSearchArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("bitcoin-casino-searches")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why did \"bitcoin casino\" searches surge in August 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google Trends data for the week of August 9–16, 2026 shows \"bitcoin casino\" search interest jumped about 500% and \"bitcoin casinos\" rose about 350%, riding a wave of new retail interest in fast Bitcoin exposure during the halving cycle.",
      },
    },
    {
      "@type": "Question",
      name: "Is \"bitcoin casino\" a high-volume keyword?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is a fast-growing breakout, not the biggest query: \"bitcoin price\" remained the #1 Bitcoin search by far. Breakouts are measured from a small base, so a large percentage is not the same as large absolute volume.",
      },
    },
    {
      "@type": "Question",
      name: "Does casino or gambling interest predict the Bitcoin price?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Search spikes are an attention signal that historically clusters around exciting phases of the halving cycle, but they do not forecast price direction or timing. A repeatable rule — like BTC500's buy-and-sell dates — removes the need to predict either.",
      },
    },
    {
      "@type": "Question",
      name: "Should I buy Bitcoin before or after the halving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The BTC500 rule says buy exactly 500 days before the halving. For the projected April 2028 halving (block 1,050,000), that date is November 30, 2026, with the sell date around August 26, 2029. Past performance does not guarantee future results.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between bitcoin casino play and BTC500?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Casino play carries a house edge or liquidation risk and negative expected value over time. BTC500 is a rules-based investment: buy 500 days before a halving, sell 500 days after, profitable in every completed cycle but with no guarantee of future returns.",
      },
    },
    {
      "@type": "Question",
      name: "Is BTC500 affiliated with any bitcoin casino?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. BTC500 is free educational software focused on the halving cycle; it does not host, endorse, or link to gambling products, and nothing here is financial or gambling advice.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/bitcoin-casino-searches")({
  head: () => {
    const head = generateArticleHead(article);
    return {
      ...head,
      scripts: [
        ...(head.scripts ?? []),
        {
          type: "application/ld+json",
          content: JSON.stringify(faqSchema),
        },
      ],
    };
  },
  component: BitcoinCasinoSearchPage,
});

function BitcoinCasinoSearchPage() {
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
        <BitcoinCasinoSearchArticle
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
            <h2 className="text-xl font-semibold">
              Bitcoin is attention-driven — be rules-driven
            </h2>
            <p className="mt-3 text-muted-foreground">
              Search trends come and go. The halving schedule does not. Read more about the BTC500
              strategy and Bitcoin investment insights.
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

        .prose figcaption {
          margin: 0;
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

        .prose .faq-list h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 8px;
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