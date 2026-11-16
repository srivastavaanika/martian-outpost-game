import { useState } from 'react';
import { CHOICES_BY_ID, EVENTS_BY_ID } from '../engine';
import type { GameState } from '../engine';
import { useGameStore } from '../store';
import { ChoiceCard } from './ChoiceCard';
import { MissionLog } from './MissionLog';
import { PhaserGame } from './PhaserGame';
import { EventsPanel, StatusBar } from './StatusBar';

const OUTPOST_IMAGE = {
  small: `${import.meta.env.BASE_URL}assets/backgrounds/bg-outpost-960.webp`,
  large: `${import.meta.env.BASE_URL}assets/backgrounds/bg-outpost-1920.webp`,
};

/**
 * From `md` up everything fits one screen: the outpost picture fills it, the meters sit in the sky, and today's event
 * and cards sit on a glass strip along the bottom. Phones show the picture with its meters, then the event and cards.
 * The picture and the Phaser canvas both cover the same box from the centre, so scene positions line up with the picture.
 */
export function MissionScreen({ game }: { game: GameState }) {
  const choose = useGameStore((s) => s.choose);
  const event = EVENTS_BY_ID.get(game.event.eventId);
  const [pickedId, setPickedId] = useState<string | null>(null);

  return (
    <section className="relative isolate flex min-h-svh flex-col">
      <figure className="absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden md:h-full">
        <img
          src={OUTPOST_IMAGE.small}
          srcSet={`${OUTPOST_IMAGE.small} 960w, ${OUTPOST_IMAGE.large} 1920w`}
          sizes="100vw"
          alt="Artist's picture of a future Mars base: tube-shaped homes, a rover and two astronauts on red, rocky ground."
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <PhaserGame />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-slate-950/60 to-transparent" />
      </figure>

      <div className="pointer-events-none mx-auto h-[28rem] w-full max-w-7xl shrink-0 p-3 pb-14 sm:px-6 md:h-auto md:pb-3 md:pt-4">
        <StatusBar game={game} />
      </div>

      <div className="pointer-events-none mx-auto flex w-full max-w-7xl justify-end px-3 pt-3 sm:px-6 md:pt-0">
        <div className="pointer-events-auto w-full md:w-[24rem]">
          <EventsPanel game={game} />
        </div>
      </div>

      <div className="md:mt-auto">
        <div className="mx-auto w-full max-w-7xl px-3 pt-3 pb-1 sm:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="rounded-full bg-slate-950/80 px-4 py-1.5 text-xl font-black text-yellow-300 shadow-lg ring-2 ring-yellow-400/60 backdrop-blur-md md:text-2xl">
                What should the crew do today?
              </h2>
              <MissionLog history={game.history} popover />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-4">
              {game.offeredChoiceIds.map((id) => {
                const choice = CHOICES_BY_ID.get(id);
                if (!choice) return null;
                const handles = choice.eventId === game.event.eventId ? event : undefined;
                return (
                  <ChoiceCard
                    key={id}
                    choice={choice}
                    event={handles}
                    flipped={pickedId === id}
                    disabled={pickedId !== null && pickedId !== id}
                    continueLabel={game.sol >= game.maxSols ? 'Finish mission' : 'Next sol'}
                    onFlip={setPickedId}
                    onChoose={(choiceId) => {
                      setPickedId(null);
                      choose(choiceId);
                    }}
                  />
                );
              })}
            </div>
            <p className="text-right text-[11px] leading-tight text-slate-300/75 md:truncate">
              Picture: NASA artist's concept of a future Mars base (PIA23302). It is a drawing, not a photo - no one has
              built a Mars base yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
