import { and, count, desc, eq, inArray, lte, sql } from "drizzle-orm";

import { getDb, isDbConfigured } from "@/db/client";
import { candles, predictions, users } from "@/db/schema";
import {
  fetchCandle,
  fetchCandleFromSource,
  fetchRecentCandles,
  PRICE_SOURCES,
  type ExchangeCandle,
} from "./market-data";
import { getPlayerId, setPlayerCookie } from "./identity";
import {
  CLASH_SYMBOL,
  CLASH_TIMEFRAME,
  ALLOWED_SYMBOLS,
  ALLOWED_TIMEFRAMES,
  computeStats,
  currentCandleOpenTime,
  cutoffTime,
  isWindowOpen,
  rankLeaderboard,
  settleCandle,
  timeframeMs,
  type Direction,
  type LeaderboardRow,
  type PlayerStats,
  type PredictionStatus,
} from "./rules";

const HISTORY_LIMIT = 12;
const HISTORY_STATS_LIMIT = 1_000;
const LEADERBOARD_SCAN_LIMIT = 500;
export const SETTLE_BATCH_LIMIT = 20;
const CRON_RESOLVE_LIMIT = 200;

interface Target {
  symbol: string;
  timeframe: string;
  openTime: number;
  closeTime: number;
  cutoffTime: number;
  windowOpen: boolean;
}

interface PredictionView {
  id: string;
  direction: Direction;
  status: string;
  points: number;
  candleOpenTime: number;
  entryPrice: number | null;
  resolvedAt: number | null;
}

interface LeaderboardView extends LeaderboardRow {
  rank: number;
}

export interface ClashState {
  available: boolean;
  reason?: "database-not-configured" | "database-not-migrated";
  now: number;
  target: Target;
  /** Server-observed open of the live candle. Informational only. */
  price: number | null;
  /** Recent 15m candles for the chart, oldest first (includes the live one). */
  candles: ExchangeCandle[];
  player: { username: string; email: string; emailOptIn: boolean } | null;
  history: PredictionView[];
  stats: PlayerStats;
  leaderboard: LeaderboardView[];
  hasPredictedCurrent: boolean;
  /** Past candles still awaiting settlement (drives background retries). */
  pendingCount: number;
}

export interface SubmitInput {
  username: string;
  email: string;
  emailOptIn: boolean;
  direction: Direction;
  symbol: string;
  timeframe: string;
}

export type SubmitResult =
  | { ok: true; prediction: PredictionView }
  | {
      ok: false;
      reason:
        | "unavailable"
        | "bad-market"
        | "closed"
        | "no-price"
        | "duplicate"
        | "database-not-migrated";
    };

function targetAt(now: number): Target {
  const interval = timeframeMs(CLASH_TIMEFRAME)!;
  const openTime = currentCandleOpenTime(now, interval);
  return {
    symbol: CLASH_SYMBOL,
    timeframe: CLASH_TIMEFRAME,
    openTime,
    closeTime: openTime + interval,
    cutoffTime: cutoffTime(openTime, interval),
    windowOpen: isWindowOpen(now, openTime, interval),
  };
}

function toView(row: typeof predictions.$inferSelect): PredictionView {
  return {
    id: row.id,
    direction: row.direction as Direction,
    status: row.status,
    points: row.points,
    candleOpenTime: row.candleOpenTime.getTime(),
    entryPrice: row.entryPrice === null ? null : Number(row.entryPrice),
    resolvedAt: row.resolvedAt ? row.resolvedAt.getTime() : null,
  };
}

const EMPTY_STATS: PlayerStats = {
  settled: 0,
  wins: 0,
  accuracy: null,
  currentStreak: 0,
  bestStreak: 0,
};

/**
 * Postgres 42P01 means the schema was never applied to this database. Drizzle
 * wraps it in a DrizzleQueryError whose message hides the cause, so walk the
 * chain and translate it into a setup instruction the player can act on.
 */
function isMissingSchemaError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current !== null && typeof current === "object"; depth += 1) {
    const candidate = current as { code?: unknown; message?: unknown; cause?: unknown };
    if (candidate.code === "42P01") return true;
    if (
      typeof candidate.message === "string" &&
      /(relation|type) "[^"]+" does not exist/i.test(candidate.message)
    ) {
      return true;
    }
    current = candidate.cause;
  }
  return false;
}

/** Read-only snapshot that seeds the game UI. Safe to serialize to the client. */
export async function getClashState(): Promise<ClashState> {
  const now = Date.now();
  const target = targetAt(now);
  const base: ClashState = {
    available: true,
    now,
    target,
    price: null,
    candles: [],
    player: null,
    history: [],
    stats: EMPTY_STATS,
    leaderboard: [],
    hasPredictedCurrent: false,
    pendingCount: 0,
  };

  if (!isDbConfigured()) return { ...base, available: false, reason: "database-not-configured" };

  // Settlement is deliberately not part of this read: it makes external API
  // calls and would stall every page load. The client triggers it in the
  // background and refreshes when something resolves.
  const playerId = await getPlayerId();

  try {
    const db = getDb();
    const candles = await fetchRecentCandles(target.symbol, target.timeframe, 40, now);
    const liveCandle = candles.find((candle) => candle.openTime === target.openTime);
    const price = liveCandle?.open ?? null;

    if (!playerId) return { ...base, price, candles };

    const [playerRows, historyRows, statsRows, aggregateRows, pendingRows] = await Promise.all([
      db
        .select({ username: users.username, email: users.email, emailOptIn: users.emailOptIn })
        .from(users)
        .where(eq(users.id, playerId))
        .limit(1),
      db
        .select()
        .from(predictions)
        .where(eq(predictions.userId, playerId))
        .orderBy(desc(predictions.candleOpenTime))
        .limit(HISTORY_LIMIT),
      db
        .select({ status: predictions.status })
        .from(predictions)
        .where(eq(predictions.userId, playerId))
        .orderBy(desc(predictions.candleOpenTime))
        .limit(HISTORY_STATS_LIMIT),
      db
        .select({
          userId: users.id,
          username: users.username,
          points: sql<number>`coalesce(sum(${predictions.points}), 0)::int`,
          settled: sql<number>`count(*) filter (where ${predictions.status} in ('WON', 'LOST'))::int`,
          wins: sql<number>`count(*) filter (where ${predictions.status} = 'WON')::int`,
        })
        .from(predictions)
        .innerJoin(users, eq(predictions.userId, users.id))
        .where(inArray(predictions.status, ["WON", "LOST", "VOID"]))
        .groupBy(users.id, users.username)
        .limit(LEADERBOARD_SCAN_LIMIT),
      db
        .select({ value: count() })
        .from(predictions)
        .where(and(eq(predictions.userId, playerId), eq(predictions.status, "PENDING"))),
    ]);

    const leaderboard = rankLeaderboard(
      aggregateRows.map((row) => ({
        username: row.username,
        points: Number(row.points),
        settled: Number(row.settled),
        wins: Number(row.wins),
      })),
    )
      .slice(0, 10)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return {
      ...base,
      price,
      candles,
      player: playerRows[0] ?? null,
      history: historyRows.map(toView),
      stats: computeStats(statsRows.map((row) => ({ status: row.status as PredictionStatus }))),
      leaderboard,
      hasPredictedCurrent: historyRows.some(
        (row) => row.candleOpenTime.getTime() === target.openTime,
      ),
      pendingCount: Number(pendingRows[0]?.value ?? 0),
    };
  } catch (error) {
    if (isMissingSchemaError(error)) {
      return { ...base, available: false, reason: "database-not-migrated" };
    }
    throw error;
  }
}

/** Validate, price and persist one prediction. Never trusts client settlement. */
export async function submitPrediction(input: SubmitInput): Promise<SubmitResult> {
  const now = Date.now();
  const target = targetAt(now);

  if (!isDbConfigured()) return { ok: false, reason: "unavailable" };
  if (
    !ALLOWED_SYMBOLS.includes(input.symbol as (typeof ALLOWED_SYMBOLS)[number]) ||
    !ALLOWED_TIMEFRAMES.includes(input.timeframe as (typeof ALLOWED_TIMEFRAMES)[number])
  ) {
    return { ok: false, reason: "bad-market" };
  }
  if (!target.windowOpen) return { ok: false, reason: "closed" };

  // The entry price is the target candle's official open, fetched here. If the
  // exchange is unreachable we reject rather than inventing a price.
  const candle = await fetchCandle(target.symbol, target.timeframe, target.openTime, now);
  if (!candle) return { ok: false, reason: "no-price" };

  try {
    const db = getDb();
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        username: input.username,
        emailOptIn: input.emailOptIn,
        consentAt: input.emailOptIn ? new Date(now) : null,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          username: input.username,
          emailOptIn: input.emailOptIn,
          consentAt: input.emailOptIn ? new Date(now) : null,
        },
      })
      .returning({ id: users.id });

    await setPlayerCookie(user.id);

    const [created] = await db
      .insert(predictions)
      .values({
        userId: user.id,
        symbol: target.symbol,
        timeframe: target.timeframe,
        direction: input.direction,
        candleOpenTime: new Date(target.openTime),
        entryPrice: String(candle.open),
        priceSource: candle.source,
        status: "PENDING",
        points: 0,
      })
      .onConflictDoNothing({
        target: [
          predictions.userId,
          predictions.symbol,
          predictions.timeframe,
          predictions.candleOpenTime,
        ],
      })
      .returning();

    if (!created) return { ok: false, reason: "duplicate" };
    return { ok: true, prediction: toView(created) };
  } catch (error) {
    if (isMissingSchemaError(error)) return { ok: false, reason: "database-not-migrated" };
    throw error;
  }
}

type DueRow = Pick<
  typeof predictions.$inferSelect,
  "id" | "userId" | "symbol" | "timeframe" | "direction" | "candleOpenTime" | "priceSource"
>;

interface ResolveResult {
  resolved: number;
  skipped: number;
}

/**
 * Idempotent settlement. Each prediction is updated with a single conditional
 * UPDATE (`status = PENDING`), so two concurrent resolvers can never award
 * points twice. Missing/non-final candles leave rows untouched.
 */
async function resolveRows(rows: DueRow[], now: number): Promise<ResolveResult> {
  const result: ResolveResult = { resolved: 0, skipped: 0 };
  if (rows.length === 0) return result;

  const groups = new Map<
    string,
    {
      symbol: string;
      timeframe: string;
      openTime: number;
      source: (typeof PRICE_SOURCES)[number];
      items: DueRow[];
    }
  >();
  for (const row of rows) {
    const openTime = row.candleOpenTime.getTime();
    const key = `${row.symbol}|${row.timeframe}|${openTime}|${row.priceSource}`;
    const existing = groups.get(key);
    if (existing) existing.items.push(row);
    else
      groups.set(key, {
        symbol: row.symbol,
        timeframe: row.timeframe,
        openTime,
        source: row.priceSource as (typeof PRICE_SOURCES)[number],
        items: [row],
      });
  }

  const db = getDb();
  for (const group of groups.values()) {
    const candle = await fetchCandleFromSource(
      group.source,
      group.symbol,
      group.timeframe,
      group.openTime,
      now,
    );
    if (!candle || !candle.final) {
      result.skipped += group.items.length;
      continue;
    }

    await db
      .insert(candles)
      .values({
        symbol: group.symbol,
        timeframe: group.timeframe,
        openTime: new Date(group.openTime),
        openPrice: String(candle.open),
        closePrice: String(candle.close),
        priceSource: candle.source,
        resolvedAt: new Date(now),
      })
      .onConflictDoNothing();

    for (const item of group.items) {
      const outcome = settleCandle(
        { open: candle.open, close: candle.close },
        item.direction as Direction,
      );
      const updated = await db
        .update(predictions)
        .set({ status: outcome.status, points: outcome.points, resolvedAt: new Date(now) })
        .where(and(eq(predictions.id, item.id), eq(predictions.status, "PENDING")))
        .returning({ id: predictions.id });
      result.resolved += updated.length;
      result.skipped += updated.length === 0 ? 1 : 0;
    }
  }

  return result;
}

function dueQuery(now: number) {
  return and(eq(predictions.status, "PENDING"), lte(predictions.candleOpenTime, new Date(now)));
}

export async function resolveDuePredictionsForUser(
  userId: string,
  now: number,
  limit: number,
): Promise<ResolveResult> {
  const rows = await getDb()
    .select()
    .from(predictions)
    .where(and(dueQuery(now), eq(predictions.userId, userId)))
    .orderBy(predictions.candleOpenTime)
    .limit(limit);
  return resolveRows(rows, now);
}

/** Cron entry point. Settlement of all players is batched by candle. */
export async function resolveDuePredictions(now = Date.now()): Promise<ResolveResult> {
  const rows = await getDb()
    .select()
    .from(predictions)
    .where(dueQuery(now))
    .orderBy(predictions.candleOpenTime)
    .limit(CRON_RESOLVE_LIMIT);
  return resolveRows(rows, now);
}
