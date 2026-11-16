import { useRef } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  Clock,
  Info,
  Lock,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "@/components/ShareButton";
import { useNow } from "@/hooks/use-now";
import { computeCycle } from "@/lib/phase";
import { btcPriceQuery, buyPriceQuery, halvingQuery, simulatorQuery } from "@/lib/queries";
import { PAPER_FAQ } from "@/lib/paper-faq";
import {
  PAPER_NOTIONAL_USD,
  buildPaperRecord,
  paperLongDate,
  paperMoney,
  paperPercent,
  type PaperRecordState,
} from "@/lib/paper-buy";

const STATE_LABEL: Record<PaperRecordState, string> = {
  scheduled: "Scheduled · not deployed",
  "awaiting-price": "Awaiting price",
  live: "Position open",
  closed: "Rule closed",
};

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold tabular-nums text-foreground sm:text-base">
        {value}
      </dd>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
}

export function PaperBuyPage() {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const now = useNow(60_000);
  const priceRes = useQuery(btcPriceQuery);
  const simulatorRes = useQuery(simulatorQuery);
  const ledgerRef = useRef<HTMLDivElement>(null);

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );
  const buyDateISO = cycle.buyDate.toISOString().slice(0, 10);
  const sellDateISO = cycle.sellDate.toISOString().slice(0, 10);

  // The entry close only exists once the buy date has passed. Never fetch a
  // future date and never substitute today's price for it.
  const buyPriceRes = useQuery({
    ...buyPriceQuery(buyDateISO),
    enabled: now >= cycle.buyDate,
  });

  const record = buildPaperRecord({
    nowISO: now.toISOString(),
    buyDateISO,
    sellDateISO,
    entryPriceUSD: buyPriceRes.data ?? null,
    currentPriceUSD: priceRes.data?.price ?? null,
  });

  const completed = simulatorRes.data?.cycles.filter((c) => c.returnMultiplier !== null) ?? [];
  const dataUnavailable =
    simulatorRes.data?.status === "unavailable" || simulatorRes.data?.status === "error";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 sm:pt-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Paper buy</span>
        </nav>

        <header className="mb-10 text-center">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Public paper record · no real money
          </Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            The ${PAPER_NOTIONAL_USD.toLocaleString("en-US")} BTC500 Paper Buy
          </h1>
          <p className="lead mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            One rule, one date, one public ledger. The BTC500 paper buy deploys{" "}
            <strong className="text-foreground">
              {paperMoney(PAPER_NOTIONAL_USD)} on {paperLongDate(buyDateISO)}
            </strong>{" "}
            — 500 days before the estimated halving — and exits 500 days after it, on{" "}
            <strong className="text-foreground">{paperLongDate(sellDateISO)}</strong>. The entry
            price is that date&apos;s BTC/USD close and the P&amp;L ledger marks the position every
            day. Nothing here is real money or a forecast.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Educational paper performance · not financial advice.
          </p>
        </header>

        {/* The ledger. Ref is captured by ShareButton so the daily line can be
            exported as an image and posted elsewhere. */}
        <div ref={ledgerRef} className="rounded-2xl border border-border/60 bg-card p-1 shadow-sm">
          <Card className="border-0 bg-transparent">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Unrealized P&amp;L · {paperMoney(PAPER_NOTIONAL_USD)} paper
                  </div>
                  <div
                    className={`mt-2 text-5xl font-bold tracking-tight tabular-nums ${
                      record.profitUSD == null
                        ? ""
                        : record.profitUSD >= 0
                          ? "text-success"
                          : "text-destructive"
                    }`}
                  >
                    {record.profitUSD !== null
                      ? `${record.profitUSD >= 0 ? "+" : "−"}${paperMoney(Math.abs(record.profitUSD))}`
                      : record.state === "scheduled"
                        ? record.daysToEntry
                        : "—"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {record.returnPercent !== null
                      ? `${paperPercent(record.returnPercent)} on ${paperMoney(PAPER_NOTIONAL_USD)} · ${paperMoney(record.valueUSD!)} value`
                      : record.state === "scheduled"
                        ? "days until the buy date · P&L starts at entry"
                        : "no mark published yet"}
                  </div>
                </div>
                <Badge
                  variant={record.state === "live" ? "default" : "outline"}
                  className={record.state === "live" ? "bg-primary" : "text-muted-foreground"}
                >
                  {STATE_LABEL[record.state]}
                </Badge>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-6 sm:grid-cols-3">
                <Field
                  label="Entry date · T−500"
                  value={paperLongDate(buyDateISO)}
                  hint="Derived live, not hand-picked"
                />
                <Field
                  label="Notional"
                  value={`${paperMoney(PAPER_NOTIONAL_USD)} paper`}
                  hint="No leverage, no top-ups"
                />
                <Field
                  label="Entry price"
                  value={
                    record.entryPriceUSD !== null
                      ? paperMoney(record.entryPriceUSD)
                      : "Not yet published"
                  }
                  hint="BTC/USD close on the entry date"
                />
                <Field
                  label="Exit rule · T+500"
                  value={paperLongDate(sellDateISO)}
                  hint="Estimated until the halving is mined"
                />
                <Field
                  label="BTC held"
                  value={record.btcHeld !== null ? `${record.btcHeld.toFixed(6)} BTC` : "—"}
                  hint="Fixed at entry"
                />
                <Field
                  label="Live mark"
                  value={
                    record.currentPriceUSD !== null
                      ? paperMoney(record.currentPriceUSD)
                      : "Unavailable"
                  }
                  hint="Site's live BTC price feed"
                />
              </dl>

              {/* P&L is always on the page. Before entry it explicitly says no
                  P&L exists; it never fabricates a trade that has not happened. */}
              <div
                id="pnl"
                className="mt-8 rounded-xl border border-border/60 bg-background/40 p-4 sm:p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Profit &amp; loss</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    {record.state === "scheduled"
                      ? "Not open yet"
                      : record.state === "awaiting-price"
                        ? "Mark pending"
                        : "Live paper P&L"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                  <Field
                    label="Unrealized P&L"
                    value={
                      record.profitUSD !== null
                        ? `${record.profitUSD >= 0 ? "+" : "−"}${paperMoney(Math.abs(record.profitUSD))}`
                        : "—"
                    }
                  />
                  <Field
                    label="Return"
                    value={record.returnPercent !== null ? paperPercent(record.returnPercent) : "—"}
                  />
                  <Field
                    label="Position value"
                    value={record.valueUSD !== null ? paperMoney(record.valueUSD) : "—"}
                  />
                  <Field
                    label="Deployed"
                    value={
                      record.state === "scheduled"
                        ? `${paperMoney(PAPER_NOTIONAL_USD)} cash`
                        : record.btcHeld !== null
                          ? `${record.btcHeld.toFixed(6)} BTC`
                          : "—"
                    }
                  />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {record.state === "scheduled"
                    ? `The ${paperMoney(PAPER_NOTIONAL_USD)} is uninvested until ${paperLongDate(buyDateISO)}. No P&L exists before entry — this is not a live trade.`
                    : record.returnPercent !== null
                      ? `P&L = ${paperMoney(PAPER_NOTIONAL_USD)} × (mark ÷ entry close − 1). Mark ${paperMoney(record.currentPriceUSD!)} against entry ${paperMoney(record.entryPriceUSD!)}. Paper result, not a guaranteed fill.`
                      : record.statusNote}
                </p>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Entry → exit</span>
                  <span className="tabular-nums">
                    {record.state === "scheduled"
                      ? `0 of ${record.totalWindowDays.toLocaleString("en-US")} days held`
                      : `${record.daysSinceEntry.toLocaleString("en-US")} of ${record.totalWindowDays.toLocaleString("en-US")} days held · ${record.daysToExit} to exit`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{
                      width: `${Math.max(record.progress * 100, record.state === "scheduled" ? 0 : 1)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                  Dated daily line · <time dateTime={record.todayISO}>{record.todayISO} UTC</time>
                </div>
                <p id="daily-line" className="text-sm leading-relaxed tabular-nums">
                  {record.dailyLine}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{record.statusNote}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 flex justify-center">
          <ShareButton captureRef={ledgerRef} />
        </div>

        {/* Method */}
        <Card className="mt-12">
          <CardHeader>
            <SectionHeading>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                How the record is kept
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">1 · The date comes from the chain.</strong> The
              buy date is 500 calendar days before the estimated halving, derived from live block
              height. It is not chosen because it looks cheap. If the halving estimate moves, the
              published buy and sell dates move with it until the window opens.
            </p>
            <p>
              <strong className="text-foreground">2 · The entry price is a published close.</strong>{" "}
              We use the BTC/USD daily close for the entry date from the same price archive that
              powers the simulator, with the site&apos;s existing Bitstamp fallback for dates beyond
              the archive. No price means no entry and no P&amp;L — never an invented number.
            </p>
            <p>
              <strong className="text-foreground">3 · The exit is fixed in advance.</strong> Sell
              500 calendar days after the halving. No discretionary exit, no averaging down, no
              re-entry. The only thing that changes after entry is the daily mark.
            </p>
          </CardContent>
        </Card>

        {/* Historical bridge — why this record exists before the buy date */}
        <Card className="mt-8">
          <CardHeader>
            <SectionHeading id="past-cycles">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                What ${PAPER_NOTIONAL_USD.toLocaleString("en-US")} did under the same rule
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {completed.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 pr-4 font-semibold">Cycle</th>
                    <th className="py-3 pr-4 font-semibold">Buy (T−500)</th>
                    <th className="py-3 pr-4 font-semibold">Entry close</th>
                    <th className="py-3 pr-4 font-semibold">Sell (T+500)</th>
                    <th className="py-3 pr-4 font-semibold">Final value</th>
                    <th className="py-3 font-semibold">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((c) => (
                    <tr key={c.halvingDate} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-semibold">{c.label}</td>
                      <td className="whitespace-nowrap py-3 pr-4 tabular-nums">{c.buyDate}</td>
                      <td className="py-3 pr-4 tabular-nums">{paperMoney(c.buyPrice!)}</td>
                      <td className="whitespace-nowrap py-3 pr-4 tabular-nums">{c.sellDate}</td>
                      <td className="py-3 pr-4 font-semibold tabular-nums">
                        {paperMoney(PAPER_NOTIONAL_USD * c.returnMultiplier!)}
                      </td>
                      <td className="py-3 tabular-nums">
                        <span
                          className={
                            c.returnPercent! >= 0
                              ? "font-semibold text-success"
                              : "text-destructive"
                          }
                        >
                          {c.returnPercent! >= 0 ? "+" : "−"}
                          {paperMoney(Math.abs(PAPER_NOTIONAL_USD * (c.returnMultiplier! - 1)))} (
                          {paperPercent(c.returnPercent!)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">
                {dataUnavailable
                  ? "Historical prices are unavailable."
                  : "Loading historical cycles…"}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Four completed windows is a very small sample. These are historical observations, not
              a forecast for the live record. Past performance does not guarantee future results.
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mt-8 bg-card/50">
          <CardHeader>
            <SectionHeading>
              <span className="inline-flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Questions about the paper buy
              </span>
            </SectionHeading>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {PAPER_FAQ.map((item) => {
              const liveNote = item.question.startsWith("When is the entry")
                ? ` The current entry date is ${paperLongDate(buyDateISO)}.`
                : item.question.startsWith("When does the position")
                  ? ` The current exit estimate is ${paperLongDate(sellDateISO)}.`
                  : "";
              return (
                <div key={item.question}>
                  <h3 className="font-semibold text-foreground">{item.question}</h3>
                  <p className="mt-1 text-muted-foreground">
                    {item.answer}
                    {liveNote}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Next steps */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/bitcoin-500-day-cycle"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <BookOpen className="h-4 w-4" />
            The 500-day rule
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <Calculator className="h-4 w-4" />
            Run the simulator
          </Link>
          <Link
            to="/halving-dates"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <CalendarDays className="h-4 w-4" />
            Halving dates
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Paper-only record · no real money · educational, not financial advice.
        </p>
      </main>
    </div>
  );
}
