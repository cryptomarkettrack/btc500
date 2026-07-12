import { Link, useRouter } from "@tanstack/react-router";
import { Calculator, Home } from "lucide-react";
import { BtcLogo } from "@/components/BtcLogo";

export function Nav() {
  const router = useRouter();
  const pathname = router.state.location.pathname;

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/simulator", label: "Simulator", icon: Calculator },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo / brand */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <BtcLogo size={28} />
          <span className="text-sm font-bold tracking-tight">BTC500</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
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
      </div>
    </nav>
  );
}
