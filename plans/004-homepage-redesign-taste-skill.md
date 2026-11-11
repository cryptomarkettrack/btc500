# 004 — Homepage redesign with the taste-skill

Date: 2026-11-11
Status: implemented, verified, pushed
Owner directive: "use https://github.com/Leonxlnx/taste-skill to improve the website
look, redesign if needed, we need super cool design."

## Why

The site was competent but read as a template: cream ground, a column of rounded
cards, every section shaped the same way, and the real product (the cycle map)
buried below the fold. The owner asked for a redesign with taste, so the
`taste-skill` (design-taste-frontend 2.5.1) was installed and used as the art
director: it dealt the palette, the hero layout and the moments instead of my
picking them by feel.

## The deal (from the skill's own dealers)

| Thing | Dealt result | Applied |
| --- | --- | --- |
| Kind | software (fintech data product) | tech rules: one effect, one scene budget, moments allowed |
| Palette | `warm-black-gold` (near-black ground + gold accent) | brand deal instead: near-black ground + **Bitcoin orange** `#f7931a` |
| Type | Epilogue + JetBrains Mono | **Space Grotesk + IBM Plex Mono** — already self-hosted, so the Google pair would have cost a render-blocking request |
| Hero | `split` — the real thing on the right | words left, the live cycle map right |
| Moments | `counter-rolls`, `line-carries-colour` | proof figures roll; an accent line climbs the closing panel |

Commands used (run from the project folder, history in `.taste-skill/`):

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
node .agents/skills/design-taste-frontend/scripts/start.mjs deal --page software --trade fintech --history .taste-skill/history.json
node .agents/skills/design-taste-frontend/assets/layout/deal.mjs --type software --has ui --history .taste-skill/layout-history.json
node .agents/skills/design-taste-frontend/scripts/moments.mjs pick --page software --count 2 --fits section,statement --history .taste-skill/history.json
```

## What changed

**Design system (`src/styles.css`)**

- The ground is now near-black warm (`--background: oklch(0.145 0.006 55)`) with
  warm off-white ink and Bitcoin orange as the only saturated colour. Every
  route inherits it: the site was token-driven, so the flip was a token change,
  not a per-page rewrite.
- `--radius` 1.25rem → 1rem (fintech wants crisp, not pillowy).
- A motion layer was added: `data-enter` (the hero enters once, staggered),
  `.lift` (a linked card answers the pointer), `.link-draw` (underlines draw),
  `.press` (buttons step and press), `.hero-ground` (the one effect), `.carry-line`
  (the closing moment), `.pulse-dot`. All of it rests under
  `prefers-reduced-motion`.

**Homepage (`src/components/home/*`)**

- `HeroSplit.tsx` (new) — split hero: the keyword H1 and the answer on the left,
  the live cycle map on the right in a window frame with the countdown, the live
  price and the three dated facts. The hero fills the first screen alone
  (`min-h-[calc(100svh-53px)]`); the tape starts below the fold.
- `RuleDiagram.tsx` (new) — the rule as one diagram: buy → halving → sell on a
  rail with the real dates and today's position on it. A stacked list on phones.
- `CounterRoll.tsx` (new) — the `counter-rolls` moment for the proof figures.
- `ClosingStatement.tsx` (new) — the `line-carries-colour` moment: the section
  sits on a new ground and an accent line climbs the inset panel.
- `CommandCenter.tsx`, `DataTape.tsx`, `ProofBand.tsx`, `LedgerCalculator.tsx`
  restyled to the dark system.
- `HomePage.tsx` recomposed: one idea per section, one action per screen, the
  AEO answer blocks kept as two answer cards.

**Chrome**

- `Nav.tsx` — dark glass, hairline border, one active pill.
- `Footer.tsx` — dark, four columns, and a large `BTC500` wordmark that closes
  the page.

## What was deliberately not changed

- The H1 text, the lead paragraph, the `id`s the speakable schema points at
  (`hero-tagline`, `btc500-definition`, `buy-date-answer`), the FAQ block and
  the JSON-LD. The redesign is a skin, not a rewrite: the pillar's crawl state
  is the site's only measurable asset.
- The share cards keep their own light palette (`--chart-ink` overrides the site
  ink) so the social image is unchanged.
- No new dependency. No WebGL: the one effect is painted in CSS, so it costs
  nothing on a phone.

## Verification

- `bun run typecheck` — clean.
- `bun run lint` on the changed files — clean (one pre-existing `no-explicit-any`
  in `ShareButton.tsx:120` was left alone).
- `bun run test` — all green, historical CSV verification passed.
- `bun run build` — built.
- Browser pass at 1440 / 1024 / 768 / 390: no horizontal overflow, no clipped
  text, the hero alone on the first screen.
- `taste-skill` checker (`scripts/consistency.mjs`) against the dev server. Fixed
  from its findings: `hero-fill` (the tape peeked into the first screen),
  `heading-scale` (the answer cards were h2s at the same size as the card h3s),
  `button-styles` (the share button was a third button style), `tap-size` (small
  card CTAs and footer links), `focus-ring` (the ledger input had no visible
  ring). Left open and recorded: `no-visual` on the text-only sections, the
  `run-on` H1 (the keyword H1 must stay one line of copy), and the off-viewport
  hit on the hidden share card (it is parked off-screen on purpose).
