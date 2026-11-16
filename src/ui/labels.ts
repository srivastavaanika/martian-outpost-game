import { METERS } from '../engine';
import type { Effects, LossReason, ResourceKey } from '../engine';

/** The engine counts sols from 1; the story starts the crew on Sol 215. Display only. */
export const SOL_DISPLAY_OFFSET = 214;

export function displaySol(sol: number): number {
  return sol + SOL_DISPLAY_OFFSET;
}

export const RESOURCE_LABELS: Record<ResourceKey, { name: string; icon: string; color: string; explain: string }> = {
  power: {
    name: 'Power',
    icon: '⚡',
    color: 'bg-yellow-400',
    explain: 'Electricity from solar arrays & nuclear batteries.',
  },
  oxygen: { name: 'Oxygen', icon: '💨', color: 'bg-cyan-300', explain: 'Breathable air inside the dome.' },
  water: { name: 'Water', icon: '💧', color: 'bg-blue-400', explain: 'Drinking, washing, and growing plants.' },
  food: {
    name: 'Food',
    icon: '🍽️',
    color: 'bg-emerald-400',
    explain: 'Freeze-dried astronaut meals & greenhouse crops.',
  },
  radiation: {
    name: 'Radiation dose',
    icon: '☢️',
    color: 'bg-fuchsia-400',
    explain: 'Space radiation the crew has soaked up. Lower is safer!',
  },
  waste: {
    name: 'Waste',
    icon: '💩',
    color: 'bg-amber-600',
    explain: 'Trash & leftover plant scraps waiting to be squashed.',
  },
};

export const COIN_LABEL = { name: 'Coins', icon: '🪙' } as const;

export const EFFECT_LABELS: Record<keyof Effects, { name: string; icon: string; unit: string }> = {
  ...(Object.fromEntries(
    (Object.keys(RESOURCE_LABELS) as ResourceKey[]).map((key) => [
      key,
      { name: RESOURCE_LABELS[key].name, icon: RESOURCE_LABELS[key].icon, unit: METERS[key].unit },
    ]),
  ) as Record<ResourceKey, { name: string; icon: string; unit: string }>),
  science: { name: COIN_LABEL.name, icon: COIN_LABEL.icon, unit: '' },
};

/** "+20 kWh", "-0.3 kL", "+15" (coins have no unit). */
export function formatAmount(key: keyof Effects, amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  const unit = EFFECT_LABELS[key].unit;
  return `${sign}${Math.abs(amount)}${unit ? ` ${unit}` : ''}`;
}

/** "Water −0.75 kL, Power −20 kWh" */
export function describeImpact(impact: Effects): string {
  return (Object.entries(impact) as [keyof Effects, number][])
    .map(([key, amount]) => `${EFFECT_LABELS[key].name} ${formatAmount(key, amount)}`)
    .join(', ');
}

/** What a response card prevented, without signs: "20 kWh of power". */
export function describeSaved(avoided: Effects): string {
  return (Object.entries(avoided) as [keyof Effects, number][])
    .map(([key, amount]) => {
      const unit = EFFECT_LABELS[key].unit;
      return `${Math.abs(amount)}${unit ? ` ${unit}` : ''} of ${EFFECT_LABELS[key].name.toLowerCase()}`;
    })
    .join(', ');
}

export const LOSS_MESSAGES: Record<LossReason, { title: string; lesson: string }> = {
  power: {
    title: 'The power ran out!',
    lesson:
      'Every machine on a base needs electricity - heaters, air cleaners, radios. Mission planners always keep a power reserve.',
  },
  oxygen: {
    title: 'The crew ran low on oxygen!',
    lesson:
      'Breathable air is the first thing astronauts protect. Bases make oxygen from water, so oxygen, water and power are all connected.',
  },
  water: {
    title: 'The crew ran out of water!',
    lesson:
      'Water is used for drinking, growing plants and making oxygen. That is why space bases recycle almost every drop.',
  },
  food: {
    title: 'The crew ran out of food!',
    lesson:
      'Food is heavy to send from Earth, so long missions need greenhouses - and plants need water and light.',
  },
  radiation: {
    title: 'The crew got too much radiation!',
    lesson:
      'Space radiation adds up over time. Shelters, soil on the roof and staying inside during solar storms keep astronauts safe.',
  },
  waste: {
    title: 'The base filled up with trash!',
    lesson:
      'A crew makes trash every day, and there is no garbage truck on Mars. Bases squash and recycle waste so it never piles up.',
  },
  science: {
    title: 'You stayed safe, but did not earn enough coins.',
    lesson: 'Missions are expensive. Planners balance safety with getting the science done - both matter.',
  },
};
