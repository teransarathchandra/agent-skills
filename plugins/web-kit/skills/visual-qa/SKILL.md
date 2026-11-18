---
name: visual-qa
description: Check the running site at phone, tablet and desktop widths through the browser-qa agent and report layout problems.
disable-model-invocation: true
argument-hint: <url, default http://localhost:4321 or :3000>
---
Target: $ARGUMENTS
Delegate to the `browser-qa` agent: open each page listed in SPEC.md at 375, 768 and 1440 px wide, check overflow, overlapping text, broken images, unreadable contrast, console errors and dead links. Prefer accessibility snapshots; take a screenshot only to confirm a visual problem. Report a table: page | width | problem | likely file. Do not fix anything in this skill.
