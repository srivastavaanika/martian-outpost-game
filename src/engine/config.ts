import type { FlareClass, MeterDirection, ResourceKey, SiteId } from './types';

/**
 * Game tuning. Values marked [REAL] come from published measurements (see docs/data-sources.md);
 * everything else is a game-balance number tuned with `npm run sim`. Units are real-world units,
 * but the amounts are game numbers unless marked [REAL].
 */
export const RULES = {
  maxSols: 16,
  choicesPerSol: 4,
  /** Science points (shown as Coins) needed by the final sol to complete the mission. */
  scienceGoal: 60,
  /** A regular card with at least this much science is a "coin card". */
  coinCardMinScience: 10,
} as const;

export interface SiteConfig {
  id: SiteId;
  name: string;
  icon: string;
  /** [REAL] Average surface dose equivalent per day, mSv. */
  baselineDoseMsvPerSol: number;
  baselineDoseSource: string;
  blurb: string;
}

export const SITES: Record<SiteId, SiteConfig> = {
  mars: {
    id: 'mars',
    name: 'Mars Outpost',
    icon: '🔴',
    baselineDoseMsvPerSol: 0.67,
    baselineDoseSource:
      'Curiosity Radiation Assessment Detector, Gale Crater (Hassler et al., Science, 2014)',
    blurb: 'Thin air blocks a little radiation, but dust storms make solar power weaker.',
  },
};

export interface MeterConfig {
  unit: string;
  start: number;
  /** Top of the meter. For `lower` meters this is the fail value. */
  max: number;
  /** Change applied every sol after the card and the event. */
  daily: number;
  /** Warning shows at or below this (`higher`) or at or above it (`lower`). */
  warnAt: number;
  /** The mission ends at or below this (`higher`) or at or above it (`lower`). */
  failAt: number;
  direction: MeterDirection;
}

/** Game rule: the recovery card always offered for a meter when it needs one (instead of a random helpful card). */
export const PRIORITY_RECOVERY_CARD: Partial<Record<ResourceKey, string>> = { oxygen: 'make-oxygen' };

export const METERS: Record<ResourceKey, MeterConfig> = {
  power: { unit: 'kWh', start: 80, max: 100, daily: -2, warnAt: 45, failAt: 0, direction: 'higher' },
  oxygen: { unit: 'kg', start: 250, max: 300, daily: -9, warnAt: 100, failAt: 0, direction: 'higher' },
  water: { unit: 'kL', start: 7, max: 8, daily: -0.25, warnAt: 3.5, failAt: 0, direction: 'higher' },
  food: { unit: 'kg', start: 30, max: 40, daily: -1.5, warnAt: 15, failAt: 0, direction: 'higher' },
  /** The daily dose is the [REAL] Mars surface baseline; the 40 mSv budget is a game number. */
  radiation: {
    unit: 'mSv',
    start: 3,
    max: 40,
    daily: SITES.mars.baselineDoseMsvPerSol,
    warnAt: 30,
    failAt: 40,
    direction: 'lower',
  },
  waste: { unit: 'kg', start: 40, max: 300, daily: 10, warnAt: 240, failAt: 300, direction: 'lower' },
};

/**
 * Game rule: only X flares stronger than this magnitude (e.g. X3.4, not X2.2) become the Solar Flare event.
 * The class and magnitude are [REAL] DONKI values; the cut-off is a game number.
 */
export const FLARE_EVENT_MIN_X = 3;

/** Game-scaled dose (mSv) the Solar Flare event adds if nobody takes cover. */
export const FLARE_EVENT_DOSE_MSV = 4;

/** Game-scaled background dose (mSv) on a sol whose strongest flare did not trigger the event. */
export const FLARE_DOSE_MSV: Record<FlareClass, number> = { C: 0.05, M: 0.25, X: 0.5 };
