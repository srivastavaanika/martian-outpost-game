# Asset manifest

Every image, sprite, sound, font and data file the game ships, with where it comes from and how it is credited. Add a row **before** adding the file; update `Status` when it lands. Phases refer to `.cursor/plans/new_game_layout_4b40858c.plan.md`.

Status values: `todo` (not started), `placeholder` (drawn in code or a temporary stand-in), `done` (final file in the repo and credited).

## Rules

- **Licences:** only public domain, CC0 or OFL (fonts). Art comes from [Kenney](https://kenney.nl/assets) CC0 packs plus our own simple original art (CC0). Anything else needs a `docs/decisions.md` entry first.
- **NASA imagery:** credit "NASA" plus the mission or centre (e.g. "NASA/JPL-Caltech/MSSS"). Never use the NASA logo (the "meatball" or "worm") - it is not covered by NASA's media guidelines. Never edit an image so it looks like a real photo of something that did not happen. The landing page combines separate real photos, so it is always captioned "put together by the game - not to scale".
- **Credit in-game:** see [Credits](#credits) below. A file without a credit row is not `done`.
- **Formats:** backgrounds as WebP (one wide ~1920x1080 and one portrait crop for 375 px phones); sprites packed into one texture atlas (PNG + JSON, e.g. free-tex-packer); icons as SVG.
- **Budget:** total art and audio about 3 MB, so the game loads on school devices. The Phaser scene and its assets are lazy-loaded; the landing page must not wait for them.
- **Audio:** off by default, starts only after the first tap, always with a visible mute button.
- **Accessibility:** no state shown by colour alone - every visual state also has an icon, number or text (`docs/content-guidelines.md`).
- **Phases 0-3 are drawn in code:** the landing page is SVG + CSS animated with Framer Motion, the gauges and coins are SVG and CSS, and crew and effects use Phaser Graphics, tweens and particles. The only files needed are `bg-outpost` (P1.13) and `fx-particle` (phase 2). Real art arrives in phase 4.

## Folder layout

Created when the first file lands.

| Path | Contents | Loaded by |
| ---- | -------- | --------- |
| `public/assets/backgrounds/` | Outpost picture and sky layers (WebP) | `MissionScreen` `<img srcset>`, by URL |
| `public/assets/sprites/` | Texture atlas: modules, crew, props, effects (PNG + JSON) | Phaser, by URL |
| `public/assets/audio/` | Sound effects and music (OGG + MP3 fallback) | Phaser, by URL |
| `public/assets/icons/` | Favicon, app icon, social sharing image | `index.html` |
| `src/assets/icons/` | Meter, coin, event and choice icons used by React components (SVG) | Vite import (bundled) |

## Fonts

| Id | Purpose | Phase | Source | Licence | Status |
| -- | ------- | ----- | ------ | ------- | ------ |
| `font-nunito` | Body and UI text. Self-hosted via `@fontsource/nunito` (latin, weights 400, 700, 800, 900), imported in `src/main.tsx` | 0 | [Fontsource](https://fontsource.org/fonts/nunito) | OFL 1.1 | done |
| `font-display` | Optional chunky heading font | 4 | Google Fonts / Fontsource | OFL 1.1 | todo |

## Landing page

Drawn in code until phase 4. The rocket flies from Earth to Mars in about 4 s; reduced motion shows the end state.

| Id | Purpose | Phase | Planned source | Licence | Status |
| -- | ------- | ----- | -------------- | ------- | ------ |
| `landing-stars` | Star field background: `public/assets/landing/space-stars-1920.webp` (463 KB) and `-960.webp` (114 KB) | 1 | Artemis II crew photo [art002e012588](https://images.nasa.gov/details/art002e012588); credit NASA | Public domain (NASA) | done |
| `landing-earth` | Earth, where the rocket starts: `planet-earth.webp` (640 px disc, 118 KB) | 1 | Apollo 17 [AS17-148-22727](https://images.nasa.gov/details/as17-148-22727), trimmed to a disc; credit NASA | Public domain (NASA) | done |
| `landing-mars` | Mars, where the rocket lands: `planet-mars.webp` (480 px disc, 30 KB) | 1 | Mars Global Surveyor [PIA04591](https://images.nasa.gov/details/PIA04591), trimmed to a disc; credit NASA/JPL/MSSS | Public domain (NASA) | done |
| `landing-planets` | Distant planets in the background | - | - | - | dropped 2026-11-15: replaced by the real star photo |
| `landing-rocket` | The rocket that flies Earth to Mars (drawn larger since 2026-11-15) | 1 (code), 4 | SVG, Kenney space kit or original | CC0 | placeholder (SVG in code) |

## Backgrounds

| Id | Purpose | States | Phase | Planned source | Licence | Status |
| -- | ------- | ------ | ----- | -------------- | ------- | ------ |
| `bg-outpost` | The outpost picture behind the meters: `public/assets/backgrounds/bg-outpost-1920.webp` (1920x960, 161 KB) and `bg-outpost-960.webp` (960x480, 45 KB). Captioned in-game as a drawing, not a photo | Wide; phones show a centre crop (`object-cover`) | 1 (P1.13) | NASA artist's concept [PIA23302](https://images.nasa.gov/details/PIA23302) "First Humans on Mars", cut to 2:1; credit NASA | Public domain (NASA) | done |
| `bg-mars` | Mars surface behind the outpost (1920x1080, 270 KB) | Wide | 1 (P1.12) | Curiosity Mastcam [PIA16101](https://images.nasa.gov/details/PIA16101), centre crop; credit NASA/JPL-Caltech/MSSS | Public domain (NASA) | replaced by `bg-outpost` (2026-11-15), file removed |
| `sky-sun` | Sun in the sky; flashes on flare sols | Normal, flare | 2 (placeholder), 4 | Original art | CC0 (ours) | todo |
| `sky-earth` | Earth as a small bright dot in the Mars sky (for Send data to Earth) | 1 | 4 | Original art or NASA Earth image | CC0 / public domain | todo |

## Outpost and modules

One module per meter, so the player can see what a choice costs. Levels (tank fill, battery bars, waste pile) are drawn by Phaser on top of a single frame.

| Id | Meter / card | States / frames | Phase | Planned source | Licence | Status |
| -- | ------------ | --------------- | ----- | -------------- | ------- | ------ |
| `hab-body` | Habitat dome | 1 + lights-dim tint | 1 (placeholder), 4 | Kenney space kit or original | CC0 | todo |
| `mod-solar` | Power: Clean the solar panels, dust storm | Clean, dusty, folded | 1 (placeholder), 4 | Kenney or original | CC0 | todo |
| `mod-battery` | Power level | Frame only | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-oxygen` | Oxygen: Make oxygen from water | Idle, running | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-tank` | Water level, pipe leak | Frame only + drip | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-recycler` | Water: Recycle the water | Idle, running | 4 | Original | CC0 | todo |
| `mod-greenhouse` | Food: Grow food, greenhouse accident | 3 growth stages, wilted | 1 (placeholder), 4 | Kenney or original | CC0 | todo |
| `mod-regolith` | Radiation: Pile soil on the habitat | Tileable strip, stacked | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-shelter` | Radiation: storm shelter, Dash to the bunker | Off, on | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-waste` | Waste: Squash the trash | Pile levels + squasher | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-lab` | Coins: Do a science experiment, discovery | Idle, active, sparkle | 1 (placeholder), 4 | Original | CC0 | todo |
| `mod-antenna` | Coins: Send data to Earth | 1 + beam | 1 (placeholder), 4 | Kenney or original | CC0 | todo |
| `prop-rover` | Drive the rover, supply drop, rover in a sand trap | Driving, stuck | 1 (placeholder), 4 | Kenney space kit | CC0 | todo |
| `prop-crate` | Collect a supply drop | 1 | 4 | Kenney | CC0 | todo |
| `prop-drill` | Dig up ice, drill hits bedrock | Idle, drilling, sparks | 1 (placeholder), 4 | Original | CC0 | todo |
| `prop-repair-bot` | Crack in the dome: repair bots | Idle, crawling | 2 (placeholder), 4 | Original | CC0 | todo |

## Crew

| Id | Purpose | States / frames | Phase | Planned source | Licence | Status |
| -- | ------- | --------------- | ----- | -------------- | ------- | ------ |
| `crew-a`, `crew-b`, `crew-c` | 3 astronauts with different appearances | Indoor: idle, walk (4-6), working, cheer | 1 (placeholder), 4 | Kenney or original | CC0 | todo |
| `crew-suit` | Spacesuit for outside cards (shows the radiation cost of going out) | Idle, walk (4-6), working | 2 (placeholder), 4 | Kenney or original | CC0 | todo |
| `crew-tools` | Brush, shovel, wrench, drill held during actions | 1 each | 4 | Original | CC0 | todo |
| `crew-dosimeter` | Radiation badge for the dose meter | 1 | 4 | Original | CC0 | todo |

## Effects

| Id | Purpose | Phase | Planned source | Licence | Status |
| -- | ------- | ----- | -------------- | ------- | ------ |
| `fx-particle` | Soft white dot, tinted in Phaser for flare particles, dust, bubbles, sparkles | 2 | Original (generated) | CC0 (ours) | todo |
| `fx-flash` | Full-screen flare flash (a Phaser rectangle) | 2 | Phaser Graphics | - | placeholder |
| `fx-dust-wall` | Dust storm rolling in | 2 (code), 4 | Particles / original | CC0 | todo |
| `fx-snow` | Dry-ice snowstorm | 2 (code), 4 | Particles | CC0 | todo |
| `fx-crack` | Crack in the dome | 2 (code), 4 | Original | CC0 | todo |
| `fx-drip` | Pipe leak | 2 (code), 4 | Particles | CC0 | todo |
| `fx-sand` | Rover sinking in a sand trap | 2 (code), 4 | Particles | CC0 | todo |
| `fx-sparkle` | Scientific discovery, drill sparks | 2 (code), 4 | Particles | CC0 | todo |

## Icons

Replace emoji so icons look the same on every device and match the art. Keep a text label next to every icon.

| Id | Purpose | Count | Phase | Planned source | Licence | Status |
| -- | ------- | ----- | ----- | -------------- | ------- | ------ |
| `ui-gauge` | Meter gauge: segmented fill bar with a striped danger zone (`src/ui/ResourceGauge.tsx`; replaces `ui-dial`) | 1 | 1 | CSS drawn in code | CC0 (ours) | done |
| `icon-resource-*` | Power, oxygen, water, food, radiation dose, waste | 6 | 4 | Kenney game icons or original SVG | CC0 | placeholder (emoji) |
| `icon-coin` | Coins (science): a gold coin and a growing coin pile (`src/ui/Coin.tsx`) | 2 | 1 | Original SVG drawn in code | CC0 (ours) | done |
| `icon-warning` | Meter warning (paired with "Low!" / "Too high!") | 1 | 3 | Kenney or original | CC0 | placeholder (emoji) |
| `icon-event-*` | One per event in `src/engine/events.ts` | 10 | 4 | Kenney or original | CC0 | placeholder (emoji) |
| `icon-choice-*` | One per card: 13 regular + 18 response (optional - emoji may stay) | 31 | 4 | Kenney or original | CC0 | placeholder (emoji) |

## Audio (optional)

| Id | Purpose | Phase | Planned source | Licence | Status |
| -- | ------- | ----- | -------------- | ------- | ------ |
| `sfx-tap` | Button / card tap | 4 | [Kenney audio](https://kenney.nl/assets?q=audio) | CC0 | todo |
| `sfx-good` | Meter improved | 4 | Kenney audio | CC0 | todo |
| `sfx-warning` | Gentle meter warning (not alarming) | 4 | Kenney audio | CC0 | todo |
| `sfx-flare` | Flare alert | 4 | Kenney audio | CC0 | todo |
| `sfx-event-*` | One short sound per random event (wind, drip, crack...) | 4 | Kenney audio / freesound CC0 | CC0 | todo |
| `sfx-win`, `sfx-lose` | Debrief jingles (the lose sound stays encouraging) | 4 | Kenney audio | CC0 | todo |
| `amb-base` | Quiet base hum | 4 | Kenney audio / freesound CC0 | CC0 | todo |

## Sharing and submission

| Id | Purpose | Phase | Source | Status |
| -- | ------- | ----- | ------ | ------ |
| `logo-title` | "Martian Odyssey" wordmark for the landing page (SVG; the heading text stays as its accessible name) | 4 | Original | todo |
| `favicon` | Browser tab icon (SVG + PNG), derived from `logo-title` | 4 | Original | todo |
| `app-icon` | Home-screen icon | 6 | Original | todo |
| `og-image` | Social sharing image (1200x630) | 6 | Screenshot of the game | todo |
| `screenshots` | `docs/screenshots/` for README and project page (currently `start.png`, `mission.png`, from the old layout) | 6 | Captured from the game | placeholder |
| `demo-video` | 30-60 s video: the landing, one event with its trade-off, and one real flare | 6 | Screen recording | todo |

## Data assets

Not art, but judged. Each needs a row in `docs/data-sources.md` and `src/data/sources.ts`.

| Id | Purpose | Phase | Source | Status |
| -- | ------- | ----- | ------ | ------ |
| `data-donki` | Verified flare snapshot `src/data/space-weather.json` (2024-05-06 to 2024-05-21, 126 flares) | 0 | `npm run data:fetch` (NASA DONKI via CCMC) | done |
| `data-radlab` | ISS dose comparison for the debrief | 5 | OSDR RadLab | todo |
| `data-osdr` | 3-5 real study entries for facts (`src/data/osdr-studies.json`) | 5 | NASA OSDR search API | todo |

## Credits

How a finished asset is credited in-game:

- **NASA images and data:** add an entry to `src/data/sources.ts` (shown on the Data Sources screen) and a row in `docs/data-sources.md` with the image ID, mission and credit line.
- **Non-NASA assets** (Kenney packs, fonts, original art): list them in an "Art and sound credits" section on the Data Sources screen. CC0 does not require credit, but we give it anyway.
- When the first real asset lands, add that section to `src/ui/DataSourcesScreen.tsx` and fill it from this manifest.
