import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useNow } from "@/hooks/use-now";
import { articleSlugFromPath } from "@/lib/article-path";
import { getArticleBySlug } from "@/lib/articles";
import { computeCycle } from "@/lib/phase";
import { halvingQuery } from "@/lib/queries";

/**
 * Dated articles quote the T-500 date as it stood when they were written. The
 * date is projected from block height, so it moves — several indexed articles
 * still say "November 30, 2026" while the live model says November 28, 2026.
 * Rather than rewriting dated snapshots, this strip states the live estimate
 * and reconciles the two projections on every article page.
 *
 * Rendered from the root layout because all 20 article routes are separate
 * files with no shared layout. `halvingQuery` is seeded by the root loader, so
 * the date is present in the server HTML, not only after hydration.
 */
export function ArticleDateNotice({ pathname }: { pathname: string }) {
  const slug = articleSlugFromPath(pathname);
  const article = slug ? getArticleBySlug(slug) : undefined;
  const { data: halving } = useQuery(halvingQuery);
  const now = useNow(60_000);

  if (!article || !halving) return null;

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );
  const buyLabel = cycle.buyDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const halvingLabel = cycle.nextHalving.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const buyTiming =
    cycle.phase === "wait-buy"
      ? `${cycle.daysUntilBuy} ${cycle.daysUntilBuy === 1 ? "day" : "days"} away`
      : "the window is open";

  return (
    <aside
      aria-label="Live BTC500 buy date"
      className="border-y border-border/60 bg-muted/40 print:hidden"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <p className="max-w-3xl">
          <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Live date
          </span>
          Published {article.date}. The BTC500 buy date is 500 days before the estimated halving —
          on the live model that is <strong className="text-foreground">{buyLabel}</strong> (
          {buyTiming}), with the halving projected for {halvingLabel} at block{" "}
          {halving.nextHalvingBlock.toLocaleString("en-US")}. Earlier notes used an April 13, 2028
          projection, which put the buy date on November 30, 2026; both come from block 1,050,000,
          so the calendar day moves with block height.
        </p>
        <p className="shrink-0 text-xs">
          <Link to="/halving-dates" className="font-semibold text-primary hover:underline">
            Live schedule
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary hover:underline">
            The method
          </Link>
        </p>
      </div>
    </aside>
  );
}
