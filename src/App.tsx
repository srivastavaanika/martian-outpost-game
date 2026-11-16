import { useGameStore } from './store';
import { LandingScreen } from './ui/LandingScreen';
import { MissionScreen } from './ui/MissionScreen';
import { DebriefScreen } from './ui/DebriefScreen';
import { DataSourcesScreen } from './ui/DataSourcesScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const game = useGameStore((s) => s.game);

  if (screen === 'playing' && game) {
    return (
      <main className="min-h-screen">
        <MissionScreen game={game} />
      </main>
    );
  }

  if (screen === 'debrief' && game) {
    return (
      <main className="min-h-screen">
        <DebriefScreen game={game} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-3 sm:p-6">
      {screen === 'start' && <LandingScreen />}
      {screen === 'data' && <DataSourcesScreen />}
    </main>
  );
}
