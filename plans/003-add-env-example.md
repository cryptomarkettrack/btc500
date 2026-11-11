# Plan 003: Add `.env.example` documenting optional env vars

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9bfb258..HEAD -- .gitignore scripts/analytics/client.ts scripts/search-console/client.ts scripts/analytics/fetch-ga4.ts scripts/search-console/fetch-search-console.ts`
> If any of these changed since this plan was written, compare the env-var references against the live files before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `9bfb258`, 2026-11-11
- **Issue**: (omit — not published via `--issues`)

## Why this matters

The web app needs no env vars for countdown, prices, or historical pages (README §7), but several *scripts* read optional env vars (`GA4_PROPERTY_ID`, `GSC_CREDENTIALS`, `GSC_SITE`) whose names and defaults live only in code comments and `scripts/search-console/SETUP.txt`. There is no `.env.example`, so a new contributor or executor must hunt through code to learn what to configure — onboarding friction and a small secret-risk (a real key could accidentally be committed if no template shows where placeholder values belong). This plan adds a root `.env.example` that documents each optional var, its purpose, its default, and which script reads it, with no real values.

## Current state

Env vars actually read by the repo (verified by reading the files):

| Var | Script | Default | Notes |
|-----|--------|---------|-------|
| `GA4_PROPERTY_ID` | `scripts/analytics/client.ts:52`, `scripts/analytics/fetch-ga4.ts:43` | `560440382` | Numeric GA4 property id, not the G- measurement id |
| `GSC_CREDENTIALS` | `scripts/search-console/client.ts:60`, `fetch-search-console.ts:51`, `inspect-urls.ts:45` | `scripts/search-console/credentials.json` | Path to the service-account JSON key (gitignored) |
| `GSC_SITE` | `scripts/search-console/client.ts:213`, `fetch-search-console.ts:51` | auto-detected property | `https://btc500.net/` or `sc-domain:btc500.net` |

`scripts/search-console/SETUP.txt:82` says both GSC vars "may be set in `.env.local` at the project root (gitignored)". There is no `.env.example` and no `.env.local` template. `.env.local` is not in `.gitignore` (only `credentials.json`, `output/`, `*.log`, node_modules, etc. are ignored) — confirm before writing (see Step 1).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Confirm .env.local isn't already tracked/ignored unexpectedly | `git check-ignore .env.local; echo $?` | 1 (not ignored) or 0 (ignored) — just note it; do not create `.env.local` |
| Confirm no real secrets leak | `git status` | only `.env.example` added |

## Suggested executor toolkit

None required.

## Scope

**In scope** (the only files you should create):
- `.env.example` (create, root)

**Out of scope** (do NOT touch):
- Any file under `src/` or `public/` — blocked by the site-change freeze
- `scripts/search-console/credentials.json` — contains a real service-account key, is gitignored, and must never be copied or referenced by value
- `.env.local` — do NOT create; it's the local overrides file and may hold real values
- Any script source — do not change how env vars are read

## Git workflow

- Branch: `advisor/003-env-example`
- Commit once: `docs: add .env.example documenting optional script env vars`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm ignore state and that no `.env` file exists with real values

**Verify**:
1. `ls -la .env .env.local .env.example` → no such files exist (or only `.env.example` absent).
2. `git check-ignore .env.local; echo "exit=$?"` → record the exit code (informational only; `.env.local` must not be created by this plan).
3. Confirm `scripts/search-console/credentials.json` exists but is gitignored (`git check-ignore scripts/search-console/credentials.json` → exit 0) — do not read or print its contents.

### Step 2: Create `.env.example`

Create the file at the repository root with placeholder (empty) values only. Never include a real key, token, or `client_email`.

```
# BTC500 — optional environment variables (scripts only)
# Copy this file to `.env.local` (gitignored) and fill in values.
# The web app itself needs NO env vars for countdown, prices, or historical pages.

# GA4 property id (numeric, NOT the G- measurement id). Default: 560440382.
# Read by: scripts/analytics/client.ts, scripts/analytics/fetch-ga4.ts
GA4_PROPERTY_ID=

# Path to the Google Search Console service-account JSON key.
# Default: scripts/search-console/credentials.json (gitignored, never commit it).
# Read by: scripts/search-console/client.ts, fetch-search-console.ts, inspect-urls.ts
GSC_CREDENTIALS=

# Default Search Console property, so you can omit --site.
# Values: https://btc500.net/  or  sc-domain:btc500.net
# Read by: scripts/search-console/client.ts, fetch-search-console.ts
GSC_SITE=
```

**Verify**: `git status` shows only `.env.example` added (untracked). `.env.local` must NOT appear.

## Test plan

None (documentation-only). Verification is the file existing with placeholder values and no real secrets.

## Done criteria

ALL must hold:

- [ ] `.env.example` exists at the repository root
- [ ] It contains only placeholder/empty values — no real key, token, URL, or `client_email`
- [ ] It documents `GA4_PROPERTY_ID`, `GSC_CREDENTIALS`, and `GSC_SITE` with the script that reads each
- [ ] `git status` shows only `.env.example` added — no `src/`, `public/`, `scripts/`, or `.env.local` changes
- [ ] `scripts/search-console/credentials.json` remains untouched and gitignored

## STOP conditions

Stop and report back (do not improvise) if:

- `.env.local` already exists with contents (do not create or overwrite it; report instead).
- `scripts/search-console/credentials.json` is not gitignored (it must stay ignored; report before touching anything).
- Any drift in the env-var source files listed in the drift check (the var names/defaults may have changed).
- You are tempted to record a real credential value anywhere — that's a Hard Rule violation; stop and report.

## Maintenance notes

- If a new optional env var is added to a script, add it to `.env.example` in the same format.
- `.env.example` itself is safe to commit (placeholders only); never commit `.env.local` or `credentials.json`.
