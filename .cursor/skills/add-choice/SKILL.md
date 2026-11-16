---
name: add-choice
description: Add or edit a crew choice card in the Martian Odyssey game so it stays a real trade-off. Use when changing src/engine/choices.ts or src/engine/events.ts, adding a new crew action or event response, or changing a card's effects, avoids, title, description or lesson.
---

# Add or edit a choice

Two kinds of card:

- **Regular cards** in `src/engine/choices.ts` (13): offered as the recovery card or the coin card on any sol.
- **Response cards** in `src/engine/events.ts` (18): two per event, offered only during that event. They also have `eventId` and `avoids` (the share of the event's impact they prevent: 1, 0.5 or 0), and the event lists them in `idealChoiceIds`.

Every card has `id`, `icon`, `title`, `description`, `effects`, `lesson` and `animation`. Effects are in each meter's real unit: power kWh, oxygen kg, water kL, food kg, radiation mSv, waste kg, plus `science` (shown as Coins).

## Rules (tested in `src/engine/design-rules.test.ts` - never weaken that test)

- Gains and costs follow each meter's direction: more power, oxygen, water, food or coins is a gain; more radiation or waste is a cost.
- A regular card needs at least one gain and one cost. A response card needs a cost of its own; its gain may be the impact it prevents.
- No regular card may be strictly better than another regular card. The two response cards to an event may not be strictly better than each other, counting the impact each prevents. If a card dominates or is dominated, change its numbers - not the test.
- `title` 32 characters or fewer, `description` 110 or fewer, `lesson` not empty, `id` unique and kebab-case.
- Only the six meters plus `science`. Never add a meter here (see `docs/decisions.md`). Event impacts never take coins.

## Steps

1. Read `docs/game-design.md` (core loop, meter and event tables, current balance) and the existing cards so numbers are in the same range: power costs about 3-10 kWh, oxygen 2-18 kg, water 0.1-0.5 kL; going outside adds 0.5-2 mSv.
2. Write the card:
   - `title`: a concrete verb a 7-year-old can read aloud ("Dig up ice", not "Extract subsurface volatiles").
   - `description`: one or two short sentences that name the gain and the cost.
   - `effects`: if the crew goes outside, add `radiation`.
   - `lesson`: one true sentence about real missions. If it states a fact or number, it must be sourced in `docs/data-sources.md`; otherwise keep it general.
3. Check how `offerChoiceIds` in `src/engine/engine.ts` will use it: a regular card with 10 or more coins goes in the coin pool; any other regular card can be the recovery card for each meter it helps. A response card is only offered with its event.
4. Run the `kid-content-review` skill on the new text. Add any new science word to `docs/glossary.md`.
5. Run `npm run check`.
6. Run the `balance-check` skill (effects changed, so balance changed).
7. If the 2D scene exists, map the card to a module in `src/scene/cues.ts`.

## Done when

- `npm run check` passes.
- The `npm run sim` table is in your summary and still meets the targets.
- `docs/game-design.md` and `docs/glossary.md` are updated if anything they describe changed.
