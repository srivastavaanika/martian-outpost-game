import { motion } from 'framer-motion';
import { useId, useState } from 'react';
import { isWarning, METERS, SITES } from '../engine';
import type { ResourceKey } from '../engine';
import { RESOURCE_LABELS } from './labels';

export type TooltipAlign = 'left' | 'center' | 'right';

/** Full class sets (with resets) so Tailwind sees every literal and the breakpoints never mix. */
const TOOLTIP_ALIGN: Record<TooltipAlign, string> = {
  left: 'left-0 right-auto translate-x-0',
  center: 'left-1/2 right-auto -translate-x-1/2',
  right: 'left-auto right-0 translate-x-0',
};
const TOOLTIP_ALIGN_MD: Record<TooltipAlign, string> = {
  left: 'md:left-0 md:right-auto md:translate-x-0',
  center: 'md:left-1/2 md:right-auto md:-translate-x-1/2',
  right: 'md:left-auto md:right-0 md:translate-x-0',
};

const DANGER_STRIPES = 'repeating-linear-gradient(135deg, rgba(248,113,113,0.85) 0 3px, transparent 3px 6px)';
/** Supplies the crew can run out of get a bolder zone so the critical range stands out. */
const CRITICAL_STRIPES =
  'repeating-linear-gradient(135deg, rgb(239,68,68) 0 4px, rgb(127,29,29) 4px 8px)';
const SEGMENTS = 'repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), rgba(2,6,23,0.85) calc(10% - 2px) 10%)';

function sourceNote(meter: ResourceKey): string {
  if (meter === 'radiation') {
    return `The daily ${SITES.mars.baselineDoseMsvPerSol} mSv is a real Curiosity rover measurement. The ${METERS.radiation.failAt} mSv limit is a game number.`;
  }
  return 'The unit is real; the amounts are game numbers.';
}

export function ResourceGauge({
  meter,
  value,
  align = { base: 'center', md: 'center' },
}: {
  meter: ResourceKey;
  value: number;
  /** Where the tooltip sits under the gauge, so edge gauges never push past the screen. */
  align?: { base: TooltipAlign; md: TooltipAlign };
}) {
  const config = METERS[meter];
  const label = RESOURCE_LABELS[meter];
  const tooltipId = useId();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = pinned || hovered || focused;

  const fraction = Math.max(0, Math.min(1, value / config.max));
  const warnFraction = config.warnAt / config.max;
  const warning = isWarning(meter, value);
  const keepHigh = config.direction === 'higher';
  const warningText = keepHigh ? 'Low!' : 'Too high!';
  const danger = keepHigh
    ? { left: 0, width: `${warnFraction * 100}%` }
    : { left: `${warnFraction * 100}%`, width: `${(1 - warnFraction) * 100}%` };

  return (
    <div
      role="meter"
      tabIndex={0}
      aria-label={label.name}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={config.max}
      aria-valuetext={`${value} ${config.unit}${warning ? `, ${warningText}` : ''}`}
      aria-describedby={tooltipId}
      data-testid={`meter-${meter}`}
      onClick={() => setPinned((p) => !p)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPinned((p) => !p);
        }
        if (e.key === 'Escape') setPinned(false);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setPinned(false);
      }}
      className={`relative flex min-h-12 cursor-help flex-col items-center gap-1 rounded-xl p-1.5 text-center shadow-lg ring-2 backdrop-blur-md md:items-stretch md:gap-1.5 md:rounded-2xl md:p-2 md:text-left ${warning ? 'bg-red-950/80 ring-red-400' : 'bg-slate-950/65 ring-white/15'}`}
    >
      <div className="flex flex-col items-center gap-0.5 md:flex-row md:gap-2">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full text-base shadow-inner md:size-8 md:text-lg ${label.color}`}
          aria-hidden
        >
          {label.icon}
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="hidden text-xs font-bold text-slate-200 md:block">{label.name}</span>
          <span className={`text-xs font-black md:text-base ${warning ? 'text-red-200' : 'text-white'}`}>
            {value} <span className="block text-[10px] font-bold text-slate-300 md:inline md:text-xs">{config.unit}</span>
          </span>
        </span>
      </div>

      <span
        className={`relative block w-full overflow-hidden rounded-full bg-slate-800 ring-1 md:h-3 ${keepHigh ? 'h-2.5 ring-red-400/70' : 'h-2 ring-black/40'}`}
        aria-hidden
      >
        <span
          className="absolute inset-y-0"
          style={{ ...danger, backgroundImage: keepHigh ? CRITICAL_STRIPES : DANGER_STRIPES }}
        />
        <motion.span
          className={`absolute inset-y-0 left-0 rounded-full ${warning ? 'bg-red-500' : label.color}`}
          initial={false}
          animate={{ width: `${fraction * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <span className="absolute inset-0" style={{ backgroundImage: SEGMENTS }} />
        {keepHigh && (
          <span
            className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_4px_rgb(248_113_113)]"
            style={{ left: `calc(${warnFraction * 100}% - 1px)` }}
          />
        )}
      </span>

      {warning ? (
        <span className="text-[10px] font-black text-red-100 md:text-xs">
          <span aria-hidden>⚠️ </span>
          {warningText}
        </span>
      ) : (
        <span className="hidden text-[11px] font-bold leading-none text-red-300 md:block">
          Danger {keepHigh ? 'under' : 'over'} {config.warnAt} {config.unit}
        </span>
      )}

      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute bottom-full z-30 mb-2 w-56 md:top-full md:bottom-auto md:mt-2 md:mb-0 rounded-xl bg-slate-800 p-3 text-left text-sm text-slate-100 shadow-xl ring-1 ring-slate-500 ${TOOLTIP_ALIGN[align.base]} ${TOOLTIP_ALIGN_MD[align.md]} ${open ? 'block' : 'hidden'}`}
      >
        <strong className="block">
          {label.name} ({config.unit})
        </strong>
        {label.explain} {keepHigh ? 'Keep it high.' : 'Keep it low.'}{' '}
        {keepHigh
          ? `Warning at ${config.warnAt} ${config.unit}. The mission ends at ${config.failAt}.`
          : `Warning at ${config.warnAt} ${config.unit}. The mission ends at ${config.failAt} ${config.unit}.`}
        <span className="mt-1 block text-xs text-slate-400">{sourceNote(meter)}</span>
      </span>
    </div>
  );
}
