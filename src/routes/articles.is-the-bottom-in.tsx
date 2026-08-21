import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { IsTheBottomInArticle } from "@/components/articles/IsTheBottomInArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("is-the-bottom-in")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the bottom for Bitcoin in as of 21 August 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — in the $54,000–$64,000 box. The closing low is $58,566 on 30 June 2026. Bitcoin is in a soft-bull transition after smashing through summer resistances on 19–20 August. Full confirmation is a weekly hold above $71,500, then $78,000, then $82,000. The BTC500 buy date remains 30 November 2026.",
      },
    },
    {
      "@type": "Question",
      name: "What was the Bitcoin low in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The lowest closing print in this drawdown so far is $58,566 on 30 June 2026, about 54% below the 6 October 2025 record of $126,198. VanEck describes a potential trough near $58,500 on that date.",
      },
    },
    {
      "@type": "Question",
      name: "How far is Bitcoin from its all-time high?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The record is $126,198 on 6 October 2025. At the June close Bitcoin was about 54% below that high. At prices in the $70,000s the drawdown is closer to 40% than to the 77–85% historical troughs.",
      },
    },
    {
      "@type": "Question",
      name: "What levels confirm the Bitcoin bull market?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three flips, in order: $71,500 (trade significantly above it or a weekly close above it), $78,000 (same rule; the regime-shift close), and $82,000 (full bull above this line). Until $82,000 flips, call it a soft bull.",
      },
    },
    {
      "@type": "Question",
      name: "What would invalidate this Bitcoin bottom call?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A weekly close back inside the $54,000–$64,000 box, especially below $64,500, pauses the soft-bull read. A weekly close below the 30 June print of $58,566 ends “the bottom is in.” Rejection at $78,000 without a weekly hold above $71,500 is a failed flip, not automatically a new bear.",
      },
    },
    {
      "@type": "Question",
      name: "Does this change the BTC500 buy date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The official buy date remains 30 November 2026 — 500 days before the projected April 2028 halving. If the $54k–$64k box was the low, that date is still early-bull. If the box breaks, the date is still the date. Past performance does not guarantee future results.",
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

export const Route = createFileRoute("/articles/is-the-bottom-in")({
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
  component: IsTheBottomInPage,
});

function IsTheBottomInPage() {
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

        <IsTheBottomInArticle
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
            <h2 className="text-xl font-semibold">The box was the low. The date is the plan.</h2>
            <p className="mt-3 text-muted-foreground">
              $71,500 is the live test. $78,000 then $82,000 confirm the bull. The 500-day rule
              still buys on 30 November.
            </p>
            <Link
              to="/bear-market"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Open the bottom dashboard
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

        .prose em {
          color: var(--foreground);
        }

        .prose figcaption {
          margin: 0;
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
