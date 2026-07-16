export interface ArticleMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  keywords: string;
  date: string;
  dateISO: string;
  dateModified: string;
  dateModifiedISO: string;
  readTime: string;
  wordCount: number;
  ogImage: string;
  /** Section shown in schema.org */
  articleSection: string;
  /** Schema.org keywords */
  schemaKeywords: string;
}

export const SITE_URL = "https://btc500.vercel.app";

export const articles: ArticleMeta[] = [
  {
    id: "btc500-strategy",
    slug: "btc500-strategy",
    title: "The BTC500 Strategy: Buy 500 Days Before Halving, Sell 500 Days After",
    description:
      "A deep dive into the simplest and most effective Bitcoin investment strategy based on the halving cycle.",
    keywords:
      "Bitcoin halving strategy, BTC500 strategy, buy 500 days before halving, sell 500 days after, Bitcoin investment timing, halving cycle strategy",
    date: "January 15, 2024",
    dateISO: "2024-01-15",
    dateModified: "2026-07-13",
    dateModifiedISO: "2026-07-13",
    readTime: "8 min read",
    wordCount: 2500,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Bitcoin Investment Strategy",
    schemaKeywords:
      "Bitcoin halving, BTC500, Bitcoin strategy, investment strategy, halving countdown, Bitcoin trading",
  },
  {
    id: "why-btc500-exists",
    slug: "why-btc500-exists",
    title: "Why BTC500 Exists: The Most Expensive Mistake Bitcoin Investors Keep Repeating",
    description:
      "Learn why the BTC500 strategy was created to help investors avoid the most common and costly mistake in Bitcoin investing - buying too early during bear markets.",
    keywords:
      "Bitcoin investing mistakes, BTC500 strategy, Bitcoin bear market, buying the bottom, Bitcoin investment timing, halving cycle strategy",
    date: "July 13, 2026",
    dateISO: "2026-07-13",
    dateModified: "2026-07-13",
    dateModifiedISO: "2026-07-13",
    readTime: "7 min read",
    wordCount: 1800,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Bitcoin Investment Strategy",
    schemaKeywords:
      "Bitcoin investing mistakes, BTC500 strategy, Bitcoin bear market, buying the bottom, Bitcoin investment timing, halving cycle strategy",
  },
  {
    id: "rupl",
    slug: "rupl",
    title: "Net Unrealized Profit/Loss (NUPL): The Complete Guide to Bitcoin Market Psychology",
    description:
      "Understand Bitcoin's NUPL indicator — the five phases of market sentiment, how it's calculated, and how to use Relative Unrealized Profit/Loss to time the halving cycle.",
    keywords:
      "Bitcoin NUPL, Net Unrealized Profit Loss, RUPL, Bitcoin market psychology, Bitcoin on-chain indicators, halving cycle indicators",
    date: "July 13, 2026",
    dateISO: "2026-07-13",
    dateModified: "2026-07-13",
    dateModifiedISO: "2026-07-13",
    readTime: "8 min read",
    wordCount: 2200,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Bitcoin On-Chain Analysis",
    schemaKeywords:
      "Bitcoin NUPL, Net Unrealized Profit Loss, RUPL, Bitcoin market psychology, Bitcoin on-chain indicators",
  },
  {
    id: "ondo-finance-tokenization",
    slug: "ondo-finance-tokenization",
    title: "Why Ondo Finance Is Building the Infrastructure Wall Street Will Actually Use",
    description:
      "From DTCC's first tokenized securities trades to 430+ tokenized stocks and $1B+ in volume — how Ondo Finance is becoming the compliant bridge between Wall Street and on-chain finance.",
    keywords:
      "Ondo Finance, ONDO token, tokenized stocks, DTCC tokenization, BlackRock BUIDL, tokenized securities, DeFi compliance, institutional crypto, wall street blockchain",
    date: "July 16, 2026",
    dateISO: "2026-07-16",
    dateModified: "2026-07-16",
    dateModifiedISO: "2026-07-16",
    readTime: "10 min read",
    wordCount: 3000,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Tokenization & DeFi",
    schemaKeywords:
      "Ondo Finance, ONDO token, tokenized stocks, DTCC, BlackRock BUIDL, tokenized securities, regulated DeFi, institutional tokenization",
  },
];

/** Returns articles sorted newest-first */
export function getArticlesSorted(): ArticleMeta[] {
  return [...articles].sort(
    (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime(),
  );
}

/** Lookup a single article by slug */
export function getArticleBySlug(slug: string): ArticleMeta | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Generate Article schema.org JSON-LD */
export function generateArticleSchema(article: ArticleMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Organization",
      name: "BTC500",
      url: `${SITE_URL}/`,
    },
    publisher: {
      "@type": "Organization",
      name: "BTC500",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    datePublished: article.dateISO,
    dateModified: article.dateModifiedISO,
    image: article.ogImage,
    url: `${SITE_URL}/articles/${article.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Articles",
          item: `${SITE_URL}/articles`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: `${SITE_URL}/articles/${article.slug}`,
        },
      ],
    },
    articleSection: article.articleSection,
    wordCount: article.wordCount,
    timeRequired: `PT${article.readTime.charAt(0)}M`,
    keywords: article.schemaKeywords,
  };
}

/** Generate standard article page <head> meta + links + scripts */
export function generateArticleHead(article: ArticleMeta) {
  const pageUrl = `${SITE_URL}/articles/${article.slug}`;
  const title = `${article.title} — Articles | BTC500`;

  return {
    meta: [
      { title },
      { name: "description", content: article.description },
      { name: "keywords", content: article.keywords },
      { property: "og:title", content: title },
      { property: "og:description", content: article.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: pageUrl },
      { property: "og:image", content: article.ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: `${article.title} — BTC500`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: article.description },
      { name: "twitter:image", content: article.ogImage },
      {
        property: "article:published_time",
        content: `${article.dateISO}T00:00:00Z`,
      },
      {
        property: "article:modified_time",
        content: `${article.dateModifiedISO}T00:00:00Z`,
      },
    ],
    links: [
      { rel: "canonical", href: pageUrl },
      { rel: "alternate", hrefLang: "en", href: pageUrl },
      { rel: "alternate", hrefLang: "x-default", href: pageUrl },
    ],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(generateArticleSchema(article)),
      },
    ],
  };
}
