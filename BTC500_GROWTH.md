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
  2,361 impressions, 2,067 on `/articles/bitcoin-week-ahead` at average position
  6.6 for queries like "bitcoin etf flows august 12 2026", and 1 click. After
  those dated pages were moved out of the index (`2c7f981`) the site sits at
  30–50 impressions/week. Intentional, not a regression.
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
- **Diagnosis:** the pages are not thin (1,000–2,100 rendered words each with
  original tables) and there are no canonical, robots, or duplicate-title
  problems. A three-month-old domain with no external links is not worth
  crawling. The blocker is authority and distribution, not on-page code.
- **Limitation:** GA4 exists since 2026-10-23; referral and returning-visitor
  data before that date do not exist.

---

## Latest measurement — 2026-10-25

Same tooling, data state `all`. GSC window ends 2026-10-22; GA4 window ends
2026-10-24.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-09-25 → 2026-10-22) | 26     | 94          | 27.7% | 10.4         |
| 7 days (2026-10-16 → 2026-10-22)  | 8      | 28          | 28.6% | 18.6         |

- 28 days was 25 / 92 and 7 days 9 / 31 on 2026-10-24. One click and two
  impressions is noise, not a trend.
- Only brand queries are reportable: `btc500` 5 clicks / 41 impressions @ 3.0.
  No non-brand query clears GSC's reporting threshold.
- Indexation is byte-identical: **6 of 25 indexed**, 19 need attention, crawl
  dates unchanged (`/bitcoin-500-day-cycle` 2026-10-22, `/simulator`
  2026-09-12, `/dca` 2026-09-06). GSC shows "no canonical" for `/liquidation`
  and 4 article URLs, but all 25 production URLs carry a matching canonical —
  a stale crawl record, not a live defect.
- 92 of 94 impressions are the homepage. The other 32 page-level impressions
  are all dated `/articles/*` URLs at average positions 2–7 with **0 clicks**.
  Those articles are the only subpages Google currently surfaces.
- GA4 28 days: **19 sessions / 11 users / 31 views / 42.1% engagement**, 18
  Direct + 1 Organic, no referrals. Up from 12 / 9 / 22, but still owner and
  testing traffic. Too small to interpret.
- **Found:** 7 article routes' FAQPage JSON-LD, 8 article bodies, and the
  llms.txt / llms-full.txt summaries called 30 November 2026 the "official" buy
  date; one article said it "is not moving". The live model says 28 November 2026. Google indexes the articles and the homepage, so the site published two
  answers to its own core question 34 days before the buy window opens.

---

## Completed work

### 2026-10-25 — One live buy date on every article page

Why this over new content: authority is unchanged and the pages Google actually
indexes were contradicting the live date 34 days before the buy window. Fixing
that protects the one claim the product depends on and aligns the indexed
snippets, FAQ markup, feed and AI knowledge files with the homepage,
`/halving-dates` and the .ics calendar.

- New `ArticleDateNotice` (`src/components/articles/ArticleDateNotice.tsx`),
  mounted once in `__root.tsx` for article paths only. It renders the live T-500
  date, days until, halving date/height, and reconciles the projections: earlier
  notes used an April 13, 2028 halving (30 November 2026), the live estimate is
  April 11, 2028 (28 November 2026), and both derive from block 1,050,000.
  Rendered from the root-seeded halving snapshot, so it is in the server HTML
  Google fetches, not added after hydration.
- Corrected 7 FAQPage answers (80k, casino, week-ahead, Goldman, SEC, solar
  eclipse, why-pumped), the solar-eclipse "not moving" sentence, two meta
  descriptions, two `feed.xml` descriptions, and 12 llms.txt / llms-full.txt
  article summaries to "projected … when this was published" instead of a fixed
  official date.
- `public/sitemap.xml`: `lastmod` 2026-10-25 for the 11 article URLs (all gained
  the strip).
- `src/lib/article-path.ts` + tests for the path match that decides where the
  strip renders.

Validation: `npm test` 92/92, `tsc --noEmit` clean, default and
`NITRO_PRESET=node-server` builds clean, no new eslint/prettier problems in
touched files (SolarEclipseHalvingArticle keeps its 39 pre-existing ones). Local
SSR: `/articles/solar-eclipse-bitcoin-halving` and `/articles/strongest-hands`
contain "Live date", "November 28, 2026" and "34 days away" plus the corrected
FAQ JSON-LD; `/`, `/articles`, `/articles/` and a 404 do not render the strip.

Not a traffic experiment: success is that the article pages stop contradicting
the live date, verified in production. The 2026-11-19 reading still covers the
timing test and the calendar asset.

**Deployed as `aab432e`.** Production verified after the Vercel build: all five
indexed article URLs return 200 with one "Live date" strip, "November 28, 2026"
and "34 days away", and no "not moving"; the corrected FAQ JSON-LD is served;
`/articles` and `/` do not render the strip; `/`, the pillar, `/halving-dates`,
`/robots.txt`, `/sitemap.xml`, `/feed.xml`, `/llms.txt` and the calendar feed
all 200; sitemap carries 11 `2026-10-25` lastmods; feed lastBuildDate updated;
IndexNow returned 200 for 25 URLs.

### 2026-10-24 — Entry-timing test on the pillar page

Competitive check (public pages only): `charts.bitbo.io/500-day-halving-window`
(2026-10-20) plots the T-500→T+500 rule and a Dune dashboard by Lucas Santana
plots indexed window performance; `btc.aipeterlab.com` runs a +540-day variant.
**The plain 500-day chart is taken.** The gap is what the rule cost to hold and
how much the exact date matters — what this and the drawdown study publish.

New `/bitcoin-500-day-cycle#timing-heading`: for every completed window, the
same T+500 exit with the entry moved ±120 days (`src/lib/cycle-timing.ts`, 11
tests; `timing` in the simulator payload). Table of % change vs the exact T-500
entry per cycle, median row, three stat tiles, prose generated from the computed
summary. FAQPage grew 8 → 9 questions; `llms.txt` / `llms-full.txt` and the
sitemap `lastmod` updated. `/about` no longer claims the homepage shows a cycle
score or that the 2024 cycle is open.

| Entry vs T-500 | Cycles | Median change | Direction        |
| -------------- | ------ | ------------- | ---------------- |
| 120 days early | 3      | -32.5%        | worse in 3 of 3  |
| 60 days early  | 3      | -24.5%        | worse in 3 of 3  |
| 30 days early  | 3      | -12.5%        | worse in 3 of 3  |
| 30 days late   | 4      | +3.9%         | higher in 2 of 4 |
| 60 days late   | 4      | +4.9%         | higher in 3 of 4 |
| 120 days late  | 4      | -14.4%        | lower in 3 of 4  |

The 2012 window is the outlier (+356.8% for a 120-day delay) because the archive
starts on its T-500 and price fell from $14.07 to $2.30 immediately after.
Conclusion on the page: the date is not a knife-edge, earlier was never better
in this sample, and the later-entry result depends on what price did next.

Deployed as `46b092d`, production verified. **Operational note:** the daily
runner pushed `46b092d` while the session was still working. Do not amend a
commit during a scheduled run — add a follow-up commit instead.

**Experiment:** does the published robustness test move the 500-day cluster?
Success = any non-brand click or new referring domain by 2026-11-20;
inconclusive if impressions stay under 20. Next reading 2026-11-19.

### 2026-10-23 — Cycle score removed, drawdown study, GA4 installed

- **Cycle score removed** (`910fb27`): score logic, homepage gauge, data-tape
  chips, sticky CTA and embeds deleted; legacy `/embed?widget=score` 307s to the
  full countdown. Owner decision: a "bear-market position" gauge fought the
  product's own bull-market thesis.
- **Drawdown study** (`c54e489`): `src/lib/cycle-risk.ts` computes the lowest
  close after entry and its date, % vs entry, days to the low, pre-halving
  closes below entry, and worst peak-to-trough close. Median lowest close
  -11.7% vs entry, 85 days to the low; 2012 is the extreme ($14.07 → $2.30).
- **GA4** (`b5cf0ed`, `08508a0`): tag `G-GM4WBKY74P` on production hosts only;
  `scripts/analytics/fetch-ga4.ts` mirrors the GSC tooling. Verified with a
  headless `/g/collect` hit.

### Earlier history

- **2026-10-22** — Autonomous daily runner
  (`scripts/autonomous/run-growth-cycle.sh`, launchd `net.btc500.growth` at
  06:00) with lock, time-box, push and production polling. Do not add a second
  cron. `/halving-dates` states the live T-500 date directly and
  `/bitcoin-halving-calendar.ics` serves buy/halving/sell events with a 30-day
  reminder, generated from the live model.
- **2026-10-21 and earlier** — 25-URL sitemap, llms.txt / llms-full.txt, dated
  news articles removed from the index, embed kit, simulator, timeline, DCA,
  ETF and insider dashboards.

---

## Next priorities

1. **Own 2026-11-28 — the buy window opens in 34 days.** The unblocked work is
   on the site (live date, calendar file, timing table, and now one date on
   every article page). The missing step is distribution: one post from the
   owner's X account and one relevant community post pointing at
   `/bitcoin-500-day-cycle#timing-heading`. **Blocked:** posting from an
   external account needs owner authorization.
2. **Earn external links — still the actual blocker.** 19 of 25 URLs are not
   indexed and Google fetches then declines. The drawdown and timing tables are
   the most quotable things on the domain. Needs 5–10 real links from Bitcoin
   newsletters, communities or data roundups.
3. **Concentrate the crawlable surface.** `/embed-kit` (274 words) and `/about`
   (402) are the weakest indexable URLs and both are unknown to Google. Either
   deepen them with real content or drop them from the sitemap. Keep internal
   links to the 500-day cluster exact-anchored.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort (rough, but comparable). The idea
menu in `scripts/autonomous/GROWTH_PROMPT.md` §3 is the source; this is the
order to attack it.

| #   | Bet                         | Why it can move the needle                               | I   | E   |
| --- | --------------------------- | -------------------------------------------------------- | --- | --- |
| 1   | Owner-ready outreach pack   | Links are the gate; nothing else moves indexation        | 9   | 2   |
| 2   | Cycle-vs-cycle live tracker | Nobody plots "where this cycle sits vs 2016/20/24" daily | 8   | 6   |
| 3   | Machine-readable data + RSS | Citeable endpoints turn one finding into many links      | 8   | 4   |
| 4   | Cost-of-waiting calculator  | Answers the real question behind the timing table        | 7   | 5   |
| 5   | Consent banner (defect)     | GA4 is live without it — legal + data-quality risk       | 6   | 2   |
| 6   | `/cycle/2012…2024` pages    | Per-window stats no competitor publishes                 | 7   | 6   |
| 7   | Deepen or drop thin URLs    | Two unknown-to-Google URLs diluting the crawl surface    | 5   | 2   |

## Automation pipeline (installed 2026-10-25)

- `run-growth-cycle.sh` runs **preflight → attempt → gate → deploy check →
  report**. Preflight (`scripts/autonomous/preflight.mjs`) refreshes
  `public/btc-usd-max.csv`, lists due experiment readings and health-checks the
  site into `~/.local/state/btc500-growth/preflight.json`.
- The runner waits for the repository to be **stable** (HEAD unchanged and tree
  clean 3×45s) instead of trusting the CLI exit code, then runs `npm test` and
  `tsc --noEmit` as a gate before any push.
- Production is only called verified when the **Vercel commit status** on the
  pushed sha is green **and** `scripts/autonomous/last-deploy.json` (written in
  the same commit) matches the live HTML. A homepage 200 right after a push is
  the previous build — that is what used to be recorded as "verified".
- Every run appends to `~/.local/state/btc500-growth/status-history.csv`.

## Open issues

- Clicks from Poland (20 of 24 impressions in 28 days) look like owner or
  internal traffic; treat country splits as noise until volume is larger.
- `/bear-market` still earns impressions while 301-redirecting to
  `/bitcoin-500-day-cycle`; Google has not consolidated the old URL.
- EU cookie consent is still missing while GA4 is installed.
- Dated article bodies still quote 30 November 2026 as published. That is
  intentional — they are snapshots, and the live-date strip explains the
  difference. Do not mass-rewrite them.
- ~~The shipped `public/btc-usd-max.csv` ends 2026-07-11~~ — fixed 2026-10-25:
  the runner now appends validated daily rows in preflight (last row
  2026-10-24, gap repaired, source overlap median 0.008%). If preflight ever
  reports `archive=stale`, treat it as a defect, not a footnote.
