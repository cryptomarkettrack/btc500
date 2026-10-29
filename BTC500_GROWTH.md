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
- Windows moved one day forward, so 28d 25/94 and 7d 1/10 are **not** comparable
  to yesterday's 26/96 and 5/16. At this base every movement is noise.
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
| 2026-10-28 | daily | failing  | 4 mandates: GSC reconcile, strongest-hands 301 + 11-03 crawl test, homepage answer, ask ledger (streak 4) |
| 2026-10-27 | daily | failing  | contraction 25 → 22, exact-anchor path, ask ledger                  |
| 2026-10-25 | deep  | stagnant | merged 3 single-page experiments into `distribution-test`            |

---

## Next priorities

0. **Read the contraction on 2026-11-10.** Base at shipping is **3 indexed of
   21** (not 5/22 — two more August-crawled articles lost their index today).
   If indexed is still ≤ 5 that day, `sitemap-contraction` closes failed and every
   in-repo indexation action stops permanently: from then on a cycle ships one
   distribution asset or a defect fix and nothing else.
1. **Re-read the homepage query on 2026-11-04.** The 7-day window to 2026-10-26
   predates the H1 change, so it is "too early". Success = the query appears with
   impressions on `/`; failure = the homepage will not rank for it either and the
   cluster is dead until the site has links.
2. **Pillar crawl test on 2026-11-03** (mandate, part 2): re-inspect; if
   lastCrawl is still 2026-10-22, close `pillar-date-first-snippet` unreadable and
   make no further copy change to `/bitcoin-500-day-cycle`.
3. **One ask, not four.** `outreach/2026-10-27-bitcoin-only-listing.txt`, channel
   GitHub, due 2026-11-11. The three 2026-10-27 asks are retired: 0 of 3 sent,
   and github.com is the only referrer that has ever produced a session.
4. **Own 2026-11-28** — the buy window opens in 30 days; the homepage and the
   pillar now state the same live date and the same phrase.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Anything that adds a URL or a
section stays frozen until indexed ≥ 8** (URL contraction, set by the 10-27
review). While the gate is shut only rows 0–2 and 4 can be worked.

| #   | Bet                                            | Why it can move the needle                                      | I   | E   |
| --- | ---------------------------------------------- | --------------------------------------------------------------- | --- | --- |
| 0   | Contraction reading 2026-11-10                 | The only in-repo lever left; stop-work condition is written     | 8   | 1   |
| 1   | Owner files the bitcoin-only.com listing issue | Only channel with evidence of use; 0 referring domains, 18/21 unindexed | 10  | 1   |
| 2   | Homepage query reading 2026-11-04              | Only indexed URL with impressions; the answer is now on it      | 7   | 1   |
| 3   | Consent banner (defect)                        | GA4 runs without it — legal + data-quality risk, still unfixed  | 6   | 2   |
| 4   | Merge `/halving-dates` into the pillar         | One intent over two declined URLs; 0 impressions in 28d         | 5   | 3   |
| 5   | Cycle-vs-cycle live tracker                    | Bitbo and bitcoin-daily own the live view; pays only once indexed | 4 | 6   |
| 6   | `/cycle/*` pages, cost-of-waiting calculator   | New URLs on a site with 18/21 unindexed — blocked by the freeze | 3   | 6   |

## Open issues

- **Indexation is decaying, not stalled: 6 (10-22) → 5 (10-28) → 3 (10-29).** Each
  URL lost was last crawled in August. Google re-crawls (`/simulator` 10-25) and
  then declines, which is an authority verdict, not a discovery or on-page one.
  Treat every cycle that adds a URL as adding to a shrinking set.
- **GA4 has no data before 2026-10-23**, so 7-day and 28-day totals are identical
  (91 sessions). Quote it as "since 10-23", never as a month.
- **The review-runner guard is missing** — the 2026-10-26 review produced no
  verdict and nothing noticed. Owner-owned (mandate), due 2026-11-03, unbuilt.
- **GSC query attribution is incomplete: "0 non-brand" is a floor** (5 of 7 clicks
  in the 7-day window have no named query). Query rows are anonymised; the report
  now says so in writing.
- **EU cookie consent is still missing while GA4 is installed.** Legal risk, and
  it pollutes engagement numbers.
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
