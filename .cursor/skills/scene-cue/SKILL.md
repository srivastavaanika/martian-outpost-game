---
name: scene-cue
description: Add or change an animation or visual effect in the Martian Odyssey Phaser scene so it is driven by real engine output, testable, accessible and safe for children. Use when adding anything under src/scene/ that animates a sol's event or result - crew movement, meter changes, solar flares, events, impact avoided, floating numbers - or when editing src/scene/cues.ts.
---

# Add a scene cue

Plan: `.cursor/plans/new_game_layout_4b40858c.plan.md` (Phases 2 and 3). Only implement a roadmap phase after the user explicitly says to.

## The rule

An animation may only show what the engine already decided. Every animation starts as a **cue**: plain data produced by `cuesForSol(report, state)` in `src/scene/cues.ts`, which reads `SolReport` / `GameState` and never computes new game values. If a number is needed, read it from the report or call an exported engine helper (`isWarning`, `roomBeforeWarning`) - never re-implement a formula.

## Steps

1. **Add the cue type** to the `SceneCue` union in `src/scene/cues.ts` (no `phaser` import in this file). Include everything the animation needs: module id, values with units, label text.
2. **Produce it** in `cuesForSol` from engine output only:
   - event start -> `state.event.eventId` (the next sol's event) or `report.event` (the sol just played)
   - meter changes -> `report.after[key] - report.before[key]`
   - impact that hit / impact prevented -> `report.impactApplied` / `report.avoidedImpact`
   - outside card -> the card's `effects.radiation > 0`
   - flare -> `event.flare` (class, `classType`, date); background flare -> `event.backgroundFlare`
3. **Unit test it** (Vitest, next to `cues.ts`): the cue appears when it should, not when it should not (flare sol vs random-event sol), and its values equal the engine's.
4. **Narrate it:** each cue has a short sentence for the screen-reader live region (the canvas is `aria-hidden`). Write it with the `kid-content-review` skill.
5. **Play it** in the Phaser scene: one handler per cue type. Animations run in sequence in a fixed order matching `applyChoice` in `src/engine/engine.ts`: card -> event impact (and what was prevented) -> background flare -> daily change.
6. **Reduced motion:** if `matchMedia('(prefers-reduced-motion: reduce)').matches`, skip tweens and particles and jump to the end state; the narration still plays.
7. **Map new cards:** every id in `ALL_CHOICES` (regular and response cards) must map to a module (test it).

## Child safety and clarity

- Flashes: no more than 3 flashes per second, no large saturated-red strobes (WCAG 2.3.1). A flare is one soft flash plus particles.
- Not scary: no explosions or injured crew. A flare is a "storm" the crew shelters from; a crack in the dome is fixed calmly.
- Colour is never the only signal: floating numbers keep `+`/`−`, the unit and an icon ("+20 kWh ⚡ −5 kg 💨").
- Keep each sol's sequence short (about 2-3 s) so play does not drag; never block the choice cards while it plays.

## Verify

- `npm run check` (new cue tests pass).
- `scene-verify`: on the first flare-event sol (Sol 219, X3.9, with the bundled snapshot) the flare cue plays with the real class and date; on a random-event sol it does not.
