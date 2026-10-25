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

## Results review — 2026-10-25 (deep, verdict: stagnant)

First run of the results reviewer. Verdict is forced by the data:
`rule.mayClaimImproving=false` — 0 positive outcome signals, need 2. Nothing
regressed, so `stagnant`, not `failing`.

| Signal | Reading | Verdict |
| --- | --- | --- |
| Indexed | 6/25, identical on 2026-10-22 and 2026-10-25 | stalled |
| Non-brand clicks | 0 on 719 attributed non-brand impressions (90d) | stalled |
| Impressions (7d) | 28, was 45 on 10-22 — under 100, noise | flat |
| Sessions / referrals | 19 sessions, 18 Direct + 1 Organic, 0 referral | stalled |
| Owner asks ever issued | 0; `outreach/` holds only `README.txt` | stalled |

What the 6 indexed URLs are: the homepage plus 5 August-dated news articles
(crawled 2026-08-08 → 08-17). The four pages the product depends on —
`/bitcoin-500-day-cycle`, `/halving-dates`, `/simulator`,
`/when-to-sell-bitcoin-after-halving` — are all "Crawled – currently not
indexed". Every article already carries 4 internal links to the pillar; the
canonical matches on all 25 URLs. **Internal linking and on-page quality are not
the missing piece; external authority is.** 0 referring domains, 0 referral
sessions, 0 posts.

Input vs output: 28 commits since 2026-10-19 (12 on 10-22, 9 on 10-23, 2 on
10-24, 5 on 10-25). Four substantive product changes — drawdown study, timing
test, live-date strip, cycle-score removal — and the output is 0 new indexed
URLs, 0 non-brand clicks, 0 referring domains. The work was competent; it was
aimed at a URL Google had already declined on 2026-10-22.

Two measurement caveats, recorded so the next review does not over-read this one:

- `results-history.csv` starts 2026-10-22 and `status-history.csv` did not exist
  at collection time, so "stalled 3d" understates a stall the 90-day report puts
  at ≥90 days.
- GSC names a query for only 5 of 26 clicks in 28 days (17 of 49 in 90 days).
  "0 non-brand clicks" is a floor over 81% of clicks, not a measured zero.

Actions taken by this review: indexation freeze added to
`GROWTH_PROMPT.md`; the drawdown and timing experiments merged into one
`distribution-test`; backlog rescored below; `/halving-dates` flagged for a
merge into the pillar once indexation moves. Owner asks are in
`~/.local/state/btc500-growth/owner-asks.txt`.

### Competitive benchmark (fetched 2026-10-25)

- **Bitbo, 500-Day Halving Window** — live chart updated every 4 hours, buy/sell
  markers, per-window return including the open window, methodology published.
- **bitcoin-daily.com, "The Satoshi Clock"** — live cycle-clock and power-law
  spiral, predictions "stated before the outcome exists", an arXiv/SSRN paper and
  open replication code.
- **btc.aipeterlab.com** — live current-status dashboard: next buy date,
  countdown, decision path, signal history, +540-day variant.

What we have that they do not: the per-cycle drawdown survival table and the
entry-timing sensitivity test. What we lack: a live view, a citation block, a
machine-readable endpoint, and any link. The gap is distribution, not data.

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

1. **Distribution, with a citation surface.** The buy window opens in 34 days
   (2026-11-28) and the site has no external signal: 0 referring domains, 0
   referral sessions, 19 of 25 URLs unindexed. The cycle's job is the asset — a
   citation block + `/data/500-day-cycles.json` + 3 send-ready pitches. The
   owner's job is to publish the asks. Nothing else moves indexation.
2. **Own 2026-11-28 — the buy window opens in 34 days.** The on-site work is
   done (live date, calendar file, timing table, drawdown record, one date on
   every article page). Stop adding to it.
3. **Indexation is the gate, and it is an authority problem.** 6/25 indexed; the
   5 subpages Google indexes are August news articles. The pillar was crawled on
   2026-10-22 and declined. Do not deepen unindexed pages further until a
   referring domain exists. After that: merge `/halving-dates` into
   `/bitcoin-500-day-cycle` (one intent, two crawled-not-indexed URLs) and drop
   `/embed-kit` (274 words) and `/about` (402) from the sitemap.

## Ranked backlog

Rescored 2026-10-25 by the review, against the signals that are actually stalled.
Scored 1–10 on impact × confidence ÷ effort. **Items that add a URL are frozen
until indexed ≥ 8/25.**

| #   | Bet                                          | Why it can move the needle                                                  | I   | E   |
| --- | -------------------------------------------- | --------------------------------------------------------------------------- | --- | --- |
| 1   | Outreach pack (3 send-ready pitches)         | Links are the gate; 0 referring domains, 19/25 unindexed                     | 10  | 3   |
| 2   | Citation block + `/data/500-day-cycles.json` | A writer needs a number, a method and a machine-readable source to cite      | 8   | 2   |
| 3   | Date-first title/meta on the pillar          | 61 impressions / 0 clicks on the exact cluster, best position 9.1            | 7   | 1   |
| 4   | Consent banner (defect)                      | GA4 runs without it — legal + data-quality risk, still unfixed               | 6   | 2   |
| 5   | Merge `/halving-dates` into the pillar       | One intent split across two crawled-not-indexed URLs; 0 impressions in 28d   | 6   | 3   |
| 6   | Cycle-vs-cycle live tracker                  | Bitbo and bitcoin-daily already own the live view; only pays once indexed    | 4   | 6   |
| 7   | `/cycle/*` pages, cost-of-waiting calculator | New URLs for a site with 19/25 unindexed — blocked by the freeze             | 3   | 6   |

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
- Shared helpers (`log`, `notify`, `acquire_lock`, `wait_for_stability`,
  `btc_validate`, `btc_vercel_wait`, `btc_repo_slug`, `btc_append_history`)
  live in `scripts/autonomous/lib.sh` and are sourced by both runners.

## Results review (installed 2026-10-25)

Activity is not a result, so a second job judges it. `net.btc500.review` runs
`run-review-cycle.sh` at **09:30 daily** (deep mode on Sundays) and exits
**non-zero whenever the site is not gaining**.

- `collect-results.mjs` reads the Search Console / inspection / GA4 reports,
  backfills `results-history.csv` from the dated reports on disk, and reduces
  everything to signals: indexation, non-brand clicks, impressions, sessions,
  referrals, plus process signals (deploy health, cycle yield, data freshness).
  It writes `review-input.json` including **`rule.mayClaimImproving`** — false
  unless ≥2 green outcome signals, no regressions and fresh data.
- The `growth-review` agent (`.opencode/agents/growth-review.md`, prompt
  `scripts/autonomous/GROWTH_REVIEW.md`) must explain every stalled signal,
  order ≤5 mandates with evidence and dates, and set measurable targets. It may
  edit the strategy documents; it may not edit the runners — machinery changes
  become mandates.
- `validate-review.mjs` enforces the verdict against the data before anything is
  pushed: an "improving" verdict while `mayClaimImproving` is false is
  **rejected**, committed as evidence and reported as `verdict-invalid`.
- Verdicts: `improving` (exit 0), `stagnant` / `failing` (exit 1), plus
  `verdict-invalid`, `no-review`, `deferred`, `validation-failed`,
  `push-blocked`. History in `review-history.csv`, verdict in
  `scripts/autonomous/review-latest.json`.
- The daily cycle reads the verdict in preflight: **mandates come before the
  backlog**, and after two non-improving reviews in a row preflight says so
  explicitly.
- Three consecutive non-improving reviews force `self_changes[]` in the next
  review — repeating a failing approach is the failure mode this layer exists
  to catch.
- **Asks — the human half of the loop.** A non-improving verdict must order at
  least one action **only the owner can take**, written out verbatim: an X post
  for [@btc500halving](https://x.com/btc500halving), a community comment, a
  newsletter pitch — `content` to copy-paste as-is (≤280 chars for X), a `url`
  on `https://btc500.net`, the evidence, and the metric that proves it worked.
  The validator rejects a stagnant/failing review without one (cap 5). The
  runner renders `owner_asks[]` into `~/.local/state/btc500-growth/owner-asks.txt`,
  into the notification, and into the commit body — the ask has to reach the
  owner on a phone, not sit in a JSON file. Next review, the `ask-effect`
  signal checks whether the ask's `referrers` produced sessions; nothing after
  7 days is reported `stalled` and must be restated narrower, never dropped.
  The daily cycle sees the asks for context only and must not act on them.

## Open issues

- **GSC query attribution is incomplete: "0 non-brand" is a floor.** The query
  dimension names only 5 of 26 clicks in 28 days and 17 of 49 in 90 days. Any
  brand/non-brand split built on it is a lower bound until the collector records
  unattributed clicks next to attributed ones. Do not report it as an exact
  count.
- **Run history started 2026-10-25.** `status-history.csv` did not exist before
  the 2026-10-25 runner upgrade, so the first review had no activity data and
  `results-history.csv` holds 4 days. "Stalled 3d" understates older stalls.
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
