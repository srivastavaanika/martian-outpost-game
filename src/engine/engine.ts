import { CHOICES, CHOICES_BY_ID } from './choices';
import { FLARE_DOSE_MSV, FLARE_EVENT_MIN_X, METERS, RULES } from './config';
import { CALM_EVENT_ID, EVENTS_BY_ID, FLARE_EVENT_ID, RANDOM_EVENT_IDS } from './events';
import { createRng, pickDistinct } from './rng';
import type {
  Choice,
  Effects,
  FlareClass,
  GameState,
  LossReason,
  ResourceKey,
  Resources,
  SiteId,
  SolEvent,
  SolReport,
  SpaceWeatherEvent,
} from './types';
import { RESOURCE_KEYS } from './types';

const FLARE_RANK: Record<FlareClass, number> = { C: 1, M: 2, X: 3 };

export interface NewGameOptions {
  site: SiteId;
  seed: number;
  missionStartDate: string;
  weather: readonly SpaceWeatherEvent[];
}

export function startingResources(): Resources {
  return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, METERS[key].start])) as Resources;
}

export function createGame({ site, seed, missionStartDate, weather }: NewGameOptions): GameState {
  const base = {
    site,
    seed,
    sol: 1,
    maxSols: RULES.maxSols,
    missionStartDate,
    resources: startingResources(),
    science: 0,
    status: 'playing' as const,
    usedEventIds: [],
    offeredChoiceIds: [],
    history: [],
  };
  const event = pickEvent(base, weather);
  const state: GameState = { ...base, event };
  return { ...state, offeredChoiceIds: offerChoiceIds(state) };
}

export function dateForSol(missionStartDate: string, sol: number): string {
  const date = new Date(`${missionStartDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + sol - 1);
  return date.toISOString().slice(0, 10);
}

/** The strongest flare on a given date, or null on a quiet day. */
export function strongestFlareOn(
  date: string,
  weather: readonly SpaceWeatherEvent[],
): SpaceWeatherEvent | null {
  let strongest: SpaceWeatherEvent | null = null;
  for (const event of weather) {
    if (event.date !== date) continue;
    if (!strongest || FLARE_RANK[event.flareClass] > FLARE_RANK[strongest.flareClass]) strongest = event;
  }
  return strongest;
}

/** The number after the class letter: 3.9 for "X3.9". */
export function flareMagnitude(event: SpaceWeatherEvent): number {
  const magnitude = Number.parseFloat(event.classType.slice(1));
  return Number.isFinite(magnitude) ? magnitude : 0;
}

/** Only X flares above `FLARE_EVENT_MIN_X` become the Solar Flare event. */
export function triggersFlareEvent(event: SpaceWeatherEvent): boolean {
  return event.flareClass === 'X' && flareMagnitude(event) > FLARE_EVENT_MIN_X;
}

/** True when the meter has reached its warning level. */
export function isWarning(key: ResourceKey, value: number): boolean {
  const meter = METERS[key];
  return meter.direction === 'higher' ? value <= meter.warnAt : value >= meter.warnAt;
}

export function isFailed(key: ResourceKey, value: number): boolean {
  const meter = METERS[key];
  return meter.direction === 'higher' ? value <= meter.failAt : value >= meter.failAt;
}

/** 1 at the starting value, 0 at the warning level, negative beyond it. */
export function roomBeforeWarning(key: ResourceKey, value: number): number {
  const meter = METERS[key];
  return meter.direction === 'higher'
    ? (value - meter.warnAt) / (meter.start - meter.warnAt)
    : (meter.warnAt - value) / (meter.warnAt - meter.start);
}

/** The meter with the least room before its warning level (ties go to RESOURCE_KEYS order). */
export function neediestMeter(resources: Resources): ResourceKey {
  return RESOURCE_KEYS.reduce((needy, key) =>
    roomBeforeWarning(key, resources[key]) < roomBeforeWarning(needy, resources[needy]) ? key : needy,
  );
}

/** True when the effect moves the meter in its good direction. */
export function helpsMeter(key: ResourceKey, amount: number): boolean {
  return METERS[key].direction === 'higher' ? amount > 0 : amount < 0;
}

export function isCoinCard(choice: Choice): boolean {
  return choice.eventId === undefined && (choice.effects.science ?? 0) >= RULES.coinCardMinScience;
}

const COIN_CARDS = CHOICES.filter(isCoinCard);
const RECOVERY_CARDS = CHOICES.filter((c) => !isCoinCard(c));

/**
 * The event for the state's sol: calm on sol 1, the solar-flare event when a real flare above X3
 * happened that day, otherwise a seeded random event that does not repeat until all have been used.
 */
export function pickEvent(
  state: Pick<GameState, 'seed' | 'sol' | 'missionStartDate' | 'usedEventIds'>,
  weather: readonly SpaceWeatherEvent[],
): SolEvent {
  const strongest = strongestFlareOn(dateForSol(state.missionStartDate, state.sol), weather);
  if (state.sol === 1) return { eventId: CALM_EVENT_ID, flare: null, backgroundFlare: strongest };
  if (strongest && triggersFlareEvent(strongest)) return { eventId: FLARE_EVENT_ID, flare: strongest, backgroundFlare: null };
  const unused = RANDOM_EVENT_IDS.filter((id) => !state.usedEventIds.includes(id));
  const pool = unused.length > 0 ? unused : RANDOM_EVENT_IDS;
  const [eventId] = pickDistinct(pool, 1, createRng(state.seed * 7919 + state.sol));
  return { eventId: eventId as string, flare: null, backgroundFlare: strongest };
}

/**
 * Cards offered on the current sol; deterministic for a given seed, sol, event and resources.
 * Event sols: the event's two response cards, one recovery card for the neediest meter and one coin card.
 * The calm first sol: one recovery card, two other regular cards and one coin card.
 */
export function offerChoiceIds(state: Pick<GameState, 'seed' | 'sol' | 'resources' | 'event'>): string[] {
  const rng = createRng(state.seed * 1000 + state.sol);
  const event = EVENTS_BY_ID.get(state.event.eventId);
  const needy = neediestMeter(state.resources);
  const helpful = RECOVERY_CARDS.filter((c) => helpsMeter(needy, c.effects[needy] ?? 0));
  const [recovery] = pickDistinct(helpful.length > 0 ? helpful : RECOVERY_CARDS, 1, rng);
  const coinPool =
    state.event.eventId === 'scientific-discovery' ? COIN_CARDS.filter((c) => c.id !== 'send-data-home') : COIN_CARDS;
  const [coin] = pickDistinct(coinPool, 1, rng);
  const picked: Choice[] = [recovery, coin].filter((c): c is Choice => c !== undefined);

  const ideal = (event?.idealChoiceIds ?? [])
    .map((id) => CHOICES_BY_ID.get(id))
    .filter((c): c is Choice => c !== undefined);
  if (ideal.length > 0) {
    picked.push(...ideal);
  } else {
    picked.push(...pickDistinct(RECOVERY_CARDS.filter((c) => !picked.includes(c)), RULES.choicesPerSol - picked.length, rng));
  }
  return pickDistinct(picked, RULES.choicesPerSol, rng).map((c) => c.id);
}

function addToMeters(resources: Resources, effects: Effects, scale = 1): void {
  for (const key of RESOURCE_KEYS) {
    const amount = effects[key];
    if (amount !== undefined) resources[key] = clamp(key, resources[key] + amount * scale);
  }
}

function scaled(effects: Effects, scale: number): Partial<Resources> {
  const result: Partial<Resources> = {};
  for (const key of RESOURCE_KEYS) {
    const amount = effects[key];
    if (amount !== undefined && amount * scale !== 0) result[key] = round2(amount * scale);
  }
  return result;
}

/** `total` minus `part`, so the applied and avoided shares of an impact always add up exactly. */
function remainder(total: Effects, part: Partial<Resources>): Partial<Resources> {
  const result: Partial<Resources> = {};
  for (const key of RESOURCE_KEYS) {
    const amount = round2((total[key] ?? 0) - (part[key] ?? 0));
    if (amount !== 0) result[key] = amount;
  }
  return result;
}

/**
 * Resolve one sol: the chosen card, then the part of the event's impact the card did not prevent,
 * then any background flare dose, then the daily change. Then check loss and the final-sol goal.
 * Pure - returns a new state with the next sol's event and cards.
 */
export function applyChoice(
  state: GameState,
  choiceId: string,
  weather: readonly SpaceWeatherEvent[],
): GameState {
  if (state.status !== 'playing') return state;
  if (!state.offeredChoiceIds.includes(choiceId)) {
    throw new Error(`Choice "${choiceId}" is not offered on sol ${state.sol}`);
  }
  const choice = CHOICES_BY_ID.get(choiceId);
  if (!choice) throw new Error(`Unknown choice "${choiceId}"`);

  const date = dateForSol(state.missionStartDate, state.sol);
  const before = { ...state.resources };
  const resources: Resources = { ...state.resources };
  const messages: string[] = [];

  addToMeters(resources, choice.effects);

  const event = EVENTS_BY_ID.get(state.event.eventId);
  const avoids = choice.eventId === state.event.eventId ? (choice.avoids ?? 0) : 0;
  const avoidedImpact = scaled(event?.impact ?? {}, avoids);
  const impactApplied = remainder(event?.impact ?? {}, avoidedImpact);
  addToMeters(resources, impactApplied);

  const background = state.event.backgroundFlare;
  if (background) {
    resources.radiation = clamp('radiation', resources.radiation + FLARE_DOSE_MSV[background.flareClass]);
    messages.push(backgroundFlareMessage(background));
  }

  for (const key of RESOURCE_KEYS) resources[key] = clamp(key, resources[key] + METERS[key].daily);

  const science = Math.max(0, state.science + (choice.effects.science ?? 0));
  const lossReason = RESOURCE_KEYS.find((key) => isFailed(key, resources[key]));
  const isFinalSol = state.sol >= state.maxSols;
  let status: GameState['status'] = 'playing';
  let finalLoss: LossReason | undefined = lossReason;
  if (lossReason) {
    status = 'lost';
  } else if (isFinalSol) {
    if (science >= RULES.scienceGoal) {
      status = 'won';
    } else {
      status = 'lost';
      finalLoss = 'science';
    }
  }

  const report: SolReport = {
    sol: state.sol,
    date,
    choiceId,
    event: state.event,
    doseMsv: round2(resources.radiation - before.radiation),
    impactApplied,
    avoidedImpact,
    before,
    after: { ...resources },
    scienceBefore: state.science,
    scienceAfter: science,
    messages,
  };

  const usedEventIds =
    event?.trigger === 'random'
      ? [...(state.usedEventIds.length >= RANDOM_EVENT_IDS.length ? [] : state.usedEventIds), event.id]
      : state.usedEventIds;
  const next: GameState = {
    ...state,
    resources,
    science,
    status,
    lossReason: finalLoss,
    usedEventIds,
    history: [...state.history, report],
    offeredChoiceIds: [],
  };
  if (status !== 'playing') return next;
  const advanced = { ...next, sol: state.sol + 1 };
  const nextEvent = pickEvent(advanced, weather);
  const withEvent = { ...advanced, event: nextEvent };
  return { ...withEvent, offeredChoiceIds: offerChoiceIds(withEvent) };
}

function backgroundFlareMessage(event: SpaceWeatherEvent): string {
  switch (event.flareClass) {
    case 'X':
      return `☀️ A big real solar flare (${event.classType}) hit today. Extra radiation reached the crew.`;
    case 'M':
      return `☀️ A medium real solar flare (${event.classType}) added a little radiation.`;
    case 'C':
      return `☀️ A small real solar flare (${event.classType}) added a tiny bit of radiation.`;
  }
}

function clamp(key: ResourceKey, value: number): number {
  return round2(Math.max(0, Math.min(METERS[key].max, value)));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
