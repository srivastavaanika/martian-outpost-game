import { create } from 'zustand';
import { applyChoice, createGame } from './engine';
import type { GameState, SiteId } from './engine';
import { SPACE_WEATHER_EVENTS, SPACE_WEATHER_META } from './data';

type Screen = 'start' | 'playing' | 'debrief' | 'data';

/** `?seed=N` replays the same mission (events and cards) every time; otherwise each mission is new. */
function missionSeed(): number {
  const param = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('seed');
  const seed = param === null ? NaN : Number(param);
  return Number.isInteger(seed) && seed > 0 ? seed : Math.floor(Math.random() * 1_000_000);
}

interface GameStore {
  screen: Screen;
  previousScreen: Screen;
  game: GameState | null;
  startMission: (site: SiteId) => void;
  choose: (choiceId: string) => void;
  showDataSources: () => void;
  closeDataSources: () => void;
  restart: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'start',
  previousScreen: 'start',
  game: null,
  startMission: (site) =>
    set({
      screen: 'playing',
      game: createGame({
        site,
        seed: missionSeed(),
        missionStartDate: SPACE_WEATHER_META.missionStartDate,
        weather: SPACE_WEATHER_EVENTS,
      }),
    }),
  choose: (choiceId) => {
    const { game } = get();
    if (!game) return;
    const next = applyChoice(game, choiceId, SPACE_WEATHER_EVENTS);
    set({ game: next, screen: next.status === 'playing' ? 'playing' : 'debrief' });
  },
  showDataSources: () => set((s) => ({ screen: 'data', previousScreen: s.screen })),
  closeDataSources: () => set((s) => ({ screen: s.previousScreen })),
  restart: () => set({ screen: 'start', game: null }),
}));
