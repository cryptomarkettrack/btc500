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

## Latest measurement — 2026-11-06

GSC windows end 2026-11-03 (3-day lag), GA4 ends 2026-11-05, archive fresh to
2026-11-05 (5,588 closes). **indexed 1/21, sitemap 21** (inspection
2026-11-06T04:04:49Z, 21 rows, 0 failed to inspect): 1 indexed, 14
crawled-not-indexed, 5 unknown to Google, 1 Soft 404. Second consecutive 1/21.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-10-07 → 2026-11-03) | 23     | 84          | 27.4% | 12.6         |
| 7 days (2026-10-28 → 2026-11-03)  | 1      | 9           | 11.1% | 20.3         |

- 28d 23/84 vs 26/95 on the window ending 11-01: the window slid two days, so
  three clicks and eleven impressions are window arithmetic and noise at 84
  impressions, not a trend. The 14-click week ages out on 11-09 and the 28d
  number will fall again for the same reason — arithmetic, not a regression.
- 7d 1 click / 9 impressions @20.3 for a fourth reading. Two query rows:
  `btc500` 0/1 @7.0 and `bitcoin 500` 0/1 @67.0. **0 non-brand clicks in 15
  readings.** None of the four 500-day cluster queries appears; the 11-08 read
  still decides that line.
- GA4 7d (2026-10-30 → 11-05): **45 sessions / 20 users / 81 views / 57.8%
  engaged**, −56.3% sessions vs the previous 7d (103). Channels: direct 33, AI
  assistant 4, organic search 4, referral 3, organic social 1; the only referral
  row is `github.com` 3. 28d: 148 sessions / 58 users / 287 views / 47.3%.
- Referrals 7d: **github.com 6**, x.com / reddit / bitcoinmagazine / bitcointalk
  0 (window 2026-10-29 → 2026-11-04). `externalReferringDomains` **0**, gate shut.
- **The pillar was fetched on 2026-11-05** — first crawl since 2026-10-22 — and
  declined again the same day. `/` was re-crawled 2026-11-05 and stays indexed.
  No other coverage change between the 11-05 and 11-06 inspections; the only two
  rows that moved are those two `lastCrawl` dates.

## Session 2026-11-06 — archive-only: the one due mandate is owner-only

Preflight: archive refreshed to 2026-11-05 (0 stale), 0 experiments open, 0 due,
site 200/200, review 2026-11-05 (`failing`, streak 12). Freeze held:
`git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` → **empty** (run today).

- `lopp-net-pr-send-1106` (due today) — **not executable by the cycle**: it asks
  the owner to open a PR from the `cryptomarkettrack` GitHub account, which
  `src/AGENTS.md` §13 forbids the cycle to do. Channel check 2026-11-06:
  `q=author:cryptomarkettrack+repo:jlopp/lopp.net` → 0 results and
  `q=repo:jlopp/lopp.net+btc500` → 0, so no PR exists under any author. The
  destination is still qualified: trading.html 200, **0** `rel="nofollow"`, 0
  occurrences of `BTC500`. Text unchanged in
  `outreach/2026-11-04-lopp-net-charts-metrics.txt`.
- `ask-gate-1107` (due 11-07) — today's check done and recorded in
  `outreach/STATUS.md`: unsent, no new destination copy written, and the
  11-07 "stop outreach prep until 11-28" rule is one day away.
- No site change, no new page, no sitemap row, no title/meta/copy edit, no
  experiment opened. No defect on an indexed URL: `/`,
  `/articles/bip-110-rejection` and `/articles/bear-market-accumulation` all 200.

## Session 2026-11-05 — `indexed-decision-1105` executed: the indexation line closes

- Recorded in this log that no in-repo indexation work — merge, redirect, sitemap
  row, title, meta, section or new page — is attempted again without an external
  referring link. Gate is now `externalReferringDomains > 0`.
- `indexed` target retired in `review-latest.json`; ranked-backlog rows 5–7
  deleted (blocked builds are retired, not carried). Series: **6/25 (10-22) →
  5/22 → 3/21 → 2/21 → 1/21**.
- Freeze held: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` empty
  (commit 257a504, docs only). No site file touched.

## Session 2026-11-04 — archive-only: two destinations qualified, one with a followed link

`destination-qualify-1104` executed: (a) `jlopp/lopp.net` →
`bitcoin-information/trading.html` → Charts & Metrics — the first destination in
eight cycles with a **followed** link (page 200, 0 `rel="nofollow"`, 298 merged
PRs, #1260 merged 2026-11-03 in the same section); insertion point corrected by
the review to between `BitInfoCharts` (113) and `CME Futures` (114). (b)
CryptoQuant Quicktake — outside posts published hourly, but post pages 403 to a
scripted fetch, so followed status is unverified. Four other lists disqualified on
their own merge dates (2019–2023). No site file touched; diff since `62e3a8a`
empty.

### History before 2026-11-04

- **11-03** — `ask-verify-1103`: awesome-bitcoin had already closed BTC500 PRs
  #201/#202 unmerged (0 of 2), so the 11-02 ask was never sent; `referral-line.mjs`
  fixed to print the window from the report, not the newest filename.
- **11-02** — X retired (no account exists); CoinDesk re-routed to
  `contact@coindesk.com`; soft-404 diagnosis on
  `/articles/bear-market-accumulation` (200, 1,383 words, stale Aug verdict).
- **11-01** — CoinDesk (2026-08-05), Yahoo Finance (06-24) and Investing.com
  (08-06) all ran the 500-day rule with our date; the declined pillar serves 3,004
  raw-HTML words, so the gap is authority, not markup.
- **10-30 → 10-31** — `5aad29f` changed the homepage and pillar title/meta/H1/copy
  twelve hours after three mandates forbade it → **full freeze**. The index then
  fell 3 → 2 with nothing in the repo changing: the lever is authority.
- **10-22 → 10-29** — three declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                                   |
| ---------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-05 | daily | failing | Mandate `lopp-net-pr-send-1106` (owner: open the lopp.net PR by 11-06); `ask-gate-1107` sent-state checks; `cluster-read-1108`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` is the only gate (streak 12) |
| 2026-11-04 | daily | failing | Indexation line closed on 11-05 (1/21); lopp.net ask with corrected insertion point; CoinDesk lapsed (429); awesome-blockchain withdrawn; #1009 failed; collector must stop quoting `--limit` inspections                            |
| 2026-11-03 | daily | failing | CoinDesk email at 60 words; awesome-bitcoin withdrawn (0/2) → `yjjnls/awesome-blockchain`; destination needs a merge record; GitHub links are nofollow                                                                             |
| 2026-11-02 | daily | failing | CoinDesk re-routed to `contact@coindesk.com`; X retired; cluster read 11-08; indexation decision; runner guard re-issued                                                                                                          |
| 2026-11-01 | deep  | failing | CoinDesk email + X restated; inspection; soft-404 diagnosis; channel-verified ask line; owner mandate for the runner                                                                                                              |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID                                                                                                                                          |

---

## Next priorities

0. **Full freeze stands.** No code, copy, title, meta, section, sitemap or URL
   change until `externalReferringDomains > 0`. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Live ask `github-lopp-net-charts`, due 2026-11-06 — unsent, owner-only.**
   `author:cryptomarkettrack` returns 0 results. This is the only prepared route
   with a followed link; text and corrected insertion point in
   `outreach/2026-11-04-lopp-net-charts-metrics.txt`. If unsent on 11-07, all
   outreach preparation stops until 2026-11-28.
2. **2026-11-08: read the four cluster queries** in both windows plus the
   pillar's coverage/lastCrawl; if all four are absent and indexed ≤2, close the
   500-day cluster as unservable and make no copy edit to `/` or the pillar
   through 2026-12-31. Today's reading already shows all four absent.
3. **The buy-window peg, 2026-11-28** — `/` and the pillar state the same live
   date and answer 200 from production. It is the only news peg the site has.
4. **Owner mandates, not cycle work:** `runner-honesty-1108` (three runner fixes)
   and the lopp.net send. Neither is executable from this session.

## Ranked backlog

Only rows 0–2 are permitted work, and only the owner can do them. Rows 3–4 are
readings, not builds. Rows 5–7 were deleted on 2026-11-05 (mandate
`indexed-decision-1105`): blocked-build rows are retired, not carried forward.

| #   | Bet                                                                                    | Why it can move the needle                                                                                                                                                                                                        | I   | E   |
| --- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | PR to `jlopp/lopp.net` → Charts & Metrics (**live ask, due 11-06**)                     | **Followed link** (0 nofollow on the rendered page), 298 merged PRs, one-line format, three outside merges 10-31 → 11-03. Only destination with both a merge record and a followed link; the only input that can move the gate          | 9   | 2   |
| 1   | CryptoQuant Quicktake (**prepared 11-04**)                                              | Community feed with an exact audience fit; no editorial gate, needs an account; post pages 403 to a scripted fetch, followed status unverified. Second in line, not prepared again while ask 0 is unsent                            | 6   | 3   |
| 2   | ~~CoinDesk email~~ / ~~awesome-blockchain PR~~ / ~~X post~~                             | Lapsed 11-05 (address unverifiable, 429), withdrawn (nofollow), retired (no account). None restated                                                                                                                                | —   | —   |
| 3   | Cluster query reading 2026-11-08                                                        | Decides whether the 500-day framing is served or has no demand                                                                                                                                                                    | 7   | 1   |

## Open issues

- **The pillar was crawled on 2026-11-05 and declined again.** First fetch since
  2026-10-22; nothing in the repo changed between the two crawls (diff since
  `62e3a8a` empty), so the decline is an authority verdict on an unchanged page.
  This is the cleanest available test of the freeze hypothesis, and it failed:
  waiting does not index a page nobody links to.
- **Indexation: 6 (10-22) → 5 (10-28) → 3 → 3 → 2 (10-31) → 2 → 2 → 2 → 1
  (11-04) → 1/21 (11-05, 11-06)**, denominator 21 = sitemap locs. 5% coverage;
  14 crawled-not-indexed, 5 unknown, 1 Soft 404.
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
- **`referral-sessions` green is a self-referral.** `github.com` is this repository
  and the owner's browser. Only a non-github referring session counts.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a crawl dated 2026-08-08; serves 200 with 1,383 server-rendered words, 0 body
  paragraphs duplicated from the pillar. Stale verdict, not a content judgment.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day table sums to
  36 of 131 byPage impressions).
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy twelve hours after three
  mandates forbade it. A `MANDATES` line needs a sha plus the diff.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`;
  dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health) →
attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. Map: `scripts/autonomous/ARCHITECTURE.md`.
