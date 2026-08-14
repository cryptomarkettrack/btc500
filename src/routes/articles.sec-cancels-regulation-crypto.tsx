import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { SecCancelsRegulationCryptoArticle } from "@/components/articles/SecCancelsRegulationCryptoArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("sec-cancels-regulation-crypto")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Regulation Crypto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Regulation Crypto Assets is the informal name for an SEC proposal to create a tailored offering regime for certain investment contracts involving crypto assets. Chair Paul Atkins previewed a three-part design on March 17, 2026: a small startup exemption, a larger fundraising exemption, and a safe harbor once a project team's essential managerial efforts permanently cease.",
      },
    },
    {
      "@type": "Question",
      name: "Why did the SEC cancel the August 14 meeting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The official Sunshine Act notice dated August 13, 2026 says only that the 10:00 a.m. ET open meeting has been cancelled. A Commission spokesperson said the delay was due to an unforeseen scheduling issue and that the meeting would be moved to a later date. No new date has been announced.",
      },
    },
    {
      "@type": "Question",
      name: "Does Regulation Crypto change how Bitcoin is classified?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Atkins' March 2026 taxonomy treats Bitcoin as a digital commodity, not a security. The cancelled proposal was about how other crypto projects raise capital when a token sale is an investment contract. Spot bitcoin ETFs already trade under existing rules.",
      },
    },
    {
      "@type": "Question",
      name: "How is this different from the CLARITY Act?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CLARITY is a bill in Congress that would write an SEC/CFTC split into statute. Regulation Crypto is agency rulemaking that can start without new legislation. A statute is harder to reverse; a rule can be rewritten by a future Commission. Both tracks are paused this month — the Senate is in recess, and Friday's SEC vote was cancelled.",
      },
    },
    {
      "@type": "Question",
      name: "When will the SEC reschedule the Regulation Crypto vote?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unknown. The Commission has not posted a replacement date. A proposing vote publishes a draft for comment; even after a rescheduled meeting, final adoption would still take months and was expected no earlier than 2027.",
      },
    },
    {
      "@type": "Question",
      name: "How does this relate to the next halving and the BTC500 buy date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The next Bitcoin halving is projected for April 2028 at block height 1,050,000. The official BTC500 buy date is November 30, 2026 — exactly 500 days before that event. A cancelled SEC meeting does not move either date. From August 14, 2026, there are 108 days until the buy date.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/sec-cancels-regulation-crypto")({
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
  component: SecCancelsRegulationCryptoPage,
});

function SecCancelsRegulationCryptoPage() {
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

        <SecCancelsRegulationCryptoArticle
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
