import { useEffect, useState } from 'react';
import { fetchDonkiFlares } from '../data';
import type { SpaceWeatherEvent } from '../engine';

type LiveState =
  { status: 'loading' } | { status: 'ok'; flares: SpaceWeatherEvent[] } | { status: 'offline' };

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

/** Optional LIVE panel. The mission itself always uses the bundled snapshot. */
export function LiveSpaceWeather() {
  const [state, setState] = useState<LiveState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
    fetchDonkiFlares(isoDaysAgo(7), isoDaysAgo(0), apiKey, { timeoutMs: 8000 })
      .then((flares) => !cancelled && setState({ status: 'ok', flares }))
      .catch(() => !cancelled && setState({ status: 'offline' }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return <p className="text-sm text-slate-400">📡 Checking today's real space weather...</p>;
  }
  if (state.status === 'offline') {
    return <p className="text-sm text-slate-400">📡 Live space weather is unavailable right now.</p>;
  }
  const big = state.flares.filter((f) => f.flareClass !== 'C');
  return (
    <p className="text-sm text-slate-300">
      <span className="mr-2 rounded bg-red-600 px-2 py-0.5 text-xs font-black text-white">LIVE</span>
      In the last 7 days the Sun made {state.flares.length} flares
      {big.length > 0
        ? `, including ${big.length} medium or big ones (${big.map((f) => f.classType).join(', ')})`
        : ''}
      .<span className="text-slate-500"> Source: NASA DONKI</span>
    </p>
  );
}
