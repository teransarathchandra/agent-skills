# flowbar

A Claude Code mod for agentic work. It adds a band above the prompt showing how many acceptance criteria in the project's `SPEC.md` are ticked (`- [x]`), whether the last verify run (`scripts/verify.sh`, `pnpm check`, `pnpm verify`) passed or failed and how long ago, and which subagents are running right now. A failed verify also shows a toast.

It also adds `/kit`, a command that answers without calling the model: it lists the plugins enabled for this project, the stack and `/goal` line of every enabled `*-kit` plugin (read from its marketplace), and the check command.
