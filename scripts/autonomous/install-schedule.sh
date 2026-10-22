#!/usr/bin/env bash
#
# Install, inspect or remove the daily BTC500 growth cycle (launchd, macOS).
#
#   scripts/autonomous/install-schedule.sh            # install + load, 06:00 daily
#   scripts/autonomous/install-schedule.sh --status   # is it loaded? when did it run?
#   scripts/autonomous/install-schedule.sh --run-now  # trigger a cycle immediately
#   scripts/autonomous/install-schedule.sh --uninstall
#
# The job runs as the logged-in user. If the Mac is asleep at 06:00, launchd
# runs the missed job once when the machine wakes.

set -euo pipefail

LABEL="net.btc500.growth"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RUNNER="$SCRIPT_DIR/run-growth-cycle.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
STATE_DIR="$HOME/.local/state/btc500-growth"
UID_NUM="$(id -u)"
DOMAIN="gui/$UID_NUM"

usage() {
  sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
}

require_macos() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "This scheduler uses launchd and only works on macOS." >&2
    exit 1
  fi
}

install_job() {
  require_macos
  [[ -x "$RUNNER" ]] || chmod +x "$RUNNER"
  mkdir -p "$HOME/Library/LaunchAgents" "$STATE_DIR"

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
        <string>$RUNNER</string>
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
        <integer>6</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <key>RunAtLoad</key>
    <false/>

    <key>ThrottleInterval</key>
    <integer>3600</integer>

    <key>ProcessType</key>
    <string>Standard</string>

    <key>StandardOutPath</key>
    <string>$STATE_DIR/launchd.out.log</string>

    <key>StandardErrorPath</key>
    <string>$STATE_DIR/launchd.err.log</string>
</dict>
</plist>
PLIST_EOF

  launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
  launchctl bootstrap "$DOMAIN" "$PLIST"
  launchctl enable "$DOMAIN/$LABEL" 2>/dev/null || true

  echo "Installed $LABEL"
  echo "  schedule: every day at 06:00 local time"
  echo "  runner:   $RUNNER"
  echo "  logs:     $STATE_DIR/"
  echo
  launchctl print "$DOMAIN/$LABEL" 2>/dev/null | sed -n '1,14p' || true
}

status_job() {
  require_macos
  if [[ ! -f "$PLIST" ]]; then
    echo "Not installed ($PLIST is missing)."
    exit 1
  fi
  echo "Plist: $PLIST"
  echo
  launchctl print "$DOMAIN/$LABEL" 2>/dev/null | sed -n '1,20p' || echo "Not loaded."
  echo
  if [[ -f "$STATE_DIR/last-status.txt" ]]; then
    echo "Last run: $(cat "$STATE_DIR/last-status.txt")"
  else
    echo "No completed run recorded yet."
  fi
  echo
  echo "Recent logs:"
  ls -1t "$STATE_DIR"/*.log 2>/dev/null | head -3 || echo "  (none)"
}

uninstall_job() {
  require_macos
  launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
  rm -f "$PLIST"
  echo "Removed $LABEL. Logs remain in $STATE_DIR."
}

run_now() {
  require_macos
  if [[ ! -f "$PLIST" ]]; then
    echo "Install it first: $0" >&2
    exit 1
  fi
  launchctl kickstart -k "$DOMAIN/$LABEL"
  echo "Started. Follow along with:"
  echo "  tail -f $STATE_DIR/$(date +%F).log"
}

case "${1:-}" in
  "")            install_job ;;
  --status)      status_job ;;
  --uninstall)   uninstall_job ;;
  --run-now)     run_now ;;
  -h|--help)     usage ;;
  *)             echo "Unknown option: $1" >&2; usage; exit 1 ;;
esac
