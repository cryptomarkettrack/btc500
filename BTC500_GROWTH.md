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
  6.6, and 1 click. After those dated pages were moved out of the index
  (`2c7f981`) the site sits at 30–50 impressions/week. Intentional.
- **The one durable non-brand cluster is the 500-day window.** 90-day data:
  `when is 500 days before the next bitcoin halving` 12 impressions @ 8.8
  (`/halving-dates`), `what is 500 days before the next bitcoin halving` 5 @
  11.0, `bitcoin 500 day cycle` 3 @ 10.3 (`/bitcoin-500-day-cycle`). Zero clicks.
- **Indexation is the gate.** 6 of 25 sitemap URLs indexed. Core pages
  (`/bitcoin-500-day-cycle`, `/simulator`, `/halving-dates`, `/dca`,
  `/timeline`, `/liquidation`) are "Crawled – currently not indexed".
- **Diagnosis:** pages are not thin (1,000–2,100 rendered words with original
  tables) and there is no canonical/robots/duplicate-title problem. A
  three-month-old domain with no external links is not worth crawling. The
  blocker is authority and distribution.
- **Limitation:** GA4 exists since 2026-10-23; referral and returning-visitor
  data before that date do not exist.

---

## Latest measurement — 2026-10-27

GSC window ends 2026-10-24; GA4 window ends 2026-10-26. Archive fresh to
2026-10-26 (5,578 daily closes, 2011-07-17 start).

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 90 days (2026-07-27 → 2026-10-24) | 50     | 3,378       | 1.5%  | 25.8         |
| 28 days (2026-09-27 → 2026-10-24) | 26     | 94          | 27.7% | 11.2         |
| 7 days (2026-10-18 → 2026-10-24)  | 7      | 21          | 33.3% | 9.2          |

- 28 days is 26 / 94 again (25 / 92 on 2026-10-24). One click and two
  impressions is noise. 7 days fell 28 → 21 impressions; at this base that is
  noise too, not a regression.
- Brand only, again: `btc500` 5 clicks / 41 impressions @ 3.1 in 28 days. No
  non-brand query clears the 28-day reporting threshold.
- **Cluster baseline before today's snippet change** (90 days, 0 clicks each):
  `when is 500 days before the next bitcoin halving` 15 impr @ 9.07,
  `what is 500 days before the next bitcoin halving` 5 @ 11.0,
  `bitcoin 500 day cycle` 7 @ 15.29. Pillar URL totals: 7 clicks / 27 impr /
  25.9% @ 22.7 over 90 days.
- **Indexation unchanged: 6 of 25** (inspection 2026-10-27). The pillar is still
  "Crawled – currently not indexed", last crawl 2026-10-22. `/simulator`'s crawl
  date moved 2026-09-12 → 2026-10-25, which is the only movement since the last
  review.
- GA4 28 days: **46 sessions / 23 users / 109 views / 45.7% engagement**. 39
  Direct, 3 Referral, 2 AI Assistant, 1 Organic, 2 Unassigned. The 3 referral
  sessions are `github.com` — the first non-zero referral ever recorded, and
  most likely the owner or the repo, not distribution. Landing pages: `/` 34,
  `/bitcoin-500-day-cycle` 5 (6m 58s average session).
- Indexation is still the gate. Nothing here is a win.

---

## Results review — 2026-10-25 (deep, verdict: stagnant)

0 positive outcome signals (`rule.mayClaimImproving=false`), nothing regressed
→ `stagnant`. Signals: indexation stalled 6/25, non-brand clicks 0 on 719
attributed impressions (90d), 7d impressions under 100 (noise), 19 sessions / 0
referrals, 0 queries in positions 4–20. 28 commits since 10-19, 4 substantive
changes, 0 new indexed URLs, 0 non-brand clicks, 0 referring domains — the work
was competent but aimed at a URL Google had already declined. The 2026-10-26
review run was rejected as `verdict-invalid` (file dated 2026-10-25), so the
10-25 mandates still stand. All four are addressed in today's session.

Caveats: `results-history.csv` starts 2026-10-22 and `status-history.csv`
2026-10-25, so "stalled 3d" understates 90-day stalls. GSC names a query for
only 5 of 26 clicks in 28 days (17 of 49 in 90 days), so "0 non-brand clicks" is
a floor over ~80% of clicks, not a measured zero.

### Competitive benchmark (fetched 2026-10-25)

- **Bitbo, 500-Day Halving Window** — live chart every 4 hours, buy/sell
  markers, per-window return including the open window, methodology.
- **bitcoin-daily.com, "The Satoshi Clock"** — live cycle clock, predictions
  stated in advance, arXiv/SSRN paper and open replication code.
- **btc.aipeterlab.com** — live status dashboard: next buy date, countdown,
  decision path, signal history, +540-day variant.

What we have that they do not: the drawdown survival table, the entry-timing
test, and now a machine-readable dataset. Still missing: a live view, a
recommendation from anyone, and any link. The gap is distribution, not data.

---

## Completed work

### 2026-10-27 — Citation surface and date-first snippet (three mandates)

Why: the reviewer ordered a citable asset and a snippet that answers the query,
and both were overdue while the site kept shipping sections on a URL Google had
already declined. Nothing here adds a search-facing URL.

- **`/data/500-day-cycles.json`** (new server route, `src/routes/data.500-day-cycles[.]json.ts`,
  builder `src/lib/cycle-dataset.ts`): per-window entry / halving / exit closes,
  inside-window drawdowns, the ±120-day timing deltas, a summary block, the
  method in full, the archive range it was built from, and a ready-made citation
  string. Computed per request from the daily archive, `Cache-Control: s-maxage=3600`,
  `Access-Control-Allow-Origin: *`. 12 KB. An empty archive returns 503, never a
  file that looks like a completed backtest.
- **Citation block on the pillar** (`#method-heading`): data source and archive
  range, how windows/drawdowns/timing are computed, a dynamic one-sentence
  finding ("In all 4 completed BTC500 windows… median lowest close was 11.7%
  below entry"), "Cite this as" line, and the JSON link. Plus `Dataset` JSON-LD
  pointing at the endpoint (`buildCycleDatasetSchema`), so the page and the
  endpoint describe the same asset.
- **Date-first snippet** (`src/lib/pillar-snippet.ts`, 13 tests): title
  "November 28, 2026: 500 Days Before the Next Bitcoin Halving", description and
  first sentence built from the same function, date taken from the seeded live
  halving snapshot in the route loader — not a literal. On/after the buy date it
  switches to "Entry Was November 28, 2026" rather than promising a date that
  already arrived.
- `SimulatorResult` now carries `archive {firstDate, lastDate, rows}` so the page
  can state the archive range it actually used.
- Sitemap `lastmod` for the pillar → 2026-10-27.

Validation: `npm test` 157/157, `tsc --noEmit` clean, default and node-server
builds clean, no new eslint/prettier problems in touched files. Local SSR:
title/og:title/description/lead all carry the date and the phrase; citation
block, Dataset JSON-LD (7 ld+json blocks, all parse) and the JSON link render in
server HTML; `/data/500-day-cycles.json` returns 200 with `medianLowVsEntryPercent: -11.72`,
`worstLowVsEntryPercent: -83.65`, timing `-120 → -32.48` and 2011-07-17 →
2026-10-26 archive range.

**Experiment:** `pillar-date-first-snippet`, reading 2026-11-05.

### 2026-10-25 — One live buy date on every article page

7 article FAQ answers, 8 article bodies, 2 meta descriptions, 2 feed entries and
12 llms summaries called 30 November 2026 the "official" buy date; the live
model says 28 November 2026. New `ArticleDateNotice` mounted once in
`__root.tsx` for article paths only, rendered from the root-seeded halving
snapshot so it is in server HTML. Sitemap `lastmod` 2026-10-25 for 11 articles.
Deployed as `aab432e`, production verified. IndexNow 200 for 25 URLs.

### 2026-10-24 — Entry-timing test on the pillar page

`#timing-heading`: the same T+500 exit with the entry moved ±120 days
(`src/lib/cycle-timing.ts`, 11 tests). 120 days early was worse in 3 of 3
windows with median −32.5%; 120 days late was −14.4% median, with 2012 as the
outlier (+356.8%, the archive starts at its T-500). Deployed `46b092d`.
**Operational note:** the daily runner pushed while the session was still
working — add a follow-up commit instead of amending.

### History before 2026-10-24

- **2026-10-23** — Cycle score removed (owner decision: it fought the product's
  own thesis); drawdown study shipped (median lowest close −11.7%, worst −83.7%,
  84.5 days to the low); GA4 installed (`G-GM4WBKY74P`, production hosts only).
- **2026-10-22** — Autonomous runner (launchd 06:00) with lock, time-box, push
  and production polling; `/halving-dates` states the live T-500 date;
  `/bitcoin-halving-calendar.ics` serves buy/halving/sell events.
- **2026-10-21 and earlier** — 25-URL sitemap, llms.txt / llms-full.txt, dated
  news articles removed from the index, embed kit, simulator, timeline, DCA, ETF
  and insider dashboards.

---

## Next priorities

1. **Make the citation surface visible to someone.** The data endpoint and the
   citation block are done; they earn nothing until a writer, directory or
   community post points at them. The three pitches in
   `scripts/autonomous/outreach/` (Bitcoin Magazine, bitcoin-only.com,
   BitcoinTalk) are the owner's to send. Nothing else moves 6/25 indexed.
2. **Own 2026-11-28 — the buy window opens in 32 days.** The on-site work is
   done (live date, calendar file, timing table, drawdown record, citation
   block, JSON endpoint). Stop extending the pillar; if anything, make the
   homepage state the same date and point at the citation block.
3. **After indexation moves:** merge `/halving-dates` into the pillar (one
   intent on two crawled-not-indexed URLs) and drop `/embed-kit` (274 words) and
   `/about` (402) from the sitemap.

## Ranked backlog

Rescored 2026-10-25 by the review, against the signals that are actually
stalled. Scored 1–10 on impact × confidence ÷ effort. **Items that add a URL are
frozen until indexed ≥ 8/25.**

| #   | Bet                                          | Why it can move the needle                                                 | I   | E   |
| --- | -------------------------------------------- | -------------------------------------------------------------------------- | --- | --- |
| 1   | Send the 3 outreach pitches                  | Links are the gate; 0 referring domains, 19/25 unindexed                   | 10  | 1   |
| 2   | ~~Citation block + `/data/…json`~~           | Shipped 2026-10-27 (mandate)                                               | —   | —   |
| 3   | ~~Date-first title/meta on the pillar~~      | Shipped 2026-10-27 (mandate); reading 2026-11-05                           | —   | —   |
| 4   | Consent banner (defect)                      | GA4 runs without it — legal + data-quality risk, still unfixed             | 6   | 2   |
| 5   | Merge `/halving-dates` into the pillar       | One intent split across two crawled-not-indexed URLs; 0 impressions in 28d | 6   | 3   |
| 6   | Cycle-vs-cycle live tracker                  | Bitbo and bitcoin-daily already own the live view; only pays once indexed  | 4   | 6   |
| 7   | `/cycle/*` pages, cost-of-waiting calculator | New URLs for a site with 19/25 unindexed — blocked by the freeze           | 3   | 6   |

## Open issues

- **GSC query attribution is incomplete: "0 non-brand" is a floor** (5 of 26
  clicks in 28 days have a named query, 17 of 49 in 90 days).
- **The review job produced `verdict-invalid` on 2026-10-26** (file dated
  2026-10-25, mode `deep` on a daily run). Two days running it has not
  delivered a fresh verdict; the next review needs the full history to judge
  today's changes.
- **EU cookie consent is still missing while GA4 is installed.** Legal risk, and
  it pollutes engagement numbers (46 sessions in 4 days is not traffic).
- `/bear-market` still earns impressions while 301-redirecting to the pillar.
- Dated article bodies still quote 30 November 2026 as published. Intentional —
  snapshots, explained by the live-date strip. Do not mass-rewrite them.
- Archive: the runner appends validated daily rows in preflight. If preflight
  reports `archive=stale`, treat that as a defect, not a footnote.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health)
→ attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. `net.btc500.review` runs at 09:30 daily and may only
say `improving` when `rule.mayClaimImproving` is true; a non-improving verdict
must order an owner ask. History in `~/.local/state/btc500-growth/`; the map of
the system is `scripts/autonomous/ARCHITECTURE.md`.
