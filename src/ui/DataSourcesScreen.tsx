import { DATA_SOURCES, SPACE_WEATHER_EVENTS, SPACE_WEATHER_META } from '../data';
import { SITES } from '../engine';
import { useGameStore } from '../store';

export function DataSourcesScreen() {
  const close = useGameStore((s) => s.closeDataSources);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-black">🛰️ Where does the data come from?</h1>
      <p className="text-lg text-slate-300">
        This game uses real measurements from NASA missions. The numbers that decide how hard each choice is
        are game rules we made up so the game is fair and fun.
      </p>

      <div className="rounded-2xl bg-slate-900/80 p-5 ring-1 ring-slate-700">
        <h2 className="text-xl font-extrabold">Solar flares in your mission</h2>
        <p className="text-slate-300">
          {SPACE_WEATHER_META.source === 'donki'
            ? `Downloaded from NASA DONKI on ${SPACE_WEATHER_META.fetchedAt?.slice(0, 10)}. This is a saved copy, not live data.`
            : 'Picked by hand from news about the real May 2024 solar storm. This is a saved copy, not live data.'}{' '}
          Dates {SPACE_WEATHER_META.range.start} to {SPACE_WEATHER_META.range.end}:{' '}
          {SPACE_WEATHER_EVENTS.length} flares.
        </p>
        {!SPACE_WEATHER_META.verified && (
          <p className="mt-2 text-sm text-amber-300">Not yet checked against the official NASA database.</p>
        )}
      </div>

      <div className="rounded-2xl bg-slate-900/80 p-5 ring-1 ring-slate-700">
        <h2 className="text-xl font-extrabold">Daily radiation on Mars</h2>
        <p className="text-slate-300">
          {SITES.mars.icon} {SITES.mars.name}: {SITES.mars.baselineDoseMsvPerSol} mSv per day -{' '}
          {SITES.mars.baselineDoseSource}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {DATA_SOURCES.map((source) => (
          <li key={source.id} className="rounded-2xl bg-slate-800/70 p-4">
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-bold text-sky-300 underline"
            >
              {source.name}
            </a>
            <p className="text-slate-300">{source.usedFor}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={close}
        className="self-start rounded-full bg-yellow-400 px-8 py-3 text-lg font-black text-slate-950 hover:bg-yellow-300"
      >
        ← Back
      </button>
    </section>
  );
}
