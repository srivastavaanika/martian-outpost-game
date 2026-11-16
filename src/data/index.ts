import snapshot from './space-weather.json';
import type { SpaceWeatherEvent } from '../engine/types';

export interface SpaceWeatherSnapshotMeta {
  source: 'curated' | 'donki';
  isLive: false;
  verified: boolean;
  fetchedAt: string | null;
  range: { start: string; end: string };
  missionStartDate: string;
  note: string;
}

export const SPACE_WEATHER_META = snapshot.meta as SpaceWeatherSnapshotMeta;
export const SPACE_WEATHER_EVENTS = snapshot.events as SpaceWeatherEvent[];

export { DATA_SOURCES } from './sources';
export { FACTS } from './facts';
export { fetchDonkiFlares } from './donki';
