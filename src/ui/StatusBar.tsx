import { motion, useReducedMotion } from 'framer-motion';
import { CHOICES_BY_ID, dateForSol, EVENTS_BY_ID, RESOURCE_KEYS, RULES } from '../engine';
import type { GameState } from '../engine';
import { CoinStack } from './Coin';
import { RealDataBadge } from './RealDataBadge';
import { ResourceGauge } from './ResourceGauge';
import type { TooltipAlign } from './ResourceGauge';
import { HUD_CHIP } from './outpost';
import { COIN_LABEL, describeImpact, describeSaved, displaySol } from './labels';


function CoinCounter({ coins }: { coins: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <div
      role="meter"
      aria-label={`${COIN_LABEL.name} from science`}
      aria-valuenow={coins}
      aria-valuemin={0}
      aria-valuemax={RULES.scienceGoal}
      aria-valuetext={`${coins} of ${RULES.scienceGoal} coins`}
      data-testid="coins"
      className={`flex items-end gap-2 px-3 py-2 ${HUD_CHIP} ring-yellow-400/50`}
    >
      <CoinStack coins={coins} goal={RULES.scienceGoal} />
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-yellow-100">{COIN_LABEL.name} from Science</span>
        <span className="text-2xl font-black text-yellow-300">
          <motion.span
            key={coins}
            className="inline-block"
            initial={reducedMotion ? false : { scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {coins}
          </motion.span>{' '}
          <span className="text-sm font-bold text-yellow-100/80">/ {RULES.scienceGoal}</span>
        </span>
      </span>
    </div>
  );
}

function SolCounter({ game }: { game: GameState }) {
  return (
    <div className={`flex flex-col px-3 py-2 ${HUD_CHIP}`}>
      <h1 className="text-2xl font-black leading-none sm:text-3xl">Sol {displaySol(game.sol)}</h1>
      <span className="text-xs font-bold text-slate-300 sm:text-sm">{dateForSol(game.missionStartDate, game.sol)}</span>
      <span className="text-xs font-bold text-slate-200 sm:text-sm">
        <span aria-hidden>📅 </span>Day: {game.sol} of {game.maxSols}
      </span>
    </div>
  );
}

/** Tooltip side per gauge. Phone gauges are narrower than the tooltip, so each half opens towards the middle. */
function tooltipAlign(index: number): { base: TooltipAlign; md: TooltipAlign } {
  const last = RESOURCE_KEYS.length - 1;
  return {
    base: index < RESOURCE_KEYS.length / 2 ? 'left' : 'right',
    md: index === 0 ? 'left' : index === last ? 'right' : 'center',
  };
}

/**
 * Sits on top of the outpost picture: the sol, the coins and the six meters - shown once, only here.
 * Below `md` the meters drop to the bottom of the picture so the outpost stays visible in the middle.
 */
export function StatusBar({ game }: { game: GameState }) {
  return (
    <header className="flex h-full flex-col justify-between gap-2 md:h-auto md:justify-start md:gap-3">
      <div className="pointer-events-auto flex items-start justify-between gap-2">
        <SolCounter game={game} />
        <CoinCounter coins={game.science} />
      </div>
      <div className="pointer-events-auto grid grid-cols-6 gap-1.5 md:gap-2">
        {RESOURCE_KEYS.map((key, index) => (
          <ResourceGauge key={key} meter={key} value={game.resources[key]} align={tooltipAlign(index)} />
        ))}
      </div>
    </header>
  );
}

export function EventsPanel({ game }: { game: GameState }) {
  const event = EVENTS_BY_ID.get(game.event.eventId);
  const lastReport = game.history.at(-1);
  const lastChoice = lastReport ? CHOICES_BY_ID.get(lastReport.choiceId) : undefined;

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl bg-orange-950/70 p-3 shadow-lg ring-2 ring-orange-400 backdrop-blur-md"
      data-testid="event"
    >
      <div aria-live="polite" className="flex flex-col gap-1">
        {event && (
          <>
            <h2 className="text-lg font-extrabold leading-tight">
              <span aria-hidden>{event.icon}</span> {event.title}
            </h2>
            <p className="text-sm text-orange-50">{event.description}</p>
            {game.event.flare && (
              <p className="text-sm font-bold text-orange-200">
                Real NASA data: {game.event.flare.classType} solar flare on {game.event.flare.date} (DONKI)
              </p>
            )}
            {Object.keys(event.impact).length > 0 && (
              <p className="text-sm text-orange-100">
                <span aria-hidden>⚠️ </span>If nobody handles it: {describeImpact(event.impact)}
              </p>
            )}
          </>
        )}
        {lastReport && (
          <p className="mt-1 border-t border-orange-400/30 pt-1.5 text-sm text-slate-200">
            <strong>Yesterday (Sol {displaySol(lastReport.sol)}):</strong> {lastChoice?.title}.
            {Object.keys(lastReport.avoidedImpact).length > 0 && ` You saved ${describeSaved(lastReport.avoidedImpact)}.`}
            {Object.keys(lastReport.impactApplied).length > 0 && ` Lost: ${describeImpact(lastReport.impactApplied)}.`}
            {lastReport.messages.length > 0 && ` ${lastReport.messages.join(' ')}`}
          </p>
        )}
      </div>
      <RealDataBadge compact />
    </div>
  );
}
