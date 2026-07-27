import { getNewsFeed, type NewsFeed } from "@/lib/news";
import { Newspaper, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { NewsCard, NewsSkeleton } from "@/components/news/NewsCard";

export function NewsFeedPage({ initialData }: { initialData: NewsFeed | null }) {
  const serverData = initialData;
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
