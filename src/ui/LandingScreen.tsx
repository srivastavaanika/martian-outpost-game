import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { RULES } from '../engine';
import { useGameStore } from '../store';
import { displaySol } from './labels';

const LANDING = `${import.meta.env.BASE_URL}assets/landing/`;
const STARS = { small: `${LANDING}space-stars-960.webp`, large: `${LANDING}space-stars-1920.webp` };

const FLIGHT_SECONDS = 4;

function Rocket() {
  return (
    <svg viewBox="0 0 64 64" className="h-20 w-20 drop-shadow-[0_0_14px_rgba(251,191,36,0.7)] sm:h-24 sm:w-24" aria-hidden>
      <path d="M32 4c10 8 14 20 12 34H20C18 24 22 12 32 4z" fill="#e2e8f0" />
      <circle cx="32" cy="24" r="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <path d="M20 38l-8 12 10-4zM44 38l8 12-10-4z" fill="#ef4444" />
      <path d="M26 42h12l-3 8h-6z" fill="#f59e0b" />
      <path d="M28 50h8l-4 10z" fill="#fde047" />
    </svg>
  );
}

export function LandingScreen() {
  const startMission = useGameStore((s) => s.startMission);
  const reduceMotion = useReducedMotion();
  const [flightDone, setFlightDone] = useState(false);
  const arrived = flightDone || Boolean(reduceMotion);

  return (
    <section className="relative isolate flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-3xl bg-black ring-1 ring-slate-800">
      <img
        src={STARS.small}
        srcSet={`${STARS.small} 960w, ${STARS.large} 1920w`}
        sizes="100vw"
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <img
        src={`${LANDING}planet-earth.webp`}
        alt="Earth, photographed by the Apollo 17 crew"
        className="absolute bottom-[-5rem] left-[-5rem] -z-10 h-64 w-64 drop-shadow-[0_0_40px_rgba(56,189,248,0.35)] sm:bottom-[-4rem] sm:left-[-3rem] sm:h-96 sm:w-96"
      />
      <img
        src={`${LANDING}planet-mars.webp`}
        alt="Mars, photographed by NASA's Mars Global Surveyor"
        className="absolute right-[6%] top-[8%] -z-10 h-28 w-28 drop-shadow-[0_0_30px_rgba(251,146,60,0.35)] sm:h-40 sm:w-40"
      />

      <motion.div
        aria-hidden
        className="absolute"
        initial={reduceMotion ? false : { left: '14%', top: '68%', rotate: 40, scale: 0.9 }}
        animate={
          arrived
            ? { left: '80%', top: '18%', rotate: 60, scale: 0.6 }
            : { left: ['14%', '45%', '80%'], top: ['68%', '36%', '18%'], rotate: [40, 55, 60], scale: [0.9, 1.1, 0.6] }
        }
        transition={{ duration: arrived ? 0.3 : FLIGHT_SECONDS, ease: 'easeInOut' }}
        onAnimationComplete={() => setFlightDone(true)}
      >
        <Rocket />
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col gap-4 p-6 pb-14 sm:p-10 sm:pb-14">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1 [text-shadow:0_2px_8px_rgb(0_0_0/0.8)]">
            <h1 className="text-4xl font-black sm:text-6xl">🚀 Martian Odyssey</h1>
            <p className="text-base font-bold text-slate-200 sm:text-xl">NASA Space Apps: Junior Astronaut Trainer</p>
          </div>
          {!arrived && (
            <button
              type="button"
              onClick={() => setFlightDone(true)}
              className="min-h-12 cursor-pointer rounded-full bg-slate-800/80 px-5 py-2 text-lg font-bold ring-1 ring-slate-600 hover:bg-slate-700"
            >
              Skip ⏭️
            </button>
          )}
        </div>

        <AnimatePresence>
          {arrived && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-auto flex max-w-2xl flex-col gap-4 rounded-3xl bg-slate-900/85 p-6 ring-1 ring-slate-700 backdrop-blur sm:self-end"
            >
              <p className="text-xl leading-relaxed text-slate-100 sm:text-2xl">
                Welcome to Mars! It is <strong>Sol {displaySol(1)}</strong>. You are the captain of the Martian Outpost
                &ldquo;Odyssey&rdquo;. Keep your crew of 10 astronauts safe. Watch the power, oxygen, water, food, radiation, and waste
                capacity. Earn <strong>coins</strong> before Sol {displaySol(RULES.maxSols)} to complete your mission
                successfully.
              </p>
              <button
                type="button"
                onClick={() => startMission('mars')}
                data-testid="enter"
                className="min-h-14 cursor-pointer self-start rounded-full bg-yellow-400 px-10 py-4 text-2xl font-black text-slate-950 hover:bg-yellow-300"
              >
                Let&rsquo;s GO!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="absolute bottom-2 right-3 z-10 max-w-[70%] text-right text-[11px] leading-snug text-slate-400">
        Real NASA photos: stars by the Artemis II crew, Earth by Apollo 17, Mars by Mars Global Surveyor. Put together
        by the game - not to scale.
      </p>
    </section>
  );
}
