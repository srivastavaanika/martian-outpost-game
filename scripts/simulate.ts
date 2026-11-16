/**
 * Plays thousands of headless missions with simple strategies and prints win rates.
 * A healthy balance: random play rarely wins, a single-minded strategy fails,
 * and a balanced "think about every meter" strategy usually wins.
 *
 *   npm run sim            # 2000 games per strategy
 *   npm run sim -- 10000   # custom game count
 */
import {
  applyChoice,
  CHOICES_BY_ID,
  createGame,
  RESOURCE_KEYS,
  roomBeforeWarning,
  RULES,
  SITES,
} from '../src/engine';
import type { GameState, LossReason, SiteId } from '../src/engine';
import { SPACE_WEATHER_EVENTS, SPACE_WEATHER_META } from '../src/data';

type Strategy = (state: GameState, rng: () => number) => string;

function scoreAfter(state: GameState, choiceId: string): number {
  const next = applyChoice(state, choiceId, SPACE_WEATHER_EVENTS);
  if (next.status === 'lost') return -1000;
  if (next.status === 'won') return 1000;
  const rooms = RESOURCE_KEYS.map((key) => roomBeforeWarning(key, next.resources[key]));
  const solsLeft = next.maxSols - next.sol + 1;
  const scienceNeeded = Math.max(0, RULES.scienceGoal - next.science);
  return Math.min(...rooms) * 60 + rooms.reduce((sum, room) => sum + room, 0) * 5 - (scienceNeeded / solsLeft) * 3;
}

const STRATEGIES: Record<string, Strategy> = {
  random: (state, rng) => state.offeredChoiceIds[Math.floor(rng() * state.offeredChoiceIds.length)] as string,
  coinRush: (state) =>
    [...state.offeredChoiceIds].sort(
      (a, b) => (CHOICES_BY_ID.get(b)?.effects.science ?? 0) - (CHOICES_BY_ID.get(a)?.effects.science ?? 0),
    )[0] as string,
  balanced: (state) =>
    [...state.offeredChoiceIds].sort((a, b) => scoreAfter(state, b) - scoreAfter(state, a))[0] as string,
};

function play(site: SiteId, seed: number, strategy: Strategy): GameState {
  let state = createGame({
    site,
    seed,
    missionStartDate: SPACE_WEATHER_META.missionStartDate,
    weather: SPACE_WEATHER_EVENTS,
  });
  let r = seed;
  const rng = () => (r = (r * 16807) % 2147483647) / 2147483647;
  while (state.status === 'playing') state = applyChoice(state, strategy(state, rng), SPACE_WEATHER_EVENTS);
  return state;
}

const games = Number(process.argv[2] ?? 2000);
console.log(
  `Simulating ${games} games per strategy (data: ${SPACE_WEATHER_META.source}, start ${SPACE_WEATHER_META.missionStartDate}, ${RULES.maxSols} sols)\n`,
);

const lossKeys: LossReason[] = [...RESOURCE_KEYS, 'science'];
const rows: Record<string, string | number>[] = [];
for (const site of Object.keys(SITES) as SiteId[]) {
  for (const [name, strategy] of Object.entries(STRATEGIES)) {
    let wins = 0;
    let totalDose = 0;
    let totalCoins = 0;
    const losses = Object.fromEntries(lossKeys.map((key) => [key, 0])) as Record<LossReason, number>;
    for (let seed = 1; seed <= games; seed++) {
      const result = play(site, seed, strategy);
      totalDose += result.resources.radiation;
      totalCoins += result.science;
      if (result.status === 'won') wins++;
      else if (result.lossReason) losses[result.lossReason]++;
    }
    const pct = (n: number) => `${((n / games) * 100).toFixed(1)}%`;
    rows.push({
      strategy: name,
      win: pct(wins),
      ...Object.fromEntries(lossKeys.map((key) => [`lost: ${key === 'science' ? 'coins' : key}`, pct(losses[key])])),
      'avg dose mSv': (totalDose / games).toFixed(1),
      'avg coins': (totalCoins / games).toFixed(0),
    });
  }
}
console.table(rows);
