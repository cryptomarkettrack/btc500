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

## Results review — 2026-11-10 (daily) — verdict `failing`, streak 16

The last review on disk (`preflight.review.fresh = false`; no 2026-11-11 review
ran). Its conclusions, still binding:

- **Indexation 1/21, seventh consecutive inspection**, 0 URLs changed state. The
  numerator is a real loss: on 2026-10-29 the index held `/`,
  `/articles/bip-110-rejection` and `/articles/bear-market-accumulation`; today
  only `/`. `bip-110` is `Crawled - currently not indexed` (lastCrawl 2026-08-11),
  `bear-market-accumulation` is `Soft 404` (lastCrawl 2026-08-08) — neither read by
  Google since August, so nothing done in October was ever evaluated.
- **Page quality is excluded as the cause, by measurement:** the pillar returns
  200, **3,007 words** rendered, canonical self-referential, robots/indexing
  ALLOWED, linked from the indexed homepage, titles distinct from `/`, and only
  **2 of its 105** sentences over 60 characters are shared with `/` (nav/consent
  boilerplate). Thin content, duplication, canonical, robots and orphan status are
  all ruled out; what is left is a three-month-old domain with one external link.
  **No cycle may offer copy, title, meta, merge or redirect work as an indexation
  fix before 2026-11-28.**
- **Non-brand clicks 0 in 19 readings.** 7d 1 click / 10 impressions / 10.0% / pos
  17.8, and the click is brand (`btc500` 1/4 @1.50); `positions4to20 = 0`.
- **Sessions down and mostly ours.** GA4 7d 67 / 21 users / 81 views / 29.9%
  engaged against 82 / 41 / 154 / 46.3%: −18.3% sessions, −48.8% users, −47.4%
  views; 52 of 67 sessions Direct from 14 users.
- **X was a channel with no click path.** 206 followers, profile URL `btc500.net`,
  and none of the five posts visible on the profile carried a link, while GA4 had
  0 x.com referral sessions in 19 readings. Since 2026-11-10 the cycle posts the
  link itself; X is a **cycle** channel, never an owner ask.
- **Input vs output:** 9 runs / 8 `shipped` / 1 failure, and a
  `git log --since=2026-11-03` over `src` and `public/sitemap.xml` returns
  **nothing** — 0 site changes, 7 of the 8 ships being the runner's price-archive
  CSV.
- Mandates: `pin-linked-post-1111` (due 11-11), `utm-on-every-outbound-link-1118`,
  `post-merge-crawl-watch-1128`, plus two owner-only runner repairs
  (`runner-record-repair-1112`, `review-run-staging-1112`). Ask: one GitHub line
  on `yjjnls/awesome-blockchain`, by 2026-11-24.
- 2026-11-09, for the record: `externalReferringDomains` 0 → 1 (lopp.net, followed,
  merged 2026-11-07T20:20:30Z) — an input, not a result.

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

Preflight: archive refreshed to 2026-11-10 (1 row appended, 0 dropped, overlap
median 0%), site 200/200, 1 experiment open (`lopp-link-effect`, reading
2026-11-28, not due), review 2026-11-10 `failing` (streak 17), 1 mandate due.
**Freeze held, provably: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml`
is empty, and `git log --since=2026-11-03 -- src public/sitemap.xml` is empty.**

- `pin-linked-post-1111` — **executed with one deliberate change of target.**
  Pinned `status/2120367269997957126` (today's post, UTM-tagged link) instead of
  the named `status/2120004886423388255` (11-10), because the named post's link is
  untagged and pinning it would put the one link every profile visitor sees on the
  surface `utm-on-every-outbound-link-1118` says cannot be attributed. Same
  objective, one measurable layer better; the 11-10 post is untouched. X confirmed
  "Your post has been pinned and added to highlights"; read back from the profile.
- `utm-on-every-outbound-link-1118` — **executed from its first day**: the post and
  the reply today each carry a tagged link; exact URLs in the commit body.
- `post-merge-crawl-watch-1128` — **executed**: no crawl after 2026-11-07T20:20:30Z.
- Growth engagement (one action): reply to @IvesTim1618's "500 days before the next
  halving is Nov 27th, Black Friday" with the live-model date and the four-window
  drawdown fact — `status/2120368167130165417`, plus one like. Logged in
  `X-ENGAGEMENT-LOG.md`. No second reply to any account already replied to this
  week.
- **No site change, no new destination, no new experiment.** #1267 resolved-merged;
  its only measurable output is the next crawl. The owner ask
  (`github-awesome-blockchain-line-1124`) is channel-verified **not sent**
  (`q=repo:yjjnls/awesome-blockchain+btc500` → 0) and stays the owner's.

## Session 2026-11-10 (04:00Z) — archive-only: first linked post

Freeze held (`62e3a8a..HEAD` empty). `post-merge-crawl-watch-1128` executed
(`lastCrawlTime` 2026-11-07T03:42:34Z, no crawl after the merge). Tuesday rotation
post `status/2120004886423388255` at 04:05:27Z — **the first visible post on the
profile carrying a `btc500.net` link**, untagged (the UTM mandate did not exist
yet). Reply + like to @HODLmemecoins' Cointelegraph quote with the drawdown fact
(`status/2120005265051300228`). That cycle also pushed the runner's unpushed
archive commit and closed the ask-ledger question of whether X is a cycle channel.

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
- **10-22 → 10-29** — declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                                                                     |
| ---------- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-11-10 | daily | failing | Page-quality causes excluded by measurement; index lost both October articles by name; 1/21 seventh. Mandates: `pin-linked-post-1111`, `utm-on-every-outbound-link-1118`, `post-merge-crawl-watch-1128`, two owner runner repairs. Ask: one GitHub line. Streak 16 |
| 2026-11-09 | daily | failing | `externalReferringDomains` 0 → 1 (lopp.net, followed); indexation 1/21 sixth; no post-merge crawl. Mandates: `post-merge-crawl-1128`, `x-link-every-post-1116`, `referral-and-site-change-line-1116`. Streak 15                                                    |
| 2026-11-07 | daily | failing | `runner-mid-run-edit-1108` (owner); `cluster-read-1108`; `lopp-merge-watch-1114`; `sessions-honest-1109`. Streak 14                                                                                                                                                |
| 2026-11-06 | daily | failing | `lopp-net-pr-current-lines-1108` (owner); `outreach-stop-1107`; `dirty-tree-guard-1107`; `runner-honesty-1108` (owner). `shipped` redefined as a diff touching `src/`/sitemap. Streak 13                                                                           |
| 2026-11-05 | daily | failing | `lopp-net-pr-send-1106` (owner); `ask-gate-1107`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` the only gate. Streak 12                                                                                                  |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID. (10-31 → 11-04 in the 11-04 commit.)                                                                                                                                     |

---

## Next priorities

0. **Full freeze stands.** Gate 1 met (`externalReferringDomains` 1, lopp.net).
   Gate 2 is `/bitcoin-500-day-cycle` indexed **or** one GA4 referral session from
   a non-github domain. Still 0 of both. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Watch the merge work — the only live signal.** Each cycle to 2026-11-28:
   re-read the pillar's raw `lastCrawlTime`; the first crawl after
   2026-11-07T20:20:30Z is the test. No post-merge crawl by then, or still
   `Crawled - currently not indexed` → write "authority hypothesis falsified for
   one followed link", name a second destination, never reopen the copy line.
2. **The 500-day cluster stays closed** through 2026-12-31. Reopening needs a
   measured change (a cluster query reappearing, or the pillar indexed).
3. **The buy-window peg is a live estimate — 29 November 2026 today, 18 days
   out.** Re-read it from the site every cycle; never from this log, an older post
   or the X bio (which still says 30 Nov).
4. **Owner mandates, not cycle work:** `runner-record-repair-1112` (missing
   2026-11-07 status row + `dirty_paths_note()` still inline in
   `run-growth-cycle.sh`), `review-run-staging-1112` (`git add -A` in
   `run-review-cycle.sh:439/:446`).

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
- **The buy date is live-derived (29 Nov 2026 today) and three surfaces disagree by
  a day:** site (29 Nov), dated article bodies and the X bio (30 Nov). Date-bearing
  manifest tokens are banned — they can only verify a deploy for the hours the
  estimate holds.
- **The account has a second poster and that poster does not link.** A post
  `status/2120172389442969779` ("Mark the date. #Bitcoin") appeared ≈2026-11-10T16:00Z,
  between the two cycles, so it was not published by this automation — and it
  carries no link. Every unlinked post from the account dilutes the one click path
  the cycle can measure. Not a defect the freeze lets us fix; the owner should know.
- **Ask routes:** 11 asks handed over since 2026-10-27, 4 carried out, #1267 merged
  2026-11-07. The live ask is `github-awesome-blockchain-line-1124`, channel-verified
  unsent today. **0 sessions from any non-github referrer in every reading.** A
  `sent` cell is verified against the channel, never against this file.
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
