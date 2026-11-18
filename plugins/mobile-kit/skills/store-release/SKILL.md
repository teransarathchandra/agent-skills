---
name: store-release
description: Walk through an App Store / Play Store release with EAS - versioning, build, submit, OTA update.
disable-model-invocation: true
---
1. Confirm `app.json`/`app.config` version and build numbers are bumped and `eas.json` has a production profile.
2. `eas build --platform all --profile production` (ask me before starting; builds use EAS quota).
3. `eas submit --platform ios` / `--platform android` once builds finish. First-time store listings, screenshots, privacy forms and Apple review stay manual: list what I must do in App Store Connect and Play Console.
4. JS-only fixes after release: `eas update --branch production --message "<msg>"`.
