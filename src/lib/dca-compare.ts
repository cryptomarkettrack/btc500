/**
 * Client-side DCA vs lump-sum comparison math for the BTC500 strategy.
 */

import type { DcaServerResult } from "./dca.functions";
import type { SimulatorResult } from "./simulator.functions";

export interface CycleComparison {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  /** Lump sum: buy price on day 0, sell price on day 0 */
  lumpSumBuyPrice: number | null;
  lumpSumSellPrice: number | null;
  lumpSumMultiplier: number | null;
  lumpSumReturn: number | null;
  /** DCA: average buy price, average sell price */
  dcaBuyPrice: number | null;
  dcaSellPrice: number | null;
  dcaMultiplier: number | null;
  dcaReturn: number | null;
  /** DCA days used */
  dcaBuyDaysUsed: number;
  dcaSellDaysUsed: number;
  /** Which performed better: "lump-sum" | "dca" | "tie" | null */
  winner: string | null;
  /** Price used for buy summary display */
  buyPricesAvailable: number;
  sellPricesAvailable: number;
}

export function buildCycleComparisons(
  dcaData: DcaServerResult,
  simData: Pick<SimulatorResult, "cycles">,
  investmentAmount: number,
  dcaSellDays: number,
): CycleComparison[] {
  return dcaData.cycles.map((dcaCycle, i) => {
    const simCycle = simData.cycles[i];

    const lumpSumBuyPrice = simCycle?.buyPrice ?? null;
    const lumpSumSellPrice = simCycle?.sellPrice ?? null;
    const lumpSumMultiplier =
      lumpSumBuyPrice && lumpSumSellPrice ? lumpSumSellPrice / lumpSumBuyPrice : null;
    const lumpSumReturn =
      lumpSumMultiplier !== null && investmentAmount > 0
        ? investmentAmount * lumpSumMultiplier - investmentAmount
        : null;

    // DCA buy: spread investment over available buy days
    const validBuyPrices = dcaCycle.buyPrices.filter((p): p is number => p !== null);
    const dcaBuyDaysUsed = validBuyPrices.length;

    let dcaBuyPrice: number | null = null;
    if (dcaBuyDaysUsed > 0) {
      dcaBuyPrice = validBuyPrices.reduce((sum, p) => sum + p, 0) / dcaBuyDaysUsed;
    } else if (lumpSumBuyPrice !== null) {
      dcaBuyPrice = lumpSumBuyPrice;
    }

    // DCA sell: spread sell over available sell days
    const validSellPrices = dcaCycle.sellPrices.filter((p): p is number => p !== null);
    const dcaSellDaysUsed = validSellPrices.length;

    let dcaSellPrice: number | null = null;
    if (dcaSellDaysUsed > 0) {
      dcaSellPrice = validSellPrices.reduce((sum, p) => sum + p, 0) / validSellPrices.length;
    } else if (lumpSumSellPrice !== null) {
      dcaSellPrice = validSellPrices[0] ?? lumpSumSellPrice;
    }
    if (dcaSellDays === 0 && dcaSellPrice === null) {
      dcaSellPrice = lumpSumSellPrice;
    }

    const dcaMultiplier = dcaBuyPrice && dcaSellPrice ? dcaSellPrice / dcaBuyPrice : null;
    const dcaReturn =
      dcaMultiplier !== null && investmentAmount > 0
        ? investmentAmount * dcaMultiplier - investmentAmount
        : null;

    let winner: string | null = null;
    if (lumpSumReturn !== null && dcaReturn !== null) {
      if (lumpSumReturn > dcaReturn) winner = "lump-sum";
      else if (dcaReturn > lumpSumReturn) winner = "dca";
      else winner = "tie";
    }

    return {
      label: dcaCycle.label,
      halvingDate: dcaCycle.halvingDate,
      buyDate: dcaCycle.buyDate,
      sellDate: dcaCycle.sellDate,
      lumpSumBuyPrice,
      lumpSumSellPrice,
      lumpSumMultiplier,
      lumpSumReturn,
      dcaBuyPrice,
      dcaSellPrice,
      dcaMultiplier,
      dcaReturn,
      dcaBuyDaysUsed,
      dcaSellDaysUsed,
      winner,
      buyPricesAvailable: dcaCycle.buyDaysAvailable,
      sellPricesAvailable: dcaCycle.sellDaysAvailable,
    };
  });
}

export interface DcaTotals {
  lumpSumTotalReturn: number | null;
  dcaTotalReturn: number | null;
  lumpSumTotalProfit: number | null;
  dcaTotalProfit: number | null;
  lumpSumBetter: boolean | null;
  diff: number | null;
  diffPercent: number | null;
}

export function computeDcaTotals(
  comparisons: CycleComparison[],
  investmentAmount: number,
): DcaTotals {
  const withData = comparisons.filter((c) => c.lumpSumReturn !== null);
  const count = withData.length;

  if (count === 0) {
    return {
      lumpSumTotalReturn: null,
      dcaTotalReturn: null,
      lumpSumTotalProfit: null,
      dcaTotalProfit: null,
      lumpSumBetter: null,
      diff: null,
      diffPercent: null,
    };
  }

  const totalInvestment = investmentAmount * count;

  const lumpSumTotalValue = withData.reduce(
    (sum, c) => sum + (c.lumpSumReturn ?? 0) + investmentAmount,
    0,
  );
  const dcaTotalValue = withData.reduce(
    (sum, c) => sum + (c.dcaReturn ?? 0) + investmentAmount,
    0,
  );

  const lumpSumProfit = lumpSumTotalValue - totalInvestment;
  const dcaProfit = dcaTotalValue - totalInvestment;

  const diff = lumpSumProfit - dcaProfit;
  const diffPercent =
    dcaProfit !== 0 ? ((lumpSumProfit - dcaProfit) / Math.abs(dcaProfit)) * 100 : null;

  return {
    lumpSumTotalReturn: lumpSumTotalValue,
    dcaTotalReturn: dcaTotalValue,
    lumpSumTotalProfit: lumpSumProfit,
    dcaTotalProfit: dcaProfit,
    lumpSumBetter: lumpSumProfit > dcaProfit,
    diff,
    diffPercent,
  };
}
