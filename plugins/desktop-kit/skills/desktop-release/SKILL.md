---
name: desktop-release
description: Ship a macOS desktop build - code signing, notarization, auto-update, release artifacts.
disable-model-invocation: true
---
1. Signing: Developer ID Application certificate in the keychain; set the identity in `tauri.conf.json` (bundle.macOS.signingIdentity) or electron-builder `mac.identity`.
2. Notarize with `xcrun notarytool submit <dmg> --keychain-profile <profile> --wait`, then `xcrun stapler staple <dmg>`. Credentials live in the keychain profile, never in the repo.
3. Auto-update: Tauri updater plugin (signed update JSON) or electron-updater with GitHub Releases.
4. Build artifacts in CI (macos-latest runner); attach to a GitHub Release. Ask me before anything that needs the certificate or Apple credentials.
