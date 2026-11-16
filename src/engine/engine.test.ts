import { describe, expect, it } from 'vitest';
import {
  applyChoice,
  choiceOutlook,
  createGame,
  dateForSol,
  helpsMeter,
  isCoinCard,
  isWarning,
  neediestMeter,
  offerChoiceIds,
  pickEvent,
  roomBeforeWarning,
  startingResources,
} from './engine';
import { CHOICES_BY_ID } from './choices';
import { FLARE_DOSE_MSV, FLARE_EVENT_DOSE_MSV, METERS, RULES } from './config';
import { CALM_EVENT_ID, EVENTS_BY_ID, FLARE_EVENT_ID, RANDOM_EVENT_IDS } from './events';
import type { GameState, ResourceKey, SolEvent, SpaceWeatherEvent } from './types';
import { RESOURCE_KEYS } from './types';

const START = '2024-05-06';
const NO_WEATHER: SpaceWeatherEvent[] = [];
const X_FLARE: SpaceWeatherEvent = { date: '2024-05-07', classType: 'X5.8', flareClass: 'X', sourceId: 'x' };
const M_FLARE: SpaceWeatherEvent = { date: '2024-05-07', classType: 'M2.1', flareClass: 'M', sourceId: 'm' };
const QUIET: SolEvent = { eventId: 'pipe-leak', flare: null, backgroundFlare: null };

function gameWith(overrides: Partial<GameState>): GameState {
  return { ...createGame({ site: 'mars', seed: 1, missionStartDate: START, weather: NO_WEATHER }), ...overrides };
}

describe('createGame', () => {
  it('starts on sol 1 with the configured meters, a calm event and four cards', () => {
    const game = createGame({ site: 'mars', seed: 42, missionStartDate: START, weather: NO_WEATHER });
    expect(game.sol).toBe(1);
    expect(game.status).toBe('playing');
    expect(game.resources).toEqual(startingResources());
    expect(game.event.eventId).toBe(CALM_EVENT_ID);
    expect(game.offeredChoiceIds).toHaveLength(RULES.choicesPerSol);
    expect(new Set(game.offeredChoiceIds).size).toBe(RULES.choicesPerSol);
  });
});

describe('pickEvent', () => {
  const base = { seed: 3, missionStartDate: START, usedEventIds: [] };

  it('keeps sol 1 calm even on a flare day, adding the flare in the background', () => {
    const flare = { ...X_FLARE, date: START };
    const event = pickEvent({ ...base, sol: 1 }, [flare]);
    expect(event.eventId).toBe(CALM_EVENT_ID);
    expect(event.backgroundFlare).toEqual(flare);
  });

  it('gives the solar-flare event on a real flare day above X3', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const event = pickEvent({ ...base, seed, sol: 2 }, [M_FLARE, X_FLARE]);
      expect(event.eventId).toBe(FLARE_EVENT_ID);
      expect(event.flare).toEqual(X_FLARE);
    }
  });

  it('never gives the solar-flare event without an X-class flare', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const event = pickEvent({ ...base, seed, sol: 2 }, [M_FLARE]);
      expect(RANDOM_EVENT_IDS).toContain(event.eventId);
      expect(event.backgroundFlare).toEqual(M_FLARE);
    }
  });

  it('keeps X flares of X3.0 and below as a background dose, not the solar-flare event', () => {
    for (const classType of ['X1.0', 'X2.2', 'X3.0']) {
      const weak = { ...X_FLARE, classType };
      const event = pickEvent({ ...base, sol: 2 }, [weak]);
      expect(RANDOM_EVENT_IDS).toContain(event.eventId);
      expect(event.backgroundFlare).toEqual(weak);
    }
    expect(pickEvent({ ...base, sol: 2 }, [{ ...X_FLARE, classType: 'X3.4' }]).eventId).toBe(FLARE_EVENT_ID);
  });

  it('does not repeat a random event until every one has been used', () => {
    let state = gameWith({ seed: 9 });
    const seen: string[] = [];
    for (let i = 0; i < RANDOM_EVENT_IDS.length; i++) {
      state = applyChoice(state, state.offeredChoiceIds[0] as string, NO_WEATHER);
      if (state.status !== 'playing') break;
      seen.push(state.event.eventId);
    }
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('is the same for the same seed', () => {
    expect(pickEvent({ ...base, sol: 5 }, NO_WEATHER)).toEqual(pickEvent({ ...base, sol: 5 }, NO_WEATHER));
  });
});

describe('offerChoiceIds', () => {
  const resources = startingResources();

  it('offers both response cards, a recovery card and a coin card on an event sol', () => {
    for (const eventId of [FLARE_EVENT_ID, ...RANDOM_EVENT_IDS]) {
      for (let seed = 1; seed <= 20; seed++) {
        const offered = offerChoiceIds({ seed, sol: 4, resources, event: { ...QUIET, eventId } });
        expect(offered).toHaveLength(RULES.choicesPerSol);
        expect(new Set(offered).size).toBe(RULES.choicesPerSol);
        for (const id of EVENTS_BY_ID.get(eventId)?.idealChoiceIds ?? []) expect(offered).toContain(id);
        expect(offered.filter((id) => isCoinCard(CHOICES_BY_ID.get(id)!)).length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('offers four regular cards with a coin card on the calm first sol', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const offered = offerChoiceIds({ seed, sol: 1, resources, event: { ...QUIET, eventId: CALM_EVENT_ID } });
      expect(new Set(offered).size).toBe(RULES.choicesPerSol);
      expect(offered.every((id) => CHOICES_BY_ID.get(id)?.eventId === undefined)).toBe(true);
      expect(offered.some((id) => isCoinCard(CHOICES_BY_ID.get(id)!))).toBe(true);
    }
  });

  it('never offers Send data to Earth next to the discovery cards', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const event = { ...QUIET, eventId: 'scientific-discovery' };
      expect(offerChoiceIds({ seed, sol: 4, resources, event })).not.toContain('send-data-home');
    }
  });

  it.each(RESOURCE_KEYS.map((key) => [key] as const))(
    'offers a card that helps %s when it has the least room before its warning',
    (key: ResourceKey) => {
      const meter = METERS[key];
      const low = { ...resources, [key]: meter.warnAt };
      expect(neediestMeter(low)).toBe(key);
      for (let seed = 1; seed <= 30; seed++) {
        const offered = offerChoiceIds({ seed, sol: 4, resources: low, event: QUIET });
        expect(offered.some((id) => helpsMeter(key, CHOICES_BY_ID.get(id)?.effects[key] ?? 0))).toBe(true);
      }
    },
  );

  it('offers a card for every meter in its warning zone, plus all response cards', () => {
    const pairs = RESOURCE_KEYS.flatMap((a, i) => RESOURCE_KEYS.slice(i + 1).map((b) => [a, b] as const));
    for (const [a, b] of pairs) {
      const low = { ...resources, [a]: METERS[a].warnAt, [b]: METERS[b].warnAt };
      for (const eventId of [CALM_EVENT_ID, FLARE_EVENT_ID, ...RANDOM_EVENT_IDS]) {
        for (let seed = 1; seed <= 10; seed++) {
          const offered = offerChoiceIds({ seed, sol: 4, resources: low, event: { ...QUIET, eventId } });
          const cards = offered.map((id) => CHOICES_BY_ID.get(id)!);
          expect(new Set(offered).size).toBe(offered.length);
          expect(offered.length).toBeGreaterThanOrEqual(RULES.choicesPerSol);
          for (const key of [a, b]) expect(cards.some((c) => helpsMeter(key, c.effects[key] ?? 0)), key).toBe(true);
          for (const id of EVENTS_BY_ID.get(eventId)?.idealChoiceIds ?? []) expect(offered).toContain(id);
        }
      }
    }
  });

  it('always offers Make oxygen from water when oxygen needs a card', () => {
    for (const other of RESOURCE_KEYS) {
      const low = { ...resources, oxygen: METERS.oxygen.warnAt, [other]: METERS[other].warnAt };
      for (const eventId of [CALM_EVENT_ID, FLARE_EVENT_ID, ...RANDOM_EVENT_IDS]) {
        for (let seed = 1; seed <= 10; seed++) {
          expect(offerChoiceIds({ seed, sol: 4, resources: low, event: { ...QUIET, eventId } })).toContain('make-oxygen');
        }
      }
    }
  });

  it('drops the coin card to make room when several meters are in warning on an event sol', () => {
    const low = { ...startingResources(), power: METERS.power.warnAt, radiation: METERS.radiation.warnAt };
    const offered = offerChoiceIds({ seed: 3, sol: 4, resources: low, event: { ...QUIET, eventId: FLARE_EVENT_ID } });
    expect(offered).toHaveLength(RULES.choicesPerSol);
    expect(offered.some((id) => isCoinCard(CHOICES_BY_ID.get(id)!))).toBe(false);
  });
});

describe('choiceOutlook', () => {
  const offered = ['clean-solar-panels', 'rover-expedition', 'science-experiment', 'make-oxygen'];
  const at = (resources: Partial<GameState['resources']>) =>
    gameWith({ sol: 2, event: QUIET, offeredChoiceIds: offered, resources: { ...startingResources(), ...resources } });

  it('lists the meters in warning that the card fixes', () => {
    const game = at({ power: METERS.power.warnAt });
    expect(choiceOutlook(game, 'clean-solar-panels', NO_WEATHER).helps).toEqual(['power']);
    expect(choiceOutlook(game, 'science-experiment', NO_WEATHER).helps).toEqual([]);
  });

  it('warns when the card itself pushes a meter into warning, not when the daily change alone does', () => {
    const game = at({ oxygen: METERS.oxygen.warnAt + 10 });
    expect(choiceOutlook(game, 'rover-expedition', NO_WEATHER).dangers).toContain('oxygen');
    expect(choiceOutlook(game, 'science-experiment', NO_WEATHER).dangers).not.toContain('oxygen');
  });

  it('says when the card would end the mission', () => {
    const game = at({ power: 5 });
    expect(choiceOutlook(game, 'rover-expedition', NO_WEATHER).ends).toBe('power');
    expect(choiceOutlook(game, 'clean-solar-panels', NO_WEATHER).ends).toBeNull();
  });
});

describe('meters', () => {
  it('measures room before the warning level the same way for every meter', () => {
    for (const key of RESOURCE_KEYS) {
      expect(roomBeforeWarning(key, METERS[key].start)).toBe(1);
      expect(roomBeforeWarning(key, METERS[key].warnAt)).toBe(0);
      expect(isWarning(key, METERS[key].warnAt)).toBe(true);
      expect(isWarning(key, METERS[key].start)).toBe(false);
    }
  });
});

describe('dateForSol', () => {
  it('maps sol 1 to the start date and rolls over months', () => {
    expect(dateForSol(START, 1)).toBe('2024-05-06');
    expect(dateForSol('2024-05-30', 3)).toBe('2024-06-01');
  });
});

describe('applyChoice', () => {
  it('rejects a card that was not offered', () => {
    const game = gameWith({ offeredChoiceIds: ['grow-food'] });
    expect(() => applyChoice(game, 'make-oxygen', NO_WEATHER)).toThrow(/not offered/);
  });

  it('applies the card, then the event impact, then the daily change', () => {
    const game = gameWith({ sol: 2, event: QUIET, offeredChoiceIds: ['grow-food'] });
    const next = applyChoice(game, 'grow-food', NO_WEATHER);
    const effects = CHOICES_BY_ID.get('grow-food')?.effects ?? {};
    const impact = EVENTS_BY_ID.get('pipe-leak')?.impact ?? {};
    for (const key of RESOURCE_KEYS) {
      const cap = (v: number) => Math.min(METERS[key].max, Math.max(0, v));
      const expected = cap(cap(cap(METERS[key].start + (effects[key] ?? 0)) + (impact[key] ?? 0)) + METERS[key].daily);
      expect(next.resources[key], key).toBeCloseTo(expected, 5);
    }
    expect(next.history[0]?.impactApplied).toEqual(impact);
    expect(next.sol).toBe(3);
  });

  it('prevents the share of the impact the response card avoids', () => {
    const half = gameWith({ sol: 2, event: QUIET, offeredChoiceIds: ['wait-to-fix'] });
    const report = applyChoice(half, 'wait-to-fix', NO_WEATHER).history[0];
    const avoided = report?.avoidedImpact.water ?? 0;
    const applied = report?.impactApplied.water ?? 0;
    expect(avoided).toBeCloseTo(-0.375, 1);
    expect(avoided + applied).toBeCloseTo(-0.75, 10);

    const full = gameWith({ sol: 2, event: QUIET, offeredChoiceIds: ['fix-pipe-now'] });
    expect(applyChoice(full, 'fix-pipe-now', NO_WEATHER).history[0]?.impactApplied).toEqual({});
  });

  it('adds the solar-flare dose unless the crew shelters', () => {
    const event: SolEvent = { eventId: FLARE_EVENT_ID, flare: X_FLARE, backgroundFlare: null };
    const game = gameWith({ sol: 2, event, offeredChoiceIds: ['run-to-bunker', 'send-data-home'] });
    const sheltered = applyChoice(game, 'run-to-bunker', NO_WEATHER);
    const exposed = applyChoice(game, 'send-data-home', NO_WEATHER);
    expect(exposed.resources.radiation - sheltered.resources.radiation).toBeCloseTo(FLARE_EVENT_DOSE_MSV, 5);
  });

  it('adds a background flare dose on top of a random event', () => {
    const game = gameWith({ sol: 2, event: { ...QUIET, backgroundFlare: M_FLARE }, offeredChoiceIds: ['fix-pipe-now'] });
    const calm = gameWith({ sol: 2, event: QUIET, offeredChoiceIds: ['fix-pipe-now'] });
    const withFlare = applyChoice(game, 'fix-pipe-now', NO_WEATHER);
    const without = applyChoice(calm, 'fix-pipe-now', NO_WEATHER);
    expect(withFlare.resources.radiation - without.resources.radiation).toBeCloseTo(FLARE_DOSE_MSV.M, 5);
    expect(withFlare.history[0]?.messages.join(' ')).toMatch(/M2\.1/);
  });

  it.each(RESOURCE_KEYS.map((key) => [key] as const))('ends the mission when %s hits its fail value', (key) => {
    const meter = METERS[key];
    const edge = meter.direction === 'higher' ? meter.failAt + 0.01 : meter.failAt - 0.01;
    const game = gameWith({
      sol: 2,
      event: { eventId: 'scientific-discovery', flare: null, backgroundFlare: null },
      offeredChoiceIds: ['celebrate-keep-working'],
      resources: { ...startingResources(), [key]: edge },
    });
    const next = applyChoice(game, 'celebrate-keep-working', NO_WEATHER);
    expect(next.status).toBe('lost');
    expect(next.lossReason).toBe(key);
  });

  it('wins on the final sol when the coin goal is met', () => {
    const game = gameWith({ sol: RULES.maxSols, science: RULES.scienceGoal, offeredChoiceIds: ['send-data-home'] });
    expect(applyChoice(game, 'send-data-home', NO_WEATHER).status).toBe('won');
  });

  it('loses on the final sol when the coin goal is missed', () => {
    const game = gameWith({ sol: RULES.maxSols, science: 0, offeredChoiceIds: ['grow-food'] });
    const next = applyChoice(game, 'grow-food', NO_WEATHER);
    expect(next.status).toBe('lost');
    expect(next.lossReason).toBe('science');
  });

  it('replays the same events and cards for the same seed', () => {
    const play = () => {
      let state = createGame({ site: 'mars', seed: 5, missionStartDate: START, weather: [X_FLARE] });
      const trail: string[] = [];
      while (state.status === 'playing') {
        trail.push(`${state.event.eventId}:${state.offeredChoiceIds.join(',')}`);
        state = applyChoice(state, state.offeredChoiceIds[0] as string, [X_FLARE]);
      }
      return trail;
    };
    expect(play()).toEqual(play());
  });

  it('ignores input once the mission is over', () => {
    const game = gameWith({ status: 'won', offeredChoiceIds: ['grow-food'] });
    expect(applyChoice(game, 'grow-food', NO_WEATHER)).toBe(game);
  });
});
