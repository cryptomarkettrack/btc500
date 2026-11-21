import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getClashState, submitPrediction } from "./service";

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
