import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { SolarEclipseHalvingArticle } from "@/components/articles/SolarEclipseHalvingArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("solar-eclipse-bitcoin-halving")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does the solar eclipse have to do with Bitcoin halving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are rare, predictable events governed by mathematical laws. The total solar eclipse of August 12, 2026 was predicted decades in advance by orbital mechanics. Bitcoin's halving is predicted years in advance by protocol math — every 210,000 blocks (~4 years). Both reward those who prepare before the event and leave the unprepared reacting after it passes.",
      },
    },
    {
      "@type": "Question",
      name: "How does the BTC500 strategy relate to the 2026 solar eclipse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The BTC500 strategy applies the same principle as eclipse preparation: mark the date, follow the math, ignore the noise. The next Bitcoin halving is projected for April 2028. The BTC500 buy date is November 30, 2026 — exactly 500 days before. Instead of waiting for confirmation like the crowd, BTC500 investors buy on a fixed calendar date, just as astronomers mark eclipse dates years in advance.",
      },
    },
    {
      "@type": "Question",
      name: "When is the next Bitcoin halving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The next Bitcoin halving is projected for around April 2028 at block height 1,050,000. The exact date depends on Bitcoin's average block time. The BTC500 buy date — exactly 500 days before the halving — is November 30, 2026.",
      },
    },
    {
      "@type": "Question",
      name: "What is the bitcoin halving cycle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The bitcoin halving cycle is the roughly 4-year period between each block reward halving. Historically, each cycle follows a pattern: a deep bear market after the previous peak, a long accumulation phase in the 500 days before the next halving, and a parabolic bull run in the 500 days after. This pattern has held across every completed cycle since 2012.",
      },
    },
    {
      "@type": "Question",
      name: "Why do most investors ignore predictable events like the halving?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most investors react to price action rather than calendar dates. Just as 'eclipse' searches surged 600% only when the event was imminent — even though the date was known for years — most investors only search for 'bitcoin halving' after prices have already moved. Behavioral biases cause people to discount predictable future events in favor of immediate market noise.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/solar-eclipse-bitcoin-halving")({
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
  component: SolarEclipseHalvingPage,
});
function SolarEclipseHalvingPage() {
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
        <SolarEclipseHalvingArticle
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
              Explore more articles about Bitcoin strategy, on-chain analysis, and crypto
              education.
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