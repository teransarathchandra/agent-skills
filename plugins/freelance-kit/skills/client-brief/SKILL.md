---
name: client-brief
description: Turn a client request into approved acceptance criteria and a spec before any code.
disable-model-invocation: true
argument-hint: <short-slug> [path to request or paste it]
---
Request: $ARGUMENTS

1. Read the client's request (file path, pasted text or email). Restate it as AC-1..n plus open questions and assumptions.
2. Ask me only the open questions. Do not start brainstorming; the client request is the input.
3. Write `specs/<slug>.md`: ACs, out of scope, edge cases, exact tests to add or run, the repo's verification command, and an estimate (hours range) for the proposal.
4. Stop and wait for my approval (I confirm with the client) before writing code.
