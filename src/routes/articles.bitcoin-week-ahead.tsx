import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { BitcoinWeekAheadArticle } from "@/components/articles/BitcoinWeekAheadArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("bitcoin-week-ahead")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's happening in Bitcoin this week?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The week of August 17-23, 2026 is built around Wednesday's FOMC minutes from the 9-3 July hold, the Wyoming Blockchain Symposium in Jackson Hole, daily spot ETF flow reports, Thursday jobless claims, and Friday flash PMIs plus a weekly BTC options expiry. Bitcoin is trading near $63,100 after last week's in-line CPI failed to break the $63,000-$65,000 range.",
      },
    },
    {
      "@type": "Question",
      name: "Why are Bitcoin ETF flows important?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spot ETFs are now Bitcoin's dominant marginal buyer. Last week they recorded roughly $850 million to $1.1 billion in net inflows — the best week since April — which is about 4x the Bitcoin miners create per day at current prices.",
      },
    },
    {
      "@type": "Question",
      name: "Will Bitcoin ETFs break the halving cycle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ETFs change the buyer mix, not the supply schedule. The 2028 halving still cuts new issuance in half. Institutional demand can compress or accelerate the cycle, but the 500-day buy/sell rule has worked across every completed cycle so far. Past performance does not guarantee future results.",
      },
    },
    {
      "@type": "Question",
      name: "Why do the FOMC minutes matter for Bitcoin?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The July FOMC held rates at 3.50%-3.75% on a 9-3 vote, with three regional presidents dissenting for a hike. The minutes show whether that hawkish minority was isolated or close to swaying the committee — the main near-term input for yields, the dollar, and Bitcoin.",
      },
    },
    {
      "@type": "Question",
      name: "When is the next Bitcoin halving and the official buy date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The next halving is projected for around April 2028 at block height 1,050,000. The official BTC500 buy date is exactly 500 days before it: November 30, 2026. The sell date is 500 days after, around August 26, 2029.",
      },
    },
    {
      "@type": "Question",
      name: "What is the BTC500 strategy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Buy Bitcoin exactly 500 days before each halving, hold through the event, and sell exactly 500 days after. No indicators, no day trading - one fixed rule backed by historical cycle data and tracked publicly.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/bitcoin-week-ahead")({
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
  component: BitcoinWeekAheadPage,
});

function BitcoinWeekAheadPage() {
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
        <BitcoinWeekAheadArticle
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
              Explore more articles about Bitcoin strategy, market cycles, and the halving.
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
          background: linear-gradient(
            135deg,
            oklch(0.96 0.04 60 / 0.3) 0%,
            oklch(0.96 0.04 60 / 0.3) 100%
          );
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
