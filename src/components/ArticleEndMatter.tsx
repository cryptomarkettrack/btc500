import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator } from "lucide-react";
import { getArticlesSorted, type ArticleMeta } from "@/lib/articles";
import { trackCta } from "@/lib/analytics";

export function ArticleEndMatter({ slug }: { slug: string }) {
  const related = getArticlesSorted()
    .filter((article) => article.slug !== slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <div className="rounded-[24px] border border-border/60 bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">See the rule against real prices</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          The BTC500 simulator backtests buy-500-days-before / sell-500-days-after across every
          completed halving cycle using Bitstamp history.
        </p>
        <Link
          to="/simulator"
          onClick={() => trackCta("article_end", "/simulator")}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          <Calculator className="h-4 w-4" />
          Run the simulator
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-articles-heading">
          <h2 id="related-articles-heading" className="text-lg font-semibold">
            Related reading
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((article) => (
              <li key={article.id}>
                <RelatedCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RelatedCard({ article }: { article: ArticleMeta }) {
  return (
    <Link
      to={`/articles/${article.slug}` as "/articles/btc500-strategy"}
      className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {article.articleSection}
      </span>
      <span className="mt-2 text-sm font-semibold leading-snug group-hover:text-primary">
        {article.title}
      </span>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        Read
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
