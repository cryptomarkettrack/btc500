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

## Latest measurement — 2026-10-30

GSC windows end 2026-10-27, GA4 window ends 2026-10-29, archive fresh to
2026-10-29 (5,581 daily closes). **indexed 3/21, sitemap 21.**

| Window                            | Clicks | Impressions     | CTR   | Avg position |
| --------------------------------- | ------ | --------------- | ----- | ------------ |
| 28 days (2026-09-30 → 2026-10-27) | 25     | 94 (byPage 133) | 26.6% | 11.2         |
| 7 days (2026-10-21 → 2026-10-27)  | 1      | 10              | 10.0% | 18.3         |

- The 7-day table is **flat at 1 click / 10 impressions for a second day**. Nine
  readings, each one day later: clicks 14, 10, 9, 8, 8, 7, 5, 1, 1; impressions
  45, 37, 31, 28, 26, 21, 16, 10, 10. One query row: `btc500` 1/4 @ 3.5. No
  cluster query present, so the 2026-10-29 H1 change still cannot be read (mandate
  reads it 2026-11-08). Not a further decline — the same floor, one day on.
- 28-day query table is the brand five ways (5 rows, 47 of 94 impressions after
  anonymisation); 0 non-brand clicks. The 28-day total is unchanged only because
  the 14-click week 2026-10-13..10-19 is still inside it; it ages out 2026-11-09.
- Indexation unchanged at **3 of 21** (inspection 2026-10-30T04:05Z): `/` (crawl
  10-24), `/articles/bip-110-rejection` (08-11), `/articles/bear-market-accumulation`
  (08-08). Pillar lastCrawl still 2026-10-22. 12 crawled-not-indexed, 6 never
  fetched (`/about`, `/news`, `/embed-kit`, `/insider-trading`,
  `/articles/why-btc500-exists`, `/articles/rupl`).
- GA4 7 days (10-23 → 10-29): **103 sessions / 48 users / 206 views / 42.7%**
  engaged. Channels: Direct 82, Referral 12 (github), **AI Assistant 4**, Organic
  4, Unassigned 1. Landing: `/` 73, pillar 14. The AI Assistant row is new and is
  **not** a referring domain — 4 sessions cannot be told apart from the owner's own
  answer-engine use. Observation, not a win.
- Referrals 7d: **github.com 12, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
  bitcointalk.org 0** — github.com is this repository, not a mention. 0 external
  referring domains is still the blocker.
- Mandate `homepage-placeholder-fix` verified in production: `/` serves `4/4`,
  `+1959%` and **0** "Completed-window data is loading."; sitemap lastmod for `/`
  is 2026-10-29. Before (10-29): three `—` record stats plus that string.

---

## Session 2026-10-30 — consent defect fixed: GA4 no longer sets a cookie before a choice

Why: GA4, the only tag on the site, loaded unconditionally in `<head>` and wrote
its `_ga` cookie before any choice, while `/privacy` said the site used "Vercel
Analytics" only. Two defects on the one indexed URL — tracking without consent and
a privacy page that misdescribed it — and the last open defect that is not about
indexation, which the distribution-only freeze permits as a defect fix on `/`.

- `src/lib/consent.ts` (new): key `btc500.consent.v1`, Consent Mode v2 payloads
  (`analytics_storage` only — every ad signal stays denied permanently), storage
  helpers that survive blocked storage.
- `src/components/GoogleAnalytics.tsx`: `gtag("consent","default", …denied)`
  **before** `gtag("config")`; a stored `granted` is upgraded in the same inline
  script. Denying storage rather than the tag keeps cookieless aggregate counts, so
  the 7-day and 28-day readings survive the change.
- `src/components/ConsentBanner.tsx` (new): server-renders `hidden`, resolves the
  stored choice after hydration (no flash, no mismatch); Accept / Decline /
  Privacy; never rendered inside `/embed`.
- `src/routes/privacy.tsx`: discloses GA4 + Consent Mode + how to revoke;
  `updated` → 2026-10-30; schema description corrected.
- `src/lib/consent.test.ts` (10 tests) wired into `npm test`.

Locally: `npm test` 204/204, `tsc --noEmit` clean, eslint + prettier clean on
every changed file, `npm run build` clean; the built SSR HTML carries the consent
default before config and the banner on `/` and `/privacy`, neither on `/embed`;
headless Chrome on the build: 0 cookies before a choice, Decline stores `denied`
and hides it, reload keeps it hidden, Accept stores `granted`.

Verified in production (`93231b3`, 2026-10-30T04:14Z): manifest 4/4 (`/` has the
banner and `"analytics_storage":"denied"`; `/privacy` has the GA4 disclosure and
the 10-30 date). Headless Chrome against https://btc500.net/: banner visible on a
first visit, the **only** consent command sent is `default` → all four signals
denied, **0 cookies** before a choice, gtag loaded (cookieless pings, so counts
survive), Accept → `_ga` + `_ga_GM4WBKY74P` appear and the banner hides, 0 page
errors. `/` 200, `/privacy` 200, sitemap 21 `<loc>`, robots.txt 200, IndexNow 200
for 21 URLs.

Not verified, stated: GA4 report behaviour under Consent Mode cannot be read from
this environment; what is verified is the tag configuration in the served HTML and
the cookie list before and after a choice.

## Session 2026-10-29 — X launch pack, rule retarget, homepage SSR fix

`scripts/autonomous/x/launch-content.json` + 5 tests (final bio 149/160, pinned
post, 7 tweets ≤280 carrying measured numbers: median cycle multiple ≈11.7x, buy
2026-11-30, sell 2029-08-26). `/` and the pillar retargeted onto the "Bitcoin
500-day rule" framing the 2026 coverage uses (CoinDesk, Yahoo, Binance). Homepage
route loader seeds `simulatorPreviewQuery` so the served HTML carries the record
stats instead of `—` and "data is loading".

## Session 2026-10-29 (review) — the measurement was fixed, and it made the week worse

The review found the collector correct and the week failing: indexed 3/21, 0
non-brand clicks, 7-day clicks 14 → 1, impressions 45 → 10. All 4 mandates were
executed and verified and the outcome was still negative, so the review retired
the contraction rule and closed two experiments:

- **`sitemap-contraction` closed FAILED** 12 days early on its own fail branch
  (≤5 of 22 on 2026-11-10; the site is at 3 of 21). `/articles` has not been
  crawled since 2026-08-14.
- **`pillar-date-first-snippet` closed UNREADABLE**: lastCrawl still 2026-10-22
  through four deploys and five inbound exact anchors.
- **`distribution-test` is the only open experiment**; the one live ask (GitHub
  listing on bitcoin-only.com, by 2026-11-11) was restated narrower.
- New rule: **distribution-only until 2026-11-12** — a cycle ships only a defect
  fix on an indexed URL or a prepared ask; archive-only is valid; no URL added,
  removed, merged or redirected; no copy edit on a declined URL.

### History before 2026-10-29

- **10-29** — GSC collector reconciled (`byProperty` vs `byPage`, 15 tests);
  `/articles/strongest-hands` contracted (sitemap 22 → 21); homepage H1 answered
  the 500-day query from `computeCycle`; ask ledger made truthful.
- **10-28** — three declined August articles 308 → `/articles` (sitemap 25 → 22);
  exact-anchor path from `/` and four articles; `outreach/STATUS.md` +
  `npm run referrals` so a zero can be told from "nobody looked".
- **10-27 → 10-22** — `/data/500-day-cycles.json` + citation block + `Dataset`
  JSON-LD; live buy date on article pages; entry-timing test (120 days early worse
  in 3/3, median −32.5%); drawdown study (−11.7% median, −83.7% worst, 84.5 days
  to the low); GA4 installed; autonomous runner + `.ics` feed.
- **Earlier** — `2c7f981` noindexed eight dated posts; llms.txt / llms-full.txt,
  embed kit, simulator, timeline, DCA, ETF and insider dashboards.

### Review history

| date       | mode  | verdict  | what it forced                                                                                                              |
| ---------- | ----- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-29 | daily | failing  | indexation hold + inspect, homepage placeholder fix, cluster read 11-08, distribution-only; closed 2 experiments (streak 5) |
| 2026-10-28 | daily | failing  | GSC reconcile, strongest-hands 301, homepage answer, ask ledger (streak 4)                                                  |
| 2026-10-27 | daily | failing  | contraction 25 → 22, exact-anchor path, ask ledger                                                                          |
| 2026-10-25 | deep  | stagnant | merged 3 single-page experiments into `distribution-test`                                                                   |

---

## Next priorities

0. **Distribution-only until 2026-11-12.** A cycle ships only a defect fix on an
   indexed URL or a prepared ask. No URL added, removed, merged or redirected; no
   copy, title, meta or section edit on a declined URL. Archive-only is valid.
1. **Owner files the bitcoin-only.com GitHub issue** — one issue, one template,
   two minutes, by 2026-11-11 (`outreach/2026-10-27-bitcoin-only-listing.txt`).
   It is the only action left that can add a referring domain; 4 asks handed over
   since 10-27, 0 sent, 12 of 12 referral sessions are our own repository.
2. **2026-11-02: inspect, change nothing** (mandate) — `indexed X/21` plus the
   coverage and lastCrawl of the two URLs lost on 10-29. If either returns without
   an in-repo change, that is the answer to what moves the index.
3. **2026-11-08: read the cluster queries** (mandate) in both windows; if all four
   are absent, close the homepage H1 change as unreadable.
4. **Own 2026-11-28** — the buy window opens in 29 days; `/` and the pillar state
   the same live date. Do not touch either before the reading.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Distribution-only until
2026-11-12: rows 0 and 1 are the only work permitted; everything else is blocked,
not queued.**

| #   | Bet                                            | Why it can move the needle                                                       | I   | E   |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------- | --- | --- |
| 0   | Owner files the bitcoin-only.com listing issue | Only channel with evidence of use; 0 external referral sessions, 18/21 unindexed | 10  | 1   |
| 1   | Cluster query reading 2026-11-08               | Decides whether the H1 change was readable at all                                | 7   | 1   |
| 2   | Merge `/halving-dates` into the pillar         | Blocked: no URL merges before 2026-11-12; the page has 0 impressions in 28d      | 5   | 3   |
| 3   | Cycle-vs-cycle live tracker                    | Bitbo and bitcoin-daily own the live view; pays only once indexed                | 4   | 6   |
| 4   | `/cycle/*` pages, cost-of-waiting calculator   | New URLs on a site with 18/21 unindexed — blocked by the freeze                  | 3   | 6   |

## Open issues

- **Indexation is decaying, not stalled: 6 (10-22) → 5 (10-28) → 3 (10-29) → 3
  (10-30)**, 14% coverage while the denominator shrank 25 → 21. Each lost URL was
  200 with a matching canonical the day it dropped; Google re-crawls and declines
  (an authority verdict, not discovery or on-page). Treat every in-repo change as
  unmeasurable until a link exists.
- **Consent: fixed 2026-10-30** (Consent Mode v2 default denied + banner +
  truthful `/privacy`). Remaining limitation, stated: there is no in-page control
  to revoke a choice — the policy tells visitors to clear site data. Add one only
  if a cycle has nothing better, and never as an experiment.
- **`/` still serves `BTC / USD —` in the tape and omits the hero price.** The
  live price is a network read; seeding it in the route loader would add an
  upstream call (and a cold-cache delay) to the SSR of the one indexed URL.
  Considered and rejected 2026-10-30: it trades a cosmetic dash for a real TTFB
  risk. Revisit only with a measured CWV problem.
- **GA4 has no data before 2026-10-23**, so 7-day and 28-day totals were identical
  until this week (91 → 103 sessions). Quote it as "since 10-23", never as a month.
- **GSC query attribution is incomplete: "0 non-brand" is a floor** (query rows
  are anonymised; the 28-day table sums to 47 of 94 impressions). The report says
  so in writing, and the 90-day reading is 723 non-brand impressions / 1 click.
- **Closed / do not reopen:** the hash-guard mandate for `run-review-cycle.sh`
  (2026-10-29 review — `validate-review.mjs` already rejects a stale
  `generated`/`mode`); `/bear-market` keeps earning impressions while 301-redirecting
  to the pillar; dated article bodies quote 30 November 2026 as published on
  purpose (the live-date strip explains it); Vercel serves `permanent: true` as
  **308**, so a plain `curl` check must accept 308.
- Archive: the runner appends validated daily rows in preflight. `archive=stale`
  is a defect, not a footnote.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health)
→ attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. `net.btc500.review` runs 09:30 daily and may only say
`improving` when `rule.mayClaimImproving` is true. Every PERFORMANCE block ends
with `npm run referrals`. Map: `scripts/autonomous/ARCHITECTURE.md`; ledger:
`scripts/autonomous/outreach/STATUS.md`.
