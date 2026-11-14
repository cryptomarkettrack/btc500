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

## Session 2026-11-13 (04:00Z) — first successful Request Indexing; the crawl came back and still declined

Three mandates executed, **no site change**. Buy date read from
https://btc500.net/: **29 November 2026, 16 days out** ("16 days to buy" in the
live countdown) — not the 20 days / 30 November in the prompt header.

- **`request-indexing-retry-1113` — executed, SUBMITTED.** In the logged-in GSC
  session at **04:06:28Z** the pillar's REQUEST INDEXING was clicked; response:
  *"Indexing requested — URL was added to a priority crawl queue. Submitting a
  page multiple times will not change its queue position or priority."*
  Yesterday's refusal was a spent daily quota, not a broken lever. `/simulator`
  submitted 04:08:27Z (same confirmation). `/halving-dates` clicked 04:07:50Z
  but its toast expired before capture → **submitted state unconfirmed**.
- **The crawl happened 48 seconds later, and the answer is no.** Raw
  `urlInspection` at 04:09Z: `/bitcoin-500-day-cycle`
  **lastCrawlTime 2026-11-13T04:07:16Z**, `crawledAs=MOBILE`,
  `pageFetchState=SUCCESSFUL`, coverage **still `Crawled - currently not
  indexed`**. First crawl since 2026-11-07T03:42:34Z and the **first
  post-merge crawl** (merge 2026-11-07T20:20:30Z): it read the 2026-11-11
  redesign and declined it. Caveat, stated rather than smoothed: 48s is fast
  enough that this fetch may be the request's own priority fetch, not an
  independent crawl — either way Google fetched the page today and the verdict
  did not move.
- **Raw crawl times (urlInspection API 04:09Z):** `/` **2026-11-05T07:50:37Z**
  (unchanged, indexed) · pillar **2026-11-13T04:07:16Z** · `/halving-dates`
  **2026-10-22T14:38:27Z** · `/simulator` **2026-11-07T06:25:39Z**. The homepage
  crawl that the 2026-11-19 rule watches has not happened.
- **`sitemap-lastmod-home-1113` — already executed 2026-11-12 (c0f71a9),
  verified live today.** `<lastmod>` for `/` went **2026-10-29 → 2026-11-11**
  (`git show a410672:public/sitemap.xml` vs the working tree and vs production);
  `node scripts/sitemap.mjs --check` → "public/sitemap.xml is up to date (21
  URLs)". Nothing to ship: the fix landed before this cycle, bundled with the
  Bing tooling rather than alone in its commit as the mandate asked.
- **`named-source-ledger-1113` — executed.** `fetch-ga4.ts` now collects a
  `namedSources` table (`sessionDefaultChannelGroup × sessionSource ×
  landingPage`, sessions + users, no channel filter); `referral-line.mjs` prints
  a second line for 7d and 28d. `npm run referrals` today:
  - `named sources 7d: (not set) 6/6 → (not set), facebook.com 6/6 → /,
    google 5/2 → /, t.co 3/3 → /, chatgpt.com 2/2 → /bitcoin-500-day-cycle,
    bitcointalk.org 1/1 → /bitcoin-500-day-cycle, x 1/1 → /bitcoin-500-day-cycle
    (window 2026-11-06 → 2026-11-12)`
  - `named sources 28d: chatgpt.com 10/10 → /bitcoin-500-day-cycle, google
    10/3 → /, (not set) 7/6 → /, facebook.com 6/6 → /, t.co 4/4 → /,
    bing 3/3 → /bitcoin-500-day-cycle, bitcointalk.org 1/1 →
    /bitcoin-500-day-cycle, x 1/1 → /bitcoin-500-day-cycle`
  - **The BitcoinTalk send has its first session**: `bitcointalk.org 1/1 →
    /bitcoin-500-day-cycle`, the first session from an *asked* channel in 22
    readings. One session is a floor, not a result.
  - Tests: 4 new cases (Organic Social / AI Assistant source appears, landing
    pick, empty case, window label). 222 pass / 0 fail.
- **`x-post-dedup-1113` — executed.** Profile read first (04:02Z): no post
  carrying `countdown-1113` (last two 2026-11-12T05:35Z and 06:05Z). One post
  published: `status/2121091569650483649` **2026-11-13T04:03:32Z**, Friday
  shape, live facts, tagged link `…?utm_source=x&utm_medium=social&
  utm_campaign=countdown-1113`; verified on the profile. Views (aria-labels):
  pinned `2120367269997957126` **107 views / 2 likes / 1 reply**,
  `2120759802204983357` **56 / 1 / 0**, `2120752220010582146` **62 / 2 / 0** —
  against t.co 3 sessions in the same 7 days.
- **Engagement:** reply + like to @WelshBullTrader
  (`status/2121088238379048989`, "below $70K … stick to your DCA") with the
  four-window drawdown fact and the median 84.5 days to the low; reply
  `status/2121091868972798203` at 04:04:44Z, logged in `X-ENGAGEMENT-LOG.md`.
- **New defect signal, not fixed (freeze):** GSC's Discovery panel for all four
  inspected URLs reads **"Sitemaps: No referring sitemaps detected"**, although
  `sitemap.xml` holds all 21 locs and is submitted. Either the sitemap's
  processing is stale or the property carries a second sitemap entry. This is
  not a copy problem and cannot be fixed by copy — it needs a mandate.

## Outbound — 2026-11-12 — BitcoinTalk topic posted (first non-GitHub, non-X send)

Executed in the owner's logged-in browser session (account `btc500halving`,
BitcoinTalk, board 1 "Bitcoin Discussion"):

- **Live:** <https://bitcointalk.org/index.php?topic=5599692.0> — title
  "500-day rule: entry Nov 29, 2026 - every completed window went underwater
  first", published 2026-11-12 16:31 local, **read back on the board listing**
  after posting (the topic is in the board's first page of topics).
- **Not queued:** the topic rendered immediately in the thread view with no
  moderation notice, so it is public now.
- **Copy was rewritten before sending.** The prepared pitch in
  `scripts/autonomous/outreach/2026-10-27-bitcointalk-timing-test.txt` was a
  single-number timing test (median −32.5%). It was replaced by the record
  itself: all four completed windows (entry price, exit multiple, lowest close
  vs entry, days below entry before the halving) + the ±120-day entry test +
  the dated live call (next entry **Nov 29, 2026**) + the public $10k paper buy
  that opens on that date + the caveat that intraday lows were deeper.
- **Date framing:** Nov 29, 2026 (live block-height model) in the title and the
  body; Nov 30 is mentioned once as the consensus projection of an Apr 13, 2028
  halving, so a reader who has seen the other date does not read the post as
  wrong.
- **Link status (measured, not assumed):** both outbound anchors render
  `rel="ugc"` — BitcoinTalk does not pass authority, the same position as
  GitHub README links. This is a **referral and mention** send, not an
  indexation send. The only followed link BTC500 has is the lopp.net one
  (merged 2026-11-07), and Google has still not recrawled since 2026-11-07.
- **Proof metric:** GA4 referral sessions with source `bitcointalk.org` in the
  7d window ending 2026-11-19 or later (the runner's window ends 2026-11-09, so
  today's reading is "too early"), plus thread reply count and view count read
  on the thread itself.
  **First session 2026-11-13:** `bitcointalk.org 1/1 →
  /bitcoin-500-day-cycle` in the 7d window 2026-11-06 → 11-12 — the first
  session from any *asked* channel in 22 readings. One session, one user: a
  floor, not a result.
- **Account note (state of the sender, state it plainly):** the BitcoinTalk
  account is brand new — the profile reads "Brand new", `Activity: 0`,
  `Posts: 1` at the time of the post, and total logged-in time was 2 minutes.
  A first post from a zero-reputation account is the weakest possible sender,
  so this topic is a bet on the data, not on the account. If the thread is
  removed or held, that is the reason to check, and the fix is participation,
  not a re-post.

## Baseline — measured 2026-11-12 (Bing)

Source: Bing Webmaster Tools API (site `https://btc500.net`), via `npm run bing`.

| Measure | Value |
| --- | --- |
| Site | verified, sitemap submitted 2026-11-12, status Success, 21 URLs discovered |
| IndexNow | push accepted, HTTP 200 (key validated) — Bing, Yandex, Seznam, Naver, Yep |
| Crawler access | msnbot / bingbot / Googlebot / browser all get an identical 200 |
| **Indexed in Bing** | **0/21** — Site Explorer: "No pages found" |
| Crawled at least once | 10/21 (homepage last crawled 2026-11-12) |
| Keywords | 0 rows |
| Backlinks | 0 rows |
| AI Performance (Copilot + partners) | 0 total citations, 0 cited pages |
| Submission quota | 99 URL submissions/day, 1,899/month |

Read: Bing is not blocked and not misconfigured — it crawls and keeps nothing,
exactly like Google on a young domain with no inbound links. The Bing
opportunity is the *AI citation* surface (AI Assistant is the only channel
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

## Results review — 2026-11-12 (daily) — compressed

Verdict `failing`, streak 19; 10 commits touching `src/` or `public/sitemap.xml`
bought indexed 1/21 → 1/21 and 0 non-brand clicks (21st reading). Four findings
set today's work: the sitemap's false `<lastmod>2026-10-29</lastmod>` for `/`
(`scripts/sitemap.mjs` excluded `src/components/home/`); Request Indexing
refused for the first time ever with quota 0; the Referral-channel table cannot
see `t.co`/`facebook.com`/`chatgpt.com`, so 21 readings reported "0 named
non-github referral sessions" while nine existed; and the 2026-11-19 crawl rule
replaced the 2026-11-20 stop rule. Details: `review-latest.json` and the review
history table below.

## Results review — 2026-11-13 (daily) — the crawl answer arrived, and it was no

Verdict `failing`, streak 20. **The decisive fact of the week is a negative:**
Request Indexing was submitted (`2026-11-13T04:06:28Z`) and
`/bitcoin-500-day-cycle` was fetched **48 seconds later** — `lastCrawlTime
2026-11-13T04:07:16Z`, `pageFetchState SUCCESSFUL`, the first post-merge crawl and
the first read of the 2026-11-11 redesign — and coverage is **still `Crawled -
currently not indexed`**. `/halving-dates` moved `2026-10-22 → 2026-11-13` and also
stayed declined. In the same week the sitemap's false `lastmod` for `/` was fixed
(`2026-10-29 → 2026-11-11`, c0f71a9) and all 21 URLs were submitted to Bing's URL
Submission API and IndexNow: Bing today is **0 indexed / 10 crawled / 11 unknown**.
Two engines have taken delivery of the inventory and kept one URL (`/`).

**The one number that moved:** named non-github sessions **9 → 13** in 7d
(facebook.com 6/6 → `/`, t.co 3/3 → `/`, chatgpt.com 2/2 → pillar, x 1/1 → pillar,
bitcointalk.org 1/1 → pillar) — the first week an *asked* channel produced a
session, from the BitcoinTalk topic the owner sent by hand on 2026-11-12.
Everything else: indexed 1/21 (tenth consecutive reading), non-brand clicks 0 in 23
readings, positions4to20 = 0, impressions 14, sessions 99 of which 70 are Direct
from 16 users. Lopp.net: 0 sessions 6 days after a merge that is still followed.

**Consequences (mandates):** fix the collector's inspection denominator
(`1/4` vs `1/21` in the same day's files); **close every indexation lever to
2026-12-01** (sitemap, lastmod, Request Indexing, URL submission, merge, redirect,
copy); read the pillar's coverage on 2026-11-16 and the GSC Sitemaps panel once;
read Bing on 2026-11-18 and treat 0/21 as a second engine's decline; runner repairs
7th statement (owner). **Asks:** The Block newsroom tip (kept, day 2), and a
Facebook share from the owner's own account — the only channel in the record where
sessions equal users. The `yjjnls/awesome-blockchain` route is **closed
`unexecutable`** after three unsent handovers (`total_count: 0` on every check).
Full file: `scripts/autonomous/review-latest.json`.

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

Owner instruction: *"use taste-skill to improve the website look, redesign if
needed."* A skin, not a copy or structure rewrite: near-black warm ground +
Bitcoin orange across every route (token-driven), split hero with the live cycle
map, rule diagram, rolling proof figures, dark nav/footer; share cards, share
buttons and the embed kit re-cut on the same system. No new dependency, no
WebGL, no change to H1, lead, AEO ids, FAQ or JSON-LD. Verified: typecheck,
tests, build, browser pass at 1440/1024/768/390. The vendored skill lives in
`.agents/` and `.taste-skill/` — both gitignored; the repo must never carry it.
Not a growth bet and not claimed as one.

---

## Review history

| date       | verdict | what it forced (one line each) |
| ---------- | ------- | ------------------------------ |
| 2026-11-13 | failing | Request Indexing succeeded, the pillar was crawled 2026-11-13T04:07:16Z and **declined**; Bing 0/21 after all 21 submitted; every indexation lever closed to 2026-12-01; collector's 4-row vs 21-row denominator; GitHub ask route closed `unexecutable`. Streak 20 |
| 2026-11-12 | failing | sitemap's false 2026-10-29 lastmod for `/`; Request Indexing refused (quota 0); named-source ledger (t.co/facebook/chatgpt invisible to the Referral table); 2026-11-19 crawl rule replaces the 2026-11-20 stop rule. Streak 19 |
| 2026-11-11 | failing | X reach measured (56/56/90/83/110 views/post); `AI Assistant` 3/3 the only stranger traffic; three surfaces, three buy dates; Request Indexing ordered (first time in 17 reviews). Streak 17 |
| 2026-11-10 | failing | Page-quality causes excluded by measurement (200 / 3,007 words / canonical / robots / linked / not duplicate); both October articles lost by name. Streak 16 |
| 2026-11-09 | failing | `externalReferringDomains` 0 → 1 (lopp.net, followed); no post-merge crawl. Streak 15 |
| older      | failing | 11-07 runner mid-run edit (owner); 11-06 `shipped` redefined as a src/sitemap diff; 11-05 lift condition retired → gate only; 10-30 **full freeze** (a `5aad29f` copy change after three mandates forbade it). Streaks 14 → 12 |

## Next priorities

0. **The freeze stands; the copy exclusion runs to 2026-11-28.** Only a review
   can lift it. Per cycle, prove compliance with
   `git diff --stat <freeze-sha>..HEAD -- src public/sitemap.xml`.
0b. **Due readings:** `pillar-verdict-1116` (2026-11-16) — pillar
   `lastCrawlTime`/`pageFetchState`/`crawledAs`/coverage next to
   2026-11-13T04:07:16Z, plus one read of GSC → Sitemaps; `bing-verdict-1118`
   (2026-11-18) — Bing indexed/crawled/unknown for all 21 URLs.
1. **The post-merge crawl has now happened and did not move coverage**
   (2026-11-13T04:07:16Z, still `Crawled - currently not indexed`). What is
   left in the lopp-link experiment's window: a *second*, independent crawl (the
   04:07:16Z fetch was 48s after the request, so it may be the priority fetch),
   or one lopp.net session. Read it again on 2026-11-28; if both are still
   absent, write "authority hypothesis falsified for one followed link" and name
   a second destination.
2. **`runner-repairs-1113` (OWNER, 6th restatement):** 2026-11-07 status row
   absent, `dirty_paths_note()` inline at `run-growth-cycle.sh:111/:197/:345`,
   no `status-note.sh`, `git add -A` at `run-review-cycle.sh:439/:446`.
3. **The "No referring sitemaps detected" signal** (GSC Discovery panel, all
   four URLs, 2026-11-13) needs a mandate: is the submitted sitemap processed,
   or does the property carry two? Not a copy problem.
4. **2026-11-19 crawl rule** (the live stop test): no homepage crawl dated after
   2026-11-12 by then → daily post drops to twice a week, no new owner ask, and
   the cycle keeps only the weekly measurement plus one link action.
5. **2026-11-18 X cadence verdict** — views per post against t.co/x.com
   sessions side by side. Today: 107 / 56 / 62 views against t.co 3 sessions in
   7d.
6. **The buy-window peg is a live estimate — 29 November 2026 today, 16 days
   out.** Re-read it from the site every cycle, never from this log or a post.

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
