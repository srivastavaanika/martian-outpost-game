import { EVENT_CHOICES } from './events';
import type { Choice } from './types';

/**
 * Regular cards: offered as the recovery card or the coin card on any sol.
 * Effects are in each meter's unit (kWh, kg, kL, mSv); science is shown to players as Coins.
 * Every card MUST have at least one gain and one cost, and no regular card may be strictly better
 * than another. Both rules are enforced by design-rules.test.ts.
 */
export const CHOICES: readonly Choice[] = [
  {
    id: 'clean-solar-panels',
    icon: '🧹',
    title: 'Clean the solar panels',
    description: 'Go outside and brush off the dust so the panels make more power.',
    effects: { power: 25, oxygen: -5, radiation: 0.5 },
    lesson: 'Spacewalks use spacesuit oxygen and expose astronauts to more radiation than staying inside.',
    animation: 'Crew suits up, walks outside, brushes dust off',
  },
  {
    id: 'grow-food',
    icon: '🥬',
    title: 'Grow food in the greenhouse',
    description: 'Turn on the grow lights. Plants make food and a little fresh air, but they drink water.',
    effects: { power: -4, oxygen: 2, water: -0.3, food: 12 },
    lesson: 'Plants need light and water. In space, that light comes from electricity.',
    animation: 'Grow lights on, plants grow, tank drops',
  },
  {
    id: 'make-oxygen',
    icon: '🫧',
    title: 'Make oxygen from water',
    description: 'Split water into oxygen to breathe. It uses up water and lots of power!',
    effects: { power: -6, oxygen: 40, water: -0.3 },
    lesson: 'The ISS makes oxygen by splitting water with electricity (electrolysis).',
    animation: 'Water flows from tank to generator, bubbles',
  },
  {
    id: 'recycle-water',
    icon: '♻️',
    title: 'Recycle the water',
    description: 'Clean used water and sweat so the crew can drink it again. The machines need power.',
    effects: { power: -4, water: 0.5, waste: -2 },
    lesson:
      'The Space Station recycles almost all of its water - even sweat and urine - into clean drinking water.',
    animation: 'Recycler runs, tank fills',
  },
  {
    id: 'dig-ice',
    icon: '🧊',
    title: 'Dig up ice',
    description: 'Go outside and dig frozen water out of the ground. Melt it to drink.',
    effects: { oxygen: -6, water: 2, radiation: 0.5 },
    lesson: 'Mars has frozen water in its polar ice caps and hidden under the ground.',
    animation: 'Crew outside with drill, ice carried in',
  },
  {
    id: 'collect-supply-drop',
    icon: '📦',
    title: 'Collect a supply drop',
    description: 'Drive out to grab the cargo Earth sent. Food inside, but the rover uses power.',
    effects: { power: -5, food: 20, waste: 5, science: 3 },
    lesson: 'Supplies from Earth are slow and expensive, so bases try to grow and recycle what they can.',
    animation: 'Rover drives out and back with a crate',
  },
  {
    id: 'pile-regolith',
    icon: '⛏️',
    title: 'Pile soil on the habitat',
    description:
      'Shovel soil (regolith) on the roof to block radiation. Hard work makes the crew hungry and thirsty.',
    effects: { water: -0.5, food: -4, radiation: -3 },
    lesson: 'A thick layer of soil is one of the best radiation shields on Mars.',
    animation: 'Crew shovels; roof layer thickens',
  },
  {
    id: 'repair-shelter',
    icon: '🛡️',
    title: 'Power up the storm shelter',
    description: 'Run the machines that keep the radiation shelter ready.',
    effects: { power: -5, radiation: -4 },
    lesson: 'Astronauts hide in the most shielded part of their ship or base during solar storms.',
    animation: 'Shelter lights up',
  },
  {
    id: 'science-experiment',
    icon: '🔬',
    title: 'Do a science experiment',
    description: 'Study rocks and plants in the lab. Science is why we came!',
    effects: { power: -4, water: -0.1, science: 18 },
    lesson: 'Every experiment needs power and crew time - both are limited on a mission.',
    animation: 'Lab lights, microscope, coins pop',
  },
  {
    id: 'rover-expedition',
    icon: '🚙',
    title: 'Drive the rover to explore',
    description: 'Explore far away for big discoveries. The rover uses lots of power and you are outside.',
    effects: { power: -10, oxygen: -8, radiation: 1, science: 30 },
    lesson: 'Exploring brings the biggest discoveries, but it is also the riskiest thing astronauts do.',
    animation: 'Rover leaves and returns with a discovery',
  },
  {
    id: 'power-save',
    icon: '🌙',
    title: 'Power-save mode',
    description: 'Turn off extra machines to charge the batteries. The air cleaners run slower.',
    effects: { power: 15, oxygen: -2 },
    lesson: 'Saving power today can mean less clean air tomorrow - every system is connected.',
    animation: 'Lights dim, generator slows',
  },
  {
    id: 'send-data-home',
    icon: '📡',
    title: 'Send data to Earth',
    description: 'Beam your discoveries home so scientists can study them.',
    effects: { power: -8, science: 24 },
    lesson: 'Talking to Earth needs a big antenna and power. Mars messages take up to 22 minutes to arrive!',
    animation: 'Antenna beams toward a small Earth',
  },
  {
    id: 'compact-trash',
    icon: '🗜️',
    title: 'Squash the trash',
    description: 'Run the trash squasher to press waste into small blocks. It uses lots of power.',
    effects: { power: -6, waste: -40 },
    lesson: 'On a long mission trash takes up precious room, so crews squash it small instead of letting it pile up.',
    animation: 'Squasher thumps; waste pile shrinks',
  },
  {
    id: 'melt-trash-tiles',
    icon: '🧱',
    title: 'Melt trash into tiles',
    description: 'Heat plastic trash into hard tiles and save the water inside. The heater needs lots of power.',
    effects: { power: -8, water: 0.1, waste: -25 },
    lesson: 'On a long mission, trash is a resource: melted plastic can become useful tiles, and its water can be saved.',
    animation: 'Heater glows; trash comes out as tiles',
  },
];

/** Regular cards plus every event response card. */
export const ALL_CHOICES: readonly Choice[] = [...CHOICES, ...EVENT_CHOICES];

export const CHOICES_BY_ID: ReadonlyMap<string, Choice> = new Map(ALL_CHOICES.map((c) => [c.id, c]));
