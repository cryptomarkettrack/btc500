# Plan 002: Add CI gate: typecheck + test before production deploy

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9bfb258..HEAD -- .github package.json`
> If anything under `.github` or `package.json` changed since this plan was written, compare against the live files before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-make-npm-test-glob-based.md (CI runs `npm test`, which must exercise the glob-based suite this plan adds)
- **Category**: dx
- **Planned at**: commit `9bfb258`, 2026-11-11
- **Issue**: (omit — not published via `--issues`)

## Why this matters

Pushing to `main` auto-deploys to production on Vercel (`vercel.json`; `src/AGENTS.md` §12 treats a push as a production release). There is no CI workflow (`.github` is absent), so `tsc --noEmit`, `npm test`, and lint never run before a release — a type error or failing test can ship live. This plan adds a GitHub Actions workflow that gates `typecheck` and `test` on every push/PR to `main`. Lint runs as advisory only (continue-on-error) because main currently carries 515 prettier violations; it becomes a blocking gate once that drift is resolved separately (most are in `src/`, which the site-change freeze currently blocks).

## Current state

- No `.github` directory exists — no CI of any kind.
- `vercel.json` configures redirects, headers, trailingSlash/cleanUrls for Vercel deploys.
- `package.json` scripts: `typecheck` = `tsc --noEmit` (exit 0 locally), `test` = the glob-based suite after plan 001 (208 tests / 50 suites pass), `lint` = `eslint .` (515 errors on main, mostly `prettier/prettier`, auto-fixable).
- Recon confirmed `npm run typecheck` exits 0 and `npm test` exits 0 with all 208 tests passing.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run typecheck` | exit 0, no errors |
| Tests | `npm test` | exit 0; 208 tests / 50 suites pass; CSV verification OK |
| Lint (advisory) | `npm run lint` | currently exits non-zero (515 prettier violations) — expected, not a done criterion |

## Suggested executor toolkit

None required. Plain shell + the repo's own `npm` scripts. The workflow file is plain YAML; no YAML lint tool is required (the local `npm run typecheck` + `npm test` gates are the real verification).

## Scope

**In scope** (the only files you should create/modify):
- `.github/workflows/ci.yml` (create)

**Out of scope** (do NOT touch):
- Any file under `src/` or `public/` — blocked by the site-change freeze
- `package.json` beyond what plan 001 already changed — do not re-edit the test script here
- Lint config or source formatting — out of scope; lint stays advisory

## Git workflow

- Branch: `advisor/002-ci-gate`
- Commit once: `ci: add typecheck + test gate before production deploy`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `.github/workflows/ci.yml`

Create the workflow below. It runs on push to `main` and on pull requests targeting `main`. The required gate (fails the run) is `typecheck` + `test`; `lint` runs with `continue-on-error` so it flags drift without blocking merges while prettier violations remain on main.

```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Tests
        run: npm test

      - name: Lint (advisory)
        continue-on-error: true
        run: npm run lint
```

**Verify**: `git status` shows only `.github/workflows/ci.yml` added (untracked/new).

### Step 2: Run the exact commands CI will run, locally

**Verify**:
1. `npm run typecheck` → exit 0, no errors.
2. `npm test` → exit 0; `tests 208`, `suites 50`, `pass 208`, `fail 0`.

These are the exact steps CI will execute; both pass on `main` today, so the workflow will be green when it runs.

## Test plan

No new tests. The plan's verification reuses the existing suite via `npm test` (made glob-based by plan 001).

## Done criteria

ALL must hold:

- [ ] `.github/workflows/ci.yml` exists and matches the YAML above (trigger: push/PR to `main`; steps: checkout → setup-node 24 → npm ci → npm run typecheck → npm test → npm lint with continue-on-error)
- [ ] `npm run typecheck` exits 0 locally
- [ ] `npm test` exits 0 locally (208 tests / 50 suites / 0 fail)
- [ ] `git status` shows only `.github/workflows/ci.yml` added — no `src/`, `public/`, or `package.json` changes

## STOP conditions

Stop and report back (do not improvise) if:

- `.github` or `package.json` doesn't match the "Current state" excerpt (drift since the plan was written).
- `npm run typecheck` or `npm test` exits non-zero locally (CI would fail on main; fix those first, out of scope).
- You are asked to make lint blocking before the prettier drift in `src/` is resolved — that's a separate decision, not part of this plan.

## Maintenance notes

- Once the 515 prettier violations are resolved (a separate, freeze-blocked effort since most are in `src/`), flip `continue-on-error: true` to `false` on the lint step so lint becomes a blocking gate.
- Node version `24` matches the local environment (`node --version` → v24.x); bump it here if the repo standardizes on a different LTS.
