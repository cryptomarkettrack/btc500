import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Bip110RejectionArticle } from "@/components/articles/Bip110RejectionArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const article = getArticleBySlug("bip-110-rejection")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is BIP-110?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BIP-110 is the Bitcoin Improvement Proposal for a Reduced Data Temporary Softfork. It proposed temporary consensus limits on arbitrary data in Bitcoin transactions, aimed largely at non-financial data embedding techniques.",
      },
    },
    {
      "@type": "Question",
      name: "Why was BIP-110 rejected?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BIP-110 failed to secure meaningful economic consensus. Miner signaling stayed far below the proposal's 55% threshold, major mining pools did not back it, Bitcoin Core did not adopt it as a network-wide upgrade, and the resulting minority chain stalled after minimal block production.",
      },
    },
    {
      "@type": "Question",
      name: "How are Bitcoin proposals approved?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no single approval board. A Bitcoin Improvement Proposal becomes a real upgrade only when software implementing it is widely reviewed, run, and economically recognized as Bitcoin by miners, nodes, exchanges, businesses, and users.",
      },
    },
    {
      "@type": "Question",
      name: "Does the BIP-110 rejection affect Bitcoin price?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Protocol governance events can create short-term narrative noise, but BIP-110's failure did not rewrite Bitcoin's monetary policy, issuance schedule, or mainnet rules. Any price impact depends on broader market conditions rather than the mere existence of a failed soft-fork attempt.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to do anything as a Bitcoin holder after BIP-110?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most holders on standard wallets and exchanges need no action. People running BIP-110-enforcing node software should verify whether their node is still following Bitcoin mainnet. Anyone tempted to trade minority-chain coins should understand replay risk and liquidity risk first.",
      },
    },
  ],
};

export const Route = createFileRoute("/articles/bip-110-rejection")({
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
  component: Bip110RejectionPage,
});

function Bip110RejectionPage() {
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
        <Bip110RejectionArticle
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
              Explore more articles about Bitcoin strategy, governance, and investment insights.
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
