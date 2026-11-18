# Task routing (token-efficient defaults)
- Small or clearly specified change (about 20 lines or less): plain prompt, run the check once; no workflow plugins, plan mode or subagents.
- New project: `/kickoff <idea>`. A ticket or client request is already the spec: start from it, skip brainstorming, and finish with the `ac-reviewer` agent plus the project's verify command (`browser-qa` for UI).
- Brainstorming, writing-plans or plan mode only for multi-file or ambiguous work; subagent-driven development only when a plan has 4+ independent tasks.
- Debugging skills only for non-obvious or flaky bugs; otherwise reproduce with a failing test, then fix.
- Wide codebase search goes to the `Explore` agent; reviews go to a fresh-context reviewer (`/code-review` or `ac-reviewer`), not the session that wrote the code.
- One writer per task; parallelize only across tasks (separate worktrees) or read-only work.
- Default effort medium; `ultrathink` for a single hard turn; no max or ultracode for routine work.
- Before saying done, run the repo's typecheck and related tests and show the output. Tick `- [x]` on a SPEC.md acceptance criterion only after its check passes.
- Suggest `/clear` when the user switches to an unrelated task.
