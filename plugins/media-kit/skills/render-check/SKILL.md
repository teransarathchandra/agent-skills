---
name: render-check
description: Render stills or a short preview of a Remotion video, Slidev deck or docs page and review them before a full render.
disable-model-invocation: true
---
Remotion: `npx remotion still` at the start, middle and end of each composition, look at each image for clipping, unreadable text and timing; only then `npx remotion render` (long). Slidev: `pnpm slidev export --format png` and review every slide for overflow. Starlight: `pnpm build` and check internal links and sidebar order. Report problems per frame/slide/page.
