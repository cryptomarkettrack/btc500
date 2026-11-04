# BTC500 Growth Log

Working memory for the autonomous growth work. Short, dated, evidence-based. Do
not record guesses as results.

---

## Baseline — measured 2026-10-22

Source: Google Search Console API (property `https://btc500.net/`), via
`npm run search-console` and `npm run search-console:inspect`.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 90 days (2026-07-22 → 2026-10-19) | 49     | 3,370       | 1.5%  | 25.8         |
| 28 days (2026-09-22 → 2026-10-19) | 25     | 90          | 27.8% | 9.8          |

Non-brand organic traffic is effectively zero — the only query with volume is
`btc500` (40 impressions, 4 clicks, @3). The one durable non-brand cluster is the
500-day window (90 days: `when is 500 days…` 12 @8.8, `what is…` 5 @11.0,
`bitcoin 500 day cycle` 3 @10.3, all 0 clicks). Pages are not thin and there is no
canonical/robots/title problem: a three-month-old domain with no external links is
not worth crawling, and indexation is the gate. GA4 exists since 2026-10-23.

---

## Latest measurement — 2026-11-04

GSC windows end 2026-11-01 (3-day lag), GA4 ends 2026-11-03, archive fresh to
2026-11-03 (5,586 closes; the row is committed by the runner and is not in
production until this push). **indexed 1/21, sitemap 21** (inspection
2026-11-04T06:06:58Z) — with 3 of 21 URLs failing to inspect, so 1 is a floor, not
a proven fall from 2: `/halving-dates`, `/embed-kit` and
`/articles/bear-market-accumulation` all return 200 and errored in the API only.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-10-05 → 2026-11-01) | 26     | 95          | 27.4% | 11.4         |
| 7 days (2026-10-26 → 2026-11-01)  | 1      | 9           | 11.1% | 20.3         |

- 28-day 26/95 vs 26/94 yesterday: one impression. Noise. Five query rows, all
  `btc500` variants plus one new `bitcoin 500` (0/1 @67.0). **None of the four
  500-day cluster queries appears** — the 11-08 read stands.
- 7-day 1 click / 9 impressions for a third day; **0 non-brand clicks in 14
  readings**.
- GA4 7d (2026-10-28 → 11-03): **57 sessions / 24 users / 113 views / 52.6%**
  engaged, −25.0% sessions vs the previous 7d. Direct-led, not growth.
- Referrals 7d: **github.com 8**, every other tracked source 0 (12 → 8). Still 0
  external referring domains; freeze not lifted.
- Pillar `lastCrawl` **2026-10-22** (13 days). Crawled and declined on 2026-11-03:
  `/articles/btc500-strategy` and `/articles/why-btc500-exists`.

## Review 2026-11-03 (daily) — failing, tenth consecutive

- **Result: no measurable gain.** indexed 2/21 for a fourth inspection, 0 non-brand
  clicks in 13 readings, 7-day 1 click / 9 impressions, 82 sessions, referrals 12
  of 12 `github.com` = this repo. `externalReferringDomains` 0.
- **Input vs output:** 8 runs, 8 shipped, 0 failures, 2 of 2 due mandates executed —
  and **0 commits to `src/` or `public/sitemap.xml` since `62e3a8a`**.
- **The ask funnel splits by channel.** GitHub 3 of 3 executed; email, community and
  X 0 of 4 sent. A merged GitHub line is nofollow, so it cannot lift indexation.
- **Decision held:** the 2026-11-10 indexation line and the 2026-11-08 cluster read
  stand. The freeze stands. Verdict `failing`, blocked on `regressed: indexation`.

## Session 2026-11-04 — archive-only: two destinations qualified, one with a followed link

Preflight: archive refreshed (last row 2026-11-03, 0 stale), 0 experiments open, 0
due, site 200/200, review 2026-11-03 (`failing`, streak 10) with one mandate due
today. Freeze held: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` →
empty.

**`destination-qualify-1104` — executed: two destinations prepared, each with a
merge/publication record inside 14 days; no site file touched, no PR opened.**
(a) `jlopp/lopp.net` → `bitcoin-information/trading.html` → "Charts & Metrics". This
is the first destination in eight cycles that carries a **followed** link: the
rendered page returns 200 with **0 `rel="nofollow"`** and every anchor uses
`rel="noopener"`. Evidence: PR **#1260 merged 2026-11-03** by volodymyrslipak (same
section), #1259 merged 2026-11-01 by cryptokeyhole, #1258 merged 2026-10-31 by
fknoedt — 298 merged PRs in the repo. The one-line format and the alphabetical
position come from the repo's own `AGENTS.md`, which also states the risk honestly:
brand-new services are held "indefinitely" until they prove they are not scams, and
this domain is ~3 months old. Verbatim line and PR text in
`scripts/autonomous/outreach/2026-11-04-lopp-net-charts-metrics.txt`.
(b) CryptoQuant Quicktake — a community research feed that published outside posts at
2026-11-04T04:08Z (Trdaer_Gemini) and 2026-11-03T20:37Z (BaykusCharts). Listing page
200 / 0 nofollow; individual post pages return **403 to a scripted fetch**, so the
followed status of a published post is **unverified** and the file says so. Verbatim
post in `2026-11-04-cryptoquant-quicktake.txt`.
The rule earned its keep before any text was written: `openblockchains/
awesome-blockchains` (newest merge 2023-02-10), `imbaniac/awesome-blockchain`
(2023-04-28), `coinpride/CryptoList` (2019-10-28) and
`awesomedata/awesome-public-datasets` (2021-03-11) were all disqualified on their own
merge dates.

Live asks, channel-verified (not from the ledger):
`q=author:cryptomarkettrack+repo:yjjnls/awesome-blockchain` → **0 results**, so that
PR is not sent; coindesk.com absent from the 7-day referrals, so the email has
produced no session; #1009 still `open`, 0 comments, no activity since
2026-10-27T05:34:46Z. Nothing reworded or re-sent.

No indexed-URL defect: `/`, `/articles/bip-110-rejection`,
`/articles/bear-market-accumulation`, `/halving-dates`, `/embed-kit`,
`/data/500-day-cycles.json` and `/btc-usd-max.csv` all 200. IndexNow not run (no URL
change).

## Session 2026-11-03 (compressed)

`ask-verify-1103` + `referral-line-fix-1105`. awesome-bitcoin: 2 PRs, both closed
unmerged (#201 2026-07-27; #202 closed 2026-08-02, `merged: false`, 0 comments) —
the route was already tried, and the 11-02 ask was not sent. coindesk.com: 0
sessions in 7d and 28d. `referral-line.mjs` now takes its window from the report and
`newestReport(dir, {days})` selects by window, so a 28-day count can no longer print
as `referrals 7d`; regression test added.

### History before 2026-11-03

- **11-02** — `failing` (streak 9). X retired (no account exists); CoinDesk re-routed
  to `contact@coindesk.com`; awesome-bitcoin PR issued on a false "never tried"
  premise. Soft-404 diagnosis on `/articles/bear-market-accumulation`: 200, 1,383
  server-rendered words, stale five-week-old verdict.
- **11-01** — `failing` (streak 8). CoinDesk 2026-08-05 (Olivier Acuna) and Yahoo
  Finance 2026-06-24 ran the 500-day rule with our date; the declined pillar serves
  3,004 raw-HTML words — the gap is authority, not markup. Freeze baseline corrected
  to `62e3a8a`; `indexed` target lowered to 3/21 by 11-10.
- **10-30 → 10-31** — `5aad29f` changed the homepage and pillar title/meta/H1/copy
  twelve hours after three mandates forbade it → **full freeze**: no site change of
  any kind until indexed is above 3 twice or a non-github session appears. The index
  then fell 3 → 2 with nothing in the repo changing: the lever is authority.
- **10-22 → 10-29** — three declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.7% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                             |
| ---------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-03 | daily | failing | CoinDesk email at 60 words; awesome-bitcoin **withdrawn** (0/2) → `yjjnls/awesome-blockchain`; destination must have a merge record; GitHub links are nofollow (streak 10) |
| 2026-11-02 | daily | failing | CoinDesk re-routed to `contact@coindesk.com`; awesome-bitcoin PR; X retired; cluster read 11-08; indexation decision 11-10; runner guard re-issued (streak 8)              |
| 2026-11-01 | deep  | failing | CoinDesk email + X restated; inspection 11-02; Soft-404 diagnosis; channel-verified ask line; owner mandate for the runner; `indexed` target 3/21 (streak 8)               |
| 2026-10-31 | daily | invalid | run rejected its own file (`generated` ≠ today); the 10-30 mandates stand                                                                                                  |
| 2026-10-30 | daily | failing | full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID (streak 6)                                                                        |
| 2026-10-29 | daily | failing | indexation hold + inspect, cluster read 11-08, distribution-only; closed 2 experiments (streak 5)                                                                          |

---

## Next priorities

0. **Full freeze from 2026-10-30.** No site change at all — no code, copy, title,
   meta, section, sitemap or URL — until indexed is above 3 on two consecutive
   inspections or a non-github referring session appears. Proof baseline: `git diff
--stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Owner asks, channel-verified 2026-11-04: both unsent.** (a) email
   `contact@coindesk.com`, 60 words, due **2026-11-05**; (b) PR to
   `yjjnls/awesome-blockchain`, due **2026-11-06** — `author:cryptomarkettrack`
   returns 0 results, so it has not been opened. If (a) is unsent on 11-05 it is
   marked lapsed and not restated a fourth time.
2. **Prepared 2026-11-04 and not yet used: the lopp.net PR** — the only route in
   eight cycles that carries a followed link (`0 rel="nofollow"` on the rendered
   page), with three outside merges in the last five days (#1260, #1259, #1258).
   Text and format are ready in `2026-11-04-lopp-net-charts-metrics.txt`. Its known
   risk is the repo's "reputation before listing" rule for new domains.
3. **X is retired** until an account is written down in `outreach/STATUS.md`.
4. **bitcoin-only #1009** — open since 2026-10-27, 0 comments, no listing, 0
   sessions. Close as tested-and-failed on 2026-11-10 if unchanged.
5. **2026-11-08: read the four cluster queries** in both windows; if all four are
   absent and indexed is ≤2, close the cluster line as unservable and make no copy
   edit to `/` or the pillar through 2026-12-31.
6. **2026-11-10: the indexation decision.** If indexed is 2 or fewer, the line closes
   permanently — no in-repo indexation work without an external link, ever — and
   backlog rows 5–7 are deleted rather than left blocked.
7. **Own 2026-11-28** — the buy window opens in 24 days; `/` and the pillar state the
   same live date. It is the only news peg the site has.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Only rows 0–2 are permitted work, and
only the owner can do them. Rows 3–4 are readings, not builds. Rows 5–7 are blocked
while indexed is under 5 — eight cycles of shipping moved the gate 6 → 2, so building
more pages is a habit, not a bet. Rows 5–7 are deleted on 2026-11-10 if indexed ≤2.**

| #   | Bet                                                            | Why it can move the needle                                                                                                                                                                          | I   | E   |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | Email `contact@coindesk.com` — the −83.65% drawdown            | CoinDesk (2026-08-05), Yahoo (06-24), Investing.com (08-06) all ran the rule; none ran the per-window drawdown. Due 2026-11-05                                                                      | 10  | 1   |
| 1   | PR to `jlopp/lopp.net` → Charts & Metrics (**prepared 11-04**) | **Followed link** (0 nofollow on the rendered page), 298 merged PRs, three outside merges 10-31 → 11-03, one-line format. The only destination with both a record and a followed link               | 9   | 2   |
| 2   | PR to `yjjnls/awesome-blockchain` (3,644 stars)                | Merged 3 outside PRs on 2026-11-03; one line under `## Releated Tools`. GitHub is the channel the ledger proves the owner uses — but `github.com` is `rel="nofollow"`, so discovery only. Due 11-06 | 5   | 2   |
| 3   | CryptoQuant Quicktake (**prepared 11-04**)                     | Community research feed with an exact audience fit; outside posts published hourly. No editorial gate, needs an account; post pages 403 to a scripted fetch, so followed status unverified          | 6   | 3   |
| 4   | Cluster query reading 2026-11-08                               | Decides whether the 500-day framing is served or has no demand                                                                                                                                      | 7   | 1   |
| 5   | ~~Merge `/halving-dates` into the pillar~~                     | **Blocked while indexed is under 5** — needs a served page; 0 impressions in 28d                                                                                                                    | 5   | 3   |
| 6   | ~~Cycle-vs-cycle live tracker~~                                | **Blocked while indexed is under 5** — bitbo and bitcoin-daily own the live view                                                                                                                    | 4   | 6   |
| 7   | ~~`/cycle/*` pages, cost-of-waiting calculator~~               | **Blocked while indexed is under 5** — new URLs on a site with 20/21 unindexed                                                                                                                      | 3   | 6   |

## Open issues

- **Ask routes: one unexecutable, one already tried twice, ledger wrong for four
  days (2026-11-01 → 11-03).** The CoinDesk ask named a personal address the article
  does not publish; the X ask named an account a search does not return; the
  "never tried" awesome-bitcoin route had already closed BTC500 PRs #201/#202
  unmerged. Rules: an ask names a route that is publicly verified or that the ledger
  proves the owner uses; a `sent` cell is verified against the channel, not the file.
- **A destination needs a merge record, not stars.** The rule disqualified four
  lists on their own merge dates today (2023, 2023, 2019, 2021).
- **lopp.net's reputation rule is the live risk on the best destination (2026-11-04).**
  `AGENTS.md` holds brand-new services "indefinitely" until they prove they are not
  scams. The entry answers it with a JSON endpoint a maintainer can verify and an
  explicit no-ads/no-referrals/no-custody line, but a decline on that rule is
  plausible and should not be re-submitted within 90 days.
- **`referral-sessions` green is a self-referral (2026-11-02).** 12 sessions, 12
  `github.com`, 2 users — this repository and the owner's browser. Only a non-github
  referring session counts, and `externalReferringDomains` is 0.
- **Indexation: 6 (10-22) → 5 (10-28) → 3 → 3 → 2 (10-31) → 2 → 2 → 2 → 1 measured
  (11-04, 3 URLs failed to inspect)**, 5% coverage while the denominator shrank
  25 → 21. The pillar's `lastCrawl` is still **2026-10-22** (13 days), while
  `/articles/btc500-strategy` and `/articles/why-btc500-exists` were crawled
  2026-11-03 and declined on first fetch. Authority verdict: in-repo change is
  unmeasurable until a link exists.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on a
  crawl dated 2026-08-08; edited twice since and never re-fetched; serves 200 with
  1,383 server-rendered words, 0 body paragraphs duplicated from the pillar, 4
  internal links. Stale verdict, not a content judgment.
- **The demand exists and we are not in it (2026-11-01).** CoinDesk published the
  rule on 2026-08-05 and Yahoo Finance on 2026-06-24; bitbo.io runs `/halving/`.
  0 non-brand clicks because the pillar is not indexed and nothing links to it.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy twelve hours after three
  mandates forbade it. A `MANDATES` line needs a sha plus the diff.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day table sums to 42
  of 142 impressions); the 90-day reading is 723 impressions / 1 click.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`;
  dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health) →
attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. Map: `scripts/autonomous/ARCHITECTURE.md`.
