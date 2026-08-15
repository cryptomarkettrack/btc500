/**
 * Derived BTC500 cycle stats for explanatory pages.
 * Every figure comes from CycleResult — never invent a missing price.
 */

import type { CycleResult } from "./simulator.functions";
import { isCycleComplete } from "./simulator-math";

export interface CycleObservation {
  completedCount: number;
  allCompletedPositive: boolean;
  largest?: CycleResult;
  smallest?: CycleResult;
  averageReturnPercent: number | null;
  toHalvingCompletedCount: number;
  allToHalvingPositive: boolean;
}

export function percentChange(from: number | null, to: number | null): number | null {
  if (from == null || to == null || from <= 0) return null;
  return ((to - from) / from) * 100;
}

export function formatSignedPercent(value: number | null, digits = 0): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function observeCycles(cycles: CycleResult[]): CycleObservation {
  const completed = cycles.filter(isCycleComplete);
  const toHalving = cycles.filter(
    (c) => c.buyPrice != null && c.halvingPrice != null && c.toHalvingPercent != null,
  );

  const largest = completed.reduce<CycleResult | undefined>((best, cycle) => {
    if (!best || (cycle.returnPercent ?? -Infinity) > (best.returnPercent ?? -Infinity)) {
      return cycle;
    }
    return best;
  }, undefined);

  const smallest = completed.reduce<CycleResult | undefined>((worst, cycle) => {
    if (!worst || (cycle.returnPercent ?? Infinity) < (worst.returnPercent ?? Infinity)) {
      return cycle;
    }
    return worst;
  }, undefined);

  const averageReturnPercent =
    completed.length === 0
      ? null
      : completed.reduce((sum, cycle) => sum + (cycle.returnPercent ?? 0), 0) / completed.length;

  return {
    completedCount: completed.length,
    allCompletedPositive:
      completed.length > 0 && completed.every((c) => (c.returnPercent ?? 0) > 0),
    largest,
    smallest,
    averageReturnPercent,
    toHalvingCompletedCount: toHalving.length,
    allToHalvingPositive:
      toHalving.length > 0 && toHalving.every((c) => (c.toHalvingPercent ?? 0) > 0),
  };
}
