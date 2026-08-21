/**
 * Bitcoin ETF absorption analysis.
 *
 * Converts US spot ETF dollar flows into BTC, then compares that demand to
 * miner issuance. Dollar tables are a dime a dozen; this is the question
 * those tables don't answer: did ETFs eat the new coins?
 */

import {
  LAST_HISTORICAL_HALVING,
  WINDOW_DAYS,
  addDays,
  classifyCyclePosition,
  type CyclePosition,
} from "./halvings.ts";

export const ETF_LAUNCH_DATE = "2024-01-11";
export const FOURTH_HALVING_DATE = LAST_HISTORICAL_HALVING.date;
export const TPLUS500_2024 = addDays(FOURTH_HALVING_DATE, WINDOW_DAYS);
export const TMINUS500_2024 = addDays(FOURTH_HALVING_DATE, -WINDOW_DAYS);

/** Protocol 10-minute blocks → 144 blocks/day. */
export const BLOCKS_PER_DAY = 144;
export const PRE_2024_DAILY_ISSUANCE_BTC = 6.25 * BLOCKS_PER_DAY;
export const POST_2024_DAILY_ISSUANCE_BTC = 3.125 * BLOCKS_PER_DAY;

export const ETF_META: Record<string, { ticker: string; name: string; issuer: string }> = {
  IBIT: { ticker: "IBIT", name: "iShares Bitcoin Trust", issuer: "BlackRock" },
  FBTC: { ticker: "FBTC", name: "Wise Origin Bitcoin Fund", issuer: "Fidelity" },
  BITB: { ticker: "BITB", name: "Bitwise Bitcoin ETF", issuer: "Bitwise" },
  ARKB: { ticker: "ARKB", name: "ARK 21Shares Bitcoin ETF", issuer: "ARK / 21Shares" },
  BTCO: { ticker: "BTCO", name: "Invesco Galaxy Bitcoin ETF", issuer: "Invesco / Galaxy" },
  EZBC: { ticker: "EZBC", name: "Franklin Bitcoin ETF", issuer: "Franklin Templeton" },
  BRRR: { ticker: "BRRR", name: "CoinShares Valkyrie Bitcoin Fund", issuer: "CoinShares" },
  HODL: { ticker: "HODL", name: "VanEck Bitcoin Trust", issuer: "VanEck" },
  BTCW: { ticker: "BTCW", name: "WisdomTree Bitcoin Fund", issuer: "WisdomTree" },
  GBTC: { ticker: "GBTC", name: "Grayscale Bitcoin Trust", issuer: "Grayscale" },
  BTC: { ticker: "BTC", name: "Grayscale Bitcoin Mini Trust", issuer: "Grayscale" },
  MSBT: { ticker: "MSBT", name: "Morgan Stanley Bitcoin Trust", issuer: "Morgan Stanley" },
  DEFI: { ticker: "DEFI", name: "Hashdex Bitcoin ETF", issuer: "Hashdex" },
};

export type AbsorptionRegime = "squeezing" | "absorbing" | "leaking" | "dumping" | "idle";
export type FlowDirection = "in" | "out" | "flat";
export type HeatIntensity = 0 | 1 | 2 | 3 | 4;

export type EtfCyclePhase = "pre-halving" | "halving-day" | "hold-window" | "after-tplus500";

export interface EtfFlowDay {
  date: string;
  netFlowUsd: number;
  btcCloseUsd: number | null;
  totalNetAssetsUsd: number | null;
  perEtfUsd: Record<string, number> | null;
}

export interface EnrichedEtfDay {
  date: string;
  netFlowUsd: number;
  netFlowBtc: number | null;
  btcCloseUsd: number | null;
  totalNetAssetsUsd: number | null;
  issuanceBtc: number;
  extraBtc: number | null;
  absorptionRatio: number | null;
  direction: FlowDirection;
  phase: EtfCyclePhase;
  cyclePosition: CyclePosition;
  perEtfUsd: Record<string, number> | null;
  perEtfBtc: Record<string, number> | null;
}

export interface FlowStreak {
  direction: FlowDirection;
  days: number;
}

export interface RollingAbsorption {
  calendarDays: number;
  start: string;
  end: string;
  etfBtc: number;
  etfUsd: number;
  issuanceBtc: number;
  extraBtc: number;
  ratio: number | null;
  regime: AbsorptionRegime;
}

export interface PhaseLedgerRow {
  phase: EtfCyclePhase;
  label: string;
  start: string;
  end: string;
  tradingDays: number;
  etfUsd: number;
  etfBtc: number;
  issuanceBtc: number;
  extraBtc: number;
  ratio: number | null;
}

export interface IssuerRow {
  ticker: string;
  name: string;
  issuer: string;
  usd: number;
  btc: number;
  last30dUsd: number;
  last30dBtc: number;
}

export interface FlowRecord {
  date: string;
  usd: number;
  btc: number | null;
}

export interface MonthRecord {
  month: string;
  usd: number;
  btc: number;
}

export interface HeatmapCell {
  date: string;
  weekday: number;
  netFlowBtc: number | null;
  netFlowUsd: number | null;
  intensity: HeatIntensity;
  direction: FlowDirection | "none";
  phase: EtfCyclePhase | null;
}

export interface HeatmapYear {
  year: number;
  weeks: HeatmapCell[][];
}

export interface EtfAbsorptionSnapshot {
  days: EnrichedEtfDay[];
  latest: EnrichedEtfDay;
  streak: FlowStreak;
  longestInflowStreak: number;
  longestOutflowStreak: number;
  dayRegime: AbsorptionRegime;
  rolling7d: RollingAbsorption;
  rolling30d: RollingAbsorption;
  cumulativeUsd: number;
  cumulativeBtc: number;
  estimatedHoldingsBtc: number | null;
  totalNetAssetsUsd: number | null;
  phaseLedger: PhaseLedgerRow[];
  issuers: IssuerRow[];
  biggestInflow: FlowRecord | null;
  biggestOutflow: FlowRecord | null;
  bestMonth: MonthRecord | null;
  worstMonth: MonthRecord | null;
  heatmap: HeatmapYear[];
  tMinus500: string;
  halvingDate: string;
  tPlus500: string;
  sourceName: string;
  sourceUrl: string;
  attribution: string;
  sources: string;
  license: string;
  updatedThrough: string;
  fetchDate: string;
}

export function dailyIssuanceBtc(date: string): number {
  return date < FOURTH_HALVING_DATE ? PRE_2024_DAILY_ISSUANCE_BTC : POST_2024_DAILY_ISSUANCE_BTC;
}

export function usdToBtc(usd: number, btcCloseUsd: number | null): number | null {
  if (btcCloseUsd == null || !Number.isFinite(btcCloseUsd) || btcCloseUsd <= 0) return null;
  if (!Number.isFinite(usd)) return null;
  return usd / btcCloseUsd;
}

export function flowDirection(usd: number): FlowDirection {
  if (usd > 0) return "in";
  if (usd < 0) return "out";
  return "flat";
}

export function etfCyclePhase(date: string): EtfCyclePhase {
  if (date < FOURTH_HALVING_DATE) return "pre-halving";
  if (date === FOURTH_HALVING_DATE) return "halving-day";
  if (date <= TPLUS500_2024) return "hold-window";
  return "after-tplus500";
}

export function phaseLabel(phase: EtfCyclePhase): string {
  switch (phase) {
    case "pre-halving":
      return "Launch → 2024 halving";
    case "halving-day":
      return "Halving day";
    case "hold-window":
      return "Halving → T+500";
    case "after-tplus500":
      return "After T+500";
  }
}

export function absorptionRegime(etfBtc: number, issuanceBtc: number): AbsorptionRegime {
  if (!Number.isFinite(etfBtc) || etfBtc === 0) return "idle";
  if (etfBtc < 0) return "dumping";
  if (!(issuanceBtc > 0)) return etfBtc > 0 ? "absorbing" : "idle";
  const ratio = etfBtc / issuanceBtc;
  if (ratio >= 1.2) return "squeezing";
  if (ratio >= 1) return "absorbing";
  return "leaking";
}

export function regimeCopy(regime: AbsorptionRegime): { headline: string; detail: string } {
  switch (regime) {
    case "squeezing":
      return {
        headline: "Squeezing supply",
        detail: "ETFs took more bitcoin than miners created.",
      };
    case "absorbing":
      return {
        headline: "Absorbing issuance",
        detail: "ETFs roughly matched new miner supply.",
      };
    case "leaking":
      return {
        headline: "Leaking supply",
        detail: "Miners created more bitcoin than ETFs absorbed.",
      };
    case "dumping":
      return {
        headline: "Net redemptions",
        detail: "ETFs returned bitcoin to the market.",
      };
    case "idle":
      return {
        headline: "No net creations",
        detail: "Issuers reported a flat session.",
      };
  }
}

export function intensityFor(absBtc: number, issuanceBtc: number): HeatIntensity {
  if (!(absBtc > 0)) return 0;
  const ratio = issuanceBtc > 0 ? absBtc / issuanceBtc : 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.75) return 2;
  if (ratio < 1.5) return 3;
  return 4;
}

export function enrichDay(day: EtfFlowDay): EnrichedEtfDay {
  const issuanceBtc = dailyIssuanceBtc(day.date);
  const netFlowBtc = usdToBtc(day.netFlowUsd, day.btcCloseUsd);
  const extraBtc = netFlowBtc == null ? null : netFlowBtc - issuanceBtc;
  const absorptionRatio = netFlowBtc == null || issuanceBtc <= 0 ? null : netFlowBtc / issuanceBtc;

  let perEtfBtc: Record<string, number> | null = null;
  if (day.perEtfUsd && day.btcCloseUsd && day.btcCloseUsd > 0) {
    perEtfBtc = {};
    for (const [ticker, usd] of Object.entries(day.perEtfUsd)) {
      if (!Number.isFinite(usd)) continue;
      perEtfBtc[ticker] = usd / day.btcCloseUsd;
    }
  }

  return {
    date: day.date,
    netFlowUsd: day.netFlowUsd,
    netFlowBtc,
    btcCloseUsd: day.btcCloseUsd,
    totalNetAssetsUsd: day.totalNetAssetsUsd,
    issuanceBtc,
    extraBtc,
    absorptionRatio,
    direction: flowDirection(day.netFlowUsd),
    phase: etfCyclePhase(day.date),
    cyclePosition: classifyCyclePosition(
      day.date,
      TMINUS500_2024,
      FOURTH_HALVING_DATE,
      TPLUS500_2024,
    ),
    perEtfUsd: day.perEtfUsd,
    perEtfBtc,
  };
}

export function computeStreak(days: EnrichedEtfDay[]): FlowStreak {
  if (days.length === 0) return { direction: "flat", days: 0 };
  const chronological = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const last = chronological[chronological.length - 1]!;
  const direction = last.direction;
  let count = 0;
  for (let i = chronological.length - 1; i >= 0; i--) {
    const row = chronological[i]!;
    if (row.direction === "flat") continue;
    if (row.direction !== direction) break;
    count += 1;
  }
  if (direction === "flat") return { direction: "flat", days: 0 };
  return { direction, days: count };
}

export function longestStreak(days: EnrichedEtfDay[], direction: FlowDirection): number {
  const chronological = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let current = 0;
  for (const day of chronological) {
    if (day.direction === direction) {
      current += 1;
      if (current > best) best = current;
    } else if (day.direction !== "flat") {
      current = 0;
    }
  }
  return best;
}

function eachIsoDay(start: string, end: string): string[] {
  const out: string[] = [];
  if (start > end) return out;
  let cursor = start;
  while (cursor <= end) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

function sumIssuance(start: string, end: string): number {
  let total = 0;
  for (const date of eachIsoDay(start, end)) {
    total += dailyIssuanceBtc(date);
  }
  return total;
}

export function rollingAbsorption(
  days: EnrichedEtfDay[],
  endDate: string,
  calendarDays: number,
): RollingAbsorption {
  const start = addDays(endDate, -(calendarDays - 1));
  const windowDays = days.filter((d) => d.date >= start && d.date <= endDate);
  const etfUsd = windowDays.reduce((sum, d) => sum + d.netFlowUsd, 0);
  const etfBtc = windowDays.reduce((sum, d) => sum + (d.netFlowBtc ?? 0), 0);
  const issuanceBtc = sumIssuance(start, endDate);
  const extraBtc = etfBtc - issuanceBtc;
  const ratio = issuanceBtc > 0 ? etfBtc / issuanceBtc : null;
  return {
    calendarDays,
    start,
    end: endDate,
    etfBtc,
    etfUsd,
    issuanceBtc,
    extraBtc,
    ratio,
    regime: absorptionRegime(etfBtc, issuanceBtc),
  };
}

function phaseWindow(phase: EtfCyclePhase, lastDate: string): { start: string; end: string } {
  switch (phase) {
    case "pre-halving":
      return { start: ETF_LAUNCH_DATE, end: addDays(FOURTH_HALVING_DATE, -1) };
    case "halving-day":
      return { start: FOURTH_HALVING_DATE, end: FOURTH_HALVING_DATE };
    case "hold-window":
      return { start: addDays(FOURTH_HALVING_DATE, 1), end: TPLUS500_2024 };
    case "after-tplus500":
      return { start: addDays(TPLUS500_2024, 1), end: lastDate };
  }
}

export function buildPhaseLedger(days: EnrichedEtfDay[]): PhaseLedgerRow[] {
  if (days.length === 0) return [];
  const lastDate = days[days.length - 1]!.date;
  const phases: EtfCyclePhase[] = ["pre-halving", "halving-day", "hold-window", "after-tplus500"];
  return phases
    .map((phase) => {
      const window = phaseWindow(phase, lastDate);
      if (window.start > lastDate) return null;
      const end = window.end > lastDate ? lastDate : window.end;
      if (end < window.start) return null;
      const rows = days.filter((d) => d.phase === phase);
      const etfUsd = rows.reduce((sum, d) => sum + d.netFlowUsd, 0);
      const etfBtc = rows.reduce((sum, d) => sum + (d.netFlowBtc ?? 0), 0);
      const issuanceBtc = sumIssuance(window.start, end);
      return {
        phase,
        label: phaseLabel(phase),
        start: window.start,
        end,
        tradingDays: rows.length,
        etfUsd,
        etfBtc,
        issuanceBtc,
        extraBtc: etfBtc - issuanceBtc,
        ratio: issuanceBtc > 0 ? etfBtc / issuanceBtc : null,
      } satisfies PhaseLedgerRow;
    })
    .filter((row): row is PhaseLedgerRow => row != null);
}

export function buildIssuerRows(days: EnrichedEtfDay[]): IssuerRow[] {
  const last30Start = days.length ? addDays(days[days.length - 1]!.date, -29) : ETF_LAUNCH_DATE;
  const totals = new Map<string, IssuerRow>();

  const ensure = (ticker: string): IssuerRow => {
    const existing = totals.get(ticker);
    if (existing) return existing;
    const meta = ETF_META[ticker];
    const created: IssuerRow = {
      ticker,
      name: meta?.name ?? ticker,
      issuer: meta?.issuer ?? ticker,
      usd: 0,
      btc: 0,
      last30dUsd: 0,
      last30dBtc: 0,
    };
    totals.set(ticker, created);
    return created;
  };

  for (const day of days) {
    if (!day.perEtfUsd) continue;
    for (const [ticker, usd] of Object.entries(day.perEtfUsd)) {
      if (!Number.isFinite(usd)) continue;
      const row = ensure(ticker);
      row.usd += usd;
      const btc = day.perEtfBtc?.[ticker] ?? 0;
      row.btc += btc;
      if (day.date >= last30Start) {
        row.last30dUsd += usd;
        row.last30dBtc += btc;
      }
    }
  }

  return [...totals.values()].sort((a, b) => Math.abs(b.btc) - Math.abs(a.btc));
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function buildMonthRecords(days: EnrichedEtfDay[]): {
  best: MonthRecord | null;
  worst: MonthRecord | null;
} {
  const months = new Map<string, MonthRecord>();
  for (const day of days) {
    const key = monthKey(day.date);
    const existing = months.get(key) ?? { month: key, usd: 0, btc: 0 };
    existing.usd += day.netFlowUsd;
    existing.btc += day.netFlowBtc ?? 0;
    months.set(key, existing);
  }
  const list = [...months.values()];
  if (list.length === 0) return { best: null, worst: null };
  let best = list[0]!;
  let worst = list[0]!;
  for (const row of list) {
    if (row.usd > best.usd) best = row;
    if (row.usd < worst.usd) worst = row;
  }
  return { best, worst };
}

export function buildHeatmap(days: EnrichedEtfDay[]): HeatmapYear[] {
  if (days.length === 0) return [];
  const byDate = new Map(days.map((d) => [d.date, d]));
  const first = days[0]!.date;
  const last = days[days.length - 1]!.date;
  const firstYear = Number(first.slice(0, 4));
  const lastYear = Number(last.slice(0, 4));
  const years: HeatmapYear[] = [];

  for (let year = firstYear; year <= lastYear; year++) {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const rangeStart = yearStart < first ? first : yearStart;
    const rangeEnd = yearEnd > last ? last : yearEnd;
    const startWeekday = new Date(`${rangeStart}T00:00:00Z`).getUTCDay();
    let cursor = addDays(rangeStart, -startWeekday);
    const weeks: HeatmapCell[][] = [];
    let week: HeatmapCell[] = [];

    while (cursor <= rangeEnd || week.length > 0) {
      const inRange = cursor >= rangeStart && cursor <= rangeEnd;
      const day = byDate.get(cursor);
      const weekday = new Date(`${cursor}T00:00:00Z`).getUTCDay();
      if (inRange && day) {
        const absBtc = Math.abs(day.netFlowBtc ?? 0);
        week.push({
          date: cursor,
          weekday,
          netFlowBtc: day.netFlowBtc,
          netFlowUsd: day.netFlowUsd,
          intensity: intensityFor(absBtc, day.issuanceBtc),
          direction: day.direction,
          phase: day.phase,
        });
      } else if (inRange) {
        week.push({
          date: cursor,
          weekday,
          netFlowBtc: null,
          netFlowUsd: null,
          intensity: 0,
          direction: "none",
          phase: etfCyclePhase(cursor),
        });
      } else {
        week.push({
          date: cursor,
          weekday,
          netFlowBtc: null,
          netFlowUsd: null,
          intensity: 0,
          direction: "none",
          phase: null,
        });
      }

      cursor = addDays(cursor, 1);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
        if (cursor > rangeEnd) break;
      }
    }

    years.push({ year, weeks });
  }

  return years;
}

function extremeDay(days: EnrichedEtfDay[], pick: "max" | "min"): FlowRecord | null {
  if (days.length === 0) return null;
  let best = days[0]!;
  for (const day of days) {
    if (pick === "max" ? day.netFlowUsd > best.netFlowUsd : day.netFlowUsd < best.netFlowUsd) {
      best = day;
    }
  }
  return { date: best.date, usd: best.netFlowUsd, btc: best.netFlowBtc };
}

export interface EtfSourceMeta {
  sourceName: string;
  sourceUrl: string;
  attribution: string;
  sources: string;
  license: string;
  updatedThrough: string;
  fetchDate: string;
}

export function buildAbsorptionSnapshot(
  rawDays: EtfFlowDay[],
  meta: EtfSourceMeta,
): EtfAbsorptionSnapshot {
  const days = [...rawDays]
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(enrichDay);

  if (days.length === 0) {
    throw new Error("No Bitcoin ETF flow days to analyze");
  }

  const latest = days[days.length - 1]!;
  const months = buildMonthRecords(days);
  const lastAum = [...days].reverse().find((d) => d.totalNetAssetsUsd != null);
  const estimatedHoldingsBtc =
    lastAum?.totalNetAssetsUsd != null && lastAum.btcCloseUsd
      ? lastAum.totalNetAssetsUsd / lastAum.btcCloseUsd
      : null;

  return {
    days,
    latest,
    streak: computeStreak(days),
    longestInflowStreak: longestStreak(days, "in"),
    longestOutflowStreak: longestStreak(days, "out"),
    dayRegime: absorptionRegime(latest.netFlowBtc ?? 0, latest.issuanceBtc),
    rolling7d: rollingAbsorption(days, latest.date, 7),
    rolling30d: rollingAbsorption(days, latest.date, 30),
    cumulativeUsd: days.reduce((sum, d) => sum + d.netFlowUsd, 0),
    cumulativeBtc: days.reduce((sum, d) => sum + (d.netFlowBtc ?? 0), 0),
    estimatedHoldingsBtc,
    totalNetAssetsUsd: lastAum?.totalNetAssetsUsd ?? null,
    phaseLedger: buildPhaseLedger(days),
    issuers: buildIssuerRows(days),
    biggestInflow: extremeDay(days, "max"),
    biggestOutflow: extremeDay(days, "min"),
    bestMonth: months.best,
    worstMonth: months.worst,
    heatmap: buildHeatmap(days),
    tMinus500: TMINUS500_2024,
    halvingDate: FOURTH_HALVING_DATE,
    tPlus500: TPLUS500_2024,
    ...meta,
  };
}
