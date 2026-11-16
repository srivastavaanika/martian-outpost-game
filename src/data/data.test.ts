import { describe, expect, it } from 'vitest';
import { parseDonkiFlares } from './donki';
import { DATA_SOURCES, FACTS, SPACE_WEATHER_EVENTS, SPACE_WEATHER_META } from './index';

describe('parseDonkiFlares', () => {
  it('maps DONKI flares to dated events and skips unclassified ones', () => {
    const events = parseDonkiFlares([
      { flrID: 'b', beginTime: '2024-05-11T01:10Z', peakTime: '2024-05-11T01:23Z', classType: 'X5.8' },
      { flrID: 'a', beginTime: '2024-05-10T06:27Z', peakTime: null, classType: 'm2.1' },
      { flrID: 'c', beginTime: '2024-05-12T00:00Z', peakTime: null, classType: null },
    ]);
    expect(events).toEqual([
      { date: '2024-05-10', classType: 'm2.1', flareClass: 'M', sourceId: 'a' },
      { date: '2024-05-11', classType: 'X5.8', flareClass: 'X', sourceId: 'b' },
    ]);
  });

  it('rejects a non-array response', () => {
    expect(() => parseDonkiFlares({ error: 'nope' })).toThrow();
  });
});

describe('bundled data', () => {
  it('is never labelled as live', () => {
    expect(SPACE_WEATHER_META.isLive).toBe(false);
  });

  it('only contains events inside the snapshot range', () => {
    for (const event of SPACE_WEATHER_EVENTS) {
      expect(event.date >= SPACE_WEATHER_META.range.start && event.date <= SPACE_WEATHER_META.range.end).toBe(
        true,
      );
    }
  });

  it('attributes every fact to a known data source', () => {
    const ids = new Set(DATA_SOURCES.map((s) => s.id));
    for (const fact of FACTS) expect(ids.has(fact.sourceId)).toBe(true);
  });
});
