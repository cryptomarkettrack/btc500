import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  Database,
  Landmark,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { EtfShareCard } from "@/components/etf/EtfShareCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ETF_FAQ } from "@/lib/etf-faq";
import {
  phaseLabel,
  regimeCopy,
  type AbsorptionRegime,
  type EtfAbsorptionSnapshot,
  type EtfCyclePhase,
  type EnrichedEtfDay,
  type HeatmapCell,
  type HeatmapYear,
} from "@/lib/etf-analysis";
import { formatBtc, formatIsoDay, formatSignedBtc, formatSignedCompactUsd } from "@/lib/format";
import { trackToolUsed } from "@/lib/analytics";

export function EtfAbsorptionDashboard({
  data,
  error,
  isLoading,
  onRefresh,
}: {
  data: EtfAbsorptionSnapshot | null;
  error?: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [tableLimit, setTableLimit] = useState(21);

  useEffect(() => {
    trackToolUsed("bitcoin-etf");
  }, []);

  if (isLoading && !data) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm text-muted-foreground">Loading ETF absorption…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Bitcoin ETF Absorption</h1>
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="font-semibold text-destructive">ETF flow data is unavailable</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "The free flow series could not be loaded. Try again in a minute."}
          </p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Try again
            </button>
          )}
        </div>
      </main>
    );
  }

  const latest = data.latest;
  const etfBtc = latest.netFlowBtc ?? 0;
  const dayCopy = regimeCopy(data.dayRegime);
  const weekCopy = regimeCopy(data.rolling7d.regime);
  const recent = data.days.slice(-14).reverse();
  const tableRows = data.days.slice().reverse().slice(0, tableLimit);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            US spot Bitcoin ETFs
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Did Bitcoin ETFs eat today&apos;s new coins?
          </h1>
          <p className="lead mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            CoinGlass and Farside print dollar inflows. This board converts every session into
            bitcoin, then stacks it against miner issuance and the 500-day cycle. If ETFs took more
            coins than miners created, supply is being squeezed — not just “in the green.”
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Through {formatIsoDay(data.updatedThrough)} · {data.days.length} sessions since launch ·
            not financial advice
          </p>
        </header>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <VacuumCard
            title="Last cash session"
            date={latest.date}
            etfBtc={etfBtc}
            etfUsd={latest.netFlowUsd}
            issuanceBtc={latest.issuanceBtc}
            extraBtc={latest.extraBtc}
            ratio={latest.absorptionRatio}
            regime={data.dayRegime}
            copy={dayCopy.headline}
          />
          <VacuumCard
            title="Last 7 calendar days"
            date={`${formatIsoDay(data.rolling7d.start)} – ${formatIsoDay(data.rolling7d.end)}`}
            etfBtc={data.rolling7d.etfBtc}
            etfUsd={data.rolling7d.etfUsd}
            issuanceBtc={data.rolling7d.issuanceBtc}
            extraBtc={data.rolling7d.extraBtc}
            ratio={data.rolling7d.ratio}
            regime={data.rolling7d.regime}
            copy={weekCopy.headline}
          />
        </section>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Streak"
            value={
              data.streak.days
                ? `${data.streak.days}d ${data.streak.direction === "in" ? "inflows" : "outflows"}`
                : "Flat"
            }
          />
          <Stat
            label="Coins since launch"
            value={formatSignedBtc(data.cumulativeBtc)}
            hint={formatSignedCompactUsd(data.cumulativeUsd)}
          />
          <Stat
            label="Est. holdings now"
            value={data.estimatedHoldingsBtc != null ? formatBtc(data.estimatedHoldingsBtc) : "—"}
            hint={
              data.totalNetAssetsUsd != null
                ? `${formatSignedCompactUsd(data.totalNetAssetsUsd)} AUM`
                : undefined
            }
          />
          <Stat
            label="30-day absorption"
            value={data.rolling30d.ratio == null ? "—" : `${data.rolling30d.ratio.toFixed(2)}×`}
            hint={regimeCopy(data.rolling30d.regime).headline}
          />
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ShareButton captureRef={shareRef} />
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          )}
        </div>

        <SessionTape days={recent} />

        <section className="mt-10 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Supply calendar</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every trading day since 11 January 2024. Green cells are net creations, red cells are
            redemptions, empty cells are weekends and holidays. Darker means a larger share of that
            day&apos;s miner issuance.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" /> inflow
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500/80" /> outflow
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-muted" /> no session
            </span>
            <span>
              Halving {formatIsoDay(data.halvingDate)} · T+500 {formatIsoDay(data.tPlus500)}
            </span>
          </div>
          <div className="mt-5 space-y-8">
            {data.heatmap.map((year) => (
              <HeatmapYearBlock key={year.year} year={year} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Where the coins landed in the 500-day cycle</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Spot ETFs launched inside the 2024 buy window. The ledger below is net ETF bitcoin
            versus miner issuance in each BTC500 phase — not another cumulative dollar chart.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.phaseLedger
              .filter((row) => row.tradingDays > 0)
              .map((row) => (
                <PhaseCard key={row.phase} row={row} />
              ))}
          </div>
        </section>

        <IssuerGravity issuers={data.issuers} />

        <section className="mt-10 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Session record</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Newest first. BTC is dollars divided by that session&apos;s bitcoin close.
              </p>
            </div>
            <RecordsStrip data={data} />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="py-2 pr-3 font-semibold">BTC</th>
                  <th className="py-2 pr-3 font-semibold">USD</th>
                  <th className="py-2 pr-3 font-semibold">vs issuance</th>
                  <th className="py-2 pr-3 font-semibold">IBIT</th>
                  <th className="py-2 font-semibold">Phase</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((day) => (
                  <tr key={day.date} className="border-b border-border/40">
                    <td className="py-2 pr-3 font-medium">{formatIsoDay(day.date)}</td>
                    <td
                      className={cn(
                        "py-2 pr-3 tabular-nums",
                        day.netFlowUsd > 0 && "text-emerald-600 dark:text-emerald-400",
                        day.netFlowUsd < 0 && "text-red-600 dark:text-red-400",
                      )}
                    >
                      {day.netFlowBtc == null ? "—" : formatSignedBtc(day.netFlowBtc)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">
                      {formatSignedCompactUsd(day.netFlowUsd)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {day.absorptionRatio == null ? "—" : `${day.absorptionRatio.toFixed(2)}×`}
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">
                      {day.perEtfUsd?.IBIT != null
                        ? formatSignedCompactUsd(day.perEtfUsd.IBIT)
                        : "—"}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{phaseLabel(day.phase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tableLimit < data.days.length && (
            <button
              type="button"
              onClick={() => setTableLimit((n) => Math.min(n + 40, data.days.length))}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Show older sessions ({data.days.length - tableLimit} more)
            </button>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold">How to read this (and why it is not CoinGlass)</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Coins, then dollars.</span> A $400M
              print at $40k is a different event from $400M at $90k. The hero number is BTC.
            </li>
            <li>
              <span className="font-semibold text-foreground">Issuance is the yardstick.</span>{" "}
              After 20 April 2024 miners create 450 BTC/day. If ETFs take more than that, they are
              shrinking liquid supply.
            </li>
            <li>
              <span className="font-semibold text-foreground">Holdings ≠ since-launch flow.</span>{" "}
              GBTC already held a large stack before conversion. AUM / price estimates current
              holdings; cumulative BTC is only post-launch creations minus redemptions.
            </li>
            <li>
              <span className="font-semibold text-foreground">Cycle context.</span> Flows are split
              across the 2024 T-500 window, the hold through T+500, and the wait for the next buy
              date.
            </li>
          </ul>
        </section>

        <section className="mt-16" aria-labelledby="etf-faq-heading">
          <h2 id="etf-faq-heading" className="text-center text-3xl font-bold tracking-tight">
            Bitcoin ETF flow questions
          </h2>
          <Accordion type="single" collapsible className="mx-auto mt-6 max-w-3xl">
            {ETF_FAQ.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-16 rounded-[32px] border border-border/60 bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Flows are a tape. BTC500 is a date.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Use this board to see whether institutions are absorbing coins. Use the simulator to see
            what buying 500 days before a halving actually returned.
          </p>
          <Link
            to="/simulator"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Calculator className="h-4 w-4" />
            Open the simulator
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          Data: {data.attribution}. {data.sources}{" "}
          <a
            href={data.sourceUrl}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </a>
          {" · "}
          <a
            href={data.license}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          . Figures can revise after the US cash close.
        </p>
      </main>

      <div className="pointer-events-none absolute -left-[9999px] top-0">
        <EtfShareCard ref={shareRef} data={data} />
      </div>
    </div>
  );
}

function VacuumCard({
  title,
  date,
  etfBtc,
  etfUsd,
  issuanceBtc,
  extraBtc,
  ratio,
  regime,
  copy,
}: {
  title: string;
  date: string;
  etfBtc: number;
  etfUsd: number;
  issuanceBtc: number;
  extraBtc: number | null;
  ratio: number | null;
  regime: AbsorptionRegime;
  copy: string;
}) {
  const max = Math.max(Math.abs(etfBtc), issuanceBtc, 1);
  const etfPct = Math.min(100, (Math.abs(etfBtc) / max) * 100);
  const minePct = Math.min(100, (issuanceBtc / max) * 100);
  const etfPositive = etfBtc >= 0;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{date}</p>
        </div>
        <span
          className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", regimeClass(regime))}
        >
          {copy}
        </span>
      </div>
      <p
        className={cn(
          "mt-4 text-3xl font-bold tracking-tight sm:text-4xl",
          etfPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
        )}
      >
        {formatSignedBtc(etfBtc)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatSignedCompactUsd(etfUsd)}
        {ratio != null ? ` · ${ratio.toFixed(2)}× miner issuance` : ""}
      </p>

      <div className="mt-5 space-y-3">
        <BarRow
          label="Miners minted"
          value={formatBtc(issuanceBtc)}
          width={minePct}
          color="bg-muted-foreground/50"
        />
        <BarRow
          label={etfPositive ? "ETFs took" : "ETFs returned"}
          value={formatBtc(Math.abs(etfBtc))}
          width={etfPct}
          color={etfPositive ? "bg-emerald-500" : "bg-red-500"}
        />
      </div>
      {extraBtc != null && (
        <p className="mt-4 text-sm text-muted-foreground">
          Net vs new supply:{" "}
          <span className="font-semibold text-foreground">{formatSignedBtc(extraBtc)}</span>
        </p>
      )}
    </section>
  );
}

function BarRow({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: string;
  width: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${Math.max(width, 3)}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold tracking-tight">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SessionTape({ days }: { days: EnrichedEtfDay[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Recent tape
      </h2>
      <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-2">
        {days.map((day) => {
          const positive = (day.netFlowBtc ?? 0) >= 0;
          return (
            <div
              key={day.date}
              className="min-w-[7.5rem] rounded-2xl border border-border/60 bg-card px-3 py-3"
            >
              <div className="text-[11px] text-muted-foreground">{formatIsoDay(day.date)}</div>
              <div
                className={cn(
                  "mt-1 text-sm font-bold tabular-nums",
                  positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {day.netFlowBtc == null ? "—" : formatSignedBtc(day.netFlowBtc)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {day.absorptionRatio == null ? "—" : `${day.absorptionRatio.toFixed(1)}×`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HeatmapYearBlock({ year }: { year: HeatmapYear }) {
  const monthLabels = useMemo(() => monthMarks(year), [year]);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        {year.year}
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-3">
          <div className="flex flex-col justify-between py-5 text-[9px] text-muted-foreground">
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>
          <div>
            <div className="relative mb-1 h-4 text-[10px] text-muted-foreground">
              {monthLabels.map((m) => (
                <span
                  key={m.label + m.index}
                  className="absolute whitespace-nowrap"
                  style={{ left: m.index * 14 }}
                >
                  {m.label}
                </span>
              ))}
            </div>
            <div
              className="grid grid-flow-col grid-rows-7 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${year.weeks.length}, 11px)` }}
            >
              {year.weeks.flatMap((week, wi) =>
                week.map((cell, di) => <HeatCell key={`${year.year}-${wi}-${di}`} cell={cell} />),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatCell({ cell }: { cell: HeatmapCell }) {
  const title =
    cell.direction === "none"
      ? `${cell.date} · no ETF session`
      : `${cell.date}: ${cell.netFlowBtc == null ? "—" : formatSignedBtc(cell.netFlowBtc)} (${cell.netFlowUsd == null ? "—" : formatSignedCompactUsd(cell.netFlowUsd)})`;
  return (
    <div
      title={title}
      className={cn("h-[11px] w-[11px] rounded-[2px]", heatClass(cell))}
      aria-label={title}
    />
  );
}

function monthMarks(year: HeatmapYear): { label: string; index: number }[] {
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const marks: { label: string; index: number }[] = [];
  let lastMonth = -1;
  year.weeks.forEach((week, index) => {
    const first = week.find((c) => c.direction !== "none" || c.phase != null);
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      marks.push({ label: labels[month] ?? first.date.slice(5, 7), index });
      lastMonth = month;
    }
  });
  return marks;
}

function PhaseCard({
  row,
}: {
  row: {
    phase: EtfCyclePhase;
    label: string;
    start: string;
    end: string;
    tradingDays: number;
    etfUsd: number;
    etfBtc: number;
    issuanceBtc: number;
    extraBtc: number;
    ratio: number | null;
  };
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card p-5">
      <h3 className="font-semibold">{row.label}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatIsoDay(row.start)} – {formatIsoDay(row.end)} · {row.tradingDays} sessions
      </p>
      <p
        className={cn(
          "mt-3 text-2xl font-bold",
          row.etfBtc >= 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400",
        )}
      >
        {formatSignedBtc(row.etfBtc)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatSignedCompactUsd(row.etfUsd)} · miners {formatBtc(row.issuanceBtc)}
        {row.ratio != null ? ` · ${row.ratio.toFixed(2)}×` : ""}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Extra vs issuance: {formatSignedBtc(row.extraBtc)}
      </p>
    </article>
  );
}

function IssuerGravity({ issuers }: { issuers: EtfAbsorptionSnapshot["issuers"] }) {
  const max = Math.max(...issuers.map((i) => Math.abs(i.btc)), 1);
  return (
    <section className="mt-10 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Who took the coins</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Net bitcoin since launch, by ticker. This is a race of coins, not a fee table.
      </p>
      <div className="mt-5 space-y-3">
        {issuers.slice(0, 8).map((row) => (
          <div key={row.ticker}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">
                {row.ticker}{" "}
                <span className="font-normal text-muted-foreground">· {row.issuer}</span>
              </span>
              <span className="tabular-nums font-semibold">{formatSignedBtc(row.btc)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  row.ticker === "IBIT"
                    ? "bg-primary"
                    : row.btc >= 0
                      ? "bg-emerald-500"
                      : "bg-red-500",
                )}
                style={{ width: `${Math.max(3, (Math.abs(row.btc) / max) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Last 30d {formatSignedBtc(row.last30dBtc)} · {formatSignedCompactUsd(row.usd)} since
              launch
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecordsStrip({ data }: { data: EtfAbsorptionSnapshot }) {
  return (
    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
      {data.biggestInflow && (
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
          Biggest in {formatIsoDay(data.biggestInflow.date)}{" "}
          {formatSignedCompactUsd(data.biggestInflow.usd)}
        </span>
      )}
      {data.biggestOutflow && (
        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-red-700 dark:text-red-400">
          Biggest out {formatIsoDay(data.biggestOutflow.date)}{" "}
          {formatSignedCompactUsd(data.biggestOutflow.usd)}
        </span>
      )}
    </div>
  );
}

function regimeClass(regime: AbsorptionRegime): string {
  switch (regime) {
    case "squeezing":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "absorbing":
      return "bg-primary/15 text-primary";
    case "dumping":
      return "bg-red-500/15 text-red-700 dark:text-red-400";
    case "leaking":
      return "bg-amber-500/15 text-amber-800 dark:text-amber-400";
    case "idle":
      return "bg-muted text-muted-foreground";
  }
}

function heatClass(cell: HeatmapCell): string {
  if (cell.direction === "none" || cell.direction === "flat" || cell.intensity === 0) {
    return "bg-muted/70";
  }
  if (cell.direction === "in") {
    return (
      [
        "bg-emerald-200 dark:bg-emerald-900",
        "bg-emerald-300 dark:bg-emerald-800",
        "bg-emerald-500",
        "bg-emerald-700",
      ][cell.intensity - 1] ?? "bg-emerald-500"
    );
  }
  return (
    ["bg-red-200 dark:bg-red-900", "bg-red-300 dark:bg-red-800", "bg-red-500", "bg-red-700"][
      cell.intensity - 1
    ] ?? "bg-red-500"
  );
}
