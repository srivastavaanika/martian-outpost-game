# 🚀 Martian Odyssey

_A Junior Astronaut Mission Trainer for NASA Space Apps 2026._

A browser game for kids aged 7-12, built for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/).

You are the captain of Martian Outpost Odyssey. From Sol 215 to Sol 230 (16 sols), something happens every day - a real solar flare from NASA's records, a dust storm, a leaking pipe - and you choose what the crew does. Keep power, oxygen, water, food, radiation and waste safe, and earn coins from science. **Every choice helps something and costs something.**

## Quick start

```bash
npm install            # Node 20 or newer
cp .env.example .env   # optional: add a free key from https://api.nasa.gov
npm run dev
```

## Scripts

| Command              | What it does                                                                     |
| -------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`        | Dev server with hot reload                                                       |
| `npm run check`      | Type-check, lint and unit tests                                                  |
| `npm run sim`        | Play thousands of simulated games and print win rates per strategy               |
| `npm run data:fetch` | Download a fresh solar-flare snapshot from NASA DONKI                            |
| `npm run test:e2e`   | Playwright smoke test (run `npx playwright install chromium` once)               |
| `npm run build`      | Production build in `dist/` (static - deploy to GitHub Pages, Netlify or Vercel) |

## Real NASA data

| Source                                                           | Used for                                     |
| ---------------------------------------------------------------- | -------------------------------------------- |
| [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/)                 | Solar flares that drive the radiation storms |
| [Curiosity RAD](https://science.nasa.gov/mission/msl-curiosity/) | Daily radiation on the Mars surface          |
| [OSDR](https://osdr.nasa.gov/)                                   | Astronaut health facts in the debrief        |

Details, citations and what is real versus game-tuned: [`docs/data-sources.md`](docs/data-sources.md). The meters use real units (kWh, kg, kL, mSv), but the amounts are game numbers, except the daily Mars radiation baseline.

The bundled `src/data/space-weather.json` is a real DONKI snapshot of the May 2024 solar storm (2024-05-06 to 2024-05-21), fetched 2026-11-15. It is always labelled as a snapshot, never as live data.

> Vite copies any `VITE_` variable from `.env` into the built JavaScript, so a key in `VITE_NASA_API_KEY` is public on a deployed site. Use a free key you are happy to share, or leave it unset.

## Working with AI tools

Start with [`AGENTS.md`](AGENTS.md). Project skills are in `.cursor/skills/`.
