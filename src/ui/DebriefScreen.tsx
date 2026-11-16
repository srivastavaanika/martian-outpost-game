import { CHOICES_BY_ID, METERS, RULES } from '../engine';
import type { GameState } from '../engine';
import { DATA_SOURCES, FACTS } from '../data';
import { useGameStore } from '../store';
import { CoinIcon } from './Coin';
import { COIN_LABEL, displaySol, LOSS_MESSAGES } from './labels';
import { MissionLog } from './MissionLog';

export function DebriefScreen({ game }: { game: GameState }) {
  const restart = useGameStore((s) => s.restart);
  const won = game.status === 'won';
  const loss = game.lossReason ? LOSS_MESSAGES[game.lossReason] : null;
  const lessons = [...new Set(game.history.map((r) => r.choiceId))]
    .map((id) => CHOICES_BY_ID.get(id))
    .filter((c) => c !== undefined);
  const flareDays = game.history.filter((r) => r.event.flare ?? r.event.backgroundFlare);
  const fact = FACTS[game.seed % FACTS.length];
  const factSource = DATA_SOURCES.find((s) => s.id === fact?.sourceId);

  return (
    <section className="flex flex-col gap-6" data-testid="debrief">
      <h1 className="text-4xl font-black">
        {won ? '🎉 Mission complete!' : `🚨 ${loss?.title ?? 'Mission over'}`}
      </h1>
      <p className="text-xl text-slate-300">
        {won
          ? `Your crew made it from Sol ${displaySol(1)} to Sol ${displaySol(game.maxSols)} and earned ${game.science} coins from science. Real mission planners would be proud!`
          : loss?.lesson}
      </p>

      <div className="grid gap-3 rounded-3xl bg-slate-900/80 p-5 text-lg ring-1 ring-slate-700 sm:grid-cols-3">
        <p>
          <CoinIcon size={22} /> {COIN_LABEL.name}: {game.science} / {RULES.scienceGoal}
        </p>
        <p>
          ☢️ Radiation: {game.resources.radiation.toFixed(1)} / {METERS.radiation.failAt} mSv
        </p>
        <p>☀️ Days with real solar flares: {flareDays.length}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">What your choices teach</h2>
        <ul className="flex flex-col gap-2">
          {lessons.map((choice) => (
            <li key={choice.id} className="rounded-2xl bg-slate-800/70 p-3 text-lg">
              <span aria-hidden>{choice.icon}</span> <strong>{choice.title}:</strong> {choice.lesson}
            </li>
          ))}
        </ul>
      </div>

      {fact && (
        <aside className="rounded-2xl bg-indigo-500/15 p-4 text-lg ring-1 ring-indigo-400/40">
          🛰️ <strong>Real NASA science:</strong> {fact.text}
          {factSource && <span className="block text-sm text-indigo-200">Source: {factSource.name}</span>}
        </aside>
      )}

      <MissionLog history={game.history} />

      <button
        type="button"
        onClick={restart}
        className="self-start rounded-full bg-yellow-400 px-8 py-4 text-xl font-black text-slate-950 hover:bg-yellow-300"
      >
        🚀 Try another mission
      </button>
    </section>
  );
}
