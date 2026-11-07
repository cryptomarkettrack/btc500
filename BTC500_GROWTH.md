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

## Latest measurement — 2026-11-07 (04:05Z)

GSC windows still end 2026-11-04, GA4 ends 2026-11-06, archive fresh to 2026-11-06
(75,775.28). **indexed 1/21, sitemap 21** (inspection 2026-11-07T04:05:34Z, 21
rows, 0 failed to inspect): 1 indexed, 14 crawled-not-indexed, 5 unknown to
Google, 1 Soft 404. **Zero URLs changed coverage or `lastCrawl` since
2026-11-06T18:36:11Z** — the fourth consecutive 1/21.

| Window                            | Clicks | Impressions | CTR   | Avg position |
| --------------------------------- | ------ | ----------- | ----- | ------------ |
| 28 days (2026-10-08 → 2026-11-04) | 23     | 84          | 27.4% | 12.5         |
| 7 days (2026-10-29 → 2026-11-04)  | 1      | 9           | 11.1% | 20.6         |

- Both tables are identical to yesterday's reading of the previous one-day window
  (23/84, 1/9) with the window slid forward: no movement, not a recovery. The 7d
  holds `btc500` 1/3 @3.7 and `bitcoin 500` 0/1 @67; the 28d query table holds
  five rows, none of them a 500-day cluster query — **0 non-brand clicks in 17
  readings**. The 11-08 mandate makes the formal call.
- GA4 7d (10-31 → 11-06): **40 sessions / 18 users / 66 views / 52.5% engaged**,
  −60.8% against the previous 7d (102); window slid one day from yesterday's 45,
  so read it as drift, not a verdict. 28d: 154 / 60 / 294 / 46.8%.
- Referrals: GA4 7d (10-31 → 11-06) **github.com 1**; `npm run referrals` prints
  **github.com 3** for its own window (10-30 → 11-05). Different windows, not a
  correction. **0 from any non-github referrer in both**, lopp.net absent because
  the line is not merged — `externalReferringDomains` **0**, gate shut.
- **The live ask was sent: PR [jlopp/lopp.net#1267](https://github.com/jlopp/lopp.net/pull/1267),
  `state: open`, `created_at 2026-11-06T18:54:00Z`, `comments: 0`, not a draft,
  `merged_at: null`** (checked 2026-11-07 04:03Z). It was opened eighteen minutes
  after the 2026-11-06 cycle's last channel check, so that day's `sent: no` was
  true when written. First send since 2026-10-27 — the funnel is now merge-limited,
  not send-limited. The PR diff is one file, one line, after `BitInfoCharts`,
  before `CME Futures`; no other line touched.
- Production: `/` 200, `/bitcoin-500-day-cycle` 200, `/data/500-day-cycles.json`
  200, `/btc-usd-max.csv` 200, `/sitemap.xml` 200. `/btc-usd-max.csv` ends
  2026-11-06 in production (re-verified 2026-11-07 after `ae867a5` was pushed).

## Review 2026-11-07 (daily) — failing: the ask was sent, nothing downstream moved

`rule.mayClaimImproving=false` (regressed: indexation, deploy-health), 14th
consecutive non-improving review. The week's one real movement is on the input
side: **PR [jlopp/lopp.net#1267](https://github.com/jlopp/lopp.net/pull/1267) was
opened 2026-11-06T18:54:00Z** — the first ask sent since 2026-10-27, after ten
asks and ten days of prose. It is `state: open`, `comments: 0`, `merged_at: null`
(re-verified by API on 2026-11-07), and `asksExecuted` goes 3 of 10 → **4 of 10**.

Output did not move with it. indexed **1/21** for the fourth consecutive
inspection (14 crawled-not-indexed, 5 unknown, 1 Soft 404; 6/25 on 2026-10-22 →
1/21 = −5 pages in 16 days), **0 non-brand clicks in 17 readings**, 7d 1 click /
9 impressions where the one click is brand (`btc500` 1/3 @3.7) and the only
non-brand row is `bitcoin 500` 0/1 @67, **positions4to20 = 0**, GA4 7d
**40 sessions** vs 103 on 2026-10-30 (−61.2%; 29 direct, 4 organic, 1 referral),
`externalReferringDomains` **0**. `git log 62e3a8a..HEAD -- src
public/sitemap.xml` is empty: 9 recorded runs, 8 `shipped`, **0 site changes**.

The machinery regressed too. The 2026-11-07 cycle edited `run-growth-cycle.sh`
while that script was executing; the run died at 06:17:24 with `line 339: syntax
error near unexpected token ')'` and wrote **no 2026-11-07 status row** (last
row 2026-11-06T20:46:25), so today's `activity.runs=9` cannot see it. `bash -n`
passes at HEAD and the site is 200, so 2026-11-08 is not blocked — the cost is
the missing record and the skipped deploy checks. Owner mandate
`runner-mid-run-edit-1108`.

Ask for the next week: one comment on #1267 on **2026-11-13** answering
lopp.net's own `AGENTS.md` reputation rule (no account, no ads, no affiliate
links, no custody, reproducible from two static files) — not a second PR, not a
new destination. `cluster-read-1108` is still due 2026-11-08 and decides whether
the 500-day framing is closed as unservable.

## Session 2026-11-07 (04:00Z) — archive-only: the ask was sent, ledger corrected

Preflight: archive refreshed to 2026-11-06 (1 row appended), 0 experiments open, 0
due, site 200/200, review 2026-11-06 (`failing`, streak 13). Freeze held:
`git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` → **empty**.

- **`outreach-stop-1107` — stop condition false, so no stop was written.** The
  mandate says to mark the lopp.net row `unexecutable` _if the PR is still absent_.
  It is not: `q=repo:jlopp/lopp.net+btc500` → `total_count: 1` (PR #1267). The row
  is now `sent: yes / 2026-11-06`, the 04:03Z query output is quoted in
  `outreach/STATUS.md`, and no new destination copy was written. The next signal is
  a merge and a lopp.net referral, not another send.
- **`dirty-tree-guard-1107` — pre-attempt check run: tree clean, 0 paths.** The
  script half is implemented: `dirty_paths_note()` in `run-growth-cycle.sh` now
  puts a one-line, comma-free path list into `status-history.csv`
  (`pre-run-dirty-…` before an attempt, `dirty-tree-…` at exit) and the
  `dirty-tree` notification names them. It deliberately does **not** auto-commit or
  auto-remove: the CLI exits 130 while the session may still be writing, so a file
  present before an attempt cannot be told apart from live work. Verified with
  `bash -n` plus a scratch repo: `3-path(s):"d/two three.txt"|one.txt|untracked.txt`
  and `WARN: working tree is dirty before the run (2-path(s):…)`.
- No site change, no new page, no sitemap row, no copy/title/meta edit, no
  experiment opened.

## Session 2026-11-05 — `indexed-decision-1105`: the indexation line closes

- No in-repo indexation work — merge, redirect, sitemap row, title, meta, section or
  new page — again without an external referring link; gate = `externalReferringDomains > 0`.
  `indexed` target retired, backlog rows 5–7 deleted. Series: 6/25 → 5/22 → 3/21 → 2/21 → 1/21.
- Freeze held (257a504, docs only): diff since `62e3a8a` over `src`/sitemap empty.

## Session 2026-11-04 — archive-only: two destinations qualified, one followed

`destination-qualify-1104`: `jlopp/lopp.net` → `trading.html` → Charts & Metrics —
first destination in eight cycles with a **followed** link (298 merged PRs, #1260
merged 11-03 in that section). Second, CryptoQuant Quicktake, unverified followed
status. Four other lists disqualified on merge dates 2019–2023. No site file touched.

### History

- **11-06** — archive-only: the ask was re-verified **unsent** at 18:38Z (both
  GitHub search queries → 0); PR #1267 appeared at 18:54Z, after that commit. The
  lopp.net insertion point was corrected to `BitInfoCharts` 105 / `CME Futures` 106
  after PR #1264 merged 11-04, the apex→www 301 was documented, and the runner's
  dirty-tree retry policy was widened (`411b9fb`).
- **11-03** — `ask-verify-1103`: awesome-bitcoin had already closed BTC500 PRs
  #201/#202 unmerged (0 of 2), so the 11-02 ask was never sent; `referral-line.mjs`
  fixed to print the window from the report, not the newest filename.
- **11-02** — X retired (no account exists); CoinDesk re-routed to
  `contact@coindesk.com`; soft-404 diagnosis on `/articles/bear-market-accumulation`.
- **11-01** — CoinDesk (08-05), Yahoo Finance (06-24) and Investing.com (08-06) all
  ran the 500-day rule with our date; the declined pillar serves 3,004 raw-HTML
  words, so the gap is authority, not markup.
- **10-30 → 10-31** — `5aad29f` changed the homepage and pillar title/meta/H1/copy
  twelve hours after three mandates forbade it → **full freeze**. The index then
  fell 3 → 2 with nothing in the repo changing: the lever is authority.
- **10-22 → 10-29** — three declined articles 308 → `/articles`;
  `/data/500-day-cycles.json` + citation block + `Dataset` JSON-LD; drawdown study
  (−11.7% median, −83.65% worst); GA4; the 10-29 retarget was the violation.

### Review history

| date       | mode  | verdict | what it forced                                                                                                                                                                                                                                      |
| ---------- | ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-06 | daily | failing | `lopp-net-pr-current-lines-1108` (owner, due 11-09, line numbers 105/106); `outreach-stop-1107`; `cluster-read-1108`; `dirty-tree-guard-1107`; `runner-honesty-1108` (owner). `shipped` redefined as a diff touching `src/`/sitemap (streak 13)     |
| 2026-11-05 | daily | failing | Mandate `lopp-net-pr-send-1106` (owner: open the lopp.net PR by 11-06); `ask-gate-1107` sent-state checks; `cluster-read-1108`; `runner-honesty-1108` (owner). Lift condition retired — `externalReferringDomains > 0` is the only gate (streak 12) |
| 2026-11-04 | daily | failing | Indexation line closed on 11-05 (1/21); lopp.net ask with corrected insertion point; CoinDesk lapsed (429); awesome-blockchain withdrawn; #1009 failed; collector must stop quoting `--limit` inspections                                           |
| 2026-11-03 | daily | failing | CoinDesk email at 60 words; awesome-bitcoin withdrawn (0/2) → `yjjnls/awesome-blockchain`; destination needs a merge record; GitHub links are nofollow                                                                                              |
| 2026-11-02 | daily | failing | CoinDesk re-routed to `contact@coindesk.com`; X retired; cluster read 11-08; indexation decision; runner guard re-issued                                                                                                                            |
| 2026-11-01 | deep  | failing | CoinDesk email + X restated; inspection; soft-404 diagnosis; channel-verified ask line; owner mandate for the runner                                                                                                                                |
| 2026-10-30 | daily | failing | Full freeze (no site change at all), cluster read 11-08, `distribution-test` closed VOID                                                                                                                                                            |

---

## Next priorities

0. **Full freeze stands.** No code, copy, title, meta, section, sitemap or URL
   change until `externalReferringDomains > 0`. Proof each cycle:
   `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **PR [jlopp/lopp.net#1267](https://github.com/jlopp/lopp.net/pull/1267) is open
   — awaiting review, not re-issuable.** `state: open`, `comments: 0`,
   `created_at 2026-11-06T18:54:00Z`. Each cycle: re-read the state with
   `GET /repos/jlopp/lopp.net/issues/1267` and record it. **Do not resubmit, do not
   open a second PR, do not edit the body.** A decline on its `AGENTS.md`
   new-service rule is a destination no and is not retried for 90 days. The effect
   is measurable only as a `lopp.net` referral session after a merge.
2. **2026-11-08: read the four cluster queries** in both windows plus the
   pillar's coverage/lastCrawl; if all four are absent and indexed ≤2, close the
   500-day cluster as unservable and make no copy edit to `/` or the pillar
   through 2026-12-31. Today's 28d and 7d tables both lack all four.
3. **The buy-window peg, 2026-11-28** — `/` and the pillar state the same live
   date (28 November 2026, from a 2028-04-11 estimate at height 974,836) and answer
   200 from production. It is the only news peg the site has.
4. **Owner mandates, not cycle work:** `runner-honesty-1108` (collector + review
   validator fixes). `dirty-tree-guard-1107`'s script half is now in the repo.

## Ranked backlog

Only rows 0–2 are permitted work, and only the owner can do them. Rows 3–4 are
readings, not builds. Rows 5–7 were deleted on 2026-11-05 (mandate
`indexed-decision-1105`): blocked-build rows are retired, not carried forward.

| #   | Bet                                                                         | Why it can move the needle                                                                                                                                                                               | I   | E   |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0   | PR to `jlopp/lopp.net` → Charts & Metrics (**sent 11-06, awaiting review**) | **Followed link** (0 nofollow on the rendered page), 298 merged PRs, one-line format, three outside merges 10-31 → 11-03. Sent as #1267; the only input that can move the gate, now merge-limited        | 9   | 1   |
| 1   | CryptoQuant Quicktake (**prepared 11-04**)                                  | Community feed with an exact audience fit; no editorial gate, needs an account; post pages 403 to a scripted fetch, followed status unverified. Second in line, not prepared again while ask 0 is unsent | 6   | 3   |
| 2   | ~~CoinDesk email~~ / ~~awesome-blockchain PR~~ / ~~X post~~                 | Lapsed 11-05 (address unverifiable, 429), withdrawn (nofollow), retired (no account). None restated                                                                                                      | —   | —   |
| 3   | Cluster query reading 2026-11-08                                            | Decides whether the 500-day framing is served or has no demand                                                                                                                                           | 7   | 1   |

## Open issues

- **The pillar was crawled on 2026-11-05 and declined again.** First fetch since
  2026-10-22; nothing in the repo changed between the two crawls (diff since
  `62e3a8a` empty), so the decline is an authority verdict on an unchanged page.
  This is the cleanest available test of the freeze hypothesis, and it failed:
  waiting does not index a page nobody links to.
- **Indexation: 6 (10-22) → 5 (10-28) → 3 → 3 → 2 (10-31) → 2 → 2 → 2 → 1
  (11-04) → 1/21 (11-05, 11-06 twice, 11-07; no URL changed state since 11-06)**,
  denominator 21 = sitemap locs. 5% coverage; 14 crawled-not-indexed, 5 unknown,
  1 Soft 404.
- **`lopp.net` is www-only from a scripted fetch.** `https://lopp.net/…/trading.html`
  returns **301** to `https://www.lopp.net/…/trading.html` (200). Read the 301 as a
  canonical-host redirect, not a removed page; `curl -L` or the www URL for any
  future check of the destination.
- **Ask routes: one is live and it is a PR, not a send problem.** 10 asks handed
  over since 2026-10-27, 4 carried out (three earlier GitHub asks, plus PR #1267
  opened 2026-11-06T18:54:00Z), **0 sessions from any non-github referrer in every
  reading**. A `sent` cell is verified against the channel, never against this file.
- **A destination needs a merge record, not stars.** Four lists were disqualified
  on their own merge dates (2019–2023); awesome-bitcoin had 1,358 stars and a 0
  of 2 record.
- **lopp.net's reputation rule is the live risk (2026-11-04).** Its `AGENTS.md`
  holds brand-new services "indefinitely" until they prove they are not scams and
  this domain is ~3 months old; a decline on that rule should not be re-submitted
  within 90 days.
- **`referral-sessions` green is a self-referral** — `github.com` is this repo and
  the owner's browser. Only a non-github referring session counts.
- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a 2026-08-08 crawl; serves 200, 1,383 words, no pillar duplication. Stale verdict.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day table sums to
  36 of 131 byPage impressions).
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy hours after three mandates
  forbade it. A `MANDATES` line needs a sha plus the diff.
- **Settled, do not reopen:** consent (Consent Mode v2 + truthful `/privacy`);
  omitting the hero price is not worth a TTFB risk on the one indexed URL; the
  10-31 `verdict-invalid` is the owner mandate `review-runner-refresh-guard`;
  dated article bodies quote 30 November 2026 on purpose; Vercel serves
  `permanent: true` as 308.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive, due experiments, site health) → attempt
→ `npm test` + `tsc` gate → Vercel status → `last-deploy.json` against live HTML.
Map: `scripts/autonomous/ARCHITECTURE.md`.
