---
name: scene-performance
description: Keep the Martian Odyssey Phaser scene smooth and leak-free on low-end school tablets and phones. Use when the scene stutters, memory grows across missions, before releasing (roadmap P6.3), or when adding particles, tweens, timers or many sprites.
---

# Scene performance

Target device: a budget tablet or phone. Goal: a flare day (the heaviest scene) stays at or above 30 fps with 4x CPU throttling, and memory does not grow across missions. Only implement a roadmap phase after the user explicitly says to.

## Measure first

1. `npm run build && npm run preview` (never judge performance in dev mode).
2. Chrome DevTools > Performance: CPU 4x slowdown, record a flare day. Note fps and long tasks.
3. Memory: take a heap snapshot, play 3 missions with restarts, take another. Detached canvases or growing `Phaser.Game` counts mean a leak.
4. Write the numbers in the summary and in roadmap step P6.3.

## Common fixes

- **Clean up on shutdown:** in each scene's `SHUTDOWN` handler remove registry and input listeners, kill tweens (`this.tweens.killAll()`), remove timers. The bridge must call `game.destroy(true)` on unmount (see `phaser-react-bridge`).
- **Reuse, do not recreate:** one particle emitter per effect, started and stopped per cue; pool floating-number text objects with a Group (`maxSize`).
- **No per-frame allocation:** nothing in `update()` creates objects or arrays. A turn-based scene usually needs no `update()` at all - drive everything from cues and tweens.
- **Particles:** cap counts (tens, not thousands); lower them when reduced motion is on (zero) or on small screens.
- **Textures:** use atlases (one draw batch), avoid huge backgrounds beyond what the screen shows, prefer WebP.
- **Text:** avoid re-creating Text objects each day; update `setText` instead.
- **Lazy load:** Phaser and its assets load only when a mission starts (start screen must stay fast).

## Verify

- 30 fps or better on the flare day with 4x throttling.
- No memory growth across 3 restarts; one canvas.
- `npm run check` and `npm run test:e2e` still pass.
