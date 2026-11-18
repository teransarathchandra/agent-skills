# workbench

A Claude Code mod for keeping an eye on cost and change while agents work.

- A band above the prompt shows how full the context window is, what the last turn cost and the session total (API-equivalent prices), so you know when to `/clear` or `/compact`.
- `/workbench` opens a side pane with the git branch, the number of uncommitted changes, the open pull request's state and checks (read with the local `gh` CLI), and the files Claude edited or wrote in this session.

It makes no network calls of its own and never changes files. Git and PR details refresh at the end of each turn.
