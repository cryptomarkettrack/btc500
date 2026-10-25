/**
 * Resolve an article slug from a router pathname.
 *
 * The live-date strip is mounted once in the root layout instead of in all 20
 * article routes, so it has to decide from the URL alone whether it is on an
 * article page. The index (/articles) and trailing-slash variants must not
 * match.
 */
export function articleSlugFromPath(pathname: string): string | null {
  const prefix = "/articles/";
  if (!pathname.startsWith(prefix)) return null;
  const slug = pathname.slice(prefix.length).replace(/\/+$/, "");
  return slug.length > 0 ? slug : null;
}
