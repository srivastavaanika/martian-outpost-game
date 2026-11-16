import { CHOICES_BY_ID, EVENTS_BY_ID, METERS, RESOURCE_KEYS } from '../engine';
import type { GameState, ResourceKey, SolEvent, SolReport } from '../engine';
import type { ModuleId } from './layout';

/**
 * Scene cues: plain data describing what the scene should animate. Built only from engine output
 * (`SolReport`, `GameState`); no Phaser here, so every cue is unit-tested.
 */

export type EventEffect = 'none' | 'flare' | 'dust' | 'wilt' | 'drip' | 'snow' | 'sand' | 'sparks' | 'crack' | 'sparkle';

export type SceneCue =
  | { type: 'crew-outside'; module: ModuleId; choiceId: string; narration: string }
  | { type: 'impact-avoided'; module: ModuleId; key: ResourceKey; amount: number; text: string; narration: string }
  | { type: 'resource-delta'; module: ModuleId; key: ResourceKey | 'science'; amount: number; text: string; gain: boolean; narration: string }
  | { type: 'event-start'; eventId: string; effect: EventEffect; module: ModuleId | 'sky'; narration: string }
  | { type: 'flare'; strength: 'event' | 'background'; classType: string; date: string; text: string; narration: string };

export const METER_ICONS: Record<ResourceKey | 'science', string> = {
  power: '⚡',
  oxygen: '💨',
  water: '💧',
  food: '🍽️',
  radiation: '☢️',
  waste: '💩',
  science: '🪙',
};

const METER_NAMES: Record<ResourceKey | 'science', string> = {
  power: 'power',
  oxygen: 'oxygen',
  water: 'water',
  food: 'food',
  radiation: 'radiation dose',
  waste: 'waste',
  science: 'coins',
};

/** The part of the outpost picture each card happens at. Every card in ALL_CHOICES must be listed (tested). */
export const CARD_MODULES: Record<string, ModuleId> = {
  'clean-solar-panels': 'power',
  'grow-food': 'food',
  'make-oxygen': 'oxygen',
  'recycle-water': 'water',
  'dig-ice': 'drill',
  'collect-supply-drop': 'rover',
  'pile-regolith': 'radiation',
  'repair-shelter': 'radiation',
  'science-experiment': 'coins',
  'rover-expedition': 'rover',
  'power-save': 'power',
  'send-data-home': 'coins',
  'compact-trash': 'waste',
  'melt-trash-tiles': 'waste',
  'run-to-bunker': 'radiation',
  'finish-tasks-first': 'coins',
  'leave-solar-panels': 'power',
  'retract-panels': 'power',
  'cook-the-crops': 'food',
  'throw-the-crops': 'waste',
  'fix-pipe-now': 'water',
  'wait-to-fix': 'water',
  'rush-to-habitat': 'oxygen',
  'rescue-outdoor-gear': 'drill',
  'leave-it-stuck': 'rover',
  'save-the-rover': 'rover',
  'move-the-drill': 'drill',
  'push-the-drill': 'drill',
  'send-repair-bots': 'oxygen',
  'do-it-yourself': 'oxygen',
  'celebrate-and-share': 'coins',
  'celebrate-keep-working': 'coins',
};

/** The start-of-sol effect for every event, and where it plays. Every event must be listed (tested). */
export const EVENT_EFFECTS: Record<string, { effect: EventEffect; module: ModuleId | 'sky' }> = {
  'calm-sol': { effect: 'none', module: 'sky' },
  'solar-flare': { effect: 'flare', module: 'sky' },
  'dust-storm': { effect: 'dust', module: 'power' },
  'disgusting-greenhouse': { effect: 'wilt', module: 'food' },
  'pipe-leak': { effect: 'drip', module: 'water' },
  'dry-ice-storm': { effect: 'snow', module: 'sky' },
  'rover-in-trap': { effect: 'sand', module: 'rover' },
  'miner-hits-bedrock': { effect: 'sparks', module: 'drill' },
  'crack-in-dome': { effect: 'crack', module: 'oxygen' },
  'scientific-discovery': { effect: 'sparkle', module: 'coins' },
};

function amountText(key: ResourceKey | 'science', amount: number): string {
  const sign = amount > 0 ? '+' : '−';
  const unit = key === 'science' ? '' : ` ${METERS[key].unit}`;
  return `${sign}${Math.abs(amount)}${unit} ${METER_ICONS[key]}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** "+20 kWh ⚡", "−5 kg 💨", "+22 🪙" - always a sign, a unit and an icon, so colour is never the only signal. */
export function deltaCues(report: SolReport): SceneCue[] {
  const cues: SceneCue[] = [];
  for (const key of RESOURCE_KEYS) {
    const amount = round2(report.after[key] - report.before[key]);
    if (amount === 0) continue;
    const gain = METERS[key].direction === 'higher' ? amount > 0 : amount < 0;
    cues.push({
      type: 'resource-delta',
      module: key,
      key,
      amount,
      text: amountText(key, amount),
      gain,
      narration: `${METER_NAMES[key][0]?.toUpperCase()}${METER_NAMES[key].slice(1)} ${amount > 0 ? 'went up' : 'went down'} by ${Math.abs(amount)} ${METERS[key].unit}.`,
    });
  }
  const coins = report.scienceAfter - report.scienceBefore;
  if (coins !== 0) {
    cues.push({
      type: 'resource-delta',
      module: 'coins',
      key: 'science',
      amount: coins,
      text: amountText('science', coins),
      gain: coins > 0,
      narration: `The crew earned ${coins} coins from science.`,
    });
  }
  return cues;
}

function avoidedCues(report: SolReport): SceneCue[] {
  return RESOURCE_KEYS.flatMap((key): SceneCue[] => {
    const amount = report.avoidedImpact[key];
    if (amount === undefined || amount === 0) return [];
    const unit = METERS[key].unit;
    return [
      {
        type: 'impact-avoided',
        module: key,
        key,
        amount,
        text: `🛡️ Saved ${Math.abs(amount)} ${unit} ${METER_ICONS[key]}`,
        narration: `Good choice! It saved ${Math.abs(amount)} ${unit} of ${METER_NAMES[key]}.`,
      },
    ];
  });
}

function crewOutsideCue(report: SolReport): SceneCue[] {
  const choice = CHOICES_BY_ID.get(report.choiceId);
  if (!choice || (choice.effects.radiation ?? 0) <= 0) return [];
  return [
    {
      type: 'crew-outside',
      module: CARD_MODULES[choice.id] ?? 'drill',
      choiceId: choice.id,
      narration: 'The crew went outside in their spacesuits.',
    },
  ];
}

/** The event the new sol starts with, plus a real flare cue (strong for the event, light for a background flare). */
export function eventStartCues(event: SolEvent): SceneCue[] {
  const info = EVENTS_BY_ID.get(event.eventId);
  const effect = EVENT_EFFECTS[event.eventId] ?? { effect: 'none' as const, module: 'sky' as const };
  const cues: SceneCue[] = [
    {
      type: 'event-start',
      eventId: event.eventId,
      effect: effect.effect,
      module: effect.module,
      narration: info ? `${info.title} ${info.description}` : 'A new sol begins.',
    },
  ];
  if (event.flare) {
    cues.push({
      type: 'flare',
      strength: 'event',
      classType: event.flare.classType,
      date: event.flare.date,
      text: `☀️ Real solar flare ${event.flare.classType} · ${event.flare.date}`,
      narration: `A real solar flare, class ${event.flare.classType}, happened on ${event.flare.date}.`,
    });
  } else if (event.backgroundFlare) {
    cues.push({
      type: 'flare',
      strength: 'background',
      classType: event.backgroundFlare.classType,
      date: event.backgroundFlare.date,
      text: `☀️ Small real flare ${event.backgroundFlare.classType}`,
      narration: `A smaller real solar flare, class ${event.backgroundFlare.classType}, adds a little radiation today.`,
    });
  }
  return cues;
}

/**
 * Everything the scene plays after a sol, in the order `applyChoice` resolves it: the card (crew outside),
 * what the card prevented, the meter and coin changes, then the next sol's event. With no report (a new
 * mission), only the first sol's event plays. A finished mission has no next event.
 */
export function cuesForSol(report: SolReport | undefined, state: GameState): SceneCue[] {
  const cues: SceneCue[] = [];
  if (report) cues.push(...crewOutsideCue(report), ...avoidedCues(report), ...deltaCues(report));
  if (state.status === 'playing') cues.push(...eventStartCues(state.event));
  return cues;
}
