import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 sm:pt-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:max-w-prose [&_strong]:text-foreground">
          {children}
        </div>
      </main>
    </div>
  );
}
