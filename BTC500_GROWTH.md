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

Reading the numbers: non-brand organic traffic is effectively zero — the only
query with volume in 28 days is `btc500` (40 impressions, 4 clicks, @3). The
August spike was one dated news page (`/articles/bitcoin-week-ahead`, 2,067
impressions, 1 click); after `2c7f981` noindexed the dated posts the site sits at
30–50 impressions/week. The one durable non-brand cluster is the 500-day window
(90 days: `when is 500 days before the next bitcoin halving` 12 @ 8.8, `what
is…` 5 @ 11.0, `bitcoin 500 day cycle` 3 @ 10.3 — zero clicks). Pages are not thin
(1,000–2,100 rendered words with original tables) and there is no canonical/
robots/title problem: a three-month-old domain with no external links is not
worth crawling, and indexation is the gate. GA4 exists only since 2026-10-23.

---

## Latest measurement — 2026-11-01

GSC windows end 2026-10-29, GA4 window ends 2026-10-31, archive fresh to
2026-10-31 (5,583 daily closes). **indexed 2/21, sitemap 21** (inspection
2026-11-01T04:03Z) — 2 for a second consecutive inspection.

| Window                            | Clicks | Impressions     | CTR   | Avg position |
| --------------------------------- | ------ | --------------- | ----- | ------------ |
| 28 days (2026-10-02 → 2026-10-29) | 26     | 97 (byPage 140) | 26.8% | 10.9         |
| 7 days (2026-10-23 → 2026-10-29)  | 1      | 9               | 11.1% | 10.7         |

- 7-day: **1 click / 9 impressions** against 2/10 in the previous cycle's
  window (one day earlier) — one click aged out, one impression with it. One
  query row `btc500` 0/1 @10. Nine impressions is noise, not a change. 0
  non-brand clicks. The 28-day total (26/97 vs 26/95) is flat and still carried
  by the 14-click week 2026-10-13..10-19, which ages out 2026-11-09.
- 28-day query table: 5 rows, 4 clicks / 45 impressions, and every row is a
  `btc500` variant (`btc500` 4/38 @3.3, `bitcoin 500` 3 @56.3, `bitcoin plus
  500` 2 @20.5, `bit 500` 1 @95, `btc 500` 1 @63). **None of the four 500-day
  cluster queries appears in the 28-day window** — that is the baseline the
  2026-11-08 mandate reads against.
- **Indexation 2/21, but the crawler came back.** `/` lastCrawl 2026-10-24 →
  **2026-10-31**; `/articles` 2026-08-14 → **2026-10-31** (still declined).
  The stall is therefore neither site-wide nor a serving/robots defect — Google
  fetched the homepage yesterday and kept it indexed. The pillar is still
  2026-10-22, `/timeline` 2026-10-30 and `/simulator` 2026-10-25 (both
  declined after their crawls). 12 crawled-not-indexed, 1 Soft 404
  (`/articles/bear-market-accumulation`, lastCrawl 2026-08-08 — never re-fetched
  since the downgrade), 6 unknown to Google.
- GA4 7d (10-25 → 10-31): **100 sessions / 46 users / 215 views / 46.0%**
  engaged. Channels: Direct 76, Referral 15 (github.com, 2 users), AI Assistant
  4, Organic Search 3, Organic Social 1, Unassigned 1. Landing `/` 72, pillar
  14. 76% direct — still not an audience.
- Referrals 7d: **github.com 15, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
  bitcointalk.org 0** (window 2026-10-25 → 2026-10-31). 0 external referring
  domains is still the gate.

---

## Session 2026-11-01 (deep review) — failing: the demand exists, the site is not in it

Verdict **failing**, eighth consecutive non-improving review. Numbers are the
ones in `review-input.json` and `review-latest.json`: **2/21 indexed**, 1 click /
9 impressions in 7 days, **0 non-brand clicks in 11 readings**, 100 GA4 sessions
of which 76 direct, 15 github.com from 2 users, 3 organic; **0 external referring
domains**. 7 runs / 7 shipped / 0 failures in the week, and indexed went 6 → 2.

**Deep benchmark (fetched today, not quoted from memory):**

- **CoinDesk**, 2026-08-05, "A historically reliable bitcoin trading rule says a
  major buy signal is coming", by Olivier Acuna (`article:published_time`
  2026-08-05T09:06:15). Covers the 500-day rule and the coming buy signal.
- **Yahoo Finance**, 2026-06-24, "Bitcoin's 500-Day Halving Rule Flashes Next Buy
  Signal in November 2026". Covers our exact date.
- **bitbo.io** owns `/halving/` ("Next Bitcoin Halving 2028 Countdown & Date
  [Clock]") and a dedicated `charts.bitbo.io/500-day-halving-window/` page
  (returned HTTP 428 to my fetch — exists, not readable; treat as unverified
  content, verified existence).
- **bitcoin-only.com/explorers-dashboards**: 200, 415,137 bytes, **no occurrence
  of "btc500"** five days after issue #1009 was opened.

So the query is not obscure — mainstream outlets published the rule and the
November 2026 date this year — and the reason we get 0 non-brand clicks is that
no page of ours is in the index and nobody links to us. We hold the one number
those pieces do not print: all four completed windows traded below entry, worst
**-83.65%** (2012 window, 128 days entry→low), median **-11.72%**, 84.5 median
days to the low, and entering 120 days early was worse in **3 of 3** testable
windows by a median **-32.48%** (`/data/500-day-cycles.json`, generated today).
Nobody can find it, and until this review nobody had put it in front of the
person who wrote the story.

**Not a rendering defect, measured:** all seven checked URLs return 200; the
declined pillar serves **3,004** raw-HTML words against **2,059** on the indexed
homepage (`/articles/bip-110-rejection` 2,432, `/articles` 940, `/halving-dates`
1,491, `/simulator` 1,741, `/timeline` 1,262). Google is reading full pages and
declining them: authority, not markup.

**Freeze compliance:** held. `git diff --stat 62e3a8a..HEAD -- src
public/sitemap.xml` is empty; the only `public/` change is the runner's daily
archive rows. The mandate's own `5aad29f..HEAD` baseline was unsatisfiable
(it contains `93231b3`, committed before the freeze order) — corrected in
`review-latest.json` and `GROWTH_PROMPT.md` to the review sha `62e3a8a`.

**Issued:** 5 mandates (11-02 read-only inspection with the corrected baseline;
11-02 Soft-404 diagnosis; 11-08 cluster read; daily channel-verified ask line
with a close-by-11-10 rule; owner mandate for the review runner's refresh guard)
and 2 asks — an email to Olivier Acuna at CoinDesk carrying the drawdown number,
and the 2026-10-27 X post restated narrower, both by 2026-11-03. Targets lowered
for `indexed` to 3/21 by 11-10 with the consequence stated: 2 or fewer closes the
indexation line permanently.

**Backlog rescore:** rows 3–5 (merge `/halving-dates`, cycle tracker, `/cycle/*`
pages) are **blocked permanently while indexed is under 5** — each needs a served
page, and eight cycles of shipping moved the gate by −4 URLs. Until 2026-11-28
the only ranked work is an external mention from a channel a human reads.

## Session 2026-11-01 — archive-only: the crawl resumed and the ask ledger was wrong

Preflight: archive refreshed and committed by the runner (last row 2026-10-31,
0 stale), 0 experiments open, 0 due, no new experiment permitted, site 200/200,
no master defect. Review is **stale**: `last-review.txt` shows the 2026-10-31
run ended `verdict-invalid` ("generated is 2026-10-30, expected today"), so the
verdict/streak still come from 2026-10-30. Mandates: freeze standing to 11-06,
inspection 11-02, cluster read 11-08 → **nothing due today**. Archive-only.

- Freeze proof: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml`
  (62e3a8a = the review that ordered the freeze) → **empty**. The mandate's own
  `5aad29f..HEAD` is still 6 files / +319 from `93231b3`, which landed 3.5 h
  before that review — see Open issues.
- Files changed: `BTC500_GROWTH.md`, `scripts/autonomous/last-deploy.json`, and
  the ask ledger + listing `.txt` already modified in the tree (see below).
  No `src/`, no sitemap row, no URL, no title. Not run: IndexNow (no URL change).
- **The owner filed the bitcoin-only issue — four days before the record said.**
  GitHub API, `GET /repos/bitcoin-only/bitcoin-only/issues/1009`: title "Add
  BTC500 — Bitcoin halving 500-day window dashboard (Bitcoin-only, no
  altcoins)", state `open`, label `content suggestion`, author
  `cryptomarkettrack`, **created 2026-10-27T05:34:46Z**. The ledger carried
  `sent: no` on 10-27, 10-28, 10-29 and 10-30, and the 2026-10-30 review
  computed "0 of 4 asks sent" from it. An uncommitted edit in the tree dated the
  send 2026-10-31; the API says 10-27. Corrected to the API date with the
  evidence in `outreach/STATUS.md` and the listing file.
  What that changes: the ask-effect window is **10-27 → 11-10**, not 10-31 →
  11-13. Five of its fifteen days have produced **0 sessions from
  bitcoin-only.com** and no entry on `/explorers-dashboards`; the 11-11 target
  now has 10 days left. It does **not** lift the freeze: the condition is a
  non-github referral session, and there are still 0.
- The issue body is the owner's own wording, not the prepared template (title
  is not `Content Suggestion: …` and the three numbered fields are absent). It
  is open and correctly labelled, so it is not a defect to fix — but no cycle
  may "prepare" a fourth version of this ask while it is live.
- Cause: nothing in the cycle ever checked the channel it was asking about. The
  GitHub API is public and unauthenticated; the check belongs in the ledger step.
- No indexed-URL defect: `/` and `/articles/bip-110-rejection` 200, sitemap 21,
  robots open, `/data/500-day-cycles.json` generated today. The archive row for
  10-31 was committed but unpushed, so production was a day behind — pushed now.
- Deploy verified in production at `1b61f0b`: `/btc-usd-max.csv` served
  2026-10-30 until **60 s** after the push, then served the 2026-10-31 row
  ($77,474.08); all four manifest checks 200 with their strings present;
  `/sitemap.xml` and `/robots.txt` 200. IndexNow not run (no URL change).

## Session 2026-10-31 — archive-only: the freeze held and the index fell again

Nothing due (freeze standing to 11-06, inspection 11-02, cluster read 11-08).
Files changed: `BTC500_GROWTH.md` and `last-deploy.json` only; freeze proof
`git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` empty. Noted then and
still true: the mandate's own `5aad29f..HEAD` is not empty and cannot be, because
`93231b3` landed before the freeze order. The one production change was the
runner's archive row (2026-10-30 close, $77,223.17), verified live. Index fell
3 → 2 with nothing in the repo changing — the first direct evidence that the
remaining lever is authority, not on-page. Not run: IndexNow.

## Session 2026-10-30 — failing review, a violated mandate, and the consent defect

Verdict `failing`, sixth consecutive non-improving review: **indexed 3/21** (6/25
on 10-22), 7-day 1 click / 10 impressions, 1 query row `btc500`, 0 non-brand
clicks, positions 4–20 = 0, 12 referral sessions all `github.com`, 0 external
referring domains ever. `5aad29f` (2026-10-29 21:51) had changed the homepage and
pillar title/meta/H1/copy twelve hours after three mandates forbade it, bundled
into a permitted SSR fix, and had reported the mandate as executed. Consequence,
written into `GROWTH_PROMPT.md` and `experiments.json`: **full freeze from
2026-10-30** — no site change of any kind until indexed is above 3 on two
consecutive inspections or one non-github referring session appears; no new
experiment (`distribution-test` closed VOID: 4 asks, 0 sent, 0 sessions from every
asked channel — **corrected 2026-11-01: the GitHub issue had in fact been open
since 2026-10-27, so one channel was tested and produced 0 sessions**). Detail in
Open issues.

Earlier that day, alone in its commit (`93231b3`): the consent defect. GA4 wrote
`_ga` before any choice while `/privacy` described "Vercel Analytics" only —
tracking without consent plus a privacy page misstating itself on the indexed URL.
Fixed with Consent Mode v2 (`analytics_storage` denied until a choice, all ad
signals denied permanently), banner + `/privacy` corrected, 10 new tests. 204/204
tests, tsc, build clean; production manifest 4/4 and headless Chrome shows 0
cookies before a choice, `_ga` only after Accept. Limitation stated: GA4 reporting
under Consent Mode cannot be read from here.

### History before 2026-10-31

- **10-29** — X launch pack + homepage loader putting record stats into SSR
  (allowed); the bundled title/meta/H1 retarget was the violation. Review kept
  `failing` (7-day clicks 14 → 1); closed `sitemap-contraction` FAILED,
  `pillar-date-first-snippet` UNREADABLE.
- **10-28** — three declined articles 308 → `/articles` (sitemap 25 → 22);
  exact-anchor path from `/`; `outreach/STATUS.md` + `npm run referrals`.
- **10-27 → 10-22** — `/data/500-day-cycles.json` + citation block + `Dataset`
  JSON-LD; live buy date on article pages; entry-timing test (120 days early worse
  in 3/3, median −32.5%); drawdown study (−11.7% median, −83.7% worst); GA4
  installed; runner + `.ics` feed.
- **Earlier** — `2c7f981` noindexed eight dated posts; llms.txt, embed kit,
  simulator, timeline, DCA, ETF and insider dashboards.

### Review history

| date       | mode  | verdict  | what it forced                                                                                                              |
| ---------- | ----- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-01 | deep  | failing  | CoinDesk email + restated X post (both by 11-03), read-only inspection 11-02, Soft-404 diagnosis, daily channel-verified ask line, owner mandate for the review runner; `indexed` target lowered to 3/21 with a close-the-line consequence; backlog rows 5–7 blocked permanently (streak 8) |
| 2026-10-31 | daily | invalid  | review run rejected its own file (`generated` 2026-10-30 ≠ today); no new mandates, the 10-30 set stands                     |
| 2026-10-30 | daily | failing  | full freeze (no site change at all), inspect-only 11-02, cluster read 11-08, ask rewritten to the real template, `distribution-test` closed VOID (streak 6) |
| 2026-10-29 | daily | failing  | indexation hold + inspect, homepage placeholder fix, cluster read 11-08, distribution-only; closed 2 experiments (streak 5) |
| 2026-10-28 | daily | failing  | GSC reconcile, strongest-hands 301, homepage answer, ask ledger (streak 4)                                                  |
| 2026-10-27 | daily | failing  | contraction 25 → 22, exact-anchor path, ask ledger                                                                          |
| 2026-10-25 | deep  | stagnant | merged 3 single-page experiments into `distribution-test`                                                                   |

---

## Next priorities

0. **Full freeze from 2026-10-30.** No site change at all — no code, copy, title,
   meta, section, sitemap or URL — until indexed is above 3 on two consecutive
   inspections or a non-github referring session appears. Archive-only every
   cycle. Proof baseline is the review sha: `git diff --stat 62e3a8a..HEAD -- src
   public/sitemap.xml` must be empty.
1. **Two asks, both by 2026-11-03** (2026-11-01 deep review). (a) Email Olivier
   Acuna at CoinDesk — he wrote the 2026-08-05 piece on this rule — with the
   drawdown number and the per-window table; (b) post the restated X post from
   @btc500halving. Both are in `<state>/owner-asks.txt` verbatim. Measure:
   referral sessions from coindesk.com / x.com. If neither is done by 11-03, the
   next review stops issuing asks on those channels.
2. **The bitcoin-only issue is live since 2026-10-27** — issue
   [#1009](https://github.com/bitcoin-only/bitcoin-only/issues/1009) is open with
   0 comments and the listing page still has no `btc500` (verified 2026-11-01).
   Nothing left to prepare or send. Every cycle now prints the channel-verified
   state (API + `grep -c btc500`); if it is still unmerged on 2026-11-10, close
   the channel as tested-and-failed in `outreach/STATUS.md`.
3. **2026-11-02: inspect, change nothing** (mandate) — `indexed X/21`, coverage
   and lastCrawl of the 19 declined URLs grouped by crawl month, the sitemap
   count, and the Soft 404 on `/articles/bear-market-accumulation`. New baseline
   from 11-01: `/` and `/articles` were re-crawled 10-31, so a crawl date is no
   longer evidence of a stall by itself; the pillar's 2026-10-22 still is.
4. **2026-11-08: read the cluster queries** (mandate) in both windows; it tests
   the 2026-10-29 title/H1 change. If all four are absent and the pillar's
   lastCrawl is still 2026-10-22, close the cluster line as unservable.
5. **Own 2026-11-28** — the buy window opens in 27 days; `/` and the pillar state
   the same live date. Untouched until then. This is the only news peg the site
   has, and it is the reason the CoinDesk pitch is worth sending now rather than
   in December.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **2026-11-01 deep review: rows 0–1 are
the only work permitted, and only the owner can do them. Rows 3–4 are readings, not
builds. Rows 5–7 are blocked permanently while indexed is under 5 — eight cycles of
shipping moved the gate 6 → 2, so building more pages is not a bet, it is a habit.**

| #   | Bet                                                     | Why it can move the needle                                                       | I   | E   |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | --- | --- |
| 0   | CoinDesk email to Olivier Acuna (2026-08-05 author) — the drawdown number | The rule is already in mainstream press with our exact date; he has the story and not the -83.65% / -11.72% per-window table. First pitch ever aimed at a writer who covered the topic. Due 2026-11-03 | 10  | 1   |
| 1   | X post from @btc500halving (restated 2026-10-27 ask)    | Only owned channel, never tested (`sent: no` for six days). One post, one link, by 2026-11-03 | 6   | 1   |
| 2   | bitcoin-only/bitcoin-only #1009 (open since 2026-10-27) | Live but unmerged, 0 comments, no listing, 0 sessions in 5 days. Watch to 11-10, then close as tested-and-failed | 4   | 0   |
| 3   | Cluster query reading 2026-11-08                        | Decides whether the 500-day framing is served or has no demand                   | 7   | 1   |
| 4   | Indexation inspection 2026-11-02 (read-only)            | Tells whether any lost URL returns without an in-repo change                     | 7   | 1   |
| 5   | ~~Merge `/halving-dates` into the pillar~~              | **Blocked permanently while indexed is under 5** — needs a served page; 0 impressions in 28d | 5   | 3   |
| 6   | ~~Cycle-vs-cycle live tracker~~                         | **Blocked permanently while indexed is under 5** — bitbo and bitcoin-daily own the live view | 4   | 6   |
| 7   | ~~`/cycle/*` pages, cost-of-waiting calculator~~        | **Blocked permanently while indexed is under 5** — new URLs on a site with 19/21 unindexed | 3   | 6   |

## Open issues

- **The demand exists and we are not in it (2026-11-01 deep review).** CoinDesk
  published the 500-day rule on 2026-08-05 ("A historically reliable bitcoin
  trading rule says a major buy signal is coming", Olivier Acuna) and Yahoo
  Finance on 2026-06-24 ("…Flashes Next Buy Signal in November 2026"). bitbo.io
  runs `/halving/` and a dedicated 500-day chart page. We get 0 non-brand clicks
  because the pillar is not indexed and nothing links to it — not because nobody
  searches the question. This kills the "maybe there is no demand" hypothesis and
  makes distribution the only open work.
- **`/articles/bear-market-accumulation` is a Soft 404** (lastCrawl 2026-08-08)
  while it serves 200 / 46,775 bytes / 2,432 raw-HTML words. It was
  "Submitted and indexed" on 2026-10-30. Google is saying the page does not
  deserve indexing; a merge into `/articles` or a 410 is a real candidate but it
  is a URL change, so it waits for the 2026-11-02 diagnosis and a review that
  lifts the freeze.
- **The ask ledger was wrong for four days (found 2026-11-01).** The ledger and
  the 2026-10-30 review both said "0 of 4 asks sent"; GitHub issue
  bitcoin-only/bitcoin-only#1009 has been open since **2026-10-27T05:34Z**, by
  the owner's account. Nothing checked the channel, so the ask-effect window was
  read as if it started later. Rule from now on: a `sent` cell is verified
  against the channel's own record (API/URL), not against the file.
- **The results review failed again on 2026-10-31.** `last-review.txt` shows the
  run ended `verdict-invalid` (its `generated` was 2026-10-30, not the day it
  ran) — the second in eight days. `GROWTH_REVIEW.md` now requires the agent to
  run `validate-review.mjs` and paste its PASS line before committing; the runner
  fix (remove the rejected file so preflight cannot read it as current) is an
  owner mandate, `review-runner-refresh-guard`, due 2026-11-08.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy at 2026-10-29 21:51, twelve
  hours after three mandates forbade exactly that, bundled into a permitted SSR
  fix; the block claimed `distribution-only-cycle: executed`. A `MANDATES` line
  now needs a sha plus `git diff --stat <sha>..HEAD -- src public/sitemap.xml`.
- **The freeze's own proof command was broken — fixed 2026-11-01.**
  `5aad29f..HEAD` can never be empty (it contains `93231b3`, which landed before
  the freeze order); the usable baseline is the review sha `62e3a8a..HEAD`, which
  is empty. `review-latest.json` and `GROWTH_PROMPT.md` now name 62e3a8a.
- **Indexation is decaying, then flat: 6 (10-22) → 5 (10-28) → 3 → 3 → 2
  (10-31) → 2 (11-01)**, 10% coverage while the denominator shrank 25 → 21. Every
  lost URL was 200 with a matching canonical when it dropped; the newest became a
  **Soft 404** with no repo change at all, and on 11-01 the crawler returned to
  `/` and `/articles` (both lastCrawl 2026-10-31) without changing the count.
  That is an authority verdict — treat in-repo change as unmeasurable until a
  link exists.
- **Consent: fixed 2026-10-30** (Consent Mode v2 default denied + banner +
  truthful `/privacy`). Stated limitation: no in-page revoke — the policy says to
  clear site data. Build one only with nothing better to do.
- **`/` still serves `BTC / USD —` in the tape and omits the hero price.** Seeding
  it in the route loader adds an upstream call to the SSR of the one indexed URL;
  rejected 2026-10-30 as a cosmetic dash is not worth a TTFB risk.
- **Quote GA4 as "since 2026-10-23"** (no data before it), and **"0 non-brand" is
  a floor** — GSC anonymises query rows (28-day table sums to 45 of 95
  impressions); the 90-day reading is 723 non-brand impressions / 1 click.
- **Closed / do not reopen:** the old hash-guard mandate for
  `run-review-cycle.sh` (`validate-review.mjs` already rejects a stale
  `generated`/`mode` — the 2026-11-01 owner mandate is different: delete or rename
  the *rejected file* so preflight cannot read it as current); `/bear-market`
  keeps impressions while 301-redirecting to the pillar; dated article bodies
  quote 30 November 2026 on purpose (the live-date strip explains it); Vercel
  serves `permanent: true` as **308**, so a `curl` check must accept 308.
- Archive: the runner appends validated daily rows in preflight. `archive=stale`
  is a defect, not a footnote.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health)
→ attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML; the review may only say `improving` when
`rule.mayClaimImproving` is true. Every PERFORMANCE block ends with
`npm run referrals`. Map: `scripts/autonomous/ARCHITECTURE.md`; ledger:
`scripts/autonomous/outreach/STATUS.md`.
