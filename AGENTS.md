# AGENTS.md - Martian Odyssey

NASA Space Apps Challenge 2026 entry ([challenge page](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/), copied into `docs/challenge-brief.md`).
A browser game for **kids aged 7-12**: run a Mars outpost for 16 sols (Sol 215-230), balancing **power, oxygen, water, food, radiation dose and waste** while real solar flares and other events hit. Every choice must teach a **real trade-off**. Judges value mechanical accuracy and real NASA data over visual polish.

## Stack

Vite + React 19 + TypeScript (strict) + Tailwind CSS 4 + Framer Motion + Zustand. Vitest for unit tests, Playwright for one smoke test. No backend - static site.

## Layout

| Path           | What lives there                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/engine/`  | **Pure TypeScript game rules.** Types, tuning (`config.ts`), choice catalogue (`choices.ts`), turn resolution (`engine.ts`). No React / Zustand / DOM / fetch. |
| `src/data/`    | NASA data: bundled snapshot (`space-weather.json`), DONKI client + parser (`donki.ts`), attribution (`sources.ts`), curated facts (`facts.ts`).                |
| `src/ui/`      | React components. Read state from `src/store.ts`; never compute game rules here.                                                                               |
| `src/scene/`   | Phaser 2D view of the outpost, lazy-loaded by `src/ui/PhaserGame.tsx`. Renders state only; no React, store or rule code (ESLint enforces this).                 |
| `src/store.ts` | Zustand store - the only bridge between UI and engine.                                                                                                         |
| `scripts/`     | `simulate.ts` (balance simulator), `fetch-nasa-data.ts` (refresh DONKI snapshot).                                                                              |
| `tests/e2e/`   | Playwright smoke test.                                                                                                                                         |
| `docs/`        | Design, data, content and decision docs - read the relevant one before changing behaviour.                                                                     |

## Commands

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # typecheck + lint + unit tests - run before saying you are done
npm run sim          # balance simulation (win rates per strategy) - run after any tuning change
npm run data:fetch   # refresh src/data/space-weather.json from NASA DONKI
npm run test:e2e     # Playwright smoke test (needs `npx playwright install chromium` once)
npm run build        # production build to dist/
```

## Non-negotiable rules

1. **Every choice is a trade-off**: at least one gain and one cost, and no choice may be strictly better than another. Enforced by `src/engine/design-rules.test.ts` - never weaken that test to make a change pass.
2. **Six meters, no more**: power, oxygen, water, food (end the mission at 0), radiation dose and waste (end it at their ceiling), all in real units (kWh, kg, kL, mSv). This deliberately exceeds the brief's 2-3 recommendation - see `docs/decisions.md` (2026-11-15). Science (shown as Coins) is the goal, not a meter.
3. **The engine stays pure**: `src/engine/**` must not import React, Zustand, Framer Motion, `src/ui` or `src/store` (ESLint enforces this). All randomness goes through the seeded RNG in `rng.ts`.
4. **Never invent data presented as real.** Real values are tagged `[REAL]` with a source in `config.ts` / `docs/data-sources.md`. Game-balance numbers are labelled as such. The bundled snapshot is never shown as live (`meta.isLive` is always `false`).
5. **Attribute every NASA source in-game** (`src/data/sources.ts` + the Data Sources screen).
6. **Write for 7-12 year olds**: see `docs/content-guidelines.md` (short sentences, no scary death language, big touch targets, colour is never the only signal).

## Definition of done

- `npm run check` passes.
- If you touched tuning (`config.ts` or choice effects): `npm run sim` still shows the balanced strategy winning clearly more often than random and science-rush. Paste the table into your summary.
- If you touched UI: you looked at it in the browser (desktop and a narrow ~375px viewport).
- If you added or changed data: `docs/data-sources.md` and `src/data/sources.ts` are updated.
- If you made a design decision: add a short entry to `docs/decisions.md`.

## Docs index

- `docs/challenge-brief.md` - the challenge text and judging signals.
- `docs/system-design.md` - architecture, turn flow, data pipeline, and which file owns each business rule.
- `.cursor/plans/new_game_layout_4b40858c.plan.md` - **source of truth** for the Martian Odyssey phased plan and next steps (`docs/roadmap-2d.md` only points here). Phased checklist for the Phaser 2D base scene (the scene renders state; it never computes rules). Tick a step only when its **Check** passes, and update the progress table.
- `docs/assets.md` - asset manifest: every image, sound, font and data file with phase, source, licence and credit.
- `docs/game-design.md` - core loop, resources, formulas, win/loss, where we simplify reality.
- `docs/data-sources.md` - every NASA source, endpoint, fields used, real values and citations.
- `docs/content-guidelines.md` - reading level, tone, accessibility.
- `docs/decisions.md` - decision log (why things are the way they are).
- `docs/glossary.md` - space terms and the kid-friendly wording we use.

Project skills live in `.cursor/skills/`:

- Game rules and content: `add-choice`, `balance-check`, `refresh-nasa-data`, `kid-content-review`.
- Phaser 2D scene: `phaser-react-bridge`, `scene-cue`, `scene-layout`, `phaser-assets`, `scene-verify`, `scene-performance`.
