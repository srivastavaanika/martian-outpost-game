import { describe, expect, it } from 'vitest';
import { RULES } from '../engine';
import { describeImpact, describeSaved, displaySol, formatAmount } from './labels';

describe('displaySol', () => {
  it('shows the first sol as Sol 215 and the last as Sol 230', () => {
    expect(displaySol(1)).toBe(215);
    expect(displaySol(RULES.maxSols)).toBe(230);
  });
});

describe('formatAmount', () => {
  it('adds a sign and the real unit, and no unit for coins', () => {
    expect(formatAmount('power', 20)).toBe('+20 kWh');
    expect(formatAmount('water', -0.3)).toBe('−0.3 kL');
    expect(formatAmount('science', 15)).toBe('+15');
  });
});

describe('describeImpact and describeSaved', () => {
  it('shows losses with signs and saved amounts without them', () => {
    expect(describeImpact({ power: -20, water: -0.75 })).toBe('Power −20 kWh, Water −0.75 kL');
    expect(describeSaved({ power: -20 })).toBe('20 kWh of power');
    expect(describeSaved({ radiation: 4 })).toBe('4 mSv of radiation dose');
  });
});
