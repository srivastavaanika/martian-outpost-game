export interface DataSource {
  id: string;
  name: string;
  url: string;
  usedFor: string;
}

/** Shown in-game on the "Real NASA data" screen. Keep in sync with docs/data-sources.md. */
export const DATA_SOURCES: readonly DataSource[] = [
  {
    id: 'donki',
    name: 'NASA Space Weather Database (DONKI)',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    usedFor: 'Real solar flares that cause radiation storms at your base.',
  },
  {
    id: 'msl-rad',
    name: 'Curiosity Rover Radiation Assessment Detector (RAD)',
    url: 'https://science.nasa.gov/mission/msl-curiosity/',
    usedFor: 'How much radiation reaches the surface of Mars every day.',
  },
  {
    id: 'mars-background',
    name: "NASA artist's concept PIA23302, \"First Humans on Mars\" (NASA)",
    url: 'https://images.nasa.gov/details/PIA23302',
    usedFor:
      "The picture of your outpost. It is NASA's drawing of a future Mars base, not a photo - no one has built one yet.",
  },
  {
    id: 'landing-stars',
    name: 'Artemis II crew photo art002e012588, "Starstruck" (NASA)',
    url: 'https://images.nasa.gov/details/art002e012588',
    usedFor: 'The real stars and Milky Way on the welcome page.',
  },
  {
    id: 'landing-earth',
    name: 'Apollo 17 photo AS17-148-22727, "The Blue Marble" (NASA)',
    url: 'https://images.nasa.gov/details/as17-148-22727',
    usedFor: 'The real Earth on the welcome page.',
  },
  {
    id: 'landing-mars',
    name: 'Mars Global Surveyor image PIA04591 (NASA/JPL/Malin Space Science Systems)',
    url: 'https://images.nasa.gov/details/PIA04591',
    usedFor: 'The real Mars on the welcome page. The game puts the three photos together - not to scale.',
  },
  {
    id: 'osdr',
    name: 'NASA Open Science Data Repository (OSDR)',
    url: 'https://osdr.nasa.gov/',
    usedFor: 'Real research on how space affects astronaut bodies.',
  },
  {
    id: 'radlab',
    name: 'OSDR RadLab (ISS radiation dosimetry)',
    url: 'https://visualization.osdr.nasa.gov/radlab/',
    usedFor: 'Radiation measured on the International Space Station (planned).',
  },
  {
    id: 'nasa-hrp',
    name: 'NASA Human Research Program',
    url: 'https://www.nasa.gov/hrp/',
    usedFor: 'Astronaut health facts and radiation limits.',
  },
];
