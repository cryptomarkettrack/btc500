import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { isDbConfigured } from "@/db/client";
import { getPlayerId } from "./identity";
import {
  getClashState,
  resolveDuePredictionsForUser,
  SETTLE_BATCH_LIMIT,
  submitPrediction,
} from "./service";

function logDatabaseCause(context: string, error: unknown): void {
  // Drizzle's DrizzleQueryError message omits the underlying Postgres error
  // and keeps it in `cause`. Log it server-side; never send it to the client.
  const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
  console.error(`[clash] ${context} failed:`, error, "underlying error:", cause);
}

export const getClashStateFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await getClashState();
  } catch (error) {
    logDatabaseCause("state read", error);
    throw error;
  }
});

const submitSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "letters, numbers and underscores only"),
  email: z.string().trim().toLowerCase().email().max(254),
  emailOptIn: z.boolean(),
  direction: z.enum(["UP", "DOWN"]),
  symbol: z.enum(["BTCUSDT"]),
  timeframe: z.enum(["15m"]),
});

/**
 * Background settlement. Called after hydration rather than during SSR so an
 * exchange API call never blocks the page. Idempotent, so retries are safe.
 */
export const settleMyPredictionsFn = createServerFn({ method: "POST" }).handler(async () => {
  const empty = { resolved: 0, skipped: 0 };
  if (!isDbConfigured()) return empty;
  const playerId = await getPlayerId();
  if (!playerId) return empty;
  try {
    return await resolveDuePredictionsForUser(playerId, Date.now(), SETTLE_BATCH_LIMIT);
  } catch (error) {
    logDatabaseCause("background settlement", error);
    return empty;
  }
});

export const submitPredictionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      return await submitPrediction(data);
    } catch (error) {
      logDatabaseCause("prediction submit", error);
      throw error;
    }
  });
