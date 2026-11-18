---
name: release-package
description: Release an npm package or CLI with Changesets and npm trusted publishing (provenance, no long-lived tokens).
disable-model-invocation: true
---
1. `npx changeset` for each user-facing change; commit the changeset files.
2. CI: on main, `changesets/action` opens a "Version Packages" PR; merging it publishes with `npm publish --provenance --access public` using npm trusted publishing (OIDC from GitHub Actions, `id-token: write`), so no NPM_TOKEN secret exists to leak.
3. Before the first release: configure the trusted publisher on npmjs.com (package > settings), enable 2FA, and check `npm pack --dry-run` lists only intended files (`files` in package.json).
4. After release: `npx <pkg>@latest --help` from a clean folder.
