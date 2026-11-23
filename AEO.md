# BTC500 — AEO growth loop

Adaptation of Granola's answer-engine-optimization (AEO) playbook to BTC500.
This is the operating spec for growing by **search that answers**, not by
publishing more pages. It is deliberately compatible with the current growth
freeze in `scripts/autonomous/GROWTH_PROMPT.md`: the loop measures and diagnoses,
and it fixes **existing** surfaces first. It adds no URL and changes no page copy.

Owner directive: 2026-11-23 — "implement the same pattern to be able to grow by
search in AEO."

---

## 1. Why this pattern fits BTC500 right now

The site's conventional search problem is documented and measured:

- Google lists **1 of 22** sitemap URLs; non-brand clicks are **0** in the last
  ~30 readings; both engines crawl and decline pages.
- The one channel where a stranger has repeatedly arrived is **AI Assistant** —
  GA4 names `chatgpt.com` as the source (10 sessions / 8 users in 28 days;
  1 session / 1 user in the current 1-day snapshot).
- Bing Webmaster Tools reports **0 AI citations** for Copilot and partners
  (measured 2026-11-12).
- The site already has the raw AEO plumbing: AI crawlers explicitly allowed in
  `robots.txt`, live-rendered `/llms.txt` and `/llms-full.txt`, two open-CORS JSON
  datasets with citation strings, Speakable/FAQ/HowTo/Dataset/Breadcrumb JSON-LD,
  and answer-first blocks on the served pages.

So the missing piece is **not more content**. It is the Granola loop: know which
decisions matter, diagnose every miss, fix existing pages, study the sources the
engines already trust, measure Google and AI separately, and repeat.

---

## 2. The nine steps, mapped to BTC500

| Granola step                                             | BTC500 implementation                                                                                                 | Where                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Start with buyer decisions, not keywords                 | 12 "decision questions" a halving-cycle reader asks, each with a Google query **and** an AI prompt                    | `scripts/aeo/decision-questions.mjs`, `npm run aeo:map`  |
| Diagnose every missed recommendation                     | Prompt-results ledger + gap classifier: competitors, cited sources, gap type, next action                             | `scripts/aeo/prompt-results.json`, `npm run aeo:gaps`    |
| Fix existing pages before creating new ones              | Surface audit proves each decision has an owning file and answer marker; repairs target that file                     | `npm run aeo:audit`                                      |
| Prioritize technical issues that affect buying questions | Audit checks crawler allow-list, llms routes, sitemap, Speakable schema, data endpoints — not a generic SEO checklist | `npm run aeo:audit`                                      |
| Study the sources AI already trusts                      | `trustedSources` in the gap report builds an EARN target list from observed citations                                 | `npm run aeo:gaps`                                       |
| OWN / CLAIM / EARN / CONTEST                             | Every decision is classified into one of the four frames                                                              | `FRAMEWORK` in the decision map                          |
| Show up where buyers already talk                        | BitcoinTalk topic 5599692 is the measured channel; EARN targets are the publications/forums that already rank         | §5 below + `npm run aeo:gaps`                            |
| Measure Google and AI separately                         | Scorecard splits GSC clicks/impressions from GA4 AI Assistant sessions, with a persistent history                     | `npm run aeo:measure`, `scripts/aeo/output/history.json` |
| Repeat prompts and close the gaps                        | Each measurement appends a snapshot with deltas; the unmeasured prompt list is the next test queue                    | `npm run aeo` (all four)                                 |

---

## 3. The decision-question map

Run `npm run aeo:map` for the full map; `npm run aeo:map -- --json` for the raw
data. The 12 decisions are:

- **OWN** — what the rule is, when the next halving is, the exact buy date, the
  sell rule, and where the data comes from.
- **CLAIM** — did it work historically, can the reader run their own numbers,
  and how large were the drawdowns.
- **CONTEST** — does it work at 400/600 days, is this cycle different, and is it
  better than buy-and-hold or DCA.
- **EARN** — is the rule recognized outside BTC500.

Each entry names an owning in-repo file, an evidence file, an answer marker the
audit checks, and the offsite sources we must be cited by. The current audit
finds **12/12 answer surfaces present** and all 9 shared answer-engine surfaces
ready — so the first gap is not "we lack a page", it is "engines prefer other
sources for the questions we already answer."

The visibility ladder to track per decision: **retrieved → cited → mentioned →
recommended**. A citation is not a recommendation; offsite consensus governs the
last rung.

---

## 4. OWN / CLAIM / EARN / CONTEST applied to BTC500

- **OWN** — The core story is already on `/`, `/bitcoin-500-day-cycle`,
  `/halving-dates`, `/when-to-sell-bitcoin-after-halving` and `/about`: a clear
  definition, the 4-step rule, live-derived dates, a documented daily-close
  archive and a named methodology. The `/paper-buy` record is the OWN asset that
  survives the 2026-11-29 countdown. Keep dates derived from the live model —
  three surfaces quoting three different buy dates was a real defect on 2026-11-12.
- **CLAIM** — The supportable advantages are the original dataset
  (`/data/500-day-cycles.json`), the 400/500/600 spacing test
  (`/data/halving-spacing.json`), and the simulator. Claims must stay tied to
  those files and disclose sample size (four windows) and limitations. Never
  imply past performance guarantees a future result.
- **EARN** — Independent coverage is the weakest frame. The sources that already
  own the 500-day-rule conversation are named in §5; being cited by them — or by
  pages they cite — is the work. A claim on our site and a claim supported by an
  outside source are not the same signal.
- **CONTEST** — Buyers weigh "is 500 cherry-picked", "is this cycle different",
  and "why not just DCA/hold". `/halving-spacing` answers the first two from our
  own archive; the comparison with DCA/hold is the thinnest answer surface and is
  the top repair candidate.

---

## 5. Sources the engines already trust (offsite consensus map)

Observed 2026-11-23 with `websearch` for the core buyer questions. These are
**search-engine proxies, not AI-engine answers** — recorded honestly as such in
the ledger. They tell us who to earn coverage from, not that an AI recommended us.

| Question                            | BTC500 present?                | Sources that dominated                                                                                        |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 500-day strategy historical returns | Yes (homepage, `/bear-market`) | CoinDesk, Reddit r/Bitcoin, Pantera-derived write-ups (CryptoRank, BTC Magazine), Binance Square, TradingView |
| Halving return calculator / tool    | **No**                         | CoinGlass, Spark Money, BTC Cycle Lab, charts.bitcoin.com, Liquid State, WOWHOW                               |
| Best halving-cycle analysis 2026    | **No**                         | BTC Cycle Lab, Wells Fargo, Galaxy Research, VanEck, Kumocast, LiveVolatile                                   |

Reading: the 500-day-rule term is already associated with BTC500 in one surface,
but the **tool and comparison intent** — where a researcher would bookmark or
cite a source — is owned by dedicated tools and institutional research. That is
the EARN/CONTEST gap to close.

`npm run aeo:gaps` regenerates this list from the ledger as `trustedSources`.

---

## 6. The measurement loop

Four commands, one loop (`npm run aeo` runs all four):

1. `npm run aeo:map` — the decisions and prompts to test.
2. `npm run aeo:audit` — which existing surfaces answer them; exit 1 on a gap.
3. `npm run aeo:gaps` — missed recommendations, gap types, EARN targets, unmeasured queue.
4. `npm run aeo:measure` — Google vs AI scorecard + append to history.

Rules, taken from the growth log's hard-won honesty constraints:

- **Google and AI are separate.** GSC clicks/impressions are the ranking surface;
  GA4 AI Assistant sessions and the prompt ledger are the recommendation
  surface. Ranking does not imply a mention, and a mention does not imply a
  recommendation.
- **Quote every number with its window.** The current `ga4-latest.json` is a
  1-day snapshot (`2026-11-22`), so it is not comparable to a 7-day GSC window;
  `aeo:measure` prints both windows for that reason.
- **A missing report is "unavailable", never zero.** An unmeasured prompt is
  not a miss. A present brand is not a win until the next repeat confirms it.
- **Small samples are noise.** One `chatgpt.com` session is a floor, not a trend.
- **Record the observation before acting.** Add results to
  `scripts/aeo/prompt-results.json` with `{questionId, observedAt, engine,
prompt, brandPresent, competitors[], citedSources[], note}`, then rerun
  `aeo:gaps`. Label proxies honestly (`engine: "websearch"` is not an AI engine).

### Baseline recorded 2026-11-23

- Google (7d ending 2026-11-20): 10 clicks / 25 impressions.
- AI Assistant (1-day snapshot 2026-11-22): 1 session / 1 user, `chatgpt.com`.
- Google organic sessions in that snapshot: 0.
- Bing AI citations: 0 (last measured 2026-11-12).
- Decision surfaces: 12/12 present; 9/9 shared answer-engine surfaces ready.
- Prompt ledger: 1 present, 2 missed, 9 unmeasured.

No growth targets are invented here. The Granola outcome (+4,600% AI users,
+558% non-brand citations) is a single case study, not a forecast for this site.
Success for the next cycle is a **closed loop**: every high-intent prompt has an
observation, each miss has a named next action, and the scorecard is trended.

---

## 7. Guardrails while the growth freeze stands

The freeze in `scripts/autonomous/GROWTH_PROMPT.md` (indexed 1/22; no new URL
until `indexed` ≥ 2 or 2026-12-02) is respected by this loop:

- No new route, article, sitemap row or page copy was added for AEO.
- "Fix existing pages first" means repairing the owning surface named in the
  map, and only when a gap diagnosis names it.
- Title/meta work remains permitted on `/` only.
- Outreach is an owner action; the loop prepares the EARN target list, it does
  not post, pitch or publish on the owner's behalf.

**Repairs shipped 2026-11-23 (owner directive "run fixes"; both are existing
surfaces — no new URL, article or sitemap row):**

1. `claim-run-your-own-numbers` — DONE. `/simulator` now opens with an
   answer-first block (`#answer`) that derives $10,000's T+500 value for each
   completed window from the live archive ($298,977 / $341,823 / $116,699 /
   $65,983 at the time of writing), states the median, and links the public
   dataset as the citation. Logic: `src/lib/aeo-answers.ts` (`buildCalculatorAnswer`).
2. `contest-vs-hodl-dca` — DONE. The pillar gained a data-backed comparison:
   the same $10,000 compounded through the rule vs a single buy-and-hold over
   the same dated span, a per-cycle T-500-vs-halving-day entry table, and a
   matching FAQ answer (so the visible copy and FAQPage schema agree). DCA is
   linked to `/dca` rather than assigned invented numbers. Logic:
   `buildStrategyComparison` in the same module.
3. `earn-independent-proof` — NOT DONE (owner-only outreach). Pursue the sources
   in §5; a single independent citation that names BTC500 changes the offsite
   signal more than another page.

Both fixes are recorded in the prompt ledger with `FIX 2026-11-23` notes. The
old observations are still misses — a fix is not a result until the prompt is
**retested**. Until an AI-engine observation exists, this stays a closed-loop
hypothesis, not a win.

---

## 8. Files

- `scripts/aeo/decision-questions.mjs` — the map (data only).
- `scripts/aeo/map.mjs` — print the map.
- `scripts/aeo/audit.mjs` — surface audit.
- `scripts/aeo/gap-report.mjs` — pure gap classifier.
- `scripts/aeo/gaps.mjs` — missed-recommendation report.
- `scripts/aeo/measure.mjs` — Google-vs-AI scorecard + history.
- `scripts/aeo/prompt-results.json` — the observation ledger (edit this).
- `scripts/aeo/output/history.json` — measurement history (checked-in time series).
- Tests: `scripts/aeo/*.test.mjs`.
