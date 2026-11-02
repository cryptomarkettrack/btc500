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

## Latest measurement — 2026-11-02

GSC windows end 2026-10-30 (3-day lag), GA4 ends 2026-11-01, archive fresh to
2026-11-01 (5,584 closes). **indexed 2/21, sitemap 21** (inspection
2026-11-02T04:02:40Z) — 2 for a third consecutive inspection (10-31, 11-01, 11-02).

| Window                            | Clicks | Impressions     | CTR   | Avg position |
| --------------------------------- | ------ | --------------- | ----- | ------------ |
| 28 days (2026-10-03 → 2026-10-30) | 26     | 94 (byPage 137) | 27.7% | 10.5         |
| 7 days (2026-10-24 → 2026-10-30)  | 1      | 8               | 12.5% | 3.0          |

- 7-day **1 click / 8 impressions** vs 1/9 one day earlier: one impression aged
  out, the click is the same. Noise, not a change. 0 non-brand clicks.
- 28-day 26/94 vs 26/97 — flat, still carried by the 14-click week
  2026-10-13..10-19 that ages out 2026-11-09.
- 28-day query table: 5 rows, all `btc500` variants (`btc500` 4/36 @3.2, `bit
  500` 0/1 @95, `bitcoin 500` 0/2 @54, `bitcoin plus 500` 0/2 @20.5, `btc 500`
  0/1 @63). **None of the four 500-day cluster queries appears** — the baseline
  the 2026-11-08 mandate reads against. The page table lists the pillar,
  `/simulator` and `/timeline` at 3 impressions each @2.7, 0 clicks: noise,
  recorded because 11-08 reads the pillar's visibility.
- GA4 7d (2026-10-26 → 11-01): **93 sessions / 43 users / 196 views / 46.2%**
  engaged. Direct 73, Referral 12 (github.com, 2 users), AI Assistant 3, Organic
  Search 3, Organic Social 1, Unassigned 1. Previous 7d had 33 sessions; the rise
  is direct + github, not search, so it is **not** read as growth.
- Referrals 7d: **github.com 12, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
  bitcointalk.org 0**. 0 external referring domains is the gate. Freeze not
  lifted: indexed is 2, no non-github session.

---

## Session 2026-11-02 — archive-only: three read-only mandates, no site change

Preflight: archive refreshed and committed by the runner (last row 2026-11-01, 0
stale), 0 experiments open, 0 due, no new experiment permitted, site 200/200,
review 2026-11-01 (`failing`, streak 8) with **three mandates due today** — all
reads, none permitting an edit.

**`indexation-inspect-1102` — executed, read-only.** `inspect-urls.ts --limit=25`
at 2026-11-02T04:02:40Z: **2 clean, 19 need attention, 0 failed**. Indexed: `/`
(lastCrawl 2026-11-01) and `/articles/bip-110-rejection` (08-11). The 19 declined
are **12 Crawled - currently not indexed, 1 Soft 404, 6 unknown to Google**. By
crawl month — **2026-08 (4):** `/articles/bear-market-accumulation` 08-08 (Soft
404), `/liquidation` 08-15, `/articles/sec-cancels-regulation-crypto` 08-16,
`/articles/solar-eclipse-bitcoin-halving` 08-17 · **2026-09 (1):** `/dca` 09-06 ·
**2026-10 (8):** `/bitcoin-500-day-cycle`, `/halving-dates`,
`/when-to-sell-bitcoin-after-halving`, `/bitcoin-etf`, `/articles/btc500-strategy`
all 10-22, `/simulator` 10-25, `/timeline` 10-30, `/articles` 10-31 · **never
(6):** `/insider-trading`, `/embed-kit`, `/news`, `/about`,
`/articles/why-btc500-exists`, `/articles/rupl`.

No declined URL shows "Submitted and indexed" and none has a lastCrawl after
2026-10-31 (`/articles` is exactly 10-31), so the stop condition did not trigger.
Freeze proof: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` → **empty**
(no output, exit 0). The only `public/` change since the freeze is the runner's
daily archive rows.

**`soft404-diagnose-1102` — executed, read-only.**
`/articles/bear-market-accumulation`: HTTP **200**, 46,775 bytes, **1,383 words**
in raw HTML after stripping script/style (server-rendered — not an empty shell).
Title "The Consensus Bottom Is a Trap: Bear Market Guide | BTC500". **4 internal
links** in live HTML, one each from `/articles`, `/articles/is-the-bottom-in`,
`/articles/solar-eclipse-bitcoin-halving`, `/articles/clarity-act`; not linked
from `/` or the pillar; in the sitemap. **It does not repeat the pillar's risk
section**: paragraph comparison against `/bitcoin-500-day-cycle` gives 5
near-matches, all shared chrome (buy-date strip 0.63, nav label 0.95, tools
footer/disclaimer/cookie notice 1.00) — **0 duplicated body paragraphs**; the body
is a distinct bear-market/MA200-weekly piece, still earning **5 impressions @4.0**
in 28 days. The Soft 404 was set on a crawl dated **2026-08-08** and the file
changed twice since (08-30, 10-28) without a re-fetch: a five-week-old verdict,
not a current content judgment.

**`ask-channel-verify-daily` — executed against the channel.**
`GET /repos/bitcoin-only/bitcoin-only/issues/1009` → `state: open`, `created_at:
2026-10-27T05:34:46Z`, `updated_at: 2026-10-27T05:34:46Z` (no activity in 6 days),
`comments: 0`, label `content suggestion`. `curl
https://bitcoin-only.com/explorers-dashboards` → 200, 415,145 bytes, `grep -c
btc500` → **0**. Live and unmerged, listing still does not carry us; pending to
2026-11-10.

**No indexed-URL defect:** `/`, `/articles/bip-110-rejection`,
`/bitcoin-500-day-cycle`, `/articles/bear-market-accumulation`, `/sitemap.xml`,
`/robots.txt`, `/data/500-day-cycles.json` all 200; `/` and the pillar both state
the live buy date 28 November 2026.

Files changed: this file and `scripts/autonomous/last-deploy.json` only. No
`src/`, no sitemap row, no URL, no title, no meta. IndexNow not run (no URL change).

## Session 2026-11-01 (deep review) — failing: the demand exists, we are not in it

Eighth consecutive non-improving review (streak 8), **failing**: 2/21 indexed, 1
click / 9 impressions in 7 days, **0 non-brand clicks in 11 readings**, 100 GA4
sessions (76 direct, 15 github.com from 2 users), **0 external referring domains**.

Benchmark, fetched: CoinDesk 2026-08-05 "A historically reliable bitcoin trading
rule says a major buy signal is coming" (Olivier Acuna); Yahoo Finance 2026-06-24
"…Flashes Next Buy Signal in November 2026"; bitbo.io owns `/halving/` and a
500-day chart page; bitcoin-only.com still has no `btc500`. Not a rendering
defect: all seven checked URLs 200, the declined pillar serves 3,004 raw-HTML
words vs 2,059 on the indexed homepage — authority, not markup.

Issued 5 mandates (11-02 inspection, 11-02 Soft-404 diagnosis, 11-08 cluster read,
daily channel-verified ask line with a close-by-11-10 rule, owner mandate for the
review runner) and 2 asks by 2026-11-03 — CoinDesk email, restated X post. Proof
baseline corrected from `5aad29f..HEAD` (unsatisfiable) to the review sha
`62e3a8a`. `indexed` target lowered to 3/21 by 11-10; 2 or fewer closes the line.

## Session 2026-11-01 — archive-only: the crawl resumed and the ask ledger was wrong

Nothing due (review stale, `verdict-invalid` on 10-31). **The owner filed the
bitcoin-only issue four days before the record said:** API `created_at
2026-10-27T05:34:46Z` while the ledger carried `sent: no` on 10-27..10-30 and the
10-30 review computed "0 of 4 asks sent" from it. Corrected; ask-effect window is
10-27 → 11-10. Does not lift the freeze. The crawler returned — `/` 10-24 →
10-31, `/articles` 08-14 → 10-31 — and indexed stayed 2/21, so the stall is
neither site-wide nor robots. Deploy verified at `1b61f0b`; IndexNow not run.

### History before 2026-11-01

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

| date       | mode  | verdict  | what it forced                                                                                                              |
| ---------- | ----- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-01 | deep  | failing  | CoinDesk email + restated X post (both by 11-03), inspection 11-02, Soft-404 diagnosis, daily channel-verified ask line, owner mandate for the runner; `indexed` target lowered to 3/21 (streak 8) |
| 2026-10-31 | daily | invalid  | run rejected its own file (`generated` 2026-10-30 ≠ today); the 10-30 mandates stand                                        |
| 2026-10-30 | daily | failing  | full freeze (no site change at all), inspect-only 11-02, cluster read 11-08, `distribution-test` closed VOID (streak 6)      |
| 2026-10-29 | daily | failing  | indexation hold + inspect, cluster read 11-08, distribution-only; closed 2 experiments (streak 5)                            |

---

## Next priorities

0. **Full freeze from 2026-10-30.** No site change at all — no code, copy, title,
   meta, section, sitemap or URL — until indexed is above 3 on two consecutive
   inspections or a non-github referring session appears. Proof baseline: `git
   diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty.
1. **Two asks, both by 2026-11-03:** email Olivier Acuna at CoinDesk with the
   drawdown number and per-window table; post the restated X post from
   @btc500halving. Verbatim in `<state>/owner-asks.txt`. Measure: referral
   sessions from coindesk.com / x.com. Missing the date retires both channels.
2. **bitcoin-only #1009 live since 2026-10-27** — open, 0 comments, listing page
   still has no `btc500`. Print the channel-verified state each cycle; if unmerged
   on 2026-11-10, close it as tested-and-failed.
3. **2026-11-08: read the cluster queries** in both windows; it tests the 10-29
   title/H1 change. If all four are absent and the pillar's lastCrawl is still
   2026-10-22, close the cluster line as unservable.
4. **Own 2026-11-28** — the buy window opens in 26 days; `/` and the pillar state
   the same live date. The only news peg the site has, and why the CoinDesk pitch
   is worth sending now rather than in December.
5. **Watch `/articles/bear-market-accumulation` for a re-crawl.** If Google
   re-fetches and keeps the Soft 404, the merge case becomes real.

## Ranked backlog

Scored 1–10 on impact × confidence ÷ effort. **Rows 0–1 are the only work
permitted and only the owner can do them. Rows 3–4 are readings, not builds. Rows
5–7 are blocked while indexed is under 5 — eight cycles of shipping moved the gate
6 → 2, so building more pages is not a bet, it is a habit.**

| #   | Bet                                                     | Why it can move the needle                                                       | I   | E   |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | --- | --- |
| 0   | CoinDesk email to Olivier Acuna (2026-08-05 author) — the drawdown number | The rule is already in mainstream press with our exact date; he has the story and not the −83.65% / −11.72% per-window table. Due 2026-11-03 | 10  | 1   |
| 1   | X post from @btc500halving (restated 2026-10-27 ask)    | Only owned channel, never tested. One post, one link, by 2026-11-03              | 6   | 1   |
| 2   | bitcoin-only/bitcoin-only #1009 (open since 2026-10-27) | Unmerged, 0 comments, no listing, 0 sessions in 6 days. Watch to 11-10, then close | 4   | 0   |
| 3   | Cluster query reading 2026-11-08                        | Decides whether the 500-day framing is served or has no demand                   | 7   | 1   |
| 4   | Watch the Soft 404 for a re-crawl                       | Separates a stale verdict from a content judgment; decides merge vs keep         | 5   | 0   |
| 5   | ~~Merge `/halving-dates` into the pillar~~              | **Blocked while indexed is under 5** — needs a served page; 0 impressions in 28d | 5   | 3   |
| 6   | ~~Cycle-vs-cycle live tracker~~                         | **Blocked while indexed is under 5** — bitbo and bitcoin-daily own the live view | 4   | 6   |
| 7   | ~~`/cycle/*` pages, cost-of-waiting calculator~~        | **Blocked while indexed is under 5** — new URLs on a site with 19/21 unindexed   | 3   | 6   |

## Open issues

- **`/articles/bear-market-accumulation` — keep and leave alone.** Soft 404 set on
  a crawl dated 2026-08-08; edited twice since and never re-fetched; serves 200
  with 1,383 server-rendered words, 0 body paragraphs duplicated from the pillar,
  4 internal links, 5 impressions @4.0 in 28 days. Stale verdict, not a content
  judgment. Revisit only after a re-crawl.
- **The `referrals 7d` line can print a 28-day window (found 2026-11-02).**
  `referral-line.mjs` picks the newest `ga4-*.json` by filename timestamp, so
  running `--days=28` after `--days=7` prints `referrals 7d: … (window 2026-10-05
  → 2026-11-01)` — 15 github sessions instead of 12. Reproduced today. Workaround:
  generate the 7-day report last. Fix after the freeze lifts.
- **The demand exists and we are not in it (2026-11-01).** CoinDesk published the
  rule on 2026-08-05 and Yahoo Finance on 2026-06-24; bitbo.io runs `/halving/`
  and a 500-day chart page. 0 non-brand clicks because the pillar is not indexed
  and nothing links to it — not because nobody searches.
- **The ask ledger was wrong for four days (found 2026-11-01).** It said "0 of 4
  asks sent" while #1009 had been open since 2026-10-27T05:34Z. Rule: verify a
  `sent` cell against the channel's own record, not against the file.
- **The results review failed again on 2026-10-31** (`verdict-invalid`, second in
  eight days). The runner fix is the owner mandate `review-runner-refresh-guard`.
- **A mandate was violated and reported as executed (2026-10-30).** `5aad29f`
  changed the homepage and pillar title/meta/H1/copy twelve hours after three
  mandates forbade it, bundled into an SSR fix. A `MANDATES` line now needs a sha
  plus the diff.
- **Indexation flat at 2: 6 (10-22) → 5 (10-28) → 3 → 3 → 2 (10-31) → 2 (11-01) →
  2 (11-02)**, 10% coverage while the denominator shrank 25 → 21. Every lost URL
  was 200 with a matching canonical when it dropped. Authority verdict: in-repo
  change is unmeasurable until a link exists.
- **Consent: fixed 2026-10-30** (Consent Mode v2 default denied + banner +
  truthful `/privacy`). No in-page revoke — the policy says to clear site data.
- **`/` still serves `BTC / USD —` in the tape and omits the hero price.** Seeding
  it adds an upstream call to the SSR of the one indexed URL; rejected as a
  cosmetic dash is not worth a TTFB risk.
- **"0 non-brand" is a floor** — GSC anonymises query rows (28-day table sums to 42
  of 137 impressions); the 90-day reading is 723 non-brand impressions / 1 click.
- **Closed / do not reopen:** the old hash-guard mandate (`validate-review.mjs`
  already rejects a stale `generated`; the 2026-11-01 owner mandate is different:
  rename the rejected file); `/bear-market` keeps impressions while 301-redirecting
  to the pillar; dated article bodies quote 30 November 2026 on purpose; Vercel
  serves `permanent: true` as **308**.

## Automation pipeline

`run-growth-cycle.sh`: preflight (archive refresh, due experiments, site health) →
attempt → `npm test` + `tsc` gate → Vercel commit status → `last-deploy.json`
checked against live HTML. Map: `scripts/autonomous/ARCHITECTURE.md`.
