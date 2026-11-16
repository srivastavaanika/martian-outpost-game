---
name: balance-check
description: Check and retune Martian Odyssey game balance with the headless simulator. Use after changing src/engine/config.ts, any card's effects, an event's impact, the event or card-offering logic, or the space-weather snapshot, or when the user asks whether the game is too easy or too hard.
---

# Balance check

`npm run sim` (`scripts/simulate.ts`) plays 2000 games per strategy against the real engine and prints the win rate and the loss reason for each meter and for coins.

## Targets (from `docs/game-design.md`)

| Strategy | Win rate |
| -------- | -------- |
| random | 15-35% |
| fixRed (picks a "Fixes ..." card when there is one) | 35-60% |
| coinRush (always the most coins) | under 10% |
| balanced (looks at every meter) | 85% or more |

Also watch loss reasons: several meters should cause a share of losses, and no single reason should cause almost all of them.

## Steps

1. Run `npm run sim` before changing anything and keep the table as the baseline.
2. Change **one lever** at a time. Levers:
   - in `src/engine/config.ts`: `RULES.scienceGoal`; each meter's `start`, `daily`, `warnAt` and `failAt` in `METERS`; `FLARE_DOSE_MSV` (game-scaled, not real data)
   - event impacts and response-card effects in `src/engine/events.ts`
   - regular card effects in `src/engine/choices.ts` (then also follow the `add-choice` rules)
3. Never change values tagged `[REAL]` (the radiation daily change is the Mars baseline dose) to fix balance. Never change flare dates or classes in `src/data/space-weather.json`.
4. Run `npm run sim` again and compare with the baseline. Repeat from step 2 until all targets are met.
5. Run `npm run check` (engine tests assert some rule numbers - update a test only if the rule itself intentionally changed).

## Environment note

The scripts run as `node --import tsx ...`, which works in a sandboxed shell. Running the `tsx` command directly opens an IPC pipe and fails there with `EPERM ... listen`.

## Record the result

- Replace the balance tables in `docs/game-design.md` (strategy, target, current, and the full table) and say which data it used (`curated` or `donki`).
- Add a `docs/decisions.md` entry: which lever changed, from what to what, and the before/after win rates.
- Paste the final `npm run sim` table into your summary.
