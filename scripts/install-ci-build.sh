#!/bin/zsh
# Downloads the macOS app from a GitHub Actions run of solomon-build.yml, signs
# it with Solomon's Apple Development identity (so permissions survive later
# updates), backs up the installed app once, replaces it and relaunches it in
# the background. Settings in ~/Library/Application Support are untouched.
# Usage: scripts/install-ci-build.sh <run-id>
set -euo pipefail
RUN_ID=${1:?run id}
REPO=Solomon-69/Handy-build
IDENTITY="Apple Development: solomond24@icloud.com (CCW242B7M5)"
HERE=${0:A:h}
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

gh run download "$RUN_ID" -R "$REPO" -n handy-aarch64-apple-darwin -D "$WORK"
ZIP=$(find "$WORK" -name 'Handy-macos-arm64.zip' | head -1)
ditto -x -k "$ZIP" "$WORK/out"
APP="$WORK/out/Handy.app"
xattr -cr "$APP"
codesign --force --deep --options runtime --timestamp=none \
  --entitlements "$HERE/../src-tauri/Entitlements.plist" \
  --sign "$IDENTITY" "$APP"
codesign --verify --deep --strict "$APP"

BACKUP=~/Applications/Handy-0.10.0-backup.app
mkdir -p ~/Applications
if [[ ! -d $BACKUP && -d /Applications/Handy.app ]]; then
  ditto /Applications/Handy.app "$BACKUP"
fi
osascript -e 'tell application id "com.pais.handy" to quit' 2>/dev/null || true
for _ in {1..20}; do pgrep -x handy >/dev/null || break; sleep 0.5; done
pkill -x handy 2>/dev/null || true
rm -rf /Applications/Handy.app
ditto "$APP" /Applications/Handy.app
open -g -a /Applications/Handy.app --args --start-hidden
echo "installed: $(defaults read /Applications/Handy.app/Contents/Info CFBundleShortVersionString)"
