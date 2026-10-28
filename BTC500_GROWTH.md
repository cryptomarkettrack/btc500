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

## Latest measurement — 2026-10-28

GSC window ends 2026-10-25, GA4 window ends 2026-10-27, archive fresh to
2026-10-27 (5,579 daily closes). 90-day row is the 2026-10-27 reading, not re-run.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 90 days (2026-07-27 → 2026-10-24) | 50     | 3,378       | 1.5%  | 25.8         |
| 28 days (2026-09-28 → 2026-10-25) | 26     | 96          | 27.1% | 11.0         |
| 7 days (2026-10-19 → 2026-10-25)  | 5      | 16          | 31.3% | 11.8         |

- 28 days 26 / 96 (was 26 / 94), 7 days 5 / 16 (was 7 / 21). Two impressions and
  two clicks at this base is noise. Nothing here is a trend in either direction.
- Brand only again: `btc500` 5 clicks / 41 impressions @ 3.1 in 28 days, plus four
  low-volume variants (`bitcoin 500`, `btc 500`, `bit 500`, `bitcoin plus 500`)
  at positions 20–95. No non-brand query has a click.
- **Indexation fell 6 → 5.** `/articles/strongest-hands` (last crawl 2026-08-17)
  is now "Crawled - currently not indexed" — the first time an indexed URL has
  been lost. The other four clean URLs are `/`, `/articles/solar-eclipse-…`,
  `/articles/sec-cancels-regulation-crypto`, `/articles/bip-110-rejection`,
  `/articles/bear-market-accumulation` (5 total including the homepage).
  20 of 25 need attention: 13 crawled-not-indexed, 5 unknown, 1 discovered, 1
  in `INDEXING_STATE_UNSPECIFIED`. After contraction the inspection covers
  **22 URLs: 5 indexed, 11 crawled-not-indexed, 6 unknown to Google**
  (2026-10-28, `inspection-latest.json`). All 6 unknown URLs are in
  `sitemap.xml` and 5 of them are linked from the homepage — discovery is not
  the missing link, authority is.
- Pillar still "Crawled - currently not indexed", lastCrawl **2026-10-22** — six
  days and four deploys (drawdown, timing, citation, snippet) after it was first
  declined.
- GA4 7 days: **76 sessions / 41 users / 161 views / 43.4% engagement**; 63
  Direct, 7 Referral, 3 Organic, 2 AI Assistant, 1 Unassigned. Landing: `/` 51,
  pillar 14. Direct at this size is the owner, the repo and bots, not acquisition.
- **referrals 7d: github.com 7, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
  bitcointalk.org 0** (`npm run referrals`). The ask channels are still at zero.

---

## Results review — 2026-10-28 (daily, verdict: FAILING, streak 4)

Fourth consecutive non-improving review. `mayClaimImproving=false`: one positive
outcome signal (7 referrals, all `github.com`) and indexation regressed. The
cycle executed 3 of 4 mandates by 09:00 — 3 × 308 to `/articles` (sitemap
25 → 22, verified live: 22 `<loc>`, both tested slugs redirect), the exact-anchor
link from `/` and the four indexed articles, and `outreach/STATUS.md` — and the
result column still went backwards: **indexed 6 → 5** (`/articles/strongest-hands`,
last crawl 2026-08-17, lost its index), 0 non-brand clicks, 0 referrals from any
asked channel.

Findings that are new and go into the working docs:

- **A declined page cannot be fixed on-page.** Four changes to the pillar in six
  days (10-23, 10-24, 10-27, and five inbound exact-anchor links on 10-28) and
  lastCrawl is still 2026-10-22. The prompt now records copy on a declined URL as
  `archive-only`, not a ship.
- **The GSC tables do not reconcile, and the 7-day report changes shape between
  runs.** 2026-10-27 (window 10-18 → 10-24): 10 page rows summing to 40
  impressions against a 21 total. 2026-10-28 (window 10-19 → 10-25): 1 page row
  / 16 impressions, while the 28-day report from the same run still returns 11
  page rows summing to 135 against a 96 total. `pagesWithImpressions` went
  10 → 1 in a day while total impressions fell only 21 → 16 — a window artifact,
  not a signal.
- **Owner attention is the bottleneck and three asks split it.** All three asks
  handed over 2026-10-27 are `sent: no` in STATUS.md; referrals 7d are
  github.com 7 and 0 for x.com, twitter.com, bitcoinmagazine.com, bitcointalk.org.
  This review issues **one** ask and retires the other three: the bitcoin-only.com
  listing via a GitHub issue — the channel where the owner demonstrably acts and
  the only referrer that has ever produced a session.
- Targets: indexed 5/22 → 8/22 by 2026-11-10 (the contraction's own reading
  date); non-brand 1 in 7d by 2026-11-15; referrals 7 → 9 by 2026-11-11;
  ask-effect 1 from bitcoin-only.com by 2026-11-11; sitemap 22 → 21 by 10-30.

## Results review — 2026-10-27 (daily, verdict: FAILING, streak 3)

Third consecutive non-improving review; the 2026-10-26 run wrote no verdict at
all (`verdict-invalid`, file dated 2026-10-25). Basis: indexation 6/25 on six
consecutive readings, 0 non-brand clicks in 7 days, 3 referral sessions all
`github.com`, two cycles of which one shipped nothing. Mandates after 2026-10-28:
`consolidate-declined-urls` **done** (sitemap 25 → 22), `pillar-crawl-recovery`
**done** (exact anchor from `/` and the four indexed articles — the sixth was
`/articles/strongest-hands`, which lost its index the same day, so it is not a
place to link _from_), `ask-ledger` **done** (`outreach/STATUS.md` +
`npm run referrals`), `review-runner-fails-loud` **not executed** — owner-owned,
due 2026-11-03, still unbuilt.

## Results review — 2026-10-25 (deep, verdict: stagnant)

0 positive outcome signals: 28 commits since 10-19, 4 substantive changes, 0 new
indexed URLs, 0 non-brand clicks, 0 referring domains. GSC names a query for only
5 of 26 clicks in 28 days, so "0 non-brand" is a floor.

**Competitive benchmark (last full sweep 2026-10-25).** Bitbo runs a live 500-day
halving-window chart; bitcoin-daily.com a live cycle clock, pre-stated
predictions and replication code; btc.aipeterlab.com a live status dashboard. We
have the drawdown survival table, the entry-timing test and a JSON dataset.
Missing: a live view, any recommendation and any link — the gap is distribution,
not data.

---

## Completed work

### 2026-10-28 — URL contraction, exact-anchor path, ask ledger (three mandates)

Why: 20 of 25 URLs were declined or never fetched and five of them had not been
re-crawled in 66–79 days while earning 0 clicks; the pillar's crawl date had not
moved through four deploys; and no channel could be told apart from zero because
nobody recorded whether an ask was sent.

- **Contracted three declined articles** (mandate 1). `/articles/bitcoin-volatility`
  (crawled 08-09), `/articles/bitcoin-infrastructure-exploits` (08-16) and
  `/articles/ondo-finance-tokenization` (08-22) now 301 to `/articles` in
  `vercel.json`; their route files, metadata entries and components are deleted,
  their sitemap entries removed (25 → 22 URLs), and the two remaining internal
  links to them dropped. `/articles` and `/liquidation` are the two pages the
  mandate lets survive — `/liquidation` because it renders a live Binance-futures
  dashboard, not prose. A `contracted articles` test asserts all four things
  (metadata, sitemap, redirect, route file) so the kill cannot silently regress.
- **Exact-anchor path to the pillar** (mandate 2): one in-body link each with the
  anchor `when is 500 days before the next bitcoin halving`, from `/`, and from
  `/articles/solar-eclipse-bitcoin-halving`, `/articles/sec-cancels-regulation-crypto`,
  `/articles/bip-110-rejection`, `/articles/bear-market-accumulation` — the four
  articles that are actually indexed as of today. Each sentence differs and
  carries a reason to click (the entry and exit close per window), so this is not
  a footer block repeated five times.
- **Ask ledger + referral line** (mandate 3): `outreach/STATUS.md` holds one row
  per ask and pitch (channel, recipient, handover date, due, sent, proof metric)
  plus a referral reading per cycle. `npm run referrals` (6 tests) prints
  `referrals 7d: github.com N, x.com N, reddit.com N, bitcoinmagazine.com N,
bitcointalk.org N` from the newest GA4 report, counts `twitter.com`/`t.co` as
  x.com, appends unasked referrers instead of dropping them, and says "not
  measured" (exit 1) when there is no report, so a zero cannot be invented. A
  `.gitignore` exception makes `outreach/*.md` trackable.

Validation: `npm test` 167/167, `tsc --noEmit` clean, both builds clean. Local SSR
serves the anchor on `/`, `/articles` and the four indexed articles once; the
three contracted URLs 404 locally (the 308 is Vercel's), so production is the
proof. Deployed `afc4772` (Vercel: success), production read at 06:17Z: sitemap
22 URLs, anchors live, three redirects 308 → `/articles` 200, manifest 8/8,
IndexNow 200 for 22 URLs. Vercel emits **308** for `permanent: true`, not 301 —
equivalent for Google, but do not grep for `301` when checking this.

Not done, deliberately: `/articles/strongest-hands` fell out of the index today
and is the next contraction candidate, but a 24-hour decline is not yet evidence.

### 2026-10-27 — Citation surface and date-first snippet

`/data/500-day-cycles.json` publishes per-window entry / halving / exit closes,
drawdowns, ±120-day timing deltas, the method and a citation string (CORS open,
~12 KB); a citation block plus `Dataset` JSON-LD sits on the pillar; the title,
description and first sentence come from the live halving snapshot (13 tests).
Deployed `f925e32`, verified.

### History before 2026-10-27

- **2026-10-25** — one live buy date on every article page: `ArticleDateNotice`
  in `__root.tsx` for article paths, replacing 30 November 2026 with the live
  28 November 2026 wherever it was stated as the calendar truth.
- **2026-10-24** — entry-timing test on the pillar (`#timing-heading`, ±120 days
  at a fixed T+500 exit): 120 days early was worse in 3 of 3 windows, median
  −32.5%. Deployed `46b092d`.
- **2026-10-23** — cycle score removed; drawdown study shipped (median lowest
  close −11.7%, worst −83.7%, 84.5 days to the low); GA4 installed.
- **2026-10-22** — autonomous runner (launchd 06:00) with lock, time-box, push
  and production polling; `/halving-dates` states the live T-500 date; the
  `.ics` calendar feed serves buy / halving / sell events.
- **2026-10-22 and earlier** — `2c7f981` noindexed the eight dated commentary
  posts and removed them from the sitemap; 25-URL sitemap, llms.txt /
  llms-full.txt, embed kit, simulator, timeline, DCA, ETF and insider dashboards.

---

## Next priorities

0. **Fix the GSC collector (mandate, due 2026-10-30).** The 7-day page table
   returned 10 rows summing to 40 impressions against a 21 total on 10-27, then
   1 row / 16 impressions on 10-28 while the 28-day report kept 11 rows. Reconcile
   rows to each report's total and refuse to write a report that does not add up.
1. **301 `/articles/strongest-hands` → `/articles`, sitemap 22 → 21 (mandate,
   due 2026-10-30).** First URL to lose its index (last crawl 2026-08-17);
   rewriting a declined page is what has already failed four times.
2. **Answer one query from an indexed page (mandate, due 2026-10-31).** The
   homepage is the only URL with impressions (16 in 7 days) and they are all
   brand. Put the top cluster query in its H1/first 40 words; measure in 7 days.
3. **Read the contraction on 2026-11-10.** Success is indexed ≥ 8 of 22 (base at
   shipping: 5/22). If it is still 5, `sitemap-contraction` closes failed and all
   in-repo indexation work stops permanently; every cycle then ships one
   distribution asset or a defect fix and nothing else.
4. **One ask, not three.** The owner has one live action: the bitcoin-only.com
   listing issue (`outreach/2026-10-27-bitcoin-only-listing.txt`, channel:
   GitHub). It is the only channel with any evidence of use — 7 of 7 referral
   sessions are github.com — and it produces a real referring domain instead of
   another post. The X, email and BitcoinTalk asks are retired (see the review).
5. **Own 2026-11-28** — the buy window opens in 31 days. On-site work is done;
   the homepage and the pillar say the same date and the same phrase.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Anything that adds a URL or a
section stays frozen until indexed ≥ 8** (URL contraction, set by the 10-27
review). While the gate is shut only rows 0, 1 and 3–4 can be worked.

| #   | Bet                                               | Why it can move the needle                                         | I   | E   |
| --- | ------------------------------------------------- | ------------------------------------------------------------------ | --- | --- |
| 0   | Contraction reading 2026-11-10                    | The only in-repo lever left; stop-work condition is written        | 8   | 1   |
| 1   | Owner files the bitcoin-only.com listing issue     | Only channel with evidence of use; 0 referring domains, 17/22 unindexed | 10  | 1   |
| 2   | ~~Merge/301 the 5 August-crawled URLs~~           | Shipped 2026-10-28: 3 × 301, sitemap 25 → 22                       | —   | —   |
| 3   | 301 `/articles/strongest-hands`                   | First indexed URL lost; 66+ days without a re-crawl of siblings    | 5   | 1   |
| 4   | Consent banner (defect)                           | GA4 runs without it — legal + data-quality risk, still unfixed     | 6   | 2   |
| 5   | ~~Exact-anchor path to the pillar~~               | Shipped 2026-10-28 from 5 indexed URLs; read the crawl date        | —   | —   |
| 6   | Merge `/halving-dates` into the pillar            | One intent over two crawled-not-indexed URLs; 0 impressions in 28d | 6   | 3   |
| 7   | Cycle-vs-cycle live tracker                       | Bitbo and bitcoin-daily own the live view; pays only once indexed  | 4   | 6   |
| 8   | `/cycle/*` pages, cost-of-waiting calculator      | New URLs for a site with 20/25 unindexed — blocked by the freeze   | 3   | 6   |

## Open issues

- **Indexation went backwards: 6 → 5 on 2026-10-28** (`/articles/strongest-hands`
  lost). Denominator is now 22 after contraction, so the reading is 5/22. Treat
  every future cycle that adds a URL as adding to a declining set.
- **The GSC tables do not reconcile.** 7-day report 2026-10-27: 10 page rows
  summing to 40 impressions against a 21 total; 28-day report 2026-10-28: 11 page
  rows summing to 135 against 96; query rows sum to 8 impressions against 21.
  `pagesWithImpressions` is a window artifact (10 → 1 in a day while the total
  fell 21 → 16) and must not be quoted until the collector reconciles.
- **The review-runner guard is missing** — the 2026-10-26 review produced
  no verdict and nothing noticed. `run-review-cycle.sh` should hash
  `review-latest.json` before and after and report `review-missing` when it is
  unchanged or dated yesterday. Owner-owned (mandate 4); needs a yes, not a cycle.
- **GSC query attribution is incomplete: "0 non-brand" is a floor** (5 of 7
  clicks in the 7-day window have no named query; 17 of 49 in 90 days). The
  90-day table to 2026-10-24 shows 1 non-brand click (`500 btc`, position 26) on
  723 non-brand impressions.
- **The GSC page table does not sum to the total** (7-day 40 vs a 21-impression
  total on 10-27; 28-day 133 vs 94; 90-day 3,485 vs 3,378; and on 10-28 it did
  sum — 1 row, 16 impressions — because only one row was returned). Quote totals,
  never shares.
- **EU cookie consent is still missing while GA4 is installed.** Legal risk, and
  it pollutes engagement numbers (76 sessions in 7 days is not traffic).
- `/bear-market` earns impressions while 301-redirecting to the pillar. Dated
  article bodies still quote 30 November 2026 as published — intentional
  snapshots, explained by the live-date strip. Do not mass-rewrite them.
- **Vercel serves `permanent: true` redirects as 308, not 301** (`/bear-market`
  and the three 2026-10-28 contractions alike). Equivalent for Google; a plain
  `curl` check must accept 308.
- Archive: the runner appends validated daily rows in preflight. `archive=stale`
  is a defect, not a footnote.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health)
→ attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. `net.btc500.review` runs 09:30 daily and may only say
`improving` when `rule.mayClaimImproving` is true; a non-improving verdict must
order an owner ask. Every PERFORMANCE block now ends with `npm run referrals`.
Map: `scripts/autonomous/ARCHITECTURE.md`; ledger:
`scripts/autonomous/outreach/STATUS.md`.
