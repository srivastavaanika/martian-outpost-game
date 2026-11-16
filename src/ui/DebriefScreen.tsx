import { useRef } from 'react';
import { CHOICES_BY_ID } from '../engine';
import type { GameState } from '../engine';
import { DATA_SOURCES, FACTS } from '../data';
import { useGameStore } from '../store';
import { displaySol, LOSS_MESSAGES } from './labels';
import { MissionEndStamp } from './MissionEndStamp';
import { MissionLog } from './MissionLog';
import { HUD_CHIP, OUTPOST_IMAGE } from './outpost';
import { StatusBar } from './StatusBar';

/** The end of the mission, over the same outpost picture and glass panels as the mission screen. */
export function DebriefScreen({ game }: { game: GameState }) {
  const restart = useGameStore((s) => s.restart);
  const restartRef = useRef<HTMLButtonElement>(null);
  const won = game.status === 'won';
  const loss = game.lossReason ? LOSS_MESSAGES[game.lossReason] : null;
  const lessons = [...new Set(game.history.map((r) => r.choiceId))]
    .map((id) => CHOICES_BY_ID.get(id))
    .filter((c) => c !== undefined);
  const flareDays = game.history.filter((r) => r.event.flare ?? r.event.backgroundFlare);
  const fact = FACTS[game.seed % FACTS.length];
  const factSource = DATA_SOURCES.find((s) => s.id === fact?.sourceId);

  return (
    <section className="relative isolate min-h-svh" data-testid="debrief">
      <img
        src={OUTPOST_IMAGE.small}
        srcSet={`${OUTPOST_IMAGE.small} 960w, ${OUTPOST_IMAGE.large} 1920w`}
        sizes="100vw"
        alt={OUTPOST_IMAGE.alt}
        className="fixed inset-0 -z-20 size-full object-cover"
      />
      <div
        className={`fixed inset-0 -z-10 bg-gradient-to-b ${won ? 'from-slate-950/60 via-slate-950/30 to-slate-950/70' : 'from-red-950/70 via-red-950/35 to-slate-950/75'}`}
      />
      <MissionEndStamp game={game} onClose={() => restartRef.current?.focus()} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 p-3 sm:px-6 md:pt-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${HUD_CHIP} ${won ? 'ring-yellow-400/60' : 'bg-red-950/75 ring-red-400'}`}
        >
          <div className="flex min-w-0 flex-col gap-1">
            {!won && (
              <span className="w-fit rounded-md border-2 border-red-400 px-2 py-0.5 text-sm font-black tracking-widest text-red-200 uppercase">
                Mission failed
              </span>
            )}
            <h2 className="text-2xl font-black leading-tight sm:text-3xl">
              {won ? '🎉 Mission complete!' : `🚨 ${loss?.title ?? 'Mission over'}`}
            </h2>
            <p className="text-base text-slate-100 sm:text-lg">
              {won
                ? `Your crew made it from Sol ${displaySol(1)} to Sol ${displaySol(game.maxSols)} and earned ${game.science} coins from science. Real mission planners would be proud!`
                : loss?.lesson}
            </p>
          </div>
          <button
            type="button"
            ref={restartRef}
            onClick={restart}
            className="min-h-12 shrink-0 cursor-pointer rounded-full bg-yellow-400 px-6 py-3 text-lg font-black text-slate-950 shadow-lg hover:bg-yellow-300 sm:text-xl"
          >
            🚀 Try another mission
          </button>
        </div>

        <StatusBar game={game} />

        <p className={`self-start px-3 py-1.5 text-sm font-bold text-orange-100 ${HUD_CHIP} ring-orange-400/50`}>
          <span aria-hidden>☀️ </span>Days with real solar flares: {flareDays.length}
        </p>

        <div className={`flex flex-col gap-3 p-4 ${HUD_CHIP}`}>
          <h3 className="w-fit rounded-full bg-slate-950/80 px-4 py-1 text-xl font-black text-yellow-300 ring-2 ring-yellow-400/60">
            What your choices teach
          </h3>
          <ul className="grid gap-2 md:grid-cols-2">
            {lessons.map((choice) => (
              <li key={choice.id} className="rounded-2xl bg-slate-800/80 p-3 text-base ring-1 ring-slate-700">
                <span aria-hidden>{choice.icon}</span> <strong>{choice.title}:</strong> {choice.lesson}
              </li>
            ))}
          </ul>
        </div>

        {fact && (
          <aside className="rounded-2xl bg-indigo-950/80 p-4 text-base shadow-lg ring-2 ring-indigo-400/50 backdrop-blur-md">
            🛰️ <strong>Real NASA science:</strong> {fact.text}
            {factSource && <span className="block text-sm text-indigo-200">Source: {factSource.name}</span>}
          </aside>
        )}

        <MissionLog history={game.history} />

        <p className="text-right text-[11px] leading-tight text-slate-300/75">{OUTPOST_IMAGE.credit}</p>
      </div>
    </section>
  );
}
