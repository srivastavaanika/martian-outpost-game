---
name: phaser-react-bridge
description: Connect the Phaser 2D scene to the React app and Zustand store in Martian Odyssey - creating, lazy-loading, updating and destroying the Phaser game. Use when creating or changing src/ui/PhaserGame.tsx, src/scene/config.ts, the way the scene receives game state, or when there are duplicate canvases, leaks or state mismatches between the scene and the UI.
---

# Phaser-React bridge

Plan: `.cursor/plans/new_game_layout_4b40858c.plan.md` (target architecture, phase 1). Only implement a roadmap phase after the user explicitly says to.

## Ownership (do not blur)

- `src/engine/` owns all rules. Unchanged by scene work; must never import `phaser`.
- `src/store.ts` is the only bridge to the engine. The scene never calls `applyChoice` or `createGame`.
- `src/scene/` renders state. It must not import `react`, `src/ui` or `src/store` - it receives state and an `onModuleTap` callback from the bridge.
- `src/ui/PhaserGame.tsx` is the only file that knows both React and Phaser.

## Lifecycle rules

1. **Lazy-load:** `PhaserGame.tsx` loads Phaser with `import()` inside an effect (or `React.lazy`), so the start screen never downloads it.
2. **Create once per mount:** create `new Phaser.Game(config)` in `useEffect` with a `parent` element from a ref. `src/main.tsx` uses `<StrictMode>`, so in development the effect runs, cleans up and runs again - the cleanup must fully destroy the first game.
3. **Guard async creation:** the dynamic import resolves after a possible unmount. Keep a `cancelled` flag in the effect; if set when the import resolves, do not create the game.
4. **Destroy on unmount:** `game.destroy(true)` (removes the canvas) and unsubscribe from the store in the same cleanup.
5. **One canvas:** after start -> debrief -> "Try another mission" -> start, `document.querySelectorAll('canvas').length` must be 1.

## State flow (one direction)

```text
store.subscribe -> bridge -> game.registry.set('gameState', state)
scene: this.registry.events.on('changedata-gameState', render)  // plus an initial read in create()
scene tap -> onModuleTap(moduleId) passed by the bridge -> UI highlights the related cards
```

- Tapping the scene never commits a choice; the player still chooses on a card, which calls the store's `choose()`.

- Push the whole immutable `GameState`; the scene derives everything else via `src/scene/cues.ts` (see `scene-cue`).
- Remove registry listeners in the scene's `SHUTDOWN` handler.
- Never keep a second copy of resources in the scene that can drift from the store. If the scene and the resource bars disagree, the scene is wrong.

## Config

- All Phaser config lives in `src/scene/config.ts`: `title: 'Martian Odyssey'`, size and scale settings (see `scene-layout`), texture keys (see `phaser-assets`), and colours. No game-balance numbers - those stay in `src/engine/config.ts`.
- Pin the Phaser major version in `package.json` and use that version's API; check `node_modules/phaser/package.json` before relying on an API from memory.

## Verify

- `npm run lint` (engine cannot import `phaser`; scene cannot import `react`).
- `npm run check`, `npm run build` (note the Phaser chunk size, roadmap P1.7).
- Run the `scene-verify` skill: one canvas, no console errors, module values match the resource bars for 3 days.
