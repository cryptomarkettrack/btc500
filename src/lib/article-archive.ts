/**
 * Articles that stay published but out of the search index.
 *
 * Kept in its own module with no imports so it can be checked by the test
 * runner without pulling in the rest of the article metadata.
 *
 * Rule for this site: an article whose title or framing is anchored to a past
 * date or a past event can never compete for a durable query. Google already
 * declined to index most of these ("Crawled - currently not indexed"), and
 * leaving them indexable dilutes the crawl budget the money pages need.
 *
 * When adding dated commentary, add the slug here at the same time.
 */
export const ARCHIVED_ARTICLE_SLUGS = new Set<string>([
  "bitcoin-week-ahead",
  "doctor-profit-bitcoin-october-2026",
  "bitcoin-80k-breakout",
  "is-the-bottom-in",
  "why-bitcoin-pumped",
  "bitcoin-casino-searches",
  "clarity-act",
  "goldman-vs-blackrock",
]);

/** True when the article should stay out of search indexes. */
export function isArchivedArticle(slug: string): boolean {
  return ARCHIVED_ARTICLE_SLUGS.has(slug);
}
