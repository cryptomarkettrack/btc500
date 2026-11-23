/**
 * Quotable, data-derived answers for the AEO gaps named in AEO.md §7.
 *
 * Both helpers read the same `CycleResult[]` the simulator and pillar use, so
 * an answer engine cannot quote a number that disagrees with the on-page
 * tables. Nothing here is a literal price or a forecast: a missing print stays
 * null and an unanswered question stays null rather than being filled in.
 */

import { CYCLE_DATASET_PATH } from "./cycle-dataset.ts";
import { buyAndHold, runSimulator, type StartYear } from "./simulator-math.ts";
import type { CycleResult } from "./simulator-result.ts";

export const CANONICAL_EXAMPLE_AMOUNT = 10_000;
export const CANONICAL_START_YEAR: StartYear = 2012;

export interface CalculatorWindow {
  label: string;
  entryDate: string;
  sellDate: string;
  multiple: number | null;
  value: number | null;
}

export interface CalculatorAnswer {
  amount: number;
  windows: CalculatorWindow[];
  completed: number;
  medianValue: number | null;
  sourcePath: string;
  caveat: string;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * "What would $10,000 invested 500 days before each halving be worth at T+500?"
 * One line per completed window, plus the median — the number a reader or an
 * answer engine can quote without running the tool.
 */
export function buildCalculatorAnswer(
  cycles: CycleResult[],
  amount = CANONICAL_EXAMPLE_AMOUNT,
): CalculatorAnswer {
  const windows: CalculatorWindow[] = cycles.map((cycle) => ({
    label: cycle.label,
    entryDate: cycle.buyDate,
    sellDate: cycle.sellDate,
    multiple: cycle.returnMultiplier,
    value: cycle.returnMultiplier !== null && amount > 0 ? cycle.returnMultiplier * amount : null,
  }));
  const values = windows.map((w) => w.value).filter((value): value is number => value !== null);

  return {
    amount,
    windows,
    completed: values.length,
    medianValue: median(values),
    sourcePath: CYCLE_DATASET_PATH,
    caveat:
      "Four completed windows from a daily-close archive. Fees, taxes and slippage are excluded. Historical observation, not a forecast or financial advice.",
  };
}

export interface EntryComparisonWindow {
  label: string;
  ruleMultiple: number | null;
  halvingEntryMultiple: number | null;
  /** How much earlier T-500 entry beat an entry on the halving day, in percent. */
  entryAdvantagePercent: number | null;
}

export interface StrategyComparisonAnswer {
  amount: number;
  from: StartYear;
  /** Compound the same amount through every completed T-500 -> T+500 window. */
  ruleValue: number | null;
  ruleMultiple: number | null;
  /** Buy once on the first T-500 and hold to the last T+500. */
  holdValue: number | null;
  holdMultiple: number | null;
  ruleWins: boolean | null;
  windows: EntryComparisonWindow[];
  sourcePath: string;
  caveat: string;
}

/**
 * "Is the rule better than simply buying and holding?" Compare the rule with
 * a single buy-and-hold over the same dated span, and show what each T-500
 * entry did against an entry on the halving day itself. DCA is a different
 * question and is linked to /dca rather than assigned invented numbers.
 */
export function buildStrategyComparison(
  cycles: CycleResult[],
  amount = CANONICAL_EXAMPLE_AMOUNT,
  from: StartYear = CANONICAL_START_YEAR,
): StrategyComparisonAnswer {
  const rule = runSimulator(cycles, amount, "compound", from);
  const hold = buyAndHold(cycles, amount, from);
  const windows: EntryComparisonWindow[] = cycles.map((cycle) => {
    const ruleMultiple =
      cycle.buyPrice && cycle.sellPrice ? cycle.sellPrice / cycle.buyPrice : null;
    const halvingEntryMultiple =
      cycle.halvingPrice && cycle.sellPrice ? cycle.sellPrice / cycle.halvingPrice : null;
    return {
      label: cycle.label,
      ruleMultiple,
      halvingEntryMultiple,
      entryAdvantagePercent:
        ruleMultiple !== null && halvingEntryMultiple !== null && halvingEntryMultiple !== 0
          ? (ruleMultiple / halvingEntryMultiple - 1) * 100
          : null,
    };
  });

  return {
    amount,
    from,
    ruleValue: rule.finalValue,
    ruleMultiple: rule.blendedMultiple,
    holdValue: hold?.endValue ?? null,
    holdMultiple: hold?.multiple ?? null,
    ruleWins:
      rule.finalValue !== null && hold?.endValue != null ? rule.finalValue > hold.endValue : null,
    windows,
    sourcePath: CYCLE_DATASET_PATH,
    caveat:
      "The same $10,000 and the same dated span in both columns. Four completed windows; fees, taxes and slippage excluded. Historical observation, not a forecast.",
  };
}
