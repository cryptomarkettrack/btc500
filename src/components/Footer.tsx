import {
  Instagram,
  Mail,
  Home,
  Calculator,
  Clock,
  BookOpen,
  Flame,
  TrendingUp,
  Newspaper,
  BarChart3,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
              BTC<span className="text-primary">500</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Bitcoin halving countdown and investment strategy platform. Buy 500 days before
              halving, sell 500 days after.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Tools
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Halving Countdown
                </Link>
              </li>
              <li>
                <Link
                  to="/simulator"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Investment Simulator
                </Link>
              </li>
              <li>
                <Link
                  to="/timeline"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Time Machine
                </Link>
              </li>
              <li>
                <Link
                  to="/liquidation"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Liquidation Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Data */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Data & Insights
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/insider-trading"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Insider Trading
                </Link>
              </li>
              <li>
                <Link
                  to="/macro-impact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Macro Impact (CPI/PPI)
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Crypto News
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Articles & Strategy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Connect
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://www.instagram.com/btc500halving"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a
                href="https://x.com/btc500halving"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Follow on X (Twitter)"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </a>
              <a
                href="mailto:btc500halving@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Send email"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BTC<span className="text-primary">500</span>. All
            rights reserved. Not financial advice. Past performance does not guarantee future
            results.
          </p>
        </div>
      </div>
    </footer>
  );
}
