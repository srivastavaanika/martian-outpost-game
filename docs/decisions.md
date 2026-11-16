# Decision log

Add newest entries at the top. Keep each to a few lines: context, decision, consequence.

## 2026-11-15 - Scene shows visual effects only, no floating numbers

- **Context:** feedback - the numbers flashing in the middle of the picture distract from the animation.
- **Decision:** `CuePlayer` plays only the visual effects: the flare glow and the event effects (dust, snow, drip, wilt, sand, sparks, crack, sparkle). It no longer draws the meter-change, "Saved", "Crew outside" or flare-class labels, and the event effect now starts straight away instead of after them. The cue data in `cues.ts` (values and narration) is unchanged and still tested, so the labels can come back or feed a screen-reader live region later.
- **Consequence:** players read changes on the meters and in the mission log; the real flare class and date stay in the event panel and the mission log.

## 2026-11-15 - Coins earned more slowly

- **Context:** feedback - coins pile up too fast. After the 1.5x raise, four coin cards reached the goal of 100, and balanced play averaged 125 coins (coin-rush 162).
- **Decision:** every coin reward cut to about 0.8x; the goal stays 100. Regular cards: experiment 22 to 18, rover 38 to 30, send data 30 to 24, supply drop 4 to 3. Response cards: finish tasks first 9 to 6, leave panels out 6 to 4, toss the plants 9 to 6, rescue the gear 8 to 6, leave it stuck 8 to 6, tow it out 15 to 12, move the drill 6 to 4, celebrate and tell Earth 30 to 24, high-five 18 to 14. A deeper cut (about 0.7x, experiment 16 / rover 28 / send data 22) dropped balanced to 66.2%, below target.
- **Consequence:** balanced 81.2% to 71.1% (avg coins 125 to 115), random 4.1% to 2.2%, coinRush 0% to 0%. Balanced now takes more coin cards, so oxygen losses rise (16.5% to 23.6%). Balanced sits at the bottom of its 70-85% target; if it needs more room, ease oxygen daily use rather than raising coins.

## 2026-11-15 - The .plan.md is the source of truth for the phased plan

- **Context:** `docs/roadmap-2d.md` had replaced `.cursor/plans/new_game_layout_4b40858c.plan.md` (S0.1), but the user treats the plan file as the source of truth, and two copies drift apart.
- **Decision:** the plan file holds the live checklist again, rebuilt from the current roadmap. `docs/roadmap-2d.md` is a one-line pointer so old links still work; AGENTS.md, system-design, assets and the scene skills point to the plan. The original draft content tables are kept as a superseded appendix.
- **Phase 2+ rescoped for the painted base (PIA23302) and the card flip:** P1.14 added for the feedback round; cues play after Next sol, deltas before the new event (P2.3); crew sprites replaced by a "crew outside" marker (P2.6); flare check moved to Sol 219 (P2.7); event effects are overlays (P2.9); P3.1 and P4.6 optional; P4.5 becomes an effects atlas; P5.4 can run early.

## 2026-11-15 - Start values, coins and flare cut-off

- **Context:** feedback - new start values (power 80, oxygen 250, water 7, food 10, radiation 3, waste 40), more coins per card so 100 is reachable, a card to reduce waste, and only flares above X3 should trigger the Solar Flare event.
- **Decision:**
  - Only DONKI flares above X3 become the Solar Flare event (`FLARE_EVENT_MIN_X`). Weaker X flares add a 1 mSv background dose (was 4) so an unavoidable hit is not harsher than the avoidable event. The event itself stays +4 mSv (`FLARE_EVENT_DOSE_MSV`).
  - Coins on every coin-giving card raised about 1.5x (e.g. experiment 15 to 22, rover 25 to 38, send data 20 to 30).
  - New regular card "Melt trash into tiles" (power -8, water +0.1, waste -25).
  - Food 10 kg was below its 35 kg warning (the game would start in warning and break `roomBeforeWarning`), and lasted 2 sols at -4/sol (balanced won 12%). Food is now warning 4 kg, daily -1, max 40 kg (so the bar is not almost empty).
  - With the more generous starts and coins, balanced won 96-98%; oxygen daily -7 to -9 (a crew of 10 breathes more) brought it back to target.
- **Consequence:** balanced 76.1% to 81.2%, random 2.1% to 4.1%, coinRush 0% to 0%. Waste and radiation rarely end a mission now; oxygen and food carry most of the pressure.

## 2026-11-15 - Welcome page: real space photos, new text, Sol 215-230

- **Context:** feedback on the welcome page - use real images of space, Earth and Mars, a bigger rocket, new welcome text, no NASA data reference on that page, and a "Let's GO!" button.
- **Decision:**
  - The drawn planets and dots are replaced by three real NASA photos (Artemis II Milky Way, Apollo 17 Earth, Mars Global Surveyor Mars). No single photo shows Earth and Mars together, so the page captions them "Real NASA photos ... Put together by the game - not to scale". This replaces the rule that landing planets stay illustrated.
  - The DONKI badge and the LIVE space-weather line are removed from the welcome page. DONKI is still credited on the mission screen's event panel and the Data Sources screen. `LiveSpaceWeather.tsx` is kept but is not shown anywhere for now.
  - The new text starts on Sol 215 and ends before Sol 230, so the whole mission now shows as Sol 215-230 (`SOL_DISPLAY_OFFSET` 213 to 214). The Earth dates (6-21 May 2024) and the real flare days do not change.
  - "Let's GO!" replaces "Enter"; buttons on the page show the hand cursor (Tailwind 4 does not set it for buttons).
- **Consequence:** `public/assets` grows to 916 KB (budget 3 MB). Older log entries and ticked roadmap steps still say Sol 214-229; they are history.

## 2026-11-15 - Mission screen redesign after UI feedback: outpost picture, meters on top, gauges, gold coins

- **Context:** feedback on Phase 1 - the scene looked poor (drawn boxes on a Mars photo), the dials were a weak visual cue, coins were an emoji, and every meter appeared twice (status bar and scene panels). The request was a full-screen picture of a real Mars outpost.
- **Decision:**
  - No real Mars outpost exists, so there is no photo of one. We use NASA's artist's concept PIA23302 ("First Humans on Mars") full width, captioned as a drawing, not a photo. The real Curiosity photo PIA16101 is retired.
  - The picture is a responsive HTML image (960 px and 1920 px WebP), so it stays sharp; the Phaser canvas is a transparent 960x480 layer above it. Both cover the same 2:1 box from the centre (`object-cover` / `Scale.ENVELOP`), so scene positions stay on the picture.
  - The meters, coins and sol sit on top of the picture and appear nowhere else. The scene no longer draws value panels, the dome or the placeholder crew; it keeps invisible tap areas over matching parts of the picture and the `?e2e` snapshot.
  - Dials became `ResourceGauge`s: icon, value with unit and a segmented fill bar with a striped danger zone, plus ⚠️ "Low!" / "Too high!" text. Phones show one compact row at the bottom of the picture (name in the tooltip and `aria-label`); `md` and up show names, at the top.
  - Coins are SVG gold coins (`src/ui/Coin.tsx`): a pile that grows one coin per tenth of the goal, and a coin icon in card chips and the debrief.
- **Consequence:** Phase 2 cues must draw over a detailed illustration. Crew walking (P2.6) needs new crew art, and module cues should anchor on `MODULES` in `src/scene/config.ts`, which now follows the picture.

## 2026-11-15 - Phase 1 build choices: Phaser 3, a real Gale Crater photo, a read-only test hook

- **Context:** Phase 1 adds the scene, the landing page and the dials.
- **Decision:**
  - Phaser 3.90 (`^3.90.0`), loaded with `import()` only after Enter; the landing page never downloads it. The dev server pre-bundles it (`optimizeDeps`) so the first mission does not trigger a reload.
  - The background is Curiosity's PIA16101 panorama of Mount Sharp - Gale Crater, where the real radiation baseline was measured. The 16:9 crop comes from the centre of the mosaic, avoiding its black gaps; nothing was added or removed. The credit sits under the scene and on the Data Sources screen.
  - `?seed=N` replays a mission; `?e2e` exposes a frozen `window.__MARTIAN_ODYSSEY__` snapshot of what the scene shows, so Playwright checks the canvas without pixel comparisons.
  - The DONKI client tries CCMC before `api.nasa.gov`, because the latter returns 404 for flares and logged a console error on every page load.
- **Consequence:** the Phaser chunk is 321 kB gzip (lazy). The phone layout still needs work (P3.5).

## 2026-11-15 - Landing page and three-row mission layout

- **Context:** the game should open like a story and feel like a place, not a form.
- **Decision:** a landing page (rocket flying from Earth to Mars, welcome text, Enter) and a three-row mission screen: status bar (six dials with tooltips, coins, sol, events panel), the Phaser scene (largest), and the four cards. The real Mars background moves from Phase 4 to Phase 1 (P1.12 = P4.4), because the middle row needs it from the start. One combined checklist replaces the old roadmap (`docs/roadmap-2d.md`).
- **Consequence:** Phase 1 grows from 9 to 12 steps; the cards stay the accessible controls.

## 2026-11-15 - Six meters, 16 sols, an event every sol

- **Context:** the new layout shows dials in real units, and every sol should feel like a story beat with a real trade-off, not just a list of chores.
- **Decision:** six meters: power (kWh), oxygen (kg), water (kL), food (kg) fail at 0; radiation dose (mSv) and waste (kg) fail at a ceiling (40 mSv, 300 kg). Each has a warning level. Shielding is no longer a resource; the radiation dose meter replaces it. The mission is 16 sols, shown as Sol 214 to Sol 229 (display offset only). Every sol has one event: calm on the first sol, the Solar Flare event when DONKI lists a real X-class flare that day, otherwise one of 8 random events, with no repeats until all eight are used. Each sol offers 4 cards: the event's 2 response cards, 1 recovery card for the meter with the least room before its warning level, and 1 coin card. Response cards prevent all, half or none of the event's impact (`avoids`). Science is shown to players as Coins.
- **Trade-off accepted:** the brief recommends 2-3 resources. `design-rules.test.ts` now allows six. Response cards count the impact they prevent as their gain, but must still have a cost of their own. Two response cards to the same event may not dominate each other.
- **Tuning (`npm run sim`, 2000 games):** oxygen use -10 to -7 kg/sol, water use -0.35 to -0.25 kL/sol, coin goal 120 to 100, waste start 100 to 130 kg. Balanced 76.1%, random 2.1%, coin-rush 0%. Food and oxygen reach warnings but almost never end a mission.
- **Consequence:** the scene and dial work in later phases read `state.event` and `report.impactApplied` / `avoidedImpact`.

## 2026-11-15 - DONKI flares fetched from CCMC

- **Context:** `api.nasa.gov/DONKI/FLR` returns 404 even with a personal key; the old `kauai.ccmc` host is gone.
- **Decision:** `src/data/donki.ts` tries `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR` first (no key needed) and keeps `api.nasa.gov` as the fallback. Trying `api.nasa.gov` first logged a 404 on every page load and sent the API key for nothing. The in-game LIVE panel works again; the bundled snapshot is real and verified. `npm run sim` / `data:fetch` run as `node --import tsx` so they also work in sandboxed shells.
- **Consequence:** the snapshot (2024-05-06 to 05-21) is now real DONKI data, not curated.

## 2026-11-15 - Game title: Martian Odyssey

- **Context:** the game used the challenge's name ("Junior Astronaut Mission Trainer") as its title. Now that it is Mars-only and becoming a 2D game, it needs its own identity.
- **Decision:** the game is called **Martian Odyssey**. The challenge name is kept only where it refers to the NASA Space Apps challenge (links, `docs/challenge-brief.md`, the project page subtitle). The rename is scheduled in phase 0 of `docs/roadmap-2d.md`.
- **Consequence:** UI heading, page title, README, `package.json` name and the Playwright heading check change together; a title wordmark (`logo-title`) joins the asset list.

## 2026-11-15 - Mars only (Moon site removed)

- **Context:** the brief allows a lunar _or_ Martian outpost. Two sites doubled the art, data and balance work for the 2D scene, and the Moon baseline came from a non-NASA instrument (Chang'e-4).
- **Decision:** the game is a Mars outpost only. `SiteId` is `'mars'` and `SITES` has one entry; the site structure is kept so another site could return later. The start screen shows one Mars mission card instead of a site picker. Choice lessons that mentioned the Moon now talk about Mars.
- **Consequence:** Mars balance is unchanged. One background and one radiation baseline (Curiosity RAD, NASA) to source and verify. Less contrast to teach ("the Moon gets more radiation than Mars" is gone).

## 2026-11-15 - 2D base scene with Phaser, on top of the turn-based engine

- **Context:** we want the game to feel like a 2D game, not only a dashboard, while keeping the judged strength: a real, testable trade-off mechanic.
- **Decision:** add a Phaser scene (`src/scene/`, mounted by `src/ui/PhaserGame.tsx`) that renders `GameState` and each sol's report. The engine is unchanged and stays turn-based; the scene never computes rules, and choice cards remain the accessible controls. Chosen over SVG + Framer Motion and PixiJS because Phaser leaves room for animated crew and later mini-games. Plan: `docs/roadmap-2d.md`.
- **Consequence:** a larger bundle (lazy-loaded) and a React-Phaser bridge to maintain. Balance retuning and data verification come before any art.

## 2026-11-14 - Four cards per day, one always science (card mix superseded 2026-11-15)

- **Context:** with 3 cards and only one guaranteed (recovery) slot, a science card appeared on only about half the days, and missing the science goal was the top loss reason.
- **Decision:** `RULES.choicesPerSol = 4`. Slots: one card restoring the lowest survival resource, one random science card (experiment, rover or send data), and two random cards from the rest. The four are shuffled.
- **Consequence:** every day now asks "keep the crew safe, or do the science?" Balanced play wins about 98-99% (too easy - retune pending), random about 13-14%, science-rush 0%. Four cards is more reading for young players; check in playtests.

## 2026-11-14 - Split life support into air, water and food (superseded 2026-11-15)

- **Context:** a single "Air & Food" bar hid that water is missing and that these systems depend on each other (electrolysis turns water into oxygen; plants need water).
- **Decision:** five resources: power, air, water, food, shielding. Power, air, water and food end the mission at 0. New cards: Recycle the water, Dig up ice, Collect a supply drop. The guaranteed recovery card now targets the lowest survival resource.
- **Trade-off accepted:** the brief says _"two or three core resources ... are usually more effective than five or six"_. The design-rule test now allows up to five. Watch playtests with 7-9 year olds; if they struggle, group air/water/food visually or offer a "Cadet" mode with fewer bars.
- **Consequence:** balance is roughly unchanged (balanced about 64%, random under 5%), but water and food rarely end a game yet - see the balance table in `docs/game-design.md`.

## 2026-11-13 - Guarantee one recovery choice per sol (target meter rule changed 2026-11-15)

- **Context:** with 3 random choices out of 9, some sols offered nothing that restores power or life support, so careful players lost to bad luck.
- **Decision:** `offerChoiceIds` always includes at least one choice with a positive power or lifeSupport effect. (Superseded on 2026-11-14: it now targets the lowest survival resource.)
- **Consequence:** the balanced strategy's win rate rose from about 50% to about 62%; random play stayed under 7%.

## 2026-11-13 - Game-scaled radiation budget instead of NASA's career limit

- **Context:** real daily doses (0.67-1.37 mSv) over 12 days are far below NASA's 600 mSv career limit, so radiation would never matter.
- **Decision:** use a 40 mSv "mission budget" and game-scaled flare doses, while keeping site baselines and flare dates and classes real. This is stated in-game and in `docs/game-design.md`.

## 2026-11-13 - Bundle a snapshot; live data is optional and labelled

- **Context:** the brief warns against presenting static data as live. DONKI was unreachable when the project was scaffolded.
- **Decision:** the mission always runs on `src/data/space-weather.json` (labelled "not live"). A separate panel on the start screen shows LIVE DONKI data when reachable.

## 2026-11-13 - React UI with a pure TypeScript engine (no game engine)

- **Context:** the game is turn-based decisions and dashboards, not real-time graphics; it's a hackathon timeline.
- **Decision:** Vite + React + Tailwind + Framer Motion + Zustand; the engine is framework-free in `src/engine` so it can be unit-tested and simulated.
- **Consequence:** Phaser (or React Three Fiber) can still be embedded later for a mini-game, reusing the same engine.

## 2026-11-13 - Three core resources (superseded 2026-11-14)

- **Decision:** power, life support and shielding, following the brief's "two or three core resources". Radiation dose and science are outcomes.
