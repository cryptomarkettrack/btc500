ALTER TABLE "candles" ADD COLUMN "price_source" text DEFAULT 'binance' NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "price_source" text DEFAULT 'binance' NOT NULL;