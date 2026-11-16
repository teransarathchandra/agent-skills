# Example: before and after

Everything below is fictional, including the "private" original.

## Before (private)

```markdown
When Dana Whitfield at Northwind Bank reported on 2026-03-02 that PAY-418 lost invoices,
we found the bug in /Users/dana/code/northwind-billing/src/sync.ts. Dana said:
"I only hit Save once, and half my invoices vanished." Check https://northwind.atlassian.net/wiki/x/123.
```

Term list (kept outside the repo): `Dana Whitfield`, `Dana`, `Northwind`, `Whitfield`.

## First scan

```text
notes.md:1: [block] listed term: Dana Whitfield
notes.md:1: [block] listed term: Northwind
notes.md:1: [review] ticket-key: PAY-418
notes.md:1: [review] date: 2026-03-02
notes.md:2: [review] home-path: /Users/dana
notes.md:2: [block] listed term: northwind
notes.md:2: [block] listed term: Dana
notes.md:3: [review] internal-url: https://northwind.atlassian.net/wiki/x/123
```

## After (public)

```markdown
When a user reports that items go missing after a single save, look at the sync code first.
Check whether a layer drops items that fail validation and still returns success.
```

What changed and why:

| ID | What was found | Category | Replaced with |
|---|---|---|---|
| 1 | Customer and contact names | People, organisation | Removed. The skill needs the pattern, not who hit it |
| 2 | Ticket key, date, wiki link | Keys, dates, links | Removed. None of them helps the next reader |
| 3 | Home path with a first name | Local path | Removed |
| 4 | Verbatim quote | Quote | Paraphrased into the symptom |

Note that the "after" does not just rename Dana to "Alex". It keeps the lesson (a layer that drops items and reports success) and drops the story.
