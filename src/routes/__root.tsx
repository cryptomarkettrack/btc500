import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, type ReactNode } from "react";

import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BTC500",
  alternateName: "BTC500 — Bitcoin Halving Countdown & Strategy",
  url: "https://btc500.vercel.app/",
  description:
    "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell exactly 500 days after. Live countdowns, block progress, historical returns & investment simulator.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://btc500.vercel.app/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BTC500",
  url: "https://btc500.vercel.app/",
  logo: "https://btc500.vercel.app/favicon.svg",
  description: "Bitcoin halving countdown and investment strategy platform.",
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BTC500 — Buy Bitcoin 500 Days Before Halving | Bitcoin Halving Strategy" },
      {
        name: "description",
        content:
          "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell exactly 500 days after. Live countdowns, block progress, historical returns & investment simulator.",
      },
      {
        name: "keywords",
        content:
          "Bitcoin halving, BTC500, Bitcoin strategy, Bitcoin countdown, buy Bitcoin, crypto halving, Bitcoin investment strategy, halving countdown, Bitcoin trading strategy",
      },
      { name: "author", content: "BTC500" },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { name: "theme-color", content: "#F7931A" },
      { property: "og:title", content: "BTC500 — Buy Bitcoin 500 Days Before Halving" },
      {
        property: "og:description",
        content:
          "Buy 500 days before halving. Sell 500 days after. A dead-simple Bitcoin strategy with live countdowns and historical performance data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://btc500.vercel.app/" },
      { property: "og:site_name", content: "BTC500" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: "https://btc500.vercel.app/og/default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "BTC500 — Bitcoin Halving Countdown & Strategy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BTC500 — Buy Bitcoin 500 Days Before Halving" },
      {
        name: "twitter:description",
        content:
          "Buy 500 days before halving. Sell 500 days after. A dead-simple Bitcoin strategy.",
      },
      { name: "twitter:image", content: "https://btc500.vercel.app/og/default.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg", sizes: "64x64" },
      { rel: "canonical", href: "https://btc500.vercel.app/" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        content: JSON.stringify(websiteSchema),
      },
      {
        type: "application/ld+json",
        content: JSON.stringify(organizationSchema),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Nav />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
