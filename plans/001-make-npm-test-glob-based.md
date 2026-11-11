# Plan 001: Make `npm test` run all test files via glob (verification baseline)

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9bfb258..HEAD -- package.json`
> If `package.json` changed since this plan was written, compare the "Current state" excerpt against the live file before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `9bfb258`, 2026-11-11
- **Issue**: (omit — not published via `--issues`)

## Why this matters

`package.json`'s `test` script enumerates every test file by name (22 explicit paths). That works today, but any test file a future plan adds (for example `src/lib/news.test.ts`) is silently excluded from `npm test` — only `bun test` (a glob) would catch it. Because the one-command "does the codebase work" check can't see new coverage, refactors can't rely on it and characterization tests for risky modules can't be verified through the standard gate. This plan makes `npm test` glob-based so every test file under the tested directories runs. It unblocks every later test-related plan.

## Current state

- `package.json:14` — the `test` script:
  ```
  "test": "node --experimental-strip-types --test src/lib/historical-csv.test.ts src/lib/halvings.test.ts ... scripts/autonomous/x/launch-content.test.mjs && node scripts/verify-historical-csv.mjs",
  ```
  It lists 22 test files by absolute path. Recon confirmed all 22 exist and `npm test` currently passes: 208 tests / 50 suites, exit 0, then `verify-historical-csv.mjs` reports "historical CSV verification passed".
- Repo convention (README §49): `npm test` is the documented domain-tests + CSV integrity check.
- `node --experimental-strip-types --test` natively expands quoted glob patterns (verified during recon: `src/lib/*.test.ts` + `scripts/autonomous/**/*.test.mjs` + `scripts/search-console/*.test.ts` → 208 tests, 50 suites, all pass — identical to the explicit list).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run typecheck` | exit 0, no errors |
| Tests | `npm test` | exit 0; all test files under the globs run; `verify-historical-csv.mjs` ends with "historical CSV verification passed" |
| Lint | `npm run lint` | exit 0 (note: lint currently has 515 prettier violations on main — see STOP conditions) |

## Suggested executor toolkit

None required. Plain shell + the repo's own `npm` scripts.

## Scope

**In scope** (the only files you should modify):
- `package.json` — the `test` script value only

**Out of scope** (do NOT touch, even though they look related):
- Any file under `src/` or `public/` — blocked by the active site-change freeze (`BTC500_GROWTH.md`: `git diff --stat 62e3a8a..HEAD -- src public/sitemap.xml` must be empty)
- `scripts/` test files or source — adding new tests is a separate, later plan
- Lint configuration or source formatting — the 515 prettier violations are out of scope for this plan

## Git workflow

- Branch: `advisor/001-test-glob` (repo convention: descriptive, no enforced prefix seen in `git log`)
- Commit once: `test: run all test files via glob in npm test`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Replace the explicit test-file list with quoted globs

Edit `package.json`, replacing the `test` script's `--test <explicit paths>` portion with quoted glob patterns that Node expands natively. Keep `&& node scripts/verify-historical-csv.mjs` at the end.

Target shape (replace the whole `test` script value):
```
"test": "node --experimental-strip-types --test \"src/lib/*.test.ts\" \"scripts/autonomous/**/*.test.mjs\" \"scripts/search-console/*.test.ts\" && node scripts/verify-historical-csv.mjs",
```

**Verify**: `npm run typecheck` → exit 0 (package.json is valid JSON; tsc doesn't check JSON but confirms nothing else broke).

### Step 2: Run the test suite and confirm every suite is exercised

**Verify**: `npm test` → exit 0; output shows `tests 208`, `suites 50`, `pass 208`, `fail 0`, and ends with `historical CSV verification passed`. This confirms the glob command is equivalent to the old explicit list.

### Step 3: Prove a brand-new test file is picked up without editing `package.json` again

Create a throwaway smoke test `src/lib/_glob_smoke.test.ts` containing one passing assertion, run `npm test`, confirm the smoke suite runs and passes, then delete the smoke test file.

**Verify**:
1. `npm test` after creating the smoke file → `pass` count increases by the smoke test's assertions and the smoke suite is listed.
2. Delete `src/lib/_glob_smoke.test.ts`; `git status` shows only `package.json` modified.

## Test plan

- No permanent new tests in this plan (the smoke test in Step 3 is temporary and removed).
- Structural pattern for future test files: model on `src/lib/halvings.test.ts` (uses `node:assert/strict` + `describe`/`it` from `node:test`).
- Verification: `npm test` → all pass; any future `src/lib/*.test.ts`, `scripts/autonomous/**/*.test.mjs`, or `scripts/search-console/*.test.ts` is included automatically.

## Done criteria

ALL must hold:

- [ ] `package.json` `test` script uses the three quoted globs above (no explicit per-file list)
- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0; `tests 208`, `suites 50`, `pass 208`, `fail 0`; ends with `historical CSV verification passed`
- [ ] A newly created `src/lib/*.test.ts` is run by `npm test` without touching `package.json` (demonstrated in Step 3, then removed)
- [ ] `git status` shows only `package.json` modified (no `src/`, `public/`, or `scripts/` changes)

## STOP conditions

Stop and report back (do not improvise) if:

- `package.json` at the `test` script location doesn't match the "Current state" excerpt (the file drifted since this plan was written).
- `npm test` exits non-zero or any suite count differs from 208/50/208/0.
- The smoke test in Step 3 is not picked up by `npm test` (glob expansion not working in this environment).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a future plan adds a test directory outside `src/lib/`, `scripts/autonomous/`, or `scripts/search-console/`, add its glob to the `test` script.
- `npm run lint` is NOT a done criterion here because main currently has 515 prettier violations; linting is a separate concern (plan 002's CI can run typecheck+test as the gate and treat lint as advisory until prettier drift is resolved).
