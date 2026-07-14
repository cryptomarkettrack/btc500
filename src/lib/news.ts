import { createServerFn } from "@tanstack/react-start";
import RssParser from "rss-parser";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  pubDateFormatted: string;
  description: string;
  imageUrl: string | null;
  source: string;
}

export interface NewsFeed {
  items: NewsItem[];
  fetchDate: string;
}

const RSS_FEEDS = [
  "https://cointelegraph.com/rss",
  "https://cointelegraph.com/rss/tag/bitcoin",
  "https://cointelegraph.com/rss/tag/ethereum",
];

function extractImageUrl(item: Record<string, unknown>): string | null {
  // Try media:content or media:thumbnail
  const mediaContent = item["media:content"] as { $?: { url?: string }; url?: string } | undefined;
  if (mediaContent) {
    const url = mediaContent.$?.url || mediaContent.url;
    if (url) return url;
  }

  const mediaThumbnail = item["media:thumbnail"] as
    { $?: { url?: string }; url?: string } | undefined;
  if (mediaThumbnail) {
    const url = mediaThumbnail.$?.url || mediaThumbnail.url;
    if (url) return url;
  }

  // Try enclosure
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image")) {
    return enclosure.url;
  }

  // Try to extract from content:encoded or content snippet
  const content = (item["content:encoded"] as string) || (item.content as string) || "";
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return imgMatch[1];

  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, (m) => {
      const code = parseInt(m.slice(2, -1), 10);
      return String.fromCharCode(code);
    })
    .replace(/&\w+;/g, " ")
    .trim();
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

async function fetchFeed(url: string): Promise<NewsItem[]> {
  const parser = new RssParser({ timeout: 10000 });

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  const xml = await response.text();
  const feed = await parser.parseString(xml);

  return (feed.items || [])
    .slice(0, 30)
    .map((item) => {
      const description = stripHtml(item.contentSnippet || item.content || item.summary || "");
      const imageUrl = extractImageUrl(item as unknown as Record<string, unknown>);

      return {
        title: item.title || "Untitled",
        link: item.link || "#",
        pubDate: item.pubDate || item.isoDate || "",
        pubDateFormatted: formatDate(item.pubDate || item.isoDate || ""),
        description: truncate(description, 200),
        imageUrl,
        source: "Cointelegraph",
      };
    })
    .filter((item) => item.title && item.link);
}

export async function fetchNewsFeed(): Promise<NewsFeed> {
  const allItems: NewsItem[] = [];
  let lastError: Error | null = null;

  for (const url of RSS_FEEDS) {
    try {
      const items = await fetchFeed(url);
      allItems.push(...items);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(`Failed to fetch ${url}:`, lastError.message);
    }
  }

  // Deduplicate by link
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });

  // Sort by date, newest first
  uniqueItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  if (uniqueItems.length === 0 && lastError) {
    throw lastError;
  }

  return {
    items: uniqueItems.slice(0, 30),
    fetchDate: new Date().toISOString(),
  };
}

export const getNewsFeed = createServerFn({ method: "GET" }).handler(async () => {
  return fetchNewsFeed();
});
