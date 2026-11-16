export interface ScienceFact {
  id: string;
  topic: 'radiation' | 'health' | 'life-support' | 'power';
  text: string;
  sourceId: string;
  /** Set to true once a teammate has checked the wording against the cited source. */
  verified: boolean;
}

/** Kid-friendly real facts shown in the debrief. See docs/data-sources.md before adding. */
export const FACTS: readonly ScienceFact[] = [
  {
    id: 'career-limit',
    topic: 'radiation',
    text: 'NASA limits how much radiation an astronaut can get in their whole career: 600 millisieverts.',
    sourceId: 'nasa-hrp',
    verified: false,
  },
  {
    id: 'mars-surface-dose',
    topic: 'radiation',
    text: 'The Curiosity rover measured about 0.67 millisieverts of radiation per day on the surface of Mars.',
    sourceId: 'msl-rad',
    verified: false,
  },
  {
    id: 'bone-loss',
    topic: 'health',
    text: 'In space, astronauts can lose about 1% of the bone in their hips and spine every month.',
    sourceId: 'nasa-hrp',
    verified: false,
  },
  {
    id: 'exercise',
    topic: 'health',
    text: 'Astronauts on the Space Station exercise about 2 hours every day to keep their muscles and bones strong.',
    sourceId: 'nasa-hrp',
    verified: false,
  },
  {
    id: 'osdr-experiments',
    topic: 'health',
    text: "NASA's Open Science Data Repository stores results from space experiments with plants, mice, microbes and people.",
    sourceId: 'osdr',
    verified: false,
  },
  {
    id: 'flares',
    topic: 'radiation',
    text: 'Scientists sort solar flares by strength: C is small, M is medium and X is the biggest.',
    sourceId: 'donki',
    verified: false,
  },
];
