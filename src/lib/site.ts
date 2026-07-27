/**
 * Site-wide constants and SEO helpers.
 * Single source of truth for base URL and page meta generation.
 */

export const SITE_URL = "https://btc500.vercel.app";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

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
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
  includeHreflang?: boolean;
  schema?: unknown;
}

export interface WebPageSchemaOptions {
  path: string;
  name: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  datePublished?: string;
  dateModified?: string;
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
  datePublished = "2024-01-15",
  dateModified = "2026-07-13",
}: WebPageSchemaOptions) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
    description,
    dateModified,
    datePublished,
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
  ogImageAlt,
  twitterTitle,
  twitterDescription,
  noIndex = false,
  includeHreflang = true,
  schema,
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const resolvedOgTitle = ogTitle ?? title;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? resolvedOgTitle;
  const resolvedTwitterDescription = twitterDescription ?? resolvedOgDescription;

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
  ];

  if (keywords) {
    meta.push({ name: "keywords", content: keywords });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  meta.push(
    { property: "og:title", content: resolvedOgTitle },
    { property: "og:description", content: resolvedOgDescription },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
  );

  if (ogImageAlt) {
    meta.push({ property: "og:image:alt", content: ogImageAlt });
  }

  meta.push(
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: resolvedTwitterTitle },
    { name: "twitter:description", content: resolvedTwitterDescription },
    { name: "twitter:image", content: ogImage },
  );

  const links: Array<Record<string, string>> = [{ rel: "canonical", href: url }];

  if (includeHreflang) {
    links.push(
      { rel: "alternate", hrefLang: "en", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    );
  }

  const scripts = schema
    ? [
        {
          type: "application/ld+json",
          content: JSON.stringify(schema),
        },
      ]
    : undefined;

  return {
    meta,
    links,
    ...(scripts ? { scripts } : {}),
  };
}
