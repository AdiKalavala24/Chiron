#!/usr/bin/env bash
# Builds & launches Chiron on the iOS Simulator. Full output goes to
# .run.log; stdout stays short so this is cheap to run from an agent.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -d node_modules ]; then
  npm install
fi

LOG=".run.log"
echo "-> npx expo run:ios $* (full log: $LOG)"
npx expo run:ios "$@" >"$LOG" 2>&1
status=$?

if [ $status -eq 0 ]; then
  tail -5 "$LOG"
  echo "done."
else
  echo "FAILED (exit $status):"
  grep -iE 'error|fail|✗' "$LOG" | tail -20
  echo "full log: $LOG"
fi
exit $status
