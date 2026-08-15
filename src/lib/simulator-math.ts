/**
 * Client-side BTC500 simulator math.
 * Independent of React — keep this file free of UI so the page can stay thin.
 */

import type { CycleResult } from "./simulator.functions";
import { dateToMs } from "./halvings";

export type CapitalMode = "compound" | "repeat";

export const AMOUNT_PRESETS = [10_000, 25_000, 50_000, 100_000, 250_000, 1_000_000] as const;
export const START_YEARS = [2012, 2016, 2020, 2024] as const;
export type StartYear = (typeof START_YEARS)[number];

export const DEFAULT_AMOUNT = 50_000;
export const DEFAULT_MODE: CapitalMode = "compound";
export const DEFAULT_START_YEAR: StartYear = 2012;
export const MIN_AMOUNT = 100;
export const MAX_AMOUNT = 10_000_000;
export const SLIDER_MIN_AMOUNT = 1_000;
export const SLIDER_MAX_AMOUNT = 1_000_000;
export const TRADE_DAYS = 1000;

/** Optional URL params — omit defaults so existing `/simulator` links stay valid. */
export interface SimulatorSearch {
  amount?: number;
  mode?: CapitalMode;
  from?: StartYear;
}

export type ResolvedSimulatorSearch = {
  amount: number;
  mode: CapitalMode;
  from: StartYear;
};

export interface CycleRun {
  label: string;
  year: number;
  halvingDate: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number | null;
  sellPrice: number | null;
  returnMultiplier: number | null;
  returnPercent: number | null;
  startCapital: number;
  endCapital: number | null;
  profit: number | null;
  btcBought: number | null;
  complete: boolean;
  annualized: number | null;
}

export interface SimulatorRun {
  mode: CapitalMode;
  startAmount: number;
  startYear: StartYear;
  cycles: CycleRun[];
  completedCount: number;
  totalInvested: number;
  finalValue: number | null;
  totalProfit: number | null;
  blendedMultiple: number | null;
  totalBtcBought: number | null;
}

export interface HoldComparison {
  buyDate: string;
  sellDate: string;
  buyPrice: number;
  sellPrice: number;
  btcBought: number;
  multiple: number;
  endValue: number;
  profit: number;
  daysHeld: number;
  annualized: number;
}

export function isStartYear(value: number): value is StartYear {
  return (START_YEARS as readonly number[]).includes(value);
}

export function cycleYear(cycle: Pick<CycleResult, "label" | "halvingDate">): number {
  const fromLabel = Number(cycle.label.slice(0, 4));
  if (Number.isFinite(fromLabel) && fromLabel >= 2009) return fromLabel;
  return Number(cycle.halvingDate.slice(0, 4));
}

export function isCycleComplete(cycle: CycleResult): boolean {
  return cycle.buyPrice !== null && cycle.sellPrice !== null && cycle.returnMultiplier !== null;
}

export function filterFromYear(cycles: CycleResult[], startYear: number): CycleResult[] {
  return cycles.filter((cycle) => cycleYear(cycle) >= startYear);
}

export function daysBetween(startIso: string, endIso: string): number {
  return Math.round((dateToMs(endIso) - dateToMs(startIso)) / 86_400_000);
}

/** CAGR over an arbitrary hold. 34x in 1000 days ≈ +280% / year. */
export function annualizedReturn(multiplier: number, days: number): number | null {
  if (!Number.isFinite(multiplier) || multiplier <= 0 || days <= 0) return null;
  return Math.pow(multiplier, 365 / days) - 1;
}

export function parseAmount(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, value));
  }
  if (typeof value !== "string") return null;
  const n = parseFloat(value.replace(/[$,_\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, n));
}

export function parseSimulatorSearch(raw: Record<string, unknown>): SimulatorSearch {
  const next: SimulatorSearch = {};
  if (raw.amount !== undefined && raw.amount !== "") {
    const amount = parseAmount(raw.amount);
    if (amount !== null) next.amount = Math.round(amount);
  }
  if (raw.mode === "repeat" || raw.mode === "compound") next.mode = raw.mode;
  const fromNum = Number(raw.from);
  if (isStartYear(fromNum)) next.from = fromNum;
  return next;
}

export function resolveSimulatorSearch(search: SimulatorSearch): ResolvedSimulatorSearch {
  return {
    amount: search.amount ?? DEFAULT_AMOUNT,
    mode: search.mode ?? DEFAULT_MODE,
    from: search.from ?? DEFAULT_START_YEAR,
  };
}

export function mergeSimulatorSearch(
  prev: SimulatorSearch,
  patch: Partial<ResolvedSimulatorSearch>,
): SimulatorSearch {
  const resolved = resolveSimulatorSearch({ ...prev, ...patch });
  const next: SimulatorSearch = {};
  if (resolved.amount !== DEFAULT_AMOUNT) next.amount = resolved.amount;
  if (resolved.mode !== DEFAULT_MODE) next.mode = resolved.mode;
  if (resolved.from !== DEFAULT_START_YEAR) next.from = resolved.from;
  return next;
}

export function amountToSlider(n: number): number {
  const clamped = Math.min(SLIDER_MAX_AMOUNT, Math.max(SLIDER_MIN_AMOUNT, n));
  return Math.log10(clamped);
}

export function snapAmount(n: number): number {
  if (n < 10_000) return Math.round(n / 500) * 500;
  if (n < 100_000) return Math.round(n / 1_000) * 1_000;
  if (n < 1_000_000) return Math.round(n / 5_000) * 5_000;
  return Math.round(n / 50_000) * 50_000;
}

export function sliderToAmount(v: number): number {
  return snapAmount(10 ** v);
}

export const SLIDER_MIN = Math.log10(SLIDER_MIN_AMOUNT);
export const SLIDER_MAX = Math.log10(SLIDER_MAX_AMOUNT);

function toCycleRun(cycle: CycleResult, startCapital: number): CycleRun {
  const complete = isCycleComplete(cycle);
  const endCapital =
    complete && cycle.returnMultiplier !== null ? startCapital * cycle.returnMultiplier : null;
  const profit = endCapital !== null ? endCapital - startCapital : null;
  const btcBought = complete && cycle.buyPrice ? startCapital / cycle.buyPrice : null;
  return {
    label: cycle.label,
    year: cycleYear(cycle),
    halvingDate: cycle.halvingDate,
    buyDate: cycle.buyDate,
    sellDate: cycle.sellDate,
    buyPrice: cycle.buyPrice,
    sellPrice: cycle.sellPrice,
    returnMultiplier: cycle.returnMultiplier,
    returnPercent: cycle.returnPercent,
    startCapital,
    endCapital,
    profit,
    btcBought,
    complete,
    annualized:
      cycle.returnMultiplier !== null ? annualizedReturn(cycle.returnMultiplier, TRADE_DAYS) : null,
  };
}

export function runSimulator(
  cycles: CycleResult[],
  startAmount: number,
  mode: CapitalMode,
  startYear: StartYear,
): SimulatorRun {
  const selected = filterFromYear(cycles, startYear);
  const runs: CycleRun[] = [];
  let capital = startAmount;
  let invested = 0;
  let totalBtc = 0;
  let sawBtc = false;

  for (const cycle of selected) {
    const startCapital = mode === "compound" ? capital : startAmount;
    const run = toCycleRun(cycle, startCapital);
    if (run.complete) {
      if (mode === "compound") {
        if (runs.every((r) => !r.complete)) invested = startAmount;
        if (run.endCapital !== null) capital = run.endCapital;
      } else {
        invested += startAmount;
      }
      if (run.btcBought !== null) {
        totalBtc += run.btcBought;
        sawBtc = true;
      }
    }
    runs.push(run);
  }

  const completed = runs.filter((r) => r.complete && r.endCapital !== null);
  const finalValue =
    completed.length === 0
      ? null
      : mode === "compound"
        ? completed[completed.length - 1]!.endCapital
        : completed.reduce((sum, r) => sum + (r.endCapital ?? 0), 0);

  const totalProfit = finalValue !== null && invested > 0 ? finalValue - invested : null;
  const blendedMultiple = finalValue !== null && invested > 0 ? finalValue / invested : null;

  return {
    mode,
    startAmount,
    startYear,
    cycles: runs,
    completedCount: completed.length,
    totalInvested: invested,
    finalValue,
    totalProfit,
    blendedMultiple,
    totalBtcBought: sawBtc ? totalBtc : null,
  };
}

export function buyAndHold(
  cycles: CycleResult[],
  amount: number,
  startYear: StartYear,
): HoldComparison | null {
  const selected = filterFromYear(cycles, startYear).filter(isCycleComplete);
  const first = selected[0];
  const last = selected[selected.length - 1];
  if (!first?.buyPrice || !last?.sellPrice) return null;

  const multiple = last.sellPrice / first.buyPrice;
  const daysHeld = daysBetween(first.buyDate, last.sellDate);
  const annualized = annualizedReturn(multiple, daysHeld);
  if (annualized === null) return null;

  return {
    buyDate: first.buyDate,
    sellDate: last.sellDate,
    buyPrice: first.buyPrice,
    sellPrice: last.sellPrice,
    btcBought: amount / first.buyPrice,
    multiple,
    endValue: amount * multiple,
    profit: amount * multiple - amount,
    daysHeld,
    annualized,
  };
}

export function startingYearOutcomes(
  cycles: CycleResult[],
  amount: number,
  mode: CapitalMode,
): Array<{ year: StartYear; run: SimulatorRun }> {
  return START_YEARS.map((year) => ({
    year,
    run: runSimulator(cycles, amount, mode, year),
  }));
}

export function averageCycleMultiple(cycles: CycleResult[]): number | null {
  const multiples = cycles
    .filter(isCycleComplete)
    .map((c) => c.returnMultiplier)
    .filter((n): n is number => n !== null);
  if (multiples.length === 0) return null;
  return multiples.reduce((sum, n) => sum + n, 0) / multiples.length;
}

export function shareUrl(origin: string, search: ResolvedSimulatorSearch): string {
  const params = new URLSearchParams();
  params.set("amount", String(Math.round(search.amount)));
  params.set("mode", search.mode);
  params.set("from", String(search.from));
  return `${origin}/simulator?${params.toString()}`;
}

export function shareText(run: SimulatorRun, url: string): string {
  const start = run.startAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const end =
    run.finalValue === null
      ? "—"
      : run.finalValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        });
  const multiple =
    run.blendedMultiple === null
      ? ""
      : ` (${run.blendedMultiple.toLocaleString("en-US", { maximumFractionDigits: 1 })}x)`;
  const modeLine =
    run.mode === "compound"
      ? `reinvesting profits from the ${run.startYear} cycle`
      : `the same amount in each window from ${run.startYear}`;

  return [
    `I ran ${start} through the BTC500 rule (buy 500 days before each Bitcoin halving, sell 500 days after), ${modeLine}.`,
    ``,
    `Hypothetical backtest: ${start} → ${end}${multiple}`,
    ``,
    `Past performance does not guarantee future results.`,
    url,
  ].join("\n");
}
