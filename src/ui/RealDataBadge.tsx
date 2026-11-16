import { SPACE_WEATHER_META } from '../data';
import { useGameStore } from '../store';

/** Always-visible attribution: the brief requires players to know what is real NASA data. */
export function RealDataBadge({ compact = false }: { compact?: boolean }) {
  const showDataSources = useGameStore((s) => s.showDataSources);
  const label =
    SPACE_WEATHER_META.source === 'donki'
      ? `Real NASA DONKI data (snapshot ${SPACE_WEATHER_META.fetchedAt?.slice(0, 10)})`
      : 'Based on real solar storms (curated, not live)';

  return (
    <button
      type="button"
      onClick={showDataSources}
      className={`self-start rounded-full bg-indigo-500/20 font-bold text-indigo-200 ring-1 ring-indigo-400/50 hover:bg-indigo-500/30 ${compact ? 'min-h-9 px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}`}
    >
      🛰️ {label}
    </button>
  );
}
