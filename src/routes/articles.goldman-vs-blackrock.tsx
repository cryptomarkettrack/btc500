import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { GoldmanVsBlackrockArticle } from "@/components/articles/GoldmanVsBlackrockArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("goldman-vs-blackrock")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Goldman Sachs NEOS deal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Goldman Sachs is acquiring NEOS, an ETF issuer focused on covered-call bitcoin income products, in a transaction valued at $2.25 billion. The deal expands Goldman's derivative-powered ETF platform to roughly $130 billion in total assets, per analysts, and positions the bank directly against BlackRock's BITA income fund.",
      },
    },
    {
      "@type": "Question",
      name: "What is a bitcoin income ETF and how does it work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A bitcoin income ETF (typically a covered-call fund) holds bitcoin exposure and sells call options against it, collecting option premiums that are paid out as income. It trades away some upside in exchange for regular cash flow.",
      },
    },
    {
      "@type": "Question",
      name: "Why is Goldman buying into bitcoin income ETFs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Goldman is competing for the same institutional allocation dollars as BlackRock. Income-generating bitcoin products appeal to wealth managers and institutions that want exposure plus cash flow, and Goldman's $130 billion derivative platform gives it distribution scale to make the category its own.",
      },
    },
    {
      "@type": "Question",
      name: "Does the ETF war affect the bitcoin price?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Indirectly, on the supply side. Income and staking products hold their bitcoin or ether rather than trading it, which tightens available float at a time when spot ETF daily inflows are already running at multiples of daily mining issuance.",
      },
    },
    {
      "@type": "Question",
      name: "How does the ETF war relate to the next halving and the BTC500 buy date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The next Bitcoin halving is projected for April 2028 at block height 1,050,000. The official BTC500 buy date is November 30, 2026 — exactly 500 days before the halving. Institutional products that hold bitcoin reduce float and tend to strengthen halving-cycle dynamics. From August 12, 2026, there are 110 days until the buy date.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/goldman-vs-blackrock")({
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
  component: GoldmanVsBlackrockPage,
});

function GoldmanVsBlackrockPage() {
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
        <GoldmanVsBlackrockArticle
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
