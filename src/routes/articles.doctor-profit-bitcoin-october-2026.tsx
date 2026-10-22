import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import {
  DoctorProfitArticle,
  doctorProfitFaqs,
} from "@/components/articles/DoctorProfitArticle";
import { getArticleBySlug, generateArticleHead } from "@/lib/articles";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: doctorProfitFaqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export const Route = createFileRoute("/articles/doctor-profit-bitcoin-october-2026")({
  head: () => {
    const head = generateArticleHead(getArticleBySlug("doctor-profit-bitcoin-october-2026")!);
    return {
      ...head,
      // FAQ schema must go through `meta` in this TanStack Router version:
      // head().scripts is silently dropped during SSR.
      meta: [...head.meta, { "script:ld+json": faqSchema }],
    };
  },
  component: DoctorProfitPage,
});

function DoctorProfitPage() {
  const article = getArticleBySlug("doctor-profit-bitcoin-october-2026")!;
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

        <DoctorProfitArticle
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
            <h2 className="text-xl font-semibold">A target is not a timetable.</h2>
            <p className="mt-3 text-muted-foreground">
              The next BTC500 buy window is about 38 days away. The rule does not need a $94,000
              call to work — it needs a date.
            </p>
            <Link
              to="/bitcoin-500-day-cycle"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              See the 500-day cycle
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
