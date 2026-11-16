# Data sources

Rule: **never present invented numbers as real, and never present a snapshot as live.** Each value below is tagged **REAL** (published measurement or catalogue), **CURATED** (real-world events picked by hand, pending verification) or **GAME** (balance tuning).

When you add or change a source: update this file, `src/data/sources.ts` (shown in-game) and, if relevant, the `[REAL]` comments in `src/engine/config.ts`.

## 1. DONKI - Space Weather Database Of Notifications, Knowledge, Information

- **What:** NASA CCMC's catalogue of solar flares (FLR), coronal mass ejections (CME), solar energetic particle events (SEP) and geomagnetic storms (GST).
- **Used for:** which days of the mission have solar flares, and how strong they are (C/M/X class).
- **Endpoints** (implemented in `src/data/donki.ts`, tried in this order):
  - `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=...&endDate=...` - no key needed, and browsers can call it (the LIVE panel uses it). The old `kauai.ccmc.gsfc.nasa.gov` host no longer answers.
  - `https://api.nasa.gov/DONKI/FLR?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&api_key=KEY` - fallback; needs a key from <https://api.nasa.gov> (`DEMO_KEY` is heavily rate-limited). Sends `access-control-allow-origin: *`, so browsers can call it.
  - **Status 2026-11-15:** `api.nasa.gov/DONKI/FLR` returns 404 even with a personal key (its proxy points at a missing path), while `api.nasa.gov/DONKI/notifications` still works. The snapshot below was fetched from the CCMC endpoint. The key goes in `.env` as `VITE_NASA_API_KEY` (git-ignored).
- **Fields used:** `flrID`, `peakTime` (falls back to `beginTime`), `classType` (e.g. `"X5.8"`). The first letter gives the class; A/B flares are ignored.
- **Sample record:**

  ```json
  {
    "flrID": "2024-05-11T01:10:00-FLR-001",
    "beginTime": "2024-05-11T01:10Z",
    "peakTime": "2024-05-11T01:23Z",
    "endTime": "2024-05-11T01:39Z",
    "classType": "X5.8",
    "sourceLocation": "S15W45",
    "activeRegionNum": 13664
  }
  ```

  (Shape is illustrative; check against a real response when you fetch one.)

- **Bundled snapshot:** `src/data/space-weather.json`.
  - **Current status: REAL (DONKI, verified).** Fetched 2026-11-15 with `npm run data:fetch -- 2024-05-06 2024-05-21`: 126 flares (15 X, 108 M, 3 C) from the May 2024 storm, covering the 16 sols (Sol 215 = 2024-05-06, Sol 230 = 2024-05-21). X-class flares fall on 05-06, 05-08 to 05-12, 05-14 and 05-15.
- **Game mapping (GAME):** a sol whose strongest flare is above X3 (the cut-off is a game number) gets the Solar Flare event (+4 mSv if no response card handles it): Sol 219 (X3.9), 220 (X5.8), 223 (X8.7) and 224 (X3.4). Otherwise the day's strongest flare adds a background dose: C 0.1, M 0.5, X 1 mSv. Sol 215 is always the calm welcome sol, so its real X4.5 flare adds the background X dose (1 mSv) instead (`config.ts`, `engine.ts`).
- **Attribution text:** "Solar flare data: NASA Community Coordinated Modeling Center (CCMC), DONKI."

## 2. Surface radiation baseline (REAL)

| Site              | Value                         | Source                                                                              |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| Mars, Gale Crater | ~0.67 mSv/day dose equivalent | Curiosity Radiation Assessment Detector (RAD); Hassler et al., _Science_ 343 (2014) |

The game is Mars-only (see `docs/decisions.md`, 2026-11-15). The earlier Moon baseline (Chang'e-4 LND, 1.37 mSv/day) was removed with the Moon site.

**TODO (verify):** confirm the value and the wording against the paper before submission.

## 3. NASA OSDR - Open Science Data Repository

- **What:** NASA's archive of space biology and astronaut health studies (GeneLab + ALSDA).
- **Search API:** `https://osdr.nasa.gov/osdr/data/search?term=<keyword>&type=cgene&size=<n>` (see the OSDR API docs).
- **Used for:** kid-friendly health facts in the debrief (`src/data/facts.ts`). Every fact has `verified: false` until a teammate checks the wording against the cited source.
- **Next step:** pull 3-5 real study titles or findings (search terms: `bone`, `muscle`, `radiation`, `sleep`) into a `src/data/osdr-studies.json` snapshot with study IDs, and link them from the facts.

## 4. RadLab (OSDR radiation dosimetry) - planned

- **What:** ISS dosimeter measurements (e.g. absorbed dose rate) from several space agencies.
- **Planned use:** a debrief comparison: "your crew got X mSv per day - astronauts on the ISS get about Y". Needs a small curated snapshot with instrument, date range and units.

## 5. NASA Human Research Program (facts)

- NASA career radiation limit: **600 mSv** (NASA-STD-3001, Vol. 1, Rev. B, 2022). Facts sourced here are listed in `facts.ts`.

## 6. Outpost picture (NASA artist's concept - NOT a photo)

- **Image:** [PIA23302](https://images.nasa.gov/details/PIA23302), "First Humans on Mars (Artist's Concept)", [JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA23302). Credit: **NASA**. Public domain (NASA media guidelines).
- **Why this one:** no Mars outpost exists yet, so there is no real photo of one. This is NASA's own illustration of a future base (habitats, a pressurised rover, astronauts) - the closest honest match. The game always labels it as a drawing: the caption under the picture and the Data Sources screen both say "artist's concept ... not a photo".
- **What we did:** cut 16 px from the top and bottom of the 10224x5144 original to make it exactly 2:1, resized to 1920x960 and 960x480, saved as WebP (`public/assets/backgrounds/bg-outpost-1920.webp`, 161 KB; `bg-outpost-960.webp`, 45 KB). No content was added or removed.
- **In-game credit:** `src/data/sources.ts` (`mars-background`), the caption on the mission screen, and the Data Sources screen.
- **Replaced (2026-11-15):** the Curiosity Mastcam photo [PIA16101](https://images.nasa.gov/details/PIA16101) (NASA/JPL-Caltech/MSSS) of Mount Sharp. It was a real photo of Mars but had no outpost in it; see `docs/decisions.md`.

## 7. Welcome page photos (REAL images, put together by the game)

All three are public domain (NASA media guidelines). The game places them in one scene; the caption says "Real NASA photos ... Put together by the game - not to scale", because Earth and Mars were never photographed together like this.

- **Stars:** [art002e012588](https://images.nasa.gov/details/art002e012588), "Starstruck" - the Milky Way photographed by the Artemis II crew, 2026-04-07. Credit: **NASA**. Resized to 1920 and 960 px wide WebP (`public/assets/landing/space-stars-*.webp`, 463 KB and 114 KB).
- **Earth:** [AS17-148-22727](https://images.nasa.gov/details/as17-148-22727), "The Blue Marble", Apollo 17, 1972-12-07. Credit: **NASA**. Black border trimmed, cut out as a disc, 640 px WebP with transparency (`planet-earth.webp`, 118 KB).
- **Mars:** [PIA04591](https://images.nasa.gov/details/PIA04591), "Mars 2003", Mars Global Surveyor MOC. Credit: **NASA/JPL/Malin Space Science Systems**. Black border trimmed, cut out as a disc, 480 px WebP with transparency (`planet-mars.webp`, 30 KB).
- **In-game credit:** the caption on the welcome page, `src/data/sources.ts` (`landing-stars`, `landing-earth`, `landing-mars`) and the Data Sources screen.

## Images and art

Every planned image, sprite, sound and font, with its source, licence and credit, is tracked in `docs/assets.md`.

- NASA images from <https://images.nasa.gov> are generally public domain; credit "NASA" (and the mission or centre when given). Do not use the NASA logo (the "meatball" or "worm") - it's not covered by the media guidelines.
- UI icons are emoji for now; replacements should be open-licensed (Kenney.nl CC0, etc.).
