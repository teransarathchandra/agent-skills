---
name: sanitize-skill-for-public
description: Use when a skill, prompt, playbook or set of notes written for private or work use is about to be published or shared (public repo, plugin marketplace, blog, team wiki), or when asked to remove names, company or product terms, ticket keys or internal links from it, anonymize it, or make it safe to open-source.
license: MIT
compatibility: Needs Python 3.9+ to run scripts/scan_terms.py. Git is optional, for checking history.
metadata:
  author: teransarathchandra
  version: "0.2.0"
---

# Sanitize a skill for public release

A skill written during real work carries the incident it came from: a person's name, the company, a ticket key, a quote, a date. This skill turns that into a general, fictional, safe version and shows that it is clean. It prepares a copy. The owner decides whether to publish.

## Rules (non-negotiable)

- **Work on a copy.** Never edit the private original in place.
- **Keep the term list private.** It holds the exact words you must remove. Store it outside the folder being published. Never commit it, and never paste it into a PR, issue, commit message or online service. The scan script refuses to run if the list sits inside the scanned folder.
- **Say less than you found.** In reports, give file, line and category. Show the matched word only in the local terminal, never in anything that gets posted.
- **Prepare only.** Do not push, open a PR, or change repository visibility. Stop at a copy that is ready for review.
- **A clean scan is not proof.** The scan finds the words you listed and common patterns. You still have to read the files.

## Steps

1. **Copy.** Copy the skill to a work folder outside the private source. Do the rest there.
2. **Build the term list.** Unless the owner already listed the private identifiers, ask how to get them, as options with one recommended:
   a) **Point me to the source material (tickets, notes, the original repo) and I draft the list for you to confirm (Recommended: it finds the variants people forget)**
   b) Give me the list yourself
   c) Both: your list, and I add what I find in the files

   Then read the files yourself for anything the list missed. Put one per line in a file outside the work folder, for example `~/private-terms.txt`. Include variants: first name alone, surname, nickname, abbreviation, handle. Categories and where to look: [references/identifier-categories.md](references/identifier-categories.md).
3. **Scan.**
   ```bash
   python3 scripts/scan_terms.py --terms ~/private-terms.txt <work-folder>
   ```
   The path is relative to this skill's folder. `block` hits are your listed terms. `review` hits are patterns (emails, ticket keys, ids, dates, internal links, secrets, home paths) to judge one by one.
4. **Generalize, then replace.**
   - Turn the incident into the pattern ("an item goes missing after save", not what happened to whom).
   - Replace each identifier with a consistent fictional stand-in. Use `ABC-123` for ticket keys, `example.com` for links, an invented app for the product, "a user" for people.
   - Rewrite examples from scratch as fictional. Renaming a real example keeps its shape, and the shape can identify it.
   - Keep the lessons ("Mistakes to avoid"), drop the story that taught them.
5. **Check what is not file content.** File and folder names, frontmatter (author, metadata), image alt text, commit messages, branch names, PR and issue text. Check history too:
   ```bash
   git log -p --all | python3 scripts/scan_terms.py --terms ~/private-terms.txt -
   ```
   If private text is already in git history, a new commit does not remove it. Tell the owner to publish from a fresh repository or rewrite the history.
6. **Scan again, then read.** Repeat until there are no `block` hits. Then read every changed file in full, and read the diff against the original. Look for details that identify without a name: a rare job title, a unique event, an unusual number.
7. **Smoke test.** Run the sanitized skill on a fictional task. Sanitizing often deletes the one rule that mattered.
8. **Report** in the format below.

## Report format

| ID | What was found | Category | Where (file:line) | Replaced with |
|---|---|---|---|---|

Then three short lines: **Residual risks** (what a scan cannot see), **Not checked** (history, images, anything skipped), and **Status**: "ready for your review". Do not say "safe to publish". That is the owner's call.

See [references/example.md](references/example.md) for a before-and-after.

## Mistakes to avoid

- Swapping a real name for another name but keeping the same unique story. The story still identifies.
- Leaving dates, counts and the order of events from the real incident.
- Cleaning the body but not the frontmatter, file names or metadata.
- Saving the term list inside the repository, or mentioning it in a commit.
- Treating a clean scan as the finish line.
- Doing a plain name swap when asked and staying quiet about the story, dates and numbers that still identify. Do the swap if the owner insists, and say what risk remains.
- Publishing from a history that still holds the original text.
