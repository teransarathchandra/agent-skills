---
name: commit-push-pr
description: Commit the current changes, push the branch and open a draft PR (linked to the ticket key when there is one).
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh *)
---
## Context
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Diff stat: !`git diff HEAD --stat`
- Recent commits: !`git log --oneline -5`

## Task
1. If on the default branch, create a branch (named after the ticket key if there is one, otherwise a short slug).
2. Stage only the relevant files (never secrets or build output) and commit, matching the style of the recent commits; start with the ticket key if there is one.
3. Push with `-u`. If the repo has no remote yet, ask before creating one with `gh repo create`.
4. Run `gh pr create --draft` with: a short summary; an AC -> test -> file table if a `SPEC.md` or `specs/<KEY>.md` exists; the checks that ran and their results; known limits.
5. Print the PR URL. Never merge.
