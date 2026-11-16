# Example output

This example is fictional. The app, ticket, PR and code are made up to show the format.

**Ticket ABC-456:** "Completed tasks disappear after sync."
**PR 123:** adds a guard in `src/store/tasks.js` so a task needs at least one label before it is synced.

### Section A - Comments on files changed in the PR

| ID | Critical level | Issue | File name | Line number | Exact line | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | Medium | A label key that is not in `knownLabels` counts as "no label", so a valid task can be blocked. | `src/store/tasks.js` | 88 | `return task.labels.every(key => !knownLabels.has(key));` | Check for a known label directly: block the task only when none of its labels is known. |
| 2 | Medium | The old `!task.labels` check was removed. A task with no `labels` field now throws here, and this runs while the list loads. | `src/store/tasks.js` | 88 | `return task.labels.every(key => !knownLabels.has(key));` | Use `(task.labels \|\| [])`, like line 61 does. |
| 3 | Medium | No tests were added for the new rule. | `src/store/tasks.js` | 85 | `// Rule: every task needs at least one known label` | Add tests for empty labels, an unknown label and a missing `labels` field. |
| 4 | Low | The comment says "atleast". | `src/store/tasks.js` | 85 | `// Rule: every task needs atleast one known label` | Write "at least". |

### Section B - Not in the PR's changes, but should be handled

| ID | Critical level | Issue | Repo / File name | Line number | Exact line | Suggested fix |
|---|---|---|---|---|---|---|
| 5 | High | The API marks tasks it cannot parse as archived and still returns success, so the app deletes the local copy. | `api/src/sync.ts` | 142 | `await db.task.updateMany({ where: { id: { notIn: validIds } }, data: { archived: true } });` | Return an error, or keep the task, when a task fails validation. |
| 6 | Medium | Tasks already archived by this bug are not restored by the PR. | `api/src/sync.ts` | 142 | same line as 5 | Plan a one-off script that restores tasks archived in the affected period. |

**Root cause assessment:** The tasks vanish in `api/src/sync.ts:142`, where the API archives anything that fails validation and reports success. The PR stops one way to reach that state (a task with no label). It does not stop the silent archive, so any other failed check still loses tasks. Confirmed by reading both files; the reported user's data was not seen.

**Not verified:** Tests were not run. The affected user's task data was not checked.

**Verdict:** Merge with fixes (rows 1 to 3). Keep ABC-456 open until row 5 is handled.
