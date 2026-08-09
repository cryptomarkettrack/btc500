import { SITE_URL, generatePageHead, TWITTER_HANDLE } from "./site";

export { SITE_URL };

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
    ogImage: `${SITE_URL}/og/rupl-chart.jpeg`,
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
  {
    id: "bear-market-accumulation",
    slug: "bear-market-accumulation",
    title: "The Consensus Bottom Is a Trap: Why the Crowd's Bear Market Target Never Arrives",
    description:
      "When the entire market agrees on the same bottom target, that target loses its power. Learn why disciplined investors accumulate during bear markets instead of waiting for the crowd's 'confirmed bottom.'",
    keywords:
      "Bitcoin bear market, consensus bottom, Bitcoin accumulation, MA200 weekly, Bitcoin bottom target, BTC500 strategy, Bitcoin halving cycle, forced selling, Bitcoin whale",
    date: "August 3, 2026",
    dateISO: "2026-08-03",
    dateModified: "2026-08-03",
    dateModifiedISO: "2026-08-03",
    readTime: "7 min read",
    wordCount: 1900,
    ogImage: `${SITE_URL}/og/real-bottom.png`,
    articleSection: "Bitcoin Market Psychology",
    schemaKeywords:
      "Bitcoin bear market, consensus bottom, Bitcoin accumulation, MA200 weekly, Bitcoin bottom target, BTC500 strategy, Bitcoin halving cycle, forced selling",
  },
  {
    id: "clarity-act",
    slug: "clarity-act",
    title: "What Is the CLARITY Act? The Complete Guide to US Crypto Regulation",
    description:
      "The CLARITY Act explained in plain English. Learn how this landmark crypto bill would split regulation between the SEC and CFTC, what it means for Bitcoin, Ethereum, and the whole digital asset market.",
    keywords:
      "CLARITY Act, What is the CLARITY Act, CLARITY Act explained, Digital Asset Market Clarity Act, crypto regulation, cryptocurrency regulation, SEC vs CFTC, crypto legislation, Bitcoin regulation, Ethereum regulation, digital asset regulation, blockchain regulation",
    date: "August 4, 2026",
    dateISO: "2026-08-04",
    dateModified: "2026-08-04",
    dateModifiedISO: "2026-08-04",
    readTime: "22 min read",
    wordCount: 4200,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Crypto Regulation & Policy",
    schemaKeywords:
      "CLARITY Act, Digital Asset Market Clarity Act, crypto regulation, cryptocurrency regulation, SEC vs CFTC, Bitcoin regulation, Ethereum regulation, digital asset regulation, crypto legislation",
  },
  {
    id: "bitcoin-volatility",
    slug: "bitcoin-volatility",
    title:
      "Bitcoin's Volatility Has Nearly Disappeared — Why That Doesn't Mean Risk Is Gone",
    description:
      "Deribit's DVOL has collapsed near 35 as Bitcoin hovers around $65,000. Here's what historically low volatility actually signals for the cycle, options markets, and disciplined accumulation.",
    keywords:
      "Bitcoin volatility, Bitcoin DVOL, Bitcoin low volatility, Bitcoin implied volatility, Bitcoin price compression, BTC volatility squeeze, Bitcoin options, Bitcoin market risk, Bitcoin accumulation, BTC500 strategy",
    date: "August 8, 2026",
    dateISO: "2026-08-08",
    dateModified: "2026-08-08",
    dateModifiedISO: "2026-08-08",
    readTime: "8 min read",
    wordCount: 2100,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Bitcoin Market Analysis",
    schemaKeywords:
      "Bitcoin volatility, Bitcoin DVOL, Bitcoin low volatility, Bitcoin implied volatility, Bitcoin price compression, BTC volatility squeeze, Bitcoin options, Bitcoin market risk, BTC500 strategy",
  },
  {
    id: "bitcoin-infrastructure-exploits",
    slug: "bitcoin-infrastructure-exploits",
    title:
      "Coldcard and Lightning Exploits: Why Bitcoin Infrastructure Risk Still Matters",
    description:
      "From the ~$116M Coldcard seed-generation theft to BTCPay Lightning node drains — how two back-to-back infrastructure exploits expose the real self-custody risks long-term Bitcoin holders can't ignore.",
    keywords:
      "Coldcard hack, Coldcard exploit, Coinkite, BTCPay Server vulnerability, Lightning Network exploit, Bitcoin hardware wallet hack, Bitcoin self custody, Bitcoin security, LND macaroon, Bitcoin infrastructure risk, seed phrase security",
    date: "August 8, 2026",
    dateISO: "2026-08-08",
    dateModified: "2026-08-08",
    dateModifiedISO: "2026-08-08",
    readTime: "9 min read",
    wordCount: 2400,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Bitcoin Security & Self-Custody",
    schemaKeywords:
      "Coldcard hack, Coldcard exploit, BTCPay Server, Lightning Network exploit, Bitcoin hardware wallet, self custody, Bitcoin security, Bitcoin infrastructure, seed phrase",
  },
  {
    id: "bip-110-rejection",
    slug: "bip-110-rejection",
    title: "BIP-110 Rejection: What It Means for Bitcoin’s Future",
    description:
      "Bitcoin Improvement Proposal BIP-110 failed after near-zero miner support and a stalled minority chain. Here’s what the BIP-110 rejection means for Bitcoin governance, upgrades, and long-term holders.",
    keywords:
      "BIP-110, BIP-110 rejection, Bitcoin BIP-110 rejection, what is BIP-110, Bitcoin proposal rejected, Bitcoin governance, Bitcoin Improvement Proposal BIP-110, why BIP-110 was rejected, Bitcoin governance process, Bitcoin upgrades and proposals",
    date: "August 9, 2026",
    dateISO: "2026-08-09",
    dateModified: "2026-08-09",
    dateModifiedISO: "2026-08-09",
    readTime: "8 min read",
    wordCount: 1600,
    ogImage: `${SITE_URL}/articles/bip-110/bip-110-rejection.png`,
    articleSection: "Bitcoin Governance",
    schemaKeywords:
      "BIP-110, BIP-110 rejection, Bitcoin BIP-110, Bitcoin governance, soft fork, Bitcoin Improvement Proposal, minority chain, Bitcoin upgrades",
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
  const pageUrl = `${SITE_URL}/articles/${article.slug}`;
  const minutes = parseInt(article.readTime, 10) || 8;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "en-US",
    author: {
      "@type": "Organization",
      name: "BTC500",
      url: `${SITE_URL}/`,
    },
    publisher: {
      "@type": "Organization",
      name: "BTC500",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    datePublished: article.dateISO,
    dateModified: article.dateModifiedISO,
    image: [article.ogImage],
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
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
          item: pageUrl,
        },
      ],
    },
    articleSection: article.articleSection,
    wordCount: article.wordCount,
    timeRequired: `PT${minutes}M`,
    keywords: article.schemaKeywords,
    isAccessibleForFree: true,
  };
}

/** Generate standard article page <head> meta + links + scripts */
export function generateArticleHead(article: ArticleMeta) {
  const pageUrl = `/articles/${article.slug}`;
  const title = `${article.title} | BTC500`;

  const head = generatePageHead({
    path: pageUrl,
    title,
    description: article.description,
    keywords: article.keywords,
    ogTitle: article.title,
    ogDescription: article.description,
    ogImage: article.ogImage,
    ogImageAlt: `${article.title} — BTC500`,
    ogType: "article",
    twitterTitle: article.title,
    twitterDescription: article.description,
    publishedTime: `${article.dateISO}T00:00:00Z`,
    modifiedTime: `${article.dateModifiedISO}T00:00:00Z`,
    schema: generateArticleSchema(article),
  });

  head.meta.push(
    { property: "article:section", content: article.articleSection },
    { property: "article:author", content: "BTC500" },
    { name: "author", content: "BTC500" },
  );

  if (!head.meta.some((m) => m.name === "twitter:site")) {
    head.meta.push({ name: "twitter:site", content: TWITTER_HANDLE });
  }

  return head;
}
