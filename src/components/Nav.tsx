import { Link, useRouter } from "@tanstack/react-router";
import {
  Calculator,
  Home,
  Clock,
  Menu,
  X,
  BookOpen,
  TrendingUp,
  Flame,
  Newspaper,
  BarChart3,
} from "lucide-react";
import { BtcLogo } from "@/components/BtcLogo";
import { useState } from "react";

export function Nav() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/simulator", label: "Simulator", icon: Calculator },
    { to: "/timeline", label: "Timeline", icon: Clock },
    { to: "/liquidation", label: "Liquidation", icon: Flame },
    { to: "/insider-trading", label: "Insider", icon: TrendingUp },
    { to: "/news", label: "News", icon: Newspaper },
    { to: "/macro-impact", label: "Macro", icon: BarChart3 },
    { to: "/articles", label: "Articles", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo / brand */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <BtcLogo size={28} />
          <span className="text-sm font-bold tracking-tight">
            BTC<span className="text-primary">500</span>
          </span>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav links */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6 py-3">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
