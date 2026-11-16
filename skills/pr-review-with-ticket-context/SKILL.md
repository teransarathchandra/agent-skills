---
name: pr-review-with-ticket-context
description: Use when asked to review a GitHub pull request against its Jira ticket, especially a bug fix (for example "review PR 123 for ABC-456"). Pulls ticket context through the Jira delivery MCP, reviews the diff, traces the real root cause across layers and repos, and returns two grids - comments on files the PR changed, and gaps outside the PR. Keeps ticket data private.
license: MIT
compatibility: Needs git and the GitHub CLI (gh). Best with the Jira delivery MCP server connected; without it, ask the user to paste the ticket text.
metadata:
  author: teransarathchandra
  version: "0.1.0"
---

# PR review with ticket context

Review a PR the way a teammate would: short, plain comments the author can act on, backed by code evidence. Produce two outputs: what to say **on the PR**, and what the PR **does not cover** but should.

This skill pairs well with a root-cause-first debugging skill such as `superpowers:systematic-debugging`. If you do not have one, step 4 below stands on its own.

## Privacy rules (non-negotiable)

Ticket text often holds names, emails, record keys, dates and quotes from real users.

- Never copy user names, emails, record keys or quotes into: the final answer, subagent prompts, files, PR comments, ticket comments, memory, or any external service.
- Describe the problem generically ("a user", "the second item is missing after save").
- Read the ticket through the MCP yourself. Give subagents only a generic bug description plus the code location.
- Read-only: never comment on the PR or ticket, push, or edit files unless the user asks.

## Steps

1. **Get the PR.** Run `gh pr view <n> --json title,body,baseRefName,headRefName,headRefOid,files`. Check out the branch in the right repo (the user may keep several repos side by side).
   - If `git pull` refuses because of uncommitted changes, do not stash or discard them. Run `git fetch`, confirm `HEAD` equals the PR head SHA, and tell the user.
   - If `gh` has several accounts, pass the right one for a single command with `GH_TOKEN=$(gh auth token --user <name>)`. Do not switch the user's global account.
2. **List the PR's files and changed lines.** Run `git diff <base>...HEAD`. This list decides which section a finding goes in. Take line numbers from the PR head, not the base.
3. **Get ticket context with the Jira delivery MCP** (load the tools with ToolSearch if they are deferred):
   - `jira_get_issue` with `depth: "full"` and `includeConfluence: true` (parent, linked issues, comments, docs).
   - `jira_search_issues` with JQL for related tickets (same parent, same component, key terms from the bug) when the ticket is thin.
   - `confluence_search` and `confluence_get_page` for specs of the feature.
   - `delivery_check_changes` with `baseBranch` set to the PR base (`checks: ["alignment", "dod"]`) as a second opinion.
   - Limits to expect: comments can be capped to the newest few, so ask the user for older ones if they matter. With no acceptance criteria the alignment score is weak. Its layer checks can be wrong. Treat the output as hints, not proof.
   - If the MCP is not connected, say so and ask the user to paste the ticket text. Mark the review as lower confidence.
4. **Find the root cause first.** Trace the data end to end across layers (UI or store, request payload, API, service, database, response, UI). Follow the ticket's own clues: what the user did, online or offline, which action came before the failure, which item is missing. Write down what is confirmed (seen in code) and what is a guess.
5. **Review the PR against that root cause.** For a large diff, dispatch a general-purpose reviewer subagent with a generic description, the SHAs and the checklist below. For a small diff, review inline.
6. **Verify every finding yourself** before reporting it: open the file, confirm the line number and copy the exact line. Drop anything you cannot confirm and move it to "Not verified".
7. **Report in the format below.**

## Review checklist

- Does the PR fix the root cause, or only block one path to it?
- New code paths: missing, undefined or null input, empty arrays, unknown keys, old stored data.
- Does a removed guard still hold? (For example `!x.y` removed, then `.every` or `.map` on undefined.)
- Mutation of shared or reactive arrays. Is the cleaned data what gets saved?
- Existing bad data: records already in the broken state, and records already lost.
- The same bug elsewhere: other callers, other components, the backend counterpart.
- Silent failures: a layer that swallows an error and returns success.
- Tests: added or updated? Do existing tests still match changed messages?
- Style, only if it matters (keep it Low).

## Severity

- **Critical**: data loss or a security issue shipped by the PR, or the fix makes things worse.
- **High**: the fix is wrong or misses its stated goal.
- **Medium**: a real gap or risk in the changed code, or missing tests.
- **Low**: style, naming, comment wording.

Do not inflate. If a case needs unusual data to reach, say so and lower it.

## Output format

Write plain, short English, the way a teammate writes a PR comment. One or two short sentences per cell. No buzzwords, no emojis. See [references/example-output.md](references/example-output.md) for a full worked example.

### Section A - Comments on files changed in the PR

Only findings anchored to a file and line that the PR changed.

| ID | Critical level | Issue | File name | Line number | Exact line | Suggested fix |
|---|---|---|---|---|---|---|

Order by severity. "Exact line" is copied verbatim from the PR head. Say which rows are worth posting (default: Medium and above) and which are optional style.

### Section B - Not in the PR's changes, but should be handled

Gaps outside the PR's files or lines: other files, other repos, the backend counterpart, existing bad data, follow-ups for the ticket.

| ID | Critical level | Issue | Repo / File name | Line number | Exact line | Suggested fix |
|---|---|---|---|---|---|---|

Keep these out of Section A. They are ticket notes or follow-up tickets, not PR comments.

### After the grids

- **Root cause assessment**: 3 to 6 sentences. Does the PR fix it? Cite file:line for where the problem actually happens. Mark confirmed versus guess.
- **Not verified**: tests not run, data not seen, comments not read.
- **Verdict**: merge, merge with fixes, or do not merge, with one sentence why. Say whether the ticket can close.

## Mistakes to avoid

- Mixing out-of-PR findings into the PR grid. The author will say "that file isn't in my PR".
- Reporting a line number from the base branch or from memory.
- Calling something High without a reachable path to it.
- Repeating private ticket details in the answer or in a subagent prompt.
- Posting anything to the PR or the ticket without being asked.
