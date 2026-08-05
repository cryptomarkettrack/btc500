import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bitcoin,
  Calculator,
  Clock,
  Eye,
  Info,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate, formatUsd } from "@/lib/format";
import type { CycleInfo } from "@/lib/phase";

const DAY = 86_400_000;

interface PhasePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: CycleInfo;
  currentPrice: number | null;
  /** Buy price of the most recent halving cycle (from simulator data). */
  buyPrice: number | null;
  buyDate: string | null;
  sellDate: string | null;
}

type PreviewTab = "today" | "after";

export function PhasePreviewModal({
  open,
  onOpenChange,
  cycle,
  currentPrice,
  buyPrice,
  buyDate,
  sellDate,
}: PhasePreviewModalProps) {
  const [tab, setTab] = useState<PreviewTab>("after");
  const [investment, setInvestment] = useState("10000");

  const investmentAmount = useMemo(() => {
    const n = parseFloat(investment);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [investment]);

  // Simulate being 200 days after the next halving for the "After" preview.
  const afterCycle = useMemo<CycleInfo>(() => {
    const simulatedNow = new Date(cycle.nextHalving.getTime() + 200 * DAY);
    return {
      ...cycle,
      now: simulatedNow,
      phase: "wait-sell",
      daysUntilBuy: 0,
      daysUntilSell: 300,
      daysUntilNextCycleBuy: 800,
      buyProgress: 1,
      sellProgress: 0.4,
    };
  }, [cycle]);

  const isAfter = tab === "after";
  const accent = isAfter ? "var(--success)" : "var(--primary)";
  const accentSoft = isAfter ? "var(--success-soft)" : "var(--primary-soft)";

  // P&L math: if you bought on the last buy date and held through the halving…
  const pnlPercent =
    buyPrice != null && currentPrice != null && buyPrice > 0
      ? (currentPrice - buyPrice) / buyPrice
      : null;
  const pnlAmount =
    pnlPercent != null && investmentAmount > 0 ? investmentAmount * pnlPercent : null;
  const positionValue = pnlAmount != null ? investmentAmount + pnlAmount : null;
  const isProfit = pnlAmount != null && pnlAmount >= 0;

  const primaryDays = isAfter ? afterCycle.daysUntilSell : cycle.daysUntilBuy;
  const primaryLabel = isAfter ? "Days to sell" : "Days to buy";
  const primarySub = isAfter ? "500 days after halving" : "500 days before next halving";
  const phaseLabel = isAfter ? "Hold → sell window" : "Waiting to buy";
  const progressPct = isAfter ? afterCycle.sellProgress * 100 : cycle.buyProgress * 100;

  const colorSwatches = isAfter
    ? [
        {
          name: "Hold / Sell window",
          color: "var(--success)",
          desc: "Green = you're holding a position after halving. Countdown tracks days until the sell window.",
        },
        {
          name: "Profit",
          color: "var(--success)",
          desc: "P&L in the green when your position is up.",
        },
        {
          name: "Loss",
          color: "var(--destructive)",
          desc: "P&L flips red if price falls below your buy price.",
        },
      ]
    : [
        {
          name: "Waiting to buy",
          color: "var(--primary)",
          desc: "Orange = pre-halving. Countdown tracks days until the buy window opens.",
        },
        {
          name: "Buy signal",
          color: "var(--primary)",
          desc: "The buy marker stays orange through the countdown phase.",
        },
        {
          name: "Post-halving",
          color: "var(--success)",
          desc: "Colors switch to green after halving when you're holding.",
        },
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-y-auto rounded-3xl border-border/60 p-0 sm:rounded-3xl">
        {/* ===== Header ===== */}
        <DialogHeader className="border-b border-border/50 px-6 py-5 text-center sm:px-8">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Homepage preview
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            After the Buy Window
          </DialogTitle>
          <DialogDescription className="mx-auto max-w-xl text-sm leading-relaxed">
            See exactly how the homepage transforms once the 500-days-before-halving day passes —
            colors, countdown, and how your P&L gets tracked.
          </DialogDescription>
        </DialogHeader>

        {/* ===== Phase toggle ===== */}
        <div className="flex justify-center px-6 pt-5">
          <div className="inline-flex rounded-full border border-border/60 bg-muted/50 p-1">
            <TabButton
              active={!isAfter}
              onClick={() => setTab("today")}
              color="var(--primary)"
              soft="var(--primary-soft)"
              label="Today"
              sub="Waiting to buy"
            />
            <TabButton
              active={isAfter}
              onClick={() => setTab("after")}
              color="var(--success)"
              soft="var(--success-soft)"
              label="After halving"
              sub="Hold → sell window"
            />
          </div>
        </div>

        {/* ===== Preview card ===== */}
        <div className="px-4 py-5 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
            >
              <div
                className="pointer-events-none absolute left-0 top-0 bottom-0 w-1.5"
                style={{ background: accent }}
              />

              {/* Preview header strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-3.5 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: accentSoft }}
                  >
                    <Activity className="h-3.5 w-3.5" style={{ color: accent }} />
                  </span>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Cycle command center
                    </div>
                    <div className="text-xs font-semibold sm:text-sm">{phaseLabel}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: accentSoft, color: accent }}
                  >
                    {statusPill(isAfter)}
                  </span>
                  {currentPrice != null && (
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold">
                      BTC {formatUsd(currentPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Left: countdown */}
                <div className="border-b border-border/50 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                  <div className="mb-4 flex items-center gap-2.5">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ background: accentSoft }}
                    >
                      <Clock className="h-4 w-4" style={{ color: accent }} />
                    </span>
                    <div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: accent }}
                      >
                        {primaryLabel}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{primarySub}</div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-6xl font-bold leading-[0.9] tracking-tighter sm:text-7xl"
                      style={{ color: accent }}
                    >
                      {primaryDays.toLocaleString()}
                    </span>
                    <span className="pb-1 text-base font-medium text-muted-foreground">days</span>
                  </div>

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%`, background: accent }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <MiniPreviewStat
                      icon={CalendarIcon}
                      label="Next halving"
                      value={formatDate(cycle.nextHalving)}
                    />
                    <MiniPreviewStat
                      icon={Target}
                      label="Buy date"
                      value={formatDate(cycle.buyDate)}
                      dim={isAfter}
                    />
                    <MiniPreviewStat
                      icon={Shield}
                      label="Sell date"
                      value={formatDate(cycle.sellDate)}
                      highlight={isAfter}
                      accent={accent}
                    />
                  </div>
                </div>

                {/* Right: P&L or score */}
                <div className="p-5 sm:p-6">
                  {isAfter ? (
                    <PnlPanel
                      buyPrice={buyPrice}
                      buyDate={buyDate}
                      sellDate={sellDate}
                      currentPrice={currentPrice}
                      investmentAmount={investmentAmount}
                      investment={investment}
                      onInvestmentChange={setInvestment}
                      pnlPercent={pnlPercent}
                      pnlAmount={pnlAmount}
                      positionValue={positionValue}
                      isProfit={isProfit}
                      accent={accent}
                      accentSoft={accentSoft}
                    />
                  ) : (
                    <TodayPanel accent="var(--primary)" accentSoft="var(--primary-soft)" />
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ===== Color change explainer ===== */}
        <div className="px-6 pb-2 sm:px-8">
          <div className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-3.5">
            <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <Info className="h-3 w-3" />
              How colors change
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {colorSwatches.map((s) => (
                <div key={s.name} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  <div>
                    <div className="text-[11px] font-semibold">{s.name}</div>
                    <div className="text-[10px] leading-relaxed text-muted-foreground">
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Footer CTA ===== */}
        <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-3 sm:flex-row sm:justify-between sm:px-8">
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground sm:text-left">
            Preview uses the last cycle's buy price and today's live BTC price. Past performance
            does not guarantee future results.
          </p>
          <Link
            to="/simulator"
            onClick={() => onOpenChange(false)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <Calculator className="h-3.5 w-3.5" />
            Try the Simulator
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============ helpers ============ */

function statusPill(isAfter: boolean): string {
  return isAfter ? "Script intact" : "Waiting to buy";
}

function TabButton({
  active,
  onClick,
  color,
  soft,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  soft: string;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-left transition-all ${
        active ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
      style={active ? { background: soft } : undefined}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: active ? color : "var(--muted-foreground)" }}
      />
      <span>
        <span className="block text-xs font-bold" style={active ? { color } : undefined}>
          {label}
        </span>
        <span className="block text-[10px] leading-tight">{sub}</span>
      </span>
    </button>
  );
}

function MiniPreviewStat({
  icon: Icon,
  label,
  value,
  dim,
  highlight,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  dim?: boolean;
  highlight?: boolean;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-2.5 py-2" style={dim ? { opacity: 0.55 } : undefined}>
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <div
        className="mt-0.5 text-[11px] font-semibold"
        style={highlight ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function PnlPanel({
  buyPrice,
  buyDate,
  sellDate,
  currentPrice,
  investmentAmount,
  investment,
  onInvestmentChange,
  pnlPercent,
  pnlAmount,
  positionValue,
  isProfit,
  accent,
  accentSoft,
}: {
  buyPrice: number | null;
  buyDate: string | null;
  sellDate: string | null;
  currentPrice: number | null;
  investmentAmount: number;
  investment: string;
  onInvestmentChange: (v: string) => void;
  pnlPercent: number | null;
  pnlAmount: number | null;
  positionValue: number | null;
  isProfit: boolean;
  accent: string;
  accentSoft: string;
}) {
  const pnlColor =
    pnlAmount != null
      ? isProfit
        ? "var(--success)"
        : "var(--destructive)"
      : "var(--muted-foreground)";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: accentSoft }}
        >
          <Wallet className="h-4 w-4" style={{ color: accent }} />
        </span>
        <div>
          <div
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            P&L tracking
          </div>
          <div className="text-[11px] text-muted-foreground">Your position after halving</div>
        </div>
      </div>

      {/* Investment input */}
      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Bitcoin className="h-3 w-3" />
        Investment per cycle
      </label>
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          min="1"
          step="100"
          value={investment}
          onChange={(e) => onInvestmentChange(e.target.value)}
          className="h-9 rounded-xl border-border/60 bg-background/60 pl-7 text-sm font-bold"
        />
      </div>

      {/* Position summary */}
      <div className="space-y-1.5 rounded-2xl p-3" style={{ background: accentSoft }}>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Bought @</span>
          <span className="font-semibold">{buyPrice != null ? formatUsd(buyPrice) : "—"}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">BTC now</span>
          <span className="font-semibold">
            {currentPrice != null ? formatUsd(currentPrice) : "—"}
          </span>
        </div>
        {buyDate && (
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Bought on</span>
            <span className="font-semibold">{buyDate}</span>
          </div>
        )}
        <div className="my-1.5 border-t border-border/40" />
        <div className="flex items-end justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground">Current P&L</span>
          <div className="text-right">
            <div className="text-xl font-bold leading-none" style={{ color: pnlColor }}>
              {pnlAmount != null ? `${isProfit ? "+" : "−"}${formatUsd(Math.abs(pnlAmount))}` : "—"}
            </div>
            <div className="mt-0.5 text-[11px] font-bold" style={{ color: pnlColor }}>
              {pnlPercent != null
                ? `${pnlPercent >= 0 ? "+" : ""}${(pnlPercent * 100).toFixed(0)}%`
                : "—"}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Position value</span>
          <span className="font-semibold">
            {positionValue != null ? formatUsd(positionValue) : "—"}
          </span>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-3 space-y-1.5 text-[10px] leading-relaxed text-muted-foreground">
        <p className="flex items-start gap-1.5">
          {pnlPercent != null ? (
            isProfit ? (
              <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-success" />
            ) : (
              <TrendingDown className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
            )
          ) : (
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
          )}
          <span>
            {pnlPercent != null
              ? `Your investment grew ${(pnlPercent * 100).toFixed(0)}% from the buy date to today. Green = profit, red = loss.`
              : "Buy price data unavailable — open the Simulator to see historical prices."}
          </span>
        </p>
        <p className="flex items-start gap-1.5">
          <Target className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          <span>
            The countdown now tracks{" "}
            <span className="font-semibold text-foreground/90">days until the sell window</span>
            {sellDate ? ` (${sellDate})` : ""} — same 500-day rule, flipped to the exit side.
          </span>
        </p>
      </div>
    </div>
  );
}

function TodayPanel({ accent, accentSoft }: { accent: string; accentSoft: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: accentSoft }}
        >
          <Activity className="h-4 w-4" style={{ color: accent }} />
        </span>
        <div>
          <div
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            Cycle score
          </div>
          <div className="text-[11px] text-muted-foreground">How the score looks today</div>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="text-5xl font-bold tracking-tighter" style={{ color: accent }}>
          78
        </div>
        <div className="pb-1">
          <div className="text-[10px] text-muted-foreground">/ 100</div>
          <div className="text-sm font-semibold" style={{ color: accent }}>
            Script intact
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Price and phase are tracking the historical playbook. The countdown keeps you patient until
        the buy signal fires.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <ScoreMeter label="Price path" value={82} color="var(--primary)" />
        <ScoreMeter label="Drawdown" value={74} color="var(--info)" />
        <ScoreMeter label="Phase" value={88} color="var(--success)" />
        <ScoreMeter label="On-chain" value={68} color="var(--muted-foreground)" />
      </div>

      <div className="mt-3 rounded-xl border border-border/40 bg-background/60 px-3 py-2">
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Next action
        </div>
        <p className="mt-0.5 text-[11px] font-medium leading-snug">
          Do nothing. Wait for the BTC500 buy signal.
        </p>
      </div>

      <div className="mt-3 space-y-1 text-[10px] leading-relaxed text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            Today everything is <span style={{ color: accent, fontWeight: 700 }}>orange</span> — the
            pre-halving waiting color. No P&L shown because you haven't bought yet.
          </span>
        </p>
      </div>
    </div>
  );
}

function ScoreMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/60 px-2.5 py-2">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}
