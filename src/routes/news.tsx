import { createFileRoute } from "@tanstack/react-router";
import { getNewsFeed, type NewsFeed } from "@/lib/news";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";
import { NewsFeedPage } from "@/components/news/NewsFeedPage";

const newsSchema = generateWebPageSchema({
  path: "/news",
  name: "Crypto News — Bitcoin & Cryptocurrency News Feed",
  description:
    "Latest cryptocurrency and Bitcoin news aggregated from Cointelegraph. Stay updated with real-time crypto market news and blockchain industry developments.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "News", path: "/news" },
  ],
});

export const Route = createFileRoute("/news")({
  component: NewsRoute,
  loader: async (): Promise<NewsFeed | null> => {
    try {
      return await getNewsFeed();
    } catch (e) {
      console.error("Failed to fetch news feed:", e);
      return null;
    }
  },
  head: () =>
    generatePageHead({
      path: "/news",
      title: "Crypto News — Bitcoin & Cryptocurrency News Feed | BTC500",
      description:
        "Latest Bitcoin and cryptocurrency news aggregated from Cointelegraph. Stay updated on crypto markets and blockchain developments.",
      keywords:
        "crypto news, Bitcoin news, cryptocurrency news, Bitcoin price, crypto market, blockchain news, Cointelegraph, crypto headlines, digital assets news",
      ogDescription:
        "Latest Bitcoin and cryptocurrency news aggregated in real-time. Stay informed on crypto markets, blockchain technology, and digital asset developments.",
      ogImageAlt: "Crypto News — Bitcoin & Cryptocurrency News Feed",
      twitterDescription: "Latest Bitcoin and cryptocurrency news aggregated in real-time.",
      schema: newsSchema,
    }),
});

function NewsRoute() {
  const initialData = Route.useLoaderData();
  return <NewsFeedPage initialData={initialData} />;
}
