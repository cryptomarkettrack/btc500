import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  TrendingDown,
  Target,
  BarChart3,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toCanvas } from "html-to-image";
import { BearMarketShareCard } from "@/components/BearMarketShareCard";
import { IndicatorCard } from "@/components/bear-market/IndicatorCard";
import {
  INDICATORS,
  BOTTOMS,
  fetchIndicatorData,
  getStatusColor,
  getStatusText,
  formatValue,
  computeBearComposite,
} from "@/lib/bear-market/config";

export function BearMarketDashboard() {
  const [indicators, setIndicators] = useState<
    Record<string, { current: number | null; bottoms: (number | null)[] }>
  >({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: INDICATORS.length });
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIndicators() {
      const results: Record<string, { current: number | null; bottoms: (number | null)[] }> = {};
      let done = 0;

      for (const ind of INDICATORS) {
        if (cancelled) return;
        const result = await fetchIndicatorData(ind.apiName);
        results[ind.name] = result;
        done++;
        setProgress({ done, total: INDICATORS.length });
      }

      if (!cancelled) {
        setIndicators(results);
        setLoading(false);
      }
    }

    loadIndicators();
    return () => {
      cancelled = true;
    };
  }, []);

  // Same composite math as Cycle Score on-chain (shared computeBearComposite)
  const bearComposite = useMemo(() => {
    const values: Record<string, number | null> = {};
    for (const ind of INDICATORS) {
      values[ind.name] = indicators[ind.name]?.current ?? null;
    }
    return computeBearComposite(values);
  }, [indicators]);

  const compositeScore = bearComposite.score;
  const scoreLabel = bearComposite.label;
  const triggeredCount = bearComposite.triggeredCount;
  const scoreColor =
    compositeScore >= 15
      ? "text-green-400"
      : compositeScore >= 10
        ? "text-orange-400"
        : compositeScore >= 5
          ? "text-yellow-400"
          : "text-red-400";

  // Build indicator data for the share card
  const shareCardIndicators = useMemo(() => {
    return INDICATORS.map((ind) => ({
      name: ind.name,
      current: indicators[ind.name]?.current ?? null,
      status: getStatusText(ind.name, indicators[ind.name]?.current ?? null),
      tier: ind.tier,
    }));
  }, [indicators]);

  const handleCopyImage = useCallback(async () => {
    const el = shareCardRef.current;
    if (!el) return;
    setCopying(true);
    try {
      const canvas = await toCanvas(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
      });
      if (!blob) throw new Error("Failed to create image blob");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy image to clipboard", err);
    } finally {
      setCopying(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <h1 className="text-3xl font-bold">Is the 2026 Bear Market Over?</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Has Bitcoin bottomed in 2026? Track 15 on-chain indicators and compare current values
            against every bear market bottom since 2011 to determine whether the 2026 bear market is
            truly over — or if more downside is ahead.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Fetching indicators… {progress.done}/{progress.total}
          </p>
          <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!loading && (
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
          {/* Composite Score */}
          <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    2026 Bear Market Bottom Score
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold font-mono ${scoreColor}`}>
                      {compositeScore}
                    </span>
                    <span className="text-2xl text-muted-foreground">/ 30</span>
                  </div>
                  <div className={`text-lg font-semibold mt-1 ${scoreColor}`}>{scoreLabel}</div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-sm text-muted-foreground mb-1">Indicators Triggered</div>
                  <div className="text-3xl font-bold">
                    {triggeredCount}{" "}
                    <span className="text-lg text-muted-foreground">/ {INDICATORS.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {loading
                      ? "Loading..."
                      : `${progress.done}/${progress.total} indicators loaded`}
                  </div>
                </div>
              </div>

              {/* Scoring Legend */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="font-semibold text-green-400">15+ pts</div>
                    <div className="text-muted-foreground">STRONG BUY</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-orange-500/10 border border-orange-500/20">
                  <Target className="h-4 w-4 text-orange-400" />
                  <div>
                    <div className="font-semibold text-orange-400">10-14 pts</div>
                    <div className="text-muted-foreground">MODERATE BUY</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="font-semibold text-yellow-400">5-9 pts</div>
                    <div className="text-muted-foreground">CAUTIOUS</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                  <BarChart3 className="h-4 w-4 text-red-400" />
                  <div>
                    <div className="font-semibold text-red-400">{"<"} 5 pts</div>
                    <div className="text-muted-foreground">NOT A BOTTOM</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Card Section */}
          <Card className="bg-gradient-to-br from-slate-500/5 to-blue-500/5 border-slate-500/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold mb-1">Share Bear Market Analysis</div>
                  <p className="text-xs text-muted-foreground">
                    Generate a shareable image card summarizing all 15 on-chain indicators. Copy it
                    to your clipboard and paste on X.
                  </p>
                </div>
                <button
                  onClick={handleCopyImage}
                  disabled={copying}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                >
                  {copying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy card to clipboard
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Hidden share card for image capture */}
          <div style={{ position: "absolute", left: "-9999px", top: 0, pointerEvents: "none" }}>
            <BearMarketShareCard
              ref={shareCardRef}
              compositeScore={compositeScore}
              scoreLabel={scoreLabel}
              triggeredCount={triggeredCount}
              totalIndicators={INDICATORS.length}
              indicators={shareCardIndicators}
            />
          </div>

          {/* Tier 1: Primary Signals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h2 className="text-xl font-bold">Tier 1 — Primary Signals</h2>
              <Badge variant="destructive" className="text-xs">
                3 pts each
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These 5 indicators have correctly identified every bear market bottom (2011, 2015,
              2018, 2020, 2022). When multiple Tier 1 signals fire together, it's the strongest
              evidence the bear market is over. Check how many are triggered now.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATORS.filter((i) => i.tier === 1).map((ind) => (
                <IndicatorCard
                  key={ind.name}
                  indicator={ind}
                  currentValue={indicators[ind.name]?.current ?? null}
                  bottomValues={indicators[ind.name]?.bottoms ?? BOTTOMS.map(() => null)}
                />
              ))}
            </div>
          </section>

          {/* Tier 2: Confirmation Signals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <h2 className="text-xl font-bold">Tier 2 — Confirmation Signals</h2>
              <Badge variant="outline" className="text-xs border-orange-500/40 text-orange-400">
                2 pts each
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Secondary indicators that confirmed Tier 1 signals at past bottoms. If these are also
              flashing, it adds conviction that the 2026 bear market has reached its end.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATORS.filter((i) => i.tier === 2).map((ind) => (
                <IndicatorCard
                  key={ind.name}
                  indicator={ind}
                  currentValue={indicators[ind.name]?.current ?? null}
                  bottomValues={indicators[ind.name]?.bottoms ?? BOTTOMS.map(() => null)}
                />
              ))}
            </div>
          </section>

          {/* Tier 3: Secondary Signals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="text-xl font-bold">Tier 3 — Secondary Signals</h2>
              <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-400">
                1 pt each
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Longer-term accumulation and HODLing signals observed at past bottoms. These provide
              supporting evidence but are less precise for timing the exact end of the bear market.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATORS.filter((i) => i.tier === 3).map((ind) => (
                <IndicatorCard
                  key={ind.name}
                  indicator={ind}
                  currentValue={indicators[ind.name]?.current ?? null}
                  bottomValues={indicators[ind.name]?.bottoms ?? BOTTOMS.map(() => null)}
                />
              ))}
            </div>
          </section>

          {/* How to Use */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                How to Use This Page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Check the Composite Score</strong> — The
                score at the top shows how many on-chain indicators are in "bear market bottom
                zone." A score of 15+ means 2026 is showing the same capitulation signals that
                marked the end of previous bear markets (2011, 2015, 2018, 2020, 2022).
              </p>
              <p>
                <strong className="text-foreground">2. Focus on Tier 1 First</strong> — MVRV, Puell
                Multiple, NUPL, STH-MVRV, and ATH Drawdown are the most reliable at detecting bear
                market bottoms. If these aren't in bottom zone, the 2026 bear market is probably not
                over yet.
              </p>
              <p>
                <strong className="text-foreground">3. Look for Confluence</strong> — The clearest
                bear market bottoms show 3+ Tier 1 signals + 2+ Tier 2 signals firing together. The
                more indicators triggered, the stronger the case that the bear market is done.
              </p>
              <p>
                <strong className="text-foreground">4. Click "View on BitView"</strong> — Each
                indicator links to its live chart on BitView so you can see the full historical
                context and judge for yourself whether 2026 has truly bottomed.
              </p>
              <p>
                <strong className="text-foreground">5. Historical Context</strong> — Each card shows
                the exact values recorded at past bear market bottoms. Compare today's 2026 values
                to see if we've reached the same capitulation levels — or still have further to
                fall.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/40">
            <p>
              Data from{" "}
              <a
                href="https://bitview.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                BitView
              </a>{" "}
              • 22,582 charts analyzed • {INDICATORS.length} key indicators tracked • Live 2026 data
            </p>
            <p className="mt-1">
              Reference bottoms: Nov 2011 · Jan 2015 · Dec 2018 · Mar 2020 · Nov 2022
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
