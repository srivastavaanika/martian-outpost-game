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
   - **1 recovery card** that helps the meter with the least room before its warning level;
   - **1 coin card** (a regular card with 10 or more coins). On a discovery sol, Send data to Earth is left out, so it never sits next to the cheaper "Celebrate and tell Earth".
   - On the calm sol: 1 recovery card, 1 coin card and 2 other regular cards.
3. **Resolve** (`applyChoice`), in this order:
   1. The card's effects.
   2. The event's impact, minus the share the card prevents (`avoids`: all, half or none). A card that is not a response to this event prevents nothing.
   3. The background flare dose (C +0.1, M +0.5, X +4 mSv; X only on the calm first sol).
   4. Each meter's daily change.
   5. Meters are clamped between 0 and their dial maximum. Then check for a loss, and on the final sol check the coin goal.

"Room before warning" puts every meter on one scale: 1 at its starting value, 0 at its warning level, negative beyond it. For meters where higher is better it is `(value - warn) / (start - warn)`; for radiation and waste it is `(warn - value) / (warn - start)`. Ties go to the order power, oxygen, water, food, radiation, waste.

## Meters

All units are real-world units, but the amounts are **game numbers**, except the daily radiation baseline, which is a real measurement.

| Meter            | Unit | Start | Dial max | Daily change      | Warning at | Mission ends at |
| ---------------- | ---- | ----- | -------- | ----------------- | ---------- | --------------- |
| Power ⚡         | kWh  | 80    | 100      | -3                | 45 or less | 0               |
| Oxygen 💨        | kg   | 250   | 300      | -9                | 60 or less | 0               |
| Water 💧         | kL   | 7     | 8        | -0.25             | 1.5 or less | 0              |
| Food 🍽️          | kg   | 10    | 40       | -1                | 4 or less  | 0               |
| Radiation dose ☢️ | mSv  | 3     | 40       | +0.67 (**REAL**)  | 30 or more | 40              |
| Waste 💩         | kg   | 40    | 300      | +10               | 240 or more | 300            |
| Coins 🪙 (science) | -  | 0     | -        | -                 | -          | goal: 100 by Sol 230 |

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

With the bundled May 2024 snapshot, the Solar Flare event falls on Sol 219, 220, 223 and 224 (X3.9, X5.8, X8.7, X3.4). The X1.0, X2.2 and X1.0 days become random-event days with a 1 mSv background dose, and random events fill the other eleven sols.

## Choices

Regular cards are in `src/engine/choices.ts` (14 cards); response cards are in `src/engine/events.ts` (18 cards). Each has `effects`, a kid-readable `description` and a real-world `lesson`. Design rules, tested in `src/engine/design-rules.test.ts`:

- Every regular card has at least one gain and one cost.
- Every response card has a cost of its own. Its gain may be the part of the event it prevents.
- No regular card is strictly better than another regular card, and neither response card to an event is strictly better than the other (counting the prevented impact).
- Title 32 characters or fewer, description 110 or fewer; event descriptions 160 or fewer.

## Win / loss

- **Win:** reach the end of Sol 230 with every meter safe and at least 100 Coins.
- **Loss:** power, oxygen, water or food at 0; radiation at 40 mSv; waste at 300 kg; or the coin goal missed at the end.
- The debrief teaches the lesson behind the loss reason (`LOSS_MESSAGES` in `src/ui/labels.ts`), the lesson of every card the player used, and one real NASA fact.

## Where we simplify reality (be honest about this)

| Real | In the game | Why |
| ---- | ----------- | --- |
| A sol is 24 h 39 min, and Mars dates do not line up with Earth dates | Each sol is mapped to one Earth date, so Sol 215 = 6 May 2024 | DONKI flares are listed by Earth date; one sol per date keeps the real data honest and simple |
| Radiation doses are small per day; NASA's career limit is 600 mSv | 40 mSv "mission budget" over 16 sols | 16 days of real dose would never threaten anyone; the budget makes radiation matter in a short game |
| Radiation storms come mainly from solar energetic particle events that often follow flares and CMEs | Flares above X3 are the Solar Flare event (+4 mSv unless sheltered); other flares add a background dose: C 0.1, M 0.5, X 1 mSv | Flares are easy to explain and well catalogued in DONKI |
| Meter amounts depend on crew size, hardware and mission design | Real units with game amounts | Real units teach what is measured; the amounts are tuned so every meter matters |
| Daily surface dose on Mars | **Real** published average (Gale Crater: 0.67 mSv per day) | Real data anchors the mechanic |
| Flare dates and classes | **Real** (DONKI snapshot, 2024-05-06 to 2024-05-21, verified) | Real data anchors the mechanic |

## Balance targets (check with `npm run sim`)

| Strategy | Target win rate | Current (2000 games, DONKI data, 2026-11-15) |
| -------- | --------------- | -------------------------------------------- |
| random | < 15% | 4.1% |
| coinRush (always the most coins) | < 10% | 0.0% |
| balanced (looks at every meter) | 70-85% | 81.2% |

Full table:

| strategy | win | lost: power | lost: oxygen | lost: water | lost: food | lost: radiation | lost: waste | lost: coins | avg dose mSv | avg coins |
| -------- | --- | ----------- | ------------ | ----------- | ---------- | --------------- | ----------- | ----------- | ------------ | --------- |
| random | 4.1% | 34.2% | 3.6% | 0.3% | 55.8% | 0.0% | 0.0% | 2.1% | 23.3 | 104 |
| coinRush | 0.0% | 57.1% | 0.0% | 0.0% | 42.9% | 0.0% | 0.0% | 0.0% | 16.8 | 162 |
| balanced | 81.2% | 0.1% | 16.5% | 1.1% | 0.2% | 0.0% | 0.0% | 0.9% | 33.8 | 125 |

Latest retune (see `docs/decisions.md`, 2026-11-15, "Start values, coins and flare cut-off"): new start values, flare event only above X3, coins about 1.5x, food daily -4 to -1 with warning 4 kg and max 40 kg, oxygen daily -7 to -9. Waste and radiation now rarely end a mission.

## Ideas backlog

- Difficulty levels (Cadet / Commander) that change the dose budget and daily changes.
- A "Mission Control" chart of real flare classes over the mission dates.
- Read-aloud mode (Web Speech API) for younger players.
- A CSA food-production mini-event.
- RadLab ISS dose comparison in the debrief ("today you got X - an ISS astronaut gets Y").
