import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toCanvas } from "html-to-image";
import {
  ArrowRight,
  Bitcoin,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  Copy,
  Download,
  LineChart,
  Link2,
  Loader2,
  Repeat2,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackCta, trackToolUsed } from "@/lib/analytics";
import { formatBtc, formatCompactUsd, formatIsoDay, formatMultiple, formatUsd } from "@/lib/format";
import { simulatorQuery } from "@/lib/queries";
import { SIMULATOR_FAQ } from "@/lib/simulator-faq";
import {
  AMOUNT_PRESETS,
  SLIDER_MAX,
  SLIDER_MIN,
  amountToSlider,
  averageCycleMultiple,
  buyAndHold,
  parseAmount,
  resolveSimulatorSearch,
  runSimulator,
  shareText,
  shareUrl,
  sliderToAmount,
  startingYearOutcomes,
  type CapitalMode,
  type HoldComparison,
  type ResolvedSimulatorSearch,
  type SimulatorRun,
  type SimulatorSearch,
  type StartYear,
} from "@/lib/simulator-math";
import type { DataLoadStatus } from "@/lib/data-status";
import { SITE_URL } from "@/lib/site";
import { SimulatorShareCard } from "@/components/simulator/SimulatorShareCard";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function LoadStatusBanner({
  status,
  missingCount,
}: {
  status?: DataLoadStatus;
  missingCount: number;
}) {
  if (status === "unavailable" || status === "error") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border/60 bg-card px-5 py-4 text-center text-sm text-muted-foreground"
      >
        Historical data could not be loaded. This is not an empty backtest — cycle prices are
        unavailable.
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border/60 bg-card px-5 py-4 text-center text-sm text-muted-foreground"
      >
        Some historical prices are missing{missingCount > 0 ? ` (${missingCount} dates)` : ""}.
        Available cycle results are shown; missing values are not filled in.
      </div>
    );
  }
  return null;
}

interface Props {
  search: SimulatorSearch;
  onChange: (patch: Partial<ResolvedSimulatorSearch>) => void;
}

export function SimulatorPage({ search, onChange }: Props) {
  const { data } = useSuspenseQuery(simulatorQuery);
  const resolved = resolveSimulatorSearch(search);
  const [draft, setDraft] = useState(String(resolved.amount));
  const [focused, setFocused] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused) setDraft(resolved.amount.toLocaleString("en-US"));
  }, [resolved.amount, focused]);

  useEffect(() => {
    trackToolUsed("simulator", {
      amount: resolved.amount,
      mode: resolved.mode,
      from: resolved.from,
    });
  }, [resolved.amount, resolved.mode, resolved.from]);

  const compoundRun = useMemo(
    () => runSimulator(data.cycles, resolved.amount, "compound", resolved.from),
    [data.cycles, resolved.amount, resolved.from],
  );
  const repeatRun = useMemo(
    () => runSimulator(data.cycles, resolved.amount, "repeat", resolved.from),
    [data.cycles, resolved.amount, resolved.from],
  );
  const hold = useMemo(
    () => buyAndHold(data.cycles, resolved.amount, resolved.from),
    [data.cycles, resolved.amount, resolved.from],
  );
  const run = resolved.mode === "compound" ? compoundRun : repeatRun;
  const yearOutcomes = useMemo(
    () => startingYearOutcomes(data.cycles, resolved.amount, resolved.mode),
    [data.cycles, resolved.amount, resolved.mode],
  );
  const avgMultiple = useMemo(() => averageCycleMultiple(data.cycles), [data.cycles]);

  const commitAmount = useCallback(
    (raw: string | number) => {
      const parsed = parseAmount(raw);
      if (parsed === null) {
        setDraft(resolved.amount.toLocaleString("en-US"));
        return;
      }
      onChange({ amount: Math.round(parsed) });
    },
    [onChange, resolved.amount],
  );

  const resultUrl = typeof window !== "undefined" ? shareUrl(window.location.origin, resolved) : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="flex flex-col gap-8">
          <Header amount={resolved.amount} />
          <LoadStatusBanner status={data.status} missingCount={data.missingDates?.length ?? 0} />
          <Controls
            search={resolved}
            draft={draft}
            focused={focused}
            yearOutcomes={yearOutcomes}
            onDraft={setDraft}
            onFocus={setFocused}
            onCommitAmount={commitAmount}
            onChange={onChange}
          />
          <HeroResult run={run} />
          <CompareStrip
            amount={resolved.amount}
            mode={resolved.mode}
            compound={compoundRun}
            repeat={repeatRun}
            hold={hold}
            onSelectMode={(mode) => onChange({ mode })}
          />
          <WealthPath run={run} />
          <CycleGrid run={run} />
          <WhatItBought run={run} avgMultiple={avgMultiple} />
          <WhyItLooksLikeThis run={compoundRun} yearOutcomes={yearOutcomes} onChange={onChange} />
          <ShareBar run={run} url={resultUrl} captureRef={shareRef} />
          <Explainer />
          <Faq />
          <RelatedTools />
          <p className="text-center text-xs text-muted-foreground">
            Historical prices from the on-site daily archive (CoinGecko from 2013, blockchain.info
            market price for the 2012-cycle dates before that). Fees, taxes, and slippage are not
            included. Past performance does not guarantee future results. The BTC
            <span className="text-primary">500</span> strategy is a hypothetical backtest — not
            financial advice.
          </p>
        </div>
      </main>

      <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }}>
        <SimulatorShareCard ref={shareRef} run={run} />
      </div>
    </div>
  );
}

function Header({ amount }: { amount: number }) {
  return (
    <header className="mb-2 text-center">
      <div className="flex items-center justify-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bitcoin Halving Simulator</h1>
      </div>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        500-day cycle · BTC<span className="text-primary">500</span>
      </p>
      <p className="lead mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        What would {formatUsd(amount)} have become if invested 500 days before a Bitcoin halving?
        The same question works for $500, $1,000, or any other amount. One rule: buy at T-500, sell
        at T+500.
      </p>
    </header>
  );
}

function Controls({
  search,
  draft,
  focused,
  yearOutcomes,
  onDraft,
  onFocus,
  onCommitAmount,
  onChange,
}: {
  search: ResolvedSimulatorSearch;
  draft: string;
  focused: boolean;
  yearOutcomes: Array<{ year: StartYear; run: SimulatorRun }>;
  onDraft: (v: string) => void;
  onFocus: (v: boolean) => void;
  onCommitAmount: (raw: string | number) => void;
  onChange: (patch: Partial<ResolvedSimulatorSearch>) => void;
}) {
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-[32px] border border-border/60 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)] sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <label
            htmlFor="sim-amount"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Starting amount
          </label>
          <div className="relative mt-3">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
              $
            </span>
            <input
              id="sim-amount"
              inputMode="decimal"
              value={focused ? draft.replace(/,/g, "") : draft}
              onFocus={() => {
                onFocus(true);
                onDraft(String(search.amount));
              }}
              onBlur={() => {
                onFocus(false);
                onCommitAmount(draft);
              }}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="h-16 w-full rounded-2xl border border-border/60 bg-background pl-12 pr-4 text-3xl font-bold tracking-tight outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Slider
            className="mt-6"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={0.001}
            value={[amountToSlider(search.amount)]}
            onValueChange={([v]) => onChange({ amount: sliderToAmount(v ?? SLIDER_MIN) })}
            aria-label="Starting amount"
          />
          <div className="mt-2 flex justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span>$1K</span>
            <span>$1M</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ amount: preset })}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-95",
                  search.amount === preset
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {formatPreset(preset)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Capital
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ModeButton
                active={search.mode === "compound"}
                title="Reinvest"
                subtitle="Roll every exit into the next buy"
                onClick={() => onChange({ mode: "compound" })}
              />
              <ModeButton
                active={search.mode === "repeat"}
                title="Same $ each cycle"
                subtitle="Fresh stake, take profits each time"
                onClick={() => onChange({ mode: "repeat" })}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              First cycle
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {yearOutcomes.map(({ year, run }) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => onChange({ from: year })}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-left transition-all active:scale-[0.98]",
                    search.from === year
                      ? "border-primary/50 bg-primary-soft"
                      : "border-border/60 hover:border-primary/30",
                  )}
                >
                  <div className="text-sm font-bold">{year}</div>
                  <div
                    className={cn(
                      "mt-0.5 text-xs font-semibold",
                      run.finalValue !== null ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {run.finalValue !== null ? formatCompactUsd(run.finalValue) : "—"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ModeButton({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.98]",
        active ? "border-primary/50 bg-primary-soft" : "border-border/60 hover:border-primary/30",
      )}
    >
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-xs leading-snug text-muted-foreground">{subtitle}</div>
    </button>
  );
}

function HeroResult({ run }: { run: SimulatorRun }) {
  const positive = (run.totalProfit ?? 0) >= 0;
  const showFull = run.finalValue !== null && run.finalValue >= 1_000_000;

  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
      className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-20px_rgba(0,0,0,0.08)] sm:p-12"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {run.mode === "compound" ? "Reinvested through every window" : "Same amount in each window"}{" "}
        · from {run.startYear}
      </div>
      <div
        className={cn(
          "mt-4 text-5xl font-bold tracking-tighter sm:text-7xl",
          positive ? "text-success" : "text-destructive",
        )}
      >
        {run.finalValue !== null ? (
          <CountUp
            value={run.finalValue}
            format={(n) => (n >= 1_000_000 ? formatCompactUsd(Math.max(0, n)) : formatUsd(n))}
          />
        ) : (
          "—"
        )}
      </div>
      {showFull && (
        <div className="mt-2 text-sm text-muted-foreground">{formatUsd(run.finalValue!)}</div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          from <span className="font-semibold text-foreground">{formatUsd(run.startAmount)}</span>
        </span>
        {run.blendedMultiple !== null && (
          <span>
            <span className={cn("font-semibold", positive ? "text-success" : "text-destructive")}>
              {formatMultiple(run.blendedMultiple)}
            </span>{" "}
            on capital in
          </span>
        )}
        {run.totalProfit !== null && (
          <span className="inline-flex items-center gap-1">
            {positive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={cn("font-semibold", positive ? "text-success" : "text-destructive")}>
              {positive ? "+" : ""}
              {formatUsd(run.totalProfit)}
            </span>
          </span>
        )}
      </div>
      <p className="mx-auto mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground">
        {run.completedCount} completed cycle{run.completedCount === 1 ? "" : "s"} ·{" "}
        {formatUsd(run.totalInvested)} put in
        {run.mode === "compound"
          ? " once, then left in the rule"
          : ` across ${run.completedCount} separate windows`}
        . Hypothetical backtest. Not financial advice.
      </p>
    </motion.section>
  );
}

function CompareStrip({
  amount,
  mode,
  compound,
  repeat,
  hold,
  onSelectMode,
}: {
  amount: number;
  mode: CapitalMode;
  compound: SimulatorRun;
  repeat: SimulatorRun;
  hold: HoldComparison | null;
  onSelectMode: (mode: CapitalMode) => void;
}) {
  const holdValue = hold?.endValue ?? null;
  const values = [compound.finalValue, repeat.finalValue, holdValue].filter(
    (n): n is number => n !== null,
  );
  const best = values.length ? Math.max(...values) : null;

  return (
    <section>
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Three ways to run the same cash
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {formatUsd(amount)} from {compound.startYear}. Reinvest is one stake rolling forward. Same
          $ each cycle is a fresh deposit every window. Buy-and-hold never sells until the last exit
          date.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <CompareCard
          label="Reinvest"
          hint="One stake, every cycle"
          value={compound.finalValue}
          multiple={compound.blendedMultiple}
          active={mode === "compound"}
          winner={best !== null && compound.finalValue === best}
          onClick={() => onSelectMode("compound")}
        />
        <CompareCard
          label="Same $ each cycle"
          hint={`${formatUsd(amount)} × ${repeat.completedCount} windows`}
          value={repeat.finalValue}
          multiple={repeat.blendedMultiple}
          active={mode === "repeat"}
          winner={best !== null && repeat.finalValue === best}
          onClick={() => onSelectMode("repeat")}
        />
        <div
          className={cn(
            "rounded-[24px] border p-5",
            best !== null && holdValue === best
              ? "border-success/40 bg-success/5"
              : "border-border/60 bg-card",
          )}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Buy & hold
          </div>
          <div className="mt-1 text-sm font-semibold">Never sold until the last date</div>
          <div className="mt-3 text-2xl font-bold tracking-tight">
            {hold ? formatCompactUsd(hold.endValue) : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {hold
              ? `${formatMultiple(hold.multiple)} · ${formatIsoDay(hold.buyDate)} → ${formatIsoDay(hold.sellDate)}`
              : "Need a completed window"}
          </div>
          {best !== null && holdValue === best && (
            <div className="mt-3 text-xs font-semibold text-success">Highest of the three</div>
          )}
        </div>
      </div>
    </section>
  );
}

function CompareCard({
  label,
  hint,
  value,
  multiple,
  active,
  winner,
  onClick,
}: {
  label: string;
  hint: string;
  value: number | null;
  multiple: number | null;
  active: boolean;
  winner: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[24px] border p-5 text-left transition-all active:scale-[0.99]",
        active
          ? "border-primary/50 bg-primary-soft"
          : "border-border/60 bg-card hover:border-primary/30",
        winner && !active && "border-success/40 bg-success/5",
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{hint}</div>
      <div className="mt-3 text-2xl font-bold tracking-tight">
        {value !== null ? formatCompactUsd(value) : "—"}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {multiple !== null ? formatMultiple(multiple) : ""}
        {active ? " · your result" : ""}
      </div>
      {winner && (
        <div className="mt-3 text-xs font-semibold text-success">Highest of the three</div>
      )}
    </button>
  );
}

function WealthPath({ run }: { run: SimulatorRun }) {
  const steps = run.cycles.filter((c) => c.complete);
  if (steps.length === 0) return null;
  const maxEnd = Math.max(...steps.map((s) => s.endCapital ?? 0), run.startAmount);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {run.mode === "compound" ? "How the stack grew" : "Each window on its own"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {run.mode === "compound"
            ? "Every sell becomes the next buy. The line is cash sitting between windows — historically that meant missing some upside and skipping two bear markets."
            : "Same starting cash in every completed window. Profits are not carried forward."}
        </p>
      </div>
      <div className="rounded-[24px] border border-border/60 bg-card p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Start
            </div>
            <div className="text-lg font-bold">{formatUsd(run.startAmount)}</div>
          </div>
          {run.finalValue !== null && (
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                End
              </div>
              <div className="text-lg font-bold text-success">{formatUsd(run.finalValue)}</div>
            </div>
          )}
        </div>
        <ol className="space-y-5">
          {steps.map((step) => {
            const width =
              step.endCapital !== null && maxEnd > 0
                ? Math.max(8, (step.endCapital / maxEnd) * 100)
                : 8;
            return (
              <li key={step.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-semibold">{step.label}</div>
                  <div className="text-sm font-bold text-success">
                    {step.endCapital !== null ? formatUsd(step.endCapital) : "—"}
                    {step.returnMultiplier !== null && (
                      <span className="ml-2 text-xs font-semibold text-muted-foreground">
                        {formatMultiple(step.returnMultiplier)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${width}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  {formatUsd(step.startCapital)} in · {formatIsoDay(step.buyDate)} →{" "}
                  {formatIsoDay(step.sellDate)}
                  {step.btcBought !== null && ` · ${formatBtc(step.btcBought)}`}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function CycleGrid({ run }: { run: SimulatorRun }) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Every selected window</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Buy date is 500 days before the halving. Sell date is 500 days after. About 1,000 days in
        the trade, then cash until the next buy if you are reinvesting.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {run.cycles.map((cycle, i) => (
          <motion.article
            key={cycle.label}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.06 * i, ease: EASE }}
            className="rounded-[24px] border border-border/60 bg-card p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">{cycle.label}</h3>
              </div>
              {cycle.returnPercent !== null ? (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    cycle.returnPercent >= 0
                      ? "bg-success-soft text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {cycle.returnPercent >= 0 ? "+" : ""}
                  {cycle.returnPercent.toFixed(0)}%
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Incomplete
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-muted/60 px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  T-500
                </div>
                <div className="mt-1 text-sm font-semibold">{formatIsoDay(cycle.buyDate)}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {cycle.buyPrice !== null
                    ? `BTC @ ${formatUsd(cycle.buyPrice)}`
                    : "Price unavailable"}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/60 px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Halving
                </div>
                <div className="mt-1 text-sm font-semibold">{formatIsoDay(cycle.halvingDate)}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {cycle.halvingPrice !== null
                    ? `BTC @ ${formatUsd(cycle.halvingPrice)}`
                    : "Price unavailable"}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/60 px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  T+500
                </div>
                <div className="mt-1 text-sm font-semibold">{formatIsoDay(cycle.sellDate)}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {cycle.sellPrice !== null
                    ? `BTC @ ${formatUsd(cycle.sellPrice)}`
                    : "Price unavailable"}
                </div>
              </div>
            </div>

            {cycle.complete && cycle.profit !== null && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Stack
                  </div>
                  <div className="mt-1 font-semibold">
                    {cycle.btcBought !== null ? formatBtc(cycle.btcBought) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Annualized
                  </div>
                  <div className="mt-1 font-semibold">
                    {cycle.annualized !== null
                      ? `${cycle.annualized >= 0 ? "+" : ""}${(cycle.annualized * 100).toFixed(0)}% / yr`
                      : "—"}
                  </div>
                </div>
              </div>
            )}

            {cycle.complete && cycle.profit !== null && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {formatUsd(cycle.startCapital)} →{" "}
                  <span className="font-semibold text-foreground">
                    {cycle.endCapital !== null ? formatUsd(cycle.endCapital) : "—"}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    cycle.profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {cycle.profit >= 0 ? "+" : ""}
                  {formatUsd(cycle.profit)}
                </span>
              </div>
            )}

            {!cycle.complete && (
              <p className="mt-4 text-xs text-muted-foreground">
                This window is excluded from totals until both a buy and sell price exist.
                {cycle.year === 2012
                  ? " The 2012 buy date is in July 2011, before most exchange feeds."
                  : ""}
              </p>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function WhatItBought({ run, avgMultiple }: { run: SimulatorRun; avgMultiple: number | null }) {
  const rows = run.cycles.filter((c) => c.complete && c.btcBought !== null && c.buyPrice !== null);
  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What this amount bought</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Same dollars, very different stacks. Later cycles start at a higher Bitcoin price, so the
        same cash buys fewer coins — which is why the 2012 window dominates a reinvested result.
      </p>
      <div className="mt-6 overflow-hidden rounded-[24px] border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Cycle</th>
                <th className="px-5 py-3">Buy price</th>
                <th className="px-5 py-3">Coins bought</th>
                <th className="px-5 py-3">Sell price</th>
                <th className="px-5 py-3 text-right">Exit value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3.5 font-semibold">{row.label}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {row.buyPrice !== null ? formatUsd(row.buyPrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {row.btcBought !== null ? formatBtc(row.btcBought) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {row.sellPrice !== null ? formatUsd(row.sellPrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-success">
                    {row.endCapital !== null ? formatUsd(row.endCapital) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {avgMultiple !== null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Average completed-cycle multiple across all history on this site:{" "}
          <span className="font-semibold text-foreground">{formatMultiple(avgMultiple)}</span>.
          Later cycles sit below that average. That is a fact about the past, not a forecast.
        </p>
      )}
    </section>
  );
}

function WhyItLooksLikeThis({
  run,
  yearOutcomes,
  onChange,
}: {
  run: SimulatorRun;
  yearOutcomes: Array<{ year: StartYear; run: SimulatorRun }>;
  onChange: (patch: Partial<ResolvedSimulatorSearch>) => void;
}) {
  const from2012 = yearOutcomes.find((y) => y.year === 2012)?.run;
  const from2016 = yearOutcomes.find((y) => y.year === 2016)?.run;
  const drop =
    from2012?.finalValue && from2016?.finalValue && from2012.finalValue > 0
      ? 1 - from2016.finalValue / from2012.finalValue
      : null;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[24px] border border-border/60 bg-card p-6">
        <h2 className="text-lg font-bold">Most of a 2012 reinvest is the first window</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Early Bitcoin produced the largest multiple. Skip 2012 and the same rule is still
          profitable in later windows — the dollar result just is not in the same league.
          {drop !== null && (
            <>
              {" "}
              Starting in 2016 instead of 2012 cuts this reinvested result by roughly{" "}
              <span className="font-semibold text-foreground">{Math.round(drop * 100)}%</span>.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => onChange({ from: run.startYear === 2012 ? 2016 : 2012, mode: "compound" })}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        >
          {run.startYear === 2012 ? "Start in 2016 instead" : "Put 2012 back in"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-[24px] border border-border/60 bg-card p-6">
        <h2 className="text-lg font-bold">Cash between cycles is the point of the rule</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          After each sell date you are out until the next buy date. That historically covered the
          2018 and 2022 drawdowns. It also means you do not own the coins in those gaps. Compare
          reinvest against buy-and-hold above if that tradeoff is the question you actually have.
        </p>
        <Link
          to="/bitcoin-500-day-cycle"
          onClick={() => trackCta("simulator_why", "/bitcoin-500-day-cycle")}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Read the 500-day cycle explainer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ShareBar({
  run,
  url,
  captureRef,
}: {
  run: SimulatorRun;
  url: string;
  captureRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [busy, setBusy] = useState(false);
  const text = shareText(run, url || `${SITE_URL}/simulator`);

  const copy = async (kind: "text" | "link") => {
    const value = kind === "text" ? text : url || window.location.href;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const download = async () => {
    const el = captureRef.current;
    if (!el) return;
    setBusy(true);
    try {
      const canvas = await toCanvas(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `btc500-simulator-${run.startYear}-${Math.round(run.startAmount)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setBusy(false);
    }
  };

  const tweet = () => {
    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("text", text);
    window.open(intent.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="rounded-[24px] border border-border/60 bg-card p-6 text-center sm:p-8">
      <h2 className="text-xl font-bold">Share this backtest</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
        The link keeps your amount, start year, and reinvest setting. The image is a snapshot of the
        path.
      </p>
      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:flex-wrap">
        <button
          type="button"
          onClick={() => copy("text")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 sm:w-auto"
        >
          {copied === "text" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === "text" ? "Copied results" : "Copy results"}
        </button>
        <button
          type="button"
          onClick={() => copy("link")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-5 py-3 text-sm font-medium transition hover:bg-muted sm:w-auto"
        >
          {copied === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={tweet}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-5 py-3 text-sm font-medium transition hover:bg-muted sm:w-auto"
        >
          <Share2 className="h-4 w-4" />
          Share on X
        </button>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-5 py-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50 sm:w-auto"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download card
        </button>
      </div>
    </section>
  );
}

function Explainer() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        How the Bitcoin halving simulator works
      </h2>
      <p>
        This tool answers one question: what would $500, $1,000, or another amount have become if it
        was invested 500 days before a Bitcoin halving and sold 500 days after? That window is the{" "}
        <Link to="/bitcoin-500-day-cycle" className="font-semibold text-primary hover:underline">
          Bitcoin 500-day cycle
        </Link>
        . The numbers are the same daily prices used across BTC500 — not illustrations.
      </p>
      <h3 className="text-lg font-semibold text-foreground">The T-500 methodology</h3>
      <p>
        T-500 is the calendar day 500 days before a known or estimated halving. T+500 is 500 days
        after it. The simulator buys at the T-500 daily price and sells at the T+500 daily price
        when both exist. The price on the halving date is shown so you can see how much of the
        window happened before the event versus after it.
      </p>
      <h3 className="text-lg font-semibold text-foreground">What the numbers represent</h3>
      <p>
        Reinvest answers “what if I started with this much and never took money out of the rule?”
        Same amount each cycle answers “what if I put this much to work in every window and pulled
        the result?” Buy-and-hold answers “what if I bought on the first buy date and sat until the
        last sell date?” A completed window needs both a buy print and a sell print. Incomplete
        windows stay out of the totals.
      </p>
      <h3 className="text-lg font-semibold text-foreground">Limitations</h3>
      <p>
        Fees, taxes, and slippage are not included. Early-cycle prices depend on thin markets. Four
        halvings is a small sample, and later windows produced smaller multiples. A backtest cannot
        predict the next cycle. Treat this as a research tool, not financial advice.
      </p>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="sim-faq-heading">
      <div className="mb-6 text-center">
        <h2 id="sim-faq-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Simulator questions
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          How the two modes work, why 2012 dominates, and what this page does not claim.
        </p>
      </div>
      <div className="mx-auto max-w-3xl space-y-3">
        {SIMULATOR_FAQ.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-border/60 bg-card open:shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
              <h3 className="flex-1 text-sm font-semibold text-foreground sm:text-base">
                {item.question}
              </h3>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function RelatedTools() {
  return (
    <section>
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">Keep going</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
        Compare entries, replay prices, or read the rule. Same dates, different jobs.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RelatedCard
          to="/bitcoin-500-day-cycle"
          icon={BookOpen}
          title="500-day cycle"
          body="How T-500 and T+500 are defined, with every historical window."
        />
        <RelatedCard
          to="/timeline"
          icon={LineChart}
          title="Time machine"
          body="Replay any day in the cycle instead of just the two endpoints."
        />
        <RelatedCard
          to="/articles/btc500-strategy"
          icon={BookOpen}
          title="The strategy"
          body="When the rule buys, when it sells, and what it does not claim."
        />
        <RelatedCard
          to="/dca"
          icon={Repeat2}
          title="DCA vs lump sum"
          body="See if spreading the buy around the same dates beat going all-in."
        />
      </div>
    </section>
  );
}

function RelatedCard({
  to,
  icon: Icon,
  title,
  body,
}: {
  to:
    | "/dca"
    | "/timeline"
    | "/halving-dates"
    | "/articles/btc500-strategy"
    | "/bitcoin-500-day-cycle";
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => trackCta("simulator_related", to)}
      className="rounded-[24px] border border-border/60 bg-card p-5 transition-all hover:border-primary/40 active:scale-[0.99]"
    >
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "var(--primary-soft)" }}
      >
        <Icon className="h-5 w-5 text-primary" />
      </span>
      <div className="mt-3 font-bold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}

function formatPreset(n: number): string {
  if (n >= 1_000_000) return "$1M";
  if (n >= 1_000 && n % 1_000 === 0) return `$${n / 1_000}K`;
  return `$${n.toLocaleString("en-US")}`;
}

function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (fromRef.current === value) return;
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    const duration = 800;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span>{format(display)}</span>;
}
