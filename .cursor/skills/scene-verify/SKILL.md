---
name: scene-verify
description: Verify the Martian Odyssey Phaser scene in the browser and in Playwright - deterministic replays, a read-only test hook into scene state, screenshots at desktop and 375 px, canvas leaks and console errors. Use after any change under src/scene/ or src/ui/PhaserGame.tsx, when ticking a plan step, or when adding end-to-end tests for the scene.
---

# Verify the scene

A canvas has no DOM for tests to query, so verification relies on a read-only hook, deterministic missions and screenshots. Only implement a roadmap phase after the user explicitly says to.

## Test hook (add during phase 1, after approval)

- Playwright runs against the **production build** (`playwright.config.ts`: `npm run build && npm run preview`), so a dev-only hook would be missing in tests.
- Expose a read-only snapshot when the URL has `?e2e`: `window.__MARTIAN_ODYSSEY__ = { sceneReady, modules, lastCues, canvasCount }`. Never expose setters or anything that changes game state.
- Deterministic missions: support `?seed=N` in `src/store.ts` so a mission replays exactly. With the default snapshot, day 3 is 2024-05-08, the first real flare (X1.0).

Both are roadmap step P1.9. If they do not exist yet, say so instead of working around them.

## Manual check (every scene change)

1. `npm run dev`, open `http://localhost:5173/?e2e&seed=1`.
2. Desktop 1280x800 and phone 375x812 screenshots of: landing page, Sol 214, the first flare sol (Sol 216), a random-event sol, the debrief. Include them in the summary.
3. For 3 days: every module value equals the resource bar under it.
4. Flare day shows the flash and real label; a quiet day does not.
5. Console has no errors or warnings from Phaser.
6. Restart the mission twice: `document.querySelectorAll('canvas').length === 1`.
7. With reduced motion emulated, cues jump to their end state.

## Automated check

- `tests/e2e/smoke.spec.ts` keeps completing a mission via the cards.
- Scene assertions read `window.__MARTIAN_ODYSSEY__` (wait for `sceneReady`), never pixel positions.
- Avoid pixel-perfect screenshot comparisons; they break on fonts and GPU differences.
- Fail the test on any `pageerror` or console error.

## Before ticking a roadmap step

Run `npm run check`, `npm run test:e2e` and `npm run build`; then tick the step in `.cursor/plans/new_game_layout_4b40858c.plan.md` only if its **Check** passed, with the date, and update the progress table.
