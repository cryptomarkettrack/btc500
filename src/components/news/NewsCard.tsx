import type { NewsItem } from "@/lib/news";
import { Clock, ExternalLink, Newspaper } from "lucide-react";

export function NewsCard({ item, index }: { item: NewsItem; index: number }) {
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

export function NewsSkeleton() {
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

