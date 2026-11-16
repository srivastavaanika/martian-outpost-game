import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { GameState } from '../engine';
import { COIN_LABEL, displaySol, LOSS_MESSAGES, RESOURCE_LABELS } from './labels';

const SHOW_MS = 4500;
const CONFETTI = ['🎉', '⭐', '🚀', '✨', '🪐', '🏅'];
const PIECES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const reach = 180 + (i % 3) * 70;
  return {
    emoji: CONFETTI[i % CONFETTI.length],
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach,
    delay: (i % 2) * 0.5,
  };
});

const LOOK = {
  won: {
    backdrop: 'bg-indigo-950/70',
    ring: 'ring-yellow-300/70',
    stamp: 'border-yellow-300 bg-indigo-950/80 text-yellow-200 shadow-[0_0_40px_rgb(250_204_21/0.6)]',
    title: 'Mission Complete',
    tint: 'text-yellow-200',
    note: 'Amazing work, Captain! Your crew is proud of you.',
    button: 'See your mission ➜',
  },
  lost: {
    backdrop: 'bg-red-950/70',
    ring: 'ring-red-500/60',
    stamp: 'border-red-400 bg-red-950/80 text-red-100 shadow-[0_0_40px_rgb(239_68_68/0.6)]',
    title: 'Mission Failed',
    tint: 'text-red-200',
    note: 'The crew is safe. Let\u2019s see what happened!',
    button: 'See what happened ➜',
  },
};

/**
 * A big end-of-mission stamp over the debrief: gold with confetti for a win, red for a loss. Kind wording,
 * one soft pulse - never a strobe. It closes by itself or from its button, then hands focus to `onClose`.
 */
export function MissionEndStamp({ game, onClose }: { game: GameState; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const won = game.status === 'won';
  const look = won ? LOOK.won : LOOK.lost;
  const reason = game.lossReason;
  const sol = game.history.at(-1)?.sol ?? game.sol;
  const icon = won ? '🏆' : reason === 'science' ? COIN_LABEL.icon : reason ? RESOURCE_LABELS[reason].icon : '🚨';
  const headline = won
    ? `Your crew made it to Sol ${displaySol(game.maxSols)} with ${game.science} coins from science!`
    : `${reason ? LOSS_MESSAGES[reason].title : 'The mission is over.'} (Sol ${displaySol(sol)})`;

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="mission-end-title"
          aria-describedby="mission-end-text"
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden p-4 backdrop-blur-sm ${look.backdrop}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          onClick={() => setOpen(false)}
          data-testid={won ? 'mission-complete' : 'mission-failed'}
        >
          {!reduceMotion && (
            <motion.span
              aria-hidden
              className={`pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full ring-8 sm:size-96 ${look.ring}`}
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.4, delay: 0.35, ease: 'easeOut' }}
            />
          )}
          {won &&
            !reduceMotion &&
            PIECES.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-1/2 text-3xl sm:text-4xl"
                initial={{ x: 0, y: 0, scale: 0.3, rotate: 0, opacity: 1 }}
                animate={{ x: p.x, y: p.y + 120, scale: 1, rotate: 360, opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.3 + p.delay, ease: 'easeOut' }}
              >
                {p.emoji}
              </motion.span>
            ))}
          <motion.div
            className="relative flex max-w-lg flex-col items-center gap-3 text-center"
            initial={reduceMotion ? false : { scale: 2.4, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: won ? 0 : -6, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          >
            <span className="text-6xl sm:text-7xl" aria-hidden>
              {icon}
            </span>
            <h2
              id="mission-end-title"
              className={`rounded-2xl border-8 border-double px-6 py-3 text-4xl font-black tracking-widest uppercase sm:text-6xl ${look.stamp}`}
            >
              {look.title}
            </h2>
          </motion.div>
          <motion.div
            className="relative flex max-w-lg flex-col items-center gap-3 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.7 }}
          >
            <p id="mission-end-text" className="text-xl font-extrabold text-white sm:text-2xl">
              {headline}
            </p>
            <p className={`text-base sm:text-lg ${look.tint}`}>{look.note}</p>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              className="min-h-12 cursor-pointer rounded-full bg-yellow-400 px-6 py-3 text-lg font-black text-slate-950 hover:bg-yellow-300"
            >
              {look.button}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
