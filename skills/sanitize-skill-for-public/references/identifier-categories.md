# Identifier categories

What to put in the term list and what to replace it with. Everything here is a fictional stand-in.

| Category | Examples to look for | Where to look | Stand-in |
|---|---|---|---|
| People | Full name, first name alone, surname, nickname, possessive ("Dana's"), handle, role that names one person ("our CTO") | Ticket text, comments, quotes, commit authors | "a user", "the reviewer", or an obviously invented name |
| Organisation | Company, team, department, client, region, school, programme | Ticket text, paths, URLs, README | "the company", "Acme" |
| Product and project | App names, codenames, repo names, internal tool names, feature names | Code samples, paths, ticket titles | An invented app ("a todo app") |
| Ticket and record keys | `PAY-418`, order numbers, profile or record ids, UUIDs | Examples, "how to find the bug" notes | `ABC-123`, `<record-id>` |
| Links and hosts | Wiki, tracker, dashboards, `*.atlassian.net`, internal domains, IPs | Steps, "see also" lines | `example.com` or remove |
| Dates and numbers | Dates of the incident, counts of users, durations, amounts | Example output, root-cause notes | Relative ("last week") or round, invented numbers |
| Secrets | Tokens, keys, passwords, connection strings | Config examples, logs pasted into notes | Remove. Rotate the secret if it was ever committed |
| Local paths | `/Users/<name>/...`, `/home/<name>/...`, machine names | Command examples, error output | `~/` or `<project>/` |
| Quotes | Anything a real person wrote or said | Ticket comments, chat | Remove, or paraphrase into the general pattern |
| Metadata | `author`, `owner`, `contact`, file names, image text | Frontmatter, manifests, asset names | Your public handle only |

## Variants to add

For every name, list the short forms too: first name alone, last name alone, initials, "Name's", email local part, username. A scan only finds what it is told to look for.

## Patterns the scanner reports without a list

Emails, ticket-key shapes (`ABCD-1234`), UUIDs, IP addresses, ISO dates, home paths, internal URLs and common secret formats. These are reported as `review`, because some are fine (a fictional `ABC-123`). Judge each one.
