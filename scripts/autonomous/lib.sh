#!/usr/bin/env bash
#
# Shared helpers for the BTC500 automation runners.
#
# Sourced by run-growth-cycle.sh and run-review-cycle.sh. Defines:
#
#   log <msg>                 timestamped line into the caller's log
#   notify <title> <msg>      macOS notification + optional webhook
#   acquire_lock <dir>        returns 0 when the lock was taken
#   wait_for_stability <sha>  handoff-aware settle of the working tree
#   btc_validate              npm test + tsc + clean tree -> $TEST_STATE
#   btc_vercel_wait <sha> <slug>  -> $VERCEL_STATE
#   btc_repo_slug             echoes owner/repo from the origin remote
#   btc_append_history <file> <header> <row...>   append-only csv with header
#
# Globals the caller must set before the relevant call:
#   log/notify:      none (NOTIFY_URL optional)
#   acquire_lock:    none
#   wait_for_stability: SETTLE_MAX, HANDOFF_GRACE, STABLE_CHECKS, STABLE_INTERVAL
#   btc_validate:    (uses npm/npx in the repo root), sets TEST_STATE
#   btc_vercel_wait: DEPLOY_TIMEOUT, DEPLOY_POLL, sets VERCEL_STATE
#
# The OpenCode CLI can exit while the server-side session keeps working
# (observed every run: exit 130 after 10-17 minutes, first commit landing
# 136-269s after that exit), so no runner here may trust an exit code.

log() {
  printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*"
}

notify() {
  # Best effort; harmless when unavailable.
  local title="$1" message="$2"
  /usr/bin/osascript -e "display notification \"${message//\"/\'}\" with title \"${title//\"/\'}\"" \
    >/dev/null 2>&1 || true
  if [[ -n "${NOTIFY_URL:-}" ]]; then
    curl -fsS -m 10 -H "title: $title" -d "$message" "$NOTIFY_URL" >/dev/null 2>&1 || true
  fi
}

# Returns 0 when the lock was taken, 1 when another run holds it. A lock whose
# pid is gone — or that is older than 6 hours — is stale and gets replaced, so
# a recycled PID cannot block the schedule forever.
acquire_lock() {
  local lock_dir="$1" pid=""
  if mkdir "$lock_dir" 2>/dev/null; then
    printf '%s\n' "$$" > "$lock_dir/pid"
    return 0
  fi
  [[ -f "$lock_dir/pid" ]] && pid="$(cat "$lock_dir/pid" 2>/dev/null || true)"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    if ! find "$lock_dir" -maxdepth 0 -mmin +360 2>/dev/null | grep -q .; then
      return 1
    fi
    log "Lock is older than 6 hours; treating it as stale despite live pid $pid"
  else
    log "Removing stale lock (pid ${pid:-unknown} is gone)"
  fi
  rm -rf "$lock_dir"
  mkdir "$lock_dir" && printf '%s\n' "$$" > "$lock_dir/pid"
}

# The CLI exit code is not a verdict: watch the repository instead.
#
#   - Any commit or dirty file resets the quiet counter.
#   - Until HANDOFF_GRACE has elapsed with no commit, we keep watching: the
#     session may still be working (observed commits 136-269s after exit), and
#     starting the next model on top of it would put two sessions in one tree.
#   - Once a commit has appeared — or the grace period has run out — the state
#     must stay quiet for STABLE_CHECKS checks before we proceed.
#
# Returns 0 when quiet, 1 if SETTLE_MAX passes first (caller decides).
wait_for_stability() {
  local before_head="$1"
  local last_head="$before_head"
  local started checks=0 seen_change=0 head dirty elapsed
  started="$(date +%s)"
  while true; do
    elapsed=$(( $(date +%s) - started ))
    if (( elapsed >= SETTLE_MAX )); then
      log "Stability window expired after ${elapsed}s at ${last_head:0:7}"
      return 1
    fi
    sleep "$STABLE_INTERVAL"
    head="$(git rev-parse HEAD)"
    dirty="$(git status --porcelain 2>/dev/null | head -1)"

    if [[ "$head" != "$last_head" || -n "$dirty" ]]; then
      checks=0
      if [[ "$head" != "$before_head" ]]; then
        seen_change=1
        log "HEAD advanced to ${head:0:7}; starting the stability count"
      else
        log "Tree changed (dirty: ${dirty:-none}); restarting the stability count"
      fi
      last_head="$head"
      continue
    fi

    if (( ! seen_change && elapsed < HANDOFF_GRACE )); then
      log "Quiet ${elapsed}s/${HANDOFF_GRACE}s with no commit yet; still watching"
      continue
    fi

    checks=$((checks + 1))
    log "Stable $checks/$STABLE_CHECKS at ${head:0:7}, tree clean"
    if (( checks >= STABLE_CHECKS )); then
      return 0
    fi
  done
}

# Independent gate before anything is pushed. Sets TEST_STATE to one of:
#   pass | test-failed | tsc-failed | dirty | skipped
#
# The tree is compared before and after the checks: a file that was already
# dirty going in (the reviewer's verdict, say) is expected and must not fail
# the gate, while anything that changes *during* the checks does.
btc_validate() {
  local before after
  before="$(git status --porcelain 2>/dev/null)"
  log "--- Validation gate: npm test ---"
  if ! npm test; then
    TEST_STATE="test-failed"
    log "VALIDATION FAILED: npm test"
    return 1
  fi
  log "--- Validation gate: tsc --noEmit ---"
  if ! npx tsc --noEmit; then
    TEST_STATE="tsc-failed"
    log "VALIDATION FAILED: tsc --noEmit"
    return 1
  fi
  after="$(git status --porcelain 2>/dev/null)"
  if [[ "$after" != "$before" ]]; then
    TEST_STATE="dirty"
    log "VALIDATION FAILED: the tree changed while checks were running"
    return 1
  fi
  TEST_STATE="pass"
  return 0
}

btc_repo_slug() {
  git remote get-url origin 2>/dev/null \
    | sed -E 's#^git@github\.com:##; s#^https://github\.com/##; s#\.git$##'
}

# Poll the GitHub commit status for this sha until it reaches a terminal state
# (or DEPLOY_TIMEOUT). Sets VERCEL_STATE to success|failure|error|timeout|skipped.
# A homepage 200 right after a push only proves the previous deployment is up,
# which is why the state of *this* sha is what counts.
btc_vercel_wait() {
  local sha="$1" slug="$2"
  VERCEL_STATE="skipped"
  if [[ -z "$slug" || -z "$sha" ]]; then
    log "Skipping the Vercel status wait (sha=${sha:0:7}, slug=${slug:-none})"
    return 0
  fi
  log "--- Waiting for the Vercel commit status on ${sha:0:7} ---"
  local started state
  started="$(date +%s)"
  while true; do
    state="$(curl -fsS -m 20 -H 'Accept: application/vnd.github+json' \
      "https://api.github.com/repos/$slug/commits/$sha/status" 2>/dev/null \
      | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);const v=(j.statuses||[]).find(x=>/vercel/i.test(x.context||""));console.log(v?v.state:(j.statuses||[]).length?(j.state||"none"):"none")}catch{console.log("unknown")}})')"
    VERCEL_STATE="${state:-unknown}"
    log "Vercel status: $VERCEL_STATE"
    [[ "$VERCEL_STATE" == "success" || "$VERCEL_STATE" == "failure" || "$VERCEL_STATE" == "error" ]] && return 0
    if (( $(date +%s) - started >= DEPLOY_TIMEOUT )); then
      VERCEL_STATE="timeout"
      log "No terminal Vercel status within ${DEPLOY_TIMEOUT}s"
      return 0
    fi
    sleep "$DEPLOY_POLL"
  done
}

# Append-only history: creates the file with a header row when missing.
# Last field is the free-text note; commas are stripped so the CSV stays sane.
btc_append_history() {
  local file="$1" header="$2"
  shift 2
  if [[ ! -f "$file" ]]; then
    printf '%s\n' "$header" > "$file"
  fi
  local row="" field
  for field in "$@"; do
    row+="${row:+,}$(printf '%s' "$field" | tr -d ',')"
  done
  printf '%s\n' "$row" >> "$file"
}
