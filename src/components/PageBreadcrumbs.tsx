import { getArticleBySlug } from "@/lib/articles";
import { crumbsForPath } from "@/lib/site";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageBreadcrumbs({ pathname }: { pathname: string }) {
  const article =
    pathname.startsWith("/articles/") && pathname !== "/articles"
      ? getArticleBySlug(pathname.replace("/articles/", ""))
      : undefined;
  const crumbs = crumbsForPath(pathname, article?.title);
  if (crumbs.length < 2) return null;

  return (
    <div className="border-b border-border/40 bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <BreadcrumbItem key={crumb.path}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {isLast ? (
                    <BreadcrumbPage className="line-clamp-1 max-w-[18rem] sm:max-w-md">
                      {crumb.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.path}>{crumb.name}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
