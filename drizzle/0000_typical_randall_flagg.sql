CREATE TABLE "candles" (
	"symbol" text NOT NULL,
	"timeframe" text NOT NULL,
	"open_time" timestamp with time zone NOT NULL,
	"open_price" numeric(20, 8) NOT NULL,
	"close_price" numeric(20, 8) NOT NULL,
	"resolved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "candles_symbol_timeframe_open_time_pk" PRIMARY KEY("symbol","timeframe","open_time")
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text NOT NULL,
	"direction" text NOT NULL,
	"candle_open_time" timestamp with time zone NOT NULL,
	"entry_price" numeric(20, 8),
	"status" text DEFAULT 'PENDING' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"email_opt_in" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "predictions_one_per_candle" ON "predictions" USING btree ("user_id","symbol","timeframe","candle_open_time");--> statement-breakpoint
CREATE INDEX "predictions_pending_idx" ON "predictions" USING btree ("status","candle_open_time");--> statement-breakpoint
CREATE INDEX "predictions_user_history_idx" ON "predictions" USING btree ("user_id","candle_open_time");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");