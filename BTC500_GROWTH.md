# BTC500 Growth Log

Working memory for the autonomous growth work. Keep it short, dated, and
evidence-based. Do not record guesses as results.

---

## Baseline — measured 2026-10-22

Source: Google Search Console API (property `https://btc500.net/`), via
`npm run search-console` and `npm run search-console:inspect`. Report files are
gitignored under `scripts/search-console/output/`.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 90 days (2026-07-22 → 2026-10-19) | 49     | 3,370       | 1.5%  | 25.8         |
| 28 days (2026-09-22 → 2026-10-19) | 25     | 90          | 27.8% | 9.8          |

What the numbers actually mean:

- **Non-brand organic traffic is effectively zero.** In the last 28 days the
  only query with meaningful volume is `btc500` (40 impressions, 4 clicks,
  position 3). Everything else is 1–3 impressions.
- **The August spike was one dated news page.** The week of 10 Aug produced
  2,361 impressions, 2,067 of them on `/articles/bitcoin-week-ahead` at average
  position 6.6 — for queries like "bitcoin etf flows august 12 2026". It earned
  1 click. Since those dated pages were moved out of the index (commit
  `2c7f981`) the site sits at 30–50 impressions/week. The collapse is
  intentional, not a regression.
- **The one durable non-brand cluster is the 500-day window.** 90-day data:
  `when is 500 days before the next bitcoin halving` 12 impressions @ 8.8
  (`/halving-dates`), `what is 500 days before the next bitcoin halving` 5 @
  11.0, `bitcoin 500 day cycle` 3 @ 10.3 (`/bitcoin-500-day-cycle`). All zero
  clicks.
- **Indexation is the gate.** 6 of 25 sitemap URLs are indexed. Core pages
  (`/bitcoin-500-day-cycle`, `/simulator`, `/halving-dates`, `/dca`,
  `/timeline`, `/liquidation`) are "Crawled – currently not indexed"; `/about`,
  `/news`, `/bitcoin-etf`, `/embed-kit`, `/insider-trading`,
  `/when-to-sell-bitcoin-after-halving` are "URL is unknown to Google". Google
  downloaded the sitemap on 2026-10-22 with 0 errors.
- **Diagnosis:** the pages are not thin (1,200–1,700 rendered words each with
  original tables) and there are no canonical, robots, or duplicate-title
  problems. A three-month-old domain with no external links is simply not worth
  crawling. The blocker is authority and distribution, not on-page code.
- **Limitation:** no analytics connector in this environment. Clicks are the
  only traffic evidence available; referral and returning-visitor data are not
  measurable here.

---

## Latest measurement — 2026-10-23

Same tooling, data state `all`, lag offset applied.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-09-23 → 2026-10-20) | 25     | 90          | 27.8% | 9.8          |
| 7 days (2026-10-14 → 2026-10-20)  | 10     | 37          | 27.0% | 14.1         |

- The 28-day totals are identical to the 2026-09-22→10-19 window recorded on
  2026-10-22 (25/90). One day rolled off, one day rolled on, both empty. That is
  noise, not a trend — do not read it as flat performance or as a recovery.
- 28-day queries: 5. `btc500` is the only one with volume (4 clicks / 40
  impressions / position 3). Every non-brand query is 1–3 impressions.
- Indexation: 6 of 25 sitemap URLs pass, 19 need attention — byte-identical to
  the 2026-10-22 14:37 inspection. Four core URLs (`/bitcoin-500-day-cycle`,
  `/halving-dates`, `/when-to-sell-bitcoin-after-halving`, `/bitcoin-etf`) show a
  crawl date of 2026-10-22, i.e. IndexNow did trigger a fetch. Google still
  answered "Crawled – currently not indexed". **Crawl was never the missing
  step at that scale; the site is being fetched and declined. Authority, not
  discovery, is the gate.**
- `/about`, `/news`, `/embed-kit`, `/insider-trading`,
  `/articles/why-btc500-exists`, `/articles/rupl` remain "URL is unknown to
  Google" — still not fetched at all.
- The 2026-10-22 T-500 + calendar experiment is **too early** (1 day old).
  Next reading 2026-11-19. Inconclusive if impressions stay under 20.

---

## Completed work

### 2026-10-23 — Removed the cycle score

Owner decision: the score was built to locate a bear-market position, and the
site is treating the current period as a bull market. Keeping a "where are we in
the bear cycle" gauge on the homepage worked against the product's own thesis
and added a second, competing hero number next to the countdown.

Removed end-to-end:

- Scoring logic and server assembly (`src/lib/cycle-score.ts`,
  `src/lib/cycle-score.functions.ts`), the `cycleScoreQuery`, and its cache key /
  TTL. The BitView fetch path that only fed the score goes with it.
- Homepage surfaces: Command Center right panel, hero data tape, sticky mobile
  CTA, and the hard-coded score demo inside the "after the buy window" preview
  modal. The Command Center now shows the countdown plus dates and block
  progress; phase drives the accent colour.
- Embeds: the `score` widget and score chips are gone. Legacy
  `/embed?widget=score` URLs normalise to the full countdown (verified 307 →
  `widget=full`), so existing iframes still render.
- SEO/meta copy in `__root`, `/`, `/about`, `/embed-kit`, `manifest.json`,
  `llms.txt`, `llms-full.txt`, and the OG SVG pill. The article cross-reference
  now points to the 500-day explainer and the bear-market article.

Validation: `npm test` 79/79, `tsc --noEmit` clean, production build clean, no
new eslint/prettier problems in touched files. Dev SSR check: `/` renders
"Cycle command center" and no score; `/embed-kit` 200; `/embed?widget=score`
redirects to the full countdown.

Deployed as `910fb27` to `main`. Production check after the Vercel build: `/` 200
with no score copy, `/embed?widget=score` 307s to `widget=full`, `/embed-kit`
serves "Countdown Widgets", and `llms.txt` / `manifest.json` carry no score.

### 2026-10-23 — Inside-the-window drawdown study on the pillar page

The pillar published what each window paid but never what it cost to hold.
`/bitcoin-500-day-cycle` now carries a drawdown table computed from the same
daily-close archive as the simulator (`src/lib/cycle-risk.ts`, pure, 10 new
tests): T-500 entry, lowest close and the date it printed, % vs entry, days from
entry to the low, how many pre-halving closes were below entry, and the worst
peak-to-trough close inside the window. Text is generated from the computed
summary, so no figure can go stale.

Real numbers from the current archive (verified against an independent Python
pass over `public/btc-usd-max.csv`):

| Cycle | T-500 entry | Low close            | vs entry | Days to low | Below entry pre-halving |
| ----- | ----------- | -------------------- | -------- | ----------- | ----------------------- |
| 2012  | $14.07      | $2.30 (2011-11-22)   | -83.7%   | 128         | 491 / 501               |
| 2016  | $237        | $210 (2015-08-24)    | -11.5%   | 180         | 92 / 501                |
| 2020  | $3,854      | $3,394 (2019-02-07)  | -11.9%   | 41          | 56 / 501                |
| 2024  | $16,851     | $16,423 (2022-12-19) | -2.5%    | 12          | 18 / 501                |

Median lowest close -11.7% vs entry, median 85 days to the low. Why this is the
right asset rather than another article: it answers the strongest objection to
the rule ("you buy and sit 40% underwater") with numbers nobody else publishes,
it is auditable from the CSV the site already ships, and it deepens the pillar
that is already crawled instead of adding a 26th thin URL.

- Also: contextual internal link from `/when-to-sell-bitcoin-after-halving` to
  `#risk-heading`, a method-based FAQ entry (rendered visible + in FAQPage
  JSON-LD, 7 → 8 questions), updated `lastmod` for both URLs in `sitemap.xml`,
  and a drawdown bullet in `llms.txt` / `llms-full.txt` so AI crawlers cite the
  page correctly.
- `npm test` 79/79, `tsc --noEmit` clean, default build clean,
  `NITRO_PRESET=node-server` build serves both pages with the table and the new
  FAQ in the SSR HTML. No new eslint/prettier problems in touched files.
- Deployed as `c54e489` to `main`. Vercel served the new build ~60 s after the
  push. Verified from the production HTML, not the Vercel dashboard:
  `/bitcoin-500-day-cycle` (2,027 rendered words, canonical intact) renders the
  section with $14.07 → $2.30, -83.7%, 491 of 501, median -11.7% and 85 days;
  its FAQPage JSON-LD now carries 8 questions;
  `/when-to-sell-bitcoin-after-halving` links `#risk-heading`;
  `/sitemap.xml` shows the new lastmod; `llms-full.txt` serves the drawdown
  bullet. `/`, `/robots.txt` and the calendar feed still 200. IndexNow returned
  200 for 25 URLs.

**Experiment:** does publishing the drawdown/underwater record change anything
for the 500-day cluster? Success = any non-brand click or new referring domain
by 2026-11-20. Inconclusive if impressions stay under 20.

### 2026-10-23 — Google Analytics 4

- Installed GA4 (`G-GM4WBKY74P`) in the root document head. The bootstrap only
  runs on `btc500.net` / `www.btc500.net`, so local dev and Vercel previews
  never pollute the property.
- It runs inline in `<head>` rather than from an effect, so the first pageview
  is captured before hydration; GA4 enhanced measurement covers client-side
  route changes. Vercel Analytics stays in place as a second, cookieless view.
- Connected to the GA4 Data API on 2026-10-23: property `560440382`, the
  service account added as Viewer, Data + Admin APIs enabled. The API returns
  200; realtime showed an active user on the homepage. Standard reports are
  still empty because the tag is hours old and GA4 processing lags 24–48 h.
- `scripts/analytics/fetch-ga4.ts` mirrors the Search Console tooling: totals
  with previous-period deltas, channels, landing pages, new vs returning,
  devices, referral sources, and `--realtime`. Reports go to the gitignored
  `scripts/analytics/output/`.
- Verified in production 2026-10-23: the tag renders exactly once inside
  `<head>`; headless Chrome requested `gtag/js?id=G-GM4WBKY74P` and sent a
  `/g/collect` hit with `tid=G-GM4WBKY74P` for `https://btc500.net/`.

### 2026-10-22 — Daily autonomous cycle at 06:00

- `scripts/autonomous/run-growth-cycle.sh` runs the `growth-cycle` OpenCode agent
  unattended (free models in order: DeepSeek → GLM-5.3 → MiniMax → MiMo →
  Flint), locks against overlap, time-boxes each attempt, fast-forwards `main`,
  pushes any unpushed commit, polls production, logs to
  `~/.local/state/btc500-growth/<date>.log`, and notifies on finish/failure.
- `.opencode/agents/growth-cycle.md` is the headless profile (no questions, no
  subagents, no secrets, no force-push / history rewrites). The daily brief lives
  in `scripts/autonomous/GROWTH_PROMPT.md`.
- `scripts/autonomous/install-schedule.sh` installs the launchd job
  `net.btc500.growth` (06:00 daily, missed runs fire on wake; `--status`,
  `--run-now`, `--test`). `--test` fired a temporary job ~3 minutes ahead and the
  model answered `SMOKE_OK`, so the scheduler itself is proven.
- **Note for future sessions:** the scheduler is that runner script — do not add
  a second cron. If a run fails, read the day's log first; the commit message of
  the day is the report.
- **2026-10-23, first scheduled run:** launchd fired at 06:00:00 and DeepSeek
  shipped the drawdown study (`c54e489`) plus a verification commit (`545ab8b`).
  The CLI exited 130 at 06:10:36 while the server-side session kept working, so
  the runner recorded `dirty-tree` even though the work landed at 06:12 and
  06:15. Fixed: after a non-zero exit the runner now waits for the session to
  settle (2–15 min) and accepts a late commit as success. Verified with a
  synthetic late-commit test (exit 130, commit 15 s later → `status=shipped`)
  and a clean-idle test (`status=no-commit`, no hang).

### 2026-10-22 — T-500 answer + downloadable halving calendar

- `/halving-dates` now states the T-500 date directly (computed from the live
  block-height model) instead of only ranking for the query, plus live dates in
  the two date FAQ answers (schema stays method-based).
- `/bitcoin-halving-calendar.ics`: buy window, halving, sell window as all-day
  events with a 30-day reminder; generated from the live halving model,
  `text/calendar`, 1-hour edge cache; linked from three pages.
- Corrected the buy/sell dates in `llms.txt` / `llms-full.txt` to state both the
  live estimate (2026-11-28 / 2029-08-24) and the consensus projection
  (2026-11-30 / 2029-08-26).
- 12 calendar tests; deployed as `fdad458` and verified in production.

---

## Next priorities

1. **Earn external links — still the actual blocker.** IndexNow already gets
   Google to fetch; Google declines to index. The drawdown table is now the most
   quotable thing on the domain (worst case -84%, 491 of 501 days underwater).
   Needs 5–10 real links from Bitcoin newsletters, communities or data roundups.
   Any posting/outreach from an external account requires owner authorization.
2. **Concentrate the crawlable surface.** `/embed-kit` (248 rendered words) and
   `/about` (411) are the weakest indexable URLs and both are still unknown to
   Google. Either deepen them with real content or drop them from the sitemap.
   Keep internal links to the 500-day cluster exact-anchored.
3. **Own the 2026-11-28 buy window.** It is 36 days out. Make the countdown, the
   calendar reminder and the share card point at one date, then measure brand vs
   non-brand clicks around it.

## Open issues

- Clicks from Poland (20 of 24 impressions in 28 days) look like owner or
  internal traffic; treat country splits as noise until volume is larger.
- `/bear-market` still earns impressions while 301-redirecting to
  `/bitcoin-500-day-cycle`; harmless, but Google has not consolidated the old URL.
- GA4 is connected, but its standard reports are empty until processing catches
  up (installed 2026-10-23; expect usable daily numbers from 2026-10-25).
  EU cookie consent is still missing.
