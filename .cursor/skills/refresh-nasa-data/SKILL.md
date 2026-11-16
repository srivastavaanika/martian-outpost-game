---
name: refresh-nasa-data
description: Refresh or change the NASA data used by Martian Odyssey (DONKI solar flares, radiation baselines, facts, attribution) without presenting invented or static data as real or live. Use when running npm run data:fetch, editing anything in src/data/, adding a NASA source or fact, or changing a [REAL] value in src/engine/config.ts.
---

# Refresh or change NASA data

## Non-negotiable

- Never present invented numbers as real. Every value is REAL (published), CURATED (hand-picked real events, unverified) or GAME (balance tuning) - see `docs/data-sources.md`.
- The mission snapshot is never live: `meta.isLive` stays `false` (tested in `src/data/data.test.ts`).
- Every source shown or used in-game is attributed in `src/data/sources.ts` (Data Sources screen) and `docs/data-sources.md`. Never use the NASA logo.

## Refresh the solar-flare snapshot

1. Run `npm run data:fetch` (default 2024-05-06 to 2024-05-17; custom: `npm run data:fetch -- START END`). It reads `VITE_NASA_API_KEY` from the environment or `.env`, falls back to `DEMO_KEY`, and tries api.nasa.gov then CCMC. It may need full network permissions.
2. Confirm `src/data/space-weather.json` has `meta.source: "donki"`, `verified: true`, a `fetchedAt` date, and the raw copy in `data-raw/`.
3. If both endpoints fail, leave the existing file unchanged and record the date and error in `docs/data-sources.md`. Do not hand-edit flares to look fetched.
4. Update the DONKI status in `docs/data-sources.md`.
5. New flares change difficulty: run the `balance-check` skill.

## Add or change a source, fact or real value

1. Add the source to `src/data/sources.ts` (`id`, `name`, `url`, kid-friendly `usedFor`) and a section in `docs/data-sources.md` (endpoint or citation, fields used, real values).
2. Facts go in `src/data/facts.ts` with a `sourceId` that exists in `DATA_SOURCES` and `verified: false`. Only set `verified: true` after a person has checked the wording against the cited source.
3. A real value in `src/engine/config.ts` gets a `[REAL]` comment and a citation; mirror it in `docs/data-sources.md`.
4. Run the `kid-content-review` skill on any player-facing text.
5. Run `npm run check`.

## Done when

- `npm run check` passes.
- `docs/data-sources.md` and `src/data/sources.ts` agree.
- The Data Sources screen shows the new attribution (check it in the browser).
