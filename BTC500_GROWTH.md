# BTC500 Growth Log

Working memory for the autonomous growth work. Short, dated, evidence-based. Do
not record guesses as results.

---

## Session 2026-11-19 — the one served URL stops leading with a term we invented (mandate `served-title-demand-1118`)

- **Mandate `served-title-demand-1118` — EXECUTED.** Only two tags on `/` changed:
  `<title>` is now `Next Bitcoin Halving 2028: Buy 29 Nov 2026 | BTC500` (51 chars)
  and the meta description is `Next Bitcoin halving: projected April 2028. BTC500
  buys 500 days before it — 29 November 2026 — and sells 500 days after. Live
  countdown and record.` H1, body copy, keywords, OG/Twitter tags, JSON-LD and
  every other page are byte-identical (verified against the dev SSR: OG title
  still `BTC500 — The Bitcoin 500-Day Halving Rule`, schema `name` unchanged).
  Why: all 7 clicks and 10 of 21 impressions in 7d are the brand query `btc500`
  at position 1.6; the whole non-brand footprint in 27 days is 2 impressions at
  positions 38 and 69; the old title led with "The Bitcoin 500-Day Halving Rule",
  a phrase this site coined.
- **No literal date in the copy.** `src/lib/home-snippet.ts` (new, pure, 8 tests)
  builds both strings from the live halving estimate (`halvingISO`) and the
  `computeCycle` buy date the pillar uses; the title year and the month in the
  description are derived, never typed. On the buy date the copy switches to
  "Window Opened 29 Nov 2026"; after the halving it falls back to the old static
  snippet rather than advertising a finished cycle; with no live estimate it
  falls back too, so it can never print a second date. `daysUntilBuyDate` is the
  one arithmetic helper, tested across the boundary.
- **Loader fix required by the same change.** TanStack Start runs matched loaders
  concurrently, so reading `halvingQuery` from the index loader returned an empty
  cache (measured: `cached: [["simulator-preview"]]` in dev) while the pillar's
  loader only worked because it awaited two network queries first.
  `waitForHalvingSeed()` (new, in `src/lib/seed-halving.ts`) subscribes to the
  query cache, gives up after the seeder's own 2s + 500ms budget and returns
  `null` instead of the protocol estimate — the estimate projects the next
  halving on 2028-04-17 (T-500 = 2026-12-04) while the live snapshot says
  2028-04-12 (T-500 = 2026-11-29), and a title built from the estimate would have
  printed a *second* buy date. The countdown itself prints 29 Nov 2026.
- **Measurement** (runner's reports; nothing re-collected except the raw crawl
  reads the review names). GSC 7d `2026-11-09 → 11-15`: 7 clicks / 21 impressions
  / 33.3% / avg pos 10.6, of which `btc500` 7 clicks / 10 impressions @1.6;
  non-brand rows are `500 days before next bitcoin halving` 0/1 @38 and
  `bitcoin 500` 0/1 @69; `positions4to20` 0; 2 pages with impressions. GA4 7d
  `2026-11-11 → 11-17`: 125 sessions / 40 users / 230 views / 45.6% engaged;
  **external audience 30 sessions / 21 users** (google 10/5 → `/`, facebook.com
  6/6 → `/`, bitcointalk.org 5/2 → pillar + `/timeline` `/simulator`
  `/liquidation`, t.co 4/3 → `/`, x 3/3 → pillar, bing 1/1 → `/`, ig 1/1 → `/`);
  channels Direct 88/18, Organic Social 14/13, Referral 12/3 (github.com 7/1 is
  this repo, excluded), Organic Search 11/6. **No AI Assistant row in this
  window** (chatgpt.com 0/0 in 7d, 10/8 in 28d).
- **Mandate `spacing-crawl-landing-read-1118` — EXECUTED (measurement).** Raw URL
  Inspection read at `2026-11-19T04:17Z`: `/halving-spacing` → coverage
  `URL is unknown to Google`, `lastCrawlTime` **absent (never)**, five days after
  it shipped with one crawlable link; `/paper-buy` → also *unknown to Google*,
  never crawled; `/bitcoin-500-day-cycle` → `Crawled - currently not indexed`,
  last crawl `2026-11-13T04:07:16Z`; `/` → `Submitted and indexed`,
  `lastCrawlTime 2026-11-05T07:50:37Z`. GA4 landings on `/halving-spacing` in the
  7d window: **0**. bitcointalk.org **5/2** for the window `2026-11-11 → 11-17`
  (third consecutive window at 5/2, so the 11-16 reply moved nothing). The
  2026-11-25 kill-test wording is not written yet — it is not due.
- **The 2026-11-12 cadence rule FIRED today.** Its test: no crawl of `/` dated
  after `2026-11-12` by `2026-11-19`. `/` was last crawled
  `2026-11-05T07:50:37Z` (read today), so the rule applies: the daily X post
  drops to **twice a week**, no new broadcast post on X/Instagram/Facebook, and
  the cycle's work is the measurement plus one action. Cadence is now Tuesday and
  Friday; next post 2026-11-20. No post, reply, like or pin was attempted today.
  The browser was also `paired-offline` (`tools.browse.status()`), so X views
  could not be read either; last read 2026-11-16: pinned 125 views / 3 likes.
- **`ask-effect-instrument-1118` is due tomorrow (2026-11-20)** and was not
  touched; `x-poster-node-1117` is owner-only and untouched (0 machine posts in
  32 days). The one live ask (`bitcointalk-spacing-correction-1118`, due
  2026-11-20) is still unsent and is the owner's to send — not re-prepared here.
- **Freeze proof, stated honestly:** this commit changes `src/` on purpose —
  the mandate names it and supersedes the copy ban for `/` only. No route was
  added: sitemap `<loc>` count is 22 before and after; no new URL, section or
  article. Validation: `npm test` **269 pass / 0 fail**, `tsc --noEmit` ✓,
  `npm run build` ✓, prettier + eslint clean on the five changed files.

---

## Results review 2026-11-19 (daily, streak 25) — `failing`

- **Outcomes.** `indexed` **1/22** for the **29th** consecutive reading (inspection
  2026-11-19T07:32Z, 22 rows = 22 `sitemap` locs): 1 submitted and indexed, **17
  crawled – currently not indexed**, 4 unknown to Google. GSC 7d (2026-11-10 →
  11-16): **9 clicks / 23 impressions / 39.1% / position 8.3**, of which
  `btc500` 7 clicks / 10 impressions @1.4 and `bitcoin 500` 0/1 @69 —
  **non-brand clicks 0** in the 29th consecutive reading, `positions4to20` **0**.
  Bing **0/22**, with `/` crawled today 2026-11-19T03:02:33Z and declined.
  GA4 7d (2026-11-12 → 11-18): 115 sessions / 30 users, **Direct 86/16**,
  github.com 6/1 (self, §10(b)), bitcointalk.org 5/2, google 9/4, t.co 3/1,
  x 3/3, chatgpt.com 1/1, bing 1/1, ig 1/1 — **non-direct non-github 23 sessions
  / 13 users, down from 30/21** as the Facebook 6/6 share aged out of the window
  and nothing replaced it.
- **Both engines read the site today and declined it.** Google's `lastCrawl`
  for `/articles/btc500-strategy` is **2026-11-19**, for `/simulator` 2026-11-17,
  for `/articles` 2026-11-15; Bing crawled `/` at 2026-11-19T03:02:33Z and the
  pillar at 01:02:55Z. Crawling is not the constraint; the site-level judgment is.
  Indexation is therefore no longer an in-repo goal: only a new followed external
  link can change it.
- **Compliance: 3 of 4 shippable mandates executed.** `served-title-demand-1118`
  EXECUTED (live `<title>` = `Next Bitcoin Halving 2028: Buy 29 Nov 2026 | BTC500`,
  meta description matches; H1/body/schema/OG byte-identical),
  `spacing-crawl-landing-read-1118` executed as a measurement (due 11-25),
  `no-new-url-proof-1118` complied (sitemap 22 before and after).
  `ask-effect-instrument-1118` **not executed** (due 11-20) — the report still
  prints "the community ask issued 2026-11-18 produced 5 sessions from
  bitcointalk.org" while the thread's last post is 2026-11-17 11:22. Owner
  mandate `x-poster-node-1117` untouched: all three plists still run `/bin/bash`
  on a `.mjs`.
- **The input/output mismatch, in one line.** 8 runs, 8 `shipped`, 0 failures, 3
  site changes in 7 days → 0 new indexed pages, 0 non-brand clicks, and the only
  external audience movement was a 7-session fall.
- **Strategy change:** the bitcointalk correction becomes cycle work (the
  automation holds that posting session — 4 of the thread's 9 posts are ours), and
  owner asks must now carry a link ceiling while `indexed` < 5. See
  `GROWTH_PROMPT.md` → "Owner asks are for channels we do not hold".

---

## Results review 2026-11-18 (daily, streak 24) — `failing`

- **Outcomes, all of them.** `indexed` **1/22** (inspection 2026-11-18T07:32Z, 22
  rows = 22 `sitemap` locs) for the **28th** consecutive reading since
  2026-10-22. GSC 7d (2026-11-09 → 11-15): **7 clicks / 21 impressions**, 10
  brand impressions and 7 brand clicks on `btc500` at position 1.6, **2
  non-brand impressions** (`500 days before next bitcoin halving` 0/1 @38,
  `bitcoin 500` 0/1 @69), `positions4to20` **0**. Bing **0/22**. GA4 7d
  (2026-11-11 → 11-17): 125 sessions / 40 users, **Direct 88/18**, github.com
  7/1 (self-referral, §10(b)), **non-github non-Direct 30 sessions / 21 users**
  against 29/20 the week before (+1/+1, noise); bitcointalk.org **5/2** for the
  third consecutive window.
- **Compliance: 4 of 4 shippable mandates executed, and it moved nothing.**
  `spacing-answer-1117` (569fb38 — `/halving-spacing` 200,
  `/data/halving-spacing.json` 500-day median 20.7838x, sitemap 22 locs),
  `paper-buy-internal-link-1117` (bc47204 — `curl | grep -c 'href="/paper-buy"'`
  → 1), `soft-404-row-1117` (7275365 — 23 → 22 locs, page still 200),
  `btc-talk-send-measure-1117` (executed as measurement: 5/2 unchanged, so the
  2026-11-16 reply moved nothing). `x-poster-node-1117` is owner-only, untouched,
  due 2026-11-20.
- **The input/output mismatch is the finding.** 8 runs, 8 `shipped`, 0 failures,
  3 site changes, 0 new indexed pages, 0 non-brand clicks. The new URL is
  `URL is unknown to Google` with `lastCrawl: never`; Bing fetched it
  2026-11-18T04:17:34Z and declined it.
- **Bing is closed as a tested surface (2026-11-18 review).** 0/22 six days
  after a full 21-URL submission, with `/` and the pillar crawled again
  2026-11-18T04:18:19Z / 04:19:07Z and declined. It is reading the same site
  Google refuses; stop reading it daily.
- **Strategy change, in `GROWTH_PROMPT.md`:** no new URL until `indexed` ≥ 2 or
  2026-12-02; any future page needs an existing GSC impression row for the query
  it answers; title/meta work permitted on `/` only. Row 0d is shipped and closed
  as a lever. The 29 Nov paper record is the product; the countdown is inventory.

---

## Session 2026-11-18 — the 400/500/600 spacing table the forum asked for, built from our own archive

- **Mandate `spacing-answer-1117` — EXECUTED.** New route `/halving-spacing` +
  `/data/halving-spacing.json` (`btc500/halving-spacing@1`), one sitemap row
  (22 → 23) and one server-rendered link on `/`. `src/lib/halving-spacing.ts` is
  pure and tested (7 tests, including one that locks the four 500-day multiples
  against the real archive, so the page and the simulator cannot quote two
  histories).
- **The 500-day row reproduces the simulator exactly:** 29.8977× / 34.1823× /
  11.6699× / 6.5983×, entry dates 2011-07-17 / 2015-02-25 / 2018-12-28 /
  2022-12-07, in-window lows −83.65 / −11.49 / −11.94 / −2.54% — the same fields
  as `/data/500-day-cycles.json`. That is the method proof, not an assertion.
- **400 days:** 4 windows, median **12.8506×**, worst **3.9634×**, median low
  **−7.55%**, worst low **−27.22%**; all four closed above entry. The 2012 row is
  **244.4715×** because its entry (2011-10-25, $3.16) sits 28 days before the 2011
  low — labelled as a bottom artefact on the page, in the JSON and in the test.
- **600 days:** 3 windows (2012 excluded — 2011-04-08 predates the archive's
  first row 2011-07-17), median **7.4903×**, worst **4.5544×**, median low
  **−49.61%**, worst low **−55.27%**; all three closed above entry.
- **What the page claims, and only that:** every computable window at every
  spacing closed above its entry; multiples fall cycle over cycle in every
  spacing (400: 244.5 / 17.9 / 7.8 / 4.0 · 500: 29.9 / 34.2 / 11.7 / 6.6 · 600:
  n/a / 28.2 / 7.5 / 4.6), so the decay objection is not an artefact of the
  500-day choice; the longer window is *not* the better one in this archive. No
  claim that 500 is optimal.
- **Not an indexation lever, by its own rule.** Measured only by (a)
  bitcointalk.org sessions and (b) landings on `/halving-spacing` (0 today — the
  page is hours old). Indexed **1/22** (inspection `2026-11-17`, 22 rows = 22
  sitemap locs); the sitemap is 23 from today, so tomorrow's inspection is the
  next valid denominator.
- **sitemap side effect, disclosed:** regeneration also corrected `/simulator`
  lastmod `2026-11-11 → 2026-11-16` (truthful — the 2026-11-16 $10k→$50k sweep
  edited `src/routes/simulator.tsx`) and `/` `11-15 → 11-18` (this commit edits
  `src/components/home/HomePage.tsx`).
- **Measurement (runner's 7d GA4, window 2026-11-10 → 2026-11-16,
  `ga4-2026-11-17T07-30-07.json`).** 125 sessions / 39 users / 229 views /
  44.8% engaged; **external audience 29 sessions / 20 users** (google 11/5 → `/`,
  facebook.com 6/6 → `/`, bitcointalk.org 5/2 → pillar, t.co 3/3 → `/`, x 3/3 →
  pillar, ig 1/1 → `/`, unattributed 1/1). Against 26/19 the week before: +3
  sessions, +1 user — noise at this volume. Channels: Direct 86/18, Referral
  14/3, Organic Social 13/13, Organic Search 11/5, Unassigned 1/1. **No AI
  Assistant row in this window** (chatgpt.com 0/0 in 7d, 10/5 in 28d).
- **Mandate `btc-talk-send-measure-1117` — EXECUTED (measurement).** bitcointalk.org
  is **5 sessions / 2 users** in the window ending 2026-11-16, the same figure as
  the window ending 11-15, so the 2026-11-16 11:40 reply moved nothing measurable.
  **`/paper-buy` landings: 0** (landing table: `/` 95, pillar 18, `/timeline` 4,
  `(not set)` 3, `/liquidation` 2, `/**` 1, `/insider-trading` 1, `/simulator` 1).
  Recorded per the mandate: **a 79-read thread with four replies produced 2 users;
  reads are not audience.** The read counter is not quoted as reach again.
- **X: skipped, browser offline** (`tools.browse.status()` → `paired-offline`, no
  connected browser). No post, no reply, no like, no retry. Nothing was published
  this cycle, so there is no duplicate to guard against.
- **Mandate `paper-buy-internal-link-1117` — EXECUTED.** One server-rendered
  `<a href="/paper-buy">` ("Follow the public $50,000 paper buy") added to the
  homepage's "Every completed window" call-to-action row. The `Nav.tsx` tools
  entry never reaches the HTML a crawler reads; this does. `curl -s
  https://btc500.net/ | grep -c 'href="/paper-buy"'` → **1**. No other file
  changed words.
- **Mandate `soft-404-row-1117` — EXECUTED.** `/articles/bear-market-accumulation`
  removed from `public/sitemap.xml` (23 → 22 locs, one row, no reorder) and
  excluded in `scripts/sitemap.mjs` (`SITEMAP_EXCLUDED_ARTICLES`) so the next
  regeneration cannot put it back. The page itself is untouched: still 200, still
  indexable, still in `src/lib/articles.ts`. `sitemap:check` prints "up to date
  (22 URLs)". Defect removal, not a lever. `src/lib/articles.test.ts` grew the
  matching invariant: a soft-404 slug must stay a live article and stay out of
  the sitemap, so the two files cannot drift apart silently.

---

## Session 2026-11-17 — the audience number stops over-counting people (mandate `referral-instrument-1116`), and the forum ask turns out to be sent

- **Mandate `referral-instrument-1116` — EXECUTED.** `scripts/autonomous/referral-line.mjs`
  no longer sums `totalUsers` across a source's landing-page rows; it takes one count
  per source from a new `(sessionDefaultChannelGroup, sessionSource)` table
  (`sourceTotalRows`, added to `scripts/analytics/fetch-ga4.ts` as `tables.sourceTotals`),
  falls back to the largest single landing row when an older report lacks it, caps the
  total at the property's `totals.current.users` and prints the cap when it bites, and
  adds the mandated fourth line `asked channels 7d`. Before → after on the 11-16 file:
  `bitcointalk.org 5/5` → **5/2**; `26 sessions / 22 users` → **26 sessions / 19 users**
  (property total 40). Tests: `node --test scripts/autonomous/referral-line.test.mjs`
  **27 pass / 0 fail** (5 new, including the 5/2-vs-5/5 regression and the property-total
  assertion); `npm test` **253 pass / 0 fail**; `tsc --noEmit` ✓; `npm run build` ✓;
  prettier + eslint clean on the three changed files.
- **Measurement (fresh 7d GA4, window 2026-11-10 → 11-16, `ga4-2026-11-17T04-03-33.json`).**
  125 sessions / 39 users / 229 views / 44.8% engaged. **External audience 29 sessions /
  20 users**: google 11/5 → `/` (brand, Organic Search), facebook.com 6/6 → `/` (the same
  single share), bitcointalk.org 5/2 → pillar, t.co 3/3 → `/`, x 3/3 → pillar, ig 1/1 → `/`;
  1 unattributed. Against the previous window (11-09 → 11-15, 26/19) that is +3 sessions /
  +1 user, of which +2 is google and +1 is x — noise at this volume, not a trend.
  **Asked channels 7d: bitcointalk.org 5/2, t.co 3/3, facebook.com 6/6, chatgpt.com 0/0,
  lopp.net 0/0, theblock.co 0/0, x.com 0/0.** chatgpt.com went 2/2 → 0/0: one window, not
  a channel dying.
- **The only live ask was already sent — ledger corrected from the channel.** Topic
  `5599692` carries a post by `btc500halving` at **2026-11-16 11:40:30 AM** that is the
  mandated text verbatim, plus a follow-up at 5:20:50 PM. So `bitcointalk-reply-1116` is
  **sent 2026-11-16**, not pending: 14 handovers since 2026-10-27, **4 sent, 0 live unsent
  asks**. Recorded in `outreach/STATUS.md` with the full 7-post thread. The topic's read
  counter went 37 → 76 in a day while sessions stayed 5/2 — a scripted fetch counts as a
  read on that forum, so reads are not people.
- **What the strangers in that thread asked is the most useful thing today.** Two
  independent posters asked (a) whether the result survives a different spacing — "400 or
  600 days" — and (b) whether a decaying halving supply effect makes this window unlike
  the first three. Both are robustness questions the site can answer from data it already
  has (the archive + the simulator), and neither is answerable from any page it currently
  serves. Parked as the first post-freeze content bet; not built today.
- **Indexation unchanged: 1 of 21** (inspection `2026-11-16T04:03:41Z`, 21 rows = 21
  sitemap locs) — the thirteenth reading at 1. Google crawled four URLs between 11-13 and
  11-15 and kept none; Bing 0 indexed / 15 crawled. No indexation lever was offered or
  pulled today (the 2026-11-13 closure stands to 2026-12-01).
- **Non-brand queries 28d** (window 2026-10-16 → 11-12, `npm run nonbrand`): `bitcoin 500`
  0/2 @54 → `/`; `500 days before next bitcoin halving` 0/1 @38 → `/`. Floor unchanged:
  no copy work while `indexed` < 5.
- **X: skipped, browser offline** (`tools.browse.status()` → `paired-offline`, no connected
  browser). No post, no reply, no like; not retried. Nothing was posted from this cycle, so
  there is no duplicate-slug risk and no verification to report.
- **Shipped vs archive-only, stated honestly:** this commit's only diff is measurement
  tooling, a ledger correction and this log — `git log --oneline 62e3a8a..HEAD -- src
  public/sitemap.xml` is unmoved by it. It is a **mandate executed**, not a site ship.

---

## Session 2026-11-16 (owner-approved) — the public $10,000 paper-buy record is built at `/paper-buy` (the one permitted build)

- **Scope.** The owner approved the single build the 2026-11-16 partial lift permits. New files only: `src/routes/paper-buy.tsx`, `src/components/paper/PaperBuyPage.tsx`, `src/lib/paper-buy.ts`, `src/lib/paper-buy.test.ts`, `src/lib/paper-faq.ts`, plus the generated `public/sitemap.xml` entry and the tool-generated `src/routeTree.gen.ts`. No existing page's title, meta, H1, copy or internal links changed. The sitemap's `/` lastmod moved 11-11 → 11-15 because commit `0b3fc0c` (11-15) changed real homepage components and the committed sitemap was already stale; regenerating it to add the new route is a correctness fix, not an indexation lever.
- **What the page states.** Entry date = live-derived T-500 (SSR read **29 Nov 2026, 13 days out**), notional **$10,000 paper**, entry-price source = that date's BTC/USD daily close from the bundled archive with the site's Bitstamp tail fallback, exit rule = **T+500** (SSR read 25 Aug 2029, labelled estimated), and a dated daily line (`#daily-line`) that changes once a day. Schema: WebPage + Speakable (`.lead`, `#daily-line`) + FAQPage generated from the same `PAPER_FAQ` list the page renders.
- **Honesty rules are in code, not prose.** `src/lib/paper-buy.ts` is pure and tested. Before entry: no price, no mark, no P&L ("Scheduled. $10,000 not deployed…"). Past entry with no archive close or no live mark: `awaiting-price`, no P&L — today's price is never substituted for the entry price. After exit: `closed`, last available mark, explicitly not a guaranteed fill. Nine unit tests.
- **Why this is the 11-30 product.** The countdown expires 11-29 and is worth zero on 11-30. This record is the only asset that survives it and the payload for every future send (forum bump, X post, AI citation). The 2026-11-12 BitcoinTalk topic already promises it in public.
- **Validation.** `bun run build` ✓ · `bun run typecheck` ✓ · `eslint` on new files ✓ (0 errors) · `prettier --check` ✓ · `bun test` **244 pass / 0 fail**. Dev-server SSR of `GET /paper-buy`: correct title, canonical, robots, H1, JSON-LD (`WebPage`/`SpeakableSpecification`/`FAQPage`/`BreadcrumbList`) and the daily line rendered in the HTML, not client-only. No browser was paired, so no visual screenshot QA.
- **Shipped and verified.** Commit `32c2de8`, pushed to `main`, Vercel status `success`, deployment `5vKqYd4wfy6XPgs4RL7voyjSW3QV`. Live `GET https://btc500.net/paper-buy` → **200**, correct title, self-canonical, and the daily line rendered in the production HTML: `2026-11-16 — Scheduled. $10,000 not deployed. Entry November 29, 2026 (T−500), 13 days away. Exit rule T+500 on August 25, 2029.` Live sitemap carries `/paper-buy` with `lastmod 2026-11-16`. Freeze proof `git diff --stat 52acea3..HEAD -- src public/sitemap.xml`: only the five new record files, the generated route tree and the generated sitemap entry.
- **Owner override on the freeze (2026-11-16).** The owner reported that `/paper-buy` had no shortcut and that they expected it under Tools. That explicit instruction lifts the "no internal-link change" rule for this one navigation entry. Added it as the first item of the shared `tools` array in `src/components/Nav.tsx`, which drives both the desktop Tools dropdown and the mobile Tools accordion. `Nav.tsx` is in the sitemap generator's `SHARED_COMPONENT_FILES`, so this changes no page's `lastmod`.
- **Owner corrections (2026-11-16), applied to the same build.** (1) The notional is **$50,000**, not $10,000 — the homepage tracker already uses `INVESTMENT = 50_000`, so the page now matches it. `PAPER_NOTIONAL_USD` is 50_000 and a unit test locks it. **The 2026-11-12 BitcoinTalk topic publicly promised $10,000; that external claim is now inconsistent and must be corrected in the next forum send.** (2) The owner wants P&L on the page. Added an always-visible `#pnl` panel (unrealised P&L in dollars, return %, position value, deployed capital), made the hero number the dollar P&L when a mark exists, added an explicit P&L column to the historical $50,000 table, and put `#pnl` in the Speakable selectors. Before entry the panel states plainly that no P&L exists and that the $50,000 is uninvested — it never fabricates a trade. New FAQ item explains the P&L formula. (3) The owner reported no shortcut to the page and expected it under Tools — see the navigation bullet above.
- **Validation after corrections.** `eslint` ✓ · `bun run typecheck` ✓ · `bun run build` ✓ · `npm test` **245 pass / 0 fail**.
- **Site-wide $10k → $50k sweep (owner, 2026-11-16).** The owner asked that every 10k investment mention become 50k, starting with the new Tools item. Changed: `src/components/Nav.tsx` (`$50k Paper Buy`), `src/components/home/HeroSplit.tsx` (hero CTA `Run $50,000 through the cycle`), `src/components/home/LedgerCalculator.tsx` (heading + its default input, `10000` → `50000`, so the copy and the calculator agree), `src/routes/simulator.tsx` (preset-range wording now ` $500 to $1,000,000`, still truthful against the real preset list), and the two `$10k` strings in `scripts/autonomous/x/post-daily.mjs`. `grep '\$10,000|\$10k' src` now returns only test assertions about a $10,000 profit on a $50,000 position — correct arithmetic, not site copy. Validation: prettier ✓ (excluding the broken script below), eslint ✓, typecheck ✓, build ✓, `npm test` 245/245.
- **Separate finding, not fixed: the daily X post script is syntactically broken.** `node --check scripts/autonomous/x/post-daily.mjs` fails on the committed HEAD at line 18: `if (typed !== "${text}")` inside a template literal, so the script cannot run at all. This predates this session. Left untouched deliberately — fixing it would re-enable automated X posting, which needs the owner's explicit approval. It is also why the X copy in that file still describes an old $10k promise and a hardcoded Nov 28 buy date.
- **X link preview showed the old share card — social cache, not a bad deploy (2026-11-16).** The owner pasted `https://btc500.net` into an X post and got the previous OG artwork instead of the current cycle card. Verified the symptom is not on our side: live `https://btc500.net/og/default.png` is byte-identical to the repo file (sha256 `9718c58f…`), and `git log` shows the new card landed in `b889db5` (2026-11-15). X/Telegram/LinkedIn cache OG images **per URL**, so changing the file at the same path is invisible to any URL already scraped. Fix without changing the artwork: copied the identical PNG to `public/og/default-v2.png` and pointed `DEFAULT_OG_IMAGE` (`src/lib/site.ts`) plus the three default-card references in `src/lib/articles.ts` at the new URL. New posts will force a fresh scrape. Previously published posts keep their cached image until X re-scrapes them; that cannot be forced from our side. Kept the original file — do not deduplicate the copy until old previews are gone.
- **Fixed the daily X post script and published a post (owner authorization, 2026-11-16).** `scripts/autonomous/x/post-daily.mjs` was previously unrunnable: `node --check` failed on an unescaped backtick inside the generated browser code, it imported a non-existent `opencode/mcp-browse.js`, and its verification block used `page` in Node. Rewrote it with a minimal stdio JSON-RPC client to the **opencode browse MCP** (`browse mcp` exposes `execute`, `status`, `tabs`), kept all browser work inside `execute`, injected the post text with `JSON.stringify`, typed line-by-line with `Shift+Enter` so newlines cannot submit early, and derived the buy date live from `/llms.txt` so the copy cannot go stale. Post copy uses $50,000 and the `/paper-buy` link. `node --check` ✓, prettier ✓.
  - **Live post (published with the browse tools directly, not by re-running the script — that would have duplicated it):** <https://x.com/btc500halving/status/2122389869939040716>, verified on the profile 10s after publishing with the exact text "13 days until the BTC500 buy date (29 Nov 2026) … public $50,000 paper position with live P&L … https://btc500.net/paper-buy … #Bitcoin". Compose account confirmed as @btc500halving before publishing. Link preview rendered the page's new title "BTC500 Public $50,000 Paper Buy".
- **Not done — owner's next move.** Distribution. The freeze forbids adding an internal link from any existing page, and no send has happened. The 13-day runway needs: the queued BitcoinTalk reply pointing at `/paper-buy`, one X post with a tagged link, and 5+ real relevant inbound links. Until a send happens this is an asset, not traffic.

---

## Session 2026-11-16 (04:00Z) — the pillar verdict is in: fetched successfully, still not indexed; no site change (freeze)

- **`pillar-verdict-1116` — EXECUTED (measurement only).** URL Inspection API read at
  `2026-11-16T04:03Z`, three days after the priority crawl:
  `/bitcoin-500-day-cycle` → `lastCrawlTime 2026-11-13T04:07:16Z` (unchanged),
  `pageFetchState SUCCESSFUL`, `crawledAs MOBILE`,
  `coverageState "Crawled - currently not indexed"`, `indexingState INDEXING_ALLOWED`,
  `robotsTxtState ALLOWED`. `/` on the same line → `lastCrawlTime
  2026-11-05T07:50:37Z` (11 days old, 6 days before the redesign),
  `coverageState "Submitted and indexed"`, same fetch/crawlAs/robots values.
  **a successful Google fetch of the redesigned pillar produced no index.** The
  pillar is not a page waiting to be served; it is a page Google has read and
  declined, and no cycle may describe it otherwise before 2026-11-28.
- **GSC → Sitemaps opened once (mandate's second half).** Screen: `/sitemap.xml |
  Sitemap | Submitted Nov 11, 2026 | Last read Nov 11, 2026 | Success | Discovered
  pages 21 | Discovered videos 0`, no error row. The API behind the same screen
  agrees: `lastSubmitted 2026-11-11T20:01:43Z`, `lastDownloaded
  2026-11-11T20:07:46Z`, `warnings 0`, `errors 0`, contents web submitted 21,
  indexed 0. **"No referring sitemaps detected" is a field artifact, not a
  defect**: the per-URL `sitemap[]` array is empty for `/` too, and `/` is indexed.
  Open issue closed.
- **indexed 1/21** (inspection `2026-11-16T04:03:41Z`, 21 rows of 21 sitemap
  `<loc>`): 1 PASS, 17 crawled-not-indexed, 1 discovered (`/insider-trading`),
  1 unknown (`/news`), 1 soft 404 (`/articles/bear-market-accumulation`). Twelfth
  consecutive reading at 1.
- **Measurement (runner reports; nothing re-collected except the two above).**
  GSC 7d `2026-11-06 → 11-12`: 2 clicks / 13 impressions / 15.4% / avg pos 5.69,
  both clicks brand. GSC 28d `2026-10-16 → 11-12`: 12 / 61 / 19.7% / 14.36.
  Non-brand table 28d: `bitcoin 500` 0/2 @54 → `/`; `500 days before next bitcoin
  halving` 0/1 @38 → `/`. **Floor: 1/21 indexed → no title/meta/snippet/copy work.**
  GA4 7d `2026-11-08 → 11-14`: 124 sessions / 37 users / 214 views / 37.1% engaged;
  channels Direct 89/18, Referral 14/3, Organic Social 11/11, Organic Search 6/3,
  AI Assistant 2/2, Unassigned 2/2. **External audience 22 sessions / 19 users**
  (facebook.com 6/6 → `/`, google 6/3 → `/`, bitcointalk.org 3/3 → pillar,
  t.co 3/3 → `/`, chatgpt.com 2/2 → pillar, x 2/2 → pillar). bitcointalk 1 → 3 is
  the 2026-11-12 forum send landing; facebook.com is still the same single share
  (6/6, unchanged); theblock.co 0.
- **Distribution — one UTM-tagged post, verified.** `status/2122179749300572501` at
  **2026-11-16T04:07:35Z**, on the profile 10s later: Monday shape, live count
  **13 days** read from `/` the same run, buy date **29 Nov 2026** (the site's own
  date; the prompt template's hardcoded "Nov 28" would have reopened the
  three-surface disagreement closed on 11-15), tagged link
  `https://btc500.net/bitcoin-500-day-cycle?utm_source=x&utm_medium=social&utm_campaign=countdown-1116`.
  Dedup read first: newest posts were 2026-11-15T08:44:28Z (second poster, no
  link) and 2026-11-15T05:07:50Z (`countdown-1115`); no `countdown-1116` existed.
- **Engagement:** reply + like to @KillaXBT (`status/2122116185097748601`, 4h,
  47.8K views, "The bear market floor is approaching…") with the four-window
  record — 4/4 traded below their T-500 entry first, median low −11.72%, worst
  −83.65%, median 84.5 days to the low. Reply `status/2122180032340562305`
  verified under the parent at 04:09Z and logged in `X-ENGAGEMENT-LOG.md`.
- **Views at ≈04:06Z:** pinned `status/2120172389442969779` 125 / 3 likes
  (2026-11-10, second poster, still no link); 2026-11-15 149 / 3 likes / 1 repost
  (second poster, no link); `countdown-1115` 93 / 0 likes; today's post 5 views at
  2 minutes. The pin defect is unchanged and was not retried.
- **No site change:** `git diff --stat cfa51e3..HEAD -- src public/sitemap.xml` →
  empty (see the commit body's MANDATES block).
- **Review machinery:** the 2026-11-15 review run was rejected `verdict-invalid`
  (`generated` 2026-11-14, `mode` daily where deep was expected), so the last
  accepted review is still 2026-11-14 and the streak reads 22. Not a cycle fix;
  recorded for the owner.

---

## Session 2026-11-15 (04:00Z) — the two measurement mandates are now code; no site change (freeze)

- **`external-audience-line-1114` — EXECUTED in code.** `externalAudienceLine()`
  (`scripts/autonomous/referral-line.mjs`) prints, first, before the referral and
  named-source lines:
  `external audience 7d: 19 sessions / 16 users (facebook.com 6/6 → /, google
  5/2 → /, t.co 3/3 → /, chatgpt.com 2/2 → /bitcoin-500-day-cycle, x 2/2 →
  /bitcoin-500-day-cycle, bitcointalk.org 1/1 → /bitcoin-500-day-cycle) (window
  2026-11-07 → 2026-11-13) — unattributed 3 sessions / 3 users ("(not set)")`.
  Direct and github.com are excluded by name; `(not set)` is printed separately
  rather than added or dropped, so the number reconciles with the review's 19/16
  baseline. `users` is summed per source (the review's own arithmetic), stated in
  the function's comment. Five tests, including one that fails if the line omits
  the user count or counts Direct / github.com. `node --test …referral-line.test.mjs`
  → **23 pass / 0 fail**.
- **`nonbrand-query-table-1114` — EXECUTED in code.** New
  `scripts/autonomous/nonbrand-queries.mjs` (`npm run nonbrand`) prints the table
  from the report of the requested window, each row with the landing page that
  carried most of its impressions, the report's own anonymisation note, and the
  floor line beside it. It reuses the collector's `BRAND_RE` (now exported) so the
  table and the `non-brand-clicks` signal can never disagree about what brand is.
  Empty is printed as `non-brand queries: none visible in 28d (anonymised)`, never
  `0`. Eight tests; file added to `npm test` → **235 pass / 0 fail**, `tsc
  --noEmit` clean.
- **The 28d GSC report was collected once** (mandate names a reading the runner
  does not take; the runner takes 7d): **12 clicks / 61 impressions / 19.7% / avg
  pos 14.4**, window **2026-10-16 → 11-12**. Property 61 vs byPage 105 vs query
  rows 23 — the three numbers are different aggregations and are never summed.
- **Non-brand query table, 28d (`2026-10-16 → 2026-11-12`), printed beside its
  floor:** `bitcoin 500` 0 clicks / 2 impressions @54 → `/`;
  `500 days before next bitcoin halving` 0/1 @38 → `/`. Brand in the same window:
  `btc500` 5/19 @2.42. `positions4to20` = 0. **Floor: no title, meta, snippet,
  copy or internal-link work as a non-brand action while `indexed` < 5** — today
  1/21, so none is permitted (recorded in Open issues).
- **Distribution — one UTM-tagged post, one reply + like.** Post
  `status/2121832526075592780` at **2026-11-15T05:07:50Z**, verified on the
  profile 8s later: live count **14 days** (read from `/` the same run), buy date
  **29 Nov 2026** (the site's own date — the X bio now reads Nov 29 too, so the
  three-surface disagreement recorded on 2026-11-11 is closed), tagged link
  `https://btc500.net/bitcoin-500-day-cycle?utm_source=x&utm_medium=social&utm_campaign=countdown-1115`.
  Sunday has no template in the rotation, so the countdown shape was used with the
  live number, never a hardcoded one.
- **Engagement:** reply + like to @parabolachart
  (`status/2121811037481763226`, "BTC: The 500-Day Window Is Opening…", 1h old,
  94 views) adding the 4/4 below-entry record; reply
  `status/2121833086157734263` verified under the parent at 05:10:04Z. Created
  `scripts/autonomous/X-ENGAGEMENT-LOG.md` (did not exist) and logged it.
- **Views read at ≈05:05Z:** pinned (2026-11-10, still the second poster's
  unlinked post) 94 / 3 likes; 2026-11-14 71 / 1; 2026-11-13 107 / 2; 2026-11-12
  72 / 1 and 76 / 2. The pin defect is unchanged and was not retried (a screen
  that accepts the action and does nothing, three attempts on 2026-11-14).
- **No site change:** `git diff --stat d3f72f4..HEAD -- src public/sitemap.xml`
  → empty (see the commit body's MANDATES block).

---


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

---

## Results review 2026-11-16 (daily, streak 22) — `failing` — the freeze is partially lifted for one build

- **The one number that moved:** external audience **19 → 26 sessions** (window
  2026-11-09 → 11-15: google 9/5 → `/`, facebook.com 6/6 → `/`, bitcointalk.org
  5/2 → pillar, t.co 3/3 → `/`, x 2/2 → pillar, chatgpt.com 1/1 → pillar = 26
  sessions / 19 users). Two thirds of the gain is `google` (Organic Search 5/2 →
  9/5), which four weeks of reviews cannot move and which is entirely brand
  queries on `/`; the rest is bitcointalk 1 → 5 from the 2026-11-12 send.
- **The one number that did not move, for the 12th reading:** `indexed` **1/21**
  (inspection `2026-11-16T04:03:41Z`, 21 rows = 21 sitemap `<loc>`). Bing **0/21**
  after crawling 15 URLs (homepage `2026-11-15T23:38:24Z`). Non-brand clicks **0
  in 25 readings**; 3 clicks / 13 impressions in 7d, all brand; `positions4to20` = 0.
- **Input vs output:** 8 cycles, 8 `shipped`, 0 failures, and the site diff is
  **0 lines since 2026-11-12** (freeze). The work that did ship is measurement
  (the external-audience line, the non-brand table, the pillar verdict) — the
  first two are now instruments the cycle actually reads.
- **Instrument defect found today:** `npm run referrals` prints **26 sessions / 22
  users** while the same GA4 file's `referrals` table says `bitcointalk.org 5
  sessions / 2 users`. `externalAudienceLine()` sums users **per landing row**
  (bitcointalk lands on 4 pages → 5 "users"). Channel-level user sums are 41
  against a property total of 40, so 22 is arithmetic, not people. Honest figure:
  **26 sessions / 19 users**. Mandate `referral-instrument-1116`.
- **Ask ledger is the failure, again:** four asks were handed over since 2026-11-09
  (x-pinned-post-with-link-1116, github-awesome-blockchain-line-1124,
  theblock-news-tip-1113, facebook-share-1114) and **0 were sent**; two lapse
  today, The Block on 11-17 (its form returns **403** to a fetch, so the route is
  not re-verifiable), Facebook on 11-19. `github-awesome-blockchain-line-1124`
  re-issued a destination the ledger had **withdrawn on 2026-11-04** — dead routes
  were re-opened instead of counted.
- **THE FREEZE IS PARTIALLY LIFTED (this review) — one build only.** The original
  lift condition ("one GA4 referral session from a domain other than github.com")
  is met twice over: bitcointalk.org 1/1 (window to 11-13) and 5/2 (window to
  11-15). In 17 days of total freeze: 0 indexed pages gained, 0 non-brand clicks,
  0 new referring domains. **Permitted now: the public $10,000 paper-buy record at
  a stable URL** — which the 2026-11-12 BitcoinTalk topic already promises
  ("on Nov 29, 2026 the rule opens a public $10,000 paper buy, tracked daily to the
  exit (T+500, currently around Aug 2029)"). Nothing exists for it: `grep -rin
  paper src/` returns no page and this log has never contained the word. **The
  copy ban stays** (no title/meta/snippet/section/article/internal-link work while
  `indexed` < 5, today 1/21).
- **The countdown expires 2026-11-29 and the site has no 11-30 product.** That is
  the strategic finding of the week: the only live hook is a countdown, and on
  Monday 30 November it is worth zero. The paper record is the post-buy-date
  product and the only thing on this site that can bring a visitor back.
- **Review machinery:** the 2026-11-15 run was `verdict-invalid` (generated
  2026-11-14, mode daily where deep was expected) — the third invalid day in 30
  and the second Sunday in a row. No deep review since 2026-11-01.

## Results review 2026-11-14 (daily, streak 21) — `failing` — compressed

- `indexed` **1/21** (rows 21 of 21) for the 11th consecutive reading; non-brand
  clicks **0 in 24 readings**; `positions4to20` = 0; Bing **0/21** after crawling
  14 URLs including `/` (2026-11-13T23:23:57Z) and keeping none.
- **The finding is the composition, not the total.** GA4 7d `2026-11-07 → 11-13`:
  108 sessions / 34 users of which **Direct 79/17** and **github.com 8/1** (this
  repo) — **external audience 19 sessions / 16 users**. That number, not
  `sessions`, is what the daily report must lead with (mandate
  `external-audience-line-1114`, shipped in code 2026-11-15).
- **Input vs output:** 39 commits, 7 runs, 7 `shipped` statuses, and the site diff
  is 46 files all dated 2026-11-11/12. Since 11-12: 29 commits, **0 lines of site
  change**, 0 index changes. `shipped` is a runner status, not an outcome.
- **Two engines, one answer:** Google took 21 URLs and kept `/`; Bing took 21 and
  kept none. Levers stay closed to 2026-12-01.
- **Rules it set (still binding):** PERFORMANCE gains `external audience 7d`;
  no title/meta/snippet/copy/internal-link work as a non-brand action while
  `indexed` < 5; the non-brand table is printed every run from the 28d report;
  `pagesWithImpressions` is always quoted with its window (the same file carried
  page impressions 18 vs property 15 — never summed).
- **Compliance:** `inspection-denominator-1114` executed in code (30/30 tests);
  `indexation-levers-closed-1114` complied (empty `src`/sitemap diff);
  `pillar-verdict-1116` due 11-16, `bing-verdict-1118` due 11-18 (carried);
  `runner-add-scope-1115` (owner, `git add -A` at `run-review-cycle.sh:443/:450`)
  **not executed, 9th statement**.
- **Asks:** theblock-news-tip-1113 and facebook-share-1114 both unsent, 0 sends.

## Session 2026-11-13 — compressed — Request Indexing worked, the crawl still declined

- Request Indexing clicked **04:06:28Z** (_"URL was added to a priority crawl
  queue"_); the pillar was fetched **48 seconds later**
  (`lastCrawlTime 2026-11-13T04:07:16Z`, `crawledAs=MOBILE`,
  `pageFetchState=SUCCESSFUL`) and coverage stayed
  `Crawled - currently not indexed`. `/halving-dates` moved `2026-10-22 →
2026-11-13`, also declined; `/simulator` submitted, not recrawled.
- `named-source-ledger-1113` executed: `fetch-ga4.ts` collects `namedSources` and
  `referral-line.mjs` prints it. `x-post-dedup-1113` executed: post
  `status/2121091569650483649` verified, reply + like to @WelshBullTrader.
- New defect signal: GSC Discovery read **"No referring sitemaps detected"** for
  all four inspected URLs while `sitemap.xml` holds 21 locs and is submitted.

## Outbound — 2026-11-12 — compressed — BitcoinTalk topic (first non-GitHub, non-X send)

<https://bitcointalk.org/index.php?topic=5599692.0>, board 1, owner's session.
Both anchors render `rel="ugc"` — a mention send, never authority. First session
2026-11-13: `bitcointalk.org 1/1 → /bitcoin-500-day-cycle` in 7d, the first
session from any asked channel in 22 readings. One session, one user: a floor.

## Baseline — measured 2026-11-12 (Bing)

Source: Bing Webmaster Tools API (site `https://btc500.net`), via `npm run bing`.

| Measure                             | Value                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Site                                | verified, sitemap submitted 2026-11-12, status Success, 21 URLs discovered |
| IndexNow                            | push accepted, HTTP 200 (key validated) — Bing, Yandex, Seznam, Naver, Yep |
| Crawler access                      | msnbot / bingbot / Googlebot / browser all get an identical 200            |
| **Indexed in Bing**                 | **0/21** — Site Explorer: "No pages found"                                 |
| Crawled at least once               | 10/21 (homepage last crawled 2026-11-12)                                   |
| Keywords                            | 0 rows                                                                     |
| Backlinks                           | 0 rows                                                                     |
| AI Performance (Copilot + partners) | 0 total citations, 0 cited pages                                           |
| Submission quota                    | 99 URL submissions/day, 1,899/month                                        |

Read: Bing is not blocked and not misconfigured — it crawls and keeps nothing,
exactly like Google on a young domain with no inbound links. The Bing
opportunity is the _AI citation_ surface (AI Assistant is the only channel
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

## History — 2026-11-10 → 2026-11-13 — compressed

- **Reviews 11-12 (streak 19) and 11-13 (streak 20):** the sitemap's
  `<lastmod>2026-10-29</lastmod>` for `/` was false (`scripts/sitemap.mjs`
  excluded `src/components/home/`); Request Indexing was refused on quota 0 on
  11-12 and accepted on 11-13, which produced the decisive negative — a
  successful fetch 48s later that still declined the pillar; the Referral table
  cannot see `t.co`/`facebook.com`/`chatgpt.com` (nine sessions invisible in 21
  readings); every indexation lever closed to 2026-12-01; the
  `yjjnls/awesome-blockchain` route closed `unexecutable`. Movement: named
  non-github sessions 9 → 13 in 7d. Nothing else moved (indexed 1/21, non-brand
  clicks 0 in 23 readings, positions 4–20 = 0). Details:
  `scripts/autonomous/review-latest.json`.
- **Session 11-12:** `date-consistency-1112` made `/llms.txt` and
  `/llms-full.txt` live-rendered server routes so all seven quoteable surfaces
  read 29 November 2026. GA4 7d 11-05 → 11-11: 90 sessions / 29 users, Direct
  61/15, Organic Social 9/9, Referral 8/1 (all github.com).
- **Session 11-11 (later):** owner-directed visual redesign (skin only — no H1,
  lead, AEO id, FAQ or JSON-LD change). Not a growth bet and not claimed as one.

---

## Review history

| date       | verdict | what it forced (one line each)                                                                                                                                                                                                                                      |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-19 | failing | Streak 25. Google crawled `/articles/btc500-strategy` **today** and Bing crawled `/` 2026-11-19T03:02:33Z — both declined; `indexed` **1/22 for the 29th reading**, **0 non-brand clicks** in 29 readings, `positions4to20` **0**, Bing **0/22**. External audience **30/21 → 23/13** (the Facebook share aged out). The 11-19 title change shipped on the only served URL and cannot be read before 2026-11-26. **Strategy changed:** the bitcointalk correction becomes cycle work (we hold that session), owner asks must carry a link ceiling while `indexed` < 5, and indexation is written down as external-signal-only |
| 2026-11-18 | failing | A full week executed and nothing moved: 8 runs / 8 shipped / 0 failures, **4 of 4 shippable mandates done**, and still `indexed` **1/22 for the 28th reading**, **0 non-brand clicks** in 27 days, Bing **0/22**, the new `/halving-spacing` **unknown to Google** (`lastCrawl: never`) and bitcointalk.org **5/2 for the third window in a row** — so the 11-16 forum reply produced nothing and the runner's "ask effect produced 5 sessions" credits a send that predates the ask. `/` is the only URL Google serves (10 brand impressions / 7 clicks @1.6) and carries all 7 clicks; the whole non-brand footprint is 2 impressions at 38 and 69. **Strategy changed:** no new URL until `indexed` ≥ 2 or 2026-12-02, a page needs an existing GSC impression row for its query, title/meta only on `/`; Bing closed as a tested surface; spacing page closed as a lever. Streak 24 |
| 2026-11-17 | failing | `indexed` **1/22 for the 13th reading** (the runner's `2 → 1` regression is the 2026-11-03 → 11-04 drop still inside its 14-day window); Bing crawled `/` 2026-11-16T07:33:31Z and the pillar 2026-11-17T05:28:38Z and kept **0/22**; non-brand clicks 0 in 26 readings, the only non-brand impression at position 38; external audience **26/19 → 29 sessions / 20 users** but 95 of 125 sessions are us (Direct 86/18 + github 9/1); `bitcointalk.org 5/2` **predates** the 2026-11-16 11:40 reply, so ask-effect is unproven until a window starting 11-16; the X poster has **never run** (bash on a `.mjs`, 3 slots, 0 posts); `/paper-buy` has **zero crawlable inbound links** (`grep -c paper` = 0 on `/` and the pillar) and is `Discovered - currently not indexed` 12 days before entry; the forum OP promises **$10,000** while the page and the X post say **$50,000**. Fourth freeze output authorised: the 400/500/600 spacing answer. Streak 23 |
| 2026-11-16 | failing | External audience **19 → 26 sessions / 19 users** (google 5 → 9, bitcointalk 1 → 5) while `indexed` stays **1/21 for the 12th reading** and Bing keeps 0 of 15 crawled; the external-audience line over-counts users (22 vs 19) by summing per landing; **freeze partially lifted for one build — the $10,000 paper-buy record the BitcoinTalk topic already promises** — because the countdown expires 2026-11-29 and nothing exists for 11-30; 4 asks handed over since 11-09, 0 sent, 2 lapse today. Streak 22 |
| 2026-11-14 | failing | Instrument honest (`1/21`, rows 21 of 21) and the audience is **19 external sessions / 16 users**; Bing crawled `/` 2026-11-13T23:23:57Z and kept nothing; Google's `/` not crawled since 11-05; 39 commits, 0 site lines since 11-12; PERFORMANCE gains the external-audience line; non-brand work banned until `indexed` ≥ 5. Streak 21 |
| 2026-11-13 | failing | Request Indexing succeeded, the pillar was crawled 2026-11-13T04:07:16Z and **declined**; Bing 0/21 after all 21 submitted; every indexation lever closed to 2026-12-01; collector's 4-row vs 21-row denominator; GitHub ask route closed `unexecutable`. Streak 20 |
| 2026-11-12 | failing | sitemap's false 2026-10-29 lastmod for `/`; Request Indexing refused (quota 0); named-source ledger (t.co/facebook/chatgpt invisible to the Referral table); 2026-11-19 crawl rule replaces the 2026-11-20 stop rule. Streak 19                                     |
| 2026-11-11 | failing | X reach measured (56/56/90/83/110 views/post); `AI Assistant` 3/3 the only stranger traffic; three surfaces, three buy dates; Request Indexing ordered (first time in 17 reviews). Streak 17                                                                        |
| 2026-11-10 | failing | Page-quality causes excluded by measurement (200 / 3,007 words / canonical / robots / linked / not duplicate); both October articles lost by name. Streak 16                                                                                                        |
| 2026-11-09 | failing | `externalReferringDomains` 0 → 1 (lopp.net, followed); no post-merge crawl. Streak 15                                                                                                                                                                               |
| older      | failing | 11-07 runner mid-run edit (owner); 11-06 `shipped` redefined as a src/sitemap diff; 11-05 lift condition retired → gate only; 10-30 **full freeze** (a `5aad29f` copy change after three mandates forbade it). Streaks 14 → 12                                      |

## Next priorities

0. **Freeze: PARTIALLY LIFTED on 2026-11-16 — one build, and the copy ban
   stands.** Exactly one site change is permitted until the next review: the
   public **$10,000 paper-buy record** at a stable URL (`/paper-buy` or an
   equivalent route), stating the entry date (29 Nov 2026), the notional, the
   entry-price source, the exit rule (T+500) and a dated daily line. It may not
   change the title, meta, H1, copy or internal links of any existing page, and it
   may not be offered as an indexation fix. Prove the rest of the freeze per cycle
   with `git diff --stat <freeze-sha>..HEAD -- src public/sitemap.xml` — that diff
   must contain only the new record's files.
   **Superseded in part on 2026-11-18** by `GROWTH_PROMPT.md` → "No new URL until
   the served URL is answered": no new URL until `indexed` ≥ 2 or 2026-12-02, a
   page needs an existing GSC impression row for the query it answers, and the
   only title/meta work permitted on any page is `/`'s.
   0a. **The paper record is the post-buy-date product.** The countdown reads 13
   days on 2026-11-16 and is worth zero on 2026-11-30. From the buy date every
   cycle's report opens with `paper record: entry $X on 2026-11-29, day N, $Y now,
   Z%` — the countdown is never described as the site's product again.
   0b. **Readings:** `external-audience-line-1114` and
   `nonbrand-query-table-1114` were **executed in code on 2026-11-15** (`npm run
   referrals` leads with the external-audience line — today `22 sessions / 19
   users (window 2026-11-08 → 2026-11-14)`; `npm run nonbrand` prints the table +
   floor); `pillar-verdict-1116` **executed 2026-11-16** — pillar crawl
   `2026-11-13T04:07:16Z` / `SUCCESSFUL` / `MOBILE` / `Crawled - currently not
   indexed`, homepage `2026-11-05T07:50:37Z` indexed, Sitemaps screen `Success`,
   21 discovered, 0 errors; `bing-verdict-1118` (due 2026-11-18) — Bing
   indexed/crawled/unknown for 21 URLs.
1. **The post-merge crawl happened and did not move coverage.** What is left in
   the lopp window: a second, independent crawl (04:07:16Z was 48s after the
   request, so it may be the priority fetch) or one lopp.net session. Read on
   2026-11-28; if both are absent, write "authority hypothesis falsified for one
   followed link" and name a second destination.
2. **`runner-repairs-1114` (OWNER, 7th statement):** 2026-11-07 status row
   absent, `dirty_paths_note()` inline at `run-growth-cycle.sh:111/:197/:345`,
   no `status-note.sh`, `git add -A` at `run-review-cycle.sh:443/:450`.
3. **`bing-verdict-1118` — READ 2026-11-18: 0/22, surface CLOSED.** Six days
   after the full 21-URL submission, and after `/` (2026-11-18T04:18:19Z) and the
   pillar (04:19:07Z) were crawled again and declined, indexed is still **0** of
   **22**. Bing is reading the same pages Google refuses; it is not an untested
   surface and must not be reported as one. Bing readiness stays a process check
   (22 sitemap URLs, IndexNow accepted); the indexation signal is read weekly, not
   daily.
4. **The 2026-11-19 rule FIRED.** `/` last crawl `2026-11-05T07:50:37Z` (raw URL
   Inspection read 2026-11-19T04:17Z), no crawl after 2026-11-12 → the daily X
   post is now **twice a week (Tue + Fri)**, no new broadcast post on
   X/Instagram/Facebook, and a cycle's work is the measurement plus one action
   (2026-11-18 review, replacing the 2026-11-12 wording). Only a reply in the
   BitcoinTalk thread that has already produced sessions is exempt. **Correction
   (2026-11-19 review): that reply is cycle work, not an owner ask** — the
   automation holds the posting session (4 of the thread's 9 posts are ours), so
   handing it over is a delay.
5. **The buy-window peg is a live estimate — 29 November 2026, 10 days out.**
   Re-read it from the site every cycle, never from this log or a post.
6. **Read the `/` title change on 2026-12-02.** It shipped 2026-11-19 with the
   halving year first and the buy window named. Measure: any non-brand impression
   above position 30 for `/` by 2026-12-02. If there is none, title and meta work
   stops permanently and distribution is the only lever left.

## Ranked backlog

Only rows 0–1b are permitted work under the freeze; since 2026-11-16 row 0c is
also permitted — it is the single site change the partial lift allows.

| #   | Bet                                                                 | Why it can move the needle                                                                                                                                                    | I   | E   |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0d  | ~~Is the rule a 500-day artefact?~~ **SHIPPED 2026-11-18, CLOSED as a lever** | Built as `/halving-spacing` + `/data/halving-spacing.json` (569fb38) because two strangers asked it in the only thread that produced sessions. **Result so far: 0 landings, 0 Google crawl (`lastCrawl: never`), Bing fetched and declined 2026-11-18T04:17:34Z, bitcointalk.org still 5/2.** The 7-day test (a landing or a forum session for this page by 2026-11-25) is the last word on "content is the constraint"; if it fails, no further content is proposed until indexation moves | — | — |
| 0c  | **Public paper-buy record (SHIPPED 2026-11-16 at `/paper-buy`)**     | The 2026-11-12 BitcoinTalk topic promised it in public and nothing existed. **Notional is $50,000 on the page and in the 2026-11-16 X post, but the forum OP still says $10,000** — the contradiction is now the record's biggest credibility risk, and it is **cycle work**: topic 5599692's posting session is ours (4 of 9 posts). Has **0 crawlable inbound links**: `grep -c paper` on `/` and on the pillar returns 0 | 10  | 1   |
| 0   | `lopp.net` → Charts & Metrics (**merged 2026-11-07T20:20:30Z**)     | First followed external link, pointing at the declined pillar. Measured as a post-merge crawl and a lopp.net session — the crawl came 48s after our own Request Indexing and the session never came; experiment **closed 2026-11-16**. Read as an input, not a result | 10  | 0   |
| 1b  | ~~X click path (pinned + tagged)~~ — **DEMOTED 2026-11-17**         | The scheduled poster has never run: `net.btc500.x-post-{am,md,pm}.plist` execute `/bin/bash post-daily.mjs`, and every slot logs `const: command not found`. 3 slots × 30 days = 0 posts; the only post is the hand-made one of 2026-11-16, and x.com/t.co delivered 6 sessions / 6 users in 7d. A channel that cannot publish cannot be a bet until the plist is fixed (owner mandate) | 3   | 1   |
| 1   | ~~CryptoQuant Quicktake~~ (demoted 2026-11-09)                      | Prepared 11-04, never sent, needs an account, followed status unverified — a second unverified queue behind the channel we already own                                        | 4   | 3   |
| 2   | ~~CoinDesk~~ / ~~awesome-bitcoin~~ / ~~awesome-blockchain~~ / ~~X~~ | Lapsed (429), withdrawn (0/2, nofollow), withdrawn (never sent), false premise (no account). None restated                                                                    | —   | —   |
| 3   | ~~Is the rule a 500-day artefact?~~ (promoted to **0d**)            | Was parked as content work; the 2026-11-17 review found the audience already asking it and the archive already holding the answer. Moved, not duplicated                       | —   | —   |

## Open issues

- **The paper-buy record is linked from nothing crawlable (2026-11-17).** `curl -s
https://btc500.net/ | grep -c paper` → **0**; the same on
  `/bitcoin-500-day-cycle` → **0**. The `Nav.tsx` tools entry the owner added on
  2026-11-16 does not appear in the server-rendered HTML, so Google has
  `Discovered - currently not indexed` on a URL with no inbound link, 12 days
  before its first dated line. Mandate `paper-buy-internal-link-1117`.
- **The scheduled X poster has never run (2026-11-17).** Three launchd jobs run
  `/bin/bash .../post-daily.mjs`; `x/launchd-pm.err.log` ends in
  `post-daily.mjs: line 5: const: command not found` and `syntax error near
  unexpected token '('`. 0 machine posts; the 2026-11-16 post
  (`status/2122389869939040716`) was made by hand inside a cycle. Owner mandate
  `x-poster-node-1117`; no cycle may hand-patch the plists.
- **The notional is $50,000 on the site and $10,000 in the thread (2026-11-17).**
  `/paper-buy` serves `Scheduled. $50,000 not deployed.`; the 2026-11-12
  BitcoinTalk opening post says "a public $10,000 paper buy". Two members are
  reading that thread. Only the owner can correct the post, so it is the ask
  `bitcointalk-spacing-correction-1117`, not a cycle task.
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
- **No copy work for non-brand clicks while `indexed` < 5** (2026-11-14 review,
  mandate `nonbrand-query-table-1114`): no cycle may offer title, meta, snippet,
  copy or internal-link work as an action for non-brand clicks below that floor.
  Today `indexed` is **1/21**, `positions4to20` = 0, and the 28d non-brand table is
  two rows — `bitcoin 500` 0/2 @54 and `500 days before next bitcoin halving` 0/1
  @38, both landing on `/`. `npm run nonbrand` prints that table with the floor
  line beside it, from the 28d report, every run.
- **The pin does not move.** Pinned post today is `status/2120172389442969779`
  (second poster, 2026-11-10, no link), not the tagged post recorded as pinned on
  2026-11-11. The menu accepts "Pin to your profile" and the pin stays where it
  was (three attempts, 2026-11-14, no toast). Stated as a screen that accepts the
  action, not as an owner ask.
- **The pillar HAS now been crawled with an incoming external link, and was
  declined again — and the redesigned version has been fetched and declined too.**
  Crawl history: 2026-10-22, 11-05, 2026-11-07T03:42:34Z (all pre-merge, all
  declined), then **2026-11-13T04:07:16Z** — the first post-merge crawl and the
  first read of the 2026-11-11 redesign, `crawledAs=MOBILE`,
  `pageFetch=SUCCESSFUL`, coverage unchanged. Read again 2026-11-16T04:03Z: still
  `Crawled - currently not indexed`. **a successful Google fetch of the redesigned
  pillar produced no index** — do not describe the pillar as a page waiting to be
  served before 2026-11-28.
- **Indexation 1/21** (inspection `2026-11-16T04:03:41Z`, 21 rows = 21 sitemap
  locs): 1 PASS, 17 crawled-not-indexed, 1 discovered, 1 unknown, 1 soft 404.
  Series: 6 (10-22) → 5 → 3 → 2 (10-31) → 1/21 for twelve readings since 11-04.
  A read whose row count is not 21 is never quoted as a fraction.
- **"No referring sitemaps detected" — CLOSED 2026-11-16, it was a field
  artifact.** The Sitemaps screen reads `Success`, submitted and last read
  2026-11-11, **21 discovered pages, 0 errors, 0 warnings**, and the per-URL
  `sitemap[]` array is empty even for `/`, which is indexed. Google knows the
  sitemap; the Discovery panel's line means nothing about it.
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
- **Ask routes (2026-11-17): 14 asks handed over since 2026-10-27, 4 sent,
  0 live unsent asks.** Sent: bitcoin-only#1009 2026-10-27, lopp.net#1267
  2026-11-06 (merged 2026-11-07T20:20:30Z), the BitcoinTalk OP 2026-11-12, and
  **the issued forum reply 2026-11-16 11:40:30 AM** — the last one was recorded
  `sent: no` for a day because the ledger was written before the owner posted; the
  channel won. **The third send is the first and still only asked channel that
  produced sessions: bitcointalk.org 5 sessions / 2 users** (7d window ending
  11-16), from a topic whose read counter went 37 → 76 in a day — the counter
  counts scripted fetches, so it is not an audience measure. The four asks handed
  over between 2026-11-09 and 2026-11-13 (`x-pinned-post-with-link-1116`,
  `github-awesome-blockchain-line-1124`, `theblock-news-tip-1113`,
  `facebook-share-1114`) were all unsent and lapsed/closed on 2026-11-16;
  `github-awesome-blockchain-line-1124` re-issued a destination `STATUS.md` had
  **withdrawn on 2026-11-04**, which is how a dead route stays "live" for a week.
  **A `sent` cell is verified against the channel, never against this file.**
  `github.com` referrals are a self-referral (this repo and the owner's browser), so
  only a non-github session counts. **A destination needs a merge record, not stars**
  (awesome-bitcoin: 1,358 stars, 0 of 2); #1267 satisfies this for the first time
  and produced 0 sessions in 9 days.
- **The audience instrument was over-counting people — fixed 2026-11-17
  (`referral-instrument-1116`).** `npm run referrals` printed `26 sessions / 22
  users` on the 2026-11-16 file because it summed `totalUsers` across each source's
  landing rows; the honest figure is **26 / 19** (property total 40), and
  `bitcointalk.org` printed 5/5 where the report's own Referral table says 5/2. It
  now takes one count per source from `tables.sourceTotals` (new, in
  `fetch-ga4.ts`), falls back to the largest landing row for older reports, caps at
  the property total and prints the cap, and adds the fourth line
  `asked channels 7d` (bitcointalk.org, x.com, t.co, facebook.com, theblock.co,
  lopp.net, chatgpt.com). **Do not reintroduce a user sum across rows** — the test
  file pins 5/2 and the property-total ceiling.
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
