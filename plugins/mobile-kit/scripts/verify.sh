#!/usr/bin/env bash
# Expo verify. Native iOS projects: replace with `xcodebuild test -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 17'`.
set -euo pipefail
npx tsc --noEmit
npx expo lint
npx jest --passWithNoTests
if command -v maestro >/dev/null && [ -d .maestro ]; then maestro test .maestro/; fi
