---
name: playtest
description: Playtest a web game through the browser-qa agent - load each scene, press inputs, capture frames, report bugs.
disable-model-invocation: true
---
Start `pnpm dev`, then delegate to `browser-qa`: open the game, wait for the canvas, capture a frame per scene listed in SPEC.md, send the inputs each scene expects (keys, clicks), and check the console for errors and the frame rate counter if present. Report scene | input | expected | observed | screenshot. Keep game rules in pure TypeScript modules so they are unit-tested, and the canvas only renders state.
