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
  ArrowLeftRight,
  TrendingDown,
  LayoutTemplate,
  ChevronDown,
  Wrench,
  Library,
  CalendarDays,
} from "lucide-react";
import { BtcLogo } from "@/components/BtcLogo";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  description?: string;
  icon: React.ElementType;
};

const tools: NavItem[] = [
  {
    to: "/halving-dates",
    label: "Halving Dates",
    description: "Full schedule 2012–2028",
    icon: CalendarDays,
  },
  {
    to: "/simulator",
    label: "Simulator",
    description: "Backtest BTC500 returns",
    icon: Calculator,
  },
  {
    to: "/dca",
    label: "DCA vs Lump Sum",
    description: "Compare entry strategies",
    icon: ArrowLeftRight,
  },
  {
    to: "/timeline",
    label: "Timeline",
    description: "Replay past cycles",
    icon: Clock,
  },
  {
    to: "/liquidation",
    label: "Liquidation",
    description: "Leverage & funding heat",
    icon: Flame,
  },
  {
    to: "/bear-market",
    label: "Bear Market",
    description: "On-chain bottom meter",
    icon: TrendingDown,
  },
  {
    to: "/insider-trading",
    label: "Insider Trading",
    description: "Public filings tracker",
    icon: TrendingUp,
  },
];

const research: NavItem[] = [
  {
    to: "/news",
    label: "News",
    description: "Curated crypto headlines",
    icon: Newspaper,
  },
  {
    to: "/articles",
    label: "Articles",
    description: "Strategy & on-chain guides",
    icon: BookOpen,
  },
];

function isPathActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function isGroupActive(pathname: string, items: NavItem[]): boolean {
  return items.some((item) => isPathActive(pathname, item.to));
}

export function Nav() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(true);
  const [mobileResearchOpen, setMobileResearchOpen] = useState(true);

  const toolsActive = isGroupActive(pathname, tools);
  const researchActive = isGroupActive(pathname, research);
  const homeActive = isPathActive(pathname, "/");
  const embedActive = isPathActive(pathname, "/embed-kit");

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobile}
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <BtcLogo size={28} />
          <span className="text-sm font-bold tracking-tight">
            BTC<span className="text-primary">500</span>
          </span>
        </Link>

        {/* Desktop — grouped, no horizontal scroll */}
        <div className="hidden items-center gap-1 md:flex">
          <NavPill to="/" active={homeActive} icon={Home}>
            Home
          </NavPill>

          <NavDropdown
            label="Tools"
            icon={Wrench}
            active={toolsActive}
            items={tools}
            pathname={pathname}
          />

          <NavDropdown
            label="Research"
            icon={Library}
            active={researchActive}
            items={research}
            pathname={pathname}
          />

          <NavPill to="/embed-kit" active={embedActive} icon={LayoutTemplate}>
            Embed
          </NavPill>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sheet — grouped accordion */}
      {isMobileMenuOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            <MobileLink
              to="/"
              label="Home"
              icon={Home}
              active={homeActive}
              onNavigate={closeMobile}
            />

            <MobileGroup
              label="Tools"
              icon={Wrench}
              active={toolsActive}
              open={mobileToolsOpen}
              onToggle={() => setMobileToolsOpen((o) => !o)}
            >
              {tools.map((item) => (
                <MobileLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  active={isPathActive(pathname, item.to)}
                  onNavigate={closeMobile}
                  nested
                />
              ))}
            </MobileGroup>

            <MobileGroup
              label="Research"
              icon={Library}
              active={researchActive}
              open={mobileResearchOpen}
              onToggle={() => setMobileResearchOpen((o) => !o)}
            >
              {research.map((item) => (
                <MobileLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  active={isPathActive(pathname, item.to)}
                  onNavigate={closeMobile}
                  nested
                />
              ))}
            </MobileGroup>

            <MobileLink
              to="/embed-kit"
              label="Embed Kit"
              description="Widgets for blogs & dashboards"
              icon={LayoutTemplate}
              active={embedActive}
              onNavigate={closeMobile}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

function NavPill({
  to,
  active,
  icon: Icon,
  children,
}: {
  to: string;
  active: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

function NavDropdown({
  label,
  icon: Icon,
  active,
  items,
  pathname,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium outline-none transition-all",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-2xl border-border/60 p-2 shadow-lg"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />
        {items.map((item) => {
          const ItemIcon = item.icon;
          const itemActive = isPathActive(pathname, item.to);
          return (
            <DropdownMenuItem
              key={item.to}
              asChild
              className={cn(
                "cursor-pointer rounded-xl px-3 py-2.5 focus:bg-muted",
                itemActive && "bg-primary/10 text-foreground",
              )}
            >
              <Link to={item.to} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    itemActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <ItemIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                  {item.description && (
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileGroup({
  label,
  icon: Icon,
  active,
  open,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors",
          active ? "text-primary" : "text-foreground",
        )}
        aria-expanded={open}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-1 border-t border-border/40 px-2 pb-2 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function MobileLink({
  to,
  label,
  description,
  icon: Icon,
  active,
  onNavigate,
  nested = false,
}: {
  to: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  active: boolean;
  onNavigate: () => void;
  nested?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "inline-flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
        nested && "rounded-xl py-2.5",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", nested && "mt-0.5")} />
      <span className="min-w-0">
        <span className="block font-semibold leading-tight">{label}</span>
        {description && !active && (
          <span className="mt-0.5 block text-xs font-normal leading-snug opacity-80">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}
