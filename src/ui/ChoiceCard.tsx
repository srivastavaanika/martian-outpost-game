import { motion, useReducedMotion } from 'framer-motion';
import { helpsMeter, METERS } from '../engine';
import type { Choice, ChoiceOutlook, Effects, GameEvent, ResourceKey } from '../engine';
import { CoinIcon } from './Coin';
import { EFFECT_LABELS, formatAmount, LOSS_MESSAGES, RESOURCE_LABELS } from './labels';

function EffectChips({ effects }: { effects: Effects }) {
  const entries = (Object.entries(effects) as [keyof Effects, number][]).filter(([, amount]) => amount !== 0);
  return (
    <ul className="mt-auto flex flex-wrap gap-1" aria-label="What this costs and gives">
      {entries.map(([key, amount]) => {
        const isGain = key === 'science' ? amount > 0 : helpsMeter(key, amount);
        return (
          <li
            key={key}
            className={`rounded-full px-2 py-0.5 text-xs font-bold md:text-sm ${isGain ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}
          >
            {key === 'science' ? <CoinIcon size={16} /> : <span aria-hidden>{EFFECT_LABELS[key].icon}</span>}{' '}
            {EFFECT_LABELS[key].name} {formatAmount(key, amount)}
          </li>
        );
      })}
    </ul>
  );
}

function avoidText(choice: Choice, event: GameEvent): string {
  const avoids = choice.avoids ?? 0;
  if (Object.keys(event.impact).length === 0) return `Handles: ${event.title}`;
  if (avoids >= 1) return `Handles: ${event.title} - stops all of it`;
  if (avoids > 0) return `Handles: ${event.title} - stops half of it`;
  return `Handles: ${event.title} - does not stop it`;
}

function meterList(keys: readonly ResourceKey[], withLevel: boolean): string {
  const names = keys.map((key) => {
    const name = RESOURCE_LABELS[key].name;
    if (!withLevel) return name;
    return `${METERS[key].direction === 'higher' ? 'low' : 'high'} ${name}`;
  });
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : (names[0] ?? '');
}

const FACE = 'col-start-1 row-start-1 flex flex-col rounded-2xl p-3 text-left ring-2';
const HIDE_BACKFACE = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const;

/**
 * Tapping the front flips the card to its lesson; the choice is only applied from the back, so the lesson stays on
 * screen until the player is ready for the next sol.
 */
export function ChoiceCard({
  choice,
  event,
  flipped,
  disabled,
  continueLabel,
  outlook,
  onFlip,
  onChoose,
  onBack,
}: {
  choice: Choice;
  /** The sol's event, when this card is one of its response cards. */
  event?: GameEvent;
  flipped: boolean;
  /** Another card is showing its lesson. */
  disabled: boolean;
  continueLabel: string;
  outlook: ChoiceOutlook;
  onFlip: (id: string) => void;
  onChoose: (id: string) => void;
  /** Turn the card back over to pick another one. */
  onBack: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const risky = outlook.ends !== null || outlook.dangers.length > 0;
  const rotate = reduceMotion ? 0 : flipped ? 180 : 0;

  return (
    <div className="grid [perspective:1000px]">
      <motion.div
        className="col-start-1 row-start-1 grid [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: rotate }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {(!flipped || !reduceMotion) && (
          <motion.button
            type="button"
            onClick={() => onFlip(choice.id)}
            disabled={disabled || flipped}
            inert={flipped}
            aria-hidden={flipped}
            whileHover={disabled || flipped ? undefined : { y: -4 }}
            whileTap={disabled || flipped ? undefined : { scale: 0.97 }}
            style={HIDE_BACKFACE}
            className={`${FACE} cursor-pointer gap-1.5 bg-slate-800/90 ring-slate-700 transition-colors hover:bg-slate-700/90 hover:ring-yellow-400 disabled:cursor-default disabled:hover:bg-slate-800/90 disabled:hover:ring-slate-700 ${disabled ? 'opacity-50' : ''}`}
            data-testid={`choice-${choice.id}`}
          >
            <span className="flex items-center gap-2">
              <span className="text-3xl leading-none" aria-hidden>
                {choice.icon}
              </span>
              <span className="text-base font-extrabold leading-tight md:text-lg">{choice.title}</span>
            </span>
            {event && (
              <span className="self-start rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-100 ring-1 ring-orange-400">
                <span aria-hidden>{event.icon} </span>
                {avoidText(choice, event)}
              </span>
            )}
            {outlook.helps.length > 0 && (
              <span
                className="self-start rounded-full bg-emerald-500/25 px-2 py-0.5 text-xs font-black text-emerald-100 ring-1 ring-emerald-400 md:text-sm"
                data-testid="helps-tag"
              >
                ✅ Fixes {meterList(outlook.helps, true)}!
              </span>
            )}
            <span className="hidden text-sm leading-snug text-slate-300 sm:block">{choice.description}</span>
            <EffectChips effects={choice.effects} />
          </motion.button>
        )}

        {flipped && (
          <div
            role="region"
            aria-label={`What we learned: ${choice.title}`}
            aria-live="polite"
            style={reduceMotion ? undefined : { ...HIDE_BACKFACE, transform: 'rotateY(180deg)' }}
            className={`${FACE} gap-2 bg-indigo-950/95 ring-yellow-400`}
            data-testid="lesson"
          >
            <span className="flex items-center gap-2 text-sm font-black text-yellow-300 md:text-base">
              <span aria-hidden>💡</span> Did you know?
            </span>
            <p className="text-sm leading-snug text-slate-100 md:text-base">{choice.lesson}</p>
            {risky && (
              <p
                className="rounded-xl bg-orange-500/20 px-2 py-1.5 text-sm font-bold leading-snug text-orange-100 ring-1 ring-orange-400"
                data-testid="risk-warning"
              >
                <span aria-hidden>⚠️ </span>
                {outlook.ends
                  ? `Careful! If you pick this, the mission ends today. ${LOSS_MESSAGES[outlook.ends].title}`
                  : `Heads up: ${meterList(outlook.dangers, false)} will be in the danger zone after this.`}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-end gap-2">
              {risky && (
                <button
                  type="button"
                  onClick={onBack}
                  className="min-h-11 cursor-pointer rounded-full bg-slate-700 px-4 py-2 text-base font-bold text-white ring-1 ring-slate-500 hover:bg-slate-600"
                  data-testid="pick-another"
                >
                  ↩ Pick another
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => onChoose(choice.id)}
                className="min-h-11 cursor-pointer rounded-full bg-yellow-400 px-5 py-2 text-base font-black text-slate-950 hover:bg-yellow-300"
                data-testid="continue"
              >
                {continueLabel} ➜
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
