import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RoutePendingProps {
  children?: ReactNode;
}

/**
 * Standard full-page loading shell for data-heavy routes.
 * Pass custom skeleton children for page-specific layouts.
 */
export function RoutePending({ children }: RoutePendingProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        {children ?? (
          <div className="flex flex-col gap-6 p-5">
            <header className="mb-8 text-center sm:mb-12">
              <Skeleton className="mx-auto h-10 w-64 rounded-lg" />
              <Skeleton className="mx-auto mt-4 h-6 w-96 rounded-md" />
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-[24px]" />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
