---
name: phaser-assets
description: Add images, sprites, atlases, audio or fonts to the Martian Odyssey Phaser scene with correct licensing, credits, loading and size budget. Use when adding or replacing any file under public/assets/ or src/assets/, changing texture keys or the preload scene, or packing sprites into an atlas.
---

# Add a Phaser asset

Manifest: `docs/assets.md`. Plan: `.cursor/plans/new_game_layout_4b40858c.plan.md` (phase 4). Only implement a roadmap phase after the user explicitly says to.

## Before adding a file

1. Add or update the row in `docs/assets.md` first: id, purpose, states/frames, phase, source, licence, credit, status.
2. Licence must be public domain, CC0 or OFL (fonts). Anything else needs a `docs/decisions.md` entry first.
3. NASA imagery: record the image ID and credit line (e.g. "NASA/JPL-Caltech/MSSS"). Never use the NASA logo. Never edit a photo so it shows something that did not happen.

## File rules

| Kind | Format | Location |
| ---- | ------ | -------- |
| Backgrounds | WebP, one wide (~1920x1080) and one portrait crop | `public/assets/backgrounds/` |
| Sprites (modules, crew, props, effects) | One or two texture atlases (PNG + JSON, e.g. free-tex-packer, trimmed, 2 px padding) | `public/assets/sprites/` |
| Audio | OGG with MP3 fallback, short and quiet | `public/assets/audio/` |
| React icons | SVG | `src/assets/icons/` |

Name files after the manifest id (`bg-mars.webp`, `mod-greenhouse` frame names inside the atlas).

## Loading

- Define every texture, atlas and audio key once in `src/scene/config.ts`; never type key strings elsewhere.
- Load everything in one preload scene (`this.load.atlas`, `this.load.image`, `this.load.audio`) with a simple progress bar and a kid-friendly "Getting the base ready..." label.
- Handle `loaderror`: fall back to the placeholder shapes so a missing file never breaks the mission.
- Phaser loads from `public/assets/` by URL, so paths start with `assets/` (respect Vite's `base` if the site is deployed under a subpath).

## Budget and credit

- Total under `public/assets/` must stay at or under 3 MB: check with `du -sh public/assets`.
- NASA images: add an entry to `src/data/sources.ts` and a row in `docs/data-sources.md` (use the `refresh-nasa-data` skill).
- Non-NASA assets: list them in the "Art and sound credits" section of the Data Sources screen.
- Set the manifest status to `done` only when the file is in the repo, loads, and is credited.

## Verify

- `npm run build` and `npm run check` pass.
- `scene-verify`: the asset renders at desktop and 375 px, no 404s in the Network tab, credit visible on the Data Sources screen.
