import { describe, expect, it } from 'vitest';
import { SPACE_WEATHER_EVENTS, SPACE_WEATHER_META } from '../data';
import {
  ALL_CHOICES,
  applyChoice,
  CALM_EVENT_ID,
  createGame,
  EVENTS,
  FLARE_EVENT_ID,
  METERS,
  pickEvent,
  RESOURCE_KEYS,
} from '../engine';
import type { GameState, SolEvent } from '../engine';
import { CARD_MODULES, cuesForSol, EVENT_EFFECTS, eventStartCues, METER_ICONS } from './cues';
import type { SceneCue } from './cues';

const START = SPACE_WEATHER_META.missionStartDate;

function newGame(seed = 1): GameState {
  return createGame({ site: 'mars', seed, missionStartDate: START, weather: SPACE_WEATHER_EVENTS });
}

function play(state: GameState, choiceId: string): GameState {
  return applyChoice(state, choiceId, SPACE_WEATHER_EVENTS);
}

function ofType<T extends SceneCue['type']>(cues: SceneCue[], type: T): Extract<SceneCue, { type: T }>[] {
  return cues.filter((c): c is Extract<SceneCue, { type: T }> => c.type === type);
}

describe('card and event mapping', () => {
  it('maps every card to a module', () => {
    for (const choice of ALL_CHOICES) expect(CARD_MODULES[choice.id], choice.id).toBeDefined();
  });

  it('gives every non-calm event a visible effect', () => {
    for (const event of EVENTS) {
      const effect = EVENT_EFFECTS[event.id];
      expect(effect, event.id).toBeDefined();
      if (event.id !== CALM_EVENT_ID) expect(effect?.effect, event.id).not.toBe('none');
    }
  });

  it('produces an event-start cue with the right effect for each event', () => {
    for (const event of EVENTS) {
      const [cue] = eventStartCues({ eventId: event.id, flare: null, backgroundFlare: null });
      expect(cue).toMatchObject({ type: 'event-start', eventId: event.id, effect: EVENT_EFFECTS[event.id]?.effect });
    }
  });
});

describe('cuesForSol', () => {
  it('plays only the first event when a mission starts', () => {
    const game = newGame();
    const cues = cuesForSol(undefined, game);
    expect(cues[0]).toMatchObject({ type: 'event-start', eventId: CALM_EVENT_ID });
    expect(ofType(cues, 'resource-delta')).toEqual([]);
  });

  it('shows exactly the meter and coin changes the engine made, for several sols', () => {
    let state = newGame(7);
    for (let i = 0; i < 4 && state.status === 'playing'; i++) {
      state = play(state, state.offeredChoiceIds[0] as string);
      const report = state.history.at(-1)!;
      const deltas = ofType(cuesForSol(report, state), 'resource-delta');
      for (const key of RESOURCE_KEYS) {
        const expected = Math.round((report.after[key] - report.before[key]) * 100) / 100;
        const cue = deltas.find((d) => d.key === key);
        expect(cue?.amount ?? 0, key).toBeCloseTo(expected, 5);
      }
      const coins = deltas.find((d) => d.key === 'science');
      expect(coins?.amount ?? 0).toBe(report.scienceAfter - report.scienceBefore);
    }
  });

  it('writes every change with a sign, a unit and an icon', () => {
    const state = play(newGame(), newGame().offeredChoiceIds[0] as string);
    for (const cue of ofType(cuesForSol(state.history.at(-1), state), 'resource-delta')) {
      expect(cue.text).toMatch(/^[+−]\d/);
      if (cue.key !== 'science') expect(cue.text).toContain(` ${METERS[cue.key].unit} `);
      expect(cue.text).toContain(METER_ICONS[cue.key]);
    }
  });

  it('plays the card, what it saved and the changes before the next event', () => {
    const base = newGame();
    const event: SolEvent = { eventId: 'pipe-leak', flare: null, backgroundFlare: null };
    const state = play({ ...base, sol: 2, event, offeredChoiceIds: ['wait-to-fix'] }, 'wait-to-fix');
    const types = cuesForSol(state.history.at(-1), state).map((c) => c.type);
    const last = (type: SceneCue['type']) => types.lastIndexOf(type);
    expect(last('impact-avoided')).toBeLessThan(types.indexOf('resource-delta'));
    expect(last('resource-delta')).toBeLessThan(types.indexOf('event-start'));
  });

  it('shows the share of the event a card prevented, equal to the engine report', () => {
    const base = newGame();
    const event: SolEvent = { eventId: 'pipe-leak', flare: null, backgroundFlare: null };
    const state = play({ ...base, sol: 2, event, offeredChoiceIds: ['wait-to-fix'] }, 'wait-to-fix');
    const report = state.history.at(-1)!;
    const [saved] = ofType(cuesForSol(report, state), 'impact-avoided');
    expect(saved?.amount).toBe(report.avoidedImpact.water);
    expect(saved?.text).toContain('kL');
  });

  it('marks the crew outside only for cards that add radiation', () => {
    const base = newGame();
    const outside = play({ ...base, offeredChoiceIds: ['clean-solar-panels'] }, 'clean-solar-panels');
    const inside = play({ ...base, offeredChoiceIds: ['recycle-water'] }, 'recycle-water');
    expect(ofType(cuesForSol(outside.history.at(-1), outside), 'crew-outside')).toHaveLength(1);
    expect(ofType(cuesForSol(inside.history.at(-1), inside), 'crew-outside')).toEqual([]);
  });

  it('plays no next event once the mission is over', () => {
    const base = newGame();
    const over = { ...base, status: 'lost' as const };
    expect(ofType(cuesForSol(base.history.at(-1), over), 'event-start')).toEqual([]);
  });
});

describe('flare cues from the real DONKI snapshot', () => {
  const at = (sol: number) => pickEvent({ seed: 1, sol, missionStartDate: START, usedEventIds: [] }, SPACE_WEATHER_EVENTS);

  it('plays the strong flare with the real class and date on Sol 219 (X3.9)', () => {
    const event = at(5);
    expect(event.eventId).toBe(FLARE_EVENT_ID);
    const [flare] = ofType(eventStartCues(event), 'flare');
    expect(flare).toMatchObject({ strength: 'event', classType: 'X3.9', date: '2024-05-10' });
    expect(flare?.text).toContain('X3.9');
  });

  it('plays only a light background flare on Sol 217 (X1.0)', () => {
    const event = at(3);
    expect(event.eventId).not.toBe(FLARE_EVENT_ID);
    const [flare] = ofType(eventStartCues(event), 'flare');
    expect(flare).toMatchObject({ strength: 'background', classType: 'X1.0' });
  });

  it('plays no flare on a sol without one', () => {
    expect(ofType(eventStartCues({ eventId: 'dust-storm', flare: null, backgroundFlare: null }), 'flare')).toEqual([]);
  });
});
