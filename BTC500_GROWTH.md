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


## Latest measurement — 2026-11-11 (04:03Z)

- **indexed 1/21, sitemap 21** (inspection **2026-11-10T07:32:30Z**, 21 rows). No
  fresh 21-URL inspection today on purpose: the cycle read the raw
  `urlInspection` for the pillar instead, because the collector truncates
  `lastCrawlTime` to a date.
- **The pillar: `coverageState` "Crawled - currently not indexed", `lastCrawlTime`
  2026-11-07T03:42:34Z** (raw API read 2026-11-11T04:03:43Z) — unchanged for the
  fourth consecutive read, **16h37m56s before** #1267 merged and **3d 7h 43m
  after** it: **still no post-merge crawl.** `referringUrls` still lists a
  `vercel.app` alias and one of our own unindexed articles — no lopp.net, because
  Google's stored view is from the 11-07 crawl.
- **Referrals 7d: `github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
bitcointalk.org 0`** (window 2026-11-03 → 2026-11-09) — 3 of 3 github.com from 1
  user, i.e. this repo and the owner's browser. **0 non-github in 20 readings;
  lopp.net 0 in 3d 7h 43m.**
- GSC unchanged from the 2026-11-10 read (windows still end 2026-11-07):
  **28d 17 clicks / 76 impressions / 22.4% / avg pos 13.4**, **7d 1 click / 10
  impressions / 10.0% / 17.8**, non-brand clicks **0**.
- GA4 7d 2026-11-03 → 11-09 unchanged: 67 sessions / 21 users / 81 views / 29.9%.
- **Bootstrapping date read from the site: 29 November 2026, 18 days out**
  (homepage "18 days to buy", block height 975,383, live estimate — not the 30 Nov
  in the prompt template nor the 28 Nov in the X template).
- **The X click path now has a measurable surface.** Post `status/2120367269997957126`
  published 2026-11-11T04:05Z with
  `https://btc500.net/bitcoin-500-day-cycle?utm_source=x&utm_medium=social&utm_campaign=countdown-1111`,
  verified on the profile, and **pinned** (profile first article renders "Pinned",
  read 2026-11-11T04:16Z). The old pin `status/2086452446076002492` (2026-08-09, no
  link) is gone. GA4's window still ends 2026-11-09, so the reading is **too
  early**, not zero.
- Production 200s: `/`, `/bitcoin-500-day-cycle`, `/sitemap.xml` (21 locs),
  `/robots.txt`, `/data/500-day-cycles.json`, `/btc-usd-max.csv`. At 04:10Z the
  live CSV still ended **2026-11-09** while commit `2593a2c` carries the 2026-11-10
  row (`73721.18379734851`) — a deploy in flight, not a defect; the manifest checks
  the row.

## Session 2026-11-11 (04:00Z) — archive-only: pin done, still no post-merge crawl

Freeze held provably (`git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml`
empty). Three mandates executed: `pin-linked-post-1111` (pinned the 11-11
UTM-tagged post instead of the named untagged 11-10 one, deviation stated in
485b81e), `utm-on-every-outbound-link-1118` (post + reply both tagged, exact URLs
in the commit body), `post-merge-crawl-watch-1128` (raw crawl unchanged). One
engagement action: reply `status/2120368167130165417` to @IvesTim1618 + one like.
No site change, no new destination, no new experiment.

- **Measurement defect to fix:** the 04:00Z block quotes GA4 `67 sessions / 21
  users` — that is the **2026-11-03 → 11-09** window, i.e. the previous day's
  window, while the runner's 07:32Z report for **2026-11-04 → 11-10** is 77 / 21 /
  98 views / 28.6%. A cycle that quotes yesterday's window as "unchanged" cannot
  see a change; from 2026-11-12 print the window's start and end dates next to
  every GA4 number.

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
| ---------- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-11-11 | daily | failing | X reach measured (56/56/90/83/110 views/post); `AI Assistant` 3 sessions/3 users is the only stranger traffic; three surfaces state three different buy dates; Request Indexing ordered for the first time in 17 reviews; owner runner repairs restated 4th; dated stop rule 2026-11-20. Streak 17 |
| 2026-11-10 | daily | failing | Page-quality causes excluded by measurement; index lost both October articles by name; 1/21 seventh. Mandates: `pin-linked-post-1111`, `utm-on-every-outbound-link-1118`, `post-merge-crawl-watch-1128`, two owner runner repairs. Ask: one GitHub line. Streak 16 |
| 2026-11-09 | daily | failing | `externalReferringDomains` 0 → 1 (lopp.net, followed); indexation 1/21 sixth; no post-merge crawl. Mandates: `post-merge-crawl-1128`, `x-link-every-post-1116`, `referral-and-site-change-line-1116`. Streak 15                                                    |
| 2026-11-07 | daily | failing | `runner-mid-run-edit-1108` (owner); `cluster-read-1108`; `lopp-merge-watch-1114`; `sessions-honest-1109`. Streak 14                                                                                                                                                |
| 2026-11-06 | daily | failing | `lopp-net-pr-current-lines-1108` (owner); `outreach-stop-1107`; `dirty-tree-guard-1107`; `runner-honesty-1108` (owner). `shipped` redefined as a diff touching `src/`/sitemap. Streak 13                                                                           |
| 2026-11-05 | daily | failing | `lopp-net-pr-send-1106` (owner); `ask-gate-1107`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` the only gate. Streak 12                                                                                                  |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID. (10-31 → 11-04 in the 11-04 commit.)                                                                                                                                     |

---

## Session 2026-11-11 — owner-directed redesign: the site gets a face

Owner instruction: *"use taste-skill to improve the website look, redesign if
needed, we need super cool design."* This is an owner directive and overrides
the freeze for this one change; it is a skin, not a copy or structure rewrite.

- **Art direction was dealt, not chosen.** `design-taste-frontend` 2.5.1 was
  installed (`npx skills add https://github.com/Leonxlnx/taste-skill`) and its
  dealers picked the palette, the hero layout and the two moments: brand deal
  (near-black warm ground + Bitcoin orange), `split` hero, `counter-rolls` +
  `line-carries-colour`. Plan and rationale: `plans/004-homepage-redesign-taste-skill.md`.
- **Shipped:** the ground flipped from cream to near-black across every route
  (the site is token-driven, so this was a token change), a split hero where the
  live cycle map is the picture and the hero fills the first screen alone, a
  rule diagram with today's position on the rail, proof figures that roll once,
  an accent line that climbs the closing panel, and a dark nav/footer with a
  large wordmark. No new dependency, no WebGL, no change to the H1, the lead,
  the AEO ids, the FAQ or the JSON-LD.
- **Verified:** typecheck clean, lint clean on the changed files, `npm test`
  green, production build green, browser pass at 1440/1024/768/390 with no
  overflow and no clipped text. The taste-skill checker was run against the dev
  server; its actionable findings (hero-fill, heading-scale, button-styles,
  tap-size, focus-ring) were fixed. Left open on purpose: `no-visual` on the
  text-only sections, the `run-on` H1 (one keyword H1 is the whole point) and
  the off-viewport hit on the hidden share card.
- **Not a growth bet, and not claimed as one.** No crawl, impression, click or
  referral number moved because of this and none was measured. What it can do
  is make the one URL Google already serves worth staying on, and make the
  share card and the embed kit look like the brand they claim to be.
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

0. **Full freeze stands, with one new exception: a defect fix, not copy.** Gate 2
   is `/bitcoin-500-day-cycle` indexed **or** one GA4 referral session from a
   non-github domain. Still 0 of both. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
   The single permitted site change is `date-consistency-1112` (below): make the
   live buy date identical on all seven quoteable surfaces.
1. **Mandates from the 2026-11-11 review, in order** (`review-latest.json`):
   `gsc-request-indexing-1112` (Request Indexing + raw crawl re-read, 11-12),
   `channel-reach-read-1112` (X views + AI Assistant lines, 11-12),
   `date-consistency-1112` (the seven dates, 11-13), `query-band-read-1112`
   (28d query rows, 11-13), `runner-repairs-1112` (OWNER, 11-12).
2. **Watch the merge work — the only live signal.** Each cycle to 2026-11-28:
   re-read the pillar's raw `lastCrawlTime`; the first crawl after
   2026-11-07T20:20:30Z is the test. No post-merge crawl by then, or still
   `Crawled - currently not indexed` → write "authority hypothesis falsified for
   one followed link", name a second destination, never reopen the copy line.
3. **The 2026-11-20 stop rule.** No post-merge crawl **and** no named non-github
   referral session on that date → daily post drops to twice a week, no new owner
   ask, weekly measurement plus one link action only.
4. **The 500-day cluster stays closed** through 2026-12-31. Reopening needs a
   measured change (a cluster query reappearing, or the pillar indexed).
5. **The buy-window peg is a live estimate — 29 November 2026 today, 18 days
   out.** Re-read it from the site every cycle; never from this log, an older post,
   `/llms.txt` (says 28 Nov) or the X bio (says 30 Nov).

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
- **The buy date is live-derived (29 Nov 2026 today) and the quoteable surfaces
  state three different dates:** `/bitcoin-500-day-cycle` and `/halving-dates`
  render **29 Nov**; `/llms.txt` says "the current block-height estimate is
  November 28, 2026" (lines 32 and 82); the X bio says **30 Nov**. The LLM-facing
  file is the stale one, and AI assistants are the only channel that has produced
  a stranger. Order: `date-consistency-1112`. Date-bearing manifest tokens are
  banned — they can only verify a deploy for the hours the estimate holds.
- **`AI Assistant` is the only channel in 20 readings where sessions equal users**
  (3 sessions / 3 users / 33.3% engaged, 7d to 2026-11-10), and it has no row in
  the GA4 `referrals` table, so the source domain is unnamed. robots.txt already
  welcomes GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot/Google-Extended/CCBot and
  `/llms.txt`, `/llms-full.txt`, `/data/500-day-cycles.json` exist. Watch it as a
  channel; do not read 3 sessions as a trend.
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
