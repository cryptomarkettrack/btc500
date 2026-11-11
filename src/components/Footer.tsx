import { Instagram, Mail, Rss } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--panel)]">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
              BTC<span className="text-primary">500</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Bitcoin 500-day cycle tools. Track performance from 500 days before each halving
              through 500 days after.
            </p>
            <p className="font-data mt-4 text-[11px] text-muted-foreground">
              <a href={SITE_URL} className="link-draw" rel="home">
                btc500.net
              </a>
            </p>
          </div>

          {/* Tools */}
          <nav aria-label="Tools">
            <h2 className="font-data mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tools
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Halving Countdown
                </Link>
              </li>
              <li>
                <Link
                  to="/bitcoin-500-day-cycle"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Bitcoin 500-Day Cycle
                </Link>
              </li>
              <li>
                <Link
                  to="/halving-dates"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Halving Dates
                </Link>
              </li>
              <li>
                <Link
                  to="/when-to-sell-bitcoin-after-halving"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  When to Sell Bitcoin
                </Link>
              </li>
              <li>
                <Link
                  to="/simulator"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Investment Simulator
                </Link>
              </li>
              <li>
                <Link
                  to="/dca"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  DCA vs Lump Sum
                </Link>
              </li>
              <li>
                <Link
                  to="/timeline"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Time Machine
                </Link>
              </li>
              <li>
                <Link
                  to="/liquidation"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Liquidation Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/bitcoin-etf"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  ETF Flows
                </Link>
              </li>
              <li>
                <Link
                  to="/embed-kit"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Embed Kit
                </Link>
              </li>
            </ul>
          </nav>

          {/* Data */}
          <nav aria-label="Data and insights">
            <h2 className="font-data mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Data &amp; Insights
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/insider-trading"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Insider Trading
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Crypto News
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Articles &amp; Strategy
                </Link>
              </li>
              <li>
                <Link
                  to="/bitcoin-500-day-cycle"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  500-Day Cycle Explainer
                </Link>
              </li>
              <li>
                <Link
                  to="/articles/btc500-strategy"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  BTC500 Strategy
                </Link>
              </li>
              <li>
                <Link
                  to="/articles/why-btc500-exists"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Why BTC500 Exists
                </Link>
              </li>
              <li>
                <Link
                  to="/articles/rupl"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  NUPL Guide
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h2 className="font-data mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Company
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/about"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  About &amp; methodology
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="link-draw inline-block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="/feed.xml"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Rss className="h-3.5 w-3.5" />
                  RSS
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/btc500halving"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Follow BTC500 on X (Twitter)"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/btc500halving"
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Follow BTC500 on Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:btc500halving@gmail.com"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Email BTC500"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* the wordmark closes the page */}
        <p
          aria-hidden="true"
          className="mt-14 select-none text-center text-[clamp(3rem,13vw,9rem)] leading-none font-semibold tracking-[-0.05em] text-white/[0.04]"
        >
          BTC500
        </p>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BTC<span className="text-primary">500</span>. All
            rights reserved.{" "}
            <Link to="/terms" className="link-draw">
              Not financial advice
            </Link>
            . Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
