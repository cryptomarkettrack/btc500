import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Candle Clash persistence. Timestamps are stored with timezone (UTC on the
 * wire). Settlement is server-authoritative; clients never write status,
 * points, prices or timestamps.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    username: text("username").notNull(),
    // Marketing consent is captured explicitly at first play. No email is
    // sent by the MVP; this column exists so a future opt-in send is lawful.
    emailOptIn: boolean("email_opt_in").notNull().default(false),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull(),
    direction: text("direction").notNull(),
    candleOpenTime: timestamp("candle_open_time", { withTimezone: true }).notNull(),
    // The target candle's official open, fetched server-side at submission.
    entryPrice: numeric("entry_price", { precision: 20, scale: 8 }),
    status: text("status").notNull().default("PENDING"),
    points: integer("points").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("predictions_one_per_candle").on(
      table.userId,
      table.symbol,
      table.timeframe,
      table.candleOpenTime,
    ),
    index("predictions_pending_idx").on(table.status, table.candleOpenTime),
    index("predictions_user_history_idx").on(table.userId, table.candleOpenTime),
  ],
);

export const candles = pgTable(
  "candles",
  {
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull(),
    openTime: timestamp("open_time", { withTimezone: true }).notNull(),
    openPrice: numeric("open_price", { precision: 20, scale: 8 }).notNull(),
    closePrice: numeric("close_price", { precision: 20, scale: 8 }).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.symbol, table.timeframe, table.openTime] })],
);
