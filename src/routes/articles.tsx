import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ArticleEndMatter } from "@/components/ArticleEndMatter";
import {
  getArticlesSorted,
  getIndexableArticles,
  isArchivedArticle,
  SITE_URL,
  type ArticleMeta,
} from "@/lib/articles";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

const articlesPageSchema = generateWebPageSchema({
  path: "/articles",
  name: "Articles — BTC500 Strategy & Insights",
  description:
    "Learn about the BTC500 investment strategy. Articles explaining the Bitcoin halving cycle, buy/sell timing, and historical performance.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
  ],
  dateModified: getArticlesSorted().find((article) => !isArchivedArticle(article.slug))
    ?.dateModifiedISO,
});

const articlesListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BTC500 Articles",
  description: "Strategy guides and on-chain education from BTC500",
  // Only the articles that are meant to be indexed. Archived, `noindex`
  // commentary stays out of the list, so the structured data matches what
  // the page actually promotes.
  itemListElement: getArticlesSorted()
    .filter((article) => !isArchivedArticle(article.slug))
    .map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/articles/${article.slug}`,
      name: article.title,
    })),
};

export const Route = createFileRoute("/articles")({
  head: (ctx) => {
    // This route is the parent of all article pages (/articles/:slug). TanStack
    // merges (does not dedupe) <link rel="canonical"> tags across matched routes, so
    // if we always emit a canonical here, every article page renders TWO canonicals
    // (this one pointing at /articles + the article's own) and Google resolves to the
    // wrong one. Emit this route's head ONLY when it is the matched leaf (the /articles
    // list page itself), and contribute nothing when a child article is matched.
    const isArticlesList = ctx.matches[ctx.matches.length - 1]?.routeId === "/articles";
    if (!isArticlesList) return { meta: [], links: [] } as const;

    return generatePageHead({
      path: "/articles",
      title: "Articles — BTC500 Strategy & Halving Guides",
      description:
        "Learn about the BTC500 investment strategy. Articles explaining the Bitcoin halving cycle, buy/sell timing, NUPL, and historical performance.",
      keywords:
        "Bitcoin halving articles, BTC500 strategy, Bitcoin investment guide, halving cycle analysis, Bitcoin trading strategy, crypto education, NUPL guide",
      ogTitle: "Articles — BTC500 Strategy & Insights",
      ogDescription: "Learn about the BTC500 investment strategy and Bitcoin halving cycles.",
      ogImageAlt: "Articles — BTC500 Strategy & Insights",
      schema: [articlesPageSchema, articlesListSchema],
    });
  },
  component: Articles,
});

function Articles() {
  const sortedArticles = getArticlesSorted();
  const [searchQuery, setSearchQuery] = useState("");

  // Archived articles are published but served with `noindex, nofollow`.
  // They stay reachable under their own heading, but the primary list is the
  // set of pages this site actually wants in the index.
  const publishedArticles = useMemo(() => getIndexableArticles(), []);
  const archivedArticles = useMemo(
    () => sortedArticles.filter((article) => isArchivedArticle(article.slug)),
    [sortedArticles],
  );

  const matchesQuery = (article: ArticleMeta) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.keywords.toLowerCase().includes(query) ||
      article.articleSection.toLowerCase().includes(query)
    );
  };

  // Filter articles based on search query
  const filteredPublished = useMemo(
    () => publishedArticles.filter((article) => matchesQuery(article)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publishedArticles, searchQuery],
  );
  const filteredArchived = useMemo(
    () => archivedArticles.filter((article) => matchesQuery(article)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [archivedArticles, searchQuery],
  );
  const filteredCount = filteredPublished.length + filteredArchived.length;

  // Check if we're on a child route (article page)
  const location = useLocation();
  const isOnChildRoute = location.pathname !== "/articles";

  // If on a child route, only render the Outlet
  if (isOnChildRoute) {
    const slug = location.pathname.replace("/articles/", "");
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <ArticleEndMatter slug={slug} />
      </div>
    );
  }

  // Otherwise, render the articles list
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 sm:pt-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Articles</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Strategy, weekly outlook, and cycle notes. Start with the{" "}
            <Link
              to="/bitcoin-500-day-cycle"
              className="font-semibold text-primary hover:underline"
            >
              Bitcoin 500-day cycle
            </Link>{" "}
            if you want the methodology first.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search articles by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              aria-label="Search articles"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Showing {filteredCount} of {sortedArticles.length} articles
            </p>
          )}
        </div>

        <div className="grid gap-6">
          {filteredPublished.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.slug}` as "/articles/btc500-strategy"}
              className="group block rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <article className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time dateTime={article.dateISO}>{article.date}</time>
                  <span>·</span>
                  <span>{article.readTime}</span>
                  <span>·</span>
                  <span>{article.articleSection}</span>
                </div>
                <h2 className="text-xl font-semibold group-hover:text-primary">{article.title}</h2>
                <p className="text-muted-foreground">{article.description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  Read article
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredArchived.length > 0 && (
          <section className="mt-16" aria-labelledby="archive-heading">
            <h2 id="archive-heading" className="text-xl font-semibold">
              Archive
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Dated market commentary, kept for the record. These notes are tied to a past date, so
              they are not in the search index — read them for the history, not for a current
              signal.
            </p>
            <div className="mt-6 grid gap-6">
              {filteredArchived.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}` as "/articles/btc500-strategy"}
                  className="group block rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <article className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <time dateTime={article.dateISO}>{article.date}</time>
                      <span>·</span>
                      <span>{article.readTime}</span>
                      <span>·</span>
                      <span>{article.articleSection}</span>
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground">{article.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      Read article
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {filteredCount === 0 && searchQuery && (
          <div className="mt-8 rounded-2xl border border-border/60 bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No articles found</h2>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search terms or browse all articles below.
            </p>
          </div>
        )}

        {!searchQuery && (
          <div className="mt-16 rounded-2xl border border-border/60 bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">More articles coming soon</h2>
            <p className="mt-2 text-muted-foreground">
              We&apos;re working on more in-depth analysis of the BTC500 strategy, historical
              performance data, and advanced investment techniques.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
