# BTC500 Growth Log

Working memory for the autonomous growth work. Short, dated, evidence-based. Do
not record guesses as results.

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
3. **`bing-verdict-1118` (due 2026-11-18)** — Bing indexed / crawled / unknown
   for all 21 URLs against the 2026-11-12 full submission; if `indexed` is still 0
   at six days, Bing leaves the list of untested surfaces.
4. **Rules that fire soon:** 2026-11-19 — no crawl of `/` after 2026-11-12 → the
   daily post drops to twice a week, no new owner ask, weekly measurement + one
   link action only. `/` was last crawled **2026-11-05T07:50:37Z** (read
   2026-11-16), so the rule is three days from firing. 2026-11-18 — X cadence
   verdict (views/post vs t.co sessions).
5. **The buy-window peg is a live estimate — 29 November 2026, 13 days out.**
   Re-read it from the site every cycle, never from this log or a post.

## Ranked backlog

Only rows 0–1b are permitted work under the freeze; since 2026-11-16 row 0c is
also permitted — it is the single site change the partial lift allows.

| #   | Bet                                                                 | Why it can move the needle                                                                                                                                                    | I   | E   |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| 0c  | **Public $10,000 paper-buy record (permitted build, 2026-11-16)**   | The 2026-11-12 BitcoinTalk topic already promises it in public and nothing exists. It is the only asset that survives 2026-11-30, the only reason a visitor returns daily, and the payload for every future send (forum bump, X post, AI citation) | 10  | 1   |
| 0   | `lopp.net` → Charts & Metrics (**merged 2026-11-07T20:20:30Z**)     | First followed external link, pointing at the declined pillar. Measurable only as a post-merge crawl and a lopp.net session — neither exists yet                              | 10  | 0   |
| 1b  | **X click path (pinned + tagged since 2026-11-11)**                 | 206 followers, a `btc500.net` profile link, a pinned post that now carries a UTM-tagged pillar link, and 0 x.com referral sessions in 20 readings. Measured by GA4 x.com/t.co | 9   | 1   |
| 1   | ~~CryptoQuant Quicktake~~ (demoted 2026-11-09)                      | Prepared 11-04, never sent, needs an account, followed status unverified — a second unverified queue behind the channel we already own                                        | 4   | 3   |
| 2   | ~~CoinDesk~~ / ~~awesome-bitcoin~~ / ~~awesome-blockchain~~ / ~~X~~ | Lapsed (429), withdrawn (0/2, nofollow), withdrawn (never sent), false premise (no account). None restated                                                                    | —   | —   |

## Open issues

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
- **Ask routes (rewritten 2026-11-16):** 13 asks handed over since 2026-10-27,
  **3 sent** (bitcoin-only#1009 2026-10-27, lopp.net#1267 2026-11-06, BitcoinTalk
  topic 5599692 2026-11-12), and **the third one produced the first sessions from
  any asked channel: bitcointalk.org 5 sessions / 2 users in the 7d window ending
  2026-11-15** (1/1 in the window ending 11-13) from a topic read 37 times —
  13.5% sessions per read, against X's 5 sessions from ~316 views (1.6%). The live
  ask is `bitcointalk-reply-1116` (one page, one paste, one button, the same thread,
  due 2026-11-18). **The ledger is the source of truth, not this log:** the four
  asks handed over between 2026-11-09 and 2026-11-13 (`x-pinned-post-with-link-1116`,
  `github-awesome-blockchain-line-1124`, `theblock-news-tip-1113`,
  `facebook-share-1114`) were all unsent on 2026-11-16 and two lapsed today;
  `github-awesome-blockchain-line-1124` re-issued a destination `STATUS.md` had
  **withdrawn on 2026-11-04**, which is how a dead route stays "live" for a week.
  **A `sent` cell is verified against the channel, never against this file.**
  `github.com` referrals are a self-referral (this repo and the owner's browser), so
  only a non-github session counts. **A destination needs a merge record, not stars**
  (awesome-bitcoin: 1,358 stars, 0 of 2); #1267 satisfies this for the first time
  and produced 0 sessions in 9 days.
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
