import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { BitcoinWeekAheadArticle } from "@/components/articles/BitcoinWeekAheadArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's happening in Bitcoin this week?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The week of August 24-31, 2026 is built around the Kansas City Fed's Jackson Hole Economic Symposium (August 27-29), July Core PCE on Friday, daily spot ETF flow reports, Thursday jobless claims, and a Friday weekly BTC options expiry. Bitcoin enters near $77,000 after the 19-20 August breakout ended the $54,000-$64,000 summer range, with $78,000 the next confirmation level.",
      },
    },
    {
      "@type": "Question",
      name: "Why are Bitcoin ETF flows important?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spot ETFs are now Bitcoin's dominant marginal buyer. Last week they recorded roughly $850 million in net inflows, taking August to about $1.1 billion — which is roughly 3.5x the Bitcoin miners create per day at current prices.",
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
      name: "Why did the FOMC minutes matter for Bitcoin?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The July meeting held rates at 3.50%-3.75% on a 9-3 vote, with three policymakers dissenting for a hike. The minutes framed that hawkish minority as isolated with the median year-end dot at 3.8%, so the Fed itself added no fuel — the same-week rally came from the U.S. Treasury doubling long-end buybacks and a crowded short squeeze that carried Bitcoin from ~$66,000 to ~$69,700 on August 19. The next inputs are Kevin Warsh's Jackson Hole speech and the July Core PCE print ahead of the September 15-16 FOMC.",
      },
    },
    {
      "@type": "Question",
      name: "When is the next Bitcoin halving and the official buy date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The next halving is projected for around April 2028 at block height 1,050,000. The BTC500 buy date is exactly 500 days before it — November 30, 2026 under the April 13, 2028 projection used when this was published. The sell date is 500 days after, around August 26, 2029. The halving date is estimated from block height, so the live date is at https://btc500.net/halving-dates.",
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
    const head = generateArticleHead(getArticleBySlug("bitcoin-week-ahead")!);
    return {
      ...head,
      // FAQ schema is appended to `meta` (not `scripts`): TanStack Router does
      // not render head().scripts, so this article FAQ markup was previously lost.
      meta: [...head.meta, { "script:ld+json": faqSchema }],
    };
  },
  component: BitcoinWeekAheadPage,
});

function BitcoinWeekAheadPage() {
  const article = getArticleBySlug("bitcoin-week-ahead")!;
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

        {/* Archive notice + links to the evergreen pages that now carry this
            article's live intent (dated ETF flow queries). */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"
        >
          <div className="flex items-start gap-3">
            <Archive className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                Archived brief — published 17 August 2026
              </p>
              <p className="mt-1 text-muted-foreground">
                This was a week-ahead note for 24–31 August 2026 and is kept for the record. The
                live versions of what it covered:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/bitcoin-etf"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary"
                >
                  Bitcoin ETF flows by date
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  to="/halving-dates"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary"
                >
                  Halving dates
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
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
