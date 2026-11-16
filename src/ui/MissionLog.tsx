import { CHOICES_BY_ID, EVENTS_BY_ID } from '../engine';
import type { SolReport } from '../engine';
import { displaySol } from './labels';

/** `popover` opens the list above a small button, so the one-screen mission layout never grows. */
export function MissionLog({ history, popover = false }: { history: readonly SolReport[]; popover?: boolean }) {
  if (history.length === 0) return null;
  return (
    <details className={popover ? 'relative' : 'rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-700'}>
      <summary
        className={
          popover
            ? 'flex min-h-9 cursor-pointer items-center rounded-full bg-slate-800/90 px-3 text-sm font-bold ring-1 ring-slate-600 hover:bg-slate-700'
            : 'cursor-pointer text-lg font-bold'
        }
      >
        📒 Mission log ({history.length} sols)
      </summary>
      <ol
        className={
          popover
            ? 'absolute right-0 bottom-full z-40 mb-2 flex max-h-[60svh] w-[min(28rem,calc(100vw-1.5rem))] flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-900/95 p-4 text-sm shadow-2xl ring-1 ring-slate-600'
            : 'mt-3 flex flex-col gap-2'
        }
      >
        {[...history].reverse().map((report) => {
          const choice = CHOICES_BY_ID.get(report.choiceId);
          const event = EVENTS_BY_ID.get(report.event.eventId);
          const flare = report.event.flare ?? report.event.backgroundFlare;
          return (
            <li key={report.sol} className="text-slate-300">
              <strong>Sol {displaySol(report.sol)}</strong> ({report.date}): {event?.icon} {event?.title} - you chose{' '}
              {choice?.icon} {choice?.title}. Radiation {report.doseMsv >= 0 ? '+' : ''}
              {report.doseMsv} mSv.
              {flare && <span className="text-orange-300"> ☀️ Real {flare.classType} flare.</span>}
            </li>
          );
        })}
      </ol>
    </details>
  );
}
