/**
 * Cycle Score / "Is the script intact?" — pure scoring logic.
 *
 * Compares the current cycle's price path to historical halving cycles,
 * combines phase context + on-chain bottom heat into one narrative status.
 */

import type { Phase } from "./phase";

export type ScriptStatus =
  | "script_intact"
  | "late_cycle_heat"
  | "capitulation_zone"
  | "early_cycle"
  | "mid_cycle"
  | "awaiting_data";

export type CycleScoreComponentId = "pricePath" | "drawdown" | "phase" | "onChain";

export interface CycleScoreComponent {
  id: CycleScoreComponentId;
  label: string;
  score: number; // 0–100 contribution health
  weight: number;
  detail: string;
  /** Optional secondary metric for UI */
  metric?: string;
}

/** Methodology shown in Command Center tooltips / help copy. */
export interface CycleScoreComponentMeta {
  id: CycleScoreComponentId;
  label: string;
  /** One-line summary */
  summary: string;
  /** How the 0–100 sub-score is computed */
  calculation: string;
  /** Weight in the overall cycle score */
  weightLabel: string;
  /** Where the underlying data comes from */
  dataSources: string;
}

export const CYCLE_SCORE_COMPONENT_META: Record<CycleScoreComponentId, CycleScoreComponentMeta> = {
  pricePath: {
    id: "pricePath",
    label: "Price path",
    summary: "How close today’s price is to the historical median path at this day in the cycle.",
    calculation:
      "Compute days since the last halving. For each prior completed cycle, take price on that same day-offset ÷ price on that cycle’s halving day. Take the median of those multiples. Current multiple = live BTC price ÷ this cycle’s price on the last-halving date. Score is higher when current multiple is within ~±25–35% of the median; running much hotter or colder lowers the score (weight 40%).",
    weightLabel: "40% of Cycle Score",
    dataSources:
      "Historical daily closes from the site BTC price archive (CSV; CoinGecko max series) with Bitstamp OHLC fallback for missing dates. Live price from Binance → CoinGecko → Coinbase → Kraken. Halving dates from the known Bitcoin block schedule.",
  },
  drawdown: {
    id: "drawdown",
    label: "Drawdown",
    summary: "Distance from the estimated peak price of the current cycle so far.",
    calculation:
      "Peak ≈ max daily close from the last-halving date through today (sampled from the historical price archive). Drawdown = (peak − live price) / peak. Mild pullbacks score higher; near-all-time highs or very deep dumps score lower (weight 20%).",
    weightLabel: "20% of Cycle Score",
    dataSources:
      "Cycle peak from the BTC daily price archive (CSV). Live price from exchange spot APIs (Binance / CoinGecko / Coinbase / Kraken).",
  },
  phase: {
    id: "phase",
    label: "Phase",
    summary: "Where we sit on the BTC500 calendar: wait-to-buy, hold/sell window, or cycle done.",
    calculation:
      "Buy date = next halving − 500 days; sell date = next halving + 500 days. Phase is derived from “now” vs those dates. Score is high when the rule is clear (waiting for buy, holding post-halving, or nearing sell); slightly adjusted as windows approach (weight 25%).",
    weightLabel: "25% of Cycle Score",
    dataSources:
      "Next/last halving times estimated from live Bitcoin tip height (mempool.space / blockchain.info / blockstream) and ~10 min average block time, plus the known 210k-block epoch schedule.",
  },
  onChain: {
    id: "onChain",
    label: "On-chain",
    summary:
      "Same bear-market bottom composite as the Bear Market page (15 BitView indicators, max 30 pts).",
    calculation:
      "Uses the identical scoring as /bear-market: each of 15 indicators awards its tier points when in bottom zone (Tier-1 = 3 pts, Tier-2 = 2, Tier-3 = 1 → max 30). Labels: ≥15 STRONG BUY, ≥10 MODERATE BUY, ≥5 CAUTIOUS, else NOT A BOTTOM. For Cycle Score health, higher bottom heat lowers this sub-score (weight 15%) — more stress on the “script intact” narrative, not a contradiction of the bear page.",
    weightLabel: "15% of Cycle Score",
    dataSources:
      "BitView Space daily series (bitview.space) for all 15 indicators used on the Bear Market page (MVRV, Puell, NUPL, STH-MVRV, ATH drawdown, RHODL, Reserve Risk, SOPR, LTH-MVRV, Supply in Profit, STH/LTH-NUPL, LTH Supply, Liveliness, Vaultedness).",
  },
};

export const CYCLE_SCORE_OVERALL_META = {
  label: "Cycle Score",
  summary: "Weighted “is the script intact?” composite from path, drawdown, phase, and on-chain.",
  calculation:
    "Overall = round(0.40×Price path + 0.20×Drawdown + 0.25×Phase + 0.15×On-chain). Status labels also use path vs median, drawdown ≥ 50%, and on-chain bottom score ≥ 15/30 (STRONG BUY zone).",
  dataSources:
    "Combines exchange spot prices, historical daily BTC closes, block-height-based halving estimates, and the full BitView bear-bottom indicator set (same as /bear-market). Cached ~15 minutes server-side.",
};

export interface CycleScoreResult {
  /** 0–100 overall script-integrity score */
  score: number;
  status: ScriptStatus;
  headline: string;
  subline: string;
  /** Plain-English next action for the Command Center */
  action: string;
  actionTone: "wait" | "buy" | "hold" | "sell" | "neutral";
  components: CycleScoreComponent[];
  phase: Phase;
  daysFromLastHalving: number;
  daysUntilBuy: number;
  daysUntilSell: number;
  daysUntilHalving: number;
  currentPrice: number | null;
  /** Price as multiple of this cycle's price at last halving */
  currentMultiple: number | null;
  /** Median multiple of past cycles at the same day-offset */
  medianMultiple: number | null;
  /** Drawdown from estimated cycle peak (0–1, e.g. 0.25 = −25%) */
  drawdownFromPeak: number | null;
  /**
   * On-chain bottom points — same scale as Bear Market page (0–30).
   * Higher = more bottom-zone indicators triggered.
   */
  onChainBottomPoints: number | null;
  /** Max on-chain points (always 30 when loaded) */
  onChainMaxPoints: number;
  /** Indicators triggered / loaded (for UI parity with bear market) */
  onChainTriggeredCount: number | null;
  onChainLoadedCount: number | null;
  onChainLabel: string | null;
  /** Share-ready one-liner */
  punchline: string;
  updatedAt: string;
}

export interface CycleScoreInputs {
  phase: Phase;
  daysFromLastHalving: number;
  daysUntilBuy: number;
  daysUntilSell: number;
  daysUntilHalving: number;
  currentPrice: number | null;
  /** Multiple of price at last halving (currentPrice / priceAtLastHalving) */
  currentMultiple: number | null;
  /** Past-cycle multiples at the same days-from-halving offset */
  historicalMultiples: number[];
  /** Drawdown from cycle peak, 0–1 */
  drawdownFromPeak: number | null;
  /** Bear-market composite points (0–30), same as /bear-market */
  onChainBottomPoints: number | null;
  onChainMaxPoints?: number;
  onChainTriggeredCount?: number | null;
  onChainLoadedCount?: number | null;
  onChainLabel?: string | null;
  now?: Date;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Score how close current path is to historical median (100 = on path). */
function scorePricePath(
  currentMultiple: number | null,
  historicalMultiples: number[],
): { score: number; medianMultiple: number | null; detail: string; metric?: string } {
  const med = median(historicalMultiples);
  if (currentMultiple == null || med == null || med <= 0) {
    return {
      score: 55,
      medianMultiple: med,
      detail: "Not enough historical path data yet — using neutral baseline.",
    };
  }

  const ratio = currentMultiple / med;
  // Within ~25% of median path = high integrity
  // Far above = froth; far below = underperformance / capitulation
  let score: number;
  if (ratio >= 0.75 && ratio <= 1.35) {
    score = 90 - Math.abs(1 - ratio) * 40;
  } else if (ratio > 1.35 && ratio <= 2.2) {
    score = 70 - (ratio - 1.35) * 35;
  } else if (ratio > 2.2) {
    score = 30 - Math.min(20, (ratio - 2.2) * 10);
  } else if (ratio >= 0.45) {
    score = 55 - (0.75 - ratio) * 60;
  } else {
    score = 25;
  }

  const pctVsMedian = ((currentMultiple - med) / med) * 100;
  const sign = pctVsMedian >= 0 ? "+" : "";
  return {
    score: clamp(score),
    medianMultiple: med,
    detail:
      ratio > 1.5
        ? `Price is running hot vs past cycles at this day (${sign}${pctVsMedian.toFixed(0)}% vs median path).`
        : ratio < 0.7
          ? `Price is lagging the historical script (${sign}${pctVsMedian.toFixed(0)}% vs median path).`
          : `Price is tracking prior cycles closely (${sign}${pctVsMedian.toFixed(0)}% vs median path).`,
    metric: `${currentMultiple.toFixed(2)}× vs ${med.toFixed(2)}× median`,
  };
}

function scoreDrawdown(drawdownFromPeak: number | null, phase: Phase): {
  score: number;
  detail: string;
  metric?: string;
} {
  if (drawdownFromPeak == null) {
    return { score: 60, detail: "Cycle peak not yet established in available data." };
  }

  const ddPct = drawdownFromPeak * 100;
  let score: number;
  // Mild pullbacks are healthy; deep dumps in late cycle can be late-cycle shakeouts
  // or early-cycle opportunities depending on phase.
  if (ddPct < 8) {
    score = phase === "wait-sell" ? 72 : 85; // near highs late = hotter
  } else if (ddPct < 25) {
    score = 88;
  } else if (ddPct < 45) {
    score = 70;
  } else if (ddPct < 65) {
    score = 50;
  } else {
    score = 35;
  }

  return {
    score: clamp(score),
    detail:
      ddPct < 10
        ? `Near cycle highs (−${ddPct.toFixed(0)}% from peak) — watch for late-cycle heat.`
        : ddPct < 40
          ? `Healthy distance from peak (−${ddPct.toFixed(0)}%) — room for the script to play out.`
          : `Deep drawdown from cycle peak (−${ddPct.toFixed(0)}%) — potential capitulation territory.`,
    metric: `−${ddPct.toFixed(0)}% from peak`,
  };
}

function scorePhase(
  phase: Phase,
  daysUntilBuy: number,
  daysUntilSell: number,
  daysFromLastHalving: number,
): { score: number; detail: string; metric?: string } {
  if (phase === "wait-buy") {
    if (daysUntilBuy <= 30) {
      return {
        score: 92,
        detail: "Buy window opens soon. Stay liquid and follow the rule.",
        metric: `${daysUntilBuy}d to buy`,
      };
    }
    if (daysUntilBuy <= 120) {
      return {
        score: 85,
        detail: "Approaching the BTC500 buy window. The plan is simple: wait.",
        metric: `${daysUntilBuy}d to buy`,
      };
    }
    return {
      score: 80,
      detail: "Between cycles. Accumulate dry powder — buy only at the signal.",
      metric: `${daysUntilBuy}d to buy`,
    };
  }

  if (phase === "wait-sell") {
    if (daysFromLastHalving < 180) {
      return {
        score: 88,
        detail: "Post-halving hold window. History says patience compounds here.",
        metric: `${daysUntilSell}d to sell`,
      };
    }
    if (daysUntilSell <= 60) {
      return {
        score: 78,
        detail: "Sell window approaching. Prepare exits — don't improvise.",
        metric: `${daysUntilSell}d to sell`,
      };
    }
    return {
      score: 82,
      detail: "In the hold phase of the script. No heroics required.",
      metric: `${daysUntilSell}d to sell`,
    };
  }

  return {
    score: 75,
    detail: "Cycle complete. Reset and wait for the next buy signal.",
    metric: "cycle done",
  };
}

function scoreOnChain(
  onChainBottomPoints: number | null,
  opts?: {
    maxPoints?: number;
    triggeredCount?: number | null;
    label?: string | null;
  },
): {
  score: number;
  detail: string;
  metric?: string;
} {
  const max = opts?.maxPoints ?? 30;
  if (onChainBottomPoints == null) {
    return { score: 60, detail: "On-chain bottom gauges unavailable right now." };
  }

  // Same thresholds as Bear Market page labels (on 0–30 scale)
  // High bottom heat → lower script-health sub-score (stress on the cycle narrative)
  const label =
    opts?.label ??
    (onChainBottomPoints >= 15
      ? "STRONG BUY"
      : onChainBottomPoints >= 10
        ? "MODERATE BUY"
        : onChainBottomPoints >= 5
          ? "CAUTIOUS"
          : "NOT A BOTTOM");
  const trig =
    opts?.triggeredCount != null ? `${opts.triggeredCount} indicators triggered · ` : "";

  if (onChainBottomPoints >= 15) {
    return {
      score: 40,
      detail: `${trig}Deep on-chain bottom zone (${label}) — same composite as Bear Market page.`,
      metric: `${onChainBottomPoints}/${max} · ${label}`,
    };
  }
  if (onChainBottomPoints >= 10) {
    return {
      score: 55,
      detail: `${trig}Moderate bottom heat (${label}) — secondary gauges firing; not full capitulation.`,
      metric: `${onChainBottomPoints}/${max} · ${label}`,
    };
  }
  if (onChainBottomPoints >= 5) {
    return {
      score: 70,
      detail: `${trig}Cautious on-chain stress (${label}) — early bottom signals only.`,
      metric: `${onChainBottomPoints}/${max} · ${label}`,
    };
  }
  if (onChainBottomPoints >= 1) {
    return {
      score: 80,
      detail: `${trig}Mild bottom noise (${label}) — not a classic bottom zone.`,
      metric: `${onChainBottomPoints}/${max} · ${label}`,
    };
  }
  return {
    score: 86,
    detail: "On-chain not in bottom territory — same 15-indicator composite as Bear Market.",
    metric: `0/${max} · ${label}`,
  };
}

function deriveStatus(
  score: number,
  currentMultiple: number | null,
  medianMultiple: number | null,
  drawdownFromPeak: number | null,
  onChainBottomPoints: number | null,
  phase: Phase,
  daysFromLastHalving: number,
): ScriptStatus {
  const hotPath =
    currentMultiple != null &&
    medianMultiple != null &&
    medianMultiple > 0 &&
    currentMultiple / medianMultiple >= 1.6;
  const deepDump = drawdownFromPeak != null && drawdownFromPeak >= 0.5;
  // Align with Bear Market "STRONG BUY" threshold on the 0–30 scale
  const capOnChain = onChainBottomPoints != null && onChainBottomPoints >= 15;

  if (deepDump || capOnChain) return "capitulation_zone";
  if (hotPath && (phase === "wait-sell" || daysFromLastHalving > 350)) {
    return "late_cycle_heat";
  }
  if (daysFromLastHalving < 120 && phase !== "wait-buy") return "early_cycle";
  if (score >= 72) return "script_intact";
  if (daysFromLastHalving < 400) return "mid_cycle";
  return score >= 55 ? "script_intact" : "mid_cycle";
}

function statusCopy(
  status: ScriptStatus,
  phase: Phase,
  daysUntilBuy: number,
  daysUntilSell: number,
): { headline: string; subline: string; action: string; actionTone: CycleScoreResult["actionTone"]; punchline: string } {
  switch (status) {
    case "script_intact":
      return {
        headline: "Script intact",
        subline: "Price and phase are tracking the historical playbook.",
        action:
          phase === "wait-buy"
            ? daysUntilBuy <= 30
              ? "Buy window is close — stay ready, don't front-run."
              : "Do nothing. Wait for the BTC500 buy signal."
            : phase === "wait-sell"
              ? daysUntilSell <= 30
                ? "Sell window is close — prepare to take profits on plan."
                : "Hold the plan. No need to invent a new strategy."
              : "Cycle complete. Wait for the next buy date.",
        actionTone:
          phase === "wait-buy" ? (daysUntilBuy <= 30 ? "buy" : "wait") : phase === "wait-sell" ? "hold" : "neutral",
        punchline: "Still on script.",
      };
    case "late_cycle_heat":
      return {
        headline: "Late-cycle heat",
        subline: "This cycle is running hotter than the historical median path.",
        action:
          phase === "wait-sell"
            ? "Stay disciplined — heat is not a new buy signal. Follow the sell date."
            : "Respect the plan. Euphoria is usually not the entry.",
        actionTone: phase === "wait-sell" ? "sell" : "wait",
        punchline: "Running hot vs history.",
      };
    case "capitulation_zone":
      return {
        headline: "Capitulation zone",
        subline: "Deep drawdown and/or on-chain stress — classic late-bear conditions.",
        action:
          phase === "wait-buy"
            ? "This is when the plan matters most. Wait for the buy window — then act."
            : "Stress is elevated. Stick to rules, not headlines.",
        actionTone: phase === "wait-buy" ? "buy" : "hold",
        punchline: "Capitulation conditions.",
      };
    case "early_cycle":
      return {
        headline: "Early cycle",
        subline: "Still early relative to prior post-halving arcs.",
        action: "Patience is the strategy. Let the cycle mature.",
        actionTone: "hold",
        punchline: "Still early.",
      };
    case "mid_cycle":
      return {
        headline: "Mid-cycle drift",
        subline: "Some divergence from the clean historical path — not broken, not euphoric.",
        action: "Stay on BTC500 rules. Noise is not a signal.",
        actionTone: "wait",
        punchline: "Noise, not a new plan.",
      };
    default:
      return {
        headline: "Gathering signal",
        subline: "Building the cycle score from live data.",
        action: "Check back shortly for a full read.",
        actionTone: "neutral",
        punchline: "Loading the script…",
      };
  }
}

/**
 * Pure function: build a CycleScoreResult from pre-fetched inputs.
 */
export function computeCycleScore(input: CycleScoreInputs): CycleScoreResult {
  const path = scorePricePath(input.currentMultiple, input.historicalMultiples);
  const dd = scoreDrawdown(input.drawdownFromPeak, input.phase);
  const ph = scorePhase(
    input.phase,
    input.daysUntilBuy,
    input.daysUntilSell,
    input.daysFromLastHalving,
  );
  const oc = scoreOnChain(input.onChainBottomPoints, {
    maxPoints: input.onChainMaxPoints ?? 30,
    triggeredCount: input.onChainTriggeredCount,
    label: input.onChainLabel,
  });

  const components: CycleScoreComponent[] = [
    {
      id: "pricePath",
      label: "Price path",
      score: path.score,
      weight: 0.4,
      detail: path.detail,
      metric: path.metric,
    },
    {
      id: "drawdown",
      label: "Drawdown",
      score: dd.score,
      weight: 0.2,
      detail: dd.detail,
      metric: dd.metric,
    },
    {
      id: "phase",
      label: "Phase",
      score: ph.score,
      weight: 0.25,
      detail: ph.detail,
      metric: ph.metric,
    },
    {
      id: "onChain",
      label: "On-chain",
      score: oc.score,
      weight: 0.15,
      detail: oc.detail,
      metric: oc.metric,
    },
  ];

  const weighted = components.reduce((sum, c) => sum + c.score * c.weight, 0);
  const score = Math.round(clamp(weighted));

  const status = deriveStatus(
    score,
    input.currentMultiple,
    path.medianMultiple,
    input.drawdownFromPeak,
    input.onChainBottomPoints,
    input.phase,
    input.daysFromLastHalving,
  );

  const copy = statusCopy(status, input.phase, input.daysUntilBuy, input.daysUntilSell);

  return {
    score,
    status,
    headline: copy.headline,
    subline: copy.subline,
    action: copy.action,
    actionTone: copy.actionTone,
    components,
    phase: input.phase,
    daysFromLastHalving: input.daysFromLastHalving,
    daysUntilBuy: input.daysUntilBuy,
    daysUntilSell: input.daysUntilSell,
    daysUntilHalving: input.daysUntilHalving,
    currentPrice: input.currentPrice,
    currentMultiple: input.currentMultiple,
    medianMultiple: path.medianMultiple,
    drawdownFromPeak: input.drawdownFromPeak,
    onChainBottomPoints: input.onChainBottomPoints,
    onChainMaxPoints: input.onChainMaxPoints ?? 30,
    onChainTriggeredCount: input.onChainTriggeredCount ?? null,
    onChainLoadedCount: input.onChainLoadedCount ?? null,
    onChainLabel: input.onChainLabel ?? null,
    punchline: copy.punchline,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
}

export function statusAccent(status: ScriptStatus): {
  color: string;
  soft: string;
  label: string;
} {
  switch (status) {
    case "script_intact":
      return { color: "var(--success)", soft: "var(--success-soft)", label: "Script intact" };
    case "late_cycle_heat":
      return { color: "var(--primary)", soft: "var(--primary-soft)", label: "Late-cycle heat" };
    case "capitulation_zone":
      return {
        color: "var(--destructive)",
        soft: "oklch(0.95 0.04 25)",
        label: "Capitulation zone",
      };
    case "early_cycle":
      return { color: "var(--info)", soft: "oklch(0.95 0.04 240)", label: "Early cycle" };
    case "mid_cycle":
      return {
        color: "var(--muted-foreground)",
        soft: "var(--muted)",
        label: "Mid-cycle drift",
      };
    default:
      return {
        color: "var(--muted-foreground)",
        soft: "var(--muted)",
        label: "Gathering signal",
      };
  }
}
