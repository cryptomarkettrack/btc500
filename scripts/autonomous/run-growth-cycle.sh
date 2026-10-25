#!/usr/bin/env bash
#
# Daily autonomous growth cycle for btc500.net.
#
# Runs the `growth-cycle` OpenCode agent with a headless prompt, falling back
# across the free OpenCode models (DeepSeek first). Each attempt is time-boxed.
# The script is deliberately defensive: it locks against overlapping runs, never
# force-pushes, never rewrites history, and reports what it actually verified.
#
# Pipeline — every stage is logged and recorded in last-status.txt:
#   1. preflight  refresh the price archive, list due experiments, health check
#   2. attempt    run the agent, then wait out the handoff: the CLI can exit
#                 while the session keeps working (exit 130 on every run), so a
#                 commit landing minutes later counts — not the exit code
#   3. gate       `npm test` + `tsc --noEmit` before anything is pushed
#   4. deploy     push, wait for the Vercel commit status on the pushed sha,
#                 then verify the agent's last-deploy.json manifest against the
#                 live HTML — a homepage 200 right after a push only proves the
#                 *previous* deployment is still up
#   5. report     append status-history.csv, notify, update last-status.txt
#
# Usage:
#   scripts/autonomous/run-growth-cycle.sh            # normal run, logs to state dir
#   BTC500_GROWTH_DRY_RUN=1 scripts/autonomous/run-growth-cycle.sh
#
# Exit codes: 0 shipped and verified, 1 failed or unverified, 2 already
# running, 3 misconfigured.

set -uo pipefail
umask 022

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export GIT_TERMINAL_PROMPT=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="${BTC500_GROWTH_STATE_DIR:-$HOME/.local/state/btc500-growth}"
PROMPT_FILE="$SCRIPT_DIR/GROWTH_PROMPT.md"
AGENT="${BTC500_GROWTH_AGENT:-growth-cycle}"
# Overridable so the pipeline can be exercised with a fake agent (tests).
OPENCODE_CMD="${BTC500_GROWTH_OPENCODE:-opencode}"
SITE="${BTC500_GROWTH_SITE:-https://btc500.net}"
DEPLOY_BRANCH="${BTC500_GROWTH_BRANCH:-main}"

# Free OpenCode models only. DeepSeek is the primary; the rest are fallbacks for
# a failed or unproductive attempt, not equal-weight choices.
MODELS=(
  "opencode/deepseek-v4.1-flash-free"
  "opencode/glm-5.3-flash-free"
  "opencode/minimax-m3.1-flash-free"
  "opencode/mimo-v2.6-flash-free"
  "opencode/flint-40b-free"
)

# 90 minutes per model, 3 hours for the whole cycle.
ATTEMPT_TIMEOUT="${BTC500_GROWTH_ATTEMPT_TIMEOUT:-5400}"
CYCLE_DEADLINE="${BTC500_GROWTH_DEADLINE:-10800}"

# The OpenCode CLI can exit while the server-side session is still working
# (observed every run: exit 130 after 10-17 minutes, the first commit landing
# 136-269s after that exit). The exit code is therefore ignored: after an
# attempt we observe the repository, then require HEAD and the tree to be
# unchanged for STABLE_CHECKS checks STABLE_INTERVAL seconds apart.
# HANDOFF_GRACE is how long we keep watching before concluding "no commit is
# coming", so a second model is never started on top of a live session.
SETTLE_MAX="${BTC500_GROWTH_SETTLE_MAX:-1200}"
HANDOFF_GRACE="${BTC500_GROWTH_HANDOFF_GRACE:-300}"
STABLE_CHECKS="${BTC500_GROWTH_STABLE_CHECKS:-3}"
STABLE_INTERVAL="${BTC500_GROWTH_STABLE_INTERVAL:-45}"

# Deploy verification: poll the GitHub commit status (Vercel) for this long.
DEPLOY_TIMEOUT="${BTC500_GROWTH_DEPLOY_TIMEOUT:-480}"
DEPLOY_POLL="${BTC500_GROWTH_DEPLOY_POLL:-20}"

# Optional ntfy/Bark/webhook endpoint; osascript is used either way.
NOTIFY_URL="${BTC500_GROWTH_NOTIFY_URL:-}"

TODAY="$(date +%F)"
NOW="$(date '+%Y-%m-%d %H:%M:%S %Z')"
LOG_FILE="$STATE_DIR/$TODAY.log"
ATTEMPT_DIR="$STATE_DIR/attempts"
LOCK_DIR="$STATE_DIR/run.lock"
STATUS_FILE="$STATE_DIR/last-status.txt"
HISTORY_FILE="$STATE_DIR/status-history.csv"
PREFLIGHT_FILE="$STATE_DIR/preflight.json"
ARCHIVE_CSV="public/btc-usd-max.csv"

mkdir -p "$STATE_DIR" "$ATTEMPT_DIR"

# Shared: log, notify, acquire_lock, wait_for_stability, btc_validate,
# btc_vercel_wait, btc_repo_slug, btc_append_history. See lib.sh for the
# globals each one expects.
source "$SCRIPT_DIR/lib.sh"

# Result of the current run; every finish() path reports these.
SUCCESS_MODEL=""
FINAL_HEAD=""
TEST_STATE="skipped"
VERCEL_STATE="skipped"
MANIFEST_STATE="skipped"
ARCHIVE_STATE="unknown"
ARCHIVE_LIVE="n/a"
SITE_CODE="000"
STATUS_NOTE=""

status_message() {
  local status="$1" model="${SUCCESS_MODEL:-none}" head="${FINAL_HEAD:0:7}"
  case "$status" in
    shipped)             echo "Model ${model##*/} shipped ${head} and production serves it (vercel=${VERCEL_STATE}, manifest=${MANIFEST_STATE})." ;;
    archive-only)        echo "Price archive refreshed to ${ARCHIVE_LAST_ROW:-today} and verified live. The agent produced no commit." ;;
    archive-unverified)  echo "Price archive was refreshed but production does not serve the new rows yet. Check the log." ;;
    shipped-unverified)  echo "Model ${model##*/} shipped ${head} but production was not proven: vercel=${VERCEL_STATE}, manifest=${MANIFEST_STATE}. Check the log." ;;
    deploy-failed)       echo "Vercel reported ${VERCEL_STATE} for ${head}. btc500.net may be serving the previous build." ;;
    validation-failed)   echo "Local checks failed (${TEST_STATE}); nothing was pushed. Head ${head} is still local." ;;
    push-blocked)        echo "Commits could not be pushed (tree dirty or remote rejected). Head ${head} is local only." ;;
    no-commit)           echo "Model ${model##*/} finished without a commit. Archive ${ARCHIVE_STATE}." ;;
    dirty-tree)          echo "Working tree was left dirty at ${head}. Check the log." ;;
    site-down)           echo "Production homepage returned ${SITE_CODE}. Check btc500.net now." ;;
    failed)              echo "Configuration or setup failure. Check the log." ;;
    *)                   echo "status=${status} vercel=${VERCEL_STATE} manifest=${MANIFEST_STATE}." ;;
  esac
}

finish() {
  local code="$1" status="$2"
  local model="${SUCCESS_MODEL:-none}" head="${FINAL_HEAD:-unknown}"

  printf '%s status=%s model=%s head=%s tests=%s vercel=%s manifest=%s site=%s archive=%s note=%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$status" "$model" "$head" \
    "$TEST_STATE" "$VERCEL_STATE" "$MANIFEST_STATE" "$SITE_CODE" "$ARCHIVE_STATE" \
    "${STATUS_NOTE:-none}" > "$STATUS_FILE"

  # Append-only history: last-status.txt is overwritten every run, this is not.
  if [[ ! -f "$HISTORY_FILE" ]]; then
    printf 'timestamp,status,model,head,tests,vercel,manifest,site,archive,note\n' > "$HISTORY_FILE"
  fi
  printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$status" "$model" "$head" \
    "$TEST_STATE" "$VERCEL_STATE" "$MANIFEST_STATE" "$SITE_CODE" "$ARCHIVE_STATE" \
    "$(printf '%s' "${STATUS_NOTE:-}" | tr -d ',')" >> "$HISTORY_FILE"

  rm -rf "$LOCK_DIR"
  log "Finished: status=$status model=$model head=$head tests=$TEST_STATE vercel=$VERCEL_STATE manifest=$MANIFEST_STATE site=$SITE_CODE archive=$ARCHIVE_STATE"
  notify "BTC500 growth: ${status}" "$(status_message "$status")"
  exit "$code"
}

# ---------------------------------------------------------------- preflight ---

if ! acquire_lock "$LOCK_DIR"; then
  echo "Another growth cycle is already running ($LOCK_DIR); exiting." >&2
  exit 2
fi

exec >>"$LOG_FILE" 2>&1
trap 'rm -rf "$LOCK_DIR"' EXIT

log "=== BTC500 growth cycle start: $NOW ==="
log "Repo: $REPO_ROOT"

# Rotate old logs so the state directory stays small.
find "$STATE_DIR" -maxdepth 1 -name '*.log' -mtime +60 -delete 2>/dev/null || true
find "$ATTEMPT_DIR" -maxdepth 1 -name '*.log' -mtime +30 -delete 2>/dev/null || true

for bin in "$OPENCODE_CMD" git curl perl node npm; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    log "FATAL: required command not found: $bin"
    finish 3 failed
  fi
done

if [[ ! -f "$PROMPT_FILE" ]]; then
  log "FATAL: prompt file missing: $PROMPT_FILE"
  finish 3 failed
fi

cd "$REPO_ROOT" || { log "FATAL: cannot cd to $REPO_ROOT"; finish 3 failed; }

if [[ "$(git branch --show-current 2>/dev/null)" != "$DEPLOY_BRANCH" ]]; then
  log "FATAL: not on $DEPLOY_BRANCH; refusing to run"
  finish 3 failed
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

if [[ "${BTC500_GROWTH_DRY_RUN:-0}" == "1" ]]; then
  log "DRY RUN: prompt is $(wc -c < "$PROMPT_FILE" | tr -d ' ') bytes; models: ${MODELS[*]}"
  log "DRY RUN: HEAD is $(git rev-parse HEAD); preflight skipped"
  echo "dry-run ok"
  exit 0
fi

# Deterministic work the agent should not have to spend a cycle on: refresh the
# on-site price archive and list what preflight found. The runner writes the
# summary to $PREFLIGHT_FILE for the agent to read before it decides.
log "--- Preflight ---"
PREFLIGHT_OUT="$(node "$SCRIPT_DIR/preflight.mjs" --state-dir "$STATE_DIR" 2>&1)"
PREFLIGHT_RC=$?
while IFS= read -r line; do
  [[ -n "$line" ]] && log "  $line"
done <<< "$PREFLIGHT_OUT"
ARCHIVE_STATE="$(printf '%s\n' "$PREFLIGHT_OUT" | sed -n 's/^archive=\([a-z-]*\).*/\1/p' | head -1)"
ARCHIVE_STATE="${ARCHIVE_STATE:-unknown}"
ARCHIVE_LAST_ROW="$(printf '%s\n' "$PREFLIGHT_OUT" | sed -n 's/^archive=[a-z-]* last=\([^ ]*\).*/\1/p' | head -1)"
DUE_EXPERIMENTS="$(printf '%s\n' "$PREFLIGHT_OUT" | sed -n 's/^experiments=open:[0-9]* max:[0-9?]* due:\([0-9]*\).*/\1/p' | head -1)"
DUE_EXPERIMENTS="${DUE_EXPERIMENTS:-0}"
if [[ $PREFLIGHT_RC -ne 0 ]]; then
  log "WARN: preflight exited $PREFLIGHT_RC"
  STATUS_NOTE="preflight-exit-$PREFLIGHT_RC"
fi

BASE_HEAD="$(git rev-parse HEAD)"

# The refreshed archive is committed by the runner, not the agent: it is
# mechanical, and it must not depend on the model having a good day.
PREFLIGHT_COMMITTED=0
if [[ -n "$(git status --porcelain -- "$ARCHIVE_CSV" btc-usd-max.csv 2>/dev/null)" ]]; then
  log "Committing refreshed archive (last row $ARCHIVE_LAST_ROW)"
  if git add -- "$ARCHIVE_CSV" btc-usd-max.csv \
    && git commit --quiet -m "growth: refresh the daily price archive" \
      -m "Preflight appended rows through ${ARCHIVE_LAST_ROW:-today} in $ARCHIVE_CSV and the root copy." \
      -m "Automated by scripts/autonomous/refresh-archive.mjs (overlap-validated against the existing rows)."; then
    PREFLIGHT_COMMITTED=1
    ARCHIVE_STATE="refreshed-committed"
    log "Archive commit: $(git rev-parse --short HEAD)"
  else
    log "WARN: could not commit the refreshed archive"
    git reset --quiet -- "$ARCHIVE_CSV" btc-usd-max.csv 2>/dev/null || true
    git checkout -- "$ARCHIVE_CSV" btc-usd-max.csv 2>/dev/null || true
    ARCHIVE_STATE="commit-failed"
  fi
fi

log "Due experiment readings: $DUE_EXPERIMENTS"

START_HEAD="$(git rev-parse HEAD)"
START_EPOCH="$(date +%s)"
log "Baseline head: ${BASE_HEAD:0:7} (agent starts at ${START_HEAD:0:7})"

PROMPT="$(cat "$PROMPT_FILE")"

# ------------------------------------------------------------------- runner ---


SUCCESS_MODEL=""
LAST_MODEL=""
LAST_HEAD="$START_HEAD"
LAST_RC=1
AGENT_COMMIT=0

for model in "${MODELS[@]}"; do
  if [[ $(( $(date +%s) - START_EPOCH )) -ge "$CYCLE_DEADLINE" ]]; then
    log "Cycle deadline reached before trying $model; stopping"
    break
  fi

  SAFE_MODEL="$(printf '%s' "$model" | tr '/:' '__')"
  ATTEMPT_LOG="$ATTEMPT_DIR/$TODAY.$SAFE_MODEL.log"
  BEFORE_HEAD="$(git rev-parse HEAD)"

  log "--- Attempt with $model (timeout ${ATTEMPT_TIMEOUT}s) ---"
  log "Attempt log: $ATTEMPT_LOG"

  perl -e 'alarm shift; exec @ARGV' "$ATTEMPT_TIMEOUT" \
    "$OPENCODE_CMD" run \
      --agent "$AGENT" \
      --model "$model" \
      --title "BTC500 daily growth $TODAY" \
      --auto \
      "$PROMPT" 2>&1 | tee -a "$ATTEMPT_LOG"

  RC="${PIPESTATUS[0]}"
  LAST_MODEL="$model"
  LAST_RC="$RC"

  case "$RC" in
    0)   log "CLI exited 0; the session may still be working — waiting for stability" ;;
    124|142) log "Attempt timed out after ${ATTEMPT_TIMEOUT}s; waiting for stability" ;;
    130) log "CLI exited 130 (observed on every run so far); exit code ignored, waiting for stability" ;;
    *)   log "Attempt exited with code $RC; exit code ignored, waiting for stability" ;;
  esac

  if wait_for_stability "$BEFORE_HEAD"; then
    AFTER_HEAD="$(git rev-parse HEAD)"
  else
    AFTER_HEAD="$(git rev-parse HEAD)"
    log "No stable state within ${SETTLE_MAX}s"
  fi

  LAST_HEAD="$AFTER_HEAD"

  if [[ "$AFTER_HEAD" != "$BEFORE_HEAD" ]]; then
    log "HEAD advanced: ${BEFORE_HEAD:0:7} -> ${AFTER_HEAD:0:7}"
    SUCCESS_MODEL="$model"
    AGENT_COMMIT=1
    break
  fi

  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    log "Attempt left uncommitted changes and never settled; not retrying on a dirty tree"
    FINAL_HEAD="$AFTER_HEAD"
    finish 1 dirty-tree
  fi

  log "Attempt produced no commit; trying the next free model"
done

FINAL_HEAD="$(git rev-parse HEAD)"

# --------------------------------------------------------------- validation ---

UNPUSHED=0
git fetch --quiet origin "$DEPLOY_BRANCH" 2>/dev/null || true
AHEAD="$(git rev-list --count "origin/$DEPLOY_BRANCH..HEAD" 2>/dev/null || echo 0)"
if [[ "$AHEAD" =~ ^[0-9]+$ ]] && [[ "$AHEAD" -gt 0 ]]; then
  UNPUSHED=1
fi

# Validate whenever there is something new to vouch for: either today's commits
# (the agent usually pushes from inside its session, so waiting for an unpushed
# commit would skip the gate) or leftover commits we are about to push.
if [[ ( "$(git rev-parse HEAD)" != "$BASE_HEAD" || $UNPUSHED -eq 1 ) \
      && "${BTC500_GROWTH_SKIP_VALIDATE:-0}" != "1" ]]; then
  btc_validate
fi

# -------------------------------------------------------------------- push ----

PUSHED="no"
if [[ $UNPUSHED -eq 1 ]]; then
  if [[ "$TEST_STATE" != "pass" ]]; then
    STATUS_NOTE="local-checks-${TEST_STATE}"
    log "Not pushing: local checks are ${TEST_STATE}. Commits stay local for review."
    finish 1 validation-failed
  elif [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    STATUS_NOTE="dirty-tree-blocked-push"
    log "WARN: $AHEAD unpushed commit(s) but the tree is dirty; not auto-pushing"
    finish 1 push-blocked
  else
    log "Pushing $AHEAD commit(s) to origin/$DEPLOY_BRANCH"
    if git push origin "$DEPLOY_BRANCH"; then
      PUSHED="yes"
    else
      STATUS_NOTE="push-rejected"
      log "ERROR: push failed"
      finish 1 push-blocked
    fi
  fi
else
  PUSHED="already-up-to-date"
fi

FINAL_HEAD="$(git rev-parse HEAD)"

# --------------------------------------------------------------- deployment ---

REPO_SLUG="$(btc_repo_slug)"
if [[ "$(git rev-list --count "origin/$DEPLOY_BRANCH..HEAD" 2>/dev/null || echo 1)" == "0" ]]; then
  btc_vercel_wait "$FINAL_HEAD" "$REPO_SLUG"
else
  log "Skipping the Vercel status wait (pushed=$PUSHED, local commits remain)"
  VERCEL_STATE="skipped"
fi

# Content check: the agent's manifest is the evidence that today's change is
# what production serves. It is only meaningful once the deploy has finished.
if [[ "$VERCEL_STATE" == "success" || "$VERCEL_STATE" == "timeout" ]]; then
  MANIFEST_OUT="$(node "$SCRIPT_DIR/verify-deploy.mjs" --site "$SITE" --today "$TODAY" 2>&1)"
  MANIFEST_RC=$?
  while IFS= read -r line; do
    [[ -n "$line" ]] && log "  manifest: $line"
  done <<< "$MANIFEST_OUT"
  case "$MANIFEST_RC" in
    0) MANIFEST_STATE="pass" ;;
    1) MANIFEST_STATE="fail" ;;
    *) MANIFEST_STATE="$(printf '%s\n' "$MANIFEST_OUT" | sed -n 's/^state=//p' | head -1)"
       MANIFEST_STATE="${MANIFEST_STATE:-absent}" ;;
  esac
else
  MANIFEST_STATE="skipped"
  log "Skipping the manifest check because the deploy is ${VERCEL_STATE}"
fi

# The refreshed archive must be served too, not just committed.
if [[ "$ARCHIVE_STATE" == "refreshed-committed" && -n "$ARCHIVE_LAST_ROW" && "$ARCHIVE_LAST_ROW" != "?" ]]; then
  if curl -fsS -m 20 "$SITE/btc-usd-max.csv" 2>/dev/null | grep -q "^$ARCHIVE_LAST_ROW"; then
    ARCHIVE_LIVE="yes"
  else
    ARCHIVE_LIVE="no"
  fi
  log "Archive live check ($ARCHIVE_LAST_ROW in /btc-usd-max.csv): $ARCHIVE_LIVE"
fi

# ------------------------------------------------------------------- health ---

SITE_CODE="$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "$SITE/" 2>/dev/null || echo 000)"
log "Health check: $SITE/ -> $SITE_CODE"
SITEMAP_CODE="$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "$SITE/sitemap.xml" 2>/dev/null || echo 000)"
log "Health check: $SITE/sitemap.xml -> $SITEMAP_CODE"

# ------------------------------------------------------------------ report ----

if [[ "$SITE_CODE" != "200" ]]; then
  STATUS_NOTE="homepage-${SITE_CODE}"
  log "CRITICAL: production homepage is not 200 ($SITE_CODE)"
  finish 1 site-down
fi

if [[ "$TEST_STATE" != "pass" && "$TEST_STATE" != "skipped" ]]; then
  STATUS_NOTE="local-checks-${TEST_STATE}"
  finish 1 validation-failed
fi

if [[ "$VERCEL_STATE" == "failure" || "$VERCEL_STATE" == "error" ]]; then
  STATUS_NOTE="vercel-${VERCEL_STATE}"
  log "CRITICAL: Vercel reported ${VERCEL_STATE} for ${FINAL_HEAD:0:7}"
  finish 1 deploy-failed
fi

if [[ $AGENT_COMMIT -eq 1 ]]; then
  if [[ "$MANIFEST_STATE" == "pass" ]]; then
    log "=== BTC500 growth cycle complete: shipped $FINAL_HEAD (push=$PUSHED, vercel=$VERCEL_STATE, manifest=pass) ==="
    STATUS_NOTE="push-$PUSHED"
    finish 0 shipped
  fi
  STATUS_NOTE="vercel-${VERCEL_STATE}-manifest-${MANIFEST_STATE}"
  log "=== Shipped $FINAL_HEAD but production was not proven: vercel=$VERCEL_STATE manifest=$MANIFEST_STATE ==="
  finish 1 shipped-unverified
fi

if [[ $PREFLIGHT_COMMITTED -eq 1 ]]; then
  if [[ "$ARCHIVE_LIVE" == "yes" ]]; then
    STATUS_NOTE="archive-only"
    log "=== Archive-only cycle: refreshed to $ARCHIVE_LAST_ROW and verified live ==="
    finish 0 archive-only
  fi
  STATUS_NOTE="archive-not-live"
  log "=== Archive was refreshed but /btc-usd-max.csv does not serve $ARCHIVE_LAST_ROW yet ==="
  finish 1 archive-unverified
fi

STATUS_NOTE="no-agent-commit"
log "=== No model produced a commit (archive=$ARCHIVE_STATE, vercel=$VERCEL_STATE) ==="
finish 1 no-commit
