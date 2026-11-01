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

| id                               | channel              | recipient                                      | handed over | due        | sent | date sent | proof metric                                          | status     |
| -------------------------------- | -------------------- | ---------------------------------------------- | ----------- | ---------- | ---- | --------- | ----------------------------------------------------- | ---------- |
| `email-bitcoinmagazine-drawdown` | email (contact form) | bitcoinmagazine.com — newsroom / Daily Recap   | 2026-10-27  | 2026-10-28 | no   | —         | 1 GA4 referral session from bitcoinmagazine.com in 7d | lapsed     |
| `community-bitcointalk-timing`   | community post       | bitcointalk.org board 1 ("Bitcoin Discussion") | 2026-10-27  | 2026-10-29 | no   | —         | 1 GA4 referral session from bitcointalk.org in 7d     | unmeasured |
| `x-cycle-window-post-restated`   | X post               | @btc500halving                                 | 2026-10-27  | 2026-11-02 | no   | —         | 1 GA4 referral session from x.com/twitter.com in 7d   | unmeasured |
| `github-bitcoin-only-listing`    | GitHub issue         | bitcoin-only.com "Explorers & Dashboards" (owner's GitHub account) | 2026-10-27  | 2026-11-11 | yes  | 2026-10-27 | 1 GA4 referral session from bitcoin-only.com in 14d   | sent / awaiting referral |
| `email-coindesk-500day-followup` | email                | CoinDesk — Olivier Acuna (wrote the 2026-08-05 500-day-rule piece) | 2026-11-01  | 2026-11-03 | no   | —         | 1 GA4 referral session from coindesk.com in 14d       | unmeasured |

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
[#1009](https://github.com/bitcoin-only/bitcoin-only/issues/1009) *"Add BTC500 —
Bitcoin halving 500-day window dashboard (Bitcoin-only, no altcoins)"* is **Open**
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

| date       | referrals 7d                                                                  | source                                                  |
| ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| 2026-10-27 | github.com 3, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `review-latest.json` / ga4 report 2026-10-27            |
| 2026-10-28 | github.com 7, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-21 → 2026-10-27 |
| 2026-10-29 | github.com 9, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-22 → 2026-10-28 |
| 2026-10-30 | github.com 12, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-23 → 2026-10-29 |
| 2026-11-01 | github.com 15, x.com 0, reddit.com 0, bitcoinmagazine.com 0, bitcointalk.org 0 | `npm run referrals`, ga4 window 2026-10-25 → 2026-10-31 |

`github.com` is the repository and the owner's own browser sessions — it is not
a mention. The ask-effect target is 1 session from any of the other four.

Reading 2026-10-29: the GA4 property has no data before 2026-10-23, which is why
the 7-day and 28-day reports return identical totals (91 sessions / 189 views).
That is a young property, not a broken window — do not quote the 28-day number as
a month of traffic.
