import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { getArticlesSorted, SITE_URL } from "@/lib/articles";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";

const articlesPageSchema = generateWebPageSchema({
  path: "/articles",
  name: "Articles — BTC500 Strategy & Insights",
  description:
    "Learn about the BTC500 investment strategy. Articles explaining the Bitcoin halving cycle, buy/sell timing, and historical performance.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
  ],
  dateModified: "2026-07-16",
});

const articlesListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BTC500 Articles",
  description: "Strategy guides and on-chain education from BTC500",
  itemListElement: getArticlesSorted().map((article, index) => ({
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

  // Check if we're on a child route (article page)
  const location = useLocation();
  const isOnChildRoute = location.pathname !== "/articles";

  // If on a child route, only render the Outlet
  if (isOnChildRoute) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
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
            Learn about the BTC500 investment strategy, Bitcoin halving cycles, and how to maximize
            your returns with data-driven timing.
          </p>
        </header>

        <div className="grid gap-6">
          {sortedArticles.map((article) => (
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

        <div className="mt-16 rounded-2xl border border-border/60 bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">More articles coming soon</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re working on more in-depth analysis of the BTC500 strategy, historical
            performance data, and advanced investment techniques.
          </p>
        </div>
      </main>
    </div>
  );
}
