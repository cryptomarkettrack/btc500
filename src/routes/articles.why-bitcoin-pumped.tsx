import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { WhyBitcoinPumpedArticle } from "@/components/articles/WhyBitcoinPumpedArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("why-bitcoin-pumped")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why did Bitcoin pump on August 19, 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The U.S. Treasury doubled the size of long-end bond buybacks, yields fell, and about $1.1–$1.4 billion of leveraged shorts were liquidated. Spot Bitcoin ETF inflows, whale accumulation, a White House crypto meeting, and the day-old SEC Regulation Crypto Assets proposal added fuel. The squeeze did the vertical work.",
      },
    },
    {
      "@type": "Question",
      name: "Did the Fed cut rates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The July 28–29 FOMC held rates at 3.50%–3.75% on a 9–3 vote. August 19 released those minutes. The market catalyst was Treasury buybacks and positioning, not a rate cut.",
      },
    },
    {
      "@type": "Question",
      name: "Are Treasury buybacks the same as quantitative easing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Buybacks are a Treasury debt-management tool that improve liquidity in older long-term bonds. QE is a Federal Reserve program that expands the central-bank balance sheet. Traders still treated larger buybacks as extra demand for duration — hence the “mini QE” label.",
      },
    },
    {
      "@type": "Question",
      name: "Does this change the BTC500 buy date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The official buy date is still November 30, 2026 — 500 days before the projected April 2028 halving. A one-day squeeze does not move the cycle rule. Past performance does not guarantee future results.",
      },
    },
    {
      "@type": "Question",
      name: "Will this page be updated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. New facts go in the update log, and material follow-through gets a new dated section. The August 19 snapshot stays so the original tape is not overwritten.",
      },
    },
    {
      "@type": "Question",
      name: "What is the BTC500 strategy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Buy Bitcoin exactly 500 days before each halving, hold through the event, and sell exactly 500 days after. No indicators, no day trading — one fixed rule backed by historical cycle data and tracked publicly. Not financial advice.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/why-bitcoin-pumped")({
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
  component: WhyBitcoinPumpedPage,
});

function WhyBitcoinPumpedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 sm:pt-16">
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

        <WhyBitcoinPumpedArticle
          title={article.title}
          date={article.date}
          readTime={article.readTime}
        />

        <motion.div
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-[24px] border border-border/60 bg-card p-8"
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold">A squeeze is not a cycle</h2>
            <p className="mt-3 text-muted-foreground">
              Today&apos;s liquidations fade. The 500-day rule does not. Read the weekly outlook
              or run the historical windows.
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
