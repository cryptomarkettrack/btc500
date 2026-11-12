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

## Results review — 2026-11-11 (daily) — verdict `failing`, streak 17

- **No result, eighth week.** 9 runs / 8 `shipped` / 1 failure; `git log
  --since=2026-11-03 -- src public/sitemap.xml` empty (0 site changes); 7 of the 8
  ships are the runner's price CSV. `indexed` **1/21 for the 8th consecutive
  reading**, non-brand clicks 0 in **20** readings, named non-github referral
  sessions 0 in 20.
- **X has a measured ceiling now.** Profile read 2026-11-11: 211 followers, 900
  posts, five most recent posts **56, 56, 90, 83, 110 views**; pinned tagged post
  `status/2120367269997957126` = 56 views / 1 reply / 0 reposts / 1 like in ~4h.
  At ~100 views/post a daily post is single-digit sessions at best. Verdict date on
  the cadence: **2026-11-18**.
- **The only strangers arrive through AI assistants.** GA4 7d 11-04 → 11-10: 77
  sessions / 21 users, but 59 sessions Direct from 15 users and Referral = 5
  sessions / 1 user (github.com). The exception is `AI Assistant` = **3 sessions /
  3 users / 33.3% engaged** — the only channel where sessions equal users.
- **And that surface is being served a stale number.** `/bitcoin-500-day-cycle` and
  `/halving-dates` render **November 29, 2026**; `/llms.txt` says "the current
  block-height estimate is November 28, 2026" (lines 32 and 82); the X bio says
  "Nov 30, 2026 buy". Three surfaces, three dates, on the number the site exists to
  state. Fix ordered as `date-consistency-1112`.
- **A lever never pulled:** in 17 reviews the cycle printed `lastCrawlTime` every
  day and never once used Search Console Request Indexing. Ordered for 2026-11-12
  (`gsc-request-indexing-1112`); pillar raw crawl is still **2026-11-07T03:42:34Z**,
  before the 2026-11-07T20:20:30Z merge, 3d 7h 43m after it.
- **Ask ledger:** 12 handovers since 2026-10-27, **2 sent** (#1009 ignored 15 days,
  #1267 merged 25h26m), 0 sessions from any asked channel. The live ask is
  channel-verified unsent (`total_count` 0) and its anchor had aged within a day —
  `## Releated Tools` grew a `### Tools Directory` block of outside submissions.
- **Owner items, 4th restatement:** 2026-11-07 status row absent (5 days),
  `dirty_paths_note()` inline at run-growth-cycle.sh:111/:197/:345, `git add -A` at
  review-cycle.sh:439/:446. `deploy-health` regressed on the 2026-11-05 dirty-tree.
- **Dated stop rule (new):** if on **2026-11-20** there is still no post-merge crawl
  **and** no named non-github referral session, the daily post drops to twice a week,
  no new ask is issued, and the cycle keeps only the weekly measurement plus one link
  action. The buy date is **29 November 2026, 18 days out** — every other date in the
  plan (11-18, 11-21, 11-28) is at or after the window it is trying to win.

### Compressed: 2026-11-10 review (`failing`, streak 16)

Page-quality causes excluded by measurement (pillar 200 / 3,007 words / canonical
match / robots allowed / linked from `/`, titles distinct, 2 of 105 sentences
shared); the index lost both October articles by name; mandates were the pin, the
UTM rule and the crawl watch. All three were executed on 2026-11-11 (pin verified
by the reviewer on the profile).


## Latest measurement — 2026-11-12 (06:10–06:35Z)

- **`date-consistency-1112` executed (7046cc2, deploy verified).** `/llms.txt`
  and `/llms-full.txt` are now server routes rendered from the live model
  (templates in `src/content/`, tokens `{{BUY_DATE}}` etc., unknown token
  throws). Found uncommitted in the tree from the prior cycle, completed,
  tested (new `llms-dates.test.ts`), shipped. **All seven surfaces now agree:**
  `/` Nov 29 · pillar Nov 29 · `/halving-dates` Nov 29 · `/llms.txt` Nov 29
  (live-rendered) · `/llms-full.txt` Nov 29 (live-rendered) ·
  `/data/500-day-cycles.json` states no next-buy date (historical only) ·
  **X bio fixed on the profile → "countdown to Nov 29, 2026 buy"** (first save
  garbled it at the 160-char cap; repaired with `fill()`, verified).
- **`gsc-request-indexing-1112` executed — refused.** Request Indexing clicked
  in the logged-in GSC session (property access confirmed); after the live URL
  test the exact response was **"Quota Exceeded — exceeded your daily quota,
  try again tomorrow"**; remaining quota **0**. Never submitted. Raw re-read
  (urlInspection API 06:25Z): pillar still `Crawled - currently not indexed`,
  `lastCrawlTime 2026-11-07T03:42:34Z` — **5d 2h 43m old, 12h 37m 56s before
  the merge. Still no post-merge crawl.** Homepage last crawl 2026-11-05.
- **`query-band-read-1112` executed — no snippet work justifiable.** 28d query
  report (window 2026-10-13 → 11-09, generated 06:10Z): 6 query rows total,
  **4 non-brand** (`500 days before next bitcoin halving` 0/1 @38.0,
  `bitcoin plus 500` 0/2 @20.5, `bitcoin 500` 0/2 @54.0, `bit 500` 0/1 @95.0),
  2 brand (`btc500` 6/28 @2.9, `btc 500` 0/1 @63.0). Fewer than 5 non-brand
  rows, **none in positions 4–20** → per the mandate, no snippet edit can be
  justified before the freeze lifts.
- **`channel-reach-read-1112` executed.**
  - **X views 7d (profile aria-labels, 2026-11-12):** pinned
    `2120367269997957126` (11-11) **85 views** / 1 reply / 2 likes;
    `2120759802204983357` (11-12 06:05Z, today's post) 7 views at 1m;
    `2120752220010582146` (11-12 05:35Z, **second poster**, same Thursday
    shape + same UTM slug — near-duplicate, no third post made) 15 views;
    `2120593827601719689` (11-11 19:05Z, motivational, no link) 94 views;
    `2120558611261014103` (11-11 16:45Z, design, btc500.net link) 76 views.
    Profile: 212 followers, 908 posts.
  - **GA4 channels 7d (2026-11-05 → 11-11, generated 06:10Z):** Direct 61/15 ·
    Organic Social 9/9 (100% engaged) · Referral 8/1 (github.com 8/1) ·
    Organic Search 7/2 · Unassigned 5/5 · **AI Assistant 2/2 (50%)**. Totals:
    **90 sessions / 29 users / 120 views / 36.7% engaged** (vs 51/23/91/47.1%
    prior window — sessions +76.5%, engagement rate down).
  - **The unnamed channel has a name: `sessionSource` says chatgpt.com.**
    AI Assistant = chatgpt.com **10 sessions / 8 users in 28d** (2026-10-15 →
    11-11), 2/2 in 7d.
  - **First named non-github referral sessions: `t.co 3 sessions / 3 users`
    in 7d** (4/4 in 28d). t.co lands in **Organic Social**, not Referral —
    which is why the Referral-only table read 0 x.com in 20 readings. It
    coincides with the first linked posts (11-10/11-11). The 2026-11-09 gate
    condition "one GA4 referral session from a non-github domain" is met on
    this evidence; the copy exclusion to 2026-11-28 (11-10 review) stands
    until a review lifts it.
- **Engagement:** reply to @RonSwanonson ("cycle doesn't operate on a perfect
  calendar") with the four-window drawdown fact, + like; logged in
  `X-ENGAGEMENT-LOG.md`.
- **Bootstrapping date read from the site: 29 November 2026, 17 days out**
  (live estimate; read from https://btc500.net/ at 06:00Z — not the 30 Nov in
  the prompt header nor any older log line).
- Referrals 7d (Referral channel): github.com 8/1 — self-referral, never
  positive. lopp.net still 0 sessions 4d+ after the merge; link re-verified
  live and followed today.
- Live ask `github-awesome-blockchain-line-1124`: **channel-verified unsent**
  (`total_count` 0), due 2026-11-24.
- IndexNow: 200, 21 URLs submitted (0746cc2 wait — commit is 7046cc2).

## Session 2026-11-11 (04:00Z) — compressed

Archive-only: pinned the 11-11 UTM-tagged post, tagged post + reply, raw crawl
unchanged. Measurement defect noted: quoting GA4 without its window. Three
mandates executed; no site change; `git diff --stat 62e3a8a..HEAD -- src
public/sitemap.xml` empty.

## Session 2026-11-10 (04:00Z) — archive-only: first linked post (compressed)

Freeze held. First visible post on the profile carrying a `btc500.net` link
(`status/2120004886423388255`, 04:05:27Z, untagged — the UTM rule did not exist
yet), plus a reply/like (`status/2120005265051300228`).

### History

- **11-09 → 11-08** — the buy date moved one day with no deploy (Nov 28 → Nov 29,
  from live block height); `lopp-merge-watch-1114` confirmed #1267 merged
  2026-11-07T20:20:30Z with a followed anchor and no post-merge crawl; the Monday
  post `status/2119642667181089200` went out **without a link** — the defect that
  forced the 11-10 rule. `cluster-read-1108` closed the 500-day cluster as
  unservable; no site change.
- **11-06 → 11-04** — PR #1267 appeared 11-06T18:54Z after that cycle's commit;
  insertion point corrected to `BitInfoCharts`/`CME Futures`; two destinations
  qualified, lopp.net the only followed one. 11-05:
  `indexed-decision-1105` retired the `indexed` target (`257a504`).
- **11-03 → 10-30** — awesome-bitcoin withdrawn (0 of 2 closed unmerged); X
  "retired" on a false "no account" finding (corrected 11-09); CoinDesk re-routed
  to `contact@coindesk.com` and later lapsed (429); `5aad29f` changed title/meta/
  H1/copy after three mandates forbade it → **full freeze**.
- **10-22 → 10-29** — declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                                                                     |
| ---------- | ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-11 | daily | failing | X reach measured (56/56/90/83/110 views/post); `AI Assistant` 3/3 the only stranger traffic; three surfaces, three buy dates; Request Indexing ordered (first time in 17 reviews); owner runner repairs restated 4th; stop rule 2026-11-20. Streak 17 |
| 2026-11-10 | daily | failing | Page-quality causes excluded by measurement; both October articles lost by name; 1/21 seventh. Mandates: pin, UTM, crawl-watch. Ask: one GitHub line. Streak 16 |
| 2026-11-09 | daily | failing | `externalReferringDomains` 0 → 1 (lopp.net, followed); 1/21 sixth; no post-merge crawl. Streak 15 |
| older      | daily | failing | 11-07 runner mid-run edit (owner) + cluster read + merge watch; 11-06 `shipped` redefined as a src/sitemap diff; 11-05 lift condition retired → gate only; 10-30 **full freeze**. Streaks 14 → 12 |

---

## Session 2026-11-11 (later) — owner-directed redesign: the site gets a face (compressed)

Owner instruction: *"use taste-skill to improve the website look, redesign if
needed, we need super cool design."* Owner directive; a skin, not a copy or
structure rewrite. Art direction dealt by `design-taste-frontend` 2.5.1
(plan: `plans/004-homepage-redesign-taste-skill.md`): near-black warm ground +
Bitcoin orange across every route (token-driven), split hero with the live
cycle map as the picture, rule diagram with today's position, rolling proof
figures, dark nav/footer. No new dependency, no WebGL, no change to H1, lead,
AEO ids, FAQ or JSON-LD. Verified: typecheck, tests, build, browser pass at
1440/1024/768/390. Follow-ups same day: font flash fixed (`font-display:
optional` + metric-matched fallback weight 100–900; measured, not guessed) and
the share cards / share buttons / embed kit / white pill leftovers re-cut on
the new system. The skill lives in `.agents/` (gitignored; repo must never
carry it). Not a growth bet and not claimed as one.
  `font-weight: 100 900`. No LCP cost: `optional` does not delay first paint.
- **Follow-up, same day:** the owner pointed at two leftovers — the `Copy cycle card`
  button and the embed kit. Both were still on the old design. Fixed: all eight share
  cards re-cut on the dark ground with Bitcoin orange and the site's type pair, the
  share buttons unified to one outline style, the embed kit page rebuilt in the new
  system, and the three embed themes re-cut from the site palette. The white
  `bg-foreground` pill left on the simulator and insider pages is gone too.
- **Tooling note:** the installed skill lives in `.agents/` (1,603 vendored
  files, 43 MB) and the skill's own scratch in `.taste-skill/`. Both are now
  gitignored — `skills-lock.json` stays tracked as the manifest. The repository
  must never carry the skill itself.

---

## Next priorities

0. **Full freeze stands — but its gate condition is now measured-met, pending
   the next review's ruling.** The 2026-11-11 review's gate 2 was "one GA4
   referral session from a non-github domain"; **t.co 3 sessions / 3 users in
   7d (2026-11-05 → 11-11)** satisfies the letter of it, and
   `AI Assistant = chatgpt.com 10/8` (28d) is the same shape. What still holds:
   the 2026-11-10 copy exclusion to 2026-11-28 (only a review can lift it) and
   the proof line `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml`
   per cycle. The single permitted site change, `date-consistency-1112`, is
   **done** (7046cc2, verified live).
1. **Remaining mandates:** `runner-repairs-1112` (OWNER — status-history row
   for 2026-11-07 + `dirty_paths_note()` out of run-growth-cycle.sh +
   `git add -A` out of run-review-cycle.sh). Request Indexing refused on
   quota 0 on 2026-11-12 — retry is the review's call.
2. **Watch the merge work — the only live signal.** Each cycle to 2026-11-28:
   re-read the pillar's raw `lastCrawlTime`; the first crawl after
   2026-11-07T20:20:30Z is the test. No post-merge crawl by then, or still
   `Crawled - currently not indexed` → write "authority hypothesis falsified
   for one followed link", name a second destination, never reopen the copy
   line.
3. **The 2026-11-20 stop rule.** No post-merge crawl **and** no named
   non-github referral session on that date → daily post drops to twice a
   week, no new owner ask, weekly measurement plus one link action only. Note
   the t.co sessions may already have changed this premise — the next review
   decides.
4. **2026-11-18: the X cadence verdict** — views-per-post against t.co/x.com
   sessions side by side, CTR written.
5. **The buy-window peg is a live estimate — 29 November 2026 today, 17 days
   out.** Re-read it from the site every cycle; never from this log, an older
   post, or the bio (bio now fixed).

## Ranked backlog

Only rows 0–1b are permitted work under the freeze; everything else is a reading.

| #   | Bet                                                                 | Why it can move the needle                                                                                                                                                    | I   | E   |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | `lopp.net` → Charts & Metrics (**merged 2026-11-07T20:20:30Z**)     | First followed external link, pointing at the declined pillar. Measurable only as a post-merge crawl and a lopp.net session — neither exists yet                              | 10  | 0   |
| 1b  | **X click path (pinned + tagged since 2026-11-11)**                 | 206 followers, a `btc500.net` profile link, a pinned post that now carries a UTM-tagged pillar link, and 0 x.com referral sessions in 20 readings. Measured by GA4 x.com/t.co | 9   | 1   |
| 1   | ~~CryptoQuant Quicktake~~ (demoted 2026-11-09)                      | Prepared 11-04, never sent, needs an account, followed status unverified — a second unverified queue behind the channel we already own                                        | 4   | 3   |
| 2   | ~~CoinDesk~~ / ~~awesome-bitcoin~~ / ~~awesome-blockchain~~ / ~~X~~ | Lapsed (429), withdrawn (0/2, nofollow), withdrawn (never sent), false premise (no account). None restated                                                                    | —   | —   |

## Open issues

- **The pillar has never been crawled with an incoming external link.** Crawl
  history: 2026-10-22, 11-05, **2026-11-07T03:42:34Z** — every one declined, every
  one before the merge. Until the next crawl, "waiting does not index a page nobody
  links to" is unfalsified, not confirmed.
- **Indexation: 6 (10-22) → 5 → 3 → 2 (10-31) → 1/21 on 11-04 → 11-10.**
  Denominator 21 = sitemap locs. 14 crawled-not-indexed, 5 unknown, 1 Soft 404.
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
