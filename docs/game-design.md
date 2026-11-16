# Game design

## Pitch

You are the captain of Martian Outpost Odyssey for **16 sols, shown as Sol 215 to Sol 230**. Every sol something happens: a real solar flare from NASA's records, or another problem such as a dust storm or a leaking pipe. You pick **one of four** crew actions. Every action helps something and costs something. Keep all six meters safe and earn enough Coins (science) by Sol 230 to win.

## Core loop (one sol)

1. **The event.** Decided before the cards (`pickEvent` in `src/engine/engine.ts`):
   - Sol 215 (engine sol 1) is always the calm welcome sol.
   - If NASA DONKI lists an X-class flare **above X3** (e.g. X3.4, not X2.2) on that sol's Earth date, the event is **Solar Flare Warning**, labelled with the real class and date.
   - Otherwise one of 8 random events, seeded, with no repeats until all eight have been used.
   - The strongest C- or M-class flare that day (if any) adds a small background dose. It does not replace the event.
2. **The cards** (`offerChoiceIds`), shuffled:
   - the event's **2 response cards**;
   - **recovery cards**: one for **every meter in its warning (danger) zone** - a card that helps two of them, like Grow food for food and oxygen, counts for both. When no meter is in warning, 1 recovery card for the meter with the least room before its warning level. Oxygen always gets **Make oxygen from water** (`PRIORITY_RECOVERY_CARD`), the real way bases make air;
   - **1 coin card** (a regular card with 10 or more coins) if there is still a free slot. On a discovery sol, Send data to Earth is left out, so it never sits next to the cheaper "Celebrate and tell Earth".
   - On the calm sol: the recovery card(s), 1 coin card and other regular cards up to 4.
   - The hand is 4 cards, or more when the warning meters plus the response cards need more room (in 2000 random games: 87% of hands are 4 cards, 10% are 5, 3% are 6 or 7). In a crisis the coin card is the first to go, so science slows down.
3. **Resolve** (`applyChoice`), in this order:
   1. The card's effects.
   2. The event's impact, minus the share the card prevents (`avoids`: all, half or none). A card that is not a response to this event prevents nothing.
   3. The background flare dose (C +0.05, M +0.25, X +0.5 mSv; flares above X3 count only on the calm first sol).
   4. Each meter's daily change.
   5. Meters are clamped between 0 and their dial maximum. Then check for a loss, and on the final sol check the coin goal.

"Room before warning" puts every meter on one scale: 1 at its starting value, 0 at its warning level, negative beyond it. For meters where higher is better it is `(value - warn) / (start - warn)`; for radiation and waste it is `(warn - value) / (warn - start)`. Ties go to the order power, oxygen, water, food, radiation, waste.

## Meters

All units are real-world units, but the amounts are **game numbers**, except the daily radiation baseline, which is a real measurement.

| Meter            | Unit | Start | Dial max | Daily change      | Warning at | Mission ends at |
| ---------------- | ---- | ----- | -------- | ----------------- | ---------- | --------------- |
| Power ⚡         | kWh  | 80    | 100      | -2                | 45 or less | 0               |
| Oxygen 💨        | kg   | 250   | 300      | -9                | 100 or less | 0               |
| Water 💧         | kL   | 7     | 8        | -0.25             | 3.5 or less | 0              |
| Food 🍽️          | kg   | 30    | 40       | -1.5              | 15 or less | 0               |
| Radiation dose ☢️ | mSv  | 3     | 40       | +0.67 (**REAL**)  | 30 or more | 40              |
| Waste 💩         | kg   | 40    | 300      | +10               | 240 or more | 300            |
| Coins 🪙 (science) | -  | 0     | -        | -                 | -          | goal: 60 by Sol 230 |

Live values are in `src/engine/config.ts`. That file wins if this doc and the code disagree, so update this doc when you change it.

The meters are linked the way they are on a real base: making oxygen uses water and power, plants drink water and give back a little air, spacewalks use suit oxygen and add radiation, and recycling water also cuts waste.

## Events

Defined in `src/engine/events.ts`. Each event has an impact that hits the base if nobody handles it, and two response cards.

| Event | Trigger | Impact if not handled | Response cards (share prevented) |
| ----- | ------- | --------------------- | -------------------------------- |
| 👋 Welcome to the Outpost! | Sol 215 only | none | none (regular cards) |
| ☀️ Solar Flare Warning | Real flare above X3 that day | radiation +4 mSv | Dash to the storm bunker (all), Finish tasks first (half) |
| 🌪️ Dust storm | random | power -20 kWh | Leave the panels out (half), Fold the panels (all) |
| 🥀 Greenhouse accident | random | food -10 kg | Mystery stew (all), Toss the plants (none) |
| 💦 Pipe leak | random | water -0.75 kL | Fix it now (all), Bucket, fix later (half) |
| ❄️ Dry-ice snowstorm | random | oxygen -10 kg | Rush inside (half), Rescue the gear (all) |
| 🚙 Rover in a sand trap | random | power -10 kWh | Leave it stuck (half), Tow it out (all) |
| 🪨 Drill hits bedrock | random | water -0.5 kL | Move the drill (all), Push harder (half) |
| ☄️ Crack in the dome | random | oxygen -40 kg | Repair bots (half), Patch it yourself (all) |
| 🔬 Scientific discovery | random | none (good event) | Celebrate and tell Earth, High-five and keep working |

With the bundled May 2024 snapshot, the Solar Flare event falls on Sol 219, 220, 223 and 224 (X3.9, X5.8, X8.7, X3.4). The X1.0, X2.2 and X1.0 days become random-event days with a 0.5 mSv background dose, and random events fill the other eleven sols.

## Choices

Regular cards are in `src/engine/choices.ts` (14 cards); response cards are in `src/engine/events.ts` (18 cards). Each has `effects`, a kid-readable `description` and a real-world `lesson`. Design rules, tested in `src/engine/design-rules.test.ts`:

- Every regular card has at least one gain and one cost.
- Every response card has a cost of its own. Its gain may be the part of the event it prevents.
- No regular card is strictly better than another regular card, and neither response card to an event is strictly better than the other (counting the prevented impact).
- Title 32 characters or fewer, description 110 or fewer; event descriptions 160 or fewer.

## Win / loss

- **Win:** reach the end of Sol 230 with every meter safe and at least 60 Coins.
- **Loss:** power, oxygen, water or food at 0; radiation at 40 mSv; waste at 300 kg; or the coin goal missed at the end.
- The debrief teaches the lesson behind the loss reason (`LOSS_MESSAGES` in `src/ui/labels.ts`), the lesson of every card the player used, and one real NASA fact.

## Where we simplify reality (be honest about this)

| Real | In the game | Why |
| ---- | ----------- | --- |
| A sol is 24 h 39 min, and Mars dates do not line up with Earth dates | Each sol is mapped to one Earth date, so Sol 215 = 6 May 2024 | DONKI flares are listed by Earth date; one sol per date keeps the real data honest and simple |
| Radiation doses are small per day; NASA's career limit is 600 mSv | 40 mSv "mission budget" over 16 sols | 16 days of real dose would never threaten anyone; the budget makes radiation matter in a short game |
| Radiation storms come mainly from solar energetic particle events that often follow flares and CMEs | Flares above X3 are the Solar Flare event (+4 mSv unless sheltered); other flares add a background dose: C 0.05, M 0.25, X 0.5 mSv | Flares are easy to explain and well catalogued in DONKI |
| Meter amounts depend on crew size, hardware and mission design | Real units with game amounts | Real units teach what is measured; the amounts are tuned so every meter matters |
| Daily surface dose on Mars | **Real** published average (Gale Crater: 0.67 mSv per day) | Real data anchors the mechanic |
| Flare dates and classes | **Real** (DONKI snapshot, 2024-05-06 to 2024-05-21, verified) | Real data anchors the mechanic |

## Balance targets (check with `npm run sim`)

Since 2026-11-15 the game is tuned for 7-12 year olds: a child who just follows the "Fixes ..." tags should win often, and careful play should almost always win.

| Strategy | Target win rate | Current (2000 games, DONKI data, 2026-11-15) |
| -------- | --------------- | -------------------------------------------- |
| random | 15-35% | 28.6% |
| fixRed (picks a "Fixes ..." card when there is one) | 35-60% | 54.1% |
| coinRush (always the most coins) | < 10% | 0.0% |
| balanced (looks at every meter) | 85% or more | 99.3% |

Full table:

| strategy | win | lost: power | lost: oxygen | lost: water | lost: food | lost: radiation | lost: waste | lost: coins | avg dose mSv | avg coins |
| -------- | --- | ----------- | ------------ | ----------- | ---------- | --------------- | ----------- | ----------- | ------------ | --------- |
| random | 28.6% | 46.1% | 3.9% | 0.7% | 14.6% | 0.0% | 0.0% | 6.2% | 26.2 | 91 |
| fixRed | 54.1% | 10.3% | 0.9% | 0.9% | 5.1% | 0.0% | 0.0% | 28.6% | 28.3 | 72 |
| coinRush | 0.0% | 99.9% | 0.1% | 0.0% | 0.1% | 0.0% | 0.0% | 0.0% | 20.4 | 162 |
| balanced | 99.3% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.7% | 30.5 | 73 |

Latest retune (see `docs/decisions.md`, 2026-11-15, "Make oxygen from water gives +40 kg"): Make oxygen from water +20 to +40 kg, and Clean the solar panels +20 to +25 kWh. Before that ("Easier for 7-12 year olds"): coin goal 100 to 60, power daily -3 to -2, plus the "Fixes ..." tag and the danger warning on cards. Earlier retunes the same day: warning levels raised and a card for every meter in warning; Make oxygen from water always offered for oxygen; food start 30 kg and daily -1.5; background flare doses halved and stronger radiation cards; coin rewards cut to about 0.8x. Waste and radiation rarely end a mission.

## Ideas backlog

- Difficulty levels (Cadet / Commander) that change the dose budget and daily changes.
- A "Mission Control" chart of real flare classes over the mission dates.
- Read-aloud mode (Web Speech API) for younger players.
- A CSA food-production mini-event.
- RadLab ISS dose comparison in the debrief ("today you got X - an ISS astronaut gets Y").
