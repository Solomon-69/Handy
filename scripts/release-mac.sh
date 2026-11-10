#!/bin/zsh
# Signs a Handy-build CI run with the Developer ID, has Apple notarize it,
# staples it, and publishes Handy.dmg + Handy-mac.zip + SHA256SUMS.txt as a
# GitHub release on Solomon-69/Handy.
# Usage: scripts/release-mac.sh <run-id> <version>
set -euo pipefail
RUN_ID=${1:?run id}; VER=${2:?version}
ID="Developer ID Application: Yael Michal Dredzen (QJ3359CB4R)"
HERE=${0:A:h}; ENT="$HERE/../src-tauri/Entitlements.plist"
W=$(mktemp -d); cd "$W"
gh run download "$RUN_ID" -R Solomon-69/Handy-build -n handy-aarch64-apple-darwin -D dl
ZIP=$(find dl -name 'Handy-macos-arm64.zip' | head -1)
ditto -x -k "$ZIP" x; APP="x/Handy.app"
xattr -cr "$APP"
codesign --force --deep --options runtime --timestamp --entitlements "$ENT" --sign "$ID" "$APP"
codesign --verify --deep --strict "$APP"
ditto -c -k --keepParent "$APP" sub.zip
xcrun notarytool submit sub.zip --keychain-profile notary --wait
xcrun stapler staple "$APP"
ditto -c -k --keepParent "$APP" Handy-mac.zip
mkdir dm; ditto "$APP" dm/Handy.app; ln -s /Applications dm/Applications
hdiutil create -volname Handy -srcfolder dm -fs HFS+ -format UDZO -ov Handy.dmg >/dev/null
codesign --force --timestamp --sign "$ID" Handy.dmg
xcrun notarytool submit Handy.dmg --keychain-profile notary --wait
xcrun stapler staple Handy.dmg
shasum -a 256 Handy.dmg Handy-mac.zip > SHA256SUMS.txt
spctl --assess --type execute -vv "$APP" 2>&1 | head -2
gh release create "v$VER" -R Solomon-69/Handy --target overnight-8-nov --title "Handy $VER" \
  --notes "Blue look, black glass bar, wordless working animation, easier-to-read font, redesigned Settings with a Smart features page, say \"turn this into a prompt\" any time, faster self-correction, and no more stray words like \"I want bananas\". Based on Handy by cjpais (MIT)." \
  Handy.dmg Handy-mac.zip SHA256SUMS.txt
echo "DONE $VER"; rm -rf "$W"
