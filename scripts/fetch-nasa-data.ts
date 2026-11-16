/**
 * Replaces src/data/space-weather.json with a real DONKI solar-flare snapshot.
 *
 *   npm run data:fetch                          # default range (May 2024 storm)
 *   npm run data:fetch -- 2024-10-01 2024-10-12 # custom range; sol 1 = start date
 *
 * Reads VITE_NASA_API_KEY from the environment or .env (falls back to DEMO_KEY).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchDonkiFlares } from '../src/data/donki';
import { RULES } from '../src/engine/config';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readApiKey(): string {
  if (process.env.VITE_NASA_API_KEY) return process.env.VITE_NASA_API_KEY;
  const envFile = resolve(root, '.env');
  if (existsSync(envFile)) {
    const match = readFileSync(envFile, 'utf8').match(/^VITE_NASA_API_KEY=(.*)$/m);
    if (match?.[1]) return match[1].trim();
  }
  return 'DEMO_KEY';
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const start = process.argv[2] ?? '2024-05-06';
const end = process.argv[3] ?? addDays(start, RULES.maxSols - 1);

console.log(`Fetching DONKI flares ${start} -> ${end} ...`);
try {
  const events = await fetchDonkiFlares(start, end, readApiKey(), { timeoutMs: 30000 });
  const fetchedAt = new Date().toISOString();

  mkdirSync(resolve(root, 'data-raw'), { recursive: true });
  writeFileSync(resolve(root, 'data-raw', `donki-flr-${start}_${end}.json`), JSON.stringify(events, null, 2));

  const snapshot = {
    meta: {
      source: 'donki',
      isLive: false,
      verified: true,
      fetchedAt,
      range: { start, end },
      missionStartDate: start,
      note: `Snapshot of NASA DONKI solar flare (FLR) data fetched ${fetchedAt.slice(0, 10)}.`,
    },
    events,
  };
  writeFileSync(resolve(root, 'src/data/space-weather.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  const counts = events.reduce<Record<string, number>>(
    (acc, e) => ({ ...acc, [e.flareClass]: (acc[e.flareClass] ?? 0) + 1 }),
    {},
  );
  console.log(`Wrote ${events.length} flares to src/data/space-weather.json`, counts);
  console.log('Next: run `npm run sim` to re-check balance against the new data.');
} catch (error) {
  console.error(`Failed: ${(error as Error).message}`);
  console.error('The existing snapshot was left unchanged.');
  process.exit(1);
}
