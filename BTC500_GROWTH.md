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
- **Diagnosis:** the pages are not thin (1,000–2,100 rendered words each with
  original tables) and there are no canonical, robots, or duplicate-title
  problems. A three-month-old domain with no external links is simply not worth
  crawling. The blocker is authority and distribution, not on-page code.
- **Limitation:** GA4 exists since 2026-10-23 but has no history before that.
  Referral and returning-visitor data before that date do not exist.

---

## Latest measurement — 2026-10-24

Same tooling, data state `all`, lag offset applied. GSC window ends 2026-10-21;
GA4 window ends 2026-10-23.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-09-24 → 2026-10-21) | 25     | 92          | 27.2% | 9.7          |
| 7 days (2026-10-15 → 2026-10-21)  | 9      | 31          | 29.0% | 14.6         |

- 28 days was 25 / 90 on 2026-10-23 and 25 / 92 today. Two impressions is noise.
  7 days was 10 / 37 on 10-23. Do not read either as a trend.
- **The 500-day query cluster no longer appears in the 28-day query table** —
  only brand variants (`btc500` 4/41, `bitcoin 500` 0/3, `bitcoin plus 500` 0/2,
  `btc 500` 0/1, `bit 500` 0/1). With 92 impressions total, individual queries
  can drop below GSC's reporting threshold; this is not evidence that the pages
  lost rankings. Note it for the 2026-11-19 reading.
- Indexation is byte-identical to 2026-10-23: **6 of 25 URLs indexed**, 19 need
  attention, crawl dates unchanged (`/bitcoin-500-day-cycle` last fetched
  2026-10-22). `/about`, `/embed-kit`, `/news`, `/insider-trading`,
  `/articles/why-btc500-exists`, `/articles/rupl` are still unknown to Google.
- GA4 standard reports are no longer empty: 28 days = **12 sessions / 9 users /
  22 views / 33.3% engagement**, 11 Direct + 1 Organic Search, zero referrals.
  The 7-day window returns the same 12 sessions because the tag was installed on
  2026-10-23, so every session is post-install. That is testing traffic, not an
  audience. Too early and too small to judge.
- Search demand check via Google autocomplete (public endpoint, 2026-10-24):
  `bitcoin 500 days before halving`, `bitcoin 500 days after halving`,
  `buy bitcoin 500 days before halving`, `sell bitcoin 500 days after halving`,
  `bitcoin 500 days strategy` are all suggested completions. The cluster is
  real; the site is simply not in the index for it.

---

## Completed work

### 2026-10-24 — Entry-timing test on the pillar page

Competitive check first (public pages only). Two higher-authority sites now
publish the simple version of this rule: `charts.bitbo.io/500-day-halving-window`
(published 2026-10-20) plots the T-500→T+500 rule, and a Dune dashboard by
Lucas Santana (Hashdex) plots indexed T-500→T+500 performance. A third
(`btc.aipeterlab.com`) runs a +540-day variant. **The plain 500-day chart is
taken.** The gap is the part nobody publishes: what the rule cost to hold and
how much the exact date matters. That is what this session added.

New `/bitcoin-500-day-cycle#timing-heading`: for every completed window, re-run
the same T+500 exit with the entry moved from 120 days earlier to 120 days
later (`src/lib/cycle-timing.ts`, pure, 11 new tests; `timing` added to the
simulator payload). Table of % change vs the exact T-500 entry per cycle, a
median row, three stat tiles, and prose generated from the computed summary so
no figure can go stale. Same-page link from "When to buy". FAQPage grew 8 → 9
method-based questions. `llms.txt` / `llms-full.txt` and the sitemap `lastmod`
updated.

Findings from the shipped archive (computed, not asserted):

| Entry vs T-500 | Cycles covered | Median change | Direction        |
| -------------- | -------------- | ------------- | ---------------- |
| 120 days early | 3              | -32.5%        | worse in 3 of 3  |
| 60 days early  | 3              | -24.5%        | worse in 3 of 3  |
| 30 days early  | 3              | -12.5%        | worse in 3 of 3  |
| 30 days late   | 4              | +3.9%         | higher in 2 of 4 |
| 60 days late   | 4              | +4.9%         | higher in 3 of 4 |
| 120 days late  | 4              | -14.4%        | lower in 3 of 4  |

The 2012 window is the outlier (a 120-day delay would have produced +356.8%),
because the archive starts on its T-500 and price fell from $14.07 to $2.30
right after. Honest conclusion recorded on the page: the date is not a
knife-edge, earlier was never better in this sample, and the later-entry result
depends on what price did next.

Also fixed two stale claims on `/about` found by reading the live page:
it still said the homepage shows a "cycle score" (removed 2026-10-23) and that
"the 2024 cycle is still open until its sell date" (it closed 2025-09-02).
`/about` now also links the timing test.

Validation: `npm test` 90/90, `tsc --noEmit` clean, default and
`NITRO_PRESET=node-server` builds clean, no new eslint/prettier problems in
touched files. Local SSR check: the section, median row, all 4 cycle rows and
9 FAQ questions render in HTML; `/about` carries both fixes.

**Experiment:** does a published robustness test move anything for the 500-day
cluster? Success = any non-brand click or new referring domain by 2026-11-20.
Inconclusive if impressions stay under 20. Next reading 2026-11-19, together
with the T-500/calendar experiment.

### 2026-10-23 — Cycle score removed, drawdown study, GA4 installed

- **Cycle score removed** (`910fb27`): score logic, `cycleScoreQuery`, homepage
  Command Center gauge, data-tape chips, sticky CTA and embeds all deleted;
  legacy `/embed?widget=score` 307s to the full countdown. Owner decision: the
  site treats the current period as a bull market, so a "bear-market position"
  gauge fought the product's own thesis.
- **Drawdown study** (`c54e489`): `src/lib/cycle-risk.ts` computes, per window,
  the lowest close after entry and the date it printed, % vs entry, days to the
  low, pre-halving closes below entry, and the worst peak-to-trough close. The
  pillar publishes the table; the method-based FAQ gained an entry. Median
  lowest close -11.7% vs entry, 85 days to the low; 2012 is the extreme case
  ($14.07 → $2.30, 491 of 501 pre-halving closes underwater).
- **GA4** (`b5cf0ed`, `08508a0`): tag `G-GM4WBKY74P` in `<head>` on production
  hosts only; `scripts/analytics/fetch-ga4.ts` mirrors the GSC tooling
  (totals with previous-period deltas, channels, landing pages, devices,
  referrals, `--realtime`). Verified in production with a headless `/g/collect`
  hit.

### Earlier history

- **2026-10-22** — Autonomous daily runner: `scripts/autonomous/run-growth-cycle.sh`
  - launchd job `net.btc500.growth` at 06:00, with lock, time-box, push and
    production polling. After the first run exited 130 mid-work, the runner now
    waits for the session to settle and accepts a late commit (synthetic test
    passes). Do not add a second cron.
- **2026-10-22** — `/halving-dates` states the live T-500 date directly;
  `/bitcoin-halving-calendar.ics` serves buy window, halving and sell window
  as all-day events with a 30-day reminder, generated from the live model.
- **2026-10-21 and earlier** — 25-URL sitemap, llms.txt / llms-full.txt, dated
  news articles removed from the index, embed kit, simulator, timeline, DCA,
  ETF and insider dashboards.

---

## Next priorities

1. **Own 2026-11-28 — the buy window opens in 35 days.** This is the one moment
   the site's core claim becomes news rather than reference. The unblocked
   work is already on the page (live date, calendar file, timing table); the
   missing step is distribution: one post from the owner's X account and one
   relevant community post pointing at `/bitcoin-500-day-cycle#timing-heading`.
   **Blocked:** posting from an external account needs owner authorization.
2. **Earn external links — still the actual blocker.** 19 of 25 URLs are not
   indexed and Google fetches then declines. The drawdown and timing tables are
   now the two most quotable things on the domain. Needs 5–10 real links from
   Bitcoin newsletters, communities or data roundups.
3. **Concentrate the crawlable surface.** `/embed-kit` (274 rendered words) and
   `/about` (402) are the weakest indexable URLs and both are still unknown to
   Google. Either deepen them with real content or drop them from the sitemap.
   Keep internal links to the 500-day cluster exact-anchored.

## Open issues

- Clicks from Poland (20 of 24 impressions in 28 days) look like owner or
  internal traffic; treat country splits as noise until volume is larger.
- `/bear-market` still earns impressions while 301-redirecting to
  `/bitcoin-500-day-cycle`; harmless, but Google has not consolidated the old URL.
- EU cookie consent is still missing while GA4 is installed.
- The shipped `public/btc-usd-max.csv` ends 2026-07-11. Completed windows are
  unaffected, but anything that treats the CSV's last row as "today" would be
  wrong by ~3.5 months. Live prices come from the separate price providers.
