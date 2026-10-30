#!/bin/bash
# Runs the built app from the current directory and captures its pages. Retries once with a fresh profile.
# Arguments: <tag> <output dir>. Environment: CAPTURE_NODE, CAPTURE_SCRIPT, EXPECTED_FILE.
set -uo pipefail
TAG=$1
OUT=$2
ELECTRON=$(node -p "require('electron')" | tail -1)
VERSION=$(node -p "require('./package.json').version")
mkdir -p "$OUT"

# Older production builds load tray icons from the packaged-app resources folder, which only exists after packaging.
# Without them the main process stops during startup. Link the assets of this tag there.
RESOURCES="$(dirname "$ELECTRON")/resources/packages/main/src"
mkdir -p "$RESOURCES"
ln -sfn "$PWD/packages/main/src/assets" "$RESOURCES/assets"

attempt() {
  local n=$1 port=$((9220 + $1)) home="$RUNNER_TEMP/app-home-$1"
  rm -rf "$home"
  mkdir -p "$home/pd/configuration" "$home/.local/share/containers/podman-desktop/configuration" "$home/electron"
  cat > "$home/pd/configuration/settings.json" <<JSON
{"telemetry.enabled":false,"telemetry.check":true,"preferences.appearance":"dark","preferences.podman-desktop.podman.engine.autostart":false,"preferences.login.start":false,"welcome.version":"$VERSION"}
JSON
  cp "$home/pd/configuration/settings.json" "$home/.local/share/containers/podman-desktop/configuration/settings.json"
  : > "$home/kubeconfig"
  KUBECONFIG="$home/kubeconfig" PODMAN_DESKTOP_HOME_DIR="$home/pd" HOME="$home" \
    XDG_DATA_HOME="$RUNNER_HOME_DATA" XDG_CONFIG_HOME="$RUNNER_HOME_CONFIG" \
    NODE_ENV=production XDG_SESSION_TYPE=x11 DBUS_SESSION_BUS_ADDRESS=disabled: \
    setsid xvfb-run -a -s "-screen 0 1600x1000x24" "$ELECTRON" --ozone-platform=x11 --no-sandbox --disable-gpu \
      --user-data-dir="$home/electron" --remote-debugging-port="$port" . > "$OUT/app-$n.log" 2>&1 &
  local app=$!
  "$CAPTURE_NODE" "$CAPTURE_SCRIPT" "$port" "$OUT" "$TAG" "$EXPECTED_FILE" > "$OUT/capture-$n.json" 2> "$OUT/capture-$n.err"
  local rc=$?
  cat "$OUT/capture-$n.json"
  kill -- "-$app" 2> /dev/null
  sleep 2
  kill -9 -- "-$app" 2> /dev/null
  return "$rc"
}

export RUNNER_HOME_DATA="$HOME/.local/share" RUNNER_HOME_CONFIG="$HOME/.config"
attempt 1 || attempt 2
RC=$?
if [ "$RC" -ne 0 ]; then
  mkdir -p "$OUT/rejected"
  mv "$OUT"/*.png "$OUT/rejected/" 2> /dev/null
  tail -30 "$OUT/app-1.log"
fi
exit "$RC"
