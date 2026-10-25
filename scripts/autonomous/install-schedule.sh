#!/usr/bin/env bash
#
# Install, inspect or remove the BTC500 automation schedule (launchd, macOS).
#
# Two jobs, one repository, never at the same time:
#
#   net.btc500.growth  06:00  run-growth-cycle.sh  ship and verify one change
#   net.btc500.review  09:30  run-review-cycle.sh  judge whether it gained
#
#   scripts/autonomous/install-schedule.sh                    # install + load both
#   scripts/autonomous/install-schedule.sh --status           # loaded? when did they run?
#   scripts/autonomous/install-schedule.sh --run-now          # trigger a growth cycle now
#   scripts/autonomous/install-schedule.sh --run-now review   # trigger a review now
#   scripts/autonomous/install-schedule.sh --test             # prove launchd fires (3 min)
#   scripts/autonomous/install-schedule.sh --uninstall
#
# The review waits for the cycle's lock before it touches the tree, so the two
# jobs cannot run against one checkout at once. If the Mac is asleep at the
# scheduled time, launchd runs the missed job once when the machine wakes.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="$HOME/.local/state/btc500-growth"
UID_NUM="$(id -u)"
DOMAIN="gui/$UID_NUM"
JOB_NAMES=(growth review)

usage() {
  sed -n '2,24p' "$0" | sed 's/^# \{0,1\}//'
}

require_macos() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "This scheduler uses launchd and only works on macOS." >&2
    exit 1
  fi
}

job_field() {
  case "$1:$2" in
    growth:label)     echo "net.btc500.growth" ;;
    growth:runner)    echo "$SCRIPT_DIR/run-growth-cycle.sh" ;;
    growth:hour)      echo 6 ;;
    growth:minute)    echo 0 ;;
    growth:schedule)  echo "06:00" ;;
    growth:out)       echo "$STATE_DIR/launchd.out.log" ;;
    growth:err)       echo "$STATE_DIR/launchd.err.log" ;;
    review:label)     echo "net.btc500.review" ;;
    review:runner)    echo "$SCRIPT_DIR/run-review-cycle.sh" ;;
    review:hour)      echo 9 ;;
    review:minute)    echo 30 ;;
    review:schedule)  echo "09:30" ;;
    review:out)       echo "$STATE_DIR/launchd.review.out.log" ;;
    review:err)       echo "$STATE_DIR/launchd.review.err.log" ;;
    *) echo "unknown job field: $1:$2" >&2; exit 3 ;;
  esac
}

write_plist() {
  local name="$1"
  local label runner hour minute out err
  label="$(job_field "$name" label)"
  runner="$(job_field "$name" runner)"
  hour="$(job_field "$name" hour)"
  minute="$(job_field "$name" minute)"
  out="$(job_field "$name" out)"
  err="$(job_field "$name" err)"

  [[ -x "$runner" ]] || chmod +x "$runner"

  cat > "$HOME/Library/LaunchAgents/$label.plist" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$label</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/caffeinate</string>
        <string>-i</string>
        <string>/bin/bash</string>
        <string>$runner</string>
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
        <integer>$hour</integer>
        <key>Minute</key>
        <integer>$minute</integer>
    </dict>

    <key>RunAtLoad</key>
    <false/>

    <key>ThrottleInterval</key>
    <integer>1800</integer>

    <key>ProcessType</key>
    <string>Standard</string>

    <key>StandardOutPath</key>
    <string>$out</string>

    <key>StandardErrorPath</key>
    <string>$err</string>
</dict>
</plist>
PLIST_EOF

  local plist="$HOME/Library/LaunchAgents/$label.plist"
  launchctl bootout "$DOMAIN/$label" >/dev/null 2>&1 || true
  launchctl bootstrap "$DOMAIN" "$plist"
  launchctl enable "$DOMAIN/$label" 2>/dev/null || true
  echo "Installed $label  ($(job_field "$name" schedule))  ->  $runner"
}

install_job() {
  require_macos
  mkdir -p "$HOME/Library/LaunchAgents" "$STATE_DIR"
  for name in "${JOB_NAMES[@]}"; do
    write_plist "$name"
  done
  echo
  echo "Logs: $STATE_DIR/"
  for name in "${JOB_NAMES[@]}"; do
    launchctl print "$DOMAIN/$(job_field "$name" label)" 2>/dev/null | sed -n '1,8p' || true
    echo
  done
}

status_job() {
  require_macos
  local any=0
  for name in "${JOB_NAMES[@]}"; do
    local label plist
    label="$(job_field "$name" label)"
    plist="$HOME/Library/LaunchAgents/$label.plist"
    if [[ -f "$plist" ]]; then
      any=1
      echo "== $label ($(job_field "$name" schedule)) =="
      launchctl print "$DOMAIN/$label" 2>/dev/null | sed -n '1,20p' || echo "  Not loaded."
      echo
    else
      echo "$label: not installed ($plist is missing)"
      echo
    fi
  done
  if [[ $any -eq 0 ]]; then
    echo "Nothing installed. Run: $0"
    exit 1
  fi
  if [[ -f "$STATE_DIR/last-status.txt" ]]; then
    echo "Last growth cycle: $(cat "$STATE_DIR/last-status.txt")"
  else
    echo "No completed growth cycle recorded yet."
  fi
  if [[ -f "$STATE_DIR/last-review.txt" ]]; then
    echo "Last review:      $(cat "$STATE_DIR/last-review.txt")"
  else
    echo "No completed review recorded yet."
  fi
  echo
  echo "Recent logs:"
  ls -1t "$STATE_DIR"/*.log 2>/dev/null | head -5 || echo "  (none)"
}

uninstall_job() {
  require_macos
  for name in "${JOB_NAMES[@]}"; do
    local label
    label="$(job_field "$name" label)"
    launchctl bootout "$DOMAIN/$label" >/dev/null 2>&1 || true
    rm -f "$HOME/Library/LaunchAgents/$label.plist"
    echo "Removed $label."
  done
  echo "Logs remain in $STATE_DIR."
}

run_now() {
  require_macos
  local name="${1:-growth}"
  local label
  case "$name" in
    growth|review) label="$(job_field "$name" label)" ;;
    *) echo "Unknown job: $1 (use growth or review)" >&2; exit 1 ;;
  esac
  if [[ ! -f "$HOME/Library/LaunchAgents/$label.plist" ]]; then
    echo "Install it first: $0" >&2
    exit 1
  fi
  launchctl kickstart -k "$DOMAIN/$label"
  echo "Started $name. Follow along with:"
  if [[ "$name" == "growth" ]]; then
    echo "  tail -f $STATE_DIR/$(date +%F).log"
  else
    echo "  tail -f $STATE_DIR/review-$(date +%F).log"
  fi
}

case "${1:-}" in
  "")            install_job ;;
  --status)      status_job ;;
  --test)        exec "$SCRIPT_DIR/smoke-test.sh" ;;
  --uninstall)   uninstall_job ;;
  --run-now)     run_now "${2:-growth}" ;;
  -h|--help)     usage ;;
  *)             echo "Unknown option: $1" >&2; usage; exit 1 ;;
esac
