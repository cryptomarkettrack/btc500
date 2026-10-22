# BTC500 Growth Log

Working memory for the autonomous growth work. Keep it short, dated, and
evidence-based. Do not record guesses as results.

---

## Baseline — measured 2026-10-22

Source: Google Search Console API (property `https://btc500.net/`), via
`npm run search-console` and `npm run search-console:inspect`. Report files are
gitignored under `scripts/search-console/output/`.

| Window | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| 90 days (2026-07-22 → 2026-10-19) | 49 | 3,370 | 1.5% | 25.8 |
| 28 days (2026-09-22 → 2026-10-19) | 25 | 90 | 27.8% | 9.8 |

What the numbers actually mean:

- **Non-brand organic traffic is effectively zero.** In the last 28 days the
  only query with meaningful volume is `btc500` (40 impressions, 4 clicks,
  position 3). Everything else is 1–3 impressions.
- **The August spike was one dated news page.** The week of 10 Aug produced
  2,361 impressions, 2,067 of them on `/articles/bitcoin-week-ahead` at average
  position 6.6 — for queries like "bitcoin etf flows august 12 2026". It earned
  1 click. Since those dated pages were moved out of the index (commit
  `2c7f981`) the site sits at 30–50 impressions/week. The collapse is
  intentional, not a regression.
- **The one durable non-brand cluster is the 500-day window.** 90-day data:
  `when is 500 days before the next bitcoin halving` 12 impressions @ 8.8
  (`/halving-dates`), `what is 500 days before the next bitcoin halving` 5 @
  11.0, `bitcoin 500 day cycle` 3 @ 10.3 (`/bitcoin-500-day-cycle`). All zero
  clicks.
- **Indexation is the gate.** 6 of 25 sitemap URLs are indexed. Core pages
  (`/bitcoin-500-day-cycle`, `/simulator`, `/halving-dates`, `/dca`,
  `/timeline`, `/liquidation`) are "Crawled – currently not indexed"; `/about`,
  `/news`, `/bitcoin-etf`, `/embed-kit`, `/insider-trading`,
  `/when-to-sell-bitcoin-after-halving` are "URL is unknown to Google". Google
  downloaded the sitemap on 2026-10-22 with 0 errors.
- **Diagnosis:** the pages are not thin (1,200–1,700 rendered words each with
  original tables) and there are no canonical, robots, or duplicate-title
  problems. A three-month-old domain with no external links is simply not worth
  crawling. The blocker is authority and distribution, not on-page code.
- **Limitation:** no analytics connector in this environment. Clicks are the
  only traffic evidence available; referral and returning-visitor data are not
  measurable here.

---

## Completed work

### 2026-10-22 — T-500 answer + downloadable halving calendar

- Added a direct answer block to `/halving-dates`: "500 days before the next
  Bitcoin halving is <date> — the BTC500 buy date for this cycle", computed from
  the same live block-height model as the countdown. It previously ranked 8.8
  for that query without stating a date, so the snippet could not match intent.
- Added live dates to the two date FAQ answers (visible text only; the FAQPage
  schema stays method-based so it cannot go stale).
- Shipped `/bitcoin-halving-calendar.ics`: buy window, halving and sell window as
  all-day events with a 30-day reminder before the buy window. Generated from
  the live halving model, `text/calendar`, 1-hour edge cache. Linked from
  `/halving-dates`, `/bitcoin-500-day-cycle` and
  `/when-to-sell-bitcoin-after-halving`.
- Corrected the buy/sell dates in `llms.txt` and `llms-full.txt`: the live
  estimate is 2026-11-28 / 2029-08-24 (April 11, 2028 halving); the consensus
  April 13, 2028 projection gives 2026-11-30 / 2029-08-26. The files now state
  both instead of only the older projection.
- Tests: 12 new calendar tests (RFC 5545 escaping, 75-octet folding, CRLF,
  stable UIDs, reminder block). `npm test` 69/69, `tsc --noEmit` clean,
  production build clean, `node .output/server/index.mjs` serves the `.ics`
  with HTTP 200.
- Repo lint baseline is already failing (565 pre-existing prettier errors); no
  new violations were introduced in touched files.
- Deployed as `fdad458` to `main`. Verified in production (not via the Vercel
  dashboard — no CLI in this environment): `/bitcoin-halving-calendar.ics`
  returns 200 `text/calendar` with the buy/halving/sell events,
  `/halving-dates` renders the dated answer, and all three pages link the file.
  IndexNow accepted 25 URLs (200) after the deploy.

**Experiment:** does a dated answer plus a calendar file lift the 500-day
cluster from position ~9 to page 1 and earn the first non-brand clicks?
Measure on 2026-11-19 (28 days). Success = any non-brand click on
`/halving-dates` or a new referring domain. Inconclusive if impressions stay
under 20.

### 2026-10-22 — Daily autonomous cycle at 06:00

- `scripts/autonomous/run-growth-cycle.sh` runs the `growth-cycle` OpenCode
  agent unattended. Free OpenCode models only, in order: DeepSeek V4.1 Flash →
  GLM-5.3 Flash → MiniMax M3.1 Flash → MiMo-V2.6 Flash → Flint 40B. A model that
  crashes or finishes without a commit falls through to the next one.
- The runner locks against overlapping runs, time-boxes each attempt (90 min,
  3 h cycle), fast-forwards `main` when the tree is clean, pushes any unpushed
  commit as a safety net, polls production after the push, writes
  `~/.local/state/btc500-growth/<date>.log` and `last-status.txt`, and raises a
  macOS notification on finish or failure.
- `.opencode/agents/growth-cycle.md` is the headless agent profile: questions and
  subagents are disabled, `.env*` and Search Console credentials are unreadable,
  and force-push, history rewrites, `rm -rf`, `sudo`, and `gh` are denied.
- `scripts/autonomous/GROWTH_PROMPT.md` is the daily brief (inspect → measure
  Search Console → decide → execute → validate → push → verify production →
  update this log → report through the commit message).
- `scripts/autonomous/install-schedule.sh` installs the launchd job
  `net.btc500.growth` (06:00 daily, `caffeinate -i`, missed runs fire on wake).
  Use `--status`, `--run-now`, `--test`, `--uninstall`.
- `--test` schedules a temporary launchd job ~3 minutes ahead, so it proves the
  scheduler itself rather than just running the script by hand. Verified
  2026-10-22 at 18:51:00 EEST: launchd fired on the minute, the runner dry run
  passed, and DeepSeek answered `SMOKE_OK`.
- Verified: launchd registers the 06:00 calendar trigger; the runner works under
  an empty launchd-like environment; `opencode run --agent growth-cycle
  --model opencode/deepseek-v4.1-flash-free` resolves and replies. A full cycle
  was **not** triggered manually, to avoid racing this session. First real run:
  2026-10-23 06:00.

**Note for future sessions:** the scheduler is the runner script. Do not add a
second cron. If a run fails, read `~/.local/state/btc500-growth/<date>.log`
first; the commit message of the day is the report.

---

## Next priorities

1. **Earn external links — this is the actual blocker.** The calendar file and
   the 500-day dataset are legitimate things to cite; the site needs 5–10 real
   links from Bitcoin newsletters, r/Bitcoin-style communities, or a data
   roundup. Nothing on-page will fix indexation until that happens. Any outreach
   or posting from an external account requires owner authorization.
2. **Concentrate the crawlable surface.** `/embed-kit` (248 rendered words) and
   `/about` (411) are the weakest indexable URLs. Either deepen them with real
   content or stop presenting them as standalone pages. Keep the internal links
   to the 500-day cluster exact-anchored.
3. **Own the 2026-11-28 buy window.** It is 37 days out. Make the countdown,
   the calendar reminder and the share card point at one date, then measure
   brand vs non-brand clicks and direct traffic around it.

## Open issues

- Clicks from Poland (20 of 24 impressions in 28 days) look like owner or
  internal traffic; treat country splits as noise until volume is larger.
- `/bear-market` still earns impressions while 301-redirecting to
  `/bitcoin-500-day-cycle`; harmless, but it shows Google has not fully
  consolidated the old URL.
- No site analytics connected, so engagement and returning visitors are
  unmeasured.
