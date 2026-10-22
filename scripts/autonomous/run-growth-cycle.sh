#!/usr/bin/env bash
#
# Daily autonomous growth cycle for btc500.net.
#
# Runs the `growth-cycle` OpenCode agent with a headless prompt, falling back
# across the free OpenCode models (DeepSeek first). Each attempt is time-boxed.
# The script is deliberately defensive: it locks against overlapping runs, never
# force-pushes, never rewrites history, and reports what it actually verified.
#
# Usage:
#   scripts/autonomous/run-growth-cycle.sh            # normal run, logs to state dir
#   BTC500_GROWTH_DRY_RUN=1 scripts/autonomous/run-growth-cycle.sh
#
# Exit codes: 0 shipped/verified, 1 failed, 2 already running, 3 misconfigured.

set -uo pipefail
umask 022

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export GIT_TERMINAL_PROMPT=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="${BTC500_GROWTH_STATE_DIR:-$HOME/.local/state/btc500-growth}"
PROMPT_FILE="$SCRIPT_DIR/GROWTH_PROMPT.md"
AGENT="${BTC500_GROWTH_AGENT:-growth-cycle}"
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

TODAY="$(date +%F)"
NOW="$(date '+%Y-%m-%d %H:%M:%S %Z')"
LOG_FILE="$STATE_DIR/$TODAY.log"
ATTEMPT_DIR="$STATE_DIR/attempts"
LOCK_DIR="$STATE_DIR/run.lock"
STATUS_FILE="$STATE_DIR/last-status.txt"

mkdir -p "$STATE_DIR" "$ATTEMPT_DIR"

log() {
  printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*"
}

notify() {
  # Best effort macOS notification; harmless when unavailable.
  local title="$1" message="$2"
  /usr/bin/osascript -e "display notification \"${message//\"/\'}\" with title \"${title//\"/\'}\"" \
    >/dev/null 2>&1 || true
}

finish() {
  local code="$1" status="$2" model="${3:-none}" head="${4:-none}" site="${5:-unknown}"
  printf '%s status=%s model=%s head=%s site=%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$status" "$model" "$head" "$site" > "$STATUS_FILE"
  rm -rf "$LOCK_DIR"
  log "Finished: status=$status model=$model head=$head site=$site"
  case "$status" in
    shipped) notify "BTC500 growth: shipped" "Model ${model##*/} pushed ${head:0:7}. Site ${site}." ;;
    no-commit) notify "BTC500 growth: nothing shipped" "Model ${model##*/} finished without a commit. Check the log." ;;
    dirty-tree) notify "BTC500 growth: stopped" "Working tree was left dirty. Check the log." ;;
    failed) notify "BTC500 growth: failed" "All free models failed or timed out. Site ${site}." ;;
    site-down) notify "BTC500 growth: SITE DOWN" "Production check returned ${site}. Check btc500.net now." ;;
  esac
  exit "$code"
}

acquire_lock() {
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    printf '%s\n' "$$" > "$LOCK_DIR/pid"
    return 0
  fi
  local pid=""
  [[ -f "$LOCK_DIR/pid" ]] && pid="$(cat "$LOCK_DIR/pid" 2>/dev/null || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    # A recycled PID must not block the schedule forever.
    if ! find "$LOCK_DIR" -maxdepth 0 -mmin +360 2>/dev/null | grep -q .; then
      return 1
    fi
    log "Lock is older than 6 hours; treating it as stale despite live pid $pid"
  else
    log "Removing stale lock (pid ${pid:-unknown} is gone)"
  fi
  rm -rf "$LOCK_DIR"
  mkdir "$LOCK_DIR" && printf '%s\n' "$$" > "$LOCK_DIR/pid"
}

# ---------------------------------------------------------------- preflight ---

if ! acquire_lock; then
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

for bin in opencode git curl perl; do
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

START_HEAD="$(git rev-parse HEAD)"
START_EPOCH="$(date +%s)"

if [[ "${BTC500_GROWTH_DRY_RUN:-0}" == "1" ]]; then
  log "DRY RUN: prompt is $(wc -c < "$PROMPT_FILE" | tr -d ' ') bytes; models: ${MODELS[*]}"
  log "DRY RUN: HEAD is $START_HEAD"
  echo "dry-run ok"
  exit 0
fi

PROMPT="$(cat "$PROMPT_FILE")"

# ------------------------------------------------------------------- runner ---

SUCCESS_MODEL=""
SUCCESS_HEAD=""
LAST_MODEL=""
LAST_HEAD="$START_HEAD"
LAST_RC=1

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
    opencode run \
      --agent "$AGENT" \
      --model "$model" \
      --title "BTC500 daily growth $TODAY" \
      --auto \
      "$PROMPT" 2>&1 | tee -a "$ATTEMPT_LOG"

  RC="${PIPESTATUS[0]}"
  AFTER_HEAD="$(git rev-parse HEAD)"
  LAST_MODEL="$model"
  LAST_HEAD="$AFTER_HEAD"
  LAST_RC="$RC"

  if [[ "$RC" -eq 124 || "$RC" -eq 142 ]]; then
    log "Attempt timed out after ${ATTEMPT_TIMEOUT}s"
  elif [[ "$RC" -ne 0 ]]; then
    log "Attempt exited with code $RC"
  fi

  if [[ "$AFTER_HEAD" != "$BEFORE_HEAD" ]]; then
    log "HEAD advanced: ${BEFORE_HEAD:0:7} -> ${AFTER_HEAD:0:7}"
    SUCCESS_MODEL="$model"
    SUCCESS_HEAD="$AFTER_HEAD"
    break
  fi

  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    log "Attempt left uncommitted changes; not retrying on a dirty tree"
    finish 1 dirty-tree "$model" "$AFTER_HEAD"
  fi

  log "Attempt produced no commit; trying the next free model"
done

# --------------------------------------------------------------- post-flight ---

if [[ -z "$SUCCESS_MODEL" ]]; then
  log "No model produced a commit"
  SITE_CODE="$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "$SITE/" 2>/dev/null || echo 000)"
  log "Production homepage: $SITE_CODE"
  finish 1 no-commit "$LAST_MODEL" "$LAST_HEAD" "$SITE_CODE"
fi

log "Attempt succeeded with $SUCCESS_MODEL at $SUCCESS_HEAD"

git fetch --quiet origin "$DEPLOY_BRANCH" 2>/dev/null || true
AHEAD="$(git rev-list --count "origin/$DEPLOY_BRANCH..HEAD" 2>/dev/null || echo 0)"
PUSHED="no"
if [[ "$AHEAD" =~ ^[0-9]+$ ]] && [[ "$AHEAD" -gt 0 ]]; then
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    log "WARN: $AHEAD unpushed commit(s) but the tree is dirty; not auto-pushing"
  else
    log "Safety net: pushing $AHEAD unpushed commit(s) to origin/$DEPLOY_BRANCH"
    if git push origin "$DEPLOY_BRANCH"; then
      PUSHED="yes"
    else
      log "ERROR: safety-net push failed"
    fi
  fi
else
  PUSHED="already-up-to-date"
fi

# Give Vercel time to build, then verify production. Never claim more than seen.
SITE_CODE="000"
for i in $(seq 1 12); do
  SITE_CODE="$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "$SITE/" 2>/dev/null || echo 000)"
  log "Health check $i/12: $SITE -> $SITE_CODE"
  [[ "$SITE_CODE" == "200" ]] && break
  sleep 20
done

SITEMAP_CODE="$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "$SITE/sitemap.xml" 2>/dev/null || echo 000)"
log "Health check: $SITE/sitemap.xml -> $SITEMAP_CODE"

if [[ "$SITE_CODE" != "200" ]]; then
  log "CRITICAL: production homepage is not 200 ($SITE_CODE)"
  finish 1 site-down "$SUCCESS_MODEL" "$SUCCESS_HEAD" "$SITE_CODE"
fi

log "=== BTC500 growth cycle complete: shipped $SUCCESS_HEAD (push=$PUSHED) ==="
finish 0 shipped "$SUCCESS_MODEL" "$SUCCESS_HEAD" "$SITE_CODE"
