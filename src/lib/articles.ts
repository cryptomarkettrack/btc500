import {
  SITE_URL,
  LOGO_URL,
  generatePageHead,
  generateArticleSpeakableSchema,
  TWITTER_HANDLE,
} from "./site";

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
    id: "bitcoin-casino-searches",
    slug: "bitcoin-casino-searches",
    title: "Bitcoin Casino Searches Surged 500%: What It Really Means",
    description:
      "Bitcoin casino searches jumped ~500% and bitcoin casinos ~350% in the week to Aug 16, 2026. What the spike in casino-adjacent crypto queries signals about retail attention and the BTC500 halving-cycle buy date.",
    keywords:
      "bitcoin casino, bitcoin casinos, bitcoin casino searches surge, bitcoin search trends 2026, bitcoin google trends, bitcoin retail interest, bitcoin casino breakout, bitcoin gambling trend, bitcoin halving cycle attention, BTC500 strategy, bitcoin buy date November 30 2026, online bitcoin casino interest",
    date: "August 16, 2026",
    dateISO: "2026-08-16",
    dateModified: "August 16, 2026",
    dateModifiedISO: "2026-08-16",
    readTime: "9 min read",
    wordCount: 2000,
    ogImage: `${SITE_URL}/articles/bitcoin-casino-searches/og-bitcoin-casino-searches.png`,
    articleSection: "Bitcoin Market Trends",
    schemaKeywords:
      "bitcoin casino search surge, bitcoin search trends, bitcoin retail attention, bitcoin halving cycle attention, BTC500 strategy",
  },
  {
    id: "solar-eclipse-bitcoin-halving",
    slug: "solar-eclipse-bitcoin-halving",
    title:
      "Solar Eclipse and Bitcoin Halving: What Rare, Predictable Events Tell Us",
    description:
      "The August 12, 2026 total solar eclipse proved that rare predictable events reward preparation. Bitcoin's halving follows the same principle — here's what the eclipse teaches us about timing the next crypto cycle with the BTC500 strategy.",
    keywords:
      "solar eclipse 2026 bitcoin halving, bitcoin halving vs solar eclipse, bitcoin and solar eclipse connection, BTC500 strategy, rare predictable events bitcoin, bitcoin halving 2028 date, bitcoin halving countdown 2028, when is the next bitcoin halving, bitcoin halving cycle, bitcoin accumulation strategy, bitcoin bear market 2026, buy 500 days before halving",
    date: "August 15, 2026",
    dateISO: "2026-08-15",
    dateModified: "August 15, 2026",
    dateModifiedISO: "2026-08-15",
    readTime: "7 min read",
    wordCount: 1900,
    ogImage: `${SITE_URL}/articles/solar-eclipse-bitcoin-halving/og-solar-eclipse-bitcoin-halving.png`,
    articleSection: "Bitcoin Investment Strategy",
    schemaKeywords:
      "Bitcoin halving, solar eclipse 2026, BTC500 strategy, Bitcoin investment timing, halving cycle, Bitcoin accumulation, rare predictable events",
  },
  {
    id: "btc500-strategy",
    slug: "btc500-strategy",
    title: "BTC500 Strategy: When to Buy Bitcoin Before the Halving",
    description:
      "Should you buy Bitcoin before or after the halving — and when to sell after it? A rules-based look at the 500-day cycle, with historical windows, not guarantees.",
    keywords:
      "when to buy Bitcoin before halving, should I buy Bitcoin before or after halving, should you sell Bitcoin before the halving, when to sell Bitcoin after halving, Bitcoin 500-day cycle, BTC500 strategy",
    date: "January 15, 2024",
    dateISO: "2024-01-15",
    dateModified: "August 15, 2026",
    dateModifiedISO: "2026-08-15",
    readTime: "12 min read",
    wordCount: 3400,
    ogImage: `${SITE_URL}/og/default.png`,
    articleSection: "Bitcoin Investment Strategy",
    schemaKeywords:
      "when to buy Bitcoin before the halving, BTC500 strategy, Bitcoin 500-day cycle, sell after Bitcoin halving, Bitcoin investment timing",
  },
  {
    id: "why-btc500-exists",
    slug: "why-btc500-exists",
    title: "Why BTC500 Exists: Avoid This Bitcoin Mistake",
    description:
      "Learn why the BTC500 strategy helps investors avoid the most costly Bitcoin mistake — buying too early in bear markets.",
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
    title: "What Is NUPL? Bitcoin Market Psychology Guide",
    description:
      "Understand Bitcoin's NUPL indicator: the five phases of market sentiment, how it's calculated, and how to use RUPL to time the halving cycle.",
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
    title: "Why Ondo Finance Is Tokenizing Wall Street",
    description:
      "From DTCC's first tokenized trades to 430+ tokenized stocks — how Ondo Finance is bridging Wall Street and on-chain finance.",
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
    title: "The Consensus Bottom Is a Trap: Bear Market Guide",
    description:
      "When everyone agrees on the same bottom target, it loses its power. Learn why disciplined investors accumulate in bear markets instead.",
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
    title: "CLARITY Act Explained: A Guide to US Crypto Regulation",
    description:
      "The CLARITY Act explained: how this crypto bill would split regulation between the SEC and CFTC, and what it means for Bitcoin and Ethereum.",
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
    title: "Bitcoin Volatility Is Gone — But Risk Remains",
    description:
      "Deribit's DVOL has collapsed near 35 as Bitcoin hovers around $65,000. Here's what historically low volatility signals for the cycle.",
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
    title: "Coldcard & Lightning Exploits: Bitcoin Security Risk",
    description:
      "From the ~$116M Coldcard seed theft to BTCPay Lightning node drains — how infrastructure exploits expose real Bitcoin self-custody risks.",
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
    id: "bitcoin-week-ahead",
    slug: "bitcoin-week-ahead",
    title: "Bitcoin This Week (Aug 17–23): FOMC Minutes & Jackson Hole",
    description:
      "Week of Aug 17–23, 2026: Bitcoin near $63,100, Wednesday’s FOMC minutes, the Wyoming Blockchain Symposium, and ETF flows — plus the Nov 30 buy date.",
    keywords:
      "Bitcoin this week August 17-23 2026, Bitcoin weekly outlook, Bitcoin FOMC minutes, Jackson Hole Bitcoin, Wyoming Blockchain Symposium, Bitcoin ETF flows, Bitcoin 63100, Bitcoin week ahead, BTC500 cycle, Paul Atkins SEC Bitcoin, Bitcoin key events",
    date: "August 17, 2026",
    dateISO: "2026-08-17",
    dateModified: "August 17, 2026",
    dateModifiedISO: "2026-08-17",
    readTime: "10 min read",
    wordCount: 2800,
    ogImage: `${SITE_URL}/articles/weekly-brief/og-bitcoin-week-ahead.png`,
    articleSection: "Bitcoin Market Analysis",
    schemaKeywords:
      "Bitcoin weekly outlook, Bitcoin FOMC minutes, Jackson Hole Bitcoin, Bitcoin ETF flows, Bitcoin key events, BTC500 500-day cycle",
  },
  {
    id: "bip-110-rejection",
    slug: "bip-110-rejection",
    title: "BIP-110 Rejection: What It Means for Bitcoin",
    description:
      "Bitcoin proposal BIP-110 failed after near-zero miner support. Here's what the rejection means for Bitcoin governance and upgrades.",
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
  {
    id: "strongest-hands",
    slug: "strongest-hands",
    title: "90 Elite Bitcoin Wallets: Strongest Hands Are Back",
    description:
      "Elite Bitcoin wallets holding 10,000+ BTC just hit a six-month high of 90. Here's what whale accumulation says about the halving cycle.",
    keywords:
      "Bitcoin whale accumulation, Bitcoin strongest hands, 10000 BTC wallets, Bitcoin whale wallets 2026, elite Bitcoin wallets, on-chain Bitcoin accumulation, Bitcoin six-month high, whale accumulation halving, Bitcoin buy date, BTC500 strategy, Bitcoin accumulation phase",
    date: "August 11, 2026",
    dateISO: "2026-08-11",
    dateModified: "2026-08-11",
    dateModifiedISO: "2026-08-11",
    readTime: "9 min read",
    wordCount: 2400,
    ogImage: `${SITE_URL}/articles/strongest-hands/og-strongest-hands.png`,
    articleSection: "Bitcoin On-Chain Analysis",
    schemaKeywords:
      "Bitcoin whale accumulation, Bitcoin strongest hands, 10000 BTC wallets, on-chain Bitcoin accumulation, whale accumulation halving, Bitcoin buy date, BTC500 strategy",
  },
  {
    id: "sec-cancels-regulation-crypto",
    slug: "sec-cancels-regulation-crypto",
    title: "SEC Cancels Regulation Crypto Vote: What It Means",
    description:
      "The SEC cancelled Friday's Regulation Crypto vote with no new date. Here's what the delay means for Bitcoin and the November 30, 2026 buy window.",
    keywords:
      "SEC Regulation Crypto, SEC cancels crypto meeting, Regulation Crypto Assets, Paul Atkins crypto rules, SEC crypto offering exemption, SEC tailored offering regime, crypto investment contract rules August 2026, CLARITY Act delay, Bitcoin regulation 2026, BTC500 strategy",
    date: "August 14, 2026",
    dateISO: "2026-08-14",
    dateModified: "August 14, 2026",
    dateModifiedISO: "2026-08-14",
    readTime: "9 min read",
    wordCount: 2100,
    ogImage: `${SITE_URL}/articles/sec-cancels-regulation-crypto/og-sec-cancels-regulation-crypto.png`,
    articleSection: "Crypto Regulation & Policy",
    schemaKeywords:
      "SEC Regulation Crypto, Regulation Crypto Assets, SEC crypto rules, Paul Atkins, crypto offering exemption, CLARITY Act, Bitcoin regulation, BTC500 strategy",
  },
  {
    id: "goldman-vs-blackrock",
    slug: "goldman-vs-blackrock",
    title: "Goldman Sachs vs BlackRock: The Bitcoin ETF War",
    description:
      "Goldman Sachs is buying into the bitcoin income ETF business for $2.25B via NEOS. What the ETF war means for bitcoin supply and the halving cycle.",
    keywords:
      "Goldman Sachs bitcoin ETF, BlackRock bitcoin ETF, bitcoin income ETF, NEOS buyout, Goldman Sachs NEOS, bitcoin ETF war, covered call bitcoin ETF, institutional bitcoin adoption, bitcoin ETF custody, bitcoin supply shock, BTC500 strategy, bitcoin halving",
    date: "August 12, 2026",
    dateISO: "2026-08-12",
    dateModified: "2026-08-12",
    dateModifiedISO: "2026-08-12",
    readTime: "9 min read",
    wordCount: 2400,
    ogImage: `${SITE_URL}/articles/goldman-vs-blackrock/og-goldman-vs-blackrock.png`,
    articleSection: "Bitcoin Markets & Institutional Adoption",
    schemaKeywords:
      "Goldman Sachs bitcoin ETF, BlackRock bitcoin ETF, NEOS, bitcoin income ETF, institutional bitcoin adoption, bitcoin ETF war",
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
    "@type": ["Article", "BlogPosting"],
    headline: article.title,
    description: article.description,
    inLanguage: "en-US",
    author: {
      "@type": "Organization",
      name: "BTC500",
      url: `${SITE_URL}/`,
      sameAs: [`${SITE_URL}/about`],
    },
    publisher: {
      "@type": "Organization",
      name: "BTC500",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
    },
    about: {
      "@type": "Thing",
      name: "Bitcoin halving",
    },
    citation: `${SITE_URL}/articles/btc500-strategy`,
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
    schema: [generateArticleSchema(article), generateArticleSpeakableSchema(pageUrl)],
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
