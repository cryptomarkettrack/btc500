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

## Results review — 2026-11-09 (daily) — verdict `failing`, streak 15

**One target met for the first time: `externalReferringDomains` 0 → 1.** An input,
not a result: the followed link is live and nothing downstream of it has moved.

- **Indexation 1/21, sixth consecutive inspection** (2026-11-09T04:03:40Z, 21
  rows): 1 indexed, 14 crawled-not-indexed, 5 unknown, 1 Soft 404, no URL changed
  state. Series 6/25 (10-22) → 5/22 → 3/21 → 2/21 → 1/21. `#1267` merged
  **2026-11-07T20:20:30Z** (merge commit `4585231c`, 1 file, +1/−0, 0 comments);
  **no post-merge crawl** — `lastCrawl` 2026-11-07T03:42:34Z is 16h38m _before_
  the merge. The anchor is live and followed: `rel="noopener"`, 0 `nofollow`.
- **Non-brand clicks 0 in 18 readings.** 7d 1 click / 11 impressions, and the click
  is brand (`btc500` 1/4 @1.50). 28d impressions 78 (10-10 → 11-06) vs 95 on
  11-01; 7d is 11, under the 100-impression noise floor.
- **Sessions are down, not green.** GA4 7d 50 / 18 / 59 views / 34.0% against
  93 / 43 / 196 / 46.2%: −46.2% sessions, −58.1% users, −69.9% views, −51.5% vs
  103 on 10-30. Referrals 3 in 7d, 3 of 3 `github.com` (1 user = this repo and the
  owner's browser); 0 non-github in 18 readings; lopp.net 0.
- **The X channel exists and had no click path.** 206 followers, profile URL field
  `btc500.net`, posts at 2026-11-09T04:06:07Z and 11-08T06:43:04Z — and **none of
  the five visible posts contained a `btc500.net` link**, with 0 x.com referral
  sessions in 18 readings. The 2026-11-02 "no such account" line was false.
- **Input vs output: 9 runs, 8 `shipped`, 1 failure in 7d, and
  `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` empty** — zero site
  changes, zero new indexed pages, zero non-brand clicks. **Machinery (owner):**
  `runner-mid-run-edit-1108` unexecuted (`dirty_paths_note()` still in
  `run-growth-cycle.sh` 111/197/345, no `status-note.sh`, no 2026-11-07 row).

**Review verdict: `failing`.** 15th consecutive non-improving review.

## Latest measurement — 2026-11-10 (04:03Z)

- **indexed 1/21, sitemap 21** (inspection 2026-11-10T04:02:47Z, 21 rows, 0 failed
  to inspect): 1 indexed, 14 crawled-not-indexed, 5 unknown to Google, 1 Soft 404.
  **Seventh consecutive 1/21, and no URL changed state** against the
  2026-11-09T07:33:28Z inspection (21 rows both, 0 diffs).
- **The pillar: `coverageState` "Crawled - currently not indexed", `lastCrawlTime`
  2026-11-07T03:42:34Z** — read from the raw `urlInspection` API at
  2026-11-10T04:04Z, because `inspect-urls.ts` truncates the field to a date. That
  crawl is **16h37m56s before** #1267 merged (2026-11-07T20:20:30Z): **still no
  post-merge crawl**, 68h44m after the merge. The destination page still carries
  the followed anchor (fetched 2026-11-10: `rel="noopener"`, 0 `nofollow`).
- GSC, both windows end 2026-11-07 (3-day lag): **28d 2026-10-11 → 11-07: 17
  clicks / 76 impressions / 22.4% / avg pos 13.4** (previous reading 19 / 78 on a
  window ending 11-06 — one day shorter, not a regression). **7d 2026-11-01 →
  11-07: 1 click / 10 impressions / 10.0% / 17.8**; query rows `btc500` 1/4 @1.50,
  `bitcoin 500` 0/1 @67.00; 6 page rows. Non-brand clicks: **0** (18th reading).
- GA4 7d 2026-11-03 → 11-09: **67 sessions / 21 users / 12 new / 81 views / 29.9%
  engaged / 50s** against 82 / 41 / 154 / 46.3% / 2m27s the week before:
  **−18.3% sessions, −48.8% users, −47.4% views**. Channels 52 direct / 5 AI
  Assistant / 5 organic / 3 referral / 2 unassigned. **Referral sources:
  `github.com` 3 sessions (1 user); lopp.net 0, x.com 0, t.co 0.** The pillar is
  the landing page of 15 sessions (9 in the 11-08 reading) — every one direct,
  organic or AI, so it is not a referral signal.
- **X click path: the first visible post that carries a link.** Published
  2026-11-10T04:05:27Z, `status/2120004886423388255`, with
  `https://btc500.net/bitcoin-500-day-cycle` inside the 280 chars; verified on the
  profile, where the pinned 2026-08-09 post and the 11-04 → 11-09 posts carry no
  `btc500.net` link. `x.com referrals 7d: 0` — that window ends 2026-11-09, so the
  reading for this post is 2026-11-11 or later, not today.
- **Buy date read from the site today: 29 November 2026, 19 days out** (homepage
  "19 days to buy", block height 975,253, pillar `<title>November 29, 2026: …`).
  The owner ask text and the X bio still say Nov 30. Production 200s: `/`,
  `/bitcoin-500-day-cycle`, `/sitemap.xml` (21 locs), `/robots.txt`,
  `/data/500-day-cycles.json`, `/btc-usd-max.csv`. At 04:03Z the dataset and CSV
  still ended **2026-11-08** (the runner's 2026-11-09 archive commit `31cff9c` was
  unpushed); this cycle pushes it and the manifest checks the 2026-11-09 row.

## Session 2026-11-10 (04:00Z) — archive-only: no post-merge crawl, link in the post

Preflight: archive refreshed to 2026-11-09 (1 row appended, 0 dropped, overlap
median 0%), 1 experiment open (`lopp-link-effect`, reading 2026-11-28, not due),
review 2026-11-09 `failing` (streak 16), site 200/200. **Freeze held, provably:
`git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` is empty.**

- `post-merge-crawl-watch-1128` — **executed**: `lastCrawlTime` is unchanged at
  2026-11-07T03:42:34Z, so no crawl exists after the 2026-11-07T20:20:30Z merge.
  Written to `outreach/STATUS.md` in this commit.
- `x-link-every-post-1116` — **executed**: today's post carries the pillar URL
  (`status/2120004886423388255`, 2026-11-10T04:05:27Z). Tuesday rotation, with the
  buy date read from the live model (29 Nov 2026), not the template's Nov 28.
- Growth engagement (one action): reply to @HODLmemecoins' Cointelegraph "the
  halving may have lost its punch" quote with the drawdown fact — four completed
  windows, all underwater first, median low −11.72%, worst −83.65%, all closed
  above entry — `status/2120005265051300228` at 2026-11-10T04:06:57Z, plus a like.
  Logged in `X-ENGAGEMENT-LOG.md`.
- **No site change, no new destination, no new experiment.** #1267 is 2d 8h old;
  its only measurable output is the next crawl, and a second prepared destination
  would repeat the prepared-but-unsent substitution the 2026-11-06 review deleted.
- Owner-only mandates `runner-record-repair-1109` and `review-commit-guard-1109`
  are still open and untouched: a cycle that writes a runner file is the defect
  that aborted the 2026-11-07 run.

## Session 2026-11-09 (04:00Z) — archive-only: no post-merge crawl, date moved

**The buy date moved one day with no deploy: Nov 28 → Nov 29, 2026** (rendered per
request from live block height, 975,127 then). Freeze held. `lopp-merge-watch-1114`
executed: #1267 `merged: true`, `merged_at 2026-11-07T20:20:30Z`, 0 comments; the
destination carried the anchor with 0 `nofollow`; no crawl after the merge. X: the
Monday countdown was published at 2026-11-09T04:06:07Z (`status/2119642667181089200`)
with N=20 read from the site — still no link in the post.

### History

- **11-08** — #1267 verified merged with a followed anchor (first external link in
  the site's history); `cluster-read-1108` executed, the 500-day cluster closed as
  unservable; no site change.
- **11-06 → 11-04** — PR #1267 appeared 11-06T18:54Z after that cycle's commit;
  insertion point corrected to `BitInfoCharts`/`CME Futures`; two destinations
  qualified, lopp.net the only followed one.
- **11-05** — `indexed-decision-1105`: no in-repo indexation work without an
  external referring link; `indexed` target retired (`257a504`).
- **11-03 → 10-30** — awesome-bitcoin withdrawn (0 of 2 closed unmerged); X
  "retired" on a false "no account" finding (corrected 11-09); CoinDesk re-routed
  to `contact@coindesk.com` and later lapsed (429); `5aad29f` changed title/meta/
  H1/copy after three mandates forbade it → **full freeze**.
- **10-22 → 10-29** — declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-09 | daily | failing | `externalReferringDomains` 0 → 1 (lopp.net merged 2026-11-07T20:20:30Z, followed); indexation 1/21 sixth; no post-merge crawl. Mandates: `post-merge-crawl-1128`, `x-link-every-post-1116`, `referral-and-site-change-line-1116`, `runner-record-repair-1109` (owner), `review-commit-guard-1109` (owner). Ask: one X post carrying the link. Streak 15 |
| 2026-11-07 | daily | failing | `runner-mid-run-edit-1108` (owner); `cluster-read-1108`; `lopp-merge-watch-1114`; `sessions-honest-1109`. Streak 14                                                                                                                                                                                                                                     |
| 2026-11-06 | daily | failing | `lopp-net-pr-current-lines-1108` (owner); `outreach-stop-1107`; `dirty-tree-guard-1107`; `runner-honesty-1108` (owner). `shipped` redefined as a diff touching `src/`/sitemap (streak 13)                                                                                                                                                               |
| 2026-11-05 | daily | failing | `lopp-net-pr-send-1106` (owner); `ask-gate-1107`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` is the only gate (streak 12)                                                                                                                                                                                   |
| 2026-11-04 | daily | failing | Indexation line closed (1/21); lopp.net ask; CoinDesk lapsed (429); awesome-blockchain withdrawn; #1009 failed; collector must not quote `--limit` inspections                                                                                                                                                                                          |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID. (10-31 → 11-03 rows: `BTC500_GROWTH.md` history in the 11-04 commit.)                                                                                                                                                                                         |

---

## Next priorities

0. **Full freeze stands — the old gate is met, the next one is not.** Gate 1
   (`externalReferringDomains > 0`) is **satisfied: 1, lopp.net**, verified
   2026-11-09 from the live page (followed anchor, no nofollow). Gate 2 is
   `/bitcoin-500-day-cycle` indexed **or** one GA4 referral session from a
   non-github domain. Still 0 of both. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Watch the merge work — the only live signal.** Each cycle through
   2026-11-28: re-inspect `/bitcoin-500-day-cycle` and record `lastCrawl`; **the
   first crawl after 2026-11-07T20:20:30Z is the test** (the 11-07T03:42:34Z
   crawl predates the merge by 16h38m). If there is no post-merge crawl by
   2026-11-28, or it still reports `Crawled - currently not indexed`, write
   "authority hypothesis falsified for one followed link" and name a second
   destination — never reopen the copy line.
2. **The 500-day cluster is closed as unservable** (2026-11-08 mandate): no copy,
   title, meta or section edit to `/` or `/bitcoin-500-day-cycle` through
   2026-12-31. Reopening needs a measured change — a cluster query reappearing or
   the pillar being indexed — not a new argument.
3. **The buy-window peg is a live estimate — 29 November 2026 today, 19 days
   out** (28 November on 11-08 at height 974,836; 29 November on 11-10 at 975,253).
   Re-read it from the site every cycle, never from this log or an older post.
   Article bodies and the X bio still say 30 Nov: a one-day gap, not fixed while
   the freeze holds.
4. **Owner mandates, not cycle work:** `runner-mid-run-edit-1108` (split
   `dirty_paths_note()`, restore the missing 2026-11-07 status row).

## Ranked backlog

Only rows 0–1b are permitted work under the freeze; everything else is a reading.

| #   | Bet                                                                 | Why it can move the needle                                                                                                                                                                                                   | I   | E   |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | `lopp.net` → Charts & Metrics (**MERGED 2026-11-07T20:20:30Z**)     | **First followed external link**, pointing at the declined pillar. Its effect is measurable only as a post-merge crawl and a lopp.net referral session — neither exists yet                                                  | 10  | 0   |
| 1b  | **X click path (live since 2026-11-10)**                            | @btc500halving: 206 followers, daily posts, **0 links in the five posts before 2026-11-10 and 0 x.com referral sessions in 18 readings**. From 11-10 every post carries the pillar URL; measured by GA4 x.com/t.co referrals | 9   | 1   |
| 1   | ~~CryptoQuant Quicktake~~ (demoted 2026-11-09)                      | Prepared 11-04, never sent, needs an account, followed status unverified — a second unverified queue behind the channel we already own                                                                                       | 4   | 3   |
| 2   | ~~CoinDesk~~ / ~~awesome-bitcoin~~ / ~~awesome-blockchain~~ / ~~X~~ | Lapsed (429), withdrawn (0/2, nofollow), withdrawn (never sent), false premise (no account). None restated                                                                                                                   | —   | —   |

## Open issues

- **The pillar has never been crawled with an incoming external link.** Crawl
  history: 2026-10-22, 11-05, **2026-11-07T03:42:34Z** — every one declined, every
  one before the merge. The next crawl is the first measurement of the authority
  hypothesis with its input present; until it happens "waiting does not index a
  page nobody links to" is unfalsified, not confirmed.
- **Indexation: 6 (10-22) → 5 → 3 → 2 (10-31) → 1/21 on 11-04, 11-05, 11-06 ×2,
  11-07, 11-08, 11-09, 11-10**, denominator 21 = sitemap locs. 5% coverage; 14
  crawled-not-indexed, 5 unknown, 1 Soft 404. Only `/` is indexed.
- **The buy date is live-derived (29 Nov 2026 today) and three surfaces disagree
  by a day:** site (29 Nov), dated article bodies and the X bio (30 Nov). Date-
  bearing manifest tokens are banned — they can only verify a deploy for the hours
  the estimate holds.
- **Ask routes:** 10 asks handed over since 2026-10-27, 4 carried out, #1267
  merged 2026-11-07; the live ask is the owner's X post carrying the link
  (channel-verified 2026-11-10: the pinned post is still the 2026-08-09 one).
  **0 sessions from any non-github referrer in every reading.** A `sent` cell is
  verified against the channel, never against this file.
- **A destination needs a merge record, not stars** (awesome-bitcoin: 1,358 stars,
  0 of 2). #1267 satisfies this for the first time.
- **`referral-sessions` green is a self-referral** — `github.com` is this repo and
  the owner's browser. Only a non-github referring session counts.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a 2026-08-08 crawl; serves 200, 1,383 words, no pillar duplication.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day query table sums
  to 33 of 130 byPage impressions). **`lopp.net` is www-only from a scripted
  fetch** (301 → `www` 200): a canonical-host redirect, not a removed page. The
  homepage's GSC `referringUrls` also lists `domainsc.com/page-…html`, fetched
  2026-11-08 as a parked "domain for sale" page with 0 occurrences of `btc500` —
  stale, not a referring domain.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed title/meta/H1/copy hours after three mandates forbade it. A `MANDATES`
  line needs a sha plus the diff.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`;
  dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive, due experiments, site health) → attempt
→ `npm test` + `tsc` gate → Vercel status → `last-deploy.json` against live HTML.
Map: `scripts/autonomous/ARCHITECTURE.md`.
