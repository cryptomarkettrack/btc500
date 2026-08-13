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
import { PageBreadcrumbs } from "../components/PageBreadcrumbs";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  TWITTER_HANDLE,
  SOCIAL_PROFILES,
  LOGO_URL,
  CONTACT_EMAIL,
} from "@/lib/site";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: [
    "BTC500 — Bitcoin Halving Countdown & Strategy",
    "Bitcoin Halving Countdown",
    "BTC 500 Strategy",
  ],
  url: `${SITE_URL}/`,
  description:
    "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell exactly 500 days after. Live countdowns, cycle score, block progress, historical returns & investment simulator.",
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  image: DEFAULT_OG_IMAGE,
  description:
    "Bitcoin halving countdown and investment strategy platform for the BTC500 strategy.",
  email: CONTACT_EMAIL,
  foundingDate: "2026-07-11",
  knowsAbout: [
    "Bitcoin halving",
    "Bitcoin investment strategy",
    "BTC500 strategy",
    "Bitcoin cycle timing",
  ],
  sameAs: [...SOCIAL_PROFILES],
  contactPoint: {
    "@type": "ContactPoint",
    email: CONTACT_EMAIL,
    contactType: "customer support",
    availableLanguage: "English",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  description:
    "A Bitcoin halving countdown and investment strategy tool that helps track the BTC500 strategy: buy 500 days before halving, sell 500 days after.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Live Bitcoin halving countdown",
    "Cycle Command Center & cycle score",
    "Block height progress tracking",
    "Investment simulator with historical data",
    "DCA vs lump sum comparison",
    "Interactive timeline of halving cycles",
    "Bear market bottom indicators",
    "Bitcoin futures liquidation dashboard",
    "Free embeddable countdown widgets",
  ],
  screenshot: DEFAULT_OG_IMAGE,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
          <Link
            to="/articles"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Browse articles
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
          This page didn&apos;t load
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
      { name: "google-site-verification", content: "qHP6Tv0ATrOnUECajp9xornwY_JuflRnTQeEF7QOo4s" },
      { name: "msvalidate.01", content: "32EF2D70FCF8C7EF70C2E55E1F326804" },
      {
        title: "BTC500 — Bitcoin Halving Countdown & Investment Strategy | Buy 500 Days Before",
      },
      {
        name: "description",
        content:
          "Track the Bitcoin 500 strategy: buy exactly 500 days before each halving and sell exactly 500 days after. Live countdowns, cycle score, historical returns & investment simulator.",
      },
      {
        name: "keywords",
        content:
          "Bitcoin halving, BTC500, Bitcoin strategy, Bitcoin countdown, buy Bitcoin, crypto halving, Bitcoin investment strategy, halving countdown, Bitcoin trading strategy, cycle score, Bitcoin simulator",
      },
      { name: "author", content: SITE_NAME },
      { name: "creator", content: SITE_NAME },
      { name: "publisher", content: SITE_NAME },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "googlebot",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "theme-color", content: "#F7931A" },
      { name: "color-scheme", content: "dark light" },
      { name: "format-detection", content: "telephone=no" },
      { name: "application-name", content: SITE_NAME },
      { name: "apple-mobile-web-app-title", content: SITE_NAME },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      // Open Graph defaults (overridden per-route)
      { property: "og:title", content: "BTC500 — Bitcoin Halving Countdown & Investment Strategy" },
      {
        property: "og:description",
        content:
          "Buy 500 days before halving. Sell 500 days after. Live cycle score, countdowns, and historical performance data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { property: "og:image:secure_url", content: DEFAULT_OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:alt", content: DEFAULT_OG_IMAGE_ALT },
      // Twitter defaults
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:creator", content: TWITTER_HANDLE },
      { name: "twitter:title", content: "BTC500 — Bitcoin Halving Countdown & Strategy" },
      {
        name: "twitter:description",
        content: "Buy 500 days before halving. Sell 500 days after. Free tools & live data.",
      },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:image:alt", content: DEFAULT_OG_IMAGE_ALT },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "dns-prefetch",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      { rel: "alternate", type: "text/plain", href: "/llms.txt", title: "llms.txt" },
      { rel: "alternate", type: "text/plain", href: "/llms-full.txt", title: "llms-full.txt" },
      { rel: "alternate", type: "application/rss+xml", href: "/feed.xml", title: "BTC500 RSS" },
      // NOTE: No fallback canonical here. Emitting one pointing at "/" caused every
      // page to render TWO canonicals (this one + the route's self-canonical), which
      // made Google canonicalize all pages to the homepage. Each page route emits its
      // own self-canonical via generatePageHead/generateArticleHead (including "/"),
      // so a fallback is unnecessary and harmful.
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
      {
        type: "application/ld+json",
        content: JSON.stringify(webAppSchema),
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
  const router = useRouter();
  const pathname = router.state.location.pathname;
  // Embed widgets must be chrome-free for iframe distribution
  const isEmbed = pathname === "/embed" || pathname.startsWith("/embed?");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        {!isEmbed && (
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
          >
            Skip to content
          </a>
        )}
        {!isEmbed && <Nav />}
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <main id="main-content" className="flex-1">
          {!isEmbed && <PageBreadcrumbs pathname={pathname} />}
          <Outlet />
        </main>
        {!isEmbed && <Footer />}
      </div>
    </QueryClientProvider>
  );
}
