# BTC500 Growth Log

Working memory for the autonomous growth work. Short, dated, evidence-based. Do
not record guesses as results.

---

## Session 2026-11-14 (04:00Z) — measurement defect fixed in code; no site change (freeze)

- **`inspection-denominator-1114` — EXECUTED in code, not in prose.**
  `datedReportIndex()` (`scripts/autonomous/collect-results.mjs`) now prefers the
  report with the most `rows` before its window-days rule, so a `--urls` partial
  inspection can never become a day's denominator again. Regression test feeds the
  two real 2026-11-13 shapes (4-row `inspection-2026-11-13T04-09-18.json`, 21-row
  `inspection-2026-11-13T07-32-28.json`) in both readdir orders and asserts the
  21-row file wins. `node --test scripts/autonomous/collect-results.test.mjs` →
  **30 pass / 0 fail**. Regenerated `review-input.json` (2026-11-14T04:17:58Z):
  `indexation.current = "1/21"`, `currentByMetric.indexed.totalUrls = 21`; the
  collector's own metrics line prints `indexed 1/21`. The 2026-11-13 row in
  `results-history.csv` still carried `totalUrls 4` — the same defect, written by
  the old code — and was corrected to 21 against the 21-row file; `indexed`
  unchanged at 1, so no count moved, only the denominator.
- **`indexation-levers-closed-1114` — COMPLIED.** No sitemap, lastmod, Request
  Indexing, URL submission, merge, redirect, canonical or copy work as an
  indexation fix before 2026-12-01; recorded in Open issues. No site change:
  `git diff --stat e77f624..HEAD -- src public/sitemap.xml` → empty.
- **Distribution — one UTM-tagged post, one reply.** Post
  `status/2121470416250368064` at 2026-11-14T05:08:56Z, verified on the profile 12s
  later:
  live count **15 days**, buy date **29 Nov 2026**, tagged link
  `https://btc500.net/bitcoin-500-day-cycle?utm_source=x&utm_medium=social&utm_campaign=countdown-1114`.
  Dedup read first — newest post was 2026-11-13T04:03Z and no post carried
  `countdown-1114`. Views read at ≈04:58Z (aria-labels): pinned 83 / 3 likes,
  2026-11-13 93 / 1, 2026-11-12 68 / 1 and 72 / 2.
- **Engagement:** reply + like to @WatchT25778
  (`status/2121457495621407039`, "Bitcoin and altcoins reached all time highs
  after the last halving in 2024", 53m old, 98 views) with the four-window
  drawdown fact; reply `status/2121471178980119013` verified under the parent at
  05:12Z. Account not in `X-ENGAGEMENT-LOG.md` before today.
- **Pin regression — found, attempted, not fixed.** The profile's pinned post is
  `status/2120172389442969779` — the second poster's 2026-11-10 "Mark the date.
  #Bitcoin", **no `btc500.net` link** — not the UTM-tagged post recorded as pinned
  on 2026-11-11 (`status/2120367269997957126`). The overflow menu is live (the
  pinned post offers "Unpin from profile", the new post offers "Pin to your
  profile"), but three activations of "Pin to your profile" (force click, role
  click, real mouse click on the item's box) closed the menu and left the pin
  unchanged, no toast. Recorded as: the pin action is accepted by the menu and
  does not move the pin in this session. Not retried further.
- **Measurement, from the runner's reports (no re-collection):** GSC 7d
  **2026-11-04 → 11-10**: 2 clicks / 14 impressions / 14.3% / avg pos 4.90.
  GA4 7d **2026-11-06 → 11-12**: 99 sessions / 31 users / 129 views / 31.3%;
  channels Direct 70/15, Organic Social 10/10, Referral 9/2, Unassigned 6/6,
  Organic Search 5/2, **AI Assistant 2/2**. Named sources unchanged:
  facebook.com 6/6 → `/`, t.co 3/3 → `/`, chatgpt.com 2/2 → pillar, x 1/1 →
  pillar, bitcointalk.org 1/1 → pillar; **theblock.co 0**. Indexed **1/21**
  (inspection 2026-11-13T07:32:28Z, rows 21 of 21).

---

## Results review 2026-11-14 (daily, streak 21) — `failing`

**The one result: the instrument is honest and the audience is 19 sessions a
week.** `indexed` **1/21 (rows 21 of 21**, coverage: 1 indexed, 17 crawled-not-
indexed, 1 soft 404, 1 discovered, 1 unknown) for the **11th consecutive daily
reading** since 2026-11-04; non-brand clicks **0 in 24 readings** (2 clicks / 15
impressions / 13.3% / pos 4.47, both clicks brand `btc500` 2/8 @1.375; the only
non-brand impression is `500 days before next bitcoin halving` @38). Bing **0/21**
— 14 crawled (up from 10), 7 unknown — and Bing crawled `/` at
**2026-11-13T23:23:57Z** and kept nothing. Google's `/` lastCrawl is still
**2026-11-05**, so the only indexed URL has never been read post-redesign.

GA4 7d **2026-11-07 → 11-13: 108 sessions / 34 users / 26 new / 147 views /
33.3% engaged / 67.5s**, against the previous 7d 41 / 18 / 10 / 67 / 51.2% /
69.1s. The composition is the finding: **Direct 79 sessions / 17 users**, Organic
Social 11/11, Referral 9/2 (github.com 8/1 = this repo), Organic Search 5/2, AI
Assistant 2/2, Unassigned 3/3. Named non-github **14/14**: facebook.com 6/6 → `/`,
t.co 3/3 → `/`, x 2/2 → pillar, chatgpt.com 2/2 → pillar, bitcointalk.org 1/1 →
pillar (13/13 yesterday). External audience = **19 sessions / 16 users**.

**Input vs output, same window:** 39 commits, 7 runs, 7 `shipped` statuses, 0
failures — and the site diff is 46 files / +2,721 / −1,458 **all dated 2026-11-11
and 11-12** (the redesign, llms.txt, sitemap rebuild). Since 11-12: 29 commits,
**0 lines of site change**. The redesign produced 0 index changes and is not
visible in Organic Search (5/2 before and after). `shipped` is a runner status,
not an outcome.

**Two engines, one answer.** Google took delivery of all 21 URLs and kept `/`;
Bing took delivery of all 21 on 2026-11-12, crawled 14 by today — including the
homepage 2026-11-13T23:23:57Z — and kept none. That pair is why the levers stay
closed to 2026-12-01 and why the only open route is a link from a domain that is
already crawled.

**Measurement defects found today (both small, both real).** (a) The same file
carries page impressions summed to **18** against a property total of **15**, and
`reconciliation.ok = true` with no warning — the byPage/property gap is not
checked. (b) `pagesWithImpressions` reads 6 → 2 in one day, which is a window
shift (11-04→11-10 → 11-05→11-11), not a collapse; it must always be quoted with
its window.

**Compliance:** `inspection-denominator-1114` executed in code (30/30 tests,
`review-input.json` total 21) — the first measurement mandate in 21 reviews that
changed an instrument rather than prose. `indexation-levers-closed-1114` complied
(`git diff --stat e77f624..HEAD -- src public/sitemap.xml` empty). `pillar-verdict-
1116` due 11-16, `bing-verdict-1118` due 11-18 — carried. `runner-repairs-1114`
(owner) **not executed, 8th statement**; narrowed to the `git add -A` repair and
restated once.

**Asks:** theblock-news-tip-1113 unsent, 2 days, **0 theblock.co sessions**;
facebook-share-1114 unsent, 1 day, facebook.com 6/6 unchanged. Between them, 0
sends.


## Session 2026-11-13 (04:00Z) — compressed — Request Indexing worked, the crawl still declined

- Request Indexing clicked at **04:06:28Z** (_"URL was added to a priority crawl
  queue"_); `/simulator` at 04:08:27Z; `/halving-dates` toast expired unconfirmed.
  The pillar was fetched **48 seconds later** — `lastCrawlTime
2026-11-13T04:07:16Z`, `crawledAs=MOBILE`, `pageFetchState=SUCCESSFUL`, first
  post-merge crawl and first read of the 2026-11-11 redesign — coverage **still
  `Crawled - currently not indexed`**. `/halving-dates` moved `2026-10-22 →
2026-11-13`, also declined.
- Raw crawl times (04:09Z): `/` **2026-11-05T07:50:37Z** (unchanged, indexed) ·
  pillar 2026-11-13T04:07:16Z · `/halving-dates` 2026-10-22T14:38:27Z ·
  `/simulator` 2026-11-07T06:25:39Z.
- `named-source-ledger-1113` executed: `fetch-ga4.ts` now collects a
  `namedSources` table and `referral-line.mjs` prints it (4 new tests, 222 pass).
- `x-post-dedup-1113` executed: post `status/2121091569650483649`
  (2026-11-13T04:03:32Z) verified on the profile; reply + like to
  @WelshBullTrader (`status/2121091868972798203`).
- New defect signal: GSC's Discovery panel read **"No referring sitemaps
  detected"** for all four inspected URLs while `sitemap.xml` holds 21 locs and is
  submitted.

## Outbound — 2026-11-12 — compressed — BitcoinTalk topic (first non-GitHub, non-X send)

<https://bitcointalk.org/index.php?topic=5599692.0>, board 1, owner's logged-in
session, published 2026-11-12 16:31 local and read back on the board listing. The
copy was the four-window record + the ±120-day entry test + the live call
(Nov 29, 2026), rewritten from the older single-number pitch. Both anchors render
`rel="ugc"` — a referral/mention send, never authority. Posting account read
"Brand new" (`Activity 0`, `Posts 1`). **First session 2026-11-13:**
`bitcointalk.org 1/1 → /bitcoin-500-day-cycle` in 7d — the first session from any
asked channel in 22 readings. One session, one user: a floor, not a result.

## Baseline — measured 2026-11-12 (Bing)

Source: Bing Webmaster Tools API (site `https://btc500.net`), via `npm run bing`.

| Measure                             | Value                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Site                                | verified, sitemap submitted 2026-11-12, status Success, 21 URLs discovered |
| IndexNow                            | push accepted, HTTP 200 (key validated) — Bing, Yandex, Seznam, Naver, Yep |
| Crawler access                      | msnbot / bingbot / Googlebot / browser all get an identical 200            |
| **Indexed in Bing**                 | **0/21** — Site Explorer: "No pages found"                                 |
| Crawled at least once               | 10/21 (homepage last crawled 2026-11-12)                                   |
| Keywords                            | 0 rows                                                                     |
| Backlinks                           | 0 rows                                                                     |
| AI Performance (Copilot + partners) | 0 total citations, 0 cited pages                                           |
| Submission quota                    | 99 URL submissions/day, 1,899/month                                        |

Read: Bing is not blocked and not misconfigured — it crawls and keeps nothing,
exactly like Google on a young domain with no inbound links. The Bing
opportunity is the _AI citation_ surface (AI Assistant is the only channel
where sessions equal users), and that surface is at zero citations because
the Bing index is empty. Tooling now measures this daily
(`npm run bing:check`, `npm run bing`) and the review loop reads it as two
signals: `bing-indexation` (outcome) and `bing-readiness` (process).

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

## Results reviews — 2026-11-12 and 2026-11-13 — compressed

**11-12 (streak 19):** the sitemap's `<lastmod>2026-10-29</lastmod>` for `/` was
false (`scripts/sitemap.mjs` excluded `src/components/home/`); Request Indexing
was refused (quota 0); the Referral-channel table cannot see
`t.co`/`facebook.com`/`chatgpt.com`, so 21 readings said "0 named non-github
referral sessions" while nine existed; the 2026-11-19 homepage-crawl rule
replaced the 2026-11-20 stop rule.
**11-13 (streak 20):** the decisive fact was negative — an accepted Request
Indexing followed by a successful fetch 48s later that still declined the pillar;
Bing 0 indexed / 10 crawled / 11 unknown after all 21 URLs were submitted the day
before; every indexation lever closed to 2026-12-01; the collector read a 4-row
inspection while a 21-row one existed; the `yjjnls/awesome-blockchain` route
closed `unexecutable` (three unsent handovers, `total_count: 0`).
**Movement:** named non-github sessions 9 → 13 in 7d. Nothing else moved:
indexed 1/21, non-brand clicks 0 in 23 readings, positions 4–20 = 0, impressions
14, sessions 99 with 70 Direct from 16 users. Details:
`scripts/autonomous/review-latest.json`.

## Session 2026-11-12 — compressed

`date-consistency-1112` (7046cc2): `/llms.txt` and `/llms-full.txt` became
live-rendered server routes, so all seven quoteable surfaces read 29 November
2026; the X bio was corrected by hand. Request Indexing refused (quota 0, never
submitted) and the pillar's raw `lastCrawlTime` still 2026-11-07T03:42:34Z.
GA4 7d 2026-11-05 → 11-11: 90 sessions / 29 users / 120 views / 36.7%, Direct
61/15, Organic Social 9/9, Referral 8/1 (all github.com, 1 user), Organic Search
7/2, AI Assistant 2/2. BitcoinTalk topic posted by the owner's session
(5599692), both anchors `rel="ugc"`. Session 2026-11-11: pinned the tagged post,
posted + replied, no site change; 11-10: first linked post on the profile.

## Session 2026-11-11 (later) — owner-directed redesign (compressed)

Owner instruction: _"use taste-skill to improve the website look, redesign if
needed."_ A skin, not a copy or structure rewrite: near-black warm ground +
Bitcoin orange across every route (token-driven), split hero with the live cycle
map, rule diagram, rolling proof figures, dark nav/footer; share cards, share
buttons and the embed kit re-cut on the same system. No new dependency, no
WebGL, no change to H1, lead, AEO ids, FAQ or JSON-LD. Verified: typecheck,
tests, build, browser pass at 1440/1024/768/390. The vendored skill lives in
`.agents/` and `.taste-skill/` — both gitignored; the repo must never carry it.
Not a growth bet and not claimed as one.

---

## Review history

| date       | verdict | what it forced (one line each)                                                                                                                                                                                                                                      |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-14 | failing | Instrument honest (`1/21`, rows 21 of 21) and the audience is **19 external sessions / 16 users**; Bing crawled `/` 2026-11-13T23:23:57Z and kept nothing; Google's `/` not crawled since 11-05; 39 commits, 0 site lines since 11-12; PERFORMANCE gains the external-audience line; non-brand work banned until `indexed` ≥ 5. Streak 21 |
| 2026-11-13 | failing | Request Indexing succeeded, the pillar was crawled 2026-11-13T04:07:16Z and **declined**; Bing 0/21 after all 21 submitted; every indexation lever closed to 2026-12-01; collector's 4-row vs 21-row denominator; GitHub ask route closed `unexecutable`. Streak 20 |
| 2026-11-12 | failing | sitemap's false 2026-10-29 lastmod for `/`; Request Indexing refused (quota 0); named-source ledger (t.co/facebook/chatgpt invisible to the Referral table); 2026-11-19 crawl rule replaces the 2026-11-20 stop rule. Streak 19                                     |
| 2026-11-11 | failing | X reach measured (56/56/90/83/110 views/post); `AI Assistant` 3/3 the only stranger traffic; three surfaces, three buy dates; Request Indexing ordered (first time in 17 reviews). Streak 17                                                                        |
| 2026-11-10 | failing | Page-quality causes excluded by measurement (200 / 3,007 words / canonical / robots / linked / not duplicate); both October articles lost by name. Streak 16                                                                                                        |
| 2026-11-09 | failing | `externalReferringDomains` 0 → 1 (lopp.net, followed); no post-merge crawl. Streak 15                                                                                                                                                                               |
| older      | failing | 11-07 runner mid-run edit (owner); 11-06 `shipped` redefined as a src/sitemap diff; 11-05 lift condition retired → gate only; 10-30 **full freeze** (a `5aad29f` copy change after three mandates forbade it). Streaks 14 → 12                                      |

## Next priorities

0. **Freeze stands; the copy exclusion runs to 2026-11-28** (only a review lifts
   it). Prove compliance per cycle with
   `git diff --stat <freeze-sha>..HEAD -- src public/sitemap.xml`.
   0b. **Due readings:** `pillar-verdict-1116` (2026-11-16) — pillar
   `lastCrawlTime`/`pageFetchState`/`crawledAs`/coverage next to
   2026-11-13T04:07:16Z plus one read of GSC → Sitemaps;
   `bing-verdict-1118` (2026-11-18) — Bing indexed/crawled/unknown for 21 URLs;
   `external-audience-line-1114` and `nonbrand-query-table-1114` (2026-11-15) —
   the PERFORMANCE block's new eighth line and the non-brand query table.
1. **The post-merge crawl happened and did not move coverage.** What is left in
   the lopp window: a second, independent crawl (04:07:16Z was 48s after the
   request, so it may be the priority fetch) or one lopp.net session. Read on
   2026-11-28; if both are absent, write "authority hypothesis falsified for one
   followed link" and name a second destination.
2. **`runner-repairs-1114` (OWNER, 7th statement):** 2026-11-07 status row
   absent, `dirty_paths_note()` inline at `run-growth-cycle.sh:111/:197/:345`,
   no `status-note.sh`, `git add -A` at `run-review-cycle.sh:443/:450`.
3. **"No referring sitemaps detected"** (GSC Discovery panel, 2026-11-13) needs a
   mandate: is the submitted sitemap processed, or does the property carry two?
4. **Rules that fire soon:** 2026-11-19 — no crawl of `/` after 2026-11-12 → the
   daily post drops to twice a week, no new owner ask, weekly measurement + one
   link action only. 2026-11-18 — X cadence verdict (views/post vs t.co sessions).
5. **The buy-window peg is a live estimate — 29 November 2026, 15 days out.**
   Re-read it from the site every cycle, never from this log or a post.

## Ranked backlog

Only rows 0–1b are permitted work under the freeze; everything else is a reading.

| #   | Bet                                                                 | Why it can move the needle                                                                                                                                                    | I   | E   |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | `lopp.net` → Charts & Metrics (**merged 2026-11-07T20:20:30Z**)     | First followed external link, pointing at the declined pillar. Measurable only as a post-merge crawl and a lopp.net session — neither exists yet                              | 10  | 0   |
| 1b  | **X click path (pinned + tagged since 2026-11-11)**                 | 206 followers, a `btc500.net` profile link, a pinned post that now carries a UTM-tagged pillar link, and 0 x.com referral sessions in 20 readings. Measured by GA4 x.com/t.co | 9   | 1   |
| 1   | ~~CryptoQuant Quicktake~~ (demoted 2026-11-09)                      | Prepared 11-04, never sent, needs an account, followed status unverified — a second unverified queue behind the channel we already own                                        | 4   | 3   |
| 2   | ~~CoinDesk~~ / ~~awesome-bitcoin~~ / ~~awesome-blockchain~~ / ~~X~~ | Lapsed (429), withdrawn (0/2, nofollow), withdrawn (never sent), false premise (no account). None restated                                                                    | —   | —   |

## Open issues

- **Indexation levers are CLOSED to 2026-12-01** (2026-11-13 review, mandate
  `indexation-levers-closed-1114`): sitemap, lastmod, Request Indexing, URL
  submission, merge, redirect, canonical, internal-link and copy work may not be
  offered as an indexation fix. Every one has been executed and `indexed` is 1 for
  the eleventh reading. A cycle's permitted output is one measurement plus one
  distribution action; a new in-repo lever must be named in the commit body with
  evidence that the previous five failed for a different reason.
- **The inspection denominator is now enforced in code.** `datedReportIndex()`
  prefers the most-rows report per day (2026-11-14); `review-input.json` reads
  1/21 and the collector prints `indexed 1/21`. If a future cycle sees a fraction
  whose row count is not the sitemap's `<loc>` count, that is a regression in the
  collector, not a coverage reading.
- **The pin does not move.** Pinned post today is `status/2120172389442969779`
  (second poster, 2026-11-10, no link), not the tagged post recorded as pinned on
  2026-11-11. The menu accepts "Pin to your profile" and the pin stays where it
  was (three attempts, 2026-11-14, no toast). Stated as a screen that accepts the
  action, not as an owner ask.
- **The pillar HAS now been crawled with an incoming external link, and was
  declined again.** Crawl history: 2026-10-22, 11-05, 2026-11-07T03:42:34Z (all
  pre-merge, all declined), then **2026-11-13T04:07:16Z** — the first post-merge
  crawl, `crawledAs=MOBILE`, `pageFetch=SUCCESSFUL`, coverage unchanged. One
  followed link from lopp.net did not move the gate on its first read.
- **Indexation 1/21** (inspection 2026-11-12T07:32:29Z, 21 rows = 21 sitemap
  locs): 20 NEUTRAL, 1 PASS, 0 ERROR. Series: 6 (10-22) → 5 → 3 → 2 (10-31) →
  1/21 since 11-04. Today's 4-URL read is not a 21-URL measurement and is never
  quoted as one.
- **GSC says "No referring sitemaps detected" for every inspected URL**
  (2026-11-13), while `sitemap.xml` holds 21 locs and is submitted. Recorded as
  a defect signal; fixing it is a mandate, not a cycle decision.
- **The buy date is live-derived (29 Nov 2026 today) and now reads the same on
  all seven quoteable surfaces** (fixed 2026-11-12, 7046cc2 + bio). Keep it
  that way: the two llms files render live, the bio was corrected by hand —
  if a future cycle finds them disagreeing, fix the stale one same-run.
- **`AI Assistant` is named now: chatgpt.com — 10 sessions / 8 users in 28d**
  (2026-10-15 → 11-11, `sessionSource` one-off query), 2/2 in 7d. robots.txt
  already welcomes GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot/Google-Extended/
  CCBot and `/llms.txt` (now live-rendered), `/llms-full.txt`,
  `/data/500-day-cycles.json` exist. Watch it as a channel; do not read 2-3
  sessions/week as a trend yet.
- **t.co sessions are real: 3/3 in 7d, 4/4 in 28d** — they land in the Organic
  Social channel, so the Referral-only `referrals` table reads 0 x.com
  forever. Any cycle that wants x.com attribution must query
  `sessionSource` (t.co), not the Referral channel. The 2026-11-18 cadence
  verdict must compare views/post against t.co sessions, not Referrals.
- **X reach is now measured and small:** 211 followers, 900 posts, five most recent
  posts 56 / 56 / 90 / 83 / 110 views, pinned tagged post 56 views in ~4h. Daily
  posting is the cheapest distribution available, not a growth channel; the cadence
  gets its verdict on 2026-11-18 and its stop test on 2026-11-20.
- **The account has a second poster and that poster does not link.** A post
  `status/2120172389442969779` ("Mark the date. #Bitcoin") appeared ≈2026-11-10T16:00Z,
  between the two cycles, so it was not published by this automation — and it
  carries no link. Every unlinked post from the account dilutes the one click path
  the cycle can measure. Not a defect the freeze lets us fix; the owner should know.
- **Ask routes:** 12 asks handed over since 2026-10-27, 2 sent (both one-page
  GitHub), 0 sessions from any asked channel, #1267 merged 2026-11-07. The live ask
  is `github-awesome-blockchain-line-1124`, channel-verified unsent today
  (`total_count` 0), now zero-typing after its anchor aged within a day (the
  `### Tools Directory` block appeared under it). **A `sent` cell is verified
  against the channel, never against this file.**
  `github.com` referrals are a self-referral (this repo and the owner's browser), so
  only a non-github session counts. **A destination needs a merge record, not stars**
  (awesome-bitcoin: 1,358 stars, 0 of 2); #1267 satisfies this for the first time.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a 2026-08-08 crawl; serves 200, 1,383 words, no pillar duplication.
- **"0 non-brand" is a floor** — GSC anonymises query rows. **`lopp.net` is www-only
  from a scripted fetch** (301 → `www` 200): a canonical-host redirect, not a
  removed page. The homepage's `referringUrls` also lists a parked
  `domainsc.com` page with 0 occurrences of `btc500` — stale, not a referring
  domain.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed title/meta/H1/copy hours after three mandates forbade it. A `MANDATES`
  line needs a sha plus the diff.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`; dated
  article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive, due experiments, site health) → attempt
→ `npm test` + `tsc` gate → Vercel status → `last-deploy.json` against live HTML.
Map: `scripts/autonomous/ARCHITECTURE.md`.
