/** The six meters on the dashboard. Every one can end the mission (see `METERS` in config.ts). */
export type ResourceKey = 'power' | 'oxygen' | 'water' | 'food' | 'radiation' | 'waste';

export const RESOURCE_KEYS: readonly ResourceKey[] = ['power', 'oxygen', 'water', 'food', 'radiation', 'waste'];

export type Resources = Record<ResourceKey, number>;

/** `higher`: more is better, fails at the bottom. `lower`: less is better, fails at the top. */
export type MeterDirection = 'higher' | 'lower';

export type SiteId = 'mars';

/** Everything a card or event can change, in each meter's real unit. Science is shown to players as Coins. */
export type Effects = Partial<Resources> & { science?: number };

export interface Choice {
  id: string;
  icon: string;
  title: string;
  /** One or two short sentences a 7-year-old can read. */
  description: string;
  effects: Effects;
  /** The real-world fact this choice teaches, shown in the debrief. */
  lesson: string;
  /** What the 2D scene shows when this card is played. */
  animation?: string;
  /** Response cards belong to one event and are only offered while it happens. */
  eventId?: string;
  /** Share of the event's impact this card prevents (0-1). Only for response cards. */
  avoids?: number;
}

export type FlareClass = 'C' | 'M' | 'X';

/** A real (or curated) solar flare used to drive the radiation mechanic. */
export interface SpaceWeatherEvent {
  /** ISO date (YYYY-MM-DD) of the flare peak, UTC. */
  date: string;
  /** Full class string as reported, e.g. "X8.7". */
  classType: string;
  flareClass: FlareClass;
  sourceId: string;
}

export type EventTrigger = 'calm' | 'flare' | 'random';

export interface GameEvent {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** What happens to the meters if no response card handles it. Never uses science. */
  impact: Partial<Resources>;
  /** The two response cards offered during this event (empty for the calm first sol). */
  idealChoiceIds: readonly string[];
  trigger: EventTrigger;
}

/** The event the crew faces on the current sol. */
export interface SolEvent {
  eventId: string;
  /** The real X-class flare behind a solar-flare event. */
  flare: SpaceWeatherEvent | null;
  /** A real C- or M-class flare that adds a little dose in the background. */
  backgroundFlare: SpaceWeatherEvent | null;
}

export interface SolReport {
  sol: number;
  date: string;
  choiceId: string;
  event: SolEvent;
  /** Radiation added this sol (mSv); negative when shielding work lowered it. */
  doseMsv: number;
  /** Part of the event impact that hit the base. */
  impactApplied: Partial<Resources>;
  /** Part of the event impact the chosen card prevented. */
  avoidedImpact: Partial<Resources>;
  before: Resources;
  after: Resources;
  scienceBefore: number;
  scienceAfter: number;
  messages: string[];
}

export type GameStatus = 'playing' | 'won' | 'lost';

export type LossReason = ResourceKey | 'science';

export interface GameState {
  site: SiteId;
  seed: number;
  sol: number;
  maxSols: number;
  /** ISO date of sol 1; sol N maps to missionStartDate + (N - 1) days. */
  missionStartDate: string;
  resources: Resources;
  science: number;
  status: GameStatus;
  lossReason?: LossReason;
  /** The event for the current sol, decided before cards are offered. */
  event: SolEvent;
  /** Random events already used; the pool refills once every event has appeared. */
  usedEventIds: string[];
  offeredChoiceIds: string[];
  history: SolReport[];
}
