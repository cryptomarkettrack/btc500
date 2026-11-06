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

## Latest measurement — 2026-11-06 (18:36Z, second reading of the day)

GSC windows still end 2026-11-03 (3-day lag), GA4 still ends 2026-11-05, archive
fresh to 2026-11-05 (5,588 closes). **indexed 1/21, sitemap 21** (inspection
2026-11-06T18:36:11Z, 21 rows, 0 failed to inspect): 1 indexed, 14
crawled-not-indexed, 5 unknown to Google, 1 Soft 404. Same split and the same
`lastCrawl` values as the 07:32Z and 04:04Z runs — **zero URLs changed state
today**, so this is the third consecutive 1/21 and the decline is not moving.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-10-07 → 2026-11-03) | 23     | 84          | 27.4% | 12.6         |
| 7 days (2026-10-28 → 2026-11-03)  | 1      | 9           | 11.1% | 20.3         |

- Both GSC tables are unchanged because the lag has not advanced: "too early",
  not zero. 7d holds 2 query rows (`btc500` 0/1 @7.0, `bitcoin 500` 0/1 @67.0);
  none of the four 500-day cluster queries appears. **0 non-brand clicks in 16
  readings.** The 11-08 read still decides that line.
- GA4 7d (10-30 → 11-05): **45 sessions / 20 users / 81 views / 57.8% engaged**,
  −56.3% vs 103; 28d 148 / 58 / 287 / 47.3%. Unchanged since the morning run.
- Referrals 7d: **github.com 3**, x.com / reddit / bitcoinmagazine / bitcointalk 0
  (window 2026-10-30 → 2026-11-05). Down from 6 on 10-29 → 11-04 because the
  window slid, not because anything changed; both are the repo/owner browser.
  `externalReferringDomains` **0**, gate shut.
- **Re-derived the numbers the owner is about to send, from the archive itself**
  (`public/btc-usd-max.csv`, closes only): 2011-07-17 $14.07 → 2014-04-12 $420.66
  = 29.90x, low $2.30 at +128 d = **−83.65%**; 2015-02-25 $237.38 → 2017-11-21
  $8,114.13 = 34.18x, −11.49%; 2018-12-28 $3,854.42 → 2021-09-23 $44,980.90 =
  11.67x, −11.94%; 2022-12-07 $16,851.30 → 2025-09-02 $111,190.18 = 6.60x,
  −2.54%. Median −11.72%, 4 of 4 below entry. The PR body's claims are true.
- **Live model re-check:** tip height 974,836 → 75,164 blocks to 1,050,000 →
  522.0 days at the 600 s target → **2028-04-11**, so T-500 = **2026-11-28**.
  `/` renders "22 days to buy", 28 November 2026, 11 April 2028, height 974,836 —
  computed, not hardcoded. All 27 internal links on `/` return 200. No defect on
  an indexed URL.

## Session 2026-11-06 (18:36Z) — archive-only: ask re-verified, stale line numbers corrected

Preflight: archive fresh (2026-11-05, 0 appended), 0 experiments open, 0 due, site
200/200, review 2026-11-06 (`failing`, streak 13), no mandate due before 11-07.
Freeze held: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` → **empty**.

- **Channel check (18:38Z):** `q=author:cryptomarkettrack+repo:jlopp/lopp.net` → 0
  and `q=repo:jlopp/lopp.net+btc500` → 0, so no PR under any author. `#1009` is
  still `open`, `comments: 0`, `updated_at == created_at 2026-10-27T05:34:46Z`.
- **New fact: the apex host redirects.** `https://lopp.net/…/trading.html` → **301**
  → `https://www.lopp.net/…/trading.html` → 200. The 200 claim is a www-host claim;
  a future cycle must fetch with `-L` or the www URL, not read the 301 as a dead page.
  www today: 205 rendered lines, `BitInfoCharts` line **105**, `CME Futures` line
  **106**, **0** `rel="nofollow"`, **0** `BTC500`.
- **Corrected the stale instructions in the two files the owner might read.** Both
  `outreach/2026-11-04-lopp-net-charts-metrics.txt` and the 11-06 ledger note still
  said 112/113/114; corrected to 104/105/106 (`Bitcoin Bottom Score` / `BitInfoCharts`
  / `CME Futures`) with the grep output, and the file's "run check_links.py" step
  removed because the issued ask is browser-only. Entry text, title and body
  unchanged.
- No site change, no new page, no sitemap row, no title/meta/copy edit, no
  experiment opened, no new destination copy. Morning review (12th failing) is in
  the history table: `shipped` had been counting archive refreshes; sessions fell
  103 → 45; the pillar was re-crawled 2026-11-05 and declined unchanged.

## Session 2026-11-05 — `indexed-decision-1105`: the indexation line closes

- No in-repo indexation work — merge, redirect, sitemap row, title, meta, section or
  new page — again without an external referring link; gate = `externalReferringDomains > 0`.
  `indexed` target retired, backlog rows 5–7 deleted. Series: 6/25 → 5/22 → 3/21 → 2/21 → 1/21.
- Freeze held (257a504, docs only): diff since `62e3a8a` over `src`/sitemap empty.

## Session 2026-11-04 — archive-only: two destinations qualified, one followed

`destination-qualify-1104`: `jlopp/lopp.net` → `trading.html` → Charts & Metrics —
first destination in eight cycles with a **followed** link (298 merged PRs, #1260
merged 11-03 in that section). Second, CryptoQuant Quicktake, unverified followed
status. Four other lists disqualified on merge dates 2019–2023. No site file touched.

### History before 2026-11-04

- **11-03** — `ask-verify-1103`: awesome-bitcoin had already closed BTC500 PRs
  #201/#202 unmerged (0 of 2), so the 11-02 ask was never sent; `referral-line.mjs`
  fixed to print the window from the report, not the newest filename.
- **11-02** — X retired (no account exists); CoinDesk re-routed to
  `contact@coindesk.com`; soft-404 diagnosis on `/articles/bear-market-accumulation`.
- **11-01** — CoinDesk (08-05), Yahoo Finance (06-24) and Investing.com (08-06) all
  ran the 500-day rule with our date; the declined pillar serves 3,004 raw-HTML
  words, so the gap is authority, not markup.
- **10-30 → 10-31** — `5aad29f` changed the homepage and pillar title/meta/H1/copy
  twelve hours after three mandates forbade it → **full freeze**. The index then
  fell 3 → 2 with nothing in the repo changing: the lever is authority.
- **10-22 → 10-29** — three declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                                                      |
| ---------- | ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-06 | daily | failing | `lopp-net-pr-current-lines-1108` (owner, due 11-09, line numbers 105/106); `outreach-stop-1107`; `cluster-read-1108`; `dirty-tree-guard-1107`; `runner-honesty-1108` (owner). `shipped` redefined as a diff touching `src/`/sitemap (streak 13)     |
| 2026-11-05 | daily | failing | Mandate `lopp-net-pr-send-1106` (owner: open the lopp.net PR by 11-06); `ask-gate-1107` sent-state checks; `cluster-read-1108`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` is the only gate (streak 12) |
| 2026-11-04 | daily | failing | Indexation line closed on 11-05 (1/21); lopp.net ask with corrected insertion point; CoinDesk lapsed (429); awesome-blockchain withdrawn; #1009 failed; collector must stop quoting `--limit` inspections                                           |
| 2026-11-03 | daily | failing | CoinDesk email at 60 words; awesome-bitcoin withdrawn (0/2) → `yjjnls/awesome-blockchain`; destination needs a merge record; GitHub links are nofollow                                                                                              |
| 2026-11-02 | daily | failing | CoinDesk re-routed to `contact@coindesk.com`; X retired; cluster read 11-08; indexation decision; runner guard re-issued                                                                                                                            |
| 2026-11-01 | deep  | failing | CoinDesk email + X restated; inspection; soft-404 diagnosis; channel-verified ask line; owner mandate for the runner                                                                                                                                |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID                                                                                                                                                            |

---

## Next priorities

0. **Full freeze stands.** No code, copy, title, meta, section, sitemap or URL
   change until `externalReferringDomains > 0`. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Live ask `github-lopp-net-charts`, due 2026-11-09 — unsent, owner-only.**
   `q=author:cryptomarkettrack+repo:jlopp/lopp.net` and
   `q=repo:jlopp/lopp.net+btc500` both return 0 (checked 18:38Z today). This is the
   only prepared route with a followed link; text in
   `outreach/2026-11-04-lopp-net-charts-metrics.txt`, now carrying the current
   numbers. **Insert after `BitInfoCharts` (line 105), before `CME Futures` (106)**
   on the www host — the apex 301s to www. Any GitHub account will do; the PR does
   not have to come from `cryptomarkettrack`. If unsent on 2026-11-07, all outreach
   preparation stops until 2026-11-28.
2. **2026-11-08: read the four cluster queries** in both windows plus the
   pillar's coverage/lastCrawl; if all four are absent and indexed ≤2, close the
   500-day cluster as unservable and make no copy edit to `/` or the pillar
   through 2026-12-31. Today's reading already shows all four absent.
3. **The buy-window peg, 2026-11-28** — `/` and the pillar state the same live
   date (28 November 2026, from a 2028-04-11 estimate at height 974,836) and answer
   200 from production. It is the only news peg the site has.
4. **Owner mandates, not cycle work:** `runner-honesty-1108` (collector + review
   validator fixes) and the lopp.net send. Neither is executable from this session.

## Ranked backlog

Only rows 0–2 are permitted work, and only the owner can do them. Rows 3–4 are
readings, not builds. Rows 5–7 were deleted on 2026-11-05 (mandate
`indexed-decision-1105`): blocked-build rows are retired, not carried forward.

| #   | Bet                                                                 | Why it can move the needle                                                                                                                                                                                                     | I   | E   |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | --- |
| 0   | PR to `jlopp/lopp.net` → Charts & Metrics (**live ask, due 11-09**) | **Followed link** (0 nofollow on the rendered page), 298 merged PRs, one-line format, three outside merges 10-31 → 11-03. Only destination with both a merge record and a followed link; the only input that can move the gate | 9   | 2   |
| 1   | CryptoQuant Quicktake (**prepared 11-04**)                          | Community feed with an exact audience fit; no editorial gate, needs an account; post pages 403 to a scripted fetch, followed status unverified. Second in line, not prepared again while ask 0 is unsent                       | 6   | 3   |
| 2   | ~~CoinDesk email~~ / ~~awesome-blockchain PR~~ / ~~X post~~         | Lapsed 11-05 (address unverifiable, 429), withdrawn (nofollow), retired (no account). None restated                                                                                                                            | —   | —   |
| 3   | Cluster query reading 2026-11-08                                    | Decides whether the 500-day framing is served or has no demand                                                                                                                                                                 | 7   | 1   |

## Open issues

- **The pillar was crawled on 2026-11-05 and declined again.** First fetch since
  2026-10-22; nothing in the repo changed between the two crawls (diff since
  `62e3a8a` empty), so the decline is an authority verdict on an unchanged page.
  This is the cleanest available test of the freeze hypothesis, and it failed:
  waiting does not index a page nobody links to.
- **Indexation: 6 (10-22) → 5 (10-28) → 3 → 3 → 2 (10-31) → 2 → 2 → 2 → 1
  (11-04) → 1/21 (11-05, 11-06 twice, no URL changed state on 11-06)**, denominator
  21 = sitemap locs. 5% coverage; 14 crawled-not-indexed, 5 unknown, 1 Soft 404.
- **`lopp.net` is www-only from a scripted fetch.** `https://lopp.net/…/trading.html`
  returns **301** to `https://www.lopp.net/…/trading.html` (200). Read the 301 as a
  canonical-host redirect, not a removed page; `curl -L` or the www URL for any
  future check of the destination.
- **Ask routes: only one is left, and it is owner-only.** 10 asks handed over
  since 2026-10-27, 3 executed (all GitHub), 0 sessions from any non-github
  referrer in every reading. A `sent` cell is verified against the channel, never
  against this file.
- **A destination needs a merge record, not stars.** Four lists were disqualified
  on their own merge dates (2019–2023); awesome-bitcoin had 1,358 stars and a 0
  of 2 record.
- **lopp.net's reputation rule is the live risk (2026-11-04).** Its `AGENTS.md`
  holds brand-new services "indefinitely" until they prove they are not scams and
  this domain is ~3 months old; a decline on that rule should not be re-submitted
  within 90 days.
- **`referral-sessions` green is a self-referral** — `github.com` is this repo and
  the owner's browser. Only a non-github referring session counts.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a 2026-08-08 crawl; serves 200, 1,383 words, no pillar duplication. Stale verdict.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day table sums to
  36 of 131 byPage impressions).
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy hours after three mandates
  forbade it. A `MANDATES` line needs a sha plus the diff.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`;
  dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive, due experiments, site health) → attempt
→ `npm test` + `tsc` gate → Vercel status → `last-deploy.json` against live HTML.
Map: `scripts/autonomous/ARCHITECTURE.md`.
