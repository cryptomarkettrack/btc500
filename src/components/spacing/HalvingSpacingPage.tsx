import { Fragment } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Database, Info, ShieldCheck, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatIsoDay } from "@/lib/format";
import { emptySpacingReport, type SpacingReport, type SpacingWindow } from "@/lib/halving-spacing";
import { spacingQuery } from "@/lib/queries";
import { SPACING_FAQ } from "@/lib/spacing-faq";

function money(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function multiple(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(2)}x`;
}

function signedPercent(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(2)}%`;
}

function windowsLabel(count: number): string {
  return `${count} window${count === 1 ? "" : "s"}`;
}

function WindowRows({ windows }: { windows: SpacingWindow[] }) {
  return (
    <>
      {windows.map((w) => (
        <Fragment key={`${w.spacingDays}-${w.label}`}>
          <tr className="border-t border-white/10">
            <td className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap">
              {w.label.replace(" Halving", "")}
              <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                {formatIsoDay(w.halvingDate)}
              </span>
            </td>
            <td className="px-3 py-2.5 font-data text-xs whitespace-nowrap text-muted-foreground">
              {formatIsoDay(w.entryDate)}
            </td>
            <td className="px-3 py-2.5 font-data text-xs whitespace-nowrap">
              {money(w.entryPrice)}
            </td>
            <td className="px-3 py-2.5 font-data text-xs whitespace-nowrap text-muted-foreground">
              {formatIsoDay(w.exitDate)}
            </td>
            <td className="px-3 py-2.5 font-data text-xs whitespace-nowrap">
              {money(w.exitPrice)}
            </td>
            <td className="px-3 py-2.5 font-data text-sm font-semibold whitespace-nowrap text-primary">
              {multiple(w.multiple)}
              {w.note && w.multiple != null ? "*" : ""}
            </td>
            <td
              className="px-3 py-2.5 font-data text-xs whitespace-nowrap"
              style={{ color: (w.lowVsEntryPercent ?? 0) < 0 ? "var(--destructive)" : undefined }}
            >
              {signedPercent(w.lowVsEntryPercent)}
            </td>
          </tr>
          {w.note ? (
            <tr className="border-t border-white/5">
              <td
                colSpan={7}
                className="px-3 pb-3 text-[11px] leading-relaxed text-muted-foreground"
              >
                {w.multiple == null ? "Not computable: " : "* "}
                {w.note}
              </td>
            </tr>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

export function HalvingSpacingPage() {
  const { data } = useSuspenseQuery(spacingQuery);
  const report: SpacingReport = data ?? emptySpacingReport();

  const computed = report.windows.filter((w) => w.multiple != null);
  const unavailable = computed.length === 0;
  const spacings = report.spacings;

  const longestTested = computed.reduce<SpacingWindow | null>(
    (best, w) => (best == null || w.multiple! > best.multiple! ? w : best),
    null,
  );
  const shortestTested = computed.reduce<SpacingWindow | null>(
    (worst, w) => (worst == null || w.multiple! < worst.multiple! ? w : worst),
    null,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 pt-10 pb-24 sm:pt-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Halving spacing test</span>
        </nav>

        <header className="mb-10">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Robustness test · our own daily-close archive
          </Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Does the 500-day rule survive 400 or 600 days?
          </h1>
          <p className="lead mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
            This page runs the BTC500 rule at three spacings on the same daily closing prices, so
            the answer is a table rather than an opinion. Buy S days before each halving, sell S
            days after it, for S of 400, 500 and 600 days.
          </p>
        </header>

        {unavailable ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <h2 className="text-lg font-semibold">The price archive is unavailable</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The daily-close archive this test reads did not load, so no window could be
                computed. Nothing is estimated to fill the gap — the numbers appear when the archive
                is back.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* THE ANSWER */}
            <section id="answer" aria-label="The answer" className="mb-12">
              <Card className="border-primary/30 bg-primary/[0.04]">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-lg leading-relaxed font-semibold text-balance sm:text-xl">
                    The direction of the result does not depend on the spacing: all{" "}
                    {windowsLabel(computed.length)} this archive can price closed above their entry
                    price, at every spacing tested.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    The size of the result does depend on it, and mostly on where each entry landed
                    relative to a cycle bottom. The widest spread in the tables below is a bottom
                    artefact, not a better rule — it is labelled where it appears.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {spacings.map((s) => (
                      <div
                        key={s.spacingDays}
                        className="rounded-xl border border-white/10 bg-[var(--panel)] p-4"
                      >
                        <div className="font-data text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                          {s.spacingDays}-day spacing
                        </div>
                        <div className="mt-2 text-2xl font-bold tracking-tight">
                          {multiple(s.medianMultiple)}
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                          median multiple · {windowsLabel(s.computedWindows)}
                          {s.skippedWindows > 0 ? ` · ${s.skippedWindows} not computable` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* AGGREGATE TABLE */}
            <section className="mb-12" aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="text-2xl font-semibold tracking-tight">
                The same rule at three spacings
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Median and worst are computed across the windows this archive can price at that
                spacing. &ldquo;Lowest close vs entry&rdquo; is the lowest close inside each window
                measured against that window&apos;s own entry close.
              </p>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[var(--panel)]">
                <table id="spacing-table" className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Spacing
                      </th>
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Windows
                      </th>
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Median
                      </th>
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Worst
                      </th>
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Median low vs entry
                      </th>
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Worst low vs entry
                      </th>
                      <th className="px-3 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Below entry first
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {spacings.map((s) => (
                      <tr
                        key={s.spacingDays}
                        className={`border-t border-white/10 ${
                          s.spacingDays === 500 ? "bg-primary/[0.05]" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap">
                          {s.spacingDays} days
                          {s.spacingDays === 500 ? (
                            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
                              published rule
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 font-data text-xs whitespace-nowrap">
                          {s.computedWindows}
                          {s.skippedWindows > 0 ? ` (+${s.skippedWindows} skipped)` : ""}
                        </td>
                        <td className="px-3 py-3 font-data text-sm font-semibold">
                          {multiple(s.medianMultiple)}
                        </td>
                        <td className="px-3 py-3 font-data text-sm">{multiple(s.worstMultiple)}</td>
                        <td className="px-3 py-3 font-data text-xs">
                          {signedPercent(s.medianLowVsEntryPercent)}
                        </td>
                        <td
                          className="px-3 py-3 font-data text-xs"
                          style={{
                            color:
                              (s.worstLowVsEntryPercent ?? 0) < 0
                                ? "var(--destructive)"
                                : undefined,
                          }}
                        >
                          {signedPercent(s.worstLowVsEntryPercent)}
                        </td>
                        <td className="px-3 py-3 font-data text-xs whitespace-nowrap">
                          {s.windowsBelowEntry} of {s.computedWindows}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PER-WINDOW TABLES */}
            <section className="mb-12" aria-labelledby="windows-heading">
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-primary" />
                <h2 id="windows-heading" className="text-2xl font-semibold tracking-tight">
                  Every window, spacing by spacing
                </h2>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                One row per halving. A window that the archive cannot price is shown with the reason
                instead of being filled in.
              </p>

              <div className="mt-6 space-y-6">
                {spacings.map((s) => {
                  const rows = report.windows.filter((w) => w.spacingDays === s.spacingDays);
                  return (
                    <div key={s.spacingDays}>
                      <h3 className="mb-2 text-sm font-semibold">
                        Buy {s.spacingDays} days before · sell {s.spacingDays} days after
                      </h3>
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[var(--panel)]">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="bg-white/[0.03]">
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Halving
                              </th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Buy date
                              </th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Buy close
                              </th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Sell date
                              </th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Sell close
                              </th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Multiple
                              </th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Lowest close vs entry
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <WindowRows windows={rows} />
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {longestTested && shortestTested ? (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Widest single result: {longestTested.label.replace(" Halving", "")} at{" "}
                  {longestTested.spacingDays} days, {multiple(longestTested.multiple)}. Narrowest:{" "}
                  {shortestTested.label.replace(" Halving", "")} at {shortestTested.spacingDays}{" "}
                  days, {multiple(shortestTested.multiple)}. Both are single windows, not averages.
                </p>
              ) : null}
            </section>

            {/* WHAT IT MEANS */}
            <section className="mb-12 grid gap-4 lg:grid-cols-2" aria-labelledby="reads-heading">
              <h2 id="reads-heading" className="sr-only">
                What the test shows
              </h2>
              <Card className="border-white/10 bg-[var(--panel)]">
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    What the test does show
                  </h3>
                </CardHeader>
                <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Every computable window at 400, 500 and 600 days closed above its entry, so the
                    direction of the result is not an artefact of the 500-day choice.
                  </p>
                  <p>
                    The multiples fall from cycle to cycle in every spacing shown here, so the decay
                    a reader may see across halvings is not created by the 500-day window either.
                  </p>
                  <p>
                    In this archive the longer spacing is not the better one: the 600-day windows
                    returned a lower median multiple and traded much further below their entry.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-[var(--panel)]">
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <Info className="h-4 w-4 text-primary" />
                    What it does not show
                  </h3>
                </CardHeader>
                <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    It does not show that 500 days is optimal. It shows that the test the site
                    publishes is robust to the obvious objection, and that the differences between
                    spacings are dominated by where an entry lands relative to a cycle low.
                  </p>
                  <p>
                    {windowsLabel(computed.length)} is a small sample, and a spacing can lose a
                    window to the start of the archive. These are historical observations, not
                    forecasts, and nothing here is financial advice.
                  </p>
                  <p>
                    Only daily closes are used, so every in-window low is shallower than the
                    intraday low a holder would actually have watched.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* METHOD + DATA */}
            <section className="mb-12" aria-labelledby="method-heading">
              <h2 id="method-heading" className="text-2xl font-semibold tracking-tight">
                Method
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Entry is the halving date minus S calendar days; exit is the halving date plus S
                  calendar days. The exit never moves to chase a price. Prices are the daily close
                  in USD for that UTC calendar day from{" "}
                  <Link
                    to="/bitcoin-500-day-cycle"
                    className="link-draw font-semibold text-primary"
                  >
                    the same archive the simulator reads
                  </Link>
                  , and a day with no print is skipped rather than interpolated.
                </p>
                <p>
                  &ldquo;Lowest close vs entry&rdquo; is (lowest close inside the window − entry
                  close) ÷ entry close. Medians are the middle value across the windows a spacing
                  can price; with an even count they are the average of the two middle values.
                </p>
                <p>
                  {report.archive.firstDate && report.archive.lastDate
                    ? `This page is computed from ${report.archive.rows.toLocaleString("en-US")} daily closes covering ${formatIsoDay(report.archive.firstDate)} to ${formatIsoDay(report.archive.lastDate)} (${report.archive.source}). The archive grows daily; the closed windows above do not change.`
                    : "The archive range could not be read."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="/data/halving-spacing.json"
                  className="press inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold hover:border-primary/40 hover:text-primary"
                >
                  <Database className="h-4 w-4" />
                  /data/halving-spacing.json
                </a>
                <Link
                  to="/simulator"
                  className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Run any amount through the window
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Free to cite with attribution to BTC500 and a link to this page.
              </p>
            </section>

            {/* FAQ */}
            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
                Questions this test answers
              </h2>
              <div className="mt-4 grid gap-2 lg:grid-cols-2 lg:items-start">
                {SPACING_FAQ.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-white/10 bg-[var(--panel)] open:border-primary/30"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                      <h3 className="flex-1 text-sm font-semibold text-foreground sm:text-base">
                        {item.question}
                      </h3>
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
