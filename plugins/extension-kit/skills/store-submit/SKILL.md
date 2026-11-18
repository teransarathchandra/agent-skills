---
name: store-submit
description: Submit a browser extension (Chrome Web Store, Firefox AMO) or VS Code extension (Marketplace, Open VSX).
disable-model-invocation: true
---
Browser (WXT): bump `version` in package.json, `npx wxt zip` (and `--browser firefox`), then `npx wxt submit` with store credentials from environment variables. Prepare: privacy policy URL, single-purpose description, permission justifications (least privilege; avoid `<all_urls>` unless essential), screenshots 1280x800.
VS Code: `npx @vscode/vsce publish` (publisher account and token) and `npx ovsx publish` for Open VSX. Check icon, README, CHANGELOG and `engines.vscode`.
Ask me before submitting; store reviews are public and versioned.
