#!/usr/bin/env bash
#
# Prove that the launchd schedule actually fires, without running a full
# growth cycle.
#
# It installs a temporary launchd job (label net.btc500.growth.smoke) for about
# three minutes from now. That job runs, under the same environment launchd uses
# at 06:00:
#   1. the real runner in dry-run mode (lock, git sync, PATH, logging), and
#   2. a one-line handshake with the real agent and the DeepSeek model.
# Then it waits for the log, prints it, and removes the temporary job.
#
#   scripts/autonomous/smoke-test.sh
#
# Exit 0 = launchd fired and both checks passed.

set -uo pipefail
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

LABEL="net.btc500.growth.smoke"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RUNNER="$SCRIPT_DIR/run-growth-cycle.sh"
STATE_DIR="${BTC500_GROWTH_STATE_DIR:-$HOME/.local/state/btc500-growth}"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"
LOG="$STATE_DIR/smoke-$(date +%Y%m%d-%H%M%S).log"
JOB_SCRIPT="$STATE_DIR/smoke-job.sh"
WAIT_SECONDS="${BTC500_GROWTH_SMOKE_WAIT:-420}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This test uses launchd and only works on macOS." >&2
  exit 1
fi

mkdir -p "$STATE_DIR"
: > "$STATE_DIR/smoke.launchd.out.log"
: > "$STATE_DIR/smoke.launchd.err.log"

# Target a minute that has not started yet: now + 150 seconds.
TARGET_EPOCH=$(( $(date +%s) + 150 ))
TARGET_HOUR=$(( 10#$(date -r "$TARGET_EPOCH" +%H) ))
TARGET_MINUTE=$(( 10#$(date -r "$TARGET_EPOCH" +%M) ))
TARGET_LABEL="$(date -r "$TARGET_EPOCH" '+%H:%M')"

cleanup() {
  launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
  rm -f "$PLIST" "$JOB_SCRIPT"
}
trap cleanup EXIT

cat > "$JOB_SCRIPT" <<JOB_EOF
#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export GIT_TERMINAL_PROMPT=0
exec >>"$LOG" 2>&1
echo "launchd fired at \$(date '+%Y-%m-%d %H:%M:%S %Z')"
cd "$REPO_ROOT" || { echo "SMOKE FAIL: cannot cd"; exit 1; }

echo "--- step 1: runner dry run ---"
BTC500_GROWTH_DRY_RUN=1 "$RUNNER"
RUNNER_RC=\$?
echo "runner dry-run exit: \$RUNNER_RC"

echo "--- step 2: agent + model handshake ---"
perl -e 'alarm 180; exec @ARGV' opencode run \
  --agent growth-cycle \
  --model opencode/deepseek-v4.1-flash-free \
  --auto \
  "Reply with exactly SMOKE_OK and nothing else. Do not use tools."
OPENCODE_RC=\$?
echo "opencode exit: \$OPENCODE_RC"

if [[ \$RUNNER_RC -eq 0 && \$OPENCODE_RC -eq 0 ]]; then
  echo "SMOKE PASS"
else
  echo "SMOKE FAIL"
fi
echo "SMOKE DONE"
JOB_EOF
chmod +x "$JOB_SCRIPT"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/caffeinate</string>
        <string>-i</string>
        <string>/bin/bash</string>
        <string>$JOB_SCRIPT</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$REPO_ROOT</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>$HOME</string>
        <key>LANG</key>
        <string>en_US.UTF-8</string>
    </dict>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>$TARGET_HOUR</integer>
        <key>Minute</key>
        <integer>$TARGET_MINUTE</integer>
    </dict>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>$STATE_DIR/smoke.launchd.out.log</string>
    <key>StandardErrorPath</key>
    <string>$STATE_DIR/smoke.launchd.err.log</string>
</dict>
</plist>
PLIST_EOF

launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
launchctl bootstrap "$DOMAIN" "$PLIST" || {
  echo "Could not load the temporary launchd job." >&2
  exit 1
}

echo "Temporary job loaded. It should fire at $TARGET_LABEL (local time)."
echo "Waiting up to $((WAIT_SECONDS / 60)) minutes for the log..."
echo "Log: $LOG"
echo

DEADLINE=$(( $(date +%s) + WAIT_SECONDS ))
while [[ $(date +%s) -lt $DEADLINE ]]; do
  if [[ -f "$LOG" ]] && grep -q "SMOKE DONE" "$LOG"; then
    break
  fi
  sleep 5
done

if [[ ! -f "$LOG" ]] || ! grep -q "SMOKE DONE" "$LOG"; then
  echo "FAILED: launchd did not produce a completed smoke log within $((WAIT_SECONDS / 60)) minutes."
  echo "Check: launchctl print $DOMAIN/$LABEL"
  echo "       $STATE_DIR/smoke.launchd.err.log"
  exit 1
fi

echo "--- smoke log ---"
cat "$LOG"
echo "---------------"

if grep -q "SMOKE PASS" "$LOG"; then
  echo "PASS: launchd fired at the scheduled minute, the runner dry run worked,"
  echo "      and the agent answered with DeepSeek. The 06:00 schedule is sound."
  exit 0
fi

echo "FAILED: the job fired but a check failed (see log above)." >&2
exit 1
