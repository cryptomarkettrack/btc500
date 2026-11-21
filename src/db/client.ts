import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let cached: Database | undefined;

/** True when a DATABASE_URL is present. Used to degrade the UI gracefully. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Neon's HTTP driver keeps each query in its own request, which suits Vercel
 * serverless. Settlement relies on single conditional UPDATE statements for
 * idempotency instead of interactive transactions, so neon-http is sufficient.
 */
export function getDb(): Database {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Connect Neon via the Vercel Marketplace and add the connection string before playing.",
    );
  }
  if (!cached) {
    cached = drizzle(neon(connectionString), { schema });
  }
  return cached;
}
