# Ask ledger — what was handed to the owner, and whether it was sent

The only channel that can move indexation and referring domains is outside this
repo: a post, a pitch, a directory issue. The cycle prepares it; the owner
sends it. Until 2026-10-28 nothing recorded whether that happened, so every
review had to guess and the `ask-effect` signal stayed unreadable.

**One row per ask, appended, never deleted.** `sent` is `no` until there is
evidence, and the evidence has to be one of:

- the owner saying so in the file (edit the row: `sent` = `yes`, add the date),
- a GA4 referral session from the channel within 7 days of the handover date
  (`npm run referrals` prints the line; `scripts/analytics/output/ga4-latest.json`
  is the source), which is recorded as `likely` with the count, never as `yes`.

`due` is the reviewer's deadline. `overdue` rows are still the owner's work — the
cycle does not send them, and a missing send is logged as unmeasured, not as
zero.

## Asks issued by the review (owner action, cycle prepares the asset)

| id                                    | channel              | recipient                                                                | handed over | due        | sent | date sent  | proof metric                                                                                                                                                                          | status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------------ | ----------- | ---------- | ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email-bitcoinmagazine-drawdown`      | email (contact form) | bitcoinmagazine.com — newsroom / Daily Recap                             | 2026-10-27  | 2026-10-28 | no   | —          | 1 GA4 referral session from bitcoinmagazine.com in 7d                                                                                                                                 | lapsed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `community-bitcointalk-timing`        | community post       | bitcointalk.org board 1 ("Bitcoin Discussion")                           | 2026-10-27  | 2026-10-29 | yes  | 2026-11-12 | 1 GA4 referral session from bitcointalk.org in 7d                                                                                                                                     | **SENT 2026-11-12 16:31 local** — topic 5599692 (https://bitcointalk.org/index.php?topic=5599692.0), board 1, read back on the board listing; both anchors render `rel="ugc"` (referral/mention, never authority); the posting account was brand new (Activity 0, Posts 1). **First measured session 2026-11-13:** `bitcointalk.org 1/1 → /bitcoin-500-day-cycle` in the 7d window 2026-11-06 → 11-12 — the first session from any asked channel in 22 readings. One session / one user: a floor, not a result. |
| `x-cycle-window-post-restated`        | X post               | @btc500halving                                                           | 2026-10-27  | 2026-11-02 | no   | —          | 1 GA4 referral session from x.com/twitter.com in 7d                                                                                                                                   | retired 2026-11-02 — no such account found, no post in 6d                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `github-bitcoin-only-listing`         | GitHub issue         | bitcoin-only.com "Explorers & Dashboards" (owner's GitHub account)       | 2026-10-27  | 2026-11-11 | yes  | 2026-10-27 | 1 GA4 referral session from bitcoin-only.com in 14d                                                                                                                                   | **failed 2026-11-04** — 8 days open, `comments: 0`, `updated_at == created_at` 2026-10-27T05:34:46Z, 0 bitcoin-only.com sessions: tested, no effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `email-coindesk-500day-followup`      | email                | CoinDesk editorial desk → Olivier Acuna (2026-08-05 piece)               | 2026-11-01  | 2026-11-05 | no   | —          | 1 GA4 referral session from coindesk.com in 14d                                                                                                                                       | **UNEXECUTABLE 2026-11-12 — route closed** — 0 sent; address cannot be confirmed: coindesk.com/contact and coindesk.com both return HTTP 429 to a scripted fetch (2026-11-04). Not restated Checked in a real browser 2026-11-12: https://www.coindesk.com/contact returns **404** ('Hmm, that's weird. Could've sworn the page was around here somewhere…'), so the '429 to a scripted fetch' reading was the symptom of a route that does not exist — §10(a) makes the address unverifiable, and there is no page to confirm it from. Not restated, a sixth time.                                              |
| `github-awesome-bitcoin-pr`           | GitHub PR            | `igorbarinov/awesome-bitcoin` → Additional Resources                     | 2026-11-02  | 2026-11-06 | no   | —          | 1 GA4 referral session from github.com that is not the repo, plus indexed 2/21 → ≥3/21                                                                                                | **withdrawn 2026-11-03** — no open PR, and the list already closed two BTC500 PRs unmerged (#201 07-27, #202 08-02, 0 comments): record 0 of 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `github-awesome-blockchain-pr`        | GitHub PR            | `yjjnls/awesome-blockchain` → `## Releated Tools`                        | 2026-11-03  | 2026-11-06 | no   | —          | PR state via `q=author:cryptomarkettrack+repo:yjjnls/awesome-blockchain`; GA4 sessions landing on `/bitcoin-500-day-cycle` from github.com after a merge                              | **withdrawn 2026-11-04, never sent** (`q=author:cryptomarkettrack` → 0 results); `github.com` nofollow cannot move `indexed`. Replaced by `github-lopp-net-charts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `github-lopp-net-charts`              | GitHub PR            | `jlopp/lopp.net` → `bitcoin-information/trading.html` → Charts & Metrics | 2026-11-04  | 2026-11-09 | yes  | 2026-11-06 | PR #1267 state via `q=author:cryptomarkettrack+repo:jlopp/lopp.net`; merge + 1 GA4 session from lopp.net in 14d                                                                       | **MERGED 2026-11-07T20:20:30Z by jlopp** (merge commit `4585231c`, 1 file, +1/−0, `comments: 0`, `review_comments: 0`). The live destination carries the anchor: `https://www.lopp.net/bitcoin-information/trading.html` → 200, `<a href="https://btc500.net/bitcoin-500-day-cycle" … rel="noopener">BTC500</a> - 500-day cycle dashboard`, **0 `rel="nofollow"`**. First followed external link. Sent 2026-11-06T18:54:00Z, merged 25h26m later; no send-side follow-up is needed                                                                                                                                                                                                                                                            |
| `x-pinned-post-with-link-1116`        | X post               | @btc500halving (206 followers, profile URL field `btc500.net`)           | 2026-11-09  | 2026-11-16 | no   | —          | GA4 referral sessions from x.com / t.co / twitter.com in the 7d window ending 2026-11-16                                                                                              | **channel-verified unsent 2026-11-10T04:04Z** — the profile's pinned post is still `status/2086452446076002492` (2026-08-09T14:00:02Z) and no visible post 08-09 → 11-09 contains a `btc500.net` link. The cycle's own 11-10 post does carry the link (`status/2120004886423388255`), which is not the pinned ask. **MOVED 2026-11-10** from an owner ask to the cycle mandate `pin-linked-post-1111`: the cycle posts from this account with its own browser session, so the owner is no longer asked to touch X. **EXECUTED 2026-11-11 by the cycle** — the profile's pinned post is now `status/2120367269997957126` (2026-11-11T04:05Z, UTM-tagged pillar link); see the 2026-11-11 section for why it is not the post the mandate named. |
| `github-awesome-blockchain-line-1124` | GitHub PR (`github`) | `yjjnls/awesome-blockchain` → `## Releated Tools`, one line              | 2026-11-10  | 2026-11-16 | no   | —          | PR state via `q=repo:yjjnls/awesome-blockchain+btc500` (open = sent, merged = accepted) + GA4 `github.com` referral sessions with the user count (positive only above 1 user, §10(b)) | **issued 2026-11-10, one-step browser form.** Route re-verified via the GitHub API today: repo pushed 2026-11-03, 3,643 stars, `master` not archived, `## Releated Tools` holds exactly one line, and five outside PRs were merged 2026-11-03 (#147, #149, #150, #151, #146). This replaces the withdrawn 2026-11-03 `github-awesome-blockchain-pr`, whose withdrawal reason was "never sent", not a failed test. Ceiling stated: GitHub links are `rel="nofollow"` (measured 2026-11-03), so this is a discovery/referral bet, never an indexation fix. **RESTATED 2026-11-12** (deadline pulled from 2026-11-24 because the buy date is 2026-11-29): the instruction was re-verified today against the file itself — raw README is 977 lines, line 350 is the `- [0xArchive](https://docs.0xarchive.io/quickstart)` bullet and line 351 is `### Tools Directory` — so the anchor has not aged and the step count is unchanged at one page, one paste, two clicks, zero typing (§10(c): shrink it or drop it; it is already at one page). Still unsent: `GET /search/issues?q=repo:yjjnls/awesome-blockchain+btc500` → total_count 0 on 2026-11-13 (re-verified today). **CLOSED `unexecutable` 2026-11-13 by the results review, §10(c) rule 4 — third unsent handover, route dead.** Handed over 2026-11-10, restated 2026-11-12, checked again 2026-11-13: total_count 0 on all three checks, so no PR ever existed under any author. The instruction was already at the floor the rule allows (one page, one paste, two clicks, zero typing) and the anchor was re-verified today, so there is no smaller version left to hand over. Not restated a fourth time; the next ask comes from a different channel (facebook.com, proven by the ledger at 6 sessions / 6 users). The goal — one non-github referring domain producing sessions — does not move.  |
| `theblock-news-tip-1113`           | email (contact form) | The Block newsroom — `https://www.theblock.co/contact`, INQUIRY TYPE: news tips | 2026-11-12  | 2026-11-17 | no   | —          | 1 GA4 referral session from theblock.co in 14d, printed with the user count and the landing page                                                  | **issued 2026-11-12.** Route verified end to end in a real browser: theblock.co/contact → 200 with a working 'Send us a message' form and a news-tips inquiry type. Chosen because the email route had to be closed: coindesk.com/contact → 404, cointelegraph.com/contact-us and /tip → 404, bitcoinmagazine.com/contact publishes no address. The offer is the per-cycle drawdown record of the 500-day rule (median −11.7%, worst −83.65%, 4 of 4 cycles below entry) plus the live T−500 date of 29 November 2026. One page, one paste, one button, zero typing. **Still unsent 2026-11-13, 1 day old, 0 theblock.co sessions.** Kept, not restated with new text: one day is not a lapsed ask. |
| `facebook-share-1114`               | other (social share) | `facebook.com` — the owner's own account, sharing `https://btc500.net/` | 2026-11-13  | 2026-11-19 | no   | —          | GA4 named-source sessions from `facebook.com` in the 7d window ending 2026-11-20, with the user count and landing page; baseline 6 sessions / 6 users → `/` (2026-11-06 → 11-12) | **issued 2026-11-13.** Replaces the closed GitHub route. facebook.com is the highest-yield channel in the record and the only one where sessions equal users: 6 sessions / 6 users landing on `/` from one share, against 3 from 225 views across three X posts, 2 from chatgpt.com and 1 from the brand-new BitcoinTalk account. The share is unattributed, so this is a repeatability test, not a growth plan: one page, one paste, one button, and 0 sessions by 2026-11-19 means the 6 were a one-off. |

`lapsed` is not `failed`: the by-date passed with `sent: no`, so the channel was
never tested. The row stays so the next review cannot read it as "sent and
ignored". It is retired, not re-issued — one ask per week, and the one live ask is
the GitHub listing.

**2026-10-29 (results review):** the GitHub row is the only live ask and was
restated narrower — one issue, one template, submitted today, by-date unchanged
2026-11-11. Evidence refreshed: indexed 3 of 21, 0 sessions from any non-github source, 4 asks
handed over since 2026-10-27, 0 sent, 9 of 9 referral sessions github.com from 2
users (this repository). Do not add a second ask this week.

**2026-10-30 (results review):** the ask text was **rewritten to fit the
recipient's real template**, fetched today from
`https://github.com/bitcoin-only/bitcoin-only/blob/master/.github/ISSUE_TEMPLATE/content-suggestion.md`.
It requires a title of the form `Content Suggestion: NAME OF CONTENT` and three
numbered fields (Link to Content / Briefly Describe Content / Suggested Section).
The 2026-10-27 and 2026-10-29 versions had neither, so the instruction "paste the
title and body exactly as written" could not be followed at the form — a
plausible cause of 4 asks and 0 sends that is not the owner's willingness. The
corrected text is in `2026-10-27-bitcoin-only-listing.txt`; paste that. Checked
today: `bitcoin-only/bitcoin-only` has issues enabled (177 open, last push
2026-10-29) and the listing page still points contributors at the issue form. The
next review reads the `sent` column, not the prepared file. If `sent` is still
`no` on 2026-11-11, no review can move this site and the next one should say so
in one line and stop issuing asks.

**2026-10-31:** the GitHub ask was opened — issue
[#1009](https://github.com/bitcoin-only/bitcoin-only/issues/1009) _"Add BTC500 —
Bitcoin halving 500-day window dashboard (Bitcoin-only, no altcoins)"_ is **Open**
(labelled `content suggestion`), so the send happened. The row was set to `sent`
= yes and the ask window opened.

**2026-11-01 (verified, corrects the row above):** `GET
https://api.github.com/repos/bitcoin-only/bitcoin-only/issues/1009` returns
`created_at: 2026-10-27T05:34:46Z`, `author: cryptomarkettrack`, `state: open`,
`labels: [content suggestion]`. **The ask has been live since 2026-10-27, not
2026-10-31** — the 10-31 note recorded when the ledger was corrected, and the
2026-10-30 review's "0 of 4 asks sent" was wrong by one live send for four days.
Date-sent cell and the listing file now carry the API date.
What this changes for the 2026-11-11 target: the ask's exposure window is
**2026-10-27 → 2026-11-10**, and five of those fifteen days have produced
**0 sessions from bitcoin-only.com** (`npm run referrals`, window 2026-10-25 →
2026-10-31: github.com 15, every other tracked source 0). The issue body is the
owner's own wording, not the template text in
`2026-10-27-bitcoin-only-listing.txt`, and the title does not use the
`Content Suggestion: …` form. It is open and correctly labelled, so it is not a
defect — but do not re-prepare or re-send this ask; watch the referral column.

**2026-11-01 (deep review): two asks issued, and the github row is put on notice.**
(a) `email-coindesk-500day-followup` — email Olivier Acuna at CoinDesk (author of
the 2026-08-05 piece on the 500-day rule; the address is in the article's author
markup) with the per-window drawdown number. Verbatim subject and body in
`review-latest.json` → `owner_asks[0]` and `<state>/owner-asks.txt`; due
2026-11-03. (b) `x-cycle-window-post-restated` is restated narrower, due
2026-11-03 — one post from @btc500halving, no thread. The `github-bitcoin-only-listing`
row stays `sent` but is on notice: the issue is still open with 0 comments and
`https://bitcoin-only.com/explorers-dashboards` still contains no `btc500`
(verified today, 200 / 415,137 bytes). If it is still unmerged on 2026-11-10,
mark the row `failed` and stop reporting it as live. If the X post is not sent by
2026-11-03, mark that row `lapsed` and the next review stops asking for it — a
channel nobody uses is not a strategy.

Copy-paste text for the three 2026-10-27 asks lives in `<state>/owner-asks.txt`
and in `review-latest.json` → `asks[].content`. The GitHub issue text is in
`2026-10-27-bitcoin-only-listing.txt`. Do not retype it.

**2026-11-10 (results review, streak 16): X stops being an owner channel, and the
only new ask is a one-step GitHub line.** Two facts decide it. (a) The cycle has a
working browser session on `@btc500halving` and posted twice on 2026-11-10 —
`status/2120004886423388255` at 04:05:27Z carrying
`https://btc500.net/bitcoin-500-day-cycle`, and a reply at 04:06:57Z — while both X
asks handed to the owner (2026-10-27, lapsed; 2026-11-09, unsent) produced 0
sends. Asking the owner for something the automation does itself is a delay
wearing the costume of delegation, so the pin moved to the cycle mandate
`pin-linked-post-1111`. (b) The only channel with a 100% send record is
one-page GitHub: `#1009` (sent 2026-10-27) and `#1267` (sent 2026-11-06, merged
2026-11-07T20:20:30Z in 25h26m). The new ask
`github-awesome-blockchain-line-1124` is therefore one page, one paste, two
clicks, and its destination was verified today rather than assumed — repo pushed
2026-11-03, 5 outside PRs merged that day, `## Releated Tools` holding one line.
Do not re-issue it in a different shape before 2026-11-24; read the PR state.

**Ask send rate, stated so it stops being re-litigated:** 11 asks handed over
since 2026-10-27, 2 sent (both GitHub), 6 lapsed or withdrawn, 1 moved to the
cycle, 1 live (the GitHub line). Zero sessions have arrived from any asked
channel. A twelfth ask that is not one-page GitHub is not evidence of initiative.

## Pitches prepared by the cycle (same rule: owner sends)

| file                                             | channel              | recipient                                         | prepared   | sent | date sent | proof metric                                                        | status   |
| ------------------------------------------------ | -------------------- | ------------------------------------------------- | ---------- | ---- | --------- | ------------------------------------------------------------------- | -------- |
| `2026-10-27-bitcoinmagazine-data-newsletter.txt` | email (contact form) | Bitcoin Magazine newsroom                         | 2026-10-27 | no   | —         | referral from bitcoinmagazine.com                                   | not sent |
| `2026-10-27-bitcointalk-timing-test.txt`         | community post       | BitcoinTalk board 1                               | 2026-10-27 | no   | —         | referral from bitcointalk.org                                       | not sent |
| `2026-10-27-bitcoin-only-listing.txt`            | GitHub issue         | bitcoin-only.com listing (owner's GitHub account) | 2026-10-27 | no   | —         | referral from github.com that is not the repo, or a new indexed URL | not sent |

**Overlap, stated so it is not double-counted:** the Bitcoin Magazine email and
the BitcoinTalk topic each exist twice — once as a review ask (short, phone-sized)
and once as a prepared pitch (with why-them and anchor text). They are the same
send. One send per channel per week; if both get sent, still one referral row.

## Referral readings

| date       | referrals 7d                                                                   | source                                                                                                              |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 2026-10-27 | github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `review-latest.json` / ga4 report 2026-10-27                                                                        |
| 2026-10-28 | github.com 7, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `npm run referrals`, ga4 window 2026-10-21 → 2026-10-27                                                             |
| 2026-10-29 | github.com 9, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `npm run referrals`, ga4 window 2026-10-22 → 2026-10-28                                                             |
| 2026-10-30 | github.com 12, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-23 → 2026-10-29                                                             |
| 2026-11-01 | github.com 15, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-25 → 2026-10-31                                                             |
| 2026-11-02 | github.com 12, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-26 → 2026-11-01                                                             |
| 2026-11-03 | github.com 12, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-27 → 2026-11-02 (7d report, label read from the report after the fix below) |
| 2026-11-04 | github.com 8, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `npm run referrals`, ga4 window 2026-10-28 → 2026-11-03                                                             |
| 2026-11-05 | github.com 8, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `npm run referrals`, ga4 window 2026-10-28 → 2026-11-03                                                             |
| 2026-11-06 | github.com 6, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `npm run referrals`, ga4 window 2026-10-29 → 2026-11-04                                                             |
| 2026-11-06 | github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0  | `npm run referrals`, second run, ga4 window 2026-10-30 → 2026-11-05 (window slid one day)                           |

**2026-11-03 (channel-verified, `ask-verify-1103`): both live asks are unsent,
and one of the two routes has already been tried.** (a) `GET
https://api.github.com/search/issues?q=author:cryptomarkettrack+repo:igorbarinov/awesome-bitcoin`
→ `total_count: 2`, both **closed unmerged**: #201 (created 2026-07-27T19:11:54Z,
closed 2026-07-27T19:15:36Z) and #202 (created 2026-07-27T19:17:40Z, closed
2026-08-02T13:38:14Z, `merged: false`, 0 comments, one line added to `README.md`
under **Utilities** for `btc500.vercel.app`). No open PR, so the 2026-11-02 ask is
**not sent** — and the route is not untried: this list has already declined a
BTC500 line submitted in its own one-line format, without comment. The
"Additional Resources" section and the `btc500.net` domain are different, so a
third PR is not identical, but its prior record here is **0 of 2**. (b) coindesk.com
referrals: **0** in the 7-day report (2026-10-27 → 2026-11-02) and **0** in the
28-day report (2026-10-06 → 2026-11-02); the only referral row in either window is
`github.com` (12 / 15, 2 users). The CoinDesk email has therefore produced no
session, as expected for an inbox that cannot be read.

No ask was prepared, reworded or re-sent. Both rows keep `sent: no`; the 11-06
checkpoint (mark lapsed, stop issuing asks) stands and is not pre-empted here.

**2026-11-03 (tooling fix, `referral-line-fix-1105`, executed):**
`referral-line.mjs` now takes the window from the report it prints — `window.days`,
or counted from `window.start`/`end` — and `newestReport(dir, { days })` selects a
report of the requested length instead of the newest filename. `npm run referrals`
defaults to 7 and refuses to print a 28-day report under a 7-day label:
`referrals 7d: github.com 12 … (window 2026-10-27 → 2026-11-02)` and `--days=28`
→ `referrals 28d: github.com 15 …`. The 15 that the 2026-11-01 review read as a
7-day count was the 28-day figure, as the 2026-11-02 review said. Regression test:
`scripts/autonomous/referral-line.test.mjs` → "a 28-day report generated after the
7-day one cannot print as referrals 7d". The 2026-11-02 note above that deferred
this "until the freeze lifts" was wrong — the freeze covers `src/` and
`public/sitemap.xml`, not `scripts/autonomous`.

**2026-11-02 (channel-verified, the daily mandate):** `GET https://api.github.com/
repos/bitcoin-only/bitcoin-only/issues/1009` → `state: open`, `comments: 0`,
`created_at` and `updated_at` both **2026-10-27T05:34:46Z** (no activity in six
days), label `content suggestion`. `curl https://bitcoin-only.com/explorers-dashboards`
→ 200 / 415,145 bytes, `grep -c btc500` → **0**. The issue is live and unmerged
and the listing still does not carry us, so the row stays `sent` and the
ask-effect clock runs to 2026-11-10, when it is closed as tested-and-failed if
unchanged. Nothing was re-prepared or re-sent.

Tooling note (2026-11-02): `referral-line.mjs` prints the newest `ga4-*.json` by
filename, so a `--days=28` report generated after the `--days=7` one makes it
label a 28-day count as `referrals 7d` (15 github sessions instead of 12).
Reproduced today; the workaround is to generate the 7-day report last. Fixed in
the first cycle after the freeze lifts.

**2026-11-02 (results review): two routes were wrong, not two sends missing.**
The 2026-11-01 ask set was not merely unsent — parts of it were unexecutable.
(a) `email-coindesk-500day-followup` named `ollie.acuna@coindesk.com` and asserted
it was in the article's author markup. The article
`/markets/2026/08/05/why-bitcoin-s-500-day-rule-faces-its-biggest-test-yet`
publishes no author address and returns 429 to a script. The ask is re-routed to
`contact@coindesk.com`, the address CoinDesk publishes, with the subject line
addressed to Olivier Acuna; due 2026-11-05 (was 11-03).
(b) `x-cycle-window-post-restated` names `@btc500halving`; a web search returns no
such account and six days of asking produced no post. The row is **retired**, not
re-issued — a channel nobody can be shown to have is not a strategy. If the owner
has an X account, `BTC500_GROWTH.md` records that it has to be written down before
this review asks for X again.
(c) The replacement second ask is a **PR to `igorbarinov/awesome-bitcoin`**
(1,358 stars, pushed 2026-10-21, not archived, "Additional Resources" section):
one line, one link, and a route the ledger proves the owner uses — issue #1009 was
filed from `cryptomarkettrack` on 2026-10-27. Due 2026-11-06. Its state is
readable: `GET https://api.github.com/search/issues?q=author:cryptomarkettrack+repo:igorbarinov/awesome-bitcoin`
— `open` means sent, merged means done, empty means not sent.

Send counts after this review: **6 asks handed over since 2026-10-27, 1 sent, 0
referral sessions from any non-github domain.** That is the number the next review
reports first.

`github.com` is the repository and the owner's own browser sessions — it is not
a mention. The ask-effect target is 1 session from any of the other four.

**2026-11-03 (results review): the ask funnel splits by channel, and one destination
was already tried.** GitHub asks were carried out **3 of 3** (#1009 on 2026-10-27;
PRs #201 and #202 from `cryptomarkettrack`), while email, community and X asks were
sent **0 of 4**. So the failing half of this loop is not the owner's willingness in
general — it is email. Two consequences, both written into `GROWTH_PROMPT.md`:
`igorbarinov/awesome-bitcoin` is **withdrawn** (0 of 2, both closed unmerged with 0
comments); it is replaced by `yjjnls/awesome-blockchain`, which merged three outside
contributions on 2026-11-03 (#147, #149, #156) and takes a one-line entry under
`## Releated Tools`. The CoinDesk email is restated at 60 words or fewer, due
2026-11-05; if it is unsent on 11-05 the row is `lapsed` and the review stops
restating it.
Measured today and worth recording before anyone promises indexation from a list
entry: `github.com` serves `rel="nofollow"` on README links (90 of them in the
rendered `awesome-bitcoin` page). A merged line is discovery and referral traffic,
not authority. The only link that can move `indexed` is one from a publication that
carries followed links — CoinDesk, or a comparable outlet.

\*\*Reading 2026-10-29: the GA4 property has no data before 2026-10-23, which is why
the 7-day and 28-day reports return identical totals (91 sessions / 189 views).
That is a young property, not a broken window — do not quote the 28-day number as
a month of traffic.

**2026-11-04 (mandate `destination-qualify-1104`) — two destinations qualified, both
with a merge/publication record inside 14 days. No ask reworded, no PR opened.**
Referral reading, channel-verified: `npm run referrals` → `referrals 7d: github.com 8,
x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-10-28 →
2026-11-03)`. Both live asks are still unsent, checked against the channel rather
than this file: (a) `GET https://api.github.com/search/issues?q=author:cryptomarkettrack+
repo:yjjnls/awesome-blockchain` → `total_count: 0`, so the awesome-blockchain PR does
not exist yet; (b) coindesk.com is absent from the 7-day referral report, so the
email has produced no session (an inbox cannot be read; the referral column is the
only evidence). `GET .../repos/bitcoin-only/bitcoin-only/issues/1009` → `open`,
`comments: 0`, `updated_at` == `created_at` == `2026-10-27T05:34:46Z`, unchanged.

Destinations qualified today, in the order they should be attempted (details, verbatim
text and evidence in the two `.txt` files):

| file                                     | destination                                                              | followed link?                                                                 | evidence (inside 14 days)                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `2026-11-04-lopp-net-charts-metrics.txt` | `jlopp/lopp.net` → `bitcoin-information/trading.html` → Charts & Metrics | **yes** — rendered page 200, `0 rel="nofollow"`, all anchors `rel="noopener"`  | PR #1260 merged 2026-11-03 by volodymyrslipak; #1259 merged 2026-11-01 by cryptokeyhole; #1258 merged 2026-10-31 by fknoedt                      |
| `2026-11-04-cryptoquant-quicktake.txt`   | CryptoQuant Quicktake (community research feed)                          | unverified — listing page 200 / 0 nofollow, post pages 403 to a scripted fetch | "Bitcoin Is Testing the Trader Realized Price" by Trdaer_Gemini, 2026-11-04T04:08Z; "U.S. Demand Is Missing…" by BaykusCharts, 2026-11-03T20:37Z |

Disqualified by the same rule, so they are not offered again: `openblockchains/
awesome-blockchains` (newest merged PR 2023-02-10), `imbaniac/awesome-blockchain`
(2023-04-28), `coinpride/CryptoList` (2019-10-28), `awesomedata/awesome-public-datasets`
(2021-03-11). `igorbarinov/awesome-bitcoin` was already withdrawn at 0 of 2.

The lopp.net entry is the first prepared route that carries a followed link, so it is
the one to attempt first. Its known risk is stated in the file: the repo's AGENTS.md
holds brand-new services "indefinitely" until they prove they are not scams, and this
domain is about three months old.

**2026-11-04 (results review, daily) — the ledger after eleven non-improving weeks:
9 asks handed over since 2026-10-27, 3 executed, all of them GitHub.** `#1009`
opened 2026-10-27 and unchanged for 8 days (`comments: 0`, `updated_at ==
created_at`) with 0 bitcoin-only.com sessions → **failed**, not extended.
`github-awesome-blockchain-pr` never existed (`q=author:cryptomarkettrack+repo:
yjjnls/awesome-blockchain` → `0`) and `github.com` serves `nofollow` on README
links, so it is **withdrawn** rather than carried into a second week.
The CoinDesk email is **lapsed 2026-11-05**: `https://www.coindesk.com/contact`
and `https://www.coindesk.com/` both return **HTTP 429** to a scripted fetch
today, so `contact@coindesk.com` is not verifiable, and §10(a) of the review
protocol makes an unverified address invalid — the failure would be
indistinguishable from the owner ignoring it. It is not restated a fourth time.

One live ask remains, and it is the first with a followed link: `jlopp/lopp.net`
→ `bitcoin-information/trading.html` → `Charts & Metrics`, due **2026-11-06**,
text in `2026-11-04-lopp-net-charts-metrics.txt`. Verified today, independently
of the preparing cycle: rendered page 200 with **0** `rel="nofollow"`, 298 merged
PRs, `#1260` merged **2026-11-03** by volodymyrslipak in the same section. The
review corrected the prepared insertion point: `BTC500` sorts after `BitInfoCharts`
(line 113) and before `CME Futures` (line 114), not between `Bitcoin Bottom Score`
and `BitInfoCharts`.

From today, no new destination copy is written while this ask is unsent. If it is
unsent on 2026-11-07, all outreach preparation stops until 2026-11-28.

**2026-11-05 (ask gate, `ask-gate-1107` check): the live ask is still unsent.**
`GET https://api.github.com/search/issues?q=author:cryptomarkettrack+repo:jlopp/lopp.net`
→ `total_count: 0`, so the `github-lopp-net-charts` PR has not been opened; due
**2026-11-06**. `npm run referrals` → `referrals 7d: github.com 8, x.com 0, reddit.com
0, bitcoinmagazine.com 0, bitcointalk.org 0` (window 2026-10-28 → 2026-11-03).
Preparation stops while the ask is unsent; no new destination copy written today.

**2026-11-06 (ask gate, day 2 of `ask-gate-1107`): the live ask is still unsent on
its due date.** `GET https://api.github.com/search/issues?q=author:cryptomarkettrack+
repo:jlopp/lopp.net` → `total_count: 0`, and a second query with no author filter,
`q=repo:jlopp/lopp.net+btc500` → `total_count: 0`, so no PR exists under any author
and the `github-lopp-net-charts` row keeps `sent: no`. The destination is unchanged
and still qualified: `https://www.lopp.net/bitcoin-information/trading.html` → 200,
**0** `rel="nofollow"`, `grep -c BTC500` → 0. `npm run referrals` → `referrals 7d:
github.com 6, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0`
(window 2026-10-29 → 2026-11-04); 0 from any non-github referrer, so
`externalReferringDomains` is still 0 and the freeze is untouched.

The cycle cannot execute this row: it asks the owner to open a PR from the
`cryptomarkettrack` account, which `src/AGENTS.md` §13 forbids the cycle to do. The
text and the insertion point (between `BitInfoCharts`, line 105, and `CME Futures`,
line 106 — corrected from 113/114 later the same day; see the 18:40Z note below) are
unchanged in `2026-11-04-lopp-net-charts-metrics.txt`.
**No new destination copy was written today** — the 2026-11-04 rule holds while a
qualified destination is unsent. The row becomes overdue at the end of 2026-11-06;
the 11-07 checkpoint is recorded here in advance so tomorrow's cycle cannot
re-litigate it: if it is still unsent on 2026-11-07, all outreach preparation stops
until 2026-11-28, and cycles to that date are deploy verification and the daily
archive only. Do not open a second GitHub PR to compensate.

**2026-11-06 18:40Z (second channel check of the day, still `sent: no`).**
`q=author:cryptomarkettrack+repo:jlopp/lopp.net` → `total_count: 0`;
`q=repo:jlopp/lopp.net+btc500` → `total_count: 0`. `#1009` unchanged: `state:
open`, `comments: 0`, `updated_at == created_at 2026-10-27T05:34:46Z`. Destination
re-verified on its **www** host — `https://lopp.net/bitcoin-information/trading.html`
→ **301** → `https://www.lopp.net/bitcoin-information/trading.html` → 200, 205
rendered lines, `BitInfoCharts` **line 105**, `CME Futures` **line 106**, **0**
`rel="nofollow"`, **0** `BTC500`. The 112/113/114 numbers in
`2026-11-04-lopp-net-charts-metrics.txt` and in the paragraph above were stale after
PR #1264 merged on 2026-11-04; corrected to 104/105/106 in the file with that grep
output, and its `check_links.py` step removed to match the browser-only issued ask.
Entry text, PR title and PR body unchanged. No new destination copy, no second PR.
The PR body's numbers were re-derived from `public/btc-usd-max.csv` today and hold:
−83.65% worst (2012: $14.07 → low $2.30 at +128 d), −11.72% median, 4 of 4 below
entry. If the row is still `sent: no` on 2026-11-07, preparation stops to 2026-11-28.

**2026-11-06 18:36Z (second referral reading of the day).** `npm run referrals` →
`referrals 7d: github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0,
bitcointalk.org 0` (window 2026-10-30 → 2026-11-05). The count fell from 6 because
the window slid one day; still 0 from any non-github referrer.

**2026-11-07 (channel check, `outreach-stop-1107`) — the ask was SENT. PR #1267 is
open; the checkpoint's stop condition does not apply.**

`GET https://api.github.com/search/issues?q=repo:jlopp/lopp.net+btc500` →
`total_count: 1`; `q=author:cryptomarkettrack+repo:jlopp/lopp.net` → `total_count: 1`.
`GET https://api.github.com/repos/jlopp/lopp.net/issues/1267` →

```
number      = 1267
title       = trading: add BTC500 to Charts & Metrics
user        = cryptomarkettrack
state       = open
created_at  = 2026-11-06T18:54:00Z
updated_at  = 2026-11-06T18:54:00Z
closed_at   = None
comments    = 0
draft       = False
merged_at   = null
```

`created_at` is 18:54Z on 2026-11-06 — eighteen minutes after that cycle's last
channel check and 2h18m after its commit, so the 2026-11-06 rows that say `sent:
no` were true when written and are stale now. The channel wins: the row above is
set `sent: yes`, `date sent: 2026-11-06`, and the `unexecutable` marking ordered
by `outreach-stop-1107` is **not** applied — its condition ("if the PR is still
absent") is false.

The diff was read to confirm the send is the one that was prepared
(`curl -sL https://github.com/jlopp/lopp.net/pull/1267.diff`): one file
(`bitcoin-information/trading.html`), one `+` line, `@@ -103,6 +103,7 @@`, inserted
after the `BitInfoCharts` row and before the `CME Futures` row, `rel="noopener"`,
`target="_blank"`, no other line changed. Title and body match the prepared file;
the only differences are the ones corrected on 2026-11-06 (105/106, browser-only).

Referrals, same check: `npm run referrals` → `referrals 7d: github.com 3, x.com 0,
reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-10-30 →
2026-11-05)`. The 7-day GA4 report generated at 04:03Z ends 2026-11-06 and shows
**1** github.com referral session; the two numbers are different windows, not a
correction of each other. **0 sessions from lopp.net in either window** — expected,
because the line is not merged and the page does not link us yet. `externalReferringDomains`
is still **0**; the gate stays shut, and the next milestone is a merge, not a send.

No new destination copy was written today. `#1009` unchanged (`state: open`,
`comments: 0`, `updated_at == created_at 2026-10-27T05:34:46Z`).

---

## 2026-11-08 — the lopp.net PR was merged; the ask set is empty

Channel check, not ledger check (`GET https://api.github.com/repos/jlopp/lopp.net/issues/1267`
plus `/pulls/1267` and `/issues/1267/events`, 2026-11-08 04:02Z):

```
state        = closed
merged       = true
merged_at    = 2026-11-07T20:20:30Z
merge_commit = 4585231c96563900ab59d3e63ce8f74bf2ce435e
comments     = 0
changed_files= 1   additions = 1   deletions = 0
events       = merged 2026-11-07T20:20:30Z jlopp 4585231c
```

`/pulls/1267` reports `merged: true`, so the issues endpoint's `merged_at: null`
is the usual quirk, not a decline. **The destination is now live and followed.**
`https://lopp.net/bitcoin-information/trading.html` → **301** → `https://www.lopp.net/bitcoin-information/trading.html`
→ **200** (21,396 bytes). The Charts & Metrics list contains:

```html
<li>
  <a href="https://btc500.net/bitcoin-500-day-cycle" title="BTC500" target="_blank" rel="noopener"
    >BTC500</a
  >
  - 500-day cycle dashboard
</li>
```

`rel="noopener"` only — **0 `rel="nofollow"` on the anchor**, matching the 2026-11-04
qualification of the destination. This is the first followed external link BTC500
has ever had, and it points at `/bitcoin-500-day-cycle`, the page Google has
declined five inspections running.

**`github-lopp-net-policy-comment-1113` is resolved before it was due.** That owner
ask said: comment on #1267 on 2026-11-13 if it still shows 0 comments. It does show
0 comments, but the PR was merged 2026-11-07T20:20:30Z, so the comment can no
longer change anything. **No action for the owner. Do not comment, edit the body,
reopen or resubmit.** Recording it here, unchanged, because the ask list is the
reviewer's file and this ledger does not reword asks.

Referral check, same day: `npm run referrals` → `referrals 7d: github.com 0, x.com 0,
reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-11-01 →
2026-11-07)`. The GA4 7d report (2026-11-01 → 2026-11-07, Europe/Sofia) shows
**0 referral sessions** in its channel table (34 direct / 4 organic / 4 AI
Assistant / 2 unassigned) and the 28d report's only referrer is `github.com`
(15 sessions / 2 users, this repo). **0 lopp.net sessions, and that is not a
failure**: the link was live for under two hours of the 7d window and the page is
a long directory list. The measurable next step is a Google recrawl of the pillar
and a real click, neither of which can happen inside one cycle.

No new destination copy was written. The 2026-11-07 rule allows preparation to
resume once #1267 is merged or declined, but the 2026-11-07 review also deleted the
"one qualified destination per cycle" requirement because five prepared-but-unsent
packs had substituted for sends. The review has named no new destination, so the
correct output today is the merge record, not a sixth pack.

## 2026-11-09 — `lopp-merge-watch-1114` daily channel check (no change)

Channel first, ledger second. `GET https://api.github.com/repos/jlopp/lopp.net/pulls/1267`
(2026-11-09T04:05Z) → `state: closed`, `merged: true`,
`merged_at: 2026-11-07T20:20:30Z`, `merge_commit_sha: 4585231c…`, `comments: 0`,
`review_comments: 0`. The destination still serves the anchor:
`https://www.lopp.net/bitcoin-information/trading.html` →
`<a href="https://btc500.net/bitcoin-500-day-cycle" title="BTC500" target="_blank"
rel="noopener">BTC500</a> - 500-day cycle dashboard`, **0 `rel="nofollow"`**.
Nothing sent, nothing commented, nothing reopened — the ask is merge-limited and
already resolved.

Referral check, same day: `npm run referrals` → `referrals 7d: github.com 3, x.com 0,
reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-11-02 →
2026-11-08)`. The GA4 7d report for the same window shows 3 referral sessions, all
`github.com` (this repository), 0 lopp.net. **The 7d window covers only ~27h of
post-merge time (merge 2026-11-07T20:20:30Z, window ends 2026-11-08), so this is
too early, not a zero.**

The other half of the mandate — "report the first crawl after the merge" — has no
answer yet: the pillar's `lastCrawl` in the 2026-11-09T04:03:40Z inspection (21
rows) is still **2026-11-07**, and the last crawl of record (03:42:34Z that day)
precedes the merge by 16h38m. Google has not re-read the page since the link
existed.

## 2026-11-10 — `post-merge-crawl-watch-1128` (no post-merge crawl, 68h44m after the merge)

Channel first, ledger second. Raw `urlInspection` for
`https://btc500.net/bitcoin-500-day-cycle`, read 2026-11-10T04:04Z →
`coverageState: "Crawled - currently not indexed"`, `lastCrawlTime:
2026-11-07T03:42:34Z`, `robotsTxtState: ALLOWED`, `indexingState:
INDEXING_ALLOWED`, `verdict: NEUTRAL`. The timestamp comes from the API directly
because `scripts/search-console/inspect-urls.ts` slices the field to a date.

- **16h37m56s before** the merge (`merged_at 2026-11-07T20:20:30Z`) and
  **68h44m before this reading**: there is still **no crawl dated after the
  merge**. The authority hypothesis has not been tested yet; nothing about the
  link's effect can be concluded from today.
- The destination still carries the anchor: `https://lopp.net/bitcoin-information/trading.html`
  → 301 → `www` (200), `<a href="https://btc500.net/bitcoin-500-day-cycle"
title="BTC500" target="_blank" rel="noopener">`, **0 `rel="nofollow"`** (fetched
  2026-11-10).
- Referrals: `referrals 7d: github.com 3, x.com 0, reddit.com 0,
bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-11-03 → 2026-11-09)`;
  GA4 7d referral table is `github.com` 3 sessions / 1 user and nothing else.
  **0 lopp.net, 0 x.com.**
- `#1267` is merge-limited and resolved: not resubmitted, edited, commented on or
  duplicated. No second destination prepared — the review has named none and the
  merge is still the open measurement.

### The live ask, channel-verified (2026-11-10T04:04Z)

`x-pinned-post-with-link-1116` — **not sent**. Read on
https://x.com/btc500halving in the browser: the pinned post is still
`status/2086452446076002492` dated **2026-08-09T14:00:02Z**, and none of the posts
visible on the profile (2026-08-09 → 2026-11-09T04:06:07Z) contains a `btc500.net`
link. The cycle's own daily post now does carry the pillar URL —
`status/2120004886423388255`, published 2026-11-10T04:05:27Z — which is a separate
post, not the pinned one the ask describes.

Proof metric unchanged: GA4 referral sessions whose source contains `x.com`, `t.co`
or `twitter.com` within 7 days of the post, read on or after 2026-11-16.

## 2026-11-11 — `pin-linked-post-1111` executed (target changed, reason below), crawl read

**Channel first, ledger second.** All three reads below were made against the
channel itself, not against this file.

### The pin (cycle mandate, not an owner ask)

- **Executed.** The profile's first article now renders `Pinned` and is
  `https://x.com/btc500halving/status/2120367269997957126`, read back at
  **2026-11-11T04:16Z**. X confirmed it with "Your post has been pinned and added
  to highlights." The previous pin, `status/2086452446076002492`
  (2026-08-09T14:00:02Z, no `btc500.net` link), is no longer pinned.
- **The target changed, deliberately, and this is the one deviation from the
  mandate's wording.** The mandate named `status/2120004886423388255` (published
  2026-11-10T04:05:27Z). That post's link is **untagged**: it predates
  `utm-on-every-outbound-link-1118`, whose own text says an untagged post "does
  not count as distribution" because an in-app browser strips the referrer. Pinning
  it would put the one link every profile visitor sees on the surface that cannot
  be attributed — the exact defect both mandates exist to remove. So today's post
  was pinned instead and its link is
  `https://btc500.net/bitcoin-500-day-cycle?utm_source=x&utm_medium=social&utm_campaign=countdown-1111`.
  Same objective (a pinned post carrying a `btc500.net` link), one measurable
  layer better. The 11-10 post is still on the profile, unchanged.
- **Proof metric:** GA4 referral sessions with source `x.com` / `t.co` /
  `twitter.com` in the 7d window **ending 2026-11-18 or later** — the window the
  runner reads still ends 2026-11-09, so today's reading is `too early`, printed
  as `x.com referrals 7d: 0`.

### `post-merge-crawl-watch-1128` — no post-merge crawl, 3d 7h 43m after the merge

Raw `urlInspection` for `https://btc500.net/bitcoin-500-day-cycle`, read
**2026-11-11T04:03:43Z** (the collector truncates the field to a date, so the API
is called directly):

```
coverageState: "Crawled - currently not indexed"
verdict: NEUTRAL        robotsTxtState: ALLOWED     indexingState: INDEXING_ALLOWED
lastCrawlTime: "2026-11-07T03:42:34Z"                 pageFetchState: SUCCESSFUL
googleCanonical == userCanonical == https://btc500.net/bitcoin-500-day-cycle
referringUrls: ["https://btc500.vercel.app/bear-market",
                "https://btc500.net/articles/solar-eclipse-bitcoin-halving"]
```

- `lastCrawlTime` is **unchanged** for the fourth consecutive read: 16h37m56s
  **before** #1267 merged (`2026-11-07T20:20:30Z`) and 3d 7h 43m 13s before this
  reading. **No crawl dated after the merge exists.** Nothing about the link's
  effect can be concluded yet; the authority hypothesis is still untested, not
  falsified. The 2026-11-28 date does not move.
- Note the `referringUrls`: the same staleness as before — a `vercel.app` alias and
  one of our own unindexed articles — no lopp.net. That is Google's stored view
  from the 11-07 crawl, not a live read.
- Destination re-fetched 2026-11-11: `https://www.lopp.net/bitcoin-information/trading.html`
  → 200, `<a href="https://btc500.net/bitcoin-500-day-cycle" title="BTC500"
target="_blank" rel="noopener">`, **0 `nofollow`**. Still followed, still live.
- Referrals: `referrals 7d: github.com 3, x.com 0, reddit.com 0,
bitcoinmagazine.com 0, bitcointalk.org 0 (window 2026-11-03 → 2026-11-09)`.
  **0 lopp.net, 0 x.com**; 0 non-github in 20 readings.

### The live ask, channel-verified (2026-11-11T04:05Z)

`github-awesome-blockchain-line-1124` — **not sent.** `GET
/search/issues?q=repo:yjjnls/awesome-blockchain+btc500` → `total_count: 0`, so no
PR exists under any author. Nothing was posted, edited or commented on by this
cycle; the ask stays the owner's, due 2026-11-24.

`github-lopp-net-charts` — resolved, not restated. `GET
/repos/jlopp/lopp.net/pulls/1267` → `state: closed`, `merged: true`,
`merged_at 2026-11-07T20:20:30Z`, `merged_by: jlopp`, `comments: 0`. (The issues
endpoint reports `merged_at: null` for a PR — the pulls endpoint is the one that
carries the merge, and reading the wrong one is how a merged PR looks unmerged.)

## 2026-11-11 — results review: the X channel has a measured ceiling; the live ask's anchor aged

**X reach, read from the profile with the logged-in session (2026-11-11 ~05:30Z):**
211 followers, 900 posts. The five most recent posts read **56, 56, 90, 83 and
110 views** (`aria-label` = "56 views. View post analytics", etc.), with 1–5 likes
and 0 reposts on each.

| post                                   | published   | views | replies | reposts | likes | link                     |
| -------------------------------------- | ----------- | ----- | ------- | ------- | ----- | ------------------------ |
| `status/2120367269997957126` (PINNED)  | 2026-11-11T04:05Z | 56  | 1       | 0       | 1     | UTM-tagged pillar link  |
| `status/2120172389442969779` (2nd poster) | 2026-11-10T~16:00Z | 56 | 0      | 0       | 2     | none                    |
| `status/2120004886423388255`           | 2026-11-10T04:05Z | 90    | 0       | 0       | 3     | untagged pillar link    |
| `status/2119642667181089200`           | 2026-11-09   | 83    | —       | —       | 3     | none                    |
| `status/2119319777025888395`           | 2026-11-08   | 110   | —       | —       | 5     | none                    |

At ~100 views per post the channel's ceiling is single-digit sessions even at a 5%
click rate, and x.com/t.co referral sessions are still 0 in 20 readings. The daily
post is the cheapest distribution available; it is not a growth channel. Cadence
verdict 2026-11-18; stop test 2026-11-20 (see `review-latest.json`).

**The live ask's instruction had aged within one day.** `## Releated Tools` in
`yjjnls/awesome-blockchain` now carries a `### Tools Directory` block of outside
submissions (18btc, 1000x Leverage, Chain.Love) under the 0xArchive bullet the
2026-11-10 handover named, and the repo was pushed 2026-11-10T11:53Z (3,642 stars,
not archived). The ask is re-issued with the anchor re-verified (paste after line
350) and **zero typing**: the default commit message and PR title are accepted.
§10(c) applies — verify the instruction, not only the route.

**Ledger:** 12 handovers since 2026-10-27, **2 sent** (both one-page GitHub:
bitcoin-only#1009, jlopp/lopp.net#1267), 0 sessions from any asked channel.

## 2026-11-12 — gsc-request-indexing-1112 executed: Request Indexing refused, quota 0

**Attempted 2026-11-12 ~06:18Z** in the logged-in browser session
(search.google.com/search-console, property `https://btc500.net/`, property
access confirmed — the overview rendered with data).

- URL inspection for `https://btc500.net/bitcoin-500-day-cycle`: "URL is not on
  Google — Crawled - currently not indexed", last crawl shown by the UI as
  "Nov 7, 2026, 5:42:34 AM".
- Clicked **REQUEST INDEXING** → live URL test ran ("Testing if live URL can be
  indexed") → after the test, the exact response text:

  > **Quota Exceeded** — "Sorry--we couldn't process this request because you've
  > exceeded your daily quota. Please try submitting this again tomorrow."

- **Remaining daily quota: 0.** The pillar request was therefore never submitted.
  `/halving-dates` and `/simulator` were not attempted — the quota is
  account/property-wide per day, so identical refusals are guaranteed, and the
  mandate forbids retrying. Try again 2026-11-13 if a review reorders it; the
  refusal is evidence about Google-side supply, not an error.
- **Raw re-read immediately after (urlInspection API, 2026-11-12 ~06:25Z):**
  `coverageState` "Crawled - currently not indexed", `lastCrawlTime
  2026-11-07T03:42:34Z` — **unchanged**, 5d 2h 43m before this read and 12h 37m
  56s before the lopp.net merge (`2026-11-07T20:20:30Z`). Still no post-merge
  crawl. Referring urls unchanged (vercel.app alias + own unindexed article).

**The t.co sessions are real, and the Referral table never saw them.** One-off
`sessionSource` query (scripts/analytics/output/ai-assistant-source.ts,
gitignored, run 2026-11-12T06:11Z):

- `Organic Social | t.co — 3 sessions / 3 users` in **7d (2026-11-05 → 11-11)**;
  facebook.com 6/6; `AI Assistant | chatgpt.com — 2 sessions / 2 users` in 7d.
- 28d (2026-10-15 → 11-11): t.co 4/4, chatgpt.com **10/8**, facebook.com 6/6.
- `AI Assistant` has a name now: **chatgpt.com** — 10 sessions / 8 users in 28d,
  the only channel whose sessions equal users. The Referral channel table
  (github.com 8/1 in 7d) misses t.co and chatgpt.com entirely because X and
  ChatGPT land in Organic Social / AI Assistant channels.
- **0 named non-github referral sessions in 20 readings is now false.** t.co 3
  sessions / 3 users in the current 7d window is the first one. It coincides
  with the first linked posts (11-10 untagged, 11-11 pinned+tagged). The freeze
  gate condition "one GA4 referral session from a non-github domain" is met on
  this evidence; the copy exclusion until 2026-11-28 (2026-11-10 review) still
  stands and only the next review can lift it.

### The live ask, channel-verified (2026-11-12 ~06:30Z)

`github-awesome-blockchain-line-1124` — **not sent.** `GET /search/issues?q=
repo:yjjnls/awesome-blockchain+btc500` → `total_count: 0`, so no PR exists under
any author. The ask stays the owner's, due 2026-11-24, zero-typing instruction.
`jlopp/lopp.net` re-verified: `https://www.lopp.net/bitcoin-information/
trading.html` still renders the followed BTC500 anchor (0 nofollow).

## 2026-11-12 — results review: the routes are checked in a browser, one is closed for good, one newsroom route opens

**Route verification (a real browser, 2026-11-12 ~09:5xZ — not a scripted fetch,
not a ledger cell).**

| route | result today | verdict |
| ----- | ------------- | ------- |
| `https://www.coindesk.com/contact` | **404** — "Hmm, that's weird. Could've sworn the page was around here somewhere…" | route closed — `unexecutable`, not restated |
| `https://cointelegraph.com/contact-us` | 404 | no route |
| `https://cointelegraph.com/tip` | 404 | no route |
| `https://bitcoinmagazine.com/contact` | 200, a HubSpot form, **no published address** | no email route; the prepared newsletter pitch stays unsent |
| `https://www.theblock.co/contact` | 200, "Send us a message" form, INQUIRY TYPE includes news tips | **route verified — ask issued today** |
| `https://github.com/yjjnls/awesome-blockchain/edit/master/README.md` | 200; raw README 977 lines, line 350 = the 0xArchive bullet, line 351 = `### Tools Directory` | live ask's anchor re-verified, deadline pulled to 2026-11-16 |

The CoinDesk row's earlier reading — "429 to a scripted fetch, address cannot be
confirmed" — was the symptom of a route that does not exist. §10(a) makes an
unverifiable address invalid; there is no page to confirm it from. **It is not
restated a sixth time.** The email channel now has exactly one usable route
(the Block form) and one proven send record (one-page GitHub, 2 of 2).

**What the ledger still cannot see.** The reviewer's own `sessionSource` query
(2026-11-12 ~09:55Z) shows the site's only stranger traffic, which the
Referral-channel table has never shown: `t.co 3 sessions / 3 users → /` and
`facebook.com 6 / 6 → /` in 7 days, `chatgpt.com 10 sessions / 8 users` in 28
days. 13 handovers, 2 sent, 0 sessions from any asked channel. The referral
line must therefore print sources, users and landing pages from now on —
mandate `named-source-ledger-1113`.
