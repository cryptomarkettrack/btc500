import { createFileRoute } from "@tanstack/react-router";
import { getNewsFeed, type NewsFeed, type NewsItem } from "@/lib/news";
import { Newspaper, RefreshCw, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/news")({
  component: NewsPage,
  loader: async (): Promise<NewsFeed | null> => {
    try {
      const data = await getNewsFeed();
      return data;
    } catch (e) {
      console.error("Failed to fetch news feed:", e);
      return null;
    }
  },
  head: () => ({
    meta: [
      { title: "Crypto News — Bitcoin & Cryptocurrency News Feed | BTC500" },
      {
        name: "description",
        content:
          "Latest cryptocurrency and Bitcoin news aggregated from Cointelegraph. Stay updated with real-time crypto market news, Bitcoin price analysis, and blockchain industry developments.",
      },
      {
        name: "keywords",
        content:
          "crypto news, Bitcoin news, cryptocurrency news, Bitcoin price, crypto market, blockchain news, Cointelegraph, crypto headlines, digital assets news",
      },
      {
        property: "og:title",
        content: "Crypto News — Bitcoin & Cryptocurrency News Feed | BTC500",
      },
      {
        property: "og:description",
        content:
          "Latest Bitcoin and cryptocurrency news aggregated in real-time. Stay informed on crypto markets, blockchain technology, and digital asset developments.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://btc500.vercel.app/news" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Crypto News — Bitcoin & Cryptocurrency News Feed",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Crypto News — Bitcoin & Cryptocurrency News Feed" },
      {
        name: "twitter:description",
        content: "Latest Bitcoin and cryptocurrency news aggregated in real-time.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
    ],
    links: [{ rel: "canonical", href: "https://btc500.vercel.app/news" }],
  }),
});

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const isFeatured = index === 0;

  if (isFeatured && item.imageUrl) {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 col-span-full"
      >
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
              <Newspaper className="h-3 w-3" />
              {item.source}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-sm text-white/80 line-clamp-2 mb-3">{item.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.pubDateFormatted}
              </span>
              <span className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Read more
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (isFeatured) {
    // Featured but no image — use a styled card
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 col-span-full"
      >
        <div>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Newspaper className="h-3 w-3" />
            {item.source}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mb-3">
            {item.title}
          </h2>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.pubDateFormatted}
          </span>
          <span className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
            Read more
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </a>
    );
  }

  // Regular news card
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
    >
      {item.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {item.source}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {item.pubDateFormatted}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-3 mb-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-auto">{item.description}</p>
        )}
      </div>
    </a>
  );
}

function NewsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Featured skeleton */}
      <div className="col-span-full h-64 sm:h-80 rounded-2xl bg-muted/50 animate-pulse" />
      {/* Regular skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-muted/50 animate-pulse">
          <div className="h-40 bg-muted/80" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-muted/80 rounded w-1/4" />
            <div className="h-4 bg-muted/80 rounded w-full" />
            <div className="h-4 bg-muted/80 rounded w-3/4" />
            <div className="h-3 bg-muted/80 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsPage() {
  const serverData = Route.useLoaderData();
  const [data, setData] = useState<NewsFeed | null>(serverData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getNewsFeed();
      setData(result);
    } catch (e) {
      setError("Failed to fetch news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Crypto News
                </h1>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">
                Latest Bitcoin and cryptocurrency news from Cointelegraph. Updated in real-time via
                RSS.
              </p>
            </div>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          {data?.fetchDate && (
            <p className="mt-3 text-xs text-muted-foreground">
              Last updated: {new Date(data.fetchDate).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading || (!data && !error) ? (
          <NewsSkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No news available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Unable to fetch news at this time. Please try refreshing or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <NewsCard key={`${item.link}-${index}`} item={item} index={index} />
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            News sourced from{" "}
            <a
              href="https://cointelegraph.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cointelegraph
            </a>{" "}
            via RSS feed. BTC500 is not affiliated with Cointelegraph.
          </p>
        </div>
      </div>
    </div>
  );
}
