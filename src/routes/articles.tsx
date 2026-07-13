import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";

const articlesPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Articles — BTC500 Strategy & Insights",
  url: "https://btc500.vercel.app/articles",
  description:
    "Learn about the BTC500 investment strategy. Articles explaining the Bitcoin halving cycle, buy/sell timing, and historical performance.",
  dateModified: "2026-07-13",
  datePublished: "2024-01-15",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://btc500.vercel.app/articles",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://btc500.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: "https://btc500.vercel.app/articles",
      },
    ],
  },
};

export const Route = createFileRoute("/articles")({
  head: () => ({
    meta: [
      { title: "Articles — BTC500 Strategy & Insights" },
      {
        name: "description",
        content:
          "Learn about the BTC500 investment strategy. Articles explaining the Bitcoin halving cycle, buy/sell timing, and historical performance.",
      },
      {
        name: "keywords",
        content:
          "Bitcoin halving articles, BTC500 strategy, Bitcoin investment guide, halving cycle analysis, Bitcoin trading strategy, crypto education",
      },
      { property: "og:title", content: "Articles — BTC500 Strategy & Insights" },
      {
        property: "og:description",
        content: "Learn about the BTC500 investment strategy and Bitcoin halving cycles.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://btc500.vercel.app/articles" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Articles — BTC500 Strategy & Insights",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Articles — BTC500 Strategy & Insights" },
      {
        name: "twitter:description",
        content: "Learn about the BTC500 investment strategy and Bitcoin halving cycles.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
    ],
    links: [
      { rel: "canonical", href: "https://btc500.vercel.app/articles" },
      { rel: "alternate", hrefLang: "en", href: "https://btc500.vercel.app/articles" },
      { rel: "alternate", hrefLang: "x-default", href: "https://btc500.vercel.app/articles" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(articlesPageSchema),
      },
    ],
  }),
  component: Articles,
});

function Articles() {
  const articles = [
    {
      id: "btc500-strategy",
      title: "The BTC500 Strategy: Buy 500 Days Before Halving, Sell 500 Days After",
      description:
        "A deep dive into the simplest and most effective Bitcoin investment strategy based on the halving cycle.",
      date: "2024-01-15",
      readTime: "8 min read",
      url: "/articles/btc500-strategy",
    },
    {
      id: "why-btc500-exists",
      title: "Why BTC500 Exists: The Most Expensive Mistake Bitcoin Investors Keep Repeating",
      description:
        "Learn why the BTC500 strategy was created to help investors avoid the most common and costly mistake in Bitcoin investing - buying too early during bear markets.",
      date: "2026-07-13",
      readTime: "7 min read",
      url: "/articles/why-btc500-exists",
    },
    {
      id: "rupl",
      title: "Net Unrealized Profit/Loss (NUPL): The Complete Guide to Bitcoin Market Psychology",
      description:
        "Understand Bitcoin's NUPL indicator — the five phases of market sentiment, how it's calculated, and how to use Relative Unrealized Profit/Loss to time the halving cycle.",
      date: "2026-07-13",
      readTime: "8 min read",
      url: "/articles/rupl",
    },
  ];

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
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Articles</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Learn about the BTC500 investment strategy, Bitcoin halving cycles, and how to maximize
            your returns with data-driven timing.
          </p>
        </div>

        <div className="grid gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={article.url}
              className="group block rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
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
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border/60 bg-card p-8 text-center">
          <h3 className="text-lg font-semibold">More articles coming soon</h3>
          <p className="mt-2 text-muted-foreground">
            We're working on more in-depth analysis of the BTC500 strategy, historical performance
            data, and advanced investment techniques.
          </p>
        </div>
      </main>
    </div>
  );
}
