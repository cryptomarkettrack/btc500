import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import {
  Calculator,
  BookOpen,
  Flame,
  TrendingUp,
  ArrowRight,
  Target,
  Shield,
  Zap,
  LineChart,
  LayoutTemplate,
  Landmark,
  ChevronDown,
  Eye,
  Sparkles,
} from "lucide-react";
import { computeCycle, daysBetween, formatUsd } from "@/lib/phase";
import { buildHomeAnswer } from "@/lib/home-answer";
import { ShareButton } from "@/components/ShareButton";
import { CycleShareCard } from "@/components/CycleShareCard";
import { HeroSplit } from "@/components/home/HeroSplit";
import { RuleDiagram } from "@/components/home/RuleDiagram";
import { ClosingStatement } from "@/components/home/ClosingStatement";
import { lazy, Suspense, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getArticlesSorted, type ArticleMeta } from "@/lib/articles";
import { trackCta } from "@/lib/analytics";
import { HOME_LAST_REVIEWED } from "@/lib/site";
import { halvingQuery, btcPriceQuery, simulatorPreviewQuery } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { FAQ_ITEMS } from "@/lib/faq";
import { DataTape } from "@/components/home/DataTape";
import { ProofBand } from "@/components/home/ProofBand";
import { LedgerCalculator } from "@/components/home/LedgerCalculator";
import { StickyCta } from "@/components/home/StickyCta";
import { CommandCenter } from "@/components/home/CommandCenter";

// Loaded only when the preview dialog is opened. It pulls framer-motion +
// AnimatePresence, which the landing page otherwise doesn't need.
const PhasePreviewModal = lazy(() =>
  import("@/components/home/PhasePreviewModal").then((m) => ({
    default: m.PhasePreviewModal,
  })),
);

export function HomePage() {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const priceRes = useQuery(btcPriceQuery);
  const simulatorRes = useQuery(simulatorPreviewQuery);
  const now = useNow(60_000);
  const cycleShareCardRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );

  // The page Google actually serves (see the 2026-10-28 review) has to answer
  // "when is 500 days before the next bitcoin halving" itself: the H1 and the
  // first paragraph both carry the live T-500 date, from the same model.
  const answer = buildHomeAnswer({
    buyDateISO: cycle.buyDate.toISOString(),
    nextHalvingISO: cycle.nextHalving.toISOString(),
    nowISO: now.toISOString(),
  });

  const isBuyActive = now >= cycle.buyDate && now < cycle.nextHalving;
  const isSellActive = now >= cycle.nextHalving && now < cycle.sellDate;

  const buyDays = Math.max(0, cycle.daysUntilBuy);
  const sellDays = cycle.daysUntilSell;

  const latestArticles = getArticlesSorted().slice(0, 3);

  const completedCycles =
    simulatorRes.data?.cycles.filter((c) => c.returnMultiplier !== null) ?? [];

  const totalCompleted = completedCycles.length;
  const avgReturn =
    totalCompleted > 0
      ? completedCycles.reduce((sum, c) => sum + (c.returnPercent ?? 0), 0) / totalCompleted
      : null;
  const profitableCycles = completedCycles.filter((c) => (c.returnPercent ?? 0) > 0).length;
  const bestReturn =
    totalCompleted > 0 ? Math.max(...completedCycles.map((c) => c.returnPercent ?? 0)) : null;

  const lastCompletedCycle = simulatorRes.data?.cycles[simulatorRes.data.cycles.length - 1] ?? null;

  // The single next dated action, surfaced above the fold instead of only in
  // the chart label and the sticky bar.
  const daysToHalving = Math.max(0, daysBetween(now, cycle.nextHalving));
  const countdownValue = isSellActive
    ? sellDays
    : isBuyActive
      ? daysToHalving
      : cycle.phase === "done"
        ? cycle.daysUntilNextCycleBuy
        : buyDays;
  const countdownLabel = isSellActive
    ? "days to sell"
    : isBuyActive
      ? "days to halving"
      : cycle.phase === "done"
        ? "days to next buy"
        : "days to buy";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSplit
        answer={answer}
        cycle={cycle}
        price={priceRes.data?.price ?? null}
        countdownValue={countdownValue}
        countdownLabel={countdownLabel}
        isSellActive={isSellActive}
        buyDays={buyDays}
      />

      <DataTape
        price={priceRes.data?.price ?? null}
        nextHalving={cycle.nextHalving}
        height={halving.height}
        buyDays={buyDays}
        sellDays={sellDays}
        isBuyActive={isBuyActive}
        isSellActive={isSellActive}
        phaseDone={cycle.phase === "done"}
        daysUntilNextCycleBuy={cycle.daysUntilNextCycleBuy}
      />

      <main className="mx-auto max-w-6xl px-6">
        {/* ===== 01. THE RULE ===== */}
        <section className="pt-24 sm:pt-28" aria-labelledby="rule-heading">
          <div className="max-w-2xl">
            <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              01 / The rule
            </p>
            <h2
              id="rule-heading"
              className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl"
            >
              Three dates, four years apart
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              One 500-day window around each Bitcoin halving. Buy at T−500, hold through the event,
              sell at T+500. Nothing needs interpreting — the calendar decides. The{" "}
              <Link to="/bitcoin-500-day-cycle" className="link-draw font-semibold text-primary">
                cycle explainer
              </Link>{" "}
              has every date and price.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <HowItWorksCard
              id="step-buy"
              icon={Target}
              step="01"
              title="Buy 500 days before"
              description="Put the buy order on the date the countdown names — 500 days before the next halving, whatever day that lands on."
              accent="var(--primary)"
              to="/halving-dates"
              cta="See the halving schedule"
            />
            <HowItWorksCard
              id="step-hold"
              icon={Zap}
              step="02"
              title="Hold through the halving"
              description="Hold the position as the event passes. Supply halves; the window does the waiting."
              accent="var(--info)"
              to="/simulator"
              cta="Calculate your returns"
            />
            <HowItWorksCard
              id="step-sell"
              icon={Shield}
              step="03"
              title="Sell 500 days after"
              description="Exit on the dated T+500 date, then wait for the next cycle. Two trades, every four years."
              accent="var(--success)"
              to="/timeline"
              cta="Watch the timeline"
            />
          </div>

          <RuleDiagram
            cycle={cycle}
            buyDays={buyDays}
            sellDays={sellDays}
            daysUntilHalving={daysToHalving}
            isBuyActive={isBuyActive}
            isSellActive={isSellActive}
          />
        </section>

        {/* ===== THE WINDOW — the product's own live read ===== */}
        <section className="pt-20 sm:pt-24" aria-label="The live cycle window">
          <CommandCenter
            cycle={cycle}
            price={priceRes.data?.price ?? null}
            height={halving.height}
            nextHalvingBlock={halving.nextHalvingBlock}
            lastHalvingBlock={halving.lastHalvingBlock}
            buyDays={buyDays}
            sellDays={sellDays}
            isBuyActive={isBuyActive}
            isSellActive={isSellActive}
            buyProgress={cycle.buyProgress}
            blockProgress={computeBlockProgress(halving)}
            blocksRemaining={halving.nextHalvingBlock - halving.height}
          />

          <nav
            aria-label="BTC500 core pages"
            className="mt-4 grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-4"
          >
            <ClusterLink
              to="/bitcoin-500-day-cycle"
              label="Bitcoin 500-Day Cycle"
              hint="How T−500 and T+500 are defined"
            />
            <ClusterLink
              to="/simulator"
              label="Simulator"
              hint="Backtest $500, $1,000, or any amount"
            />
            <ClusterLink to="/timeline" label="Timeline" hint="Replay each historical window" />
            <ClusterLink
              to="/articles/btc500-strategy"
              label="BTC500 Strategy"
              hint="When the rule buys and sells"
            />
          </nav>
        </section>

        {/* ===== THE ANSWERS (AEO) ===== */}
        <section className="pt-20 sm:pt-24" aria-label="What the rule means">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[var(--panel)] p-6 sm:p-8">
              <h3 className="text-lg font-semibold">What is the Bitcoin 500-day rule?</h3>
              <p
                id="btc500-definition"
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                BTC500 measures one window: 500 days before each Bitcoin halving through 500 days
                after it. The live countdown on this page is that window for the current cycle. The{" "}
                <Link to="/bitcoin-500-day-cycle" className="link-draw font-semibold text-primary">
                  500-day cycle explainer
                </Link>{" "}
                is the full methodology. Nothing here is financial advice.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[var(--panel)] p-6 sm:p-8">
              <h3 className="text-lg font-semibold">
                When is 500 days before the next Bitcoin halving?
              </h3>
              <p
                id="buy-date-answer"
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                The BTC500 buy date is {formatUtcDay(cycle.buyDate)} — 500 days before the next
                estimated halving on {formatUtcDay(cycle.nextHalving)}. That date moves if Bitcoin
                blocks come in faster or slower than ten minutes. The record of that offset, window
                by window, is in{" "}
                <Link to="/bitcoin-500-day-cycle" className="link-draw font-semibold text-primary">
                  when is 500 days before the next bitcoin halving
                </Link>
                . Every cycle date is on the{" "}
                <Link to="/halving-dates" className="link-draw font-semibold text-primary">
                  halving dates page
                </Link>
                .
              </p>
            </article>
          </div>
        </section>

        {/* ===== 02. THE RECORD ===== */}
        <section className="pt-20 sm:pt-24" aria-labelledby="record-heading">
          <ProofBand
            totalCompleted={totalCompleted}
            profitable={profitableCycles}
            avgReturn={avgReturn}
            bestReturn={bestReturn}
          />
        </section>

        {/* ===== THE RECORD, CYCLE BY CYCLE ===== */}
        {completedCycles.length > 0 && (
          <section className="pt-20 sm:pt-24" aria-labelledby="history-heading">
            <div className="max-w-2xl">
              <h2
                id="history-heading"
                className="text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl"
              >
                Every completed window
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The BTC<span className="text-primary">500</span> windows since 2012, with the buy
                price, the sell price and the return each one produced.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {completedCycles.map((c) => (
                <div
                  key={c.label}
                  className="lift rounded-2xl border border-white/10 bg-[var(--panel)] p-5"
                >
                  <div className="font-data text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {c.label}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Buy</span>
                      <span className="font-data font-semibold">
                        {c.buyPrice ? formatUsd(c.buyPrice) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Sell</span>
                      <span className="font-data font-semibold">
                        {c.sellPrice ? formatUsd(c.sellPrice) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
                      <span className="text-muted-foreground">Return</span>
                      <span
                        className="font-data font-semibold"
                        style={{
                          color:
                            c.returnPercent && c.returnPercent > 0
                              ? "var(--success)"
                              : "var(--destructive)",
                        }}
                      >
                        {c.returnPercent !== null
                          ? `${c.returnPercent > 0 ? "+" : ""}${c.returnPercent.toFixed(0)}%`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/simulator"
                onClick={() => trackCta("historical_returns", "/simulator")}
                className="press inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <Calculator className="h-4 w-4" />
                Calculate your returns
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ===== 04. PUT A NUMBER ON IT ===== */}
        <section className="pt-20 sm:pt-24" aria-label="What would your amount have done">
          <LedgerCalculator cycle={lastCompletedCycle} />
        </section>

        {/* ===== 05. THE TOOLS ===== */}
        <section className="pt-20 sm:pt-24" aria-labelledby="tools-heading">
          <div className="max-w-2xl">
            <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              05 / Choose your depth
            </p>
            <h2
              id="tools-heading"
              className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl"
            >
              Go deeper when you&apos;re ready
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every tool is free and instant. Start with the explainer, check the record in the
              simulator, or replay any day on the timeline.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              to="/bitcoin-500-day-cycle"
              icon={BookOpen}
              title="Bitcoin 500-Day Cycle"
              description="The canonical explainer: T−500, T+500, and every completed window with real prices."
              accent="var(--primary)"
            />
            <FeatureCard
              to="/simulator"
              icon={Calculator}
              title="Investment Simulator"
              description="See exactly how much you would have earned using the BTC500 strategy across every halving cycle since 2012."
              accent="var(--primary)"
            />
            <FeatureCard
              to="/timeline"
              icon={LineChart}
              title="Time Machine"
              description="Replay any day in Bitcoin's halving history and watch prices evolve through the window."
              accent="var(--info)"
            />
            <FeatureCard
              to="/articles"
              icon={BookOpen}
              title="Strategy Articles"
              description="Deep dives into the BTC500 strategy, NUPL/RUPL indicators, on-chain analysis, and more."
              accent="var(--success)"
            />
            <FeatureCard
              to="/insider-trading"
              icon={TrendingUp}
              title="Insider Trading Tracker"
              description="Monitor insider transactions at major crypto companies. See who is buying and selling."
              accent="var(--success)"
            />
            <FeatureCard
              to="/liquidation"
              icon={Flame}
              title="Liquidation Dashboard"
              description="Track real-time crypto liquidations across exchanges. See where leverage is getting wiped out."
              accent="var(--destructive)"
            />
            <FeatureCard
              to="/bitcoin-etf"
              icon={Landmark}
              title="ETF Absorption"
              description="US spot Bitcoin ETF inflows in BTC, stacked against miner issuance and the 500-day cycle."
              accent="var(--success)"
            />
            <FeatureCard
              to="/dca"
              icon={LineChart}
              title="DCA vs Lump Sum"
              description="Compare spreading buys over days against going all-in on the BTC500 dates."
              accent="var(--info)"
            />
            <FeatureCard
              to="/embed-kit"
              icon={LayoutTemplate}
              title="Embed Kit"
              description="Drop live countdown badges and full widgets on blogs, newsletters, and dashboards."
              accent="var(--info)"
            />
          </div>
        </section>

        {/* ===== LATEST ARTICLES ===== */}
        <section className="pt-20 sm:pt-24" aria-labelledby="articles-heading">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2
                id="articles-heading"
                className="text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl"
              >
                Latest articles
              </h2>
              <p className="mt-3 text-muted-foreground">In-depth analysis and strategy guides.</p>
            </div>
            <Link
              to="/articles"
              className="link-draw hidden items-center gap-1.5 text-sm font-semibold text-primary sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/bitcoin-500-day-cycle"
              className="group lift flex flex-col rounded-2xl border border-primary/30 bg-primary/[0.06] p-6"
            >
              <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                <BookOpen className="h-3 w-3" />
                Start here
              </div>
              <h3 className="text-base font-semibold leading-snug">Bitcoin 500-Day Cycle</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                How T−500 and T+500 are defined, what previous windows returned, and where the
                current cycle sits.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Read the cycle explainer
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              to="/articles"
              className="press inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary"
            >
              View all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="pt-20 sm:pt-24" aria-labelledby="faq-heading">
          <div className="max-w-2xl">
            <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              06 / Skeptic&apos;s corner
            </p>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-4xl"
            >
              Ask the hard questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Quick answers about the BTC<span className="text-primary">500</span> strategy, Bitcoin
              halving dates, post-halving price behaviour, and the free tools on this site.
            </p>
          </div>

          <div className="mt-10 grid gap-2 lg:grid-cols-2 lg:items-start">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        {/* ===== PREVIEW / SHARE / EMBED ===== */}
        <section className="pt-20 sm:pt-24">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="press inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <Eye className="h-4 w-4" />
              Preview the homepage after the buy window
              <Sparkles className="h-4 w-4" />
            </button>
            <ShareButton captureRef={cycleShareCardRef} />
            <Link
              to="/embed-kit"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Open Embed Kit — badges, countdown widgets & themes
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <p className="pt-16 text-center text-xs text-muted-foreground">
          Data refreshes automatically. Halving estimate from Bitcoin block height · BTC price from
          Binance, CoinGecko, Coinbase & Kraken. Last reviewed {HOME_LAST_REVIEWED}.
        </p>
      </main>

      <ClosingStatement />

      {/* Hidden share card for social media image generation */}
      <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }}>
        <CycleShareCard
          ref={cycleShareCardRef}
          cycle={cycle}
          price={priceRes.data?.price ?? null}
        />
      </div>

      {/* Preview modal — shows how the homepage looks after the 500-days-before-halving day.
          Rendered (and its chunk fetched) only after the user asks for it. */}
      {previewOpen && (
        <Suspense fallback={null}>
          <PhasePreviewModal
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            cycle={cycle}
            currentPrice={priceRes.data?.price ?? null}
            buyPrice={lastCompletedCycle?.buyPrice ?? null}
            buyDate={lastCompletedCycle?.buyDate ?? null}
            sellDate={lastCompletedCycle?.sellDate ?? null}
          />
        </Suspense>
      )}

      {/* Mobile sticky CTA — live countdown, always one tap from the simulator */}
      <StickyCta
        label={
          isBuyActive
            ? "Buy window open"
            : cycle.phase === "done"
              ? `${cycle.daysUntilNextCycleBuy}d to buy`
              : cycle.phase === "wait-sell"
                ? `${sellDays}d to sell`
                : `${buyDays}d to buy`
        }
      />
    </div>
  );
}

function computeBlockProgress(halving: {
  nextHalvingBlock: number;
  lastHalvingBlock: number;
  height: number;
}): number {
  const blocksInCycle = halving.nextHalvingBlock - halving.lastHalvingBlock;
  const blocksElapsed = halving.height - halving.lastHalvingBlock;
  return Math.max(0, Math.min(1, blocksElapsed / blocksInCycle));
}

function formatUtcDay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ClusterLink({
  to,
  label,
  hint,
}: {
  to: "/bitcoin-500-day-cycle" | "/simulator" | "/timeline" | "/articles/btc500-strategy";
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="lift flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[var(--panel)] px-4 py-3.5 text-left hover:bg-white/[0.03]"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
    </Link>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-[var(--panel)] open:border-primary/30">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
        <h3 className="flex-1 text-sm font-semibold text-foreground sm:text-base">{question}</h3>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </div>
    </details>
  );
}

function HowItWorksCard({
  id,
  icon: Icon,
  step,
  title,
  description,
  accent,
  to,
  cta,
}: {
  id?: string;
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
  accent: string;
  to: string;
  cta: string;
}) {
  return (
    <div
      id={id}
      className="lift flex flex-col rounded-2xl border border-white/10 bg-[var(--panel)] p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {step}
        </span>
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Link
        to={to}
        className="link-draw mt-4 inline-flex items-center gap-1 py-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: accent }}
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function FeatureCard({
  to,
  icon: Icon,
  title,
  description,
  accent,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  accent: string;
}) {
  return (
    <Link to={to} className="group block">
      <div className="lift h-full rounded-2xl border border-white/10 bg-[var(--panel)] p-6 hover:bg-white/[0.03]">
        <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10">
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Explore
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link to={`/articles/${article.slug}` as "/articles/btc500-strategy"} className="group block">
      <div className="lift flex h-full flex-col rounded-2xl border border-white/10 bg-[var(--panel)] p-6">
        <div className="font-data flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>{article.articleSection}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.description}
        </p>
        <span className="mt-auto flex items-center gap-1 pt-5 text-xs font-semibold text-primary">
          Read article
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
