/**
 * Pure simulator payload assembly. No network, no server functions.
 */

import {
  type Completeness,
  type DataLoadError,
  type DataLoadStatus,
  userSafeDataError,
} from "./data-status.ts";
import { computeCycleRisks, emptyCycleRisk, type CycleRisk } from "./cycle-risk.ts";
import { computeCycleTimings, emptyCycleTiming, type CycleTiming } from "./cycle-timing.ts";
import { HALVINGS, WINDOW_DAYS, addDays, type HalvingEvent } from "./halvings.ts";

export interface CycleResult {
  label: string;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number | null;
  /** BTC price on the halving date itself, when a historical print exists. */
  halvingPrice: number | null;
  sellPrice: number | null;
  returnMultiplier: number | null;
  returnPercent: number | null;
  /** T-500 → halving return, when both prices exist. */
  toHalvingMultiplier: number | null;
  toHalvingPercent: number | null;
  profit: number | null;
}

export interface SimulatorArchiveRange {
  firstDate: string | null;
  lastDate: string | null;
  rows: number;
}

export interface SimulatorResult {
  cycles: CycleResult[];
  /** Inside-the-window risk profile per cycle, from the same daily closes. */
  risk: CycleRisk[];
  /** Entry-date sensitivity per cycle: what changes if T-500 is missed. */
  timing: CycleTiming[];
  /** Range of the daily-close archive this payload was built from. */
  archive?: SimulatorArchiveRange;
  status: DataLoadStatus;
  completeness: Completeness;
  source: string;
  missingDates: string[];
  error?: DataLoadError;
}

export function cycleFromPrices(
  halving: HalvingEvent,
  buyPrice: number | null,
  halvingPrice: number | null,
  sellPrice: number | null,
): CycleResult {
  const buyDate = addDays(halving.date, -WINDOW_DAYS);
  const sellDate = addDays(halving.date, WINDOW_DAYS);
  return {
    label: halving.label,
    halvingDate: halving.date,
    buyDate,
    sellDate,
    buyPrice,
    halvingPrice,
    sellPrice,
    returnMultiplier: buyPrice && sellPrice ? sellPrice / buyPrice : null,
    returnPercent: buyPrice && sellPrice ? ((sellPrice - buyPrice) / buyPrice) * 100 : null,
    toHalvingMultiplier: buyPrice && halvingPrice ? halvingPrice / buyPrice : null,
    toHalvingPercent:
      buyPrice && halvingPrice ? ((halvingPrice - buyPrice) / buyPrice) * 100 : null,
    profit: null,
  };
}

export function emptySimulatorCycles(): CycleResult[] {
  return HALVINGS.map((halving) => cycleFromPrices(halving, null, null, null));
}

export function unavailableSimulatorResult(
  source = "missing",
  code: DataLoadError["code"] = "unavailable",
  message = "Historical data could not be loaded.",
): SimulatorResult {
  return {
    cycles: emptySimulatorCycles(),
    risk: HALVINGS.map(emptyCycleRisk),
    timing: HALVINGS.map(emptyCycleTiming),
    status: code === "unavailable" ? "unavailable" : "error",
    completeness: "empty",
    source,
    missingDates: [],
    error: userSafeDataError(code, message),
  };
}

export function assembleSimulatorResult(
  lookup: (date: string) => number | null,
  source: string,
  datasetSize: number,
  archive?: SimulatorArchiveRange,
): SimulatorResult {
  if (datasetSize <= 0) {
    return unavailableSimulatorResult(
      source,
      "unavailable",
      "Historical data could not be loaded.",
    );
  }

  const missingDates: string[] = [];
  const cycles = HALVINGS.map((halving) => {
    const buyDate = addDays(halving.date, -WINDOW_DAYS);
    const sellDate = addDays(halving.date, WINDOW_DAYS);
    const buyPrice = lookup(buyDate);
    const halvingPrice = lookup(halving.date);
    const sellPrice = lookup(sellDate);
    if (buyPrice == null) missingDates.push(buyDate);
    if (halvingPrice == null) missingDates.push(halving.date);
    if (sellPrice == null) missingDates.push(sellDate);
    return cycleFromPrices(halving, buyPrice, halvingPrice, sellPrice);
  });

  const completeness: Completeness = missingDates.length === 0 ? "complete" : "partial";
  return {
    cycles,
    risk: computeCycleRisks(HALVINGS, lookup),
    timing: computeCycleTimings(HALVINGS, lookup),
    ...(archive ? { archive } : {}),
    status: completeness === "complete" ? "ok" : "partial",
    completeness,
    source,
    missingDates,
  };
}
