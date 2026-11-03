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

## Latest measurement — 2026-11-03

GSC windows end 2026-10-31 (3-day lag), GA4 ends 2026-11-02, archive fresh to
2026-11-02 (5,585 closes; the row is committed but not yet in production at
04:06). **indexed 2/21, sitemap 21** (inspection 2026-11-03T04:05:32Z) — 2 for a
fourth consecutive inspection (10-31, 11-01, 11-02, 11-03).

| Window                            | Clicks | Impressions     | CTR   | Avg position |
| --------------------------------- | ------ | --------------- | ----- | ------------ |
| 28 days (2026-10-04 → 2026-10-31) | 26     | 94 (byPage 141) | 27.7% | 10.5         |
| 7 days (2026-10-25 → 2026-10-31)  | 1      | 9               | 11.1% | 2.8          |

- 7-day **1 click / 9 impressions** vs 1/8 yesterday: one impression more, same
  click. Noise. 0 non-brand clicks in 13 readings.
- 28-day 26/94, 5 query rows, all `btc500` variants (`btc500` 4/36 @3.2). **None
  of the four 500-day cluster queries appears.** Page table: `/` 26/92 @10.6;
  pillar 0/4 @2.3, `/simulator` 0/4 @2.3, `/timeline` 0/4 @2.3 — the 11-08 read.
- **The pillar's `lastCrawl` is still 2026-10-22**, twelve days after the 10-29
  retarget. One URL was crawled _today_: `/articles/why-btc500-exists`, crawl
  2026-11-03, verdict `Crawled - currently not indexed` on the first fetch. The
  crawler is active and declining content on sight.
- GA4 7d (2026-10-27 → 11-02): **82 sessions / 41 users / 154 views / 46.3%**
  engaged, vs 46 sessions the previous 7d. Direct-led, not search — not growth.
- Referrals 7d (label now read from the report itself): **github.com 12, x.com 0,
  reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0**; 28d window is the
  `github.com 15` that the 2026-11-01 review misread as 7 days. 0 external
  referring domains is the gate. Freeze not lifted: indexed 2, no non-github
  session.

---

## Session 2026-11-03 — archive-only: both asks verified, one route was already tried

Preflight: archive refreshed (last row 2026-11-02, 0 stale), 0 experiments open, 0
due, site 200/200, review 2026-11-02 (`failing`, streak 9) with one mandate due
today. Freeze held — `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` →
empty.

**`ask-verify-1103` — executed against both channels.** (a) awesome-bitcoin:
`GET /search/issues?q=author:cryptomarkettrack+repo:igorbarinov/awesome-bitcoin` →
**2 results, both closed unmerged, no open PR**. #201 created and closed
2026-07-27; #202 created 2026-07-27T19:17:40Z, **closed 2026-08-02T13:38:14Z,
`merged: false`, 0 comments**, one line added to `README.md` (Utilities) for
`btc500.vercel.app`. So the 2026-11-02 ask is **not sent**, and the route is not
untried: this list already declined a BTC500 line in its own format, silently.
(b) coindesk.com: **0 sessions** in the 7d (10-27 → 11-02) and 28d (10-06 → 11-02)
reports; the only referral row in either is `github.com` (12 / 15, 2 users). Both
rows keep `sent: no`; the 11-06 lapsed checkpoint stands.

**`referral-line-fix-1105` — executed (tooling, not a site change).** The window
label now comes from the report (`window.days`, else counted from
`start`/`end`), and `newestReport(dir, { days })` selects a report of the
requested length instead of the newest filename. `npm run referrals` →
`referrals 7d: github.com 12 … (window 2026-10-27 → 2026-11-02)`; `--days=28` →
`referrals 28d: github.com 15 …`; a missing window prints "not measured" and
exits 1. Regression test added for exactly the ordering that produced the wrong
number. The 2026-11-02 note deferring this "until the freeze lifts" was wrong —
the freeze covers `src/` and `public/sitemap.xml`, and the review said so.

No indexed-URL defect: `/`, `/articles/bip-110-rejection`,
`/articles/bear-market-accumulation`, `/sitemap.xml`, `/robots.txt` and
`/data/500-day-cycles.json` all 200; `/` states 28 November 2026 and the pillar
states November 28, 2026 — same date, different format, no contradiction.
Nothing prepared, reworded or sent. IndexNow not run (no URL change).

## Session 2026-11-02 (review + archive-only) — failing, three read-only mandates

Ninth consecutive non-improving review (streak 9): indexed 6/25 (10-22) → 2/21,
0 non-brand clicks in 12 readings, 0 external referring domains, 6 asks handed
over since 10-27 and 1 sent. It retired the X ask (no account exists) and the
guessed CoinDesk address, re-routed the email to `contact@coindesk.com` (due
11-05), and replaced the X ask with a PR to `igorbarinov/awesome-bitcoin` (due
11-06) on the premise that a followed link had "never been tried" — today's
channel check shows that list already closed two BTC500 PRs unmerged.

The cycle's three mandates were reads. Inspection 2026-11-02T04:02:40Z: 2/21, 19
declined (12 crawled-not-indexed, 1 Soft 404, 6 unknown). Soft-404 diagnosis on
`/articles/bear-market-accumulation`: 200, 1,383 server-rendered words, 0 body
paragraphs duplicated from the pillar, 4 internal links — a five-week-old
verdict, not a content judgment. `ask-channel` caught the ledger: #1009 open
since 2026-10-27T05:34:46Z with 0 comments. Freeze proof empty.

### History before 2026-11-02

- **11-01** — `failing` (streak 8). Benchmark: CoinDesk 2026-08-05 (Olivier Acuna)
  and Yahoo Finance 2026-06-24 ran the 500-day rule with our date; the declined
  pillar serves 3,004 raw-HTML words, so the gap is authority, not markup. Proof
  baseline corrected from `5aad29f..HEAD` to `62e3a8a`; `indexed` target lowered
  to 3/21 by 11-10. Archive-only cycle: the crawl resumed (`/` 10-24 → 10-31,
  `/articles` 08-14 → 10-31) and indexed stayed 2/21 — neither site-wide nor
  robots. The owner had filed #1009 four days before the ledger said so.

- **10-31** — archive-only; freeze proof empty. Index fell 3 → 2 with nothing in
  the repo changing: first direct evidence the lever is authority.
- **10-30** — `failing`. `5aad29f` (10-29 21:51) changed the homepage and pillar
  title/meta/H1/copy twelve hours after three mandates forbade it, bundled into a
  permitted SSR fix → **full freeze from 2026-10-30**: no site change of any kind
  until indexed is above 3 on two consecutive inspections or a non-github
  referring session appears. Earlier, alone in its commit (`93231b3`): the consent
  defect (GA4 wrote `_ga` before a choice; `/privacy` said "Vercel Analytics" only)
  fixed with Consent Mode v2 + banner + truthful policy.
- **10-29** — X launch pack + homepage SSR stats (allowed); the bundled
  title/meta/H1 retarget was the violation. `sitemap-contraction` FAILED,
  `pillar-date-first-snippet` UNREADABLE.
- **10-28 → 10-22** — three declined articles 308 → `/articles` (sitemap 25 → 22),
  exact-anchor path, ask ledger; `/data/500-day-cycles.json` + citation block +
  `Dataset` JSON-LD, live buy date on article pages, entry timing (120 days early
  worse 3/3, median −32.5%), drawdown study (−11.7% median, −83.7% worst), GA4.
- **Earlier** — `2c7f981` noindexed eight dated posts; llms.txt, embed kit,
  simulator, timeline, DCA, ETF and insider dashboards.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                |
| ---------- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-02 | daily | failing | CoinDesk re-routed to `contact@coindesk.com` (by 11-05) + awesome-bitcoin PR (by 11-06); X retired; cluster read 11-08; indexation decision 11-10; `referral-line.mjs` fix; runner guard re-issued (streak 8) |
| 2026-11-01 | deep  | failing | CoinDesk email + restated X post (both by 11-03), inspection 11-02, Soft-404 diagnosis, daily channel-verified ask line, owner mandate for the runner; `indexed` target lowered to 3/21 (streak 8)            |
| 2026-10-31 | daily | invalid | run rejected its own file (`generated` 2026-10-30 ≠ today); the 10-30 mandates stand                                                                                                                          |
| 2026-10-30 | daily | failing | full freeze (no site change at all), inspect-only 11-02, cluster read 11-08, `distribution-test` closed VOID (streak 6)                                                                                       |
| 2026-10-29 | daily | failing | indexation hold + inspect, cluster read 11-08, distribution-only; closed 2 experiments (streak 5)                                                                                                             |

---

## Next priorities

0. **Full freeze from 2026-10-30.** No site change at all — no code, copy, title,
   meta, section, sitemap or URL — until indexed is above 3 on two consecutive
   inspections or a non-github referring session appears. Proof baseline: `git
diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Two live asks, both checkable (set 2026-11-02):**
   (a) email `contact@coindesk.com`, subject addressed to Olivier Acuna (the
   2026-08-05 author), due **2026-11-05** — the 2026-11-01 personal address is
   not published by the article and is retired; (b) one PR to
   `igorbarinov/awesome-bitcoin` → "Additional Resources", due **2026-11-06**.
   Verbatim in `<state>/owner-asks.txt`. Measure: `coindesk.com` referral
   sessions, and `indexed` 2/21 → ≥3/21. Send count to beat: **6 handed over, 1
   sent** since 2026-10-27. **Verified 2026-11-03: neither sent** — and the
   awesome-bitcoin list already closed two BTC500 PRs unmerged (#201 07-27,
   #202 08-02, 0 comments), so that route's prior record is 0 of 2, not untried.
2. **X is retired until an account is written down here.** `@btc500halving` has
   no public trace in search and produced no post in six days; asking again
   without a verifiable account is the loop that produced 0 sessions from x.com
   in every reading. If the owner has an account, record it first.
3. **bitcoin-only #1009 live since 2026-10-27** — open, 0 comments, `updated_at`
   == `created_at`, listing page still has no `btc500`. Close it as
   tested-and-failed on 2026-11-10 if unchanged.
4. **2026-11-08: read the cluster queries** in both windows; it tests the 10-29
   title/H1 change. If all four are absent and indexed is ≤2, close the cluster
   line as unservable and make no copy edit to `/` or the pillar through
   2026-12-31.
5. **2026-11-10: the indexation decision.** Target is 3/21; if it is 2 or fewer,
   the line closes permanently — no in-repo indexation work without an external
   link, ever — and rows 5–7 of the backlog are deleted rather than left blocked.
6. **Own 2026-11-28** — the buy window opens in 26 days; `/` and the pillar state
   the same live date. It is the only news peg the site has and the reason the
   CoinDesk email is worth sending now rather than in December.
7. **Watch `/articles/bear-market-accumulation` for a re-crawl.** If Google
   re-fetches and keeps the Soft 404, the merge case becomes real.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Rows 0–1 are the only work
permitted and only the owner can do them. Rows 2–3 are readings, not builds. Rows
5–7 are blocked while indexed is under 5 — eight cycles of shipping moved the gate
6 → 2, so building more pages is not a bet, it is a habit.** Rows 5–7 are deleted
on 2026-11-10 if indexed is 2 or fewer.

| #   | Bet                                                                   | Why it can move the needle                                                                                                                                                                                                                                                         | I   | E   |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | Email `contact@coindesk.com` for Olivier Acuna — the −83.65% drawdown | CoinDesk (2026-08-05), Yahoo (06-24), Investing.com (08-06) and pluang (08-05) all ran the rule; none ran the per-window drawdown. Due 2026-11-05                                                                                                                                  | 10  | 1   |
| 1   | One PR to `igorbarinov/awesome-bitcoin` (1,358 stars)                 | A followed link on a maintained list is the only input that has ever moved indexation; GitHub is the one channel the ledger proves the owner uses (#1009). Due 2026-11-06. **Prior record on this list: 0 of 2 — #201 and #202 closed unmerged, 0 comments (verified 2026-11-03)** | 5   | 1   |
| 2   | ~~X post from @btc500halving~~                                        | **Retired 2026-11-02** — no account found publicly, no post in six days, 0 sessions from x.com ever. Reopen only when an account is recorded in STATUS.md                                                                                                                          | 0   | 0   |
| 3   | bitcoin-only/bitcoin-only #1009 (open since 2026-10-27)               | Unmerged, 0 comments, no listing, 0 sessions in 6 days. Close on 11-10, do not extend                                                                                                                                                                                              | 3   | 0   |
| 4   | Cluster query reading 2026-11-08                                      | Decides whether the 500-day framing is served or has no demand                                                                                                                                                                                                                     | 7   | 1   |
| 5   | ~~Merge `/halving-dates` into the pillar~~                            | **Blocked while indexed is under 5** — needs a served page; 0 impressions in 28d                                                                                                                                                                                                   | 5   | 3   |
| 6   | ~~Cycle-vs-cycle live tracker~~                                       | **Blocked while indexed is under 5** — bitbo and bitcoin-daily own the live view                                                                                                                                                                                                   | 4   | 6   |
| 7   | ~~`/cycle/*` pages, cost-of-waiting calculator~~                      | **Blocked while indexed is under 5** — new URLs on a site with 19/21 unindexed                                                                                                                                                                                                     | 3   | 6   |

## Open issues

- **Ask routes: one unexecutable, one already tried twice, ledger wrong for four
  days (2026-11-01 → 11-03).** The CoinDesk ask named a personal address the
  article does not publish (it publishes none; the fetch returns 429); the X ask
  named `@btc500halving`, which a web search does not return. And the
  "never tried" awesome-bitcoin route was tried twice:
  `GET /search/issues?q=author:cryptomarkettrack+repo:igorbarinov/awesome-bitcoin`
  → 2 results, both **closed unmerged** — #201 (2026-07-27) and #202 (created
  2026-07-27, closed 2026-08-02, `merged: false`, 0 comments, `README.md` +1 for
  `btc500.vercel.app`) — and no open PR, so the 2026-11-02 ask is unsent. Rules:
  an ask must name a route that is publicly verified or that the ledger proves
  the owner uses; a `sent` cell is verified against the channel, not the file
  (#1009 had been open since 2026-10-27T05:34Z while the ledger said "0 of 4
  sent"); and a route's prior record is part of the ask.
- **`referral-sessions` green is a self-referral (2026-11-02).** 12 sessions, 12 of
  12 `github.com`, 2 users — this repository and the owner's browser. Only a
  non-`github.com` referring session counts, and `externalReferringDomains` is 0.
- **Indexation flat at 2: 6 (10-22) → 5 (10-28) → 3 → 3 → 2 (10-31) → 2 (11-01) →
  2 (11-02) → 2 (11-03)**, 10% coverage while the denominator shrank 25 → 21. The
  pillar's `lastCrawl` is still **2026-10-22** (12 days), while
  `/articles/why-btc500-exists` was crawled **2026-11-03** and declined on first
  fetch. Every lost URL was 200 with a matching canonical when it dropped.
  Authority verdict: in-repo change is unmeasurable until a link exists.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a crawl dated 2026-08-08; edited twice since and never re-fetched; serves 200
  with 1,383 server-rendered words, 0 body paragraphs duplicated from the pillar,
  4 internal links, 5 impressions @4.0 in 28 days. Stale verdict, not a content
  judgment. Revisit only after a re-crawl.
- **The `referrals 7d` line could print a 28-day window — fixed 2026-11-03.**
  `referral-line.mjs` picked the newest `ga4-*.json` by filename and hardcoded the
  label, so a `--days=28` report generated after a `--days=7` one printed 15
  github sessions as 7 days when the true figure was 12. The window now comes from
  the report (`window.days`, else its dates), `newestReport(dir, { days })` picks
  by window, `npm run referrals` defaults to 7, and a regression test covers the
  ordering that caused it. The 2026-11-01 reading is therefore **12**, not 15.
- **The demand exists and we are not in it (2026-11-01).** CoinDesk published the
  rule on 2026-08-05 and Yahoo Finance on 2026-06-24; bitbo.io runs `/halving/`
  and a 500-day chart page. 0 non-brand clicks because the pillar is not indexed
  and nothing links to it — not because nobody searches.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy twelve hours after three
  mandates forbade it, bundled into an SSR fix. A `MANDATES` line now needs a sha
  plus the diff.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day table sums to 42
  of 137 impressions); the 90-day reading is 723 non-brand impressions / 1 click.
- **Settled, do not reopen:** consent (Consent Mode v2 + banner + truthful
  `/privacy`, 2026-10-30); `/` serves `BTC / USD —` in the tape and omitting the
  hero price is not worth a TTFB risk on the one indexed URL; the 2026-10-31
  `verdict-invalid` is the owner mandate `review-runner-refresh-guard`; the old
  hash-guard mandate; `/bear-market` keeps impressions while 308-redirecting to the
  pillar; dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as **308**.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health) →
attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. Map: `scripts/autonomous/ARCHITECTURE.md`.
