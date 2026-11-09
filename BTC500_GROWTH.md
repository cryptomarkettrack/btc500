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
`bitcoin 500 day cycle` 3 @10.3, all 0 clicks). No canonical/robots/title problem:
a three-month-old domain with no external links is not worth crawling. GA4 exists
since 2026-10-23.

---

## Latest measurement — 2026-11-09 (04:03Z)

**The buy date moved one day with no deploy: Nov 28 → Nov 29, 2026.** The
2026-11-08 manifest asserted `/bitcoin-500-day-cycle` contained "November 28,
2026" and passed; today the same URL serves `<title>November 29, 2026: 500 Days
Before the Next Bitcoin Halving</title>` and `/` reads "29 November 2026 / 20 DAYS
TO BUY" — with no push since `dc7d2d0`. Both pages render the date per request
from the live block height (975,127 today), so the date is a live estimate by
design (the homepage says so) but it cannot be a manifest token. Every check in
`last-deploy.json` is now date-free.

- **indexed 1/21, sitemap 21** (inspection 2026-11-09T04:03:40Z, 21 rows, 0 failed
  to inspect): **sixth consecutive 1/21** — 1 indexed, 14 crawled-not-indexed,
  5 unknown to Google, 1 Soft 404. **No URL changed state** since the
  2026-11-08T04:03:35Z inspection. **The pillar's `lastCrawl` is still 2026-11-07
  (03:42:34Z) — 16h38m before the merge** (2026-11-07T20:20:30Z): no post-merge
  crawl, so Google has not yet read the new link.
- GSC, both windows end 2026-11-06 (3-day lag): **28d 2026-10-10 → 11-06: 19
  clicks / 78 impressions / 24.4% / avg pos 13.1** (previous reading 20 / 82 /
  24.4% / 12.70 on a window one day earlier — not a regression). **7d 2026-10-31 →
  11-06: 1 click / 11 impressions / 9.1% / 16.3**; query rows `btc500` 1/4 @1.50,
  `bitcoin 500` 0/1 @67.00; page rows `/` 1/11 @16.3, `/articles/bip-110-rejection`
  0/3 @2.0, `/bitcoin-500-day-cycle` 0/2 @1.5.
- **Cluster rows (`cluster-read-1108`, closed 2026-11-08):** none of the four
  target queries appears in either window — 7d has 2 query rows, 28d has 5
  (`btc500` 5/27 @3.00 · `bit 500` 0/1 @95.00 · `bitcoin 500` 0/2 @54.00 ·
  `bitcoin plus 500` 0/2 @20.50 · `btc 500` 0/1 @63.00). Closure stands.
- GA4 7d 2026-11-02 → 11-08: **50 sessions / 18 users / 10 new / 59 views / 34.0%
  engaged**; channels 37 direct / 4 AI Assistant / 4 organic / 3 referral /
  3 unassigned. Referral = `github.com` 3, **lopp.net 0**. −46.2% against the
  previous 7d window and −51.5% against 103 on 2026-10-30. `sessions` is not a
  positive signal (`sessions-honest-1109`). The pillar's 9 landing sessions are
  not new traffic: the 11-08 reading had 6 and the 28d window 21.
- Production 200s: `/`, `/bitcoin-500-day-cycle`, `/articles/bip-110-rejection`,
  `/articles/bear-market-accumulation`, `/sitemap.xml` (21 locs), `/robots.txt`,
  `/data/500-day-cycles.json`, `/btc-usd-max.csv`. At 04:05Z the CSV still ended
  2026-11-07 and the dataset reported `lastDate: "2026-11-07"`, because the
  runner's 2026-11-08 archive commit (`82776de`) was unpushed; pushed 06:08Z, the
  deploy landed **06:11:56Z** and both now read **2026-11-08** — `last-deploy.json`
  replayed against production: 5 of 5 checks pass.

## Session 2026-11-09 (04:00Z) — archive-only: no post-merge crawl, date moved

Preflight: archive refreshed to 2026-11-08 (1 row appended, 0 dropped, overlap
median 0%), 0 experiments open, review 2026-11-07 `failing` (streak 15), site
200/200. Freeze held, provable: `git diff --stat 62e3a8a..HEAD -- src
public/sitemap.xml` → **empty**.

- **`lopp-merge-watch-1114` — executed (daily channel check).**
  `GET /repos/jlopp/lopp.net/pulls/1267` → `state: closed`, `merged: true`,
  `merged_at 2026-11-07T20:20:30Z`, `comments: 0`. The live page still carries
  `<a href="https://btc500.net/bitcoin-500-day-cycle" … rel="noopener">BTC500</a>`
  with **0 `rel="nofollow"`**. First crawl after the merge: **none** (pillar
  `lastCrawl` 2026-11-07). lopp.net referral sessions: **0** in the 7d window,
  which covers ~27h post-merge — too early, not a zero verdict.
- **`sessions-honest-1109` — printed above**; no positive claim about sessions.
- **`cluster-read-1108`** — closed 2026-11-08; re-read today, still absent, not
  reopened.
- **`runner-mid-run-edit-1108` — skipped, owner-only.** A cycle writing
  `run-*.sh` mid-run is exactly what aborted 2026-11-07; the split of
  `dirty_paths_note()` and the missing 2026-11-07 status row are the owner's.
- **No site change, no new destination.** #1267 merged 32h ago; its effect is the
  only thing that can move the gate, and a second pack now would repeat the
  prepared-but-unsent substitution and contaminate the one clean measurement.
- **X (distribution, not a site change):** the Monday countdown was published
  from the live model — `20 Days until 500 days before halving #Bitcoin…buy Nov
  29, 2026 — the current block-height estimate`, verified on the profile at
  2026-11-09T04:06:07Z. Yesterday's post also read "20 Days" because the estimate
  itself slid one day: N must be read from the site at post time, never copied
  from the previous post.

## Session 2026-11-08 (04:00Z) — archive-only: the link merged; the cluster closes

#1267 verified **merged 2026-11-07T20:20:30Z** (merge commit `4585231c`, 1 file,
+1/−0, 0 comments) and the destination page verified to carry the followed anchor
— the first followed external link in the site's history. `cluster-read-1108`
executed: all four target queries absent at indexed 1/21 → **the 500-day cluster is
closed as unservable** (no copy edit to `/` or the pillar through 2026-12-31).

## Session 2026-11-05 — `indexed-decision-1105`: the indexation line closes

No in-repo indexation work without an external referring link; `indexed` target
retired, backlog rows 5–7 deleted. Freeze held (docs only, `257a504`).

### History

- **11-06** — archive-only: ask re-verified unsent at 18:38Z; PR #1267 appeared at
  18:54Z, after that commit. Insertion point corrected to `BitInfoCharts`/`CME
Futures`; apex→www 301 documented.
- **11-04** — two destinations qualified; lopp.net the only followed one.
- **11-03** — awesome-bitcoin withdrawn (0 of 2 closed unmerged).
- **11-02** — X retired (no account); CoinDesk re-routed to `contact@coindesk.com`.
- **11-01** — CoinDesk (08-05), Yahoo Finance (06-24) and Investing.com (08-06) all
  ran the 500-day rule with our date; the declined pillar serves 3,004 raw-HTML
  words, so the gap is authority, not markup.
- **10-30 → 10-31** — `5aad29f` changed the homepage and pillar title/meta/H1/copy
  after three mandates forbade it → **full freeze**; the index fell 3 → 2 with
  nothing in the repo changing.
- **10-22 → 10-29** — declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                 |
| ---------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-07 | daily | failing | `runner-mid-run-edit-1108` (owner); `cluster-read-1108` (due today); `lopp-merge-watch-1114` (read #1267 every cycle); `sessions-honest-1109`. Streak 14                                                       |
| 2026-11-06 | daily | failing | `lopp-net-pr-current-lines-1108` (owner); `outreach-stop-1107`; `cluster-read-1108`; `dirty-tree-guard-1107`; `runner-honesty-1108` (owner). `shipped` redefined as a diff touching `src/`/sitemap (streak 13) |
| 2026-11-05 | daily | failing | `lopp-net-pr-send-1106` (owner); `ask-gate-1107`; `cluster-read-1108`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` is the only gate (streak 12)                     |
| 2026-11-04 | daily | failing | Indexation line closed on 11-05 (1/21); lopp.net ask; CoinDesk lapsed (429); awesome-blockchain withdrawn; #1009 failed; collector must not quote `--limit` inspections                                        |
| 2026-11-03 | daily | failing | CoinDesk email at 60 words; awesome-bitcoin withdrawn (0/2); destination needs a merge record; GitHub links are nofollow                                                                                       |
| 2026-11-02 | daily | failing | CoinDesk re-routed to `contact@coindesk.com`; X retired; cluster read 11-08; indexation decision; runner guard re-issued                                                                                       |
| 2026-11-01 | deep  | failing | CoinDesk email + X restated; inspection; soft-404 diagnosis; channel-verified ask line; owner mandate for the runner                                                                                           |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID                                                                                                                       |

---

## Next priorities

0. **Full freeze stands.** Gate = a GA4 referral session from a non-github domain
   (`externalReferringDomains > 0`); still 0. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Watch the merge work — the only live signal.** Each cycle until 2026-11-14:
   re-inspect `/bitcoin-500-day-cycle` and record `lastCrawl`; **the first crawl
   after 2026-11-07T20:20:30Z is the test** (the 11-07T03:42:34Z crawl predates
   the merge by 16h38m). Then `npm run referrals`; one lopp.net session lifts the
   gate. If Google recrawls and still declines with a followed link on lopp.net,
   the authority hypothesis is falsified and the next lever is a second
   destination, not more waiting.
2. **The 500-day cluster is closed as unservable** (2026-11-08 mandate): no copy,
   title, meta or section edit to `/` or `/bitcoin-500-day-cycle` through
   2026-12-31. Reopening needs a measured change — a cluster query reappearing or
   the pillar being indexed — not a new argument.
3. **The buy-window peg is a live estimate, now 29 November 2026** (it read 28
   November on 2026-11-08 at height 974,836; today 29 November at 975,127). `/` and
   `/bitcoin-500-day-cycle` agree and both answer 200. Re-read the date from the
   site every cycle — never from this log, and never from an older post. Article
   bodies date body copy to 30 November 2026 and the X bio says Nov 30: a one-day
   gap, not fixed while the freeze holds.
4. **Owner mandates, not cycle work:** `runner-mid-run-edit-1108` (split
   `dirty_paths_note()`, restore the missing 2026-11-07 status row).

## Ranked backlog

Only rows 0–2 are permitted work. Rows 3–4 are readings. Rows 5–7 were deleted on
2026-11-05 (`indexed-decision-1105`).

| #   | Bet                                                                 | Why it can move the needle                                                                                                                      | I   | E   |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | `lopp.net` → Charts & Metrics (**MERGED 2026-11-07T20:20:30Z**)     | **First followed external link**, pointing at the declined pillar. Effect measurable only as a post-merge crawl and a lopp.net referral session | 10  | 0   |
| 1   | CryptoQuant Quicktake (**prepared 11-04, never sent**)              | Community feed, exact audience fit, no editorial gate; needs an account; followed status unverified. Second in line — do not re-prepare         | 6   | 3   |
| 2   | ~~CoinDesk~~ / ~~awesome-bitcoin~~ / ~~awesome-blockchain~~ / ~~X~~ | Lapsed (429), withdrawn (0/2, nofollow), withdrawn (never sent), retired (no account). None restated                                            | —   | —   |
| 3   | Cluster query reading (**done 2026-11-08 — closed**)                | All four queries absent in both windows at indexed 1/21 → framing closed, not restated                                                          | —   | —   |

## Open issues

- **The pillar has never been crawled with an incoming external link.** Crawl
  history: 2026-10-22, 11-05, then **2026-11-07T03:42:34Z** — every one declined,
  every one before the merge. The next crawl is the first measurement of the
  freeze hypothesis with the missing input present. Until it happens, "waiting
  does not index a page nobody links to" is still unfalsified, not confirmed.
- **Indexation: 6 (10-22) → 5 → 3 → 2 (10-31) → 1 (11-04) → 1/21 (11-05, 11-06
  twice, 11-07, 11-08, 11-09)**, denominator 21 = sitemap locs. 5% coverage; 14
  crawled-not-indexed, 5 unknown, 1 Soft 404. Only `/` is indexed.
- **The buy date is live-derived and has moved Nov 28 → Nov 29 with no deploy.**
  Nothing is wrong with that — the model projects from live block height and the
  homepage says the date moves — but three surfaces now disagree by a day: site
  (29 Nov), dated article bodies (30 Nov), X bio (30 Nov). The 11-08 manifest
  check `contains "November 28, 2026"` would fail today; date-bearing manifest
  tokens are now banned (they can only verify a deploy for the hours the estimate
  holds).
- **`lopp.net` is www-only from a scripted fetch** — `https://lopp.net/…/trading.html`
  → 301 → `www` (200). Canonical-host redirect, not a removed page.
- **Ask routes: the only live ask is resolved.** 10 asks handed over since
  2026-10-27, 4 carried out, #1267 merged 2026-11-07. **0 sessions from any
  non-github referrer in every reading.** A `sent` cell is verified against the
  channel, never against this file.
- **A destination needs a merge record, not stars** (awesome-bitcoin: 1,358 stars,
  0 of 2). #1267 satisfies this for the first time.
- **`referral-sessions` green is a self-referral** — `github.com` is this repo and
  the owner's browser. Only a non-github referring session counts.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a 2026-08-08 crawl; serves 200, 1,383 words, no pillar duplication.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day query table sums
  to 33 of 132 byPage impressions).
- **The homepage's GSC `referringUrls` includes `domainsc.com/page-…html`.** Fetched
  2026-11-08: a parked "domain may be for sale" page, 0 occurrences of `btc500`.
  Stale/disavowed — do not count it as a referring domain.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f` changed
  title/meta/H1/copy hours after three mandates forbade it. A `MANDATES` line needs
  a sha plus the diff.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`;
  dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive, due experiments, site health) → attempt
→ `npm test` + `tsc` gate → Vercel status → `last-deploy.json` against live HTML.
Map: `scripts/autonomous/ARCHITECTURE.md`.
