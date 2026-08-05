import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  ChevronDown,
  Eye,
  Sparkles,
} from "lucide-react";
import { computeCycle, formatUsd } from "@/lib/phase";
import { BtcLogo } from "@/components/BtcLogo";
import { ShareButton } from "@/components/ShareButton";
import { CycleShareCard } from "@/components/CycleShareCard";
import { Btc500Hero } from "@/components/Btc500Hero";
import { CommandCenter } from "@/components/home/CommandCenter";
import { PhasePreviewModal } from "@/components/home/PhasePreviewModal";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getArticlesSorted, type ArticleMeta } from "@/lib/articles";
import { halvingQuery, btcPriceQuery, simulatorPreviewQuery, cycleScoreQuery } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { FAQ_ITEMS } from "@/lib/faq";

export function HomePage() {
  const { data: halving } = useSuspenseQuery(halvingQuery);
  const priceRes = useQuery(btcPriceQuery);
  const simulatorRes = useQuery(simulatorPreviewQuery);
  const cycleScoreRes = useQuery(cycleScoreQuery);
  const now = useNow(60_000);
  const heroRef = useRef<HTMLDivElement>(null);
  const cycleShareCardRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const cycle = computeCycle(
    now,
    new Date(halving.nextHalvingDate),
    new Date(halving.lastHalvingDate),
  );

  // Section 1: "Waiting to Buy" — active during the 500-day pre-halving window (buyDate to nextHalving)
  const isBuyActive = now >= cycle.buyDate && now < cycle.nextHalving;
  // Section 2: "Waiting to Sell" — active after halving until sellDate
  const isSellActive = now >= cycle.nextHalving && now < cycle.sellDate;

  // Buy countdown: days until buyDate (or 0 if passed)
  const buyDays = Math.max(0, cycle.daysUntilBuy);
  const buyProgress = cycle.buyProgress;

  // Block progress: current block height vs target halving block
  const blocksInCycle = halving.nextHalvingBlock - halving.lastHalvingBlock;
  const blocksElapsed = halving.height - halving.lastHalvingBlock;
  const blockProgress = Math.max(0, Math.min(1, blocksElapsed / blocksInCycle));
  const blocksRemaining = halving.nextHalvingBlock - halving.height;

  // Sell countdown: days until sellDate
  const sellDays = cycle.daysUntilSell;

  // Get latest articles
  const latestArticles = getArticlesSorted().slice(0, 3);

  // Calculate historical returns from simulator data for the preview
  const completedCycles =
    simulatorRes.data?.cycles.filter((c) => c.returnMultiplier !== null) ?? [];

  // Last completed cycle's buy price/date/sell date — used by the P&L preview modal.
  const lastCompletedCycle = simulatorRes.data?.cycles[simulatorRes.data.cycles.length - 1] ?? null;
  const previewBuyPrice = lastCompletedCycle?.buyPrice ?? null;
  const previewBuyDate = lastCompletedCycle?.buyDate ?? null;
  const previewSellDate = lastCompletedCycle?.sellDate ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div
          ref={heroRef}
          className="flex flex-col gap-6 p-0 sm:p-5"
          style={{ background: "var(--background)" }}
        >
          <Btc500Hero price={priceRes.data?.price ?? null} daysLeft={buyDays} />

          <CommandCenter
            cycle={cycle}
            score={cycleScoreRes.data ?? null}
            scoreLoading={cycleScoreRes.isLoading || cycleScoreRes.isFetching}
            price={priceRes.data?.price ?? null}
            height={halving.height}
            nextHalvingBlock={halving.nextHalvingBlock}
            lastHalvingBlock={halving.lastHalvingBlock}
            buyDays={buyDays}
            sellDays={sellDays}
            isBuyActive={isBuyActive}
            isSellActive={isSellActive}
            buyProgress={buyProgress}
            blockProgress={blockProgress}
            blocksRemaining={blocksRemaining}
          />

          {/* Preview after halving + Share + Embed */}
          <div className="flex flex-col items-center gap-3 px-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="group inline-flex items-center gap-2.5 rounded-full border-2 border-primary/30 bg-primary-soft px-6 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
              Preview the homepage after the buy window
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            </button>
            <ShareButton captureRef={cycleShareCardRef} />
            <Link
              to="/embed-kit"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Open Embed Kit — badges, score widgets & themes
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ===== HOW IT WORKS SECTION ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How BTC<span className="text-primary">500</span> Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              A dead-simple, rules-based Bitcoin investment strategy built around the halving cycle.
              No charts, no TA, no emotions.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <HowItWorksCard
              icon={Target}
              step="1"
              title="Buy 500 Days Before"
              description="Set your buy order exactly 500 days before the next halving. The countdown above tells you exactly when."
              accent="var(--primary)"
              accentSoft="var(--primary-soft)"
            />
            <HowItWorksCard
              icon={Zap}
              step="2"
              title="Hold Through Halving"
              description="Hold your position as the halving event passes. This is where the magic happens — reduced supply meets sustained demand."
              accent="var(--info)"
              accentSoft="oklch(0.95 0.04 240)"
            />
            <HowItWorksCard
              icon={Shield}
              step="3"
              title="Sell 500 Days After"
              description="Exit exactly 500 days after halving. Lock in profits and wait for the next cycle. Rinse and repeat every ~4 years."
              accent="var(--success)"
              accentSoft="var(--success-soft)"
            />
          </div>
        </motion.section>

        {/* ===== HISTORICAL RETURNS PREVIEW ===== */}
        {completedCycles.length > 0 && (
          <motion.section
            initial={{ y: 12, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20"
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Historical Performance
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                The BTC<span className="text-primary">500</span> strategy has delivered exceptional
                returns across every halving cycle since 2012.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {completedCycles.map((cycle, i) => (
                <motion.div
                  key={cycle.label}
                  initial={{ y: 12, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-[24px] border border-border/60 bg-card p-5"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {cycle.label}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy Price</span>
                      <span className="font-semibold">
                        {cycle.buyPrice ? formatUsd(cycle.buyPrice) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sell Price</span>
                      <span className="font-semibold">
                        {cycle.sellPrice ? formatUsd(cycle.sellPrice) : "—"}
                      </span>
                    </div>
                    <div className="border-t border-border/40 pt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return</span>
                        <span
                          className="font-bold"
                          style={{
                            color:
                              cycle.returnPercent && cycle.returnPercent > 0
                                ? "var(--success)"
                                : "var(--destructive)",
                          }}
                        >
                          {cycle.returnPercent !== null
                            ? `${cycle.returnPercent > 0 ? "+" : ""}${cycle.returnPercent.toFixed(0)}%`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/simulator"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                <Calculator className="h-4 w-4" />
                Calculate Your Returns
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>
        )}

        {/* ===== FEATURE CARDS — EXPLORE TOOLS ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore All Tools</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Go beyond the countdown. Dive deeper into Bitcoin data, strategy, and market insights.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              to="/simulator"
              icon={Calculator}
              title="Investment Simulator"
              description={
                <>
                  See exactly how much you'd have earned using the BTC
                  <span className="text-primary">500</span> strategy across every halving cycle
                  since 2012.
                </>
              }
              accent="var(--primary)"
              accentSoft="var(--primary-soft)"
            />
            <FeatureCard
              to="/timeline"
              icon={LineChart}
              title="Time Machine"
              description="Replay any day in Bitcoin's halving history. Watch prices evolve in real-time through an interactive timeline."
              accent="var(--info)"
              accentSoft="oklch(0.95 0.04 240)"
            />
            <FeatureCard
              to="/articles"
              icon={BookOpen}
              title="Strategy Articles"
              description={
                <>
                  Deep dives into the BTC<span className="text-primary">500</span> strategy,
                  NUPL/RUPL indicators, on-chain analysis, and more.
                </>
              }
              accent="var(--success)"
              accentSoft="var(--success-soft)"
            />
            <FeatureCard
              to="/insider-trading"
              icon={TrendingUp}
              title="Insider Trading Tracker"
              description="Monitor insider transactions at major crypto companies. See who's buying and selling."
              accent="oklch(0.65 0.15 155)"
              accentSoft="oklch(0.95 0.04 155)"
            />
            <FeatureCard
              to="/liquidation"
              icon={Flame}
              title="Liquidation Dashboard"
              description="Track real-time crypto liquidations across exchanges. See where leverage is getting wiped out."
              accent="oklch(0.577 0.245 27.325)"
              accentSoft="oklch(0.95 0.04 30)"
            />
            <FeatureCard
              to="/bear-market"
              icon={TrendingUp}
              title="Bear Market Meter"
              description="On-chain bottom composite — MVRV, Puell, NUPL and more — feeding the Cycle Score."
              accent="oklch(0.6 0.14 25)"
              accentSoft="oklch(0.95 0.03 25)"
            />
            <FeatureCard
              to="/dca"
              icon={LineChart}
              title="DCA vs Lump Sum"
              description="Compare spreading buys and sells over days versus going all-in at BTC500 dates."
              accent="oklch(0.65 0.12 280)"
              accentSoft="oklch(0.95 0.03 280)"
            />
            <FeatureCard
              to="/embed-kit"
              icon={LayoutTemplate}
              title="Embed Kit"
              description="Drop live countdown badges and cycle score widgets on blogs, newsletters, and dashboards."
              accent="var(--info)"
              accentSoft="oklch(0.95 0.04 240)"
            />
          </div>
        </motion.section>

        {/* ===== LATEST ARTICLES ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Articles</h2>
              <p className="mt-2 text-muted-foreground">In-depth analysis and strategy guides.</p>
            </div>
            <Link
              to="/articles"
              className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {latestArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
            >
              View all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        {/* ===== FAQ (visible content mirrors FAQPage JSON-LD for rich results) ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
          aria-labelledby="faq-heading"
        >
          <div className="mb-8 text-center">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Quick answers about the BTC<span className="text-primary">500</span> strategy, Bitcoin
              halvings, and the free tools on this site.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </motion.section>

        {/* ===== FINAL CTA ===== */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card p-10 text-center shadow-sm sm:p-16">
            <div className="pointer-events-none absolute -left-16 -top-16 opacity-[0.04]">
              <BtcLogo size={300} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Master the Halving Cycle?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                The BTC<span className="text-primary">500</span> strategy gives you a clear,
                data-backed plan. No guesswork, no FOMO, no emotional trading. Just a proven system.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                >
                  <Calculator className="h-4 w-4" />
                  Try the Simulator
                </Link>
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  Read the Strategy
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Data refreshes automatically. Halving estimate from Bitcoin block height · BTC price from
          Binance, CoinGecko, Coinbase & Kraken.
        </p>
      </main>

      {/* Hidden share card for social media image generation */}
      <div style={{ position: "absolute", left: -9999, top: 0, pointerEvents: "none" }}>
        <CycleShareCard
          ref={cycleShareCardRef}
          cycle={cycle}
          price={priceRes.data?.price ?? null}
        />
      </div>

      {/* Preview modal — shows how the homepage looks after the 500-days-before-halving day */}
      <PhasePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        cycle={cycle}
        currentPrice={priceRes.data?.price ?? null}
        buyPrice={previewBuyPrice}
        buyDate={previewBuyDate}
        sellDate={previewSellDate}
      />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-border/60 bg-card open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
        <h3 className="flex-1 text-sm font-semibold text-foreground sm:text-base">{question}</h3>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
      </div>
    </details>
  );
}

function HowItWorksCard({
  icon: Icon,
  step,
  title,
  description,
  accent,
  accentSoft,
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
  accent: string;
  accentSoft: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-6 transition-all hover:shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: accentSoft, color: accent }}
        >
          {step}
        </span>
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  to,
  icon: Icon,
  title,
  description,
  accent,
  accentSoft,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  accent: string;
  accentSoft: string;
}) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -2 }}
        className="group rounded-[24px] border border-border/60 bg-card p-6 transition-all hover:shadow-sm"
      >
        <span
          className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: accentSoft }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </span>
        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div
          className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: accent }}
        >
          Explore
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </motion.div>
    </Link>
  );
}

function ArticleCard({ article, index }: { article: ArticleMeta; index: number }) {
  return (
    <Link to={`/articles/${article.slug}` as "/articles/btc500-strategy"}>
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group rounded-[24px] border border-border/60 bg-card p-6 transition-all hover:shadow-sm"
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>{article.articleSection}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {article.description}
        </p>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
          Read article
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </motion.div>
    </Link>
  );
}
