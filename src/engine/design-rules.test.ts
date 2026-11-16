import { describe, expect, it } from 'vitest';
import { ALL_CHOICES, CHOICES } from './choices';
import { METERS } from './config';
import { EVENT_CHOICES, EVENTS, EVENTS_BY_ID } from './events';
import { RESOURCE_KEYS } from './types';
import type { Choice, Effects } from './types';

/** Converts effects to "goodness" scores so gains are positive and costs negative. */
function benefitVector(effects: Effects): number[] {
  return [
    ...RESOURCE_KEYS.map((key) => (effects[key] ?? 0) * (METERS[key].direction === 'higher' ? 1 : -1)),
    effects.science ?? 0,
  ];
}

/** The part of its event a response card prevents, as goodness scores. */
function avoidedVector(choice: Choice): number[] {
  const event = choice.eventId ? EVENTS_BY_ID.get(choice.eventId) : undefined;
  const avoids = choice.avoids ?? 0;
  return benefitVector(event?.impact ?? {}).map((value) => -value * avoids);
}

/** What the card really does on its sol: its own effects plus the impact it prevents. */
function netVector(choice: Choice): number[] {
  const own = benefitVector(choice.effects);
  if (!choice.eventId) return own;
  const avoided = avoidedVector(choice);
  return own.map((value, i) => value + (avoided[i] ?? 0));
}

function dominates(a: Choice, b: Choice): boolean {
  const va = netVector(a);
  const vb = netVector(b);
  return va.every((value, i) => value >= (vb[i] ?? 0)) && va.some((value, i) => value > (vb[i] ?? 0));
}

describe('design rule: every decision is a real trade-off', () => {
  it.each(CHOICES.map((c) => [c.id, c] as const))('%s has at least one gain and one cost', (_id, choice) => {
    const vector = benefitVector(choice.effects);
    expect(vector.some((v) => v > 0)).toBe(true);
    expect(vector.some((v) => v < 0)).toBe(true);
  });

  // A response card's gain may be the part of its event it prevents; its cost must be its own.
  it.each(EVENT_CHOICES.map((c) => [c.id, c] as const))(
    '%s has at least one gain and one cost of its own',
    (_id, choice) => {
      const own = benefitVector(choice.effects);
      expect([...own, ...avoidedVector(choice)].some((v) => v > 0)).toBe(true);
      expect(own.some((v) => v < 0)).toBe(true);
    },
  );

  it('no regular card is strictly better than another', () => {
    const dominated = CHOICES.flatMap((a) =>
      CHOICES.filter((b) => a !== b && dominates(a, b)).map((b) => `${a.id} dominates ${b.id}`),
    );
    expect(dominated).toEqual([]);
  });

  it.each(EVENTS.filter((e) => e.idealChoiceIds.length > 0).map((e) => [e.id, e] as const))(
    'neither response card to %s is strictly better than the other',
    (_id, event) => {
      const [a, b] = event.idealChoiceIds.map((id) => ALL_CHOICES.find((c) => c.id === id) as Choice);
      expect(dominates(a as Choice, b as Choice)).toBe(false);
      expect(dominates(b as Choice, a as Choice)).toBe(false);
    },
  );
});

describe('design rule: events and their response cards fit together', () => {
  it.each(EVENTS.filter((e) => e.trigger !== 'calm').map((e) => [e.id, e] as const))(
    '%s offers exactly two response cards that belong to it',
    (_id, event) => {
      expect(event.idealChoiceIds).toHaveLength(2);
      for (const id of event.idealChoiceIds) {
        expect(EVENT_CHOICES.find((c) => c.id === id)?.eventId).toBe(event.id);
      }
    },
  );

  it('every response card is offered by its event', () => {
    for (const choice of EVENT_CHOICES) {
      expect(EVENTS_BY_ID.get(choice.eventId ?? '')?.idealChoiceIds).toContain(choice.id);
      expect(choice.avoids).toBeGreaterThanOrEqual(0);
      expect(choice.avoids).toBeLessThanOrEqual(1);
    }
  });

  it('no event impact takes away coins', () => {
    for (const event of EVENTS) expect(Object.keys(event.impact)).not.toContain('science');
  });
});

describe('design rule: keep it simple for ages 7-12', () => {
  // The brief recommends 2-3 resources; the team chose six meters (see docs/decisions.md, 2026-11-15).
  // Read that entry before raising this further.
  it('tracks at most six meters', () => {
    expect(RESOURCE_KEYS.length).toBeLessThanOrEqual(6);
  });

  it.each(ALL_CHOICES.map((c) => [c.id, c] as const))('%s uses short, readable text', (_id, choice) => {
    expect(choice.title.length).toBeLessThanOrEqual(32);
    expect(choice.description.length).toBeLessThanOrEqual(110);
    expect(choice.lesson.length).toBeGreaterThan(0);
  });

  it.each(EVENTS.map((e) => [e.id, e] as const))('event %s uses short, readable text', (_id, event) => {
    expect(event.title.length).toBeLessThanOrEqual(32);
    expect(event.description.length).toBeLessThanOrEqual(160);
  });

  it('has unique card and event ids', () => {
    expect(new Set(ALL_CHOICES.map((c) => c.id)).size).toBe(ALL_CHOICES.length);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
  });
});
