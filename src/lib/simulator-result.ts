/**
 * Pure simulator payload assembly. No network, no server functions.
 */

import {
  type Completeness,
  type DataLoadError,
  type DataLoadStatus,
  userSafeDataError,
} from "./data-status.ts";
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

export interface SimulatorResult {
  cycles: CycleResult[];
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
    status: completeness === "complete" ? "ok" : "partial",
    completeness,
    source,
    missingDates,
  };
}
