#!/usr/bin/env bash
#
# Daily results review for btc500.net — the agent that checks whether the
# growth automation is actually gaining anything.
#
# The growth cycle proves activity (commit, tests, deploy). This proves
# outcome: it refreshes the measurement reports, reduces them to signals,
# runs the `growth-review` agent against them, and refuses a verdict the data
# does not support. A non-improving verdict fails the run on purpose — no
# results is a failure, not a shrug.
#
# Pipeline — every stage is logged and recorded in last-review.txt:
#   1. wait      for the growth cycle to release its lock (one tree, two jobs)
#   2. measure   refresh Search Console / GA4 / URL inspection, then collect
#                the numbers into review-input.json (rule.mayClaimImproving
#                comes from the data, not from the model)
#   3. review    run the agent with GROWTH_REVIEW.md + the run context
#   4. check     validate review-latest.json against the rule (see
#                validate-review.mjs); an invalid verdict is a failed run
#   5. gate      `npm test` + `tsc --noEmit` before anything is pushed
#   6. deploy    push, wait for the Vercel commit status on the pushed sha
#   7. report    append review-history.csv, notify, update last-review.txt
#
# Usage:
#   scripts/autonomous/run-review-cycle.sh
#   BTC500_REVIEW_DRY_RUN=1 scripts/autonomous/run-review-cycle.sh
#   BTC500_REVIEW_DEEP=1 scripts/autonomous/run-review-cycle.sh   # force deep mode
#
# Exit codes: 0 improving, 1 anything else that matters, 2 already running,
# 3 misconfigured.

set -uo pipefail
umask 022

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export GIT_TERMINAL_PROMPT=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="${BTC500_REVIEW_STATE_DIR:-${BTC500_GROWTH_STATE_DIR:-$HOME/.local/state/btc500-growth}}"
PROMPT_FILE="$SCRIPT_DIR/GROWTH_REVIEW.md"
REVIEW_FILE="$SCRIPT_DIR/review-latest.json"
INPUT_FILE="$STATE_DIR/review-input.json"
VALIDATOR="$SCRIPT_DIR/validate-review.mjs"
COLLECTOR="$SCRIPT_DIR/collect-results.mjs"
AGENT="${BTC500_REVIEW_AGENT:-growth-review}"
OPENCODE_CMD="${BTC500_REVIEW_OPENCODE:-opencode}"
SITE="${BTC500_GROWTH_SITE:-https://btc500.net}"
DEPLOY_BRANCH="${BTC500_GROWTH_DEPLOY_BRANCH:-main}"

TODAY="$(date +%F)"
NOW="$(date)"
WEEKDAY="$(date +%u)"   # 7 = Sunday: the deep review
MODE="daily"
[[ "$WEEKDAY" == "7" || "${BTC500_REVIEW_DEEP:-0}" == "1" ]] && MODE="deep"

LOCK_DIR="$STATE_DIR/review.lock"
CYCLE_LOCK="$STATE_DIR/run.lock"       # held by run-growth-cycle.sh
LOG_FILE="$STATE_DIR/review-$TODAY.log"
STATUS_FILE="$STATE_DIR/last-review.txt"
HISTORY_FILE="$STATE_DIR/review-history.csv"

# Same defaults as the growth cycle; lib.sh reads them.
HANDOFF_GRACE="${BTC500_GROWTH_HANDOFF_GRACE:-300}"
STABLE_INTERVAL="${BTC500_GROWTH_STABLE_INTERVAL:-15}"
STABLE_CHECKS="${BTC500_GROWTH_STABLE_CHECKS:-3}"
SETTLE_MAX="${BTC500_GROWTH_SETTLE_MAX:-1200}"
DEPLOY_TIMEOUT="${BTC500_GROWTH_DEPLOY_TIMEOUT:-480}"
DEPLOY_POLL="${BTC500_GROWTH_DEPLOY_POLL:-15}"
NOTIFY_URL="${BTC500_GROWTH_NOTIFY_URL:-}"

ATTEMPT_TIMEOUT="${BTC500_REVIEW_ATTEMPT_TIMEOUT:-3600}"
CYCLE_DEADLINE="${BTC500_REVIEW_DEADLINE:-7200}"
LOCK_WAIT="${BTC500_REVIEW_LOCK_WAIT:-5400}"
FETCH_TIMEOUT="${BTC500_REVIEW_FETCH_TIMEOUT:-600}"

MODELS=(
  "opencode/deepseek-v4.1-flash-free"
  "opencode/glm-5.3-flash-free"
  "opencode/minimax-m3.1-flash-free"
  "opencode/mimo-v2.6-flash-free"
  "opencode/flint-40b-free"
)

# Set by the collector / validator / gate, reported by finish().
SUCCESS_MODEL=""
FINAL_HEAD=""
VERDICT="none"
GREEN_COUNT=0
STALLED_COUNT=0
MANDATE_COUNT=0
TEST_STATE="skipped"
VERCEL_STATE="skipped"
RUNNER_CHECK="none"
STATUS_NOTE=""
COLLECTED=0

# Shared: log, notify, acquire_lock, wait_for_stability, btc_validate,
# btc_vercel_wait, btc_repo_slug. See lib.sh for the globals each expects.
source "$SCRIPT_DIR/lib.sh"

status_message() {
  local status="$1" model="${SUCCESS_MODEL:-none}" head="${FINAL_HEAD:0:7}"
  case "$status" in
    improving)        echo "Results improved: verdict=${VERDICT}, ${GREEN_COUNT} positive signals. ${MANDATE_COUNT} mandate(s) for the next cycle." ;;
    stagnant)         echo "No measurable gain. Verdict=stagnant, ${GREEN_COUNT} positive signal(s), ${STALLED_COUNT} stalled. ${MANDATE_COUNT} mandate(s) issued — the next cycle must execute them." ;;
    failing)          echo "Results are going backwards. Verdict=failing, ${GREEN_COUNT} positive signal(s). ${MANDATE_COUNT} mandate(s) issued." ;;
    verdict-invalid)  echo "The reviewer's verdict was rejected: ${STATUS_NOTE}" ;;
    no-review)        echo "The reviewer produced no review-latest.json. The run failed." ;;
    deferred)         echo "The growth cycle still holds the tree after ${LOCK_WAIT}s; no review ran." ;;
    validation-failed) echo "Local checks failed (${TEST_STATE}); the review was not pushed." ;;
    push-blocked)     echo "The review could not be pushed (tree dirty or remote rejected). Head ${head} is local only." ;;
    failed)           echo "Configuration or setup failure. Check the log." ;;
    *)                echo "status=${status} verdict=${VERDICT} tests=${TEST_STATE} vercel=${VERCEL_STATE}." ;;
  esac
}

finish() {
  local code="$1" status="$2"
  local model="${SUCCESS_MODEL:-none}" head="${FINAL_HEAD:-unknown}"

  printf '%s status=%s model=%s head=%s verdict=%s green=%s stalled=%s mandates=%s check=%s tests=%s vercel=%s note=%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$status" "$model" "$head" \
    "$VERDICT" "$GREEN_COUNT" "$STALLED_COUNT" "$MANDATE_COUNT" "$RUNNER_CHECK" \
    "$TEST_STATE" "$VERCEL_STATE" "${STATUS_NOTE:-none}" > "$STATUS_FILE"

  btc_append_history "$HISTORY_FILE" \
    "timestamp,status,model,verdict,green,stalled,mandates,runner_check,note" \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$status" "$model" "$VERDICT" \
    "$GREEN_COUNT" "$STALLED_COUNT" "$MANDATE_COUNT" "$RUNNER_CHECK" "${STATUS_NOTE:-none}"

  rm -rf "$LOCK_DIR"
  log "Finished: status=$status model=$model head=$head verdict=$VERDICT green=$GREEN_COUNT stalled=$STALLED_COUNT mandates=$MANDATE_COUNT check=$RUNNER_CHECK tests=$TEST_STATE vercel=$VERCEL_STATE"
  notify "BTC500 review: ${status}" "$(status_message "$status")"
  exit "$code"
}

# ---------------------------------------------------------------- preflight ---

if ! acquire_lock "$LOCK_DIR"; then
  echo "Another review is already running ($LOCK_DIR); exiting." >&2
  exit 2
fi

exec >>"$LOG_FILE" 2>&1
trap 'rm -rf "$LOCK_DIR"' EXIT

log "=== BTC500 results review start: $NOW (mode=$MODE) ==="
log "Repo: $REPO_ROOT"

find "$STATE_DIR" -maxdepth 1 -name 'review-*.log' -mtime +60 -delete 2>/dev/null || true

for bin in "$OPENCODE_CMD" git curl node npm; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    log "FATAL: required command not found: $bin"
    finish 3 failed
  fi
done

for file in "$PROMPT_FILE" "$VALIDATOR" "$COLLECTOR"; do
  if [[ ! -f "$file" ]]; then
    log "FATAL: required file missing: $file"
    finish 3 failed
  fi
done

cd "$REPO_ROOT" || { log "FATAL: cannot cd to $REPO_ROOT"; finish 3 failed; }

if [[ "$(git branch --show-current 2>/dev/null)" != "$DEPLOY_BRANCH" ]]; then
  log "FATAL: not on $DEPLOY_BRANCH; refusing to run"
  finish 3 failed
fi

# The growth cycle and this review share one working tree. Whichever job sees
# the other's lock waits instead of interleaving: two sessions in one checkout
# would produce conflicts neither of them can resolve unattended.
if [[ "${BTC500_REVIEW_NOWAIT_CYCLE:-0}" != "1" ]]; then
  waited=0
  while [[ -d "$CYCLE_LOCK" ]]; do
    if (( waited >= LOCK_WAIT )); then
      STATUS_NOTE="cycle-holds-tree-${waited}s"
      log "FATAL: the growth cycle still holds $CYCLE_LOCK after ${waited}s; deferring"
      finish 1 deferred
    fi
    log "Growth cycle holds $CYCLE_LOCK; waiting (${waited}s/${LOCK_WAIT}s)"
    sleep 60
    waited=$((waited + 60))
  done
fi

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  log "WARN: working tree is dirty before the run; skipping fast-forward pull"
else
  if git fetch --quiet origin "$DEPLOY_BRANCH"; then
    git merge --ff-only --quiet "origin/$DEPLOY_BRANCH" 2>/dev/null \
      || log "WARN: could not fast-forward to origin/$DEPLOY_BRANCH"
  else
    log "WARN: git fetch failed; continuing with the local checkout"
  fi
fi

if [[ "${BTC500_REVIEW_DRY_RUN:-0}" == "1" ]]; then
  log "DRY RUN: prompt is $(wc -c < "$PROMPT_FILE" | tr -d ' ') bytes; models: ${MODELS[*]}"
  log "DRY RUN: HEAD is $(git rev-parse HEAD); measurement refresh skipped"
  echo "dry-run ok"
  exit 0
fi

BASE_HEAD="$(git rev-parse HEAD)"

# ----------------------------------------------------------------- measure ---

# The reviewer must not depend on yesterday's numbers: fetch them itself. A
# failed fetch is not fatal — the collector reports the source as missing or
# stale, and stale data blocks any claim of improvement.
if [[ "${BTC500_REVIEW_SKIP_FETCH:-0}" != "1" ]]; then
  log "--- Refreshing measurement reports ---"
  fetch_one() {
    local label="$1"
    shift
    log "  fetch: $label"
    local out rc
    out="$(perl -e 'alarm shift; exec @ARGV' "$FETCH_TIMEOUT" "$@" 2>&1)"
    rc=$?
    log "  fetch: $label rc=$rc"
    if [[ $rc -ne 0 ]]; then
      log "  fetch: $label output: $(printf '%s' "$out" | tail -3 | tr '\n' ' ')"
    fi
  }
  fetch_one "search-console-7d" node "$REPO_ROOT/scripts/search-console/fetch-search-console.ts" --days=7
  fetch_one "ga4-7d" node "$REPO_ROOT/scripts/analytics/fetch-ga4.ts" --days=7
  fetch_one "url-inspection" node "$REPO_ROOT/scripts/search-console/inspect-urls.ts"
else
  log "SKIP_FETCH: using the reports already on disk"
fi

log "--- Collecting results ---"
COLLECT_OUT="$(node "$COLLECTOR" --state-dir "$STATE_DIR" 2>&1)"
COLLECT_RC=$?
while IFS= read -r line; do
  [[ -n "$line" ]] && log "  $line"
done <<< "$COLLECT_OUT"
if [[ $COLLECT_RC -ne 0 ]]; then
  STATUS_NOTE="collector-failed-rc$COLLECT_RC"
  log "FATAL: the results collector failed; there is nothing to review"
  finish 1 failed
fi

# ------------------------------------------------------------------ review ---

START_HEAD="$(git rev-parse HEAD)"
START_EPOCH="$(date +%s)"

RULE_LINE="$(node -e '
const fs = require("fs");
const input = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const rule = input.rule ?? {};
const blocked = (rule.blockedBecause ?? []).join("; ") || "none";
console.log(`may_claim_improving=${rule.mayClaimImproving} green=${rule.outcomeGreen} stalled=${rule.stalled} regressed=${(rule.regressed ?? []).join("+") || 0} stale=${rule.stale} | blocked: ${blocked}`);
console.log(`non_improving_streak=${input.reviewStreak?.nonImproving ?? 0}`);
console.log(`overdue_mandates=${(input.previousReview?.overdue ?? []).length}`);
' "$INPUT_FILE" 2>&1)"
while IFS= read -r line; do
  [[ -n "$line" ]] && log "  input: $line"
done <<< "$RULE_LINE"

PROMPT="$(cat "$PROMPT_FILE")"
PROMPT="${PROMPT}

--- RUN CONTEXT (written by run-review-cycle.sh, do not copy into the file) ---
TODAY: $TODAY
MODE: $MODE
STATE DIR: $STATE_DIR
INPUT: $INPUT_FILE   (read it first: metrics, signals, rule, activity, previous review)
REVIEW FILE TO WRITE: $SCRIPT_DIR/review-latest.json   (then commit and push it)
$RULE_LINE
Exit codes do not reach you: the runner validates the file you leave behind.
If may_claim_improving=false you may NOT write verdict \"improving\".
Write the file, commit it, push it, then print the report from §9."

log "--- Runner ---"
LAST_RC=1
for model in "${MODELS[@]}"; do
  if [[ $(( $(date +%s) - START_EPOCH )) -ge "$CYCLE_DEADLINE" ]]; then
    log "Review deadline reached before trying $model; stopping"
    break
  fi

  SAFE_MODEL="$(printf '%s' "$model" | tr '/:' '__')"
  ATTEMPT_LOG="$STATE_DIR/attempts/$TODAY.review.$SAFE_MODEL.log"
  mkdir -p "$STATE_DIR/attempts"
  BEFORE_HEAD="$(git rev-parse HEAD)"

  log "--- Attempt with $model (timeout ${ATTEMPT_TIMEOUT}s) ---"
  log "Attempt log: $ATTEMPT_LOG"

  perl -e 'alarm shift; exec @ARGV' "$ATTEMPT_TIMEOUT" \
    "$OPENCODE_CMD" run \
      --agent "$AGENT" \
      --model "$model" \
      --title "BTC500 results review $TODAY" \
      --auto \
      "$PROMPT" 2>&1 | tee -a "$ATTEMPT_LOG"
  LAST_RC=${PIPESTATUS[0]}
  log "Model $model exited with code $LAST_RC (the exit code is not the verdict)"

  if wait_for_stability "$BEFORE_HEAD"; then
    log "Settled after $model"
  else
    log "Settle window expired after $model; continuing with the tree as it is"
  fi

  AFTER_HEAD="$(git rev-parse HEAD)"
  if [[ "$AFTER_HEAD" != "$BEFORE_HEAD" ]]; then
    log "HEAD advanced: ${BEFORE_HEAD:0:7} -> ${AFTER_HEAD:0:7}"
    SUCCESS_MODEL="$model"
    break
  fi

  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    log "Attempt left the verdict uncommitted; not retrying on a dirty tree"
    SUCCESS_MODEL="$model"
    break
  fi

  log "Attempt produced no verdict file; trying the next free model"
done

FINAL_HEAD="$(git rev-parse HEAD)"

# ------------------------------------------------------------------- check ---

log "--- Verdict check (validate-review.mjs) ---"
VALID_OUT="$(node "$VALIDATOR" --today "$TODAY" --mode "$MODE" --state-dir "$STATE_DIR" 2>&1)"
VALID_RC=$?
while IFS= read -r line; do
  [[ -n "$line" ]] && log "  $line"
done <<< "$VALID_OUT"

# The verdict itself, for the report and the status file, read from whatever
# the reviewer left behind (working tree or the last commit).
VERDICT_READ="$(node -e '
const fs = require("fs");
try {
  const j = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const signals = Array.isArray(j.signals) ? j.signals : [];
  console.log([
    j.verdict ?? "none",
    signals.filter((s) => s.state === "green").length,
    signals.filter((s) => s.state === "stalled").length,
    Array.isArray(j.mandates) ? j.mandates.length : 0,
  ].join(" "));
} catch {
  console.log("none 0 0 0");
}
' "$REVIEW_FILE" 2>&1)"
read -r VERDICT GREEN_COUNT STALLED_COUNT MANDATE_COUNT <<< "$VERDICT_READ"
VERDICT="${VERDICT:-none}"
GREEN_COUNT="${GREEN_COUNT:-0}"
STALLED_COUNT="${STALLED_COUNT:-0}"
MANDATE_COUNT="${MANDATE_COUNT:-0}"
log "Verdict: $VERDICT (green=$GREEN_COUNT stalled=$STALLED_COUNT mandates=$MANDATE_COUNT)"

case "$VALID_RC" in
  0) RUNNER_CHECK="pass" ;;
  1)
    RUNNER_CHECK="fail"
    STATUS_NOTE="$(printf '%s' "$VALID_OUT" | grep '^FAIL' | tr '\n' ' ' | cut -c1-180)"
    STATUS_NOTE="${STATUS_NOTE:-$(printf '%s' "$VALID_OUT" | tr '\n' ' ' | cut -c1-180)}"
    ;;
  *)
    RUNNER_CHECK="absent"
    STATUS_NOTE="review-latest.json was not produced"
    ;;
esac

# ---------------------------------------------------------------- validation ---

UNPUSHED=0
git fetch --quiet origin "$DEPLOY_BRANCH" 2>/dev/null || true
AHEAD="$(git rev-list --count "origin/$DEPLOY_BRANCH..HEAD" 2>/dev/null || echo 0)"
if [[ "$AHEAD" =~ ^[0-9]+$ ]] && [[ "$AHEAD" -gt 0 ]]; then
  UNPUSHED=1
fi
DIRTY="$(git status --porcelain 2>/dev/null)"

if [[ ( "$BASE_HEAD" != "$(git rev-parse HEAD)" || $UNPUSHED -eq 1 || -n "$DIRTY" ) \
      && "${BTC500_REVIEW_SKIP_VALIDATE:-0}" != "1" ]]; then
  btc_validate
fi

# An uncommitted verdict still has to land: the next cycle reads it from the
# repo, and a dirty tree would block the growth cycle's own push tomorrow.
if [[ -n "$DIRTY" ]]; then
  if [[ "$TEST_STATE" != "pass" ]]; then
    STATUS_NOTE="local-checks-${TEST_STATE}"
    log "Not committing the review: local checks are ${TEST_STATE}. Working tree left for the owner."
    finish 1 validation-failed
  fi
  if [[ "$RUNNER_CHECK" != "pass" ]]; then
    # An invalid verdict is committed anyway, clearly labelled: it is the
    # evidence that the reviewer failed, and dropping it would hide that.
    git add -A
    git commit -q -m "review: rejected verdict preserved by the runner ($RUNNER_CHECK)" \
      || log "WARN: could not commit the rejected verdict"
    COLLECTED=1
    STATUS_NOTE="${STATUS_NOTE:+$STATUS_NOTE }rejected-${RUNNER_CHECK}"
    log "Committed the rejected verdict as evidence (check=$RUNNER_CHECK)"
  else
    git add -A
    git commit -q -m "review: ${VERDICT} — collected by the runner (agent exited without committing)" \
      || log "WARN: could not commit the review"
    COLLECTED=1
    STATUS_NOTE="collected-uncommitted"
    log "Collected the reviewer's uncommitted work into a commit"
  fi
  DIRTY="$(git status --porcelain 2>/dev/null)"
fi

# -------------------------------------------------------------------- push ----

PUSHED="no"
UNPUSHED=0
AHEAD="$(git rev-list --count "origin/$DEPLOY_BRANCH..HEAD" 2>/dev/null || echo 0)"
if [[ "$AHEAD" =~ ^[0-9]+$ ]] && [[ "$AHEAD" -gt 0 ]]; then
  UNPUSHED=1
fi
FINAL_HEAD="$(git rev-parse HEAD)"

if [[ $UNPUSHED -eq 1 ]]; then
  if [[ "$TEST_STATE" != "pass" ]]; then
    STATUS_NOTE="${STATUS_NOTE:+$STATUS_NOTE }local-checks-${TEST_STATE}"
    log "Not pushing: local checks are ${TEST_STATE}."
    finish 1 validation-failed
  elif [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    STATUS_NOTE="${STATUS_NOTE:+$STATUS_NOTE }dirty-tree-blocked-push"
    log "WARN: $AHEAD unpushed commit(s) but the tree is dirty; not auto-pushing"
    finish 1 push-blocked
  else
    log "Pushing $AHEAD commit(s) to origin/$DEPLOY_BRANCH"
    if git push origin "$DEPLOY_BRANCH"; then
      PUSHED="yes"
    else
      STATUS_NOTE="${STATUS_NOTE:+$STATUS_NOTE }push-rejected"
      log "ERROR: push failed"
      finish 1 push-blocked
    fi
  fi
else
  PUSHED="already-up-to-date"
fi

# --------------------------------------------------------------- deployment ---

REPO_SLUG="$(btc_repo_slug)"
if [[ "$(git rev-list --count "origin/$DEPLOY_BRANCH..HEAD" 2>/dev/null || echo 1)" == "0" ]]; then
  btc_vercel_wait "$FINAL_HEAD" "$REPO_SLUG"
else
  log "Skipping the Vercel status wait (pushed=$PUSHED, local commits remain)"
  VERCEL_STATE="skipped"
fi

# ------------------------------------------------------------------ report ----

if [[ "$RUNNER_CHECK" != "pass" ]]; then
  log "=== Review rejected: check=$RUNNER_CHECK verdict=$VERDICT note=$STATUS_NOTE ==="
  if [[ "$RUNNER_CHECK" == "absent" ]]; then
    finish 1 no-review
  fi
  finish 1 verdict-invalid
fi

case "$VERDICT" in
  improving)
    log "=== Review improving: ${GREEN_COUNT} positive signal(s), ${MANDATE_COUNT} mandate(s) (push=$PUSHED, vercel=$VERCEL_STATE) ==="
    finish 0 improving
    ;;
  stagnant)
    log "=== Review stagnant: no measurable gain, ${STALLED_COUNT} stalled signal(s), ${MANDATE_COUNT} mandate(s) ==="
    finish 1 stagnant
    ;;
  failing)
    log "=== Review failing: results are going backwards, ${MANDATE_COUNT} mandate(s) issued ==="
    finish 1 failing
    ;;
  *)
    STATUS_NOTE="${STATUS_NOTE:+$STATUS_NOTE }unexpected-verdict-${VERDICT}"
    log "=== Review produced an unexpected verdict: $VERDICT ==="
    finish 1 verdict-invalid
    ;;
esac
