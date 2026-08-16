/**
 * Site-wide constants and SEO helpers.
 * Single source of truth for base URL and page meta generation.
 */

export const SITE_URL = "https://btc500.net";
export const SITE_NAME = "BTC500";
export const SITE_TAGLINE = "Buy Bitcoin 500 Days Before Halving";
export const TWITTER_HANDLE = "@btc500halving";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;
export const DEFAULT_OG_IMAGE_ALT = "BTC500 — Bitcoin Halving Countdown & Strategy";
/**
 * Last time homepage footer copy was reviewed. Page-specific — not a global
 * "today" stamp and not a default for other pages' dateModified.
 */
export const HOME_LAST_REVIEWED = "2026-08-15";
/** @deprecated Use page-specific dates. Kept so existing homepage imports compile. */
export const SITE_DATE_MODIFIED = HOME_LAST_REVIEWED;
export const LOGO_URL = `${SITE_URL}/icons/icon-512.png`;
export const CONTACT_EMAIL = "btc500halving@gmail.com";

/** Primary brand social profiles (also used in Organization schema). */
export const SOCIAL_PROFILES = [
  "https://x.com/btc500halving",
  "https://www.instagram.com/btc500halving",
] as const;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface PageHeadOptions {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
  includeHreflang?: boolean;
  schema?: unknown | unknown[];
  /** Article / page dates for Open Graph */
  publishedTime?: string;
  modifiedTime?: string;
}

export interface WebPageSchemaOptions {
  path: string;
  name: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  datePublished?: string;
  dateModified?: string;
}

export interface SpeakableSchemaOptions {
  path: string;
  /** CSS selectors pointing at the concise, speakable summary content on the page. */
  cssSelectors: string[];
  /** Optional XPath expressions pointing at speakable content (alternative to cssSelector). */
  xpath?: string[];
}

/**
 * JSON-LD Speakable schema — the core AEO structured-data technique.
 * Lets answer engines (Google Assistant, Siri, Perplexity, ChatGPT with search)
 * pull the exact short summary paragraph from the page as the spoken answer.
 */
export function generateSpeakableSchema({ path, cssSelectors, xpath }: SpeakableSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    cssSelector: cssSelectors,
    ...(xpath && xpath.length ? { xpath } : {}),
    mainEntityOfPage: absoluteUrl(path),
  };
}

/** Convenience: speakable schema pointing at a `.lead` paragraph (used by all articles). */
export function generateArticleSpeakableSchema(path: string) {
  return generateSpeakableSchema({
    path,
    cssSelectors: [".lead"],
  });
}

/** Absolute URL for a site path (leading slash optional). */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** JSON-LD WebPage + BreadcrumbList schema used across tool pages. */
export function generateWebPageSchema({
  path,
  name,
  description,
  breadcrumbs,
  datePublished,
  dateModified,
}: WebPageSchemaOptions) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
    description,
    ...(dateModified ? { dateModified } : {}),
    ...(datePublished ? { datePublished } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      })),
    },
  };
}

/**
 * Standard page head (title, description, OG, Twitter, canonical).
 * Mirrors the shape used by existing routes so migrations stay behavior-preserving.
 */
export function generatePageHead({
  path,
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  ogType = "website",
  twitterTitle,
  twitterDescription,
  noIndex = false,
  includeHreflang = true,
  schema,
  publishedTime,
  modifiedTime,
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const resolvedOgTitle = ogTitle ?? title;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription ?? resolvedOgDescription;

  // Keep titles under ~60 chars for SERP display when possible; never truncate forced titles.
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
  ];

  if (keywords) {
    meta.push({ name: "keywords", content: keywords });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
    meta.push({ name: "googlebot", content: "noindex, nofollow" });
  } else {
    meta.push({
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });
  }

  meta.push(
    { property: "og:title", content: resolvedOgTitle },
    { property: "og:description", content: resolvedOgDescription },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: ogImage },
    { property: "og:image:secure_url", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: ogImageAlt },
  );

  if (publishedTime) {
    meta.push({ property: "article:published_time", content: publishedTime });
  }
  if (modifiedTime) {
    meta.push({ property: "article:modified_time", content: modifiedTime });
  }

  meta.push(
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { name: "twitter:title", content: resolvedTwitterTitle },
    { name: "twitter:description", content: resolvedTwitterDescription },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: ogImageAlt },
  );

  const links: Array<Record<string, string>> = [{ rel: "canonical", href: url }];

  if (includeHreflang) {
    links.push(
      { rel: "alternate", hrefLang: "en", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    );
  }

  const schemas = schema == null ? [] : Array.isArray(schema) ? schema : [schema];
  const scripts = schemas.length
    ? schemas.map((s) => ({
        type: "application/ld+json",
        content: JSON.stringify(s),
      }))
    : undefined;

  return {
    meta,
    links,
    ...(scripts ? { scripts } : {}),
  };
}

export function generateFaqSchema(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** HowTo markup for the visible 3-step BTC500 rule. Only emit on pages that show the steps. */
export function generateHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the BTC500 Bitcoin strategy",
    description:
      "A three-step, rules-based Bitcoin approach: buy 500 days before each halving, hold through the event, and sell 500 days after.",
    totalTime: "P1000D",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Buy 500 days before the next Bitcoin halving",
        text: "Buy Bitcoin on the date that is exactly 500 days before the next halving. BTC500 tracks live block height and shows that buy date on the homepage countdown.",
        url: `${SITE_URL}/#step-buy`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Hold through the halving",
        text: "Hold the position as the halving occurs (every 210,000 blocks, roughly every four years). Do not trade the headlines around the event.",
        url: `${SITE_URL}/#step-hold`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Sell 500 days after the halving",
        text: "Exit exactly 500 days after the halving, then wait for the next cycle's buy date. Repeat every ~4 years. Past performance does not guarantee future results.",
        url: `${SITE_URL}/#step-sell`,
      },
    ],
  };
}

export function generateDatasetSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "BTC500 historical Bitcoin prices",
    description:
      "Daily Bitcoin USD prices from Bitstamp used to backtest the BTC500 strategy across the 2012, 2016, 2020, and 2024 halving cycles.",
    url: `${SITE_URL}/simulator`,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: "2011-07-17/..",
    variableMeasured: "Bitcoin closing price in USD",
    measurementTechnique: "Historical daily close from Bitstamp",
    isAccessibleForFree: true,
  };
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/bitcoin-500-day-cycle": "Bitcoin 500-Day Cycle",
  "/halving-dates": "Halving Dates",
  "/simulator": "Simulator",
  "/dca": "DCA vs Lump Sum",
  "/timeline": "Time Machine",
  "/bear-market": "Bear Market Meter",
  "/liquidation": "Liquidation",
  "/insider-trading": "Insider Trading",
  "/news": "News",
  "/articles": "Articles",
  "/embed-kit": "Embed Kit",
  "/about": "About",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

/** Visible breadcrumb trail for a path. Homepage and embeds return []. */
export function crumbsForPath(pathname: string, articleTitle?: string): BreadcrumbItem[] {
  if (!pathname || pathname === "/" || pathname.startsWith("/embed")) return [];

  if (pathname.startsWith("/articles/")) {
    return [
      { name: "Home", path: "/" },
      { name: "Articles", path: "/articles" },
      { name: articleTitle || "Article", path: pathname },
    ];
  }

  const label = PAGE_LABELS[pathname];
  if (!label) return [];
  return [
    { name: "Home", path: "/" },
    { name: label, path: pathname },
  ];
}
