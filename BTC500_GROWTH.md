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

## Latest measurement — 2026-11-08 (04:03Z)

**The first followed external link is live.** `jlopp/lopp.net#1267` was **merged
2026-11-07T20:20:30Z by jlopp** (merge commit `4585231c`, 1 file, +1/−0,
`comments: 0`). The destination page
`https://www.lopp.net/bitcoin-information/trading.html` (200) now contains
`<a href="https://btc500.net/bitcoin-500-day-cycle" … rel="noopener">BTC500</a> -
500-day cycle dashboard` — **0 `rel="nofollow"` on the anchor**. First input to the
indexation gate in the site's history; `externalReferringDomains` is still **0 as
measured** (GA4 referral sessions), so the freeze is not lifted yet.

- **indexed 1/21, sitemap 21** (inspection 2026-11-08T04:03:35Z, 21 rows, 0 failed
  to inspect): 1 indexed, 14 crawled-not-indexed, 5 unknown to Google, 1 Soft 404 —
  fifth consecutive 1/21. One URL changed since the 2026-11-07T07:32:25Z
  inspection: `/simulator` re-crawled (2026-10-25 → 2026-11-07), still declined.
  **The pillar was re-crawled 2026-11-07T03:42:34Z — 16h38m _before_ the merge —
  and declined again** (`Crawled - currently not indexed`, robots ALLOWED, fetch
  SUCCESSFUL, canonical match, `referringUrls` btc500.vercel.app/bear-market +
  /articles/solar-eclipse-bitcoin-halving). No crawl after the merge yet.
- GSC, both windows end 2026-11-05 (3-day lag; the merge is outside them):
  **28d 2026-10-09 → 11-05: 20 clicks / 82 impressions / 24.4% / avg pos 12.70**
  (previous reading 23 / 84 / 27.4% / 12.5 on a window one day earlier — the window
  slid, so this is not a regression). **7d 2026-10-30 → 11-05: 1 click / 11
  impressions / 9.1% / 16.8** (previous 1 / 9 / 11.1% / 20.6). `positions4to20` = 0.
- **Cluster raw rows (`cluster-read-1108`), as printed:**
  - 7d: `btc500` 1/4 @3.00 · `bitcoin 500` 0/1 @67.00
  - 28d: `btc500` 5/29 @3.14 · `bit 500` 0/1 @95.00 · `bitcoin 500` 0/2 @54.00 ·
    `bitcoin plus 500` 0/2 @20.50 · `btc 500` 0/1 @63.00
  - **All four target queries — `when is 500 days before the next bitcoin
halving`, `what is 500 days before the next bitcoin halving`, `bitcoin 500 day
cycle`, `500 days before next bitcoin halving` — are not present in either
    window.** With `indexed` at 1 ≤ 2 this executes the mandate's closure clause:
    **the 500-day cluster is closed as unservable**, and no copy edit is made to
    `/` or `/bitcoin-500-day-cycle` through 2026-12-31.
- GA4 7d 2026-11-01 → 11-07: **43 sessions / 16 users / 10 new / 57 views / 44.2%
  engaged**; channels 34 direct / 4 organic / 4 AI Assistant / 2 unassigned /
  **0 referral**. That is −58.3% against 103 on 2026-10-30. 28d: 162 / 62 / 303
  views / 45.1%; the only referrer is `github.com` (15 sessions / 2 users, this
  repo). **0 lopp.net sessions** — the link was live for under two hours of the 7d
  window, so this is too early, not zero as a verdict.
- Production 200s: `/`, `/bitcoin-500-day-cycle`, `/sitemap.xml`, `/robots.txt`,
  `/data/500-day-cycles.json`; `/btc-usd-max.csv` ends 2026-11-06 in production
  (the 2026-11-07 row was committed locally by the runner and pushed today).

## Session 2026-11-08 (04:00Z) — archive-only: the link merged; the cluster closes

Preflight: archive refreshed to 2026-11-07 (1 row appended, 0 dropped, overlap
median 0%), 0 experiments open, 0 due, site 200/200, review 2026-11-07 `failing`
(streak 14). Freeze held: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml`
→ **empty** (this commit touches only this log, `outreach/STATUS.md` and
`last-deploy.json`).

- **`lopp-merge-watch-1114` — executed; the answer changed.** PR #1267 is merged
  (recorded in `outreach/STATUS.md` with the API rows and the live anchor). The
  first post-merge crawl does not exist yet; the lopp.net referral line is 0 and
  too early. Owner ask `github-lopp-net-policy-comment-1113` is **resolved before
  its due date** — no comment, no action.
- **`cluster-read-1108` — executed** (raw rows above). Closure clause invoked.
- **`sessions-honest-1109` — printed** below; `sessions` is not cited as a positive
  signal anywhere in this commit.
- **No new destination prepared.** The 2026-11-07 rule allows preparation once
  #1267 is merged, but the 2026-11-06 review deleted the "one destination per
  cycle" requirement precisely because five prepared-but-unsent packs substituted
  for sends, and the review has named no new destination. A sixth pack today would
  repeat the substitution on the day the first link landed.
- **No site change** — deliberately. The pillar has never been crawled while an
  external followed link pointed at it; the clean test of the freeze hypothesis is
  an _unchanged_ page plus a link Google can follow. Editing it now would
  contaminate the only clean measurement the site has left.

## Session 2026-11-07 (04:00Z) — archive-only: the ask was sent, ledger corrected

`outreach-stop-1107` stop condition false (the PR existed), row set `sent: yes` and
the channel output quoted. `dirty-tree-guard-1107`: `dirty_paths_note()` verified
in a scratch repo; the runner then aborted at 06:17:24 (`line 339: syntax error`)
because that same script was edited mid-run — no 2026-11-07 status row. Owner
mandate `runner-mid-run-edit-1108`.

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
3. **The buy-window peg, 2026-11-28** — `/` and the pillar state 28 November 2026
   from a 2028-04-11 estimate at height 974,836 and both answer 200. Only news peg.
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
  twice, 11-07, 11-08)**, denominator 21 = sitemap locs. 5% coverage; 14
  crawled-not-indexed, 5 unknown, 1 Soft 404. Only `/` is indexed.
- **`lopp.net` is www-only from a scripted fetch** — `https://lopp.net/…/trading.html`
  → 301 → `https://www.lopp.net/…/trading.html` (200). Canonical-host redirect, not
  a removed page.
- **Ask routes: the only live ask is resolved.** 10 asks handed over since
  2026-10-27, 4 carried out, and #1267 merged on 2026-11-07. **0 sessions from any
  non-github referrer in every reading.** A `sent` cell is verified against the
  channel, never against this file.
- **A destination needs a merge record, not stars** (awesome-bitcoin: 1,358 stars,
  0 of 2). #1267 satisfies this for the first time.
- **`referral-sessions` green is a self-referral** — `github.com` is this repo and
  the owner's browser. Only a non-github referring session counts.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a 2026-08-08 crawl; serves 200, 1,383 words, no pillar duplication.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day query table sums
  to 35 of 136 byPage impressions).
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
