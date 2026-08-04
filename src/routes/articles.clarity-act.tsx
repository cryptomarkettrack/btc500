import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ClarityActArticle } from "@/components/articles/ClarityActArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("clarity-act")!;

// FAQ schema for rich results / AI search optimization
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the CLARITY Act?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CLARITY Act (Digital Asset Market Clarity Act of 2025) is a U.S. bill that would write clear rules for crypto by dividing oversight between the SEC and the CFTC. It gives most tokens a 'digital commodity' definition, places the SEC in charge of capital raising, and puts the CFTC in charge of trading.",
      },
    },
    {
      "@type": "Question",
      name: "Is the CLARITY Act law?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It passed the House of Representatives on July 17, 2025, and is being considered in the Senate. As of August 2026, it has been reported by the Senate Banking Committee but has not had a Senate floor vote.",
      },
    },
    {
      "@type": "Question",
      name: "Who regulates Bitcoin?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bitcoin is treated as a commodity. The CFTC regulates Bitcoin derivatives and has anti-fraud authority over spot markets. The SEC does not classify Bitcoin as a security. The CLARITY Act would make Bitcoin's commodity status a matter of federal statute.",
      },
    },
    {
      "@type": "Question",
      name: "Who regulates Ethereum?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ethereum's status has been debated between the SEC and CFTC. Spot ETH ETFs were approved in 2024, signaling ETH is not a security. The CLARITY Act would likely classify ETH as a digital commodity under CFTC oversight.",
      },
    },
    {
      "@type": "Question",
      name: "Will crypto become legal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Crypto is already legal to buy, hold, and trade in the United States. The CLARITY Act wouldn't make crypto 'more legal' — it would make the legal framework much clearer by assigning each digital asset a designated regulator.",
      },
    },
    {
      "@type": "Question",
      name: "Does this affect exchanges?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Exchanges offering digital commodities would register with the CFTC as Digital Commodity Exchanges (DCEs), meet capital requirements, and segregate customer funds. This closes the current 'spot market gap.'",
      },
    },
    {
      "@type": "Question",
      name: "Does it affect DeFi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The bill provides a safe harbor for non-custodial DeFi participants (developers, validators, protocol contributors) who don't take custody of user funds. They would be exempt from federal registration.",
      },
    },
    {
      "@type": "Question",
      name: "Does it affect stablecoins?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Payment stablecoins are excluded from the CLARITY Act's digital commodity definition and regulated separately under the GENIUS Act framework. Critics warn the CLARITY Act could create a 'stablecoin yield loophole.'",
      },
    },
    {
      "@type": "Question",
      name: "Will this change my taxes on crypto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No direct impact. The CLARITY Act is about market structure — who regulates what — not tax treatment. Crypto is taxed by the IRS as property, and that isn't changed by this bill.",
      },
    },
    {
      "@type": "Question",
      name: "Can the SEC still sue crypto companies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, but with limits. The SEC retains authority over investment contracts (capital raising) and fraud. What changes is the SEC can no longer claim every token on an exchange is a security if it qualifies as a digital commodity.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/clarity-act")({
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
  component: ClarityActPage,
});

function ClarityActPage() {
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
        <ClarityActArticle title={article.title} date={article.date} readTime={article.readTime} />

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
              infrastructure.
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
