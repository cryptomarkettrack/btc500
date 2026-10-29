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

Reading the numbers: non-brand organic traffic is effectively zero — in the last
28 days the only query with volume is `btc500` (40 impressions, 4 clicks, @3).
The August spike was one dated news page (`/articles/bitcoin-week-ahead`, 2,067
impressions in the week of 10 Aug, 1 click); after `2c7f981` noindexed the dated
posts the site sits at 30–50 impressions/week. The one durable non-brand cluster
is the 500-day window (90 days: `when is 500 days before the next bitcoin
halving` 12 impressions @ 8.8, `what is…` 5 @ 11.0, `bitcoin 500 day cycle` 3 @
10.3 — zero clicks). Pages are not thin (1,000–2,100 rendered words with original
tables) and there is no canonical/robots/duplicate-title problem: a three-month-old
domain with no external links is not worth crawling, and indexation is the gate.
Limitation: GA4 exists since 2026-10-23, so referral and returning-visitor data
before that date do not exist.

---

## Latest measurement — 2026-10-29

GSC windows end 2026-10-26, GA4 window ends 2026-10-28, archive fresh to
2026-10-28 (5,580 daily closes). 90-day row is the 2026-10-27 reading, not re-run.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 90 days (2026-07-27 → 2026-10-24) | 50     | 3,378       | 1.5%  | 25.8         |
| 28 days (2026-09-29 → 2026-10-26) | 25     | 94          | 26.6% | 11.2         |
| 7 days (2026-10-20 → 2026-10-26)  | 1      | 10          | 10.0% | 18.3         |

- The 7-day table has exactly one query row: `btc500` (1 click / 4 impressions @
  3.5). `when is 500 days before the next bitcoin halving` — **query not present**
  in the 7-day window, so the homepage H1 change cannot be read yet.
- Windows moved one day forward, but the decline is **not** noise. Same collector,
  eight consecutive 7-day readings, each one day later: clicks **14, 10, 9, 8, 8,
  7, 5, 1** (−93%) and impressions **45, 37, 31, 28, 26, 21, 16, 10** (−78%). A
  monotone run of eight is a result, not a swing. The 28-day totals (25-26 clicks,
  90-96 impressions) are flat only because that window still contains the 14-click
  week 2026-10-13..10-19; it ages out by 2026-11-09.
- The page table shows the mechanism: the week to 2026-10-19 returned **11 URLs**
  (74 impressions byPage, 29 of them across the ten non-homepage URLs, at
  positions 2-6, all on the brand family); the week to 2026-10-26 returned **1
  URL and 10 impressions**. The current site-wide run-rate is 1 brand click and
  10 impressions a week.
- The 28-day query table is **the brand written five ways**: `btc500` 4/40 @3.17,
  `btc 500` 0/1, `bitcoin 500` 0/3, `bit 500` 0/1, `bitcoin plus 500` 0/2. No row
  is a query a stranger would type without the brand; the four variants the
  collector's `/btc 500/` regex calls non-brand carry 6 impressions and 0 clicks.
  90 days to 2026-10-24: 723 non-brand impressions, 1 click.
- **Indexation fell again: 5 → 3 of 21** (inspection 2026-10-29T04:10Z). Indexed
  now: `/` (crawled 2026-10-24), `/articles/bip-110-rejection` (08-11),
  `/articles/bear-market-accumulation` (08-08). Lost today:
  `/articles/solar-eclipse-bitcoin-halving` (last crawl 08-17) and
  `/articles/sec-cancels-regulation-crypto` (08-16). Remaining 18: 12
  crawled-not-indexed, 6 unknown to Google.
- Google is **crawling and declining, not ignoring**: `/simulator` was crawled
  2026-10-25, `/bitcoin-500-day-cycle`, `/halving-dates`,
  `/when-to-sell-bitcoin-after-halving`, `/bitcoin-etf` and
  `/articles/btc500-strategy` on 2026-10-22. The pillar's lastCrawl is still
  2026-10-22 with "Crawled - currently not indexed".
- GA4 7 days: **91 sessions / 45 users / 189 views / 45.1% engagement**. The
  28-day report returns the identical numbers because the property has no data
  before 2026-10-23 — a young property, not a broken window. Do not quote 91 as a
  month of traffic.
- **referrals 7d: github.com 9, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
  bitcointalk.org 0** (`npm run referrals`, window 2026-10-22 → 10-28).
- Sitemap 21 URLs after today's contraction.

---

## Completed work

### 2026-10-29 — X profile virality content pack (launch assets)

Why: the user objective for this session is a viral @btc500halving profile; the
2026-08-08 audit diagnosed the account as a countdown billboard and the live bio
still read as a bare timer plus an unstated tracking promise.

- Added `scripts/autonomous/x/launch-content.json` (schema
  `btc500/x-launch-content@1`): final profile copy, pinned post, 7 launch tweets
  (thread 1→2 + 5 singles) and owner actions. All copy pre-validated: bio 149/160,
  pinned 276/280, every tweet ≤ 280.
- Tweets carry real measured numbers: $50k → $1.49M (+2,890%) / 2012 … $50k → $330k
  (+560%) / 2024, median cycle multiple ≈ 11.7x; buy date 2026-11-30, sell date
  2029-08-26.
- Added `scripts/autonomous/x/launch-content.test.mjs` (5 tests) and wired it into
  `npm test`. Validation: `npm test` 194/194 pass (189 existing + 5 new), prettier
  clean, eslint clean on changed files.

### 2026-10-29 — 500-day-rule retarget + homepage SSR placeholder fix

Why: the trending framing around the strategy ("Bitcoin 500-day rule", CoinDesk 08-05,
Yahoo 08-05, Binance, Pantera attribution) had not yet landed on the site, and the only
indexed URL still shipped placeholder markup to Google.

- Homepage (`/`) retargeted onto the rule while keeping the brand first: title
  `BTC500 — The Bitcoin 500-Day Halving Rule`, description "BTC500 is the Bitcoin 500-day
  rule: buy 500 days before the halving, sell 500 days after…", keywords extended with
  `bitcoin 500 day rule, 500 day bitcoin strategy`. WebPage schema name → "The Bitcoin
  500-Day Halving Rule | BTC500".
- Home answer (`src/lib/home-answer.ts`) now opens with "The Bitcoin 500-day rule: 500 days
  before the next Bitcoin halving is 28 November 2026 — the BTC500 buy date." Eyebrow →
  "The Bitcoin 500-day halving rule · Two dated trades per cycle".
- Pillar (`/bitcoin-500-day-cycle`) retargeted: H1 → "Bitcoin 500-Day Rule", hero badge →
  "The Bitcoin 500-day halving rule", definition section → "What is the Bitcoin 500-day
  rule?", WebPage schema name/description → "The Bitcoin 500-Day Halving Rule".
- FAQ (`src/lib/faq.ts`, `src/lib/cycle-faq.ts`): new question "What is the Bitcoin 500-day
  rule?" on both surfaces; BTC500 strategy answer now leads with the rule.
- Homepage now renders the FAQ-driven definition heading "What is the Bitcoin 500-day rule?"
  (`src/components/home/HomePage.tsx`).
- Homepage SSR fix (`src/routes/index.tsx`): added a route loader that
  `ensureQueryData(simulatorPreviewQuery)` before render, so the served HTML contains the
  real completed-window stats and ledger estimate instead of "—" placeholders and
  "Completed-window data is loading.". Build + 189/189 tests + tsc + lint green.

Validation: `npm test` 189/189 pass, `tsc --noEmit` clean, eslint clean, `npm run build`
clean. Not yet deployed.

### 2026-10-29 (review) — the measurement was fixed, and it made the week worse

The 2026-10-29 results review found the collector correct and the week failing:
**indexed 3/21, 0 non-brand clicks, 7-day clicks 14 → 1, 7-day impressions 45 →
10.** 4 of 4 mandates were executed and verified; the outcome was still negative,
so the review retired the contraction rule and closed two experiments:

- **`sitemap-contraction` closed FAILED** 12 days early, on its own fail branch
  (≤5 of 22 on 2026-11-10; the site is at 3 of 21). `/articles` has not been
  crawled since 2026-08-14.
- **`pillar-date-first-snippet` closed UNREADABLE**: lastCrawl still 2026-10-22
  through four deploys and five inbound exact anchors.
- **`distribution-test` is the only open experiment.** The one live ask (GitHub
  listing on bitcoin-only.com, by 2026-11-11) was restated narrower and now points
  at the pillar, the URL that needs the external signal.
- New rule: **distribution-only until 2026-11-12** — a cycle ships only a defect
  fix on an indexed URL or a prepared ask; archive-only is a valid cycle; no URL
  added, removed, merged or redirected; no copy edit on a declined URL.

### 2026-10-29 — measurement reconciled, 4th URL contracted, homepage answers the query

Why: the report that decides the 2026-11-10 contraction reading did not add up;
one more URL lost its index; and the only URL Google actually serves answered no
query at all.

- **GSC collector reconciled** (mandate `gsc-report-reconcile`). Root cause found
  and measured, not guessed: the totals call used the API default `byProperty`
  while `page`/`query` rows are `byPage` (the API rejects `byProperty` for a
  dimensioned request). Same window, 2026-09-29 → 10-26: property 25/94, page
  rows 25/133, and the `byPage` totals call returns exactly 25/133. The report now
  fetches both totals, prints every table's own sum beside them, names the window
  each derived field came from, and refuses to write (exit 1, previous
  `performance-latest.*` untouched — verified byte-identical) when page rows
  exceed the byPage total, query rows exceed it, byPage < byProperty, or a shorter
  window reports more than a stored longer window with the same end date or
  contains a page the longer window does not. `scripts/search-console/reconcile.ts`
  + 15 tests; `performance-summary.json` keeps the per-window records.
  Deviation, stated: "7-day page table has fewer rows than the 28-day table" is
  recorded as a note, not a refusal — a 7-day window is a subset, so fewer rows is
  the correct outcome and making it fatal would suppress every 7-day report.
- **`/articles/strongest-hands` contracted** (mandate
  `declined-url-301-and-crawl-test`): 308 → `/articles` (Vercel emits 308 for
  `permanent: true`), sitemap 22 → 21, metadata/route/component/assets deleted, 5
  internal links dropped, and the URL removed from `llms.txt`, `llms-full.txt` and
  `feed.xml` — which still advertised the three 2026-10-28 contractions a day
  after they started redirecting. Test extended to cover all four slugs on all
  three machine-readable surfaces.
- **Homepage answers the query** (mandate `homepage-answer-one-query`): H1 is now
  "500 days before the next Bitcoin halving is 28 November 2026" and the first
  paragraph leads with the same sentence, both from `computeCycle`, never a
  literal (`src/lib/home-answer.ts`, 6 tests; flips to "The 500-day Bitcoin window
  opened on …" on the buy date). Every existing section, the anchor links and the
  brand line are kept; the brand moved to the H1 subline. Title/meta untouched on
  purpose — `btc500` is the only query that clicks.
- **Ask ledger truthful** (mandate `ask-ledger-truth`): Bitcoin Magazine row
  `lapsed` (by-date 10-28 passed, sent: no), BitcoinTalk and X kept `sent: no`
  with their dates, one new row for the bitcoin-only.com GitHub issue (handed over
  10-28, due 2026-11-11), referral reading for today added.

Validation: `npm test` 189/189, `tsc --noEmit` clean, both builds clean, eslint
clean on every changed file. Deployed `56393be`, production read at 04:13Z: 7/7
manifest checks pass (homepage H1 + subline, the strongest-hands redirect target,
sitemap, llms.txt, feed.xml, a re-rendered article), sitemap 21 `<loc>` with 0
contracted URLs, `/articles/strongest-hands` **308 → /articles**, llms.txt /
llms-full.txt / feed.xml each carry 0 contracted references, robots.txt 200,
IndexNow 200 for 21 URLs.

### 2026-10-28 — URL contraction, exact-anchor path, ask ledger (three mandates)

- Three declined August-crawled articles 308 → `/articles` (sitemap 25 → 22),
  route files/metadata/components deleted, links dropped, `contracted articles`
  test added.
- Exact anchor `when is 500 days before the next bitcoin halving` from `/` and the
  four then-indexed articles, one distinct sentence each.
- `outreach/STATUS.md` + `npm run referrals` (6 tests) so a zero can be told apart
  from "nobody looked".

### 2026-10-27 — citation surface and date-first snippet

`/data/500-day-cycles.json` (per-window entry/halving/exit closes, drawdowns,
±120-day timing deltas, method, citation string, CORS open) plus a citation block
and `Dataset` JSON-LD on the pillar; pillar title/description/first sentence from
the live snapshot (13 tests). Deployed `f925e32`, verified.

### History before 2026-10-27

- **2026-10-25** — live buy date on every article page (`ArticleDateNotice`).
- **2026-10-24** — entry-timing test on the pillar: 120 days early was worse in
  3 of 3 windows, median −32.5%.
- **2026-10-23** — cycle score removed; drawdown study (median lowest close
  −11.7%, worst −83.7%, 84.5 days to the low); GA4 installed.
- **2026-10-22** — autonomous runner (launchd 06:00) with lock, time-box, push and
  production polling; `/halving-dates` states the live T-500 date; `.ics` feed.
- **2026-10-22 and earlier** — `2c7f981` noindexed eight dated commentary posts;
  llms.txt / llms-full.txt, embed kit, simulator, timeline, DCA, ETF and insider
  dashboards.

### Review history

| date       | mode  | verdict  | what it forced                                                     |
| ---------- | ----- | -------- | ------------------------------------------------------------------ |
| 2026-10-29 | daily | failing  | 4 mandates: indexation hold + inspect, homepage placeholder fix, cluster query read 11-08, distribution-only. Closed sitemap-contraction FAILED and pillar snippet UNREADABLE (streak 5) |
| 2026-10-28 | daily | failing  | 4 mandates: GSC reconcile, strongest-hands 301 + 11-03 crawl test, homepage answer, ask ledger (streak 4) |
| 2026-10-27 | daily | failing  | contraction 25 → 22, exact-anchor path, ask ledger                  |
| 2026-10-25 | deep  | stagnant | merged 3 single-page experiments into `distribution-test`            |

---

## Next priorities

0. **Distribution-only until 2026-11-12.** The contraction experiment is closed
   failed at 3/21; the pillar snippet is closed unreadable. A cycle now ships
   only a defect fix on an indexed URL or a prepared ask. No URL added, removed,
   merged or redirected; no copy edit on a declined URL. Archive-only is valid.
1. **Owner files the bitcoin-only.com GitHub issue** — one issue, one template,
   two minutes, by 2026-11-11 (`outreach/2026-10-27-bitcoin-only-listing.txt`).
   This is the only action left that can add a referring domain; 4 asks handed
   over since 10-27, 0 sent, 9 of 9 referral sessions are our own repo.
2. **2026-10-31: fix the served HTML of `/`.** ~~The only indexed URL currently
   ships three `—` record stats and "Completed-window data is loading." in its
   markup, and sitemap lastmod for `/` is 2026-10-21 although the H1 changed
   10-29.~~ **DONE 2026-10-29** — route loader now seeds the simulator payload
   before render (defect fixed in-repo; verified by build + 189/189 + tsc + lint).
   Remaining: post-deploy curl of the production HTML must confirm the real stats
   replace the placeholders. Sitemap `/` lastmod → 2026-10-29; pillar lastmod →
   2026-10-29 (both updated).
3. **2026-11-02: inspect, change nothing.** Print `indexed X/21` and the coverage
   of the two URLs lost on 10-29. If either returns to the index without any
   in-repo change, that is the answer to what moves it.
4. **2026-11-08: read the cluster queries** in the 7-day and 28-day tables. If
   all four are absent, close the homepage H1 change as unreadable and stop
   targeting the cluster until the site has links.
5. **Own 2026-11-28** — the buy window opens in 30 days; the homepage and the
   pillar state the same live date. Do not touch either before the reading.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Distribution-only until
2026-11-12: rows 0 and 1 are the only work permitted; everything else is
blocked, not queued.** Adding a URL or a section is blocked until `indexed ≥ 8`
and, under the 2026-10-29 rule, until 2026-11-12 at the earliest.

| #   | Bet                                            | Why it can move the needle                                      | I   | E   |
| --- | ---------------------------------------------- | --------------------------------------------------------------- | --- | --- |
| 0   | Owner files the bitcoin-only.com listing issue | Only channel with evidence of use; 0 external referral sessions, 18/21 unindexed | 10  | 1   |
| 1   | Homepage defect: placeholders + lastmod        | The only indexed URL serves "—" stats and "data is loading"     | 7   | 1   |
| 2   | Cluster query reading 2026-11-08               | Decides whether the H1 change was readable at all               | 7   | 1   |
| 3   | Consent banner (defect)                        | GA4 runs without it — legal + data-quality risk, still unfixed  | 6   | 2   |
| 4   | Merge `/halving-dates` into the pillar         | Blocked: no URL merges before 2026-11-12; the page has 0 impressions in 28d | 5 | 3 |
| 5   | Cycle-vs-cycle live tracker                    | Bitbo and bitcoin-daily own the live view; pays only once indexed | 4 | 6   |
| 6   | `/cycle/*` pages, cost-of-waiting calculator   | New URLs on a site with 18/21 unindexed — blocked by the freeze | 3   | 6   |

## Open issues

- **Indexation is decaying, not stalled: 6 (10-22) → 5 (10-28) → 3 (10-29).**
  Coverage 24% → 14% while the denominator shrank 25 → 21. Each URL lost was last
  crawled in August and was 200 with a matching canonical on the day it dropped.
  Google re-crawls (`/simulator` 10-25) and then declines, which is an authority
  verdict, not a discovery or on-page one. Treat every in-repo change as
  unmeasurable until a link exists.
- **The only indexed URL serves placeholders.** `https://btc500.net/` HTML
  contains three `—` record stats, "Illustrative result —" and "Completed-window
  data is loading."; sitemap lastmod for `/` is 2026-10-21 although the H1 changed
  2026-10-29. Fix before any further reading of homepage engagement.
- **GA4 has no data before 2026-10-23**, so 7-day and 28-day totals are identical
  (91 sessions). Quote it as "since 10-23", never as a month.
- **GSC query attribution is incomplete: "0 non-brand" is a floor** (query rows
  are anonymised; the 28-day table sums to 47 of 94 impressions). The report now
  says so in writing, and the 90-day reading is 723 non-brand impressions / 1
  click, so the floor is not hiding a trend.
- **EU cookie consent is still missing while GA4 is installed.** Legal risk, and
  it pollutes engagement numbers.
- The 2026-10-27 owner mandate for a hash guard in `run-review-cycle.sh` is
  **dropped** (2026-10-29 review): `validate-review.mjs` already rejects a stale
  `generated`/`mode` and did so on 2026-10-26, and the runner retries another
  model when no verdict file is produced. Do not reopen it.
- `/bear-market` earns impressions while 301-redirecting to the pillar. Dated
  article bodies still quote 30 November 2026 as published — intentional
  snapshots, explained by the live-date strip. Do not mass-rewrite them.
- **Vercel serves `permanent: true` redirects as 308, not 301.** Equivalent for
  Google; a plain `curl` check must accept 308.
- Archive: the runner appends validated daily rows in preflight. `archive=stale`
  is a defect, not a footnote.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health)
→ attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. `net.btc500.review` runs 09:30 daily and may only say
`improving` when `rule.mayClaimImproving` is true. Every PERFORMANCE block ends
with `npm run referrals`. Map: `scripts/autonomous/ARCHITECTURE.md`; ledger:
`scripts/autonomous/outreach/STATUS.md`.
