# Candle Clash — setup and scope

Candle Clash is a free-to-play BTC/USDT candle forecasting game integrated at
`/clash` on btc500.net. This is the **thin vertical slice**: one market, one
timeframe (15m), and the full submit → persist → settle → display loop.

## What exists in the code

| Concern | Location |
| --- | --- |
| Rules, cutoff, settlement, streaks, leaderboard tie-break | `src/lib/clash/rules.ts` (pure, unit tested) |
| OHLC provider chain (Kraken → Coinbase → Binance) + final-candle verification | `src/lib/clash/market-data.ts` |
| Candlestick chart data + SVG chart | `src/lib/clash/chart.ts`, `src/components/clash/CandleChart.tsx` |
| Signed httpOnly player cookie | `src/lib/clash/identity.ts` |
| DB reads/writes and idempotent resolver | `src/lib/clash/service.ts` |
| Server functions (state, submit) | `src/lib/clash/functions.ts` |
| Protected settlement endpoint | `src/routes/api/cron/clash-resolve.ts` |
| Schema / migration | `src/db/schema.ts`, `drizzle/`, `drizzle.config.ts` |
| UI | `src/routes/clash.tsx`, `src/components/clash/ClashPage.tsx` |

## Environment variables

Add these to `.env.local` for local development and to the Vercel project for
deployments. **Never commit them.**

| Variable | Purpose | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Neon Postgres connection string | From the Neon integration (pooled connection string). Required. |
| `CLASH_COOKIE_SECRET` | HMAC key for the player cookie | At least 32 random characters. Required in production; a fixed dev-only value is used locally if absent. |
| `CRON_SECRET` | Protects `/api/cron/clash-resolve` | Vercel automatically sends `Authorization: Bearer $CRON_SECRET` to cron routes. |

Generate a secret with `openssl rand -hex 32`.

## Provision Neon

Vercel no longer has a native SQL database. Neon is a Postgres provider in the
Vercel Marketplace:

1. In the Vercel project, open **Storage → Marketplace → Neon Postgres** (or
   add the Neon integration to the team) and create a database.
2. Copy the **pooled** connection string into `DATABASE_URL` for both the
   development and production environments (Preview and Production).
3. Add `CLASH_COOKIE_SECRET` and `CRON_SECRET` to the same environments.
4. Pull the env vars for local work (`vercel env pull .env.local`) or paste them
   into `.env.local` manually.

The free tier is sufficient for the MVP.

## Migrations

```bash
bun install
bun run db:migrate          # applies drizzle/0000_*.sql to DATABASE_URL
```

After changing `src/db/schema.ts`, generate a new migration and review the SQL
before applying it:

```bash
bun run db:generate
```

Migrations are explicit on purpose — nothing creates tables at runtime.

## Settlement and cron

A prediction is settled only after its candle is closed **and** the market-data
provider returns a matching candle whose close time has passed. Missing,
malformed or non-final candles leave the prediction `PENDING`; they are never
counted as losses.

OHLC data comes from a provider chain: **Kraken → Coinbase → Binance**. Binance
is last because its API is geo-blocked from some Vercel egress regions. Each
prediction stores `price_source`, and settlement always re-fetches from that
same provider — sources are never mixed for one outcome. If the recorded source
is temporarily down, the prediction stays `PENDING` and retries later.

Two paths trigger settlement, both server-side and idempotent:

- **Background on demand:** the page calls `settleMyPredictionsFn` after
  hydration (and ~45s after each candle close), then refreshes if anything
  resolved. It retries a few times because exchanges can publish the final
  candle slightly late. Settlement is never part of the SSR read, so page loads
  stay fast. The daily cron remains the authoritative fallback when no browser
  is open.
- **Cron:** `vercel.json` schedules `/api/cron/clash-resolve` once a day
  (`0 3 * * *`), which is the **Hobby plan limit**. On Pro this can be changed to
  `*/15 * * * *` for resolution close to every candle close. The on-demand path
  is the UX safety net on Hobby.

Each prediction is finalised with a conditional `UPDATE ... WHERE status =
'PENDING'`, so two resolvers running at once cannot award points twice. The
`candles` upsert and the conditional update avoid the need for an interactive
transaction, which keeps the code compatible with Neon's HTTP driver.

## Game rules (as implemented)

- Market `BTCUSDT`, timeframe `15m`. The 1m/5m options in the brief are deferred.
- One prediction per player per candle, enforced by a unique index.
- Predictions close 60 seconds before the candle ends; late requests are rejected.
- The entry price is the target candle's official open, fetched server-side from
  the first working OHLC provider. If all providers fail, the submission is
  rejected rather than priced locally.
- `UP` = close > open, `DOWN` = close < open, equal = `VOID` (0 points).
- Correct = +1 point, incorrect/void = 0. Accuracy excludes void predictions.
- Identity is an email + username with no signup. A signed httpOnly cookie
  recognises the player on that device; the email is the upsert key.
- The opt-in checkbox stores consent only. No email sending is implemented.

## Deliberate limitations

- **Identity is unverified.** Anyone who knows your email can reuse it, so the
  leaderboard is not abuse-resistant. Email verification and rate limiting are
  follow-ups, not MVP features.
- **Email is not sent.** A future implementation needs an email provider and an
  opt-in send that matches the recorded consent.
- **One source per prediction.** The fallback chain is only used to choose a
  source at submission; settlement never switches providers for an existing
  prediction. Kraken/Coinbase quote BTC/USD rather than BTC/USDT, so a small
  basis difference from Binance is possible when the fallback is used.
- **No real-money wagering, deposits or prizes.**
- `/clash` is `noindex` for the MVP: the leaderboard is user-generated and the
  game is a retention surface, not an SEO destination.

## Verify before deploying

```bash
bun test
bun run typecheck
bun run lint
bun run build
```

Then deploy a **preview** first, run `bun run db:migrate` against the preview
database, and walk one full lifecycle: submit a prediction, wait for the candle
to close, call the resolver, and confirm the history/stats/leaderboard update.
Only promote to production after that passes.
