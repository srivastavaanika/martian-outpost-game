import { useId } from 'react';

/** A gold coin with a raised rim and a star, seen from the front. Decorative: the number next to it is the label. */
export function CoinIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden className={`inline-block shrink-0 align-[-0.2em] ${className}`}>
      <defs>
        <radialGradient id={`${id}-face`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill={`url(#${id}-rim)`} />
      <circle cx="16" cy="16" r="12.5" fill={`url(#${id}-face)`} stroke="#a16207" strokeWidth="0.8" />
      <circle cx="16" cy="16" r="10.6" fill="none" stroke="#fef3c7" strokeOpacity="0.7" strokeWidth="0.7" strokeDasharray="1 1.3" />
      <path
        d="M16 9.2l2 4.1 4.5.6-3.3 3.1.8 4.5-4-2.2-4 2.2.8-4.5-3.3-3.1 4.5-.6z"
        fill="#ca8a04"
        stroke="#fef08a"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <ellipse cx="10.5" cy="9" rx="4.2" ry="1.6" fill="#fff" opacity="0.5" transform="rotate(-35 10.5 9)" />
    </svg>
  );
}

const STACK = { width: 48, coinRx: 18, coinRy: 6, thickness: 4.5, maxCoins: 10 } as const;

/** A side-on pile of gold coins: one coin per tenth of the goal, so the pile is full at the goal. */
export function CoinStack({ coins, goal }: { coins: number; goal: number }) {
  const id = useId();
  const count = Math.max(0, Math.min(STACK.maxCoins, Math.floor((coins / goal) * STACK.maxCoins)));
  const height = STACK.coinRy * 2 + STACK.thickness * STACK.maxCoins + 2;
  const cx = STACK.width / 2;
  const bottom = height - STACK.coinRy - 1;

  return (
    <svg viewBox={`0 0 ${STACK.width} ${height}`} width={STACK.width} height={height} aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx="40%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="55%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      {count === 0 && (
        <ellipse
          cx={cx}
          cy={bottom}
          rx={STACK.coinRx}
          ry={STACK.coinRy}
          fill="none"
          stroke="#fde68a"
          strokeOpacity="0.6"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}
      {Array.from({ length: count }, (_, i) => {
        const y = bottom - i * STACK.thickness;
        const top = i === count - 1;
        return (
          <g key={i}>
            <path
              d={`M ${cx - STACK.coinRx} ${y - STACK.thickness} v ${STACK.thickness} a ${STACK.coinRx} ${STACK.coinRy} 0 0 0 ${STACK.coinRx * 2} 0 v ${-STACK.thickness} z`}
              fill={`url(#${id}-edge)`}
              stroke="#78350f"
              strokeWidth="0.6"
            />
            <ellipse
              cx={cx}
              cy={y - STACK.thickness}
              rx={STACK.coinRx}
              ry={STACK.coinRy}
              fill={top ? `url(#${id}-top)` : '#f59e0b'}
              stroke="#a16207"
              strokeWidth="0.6"
            />
            {top && (
              <ellipse
                cx={cx}
                cy={y - STACK.thickness}
                rx={STACK.coinRx - 4}
                ry={STACK.coinRy - 1.6}
                fill="none"
                stroke="#fef3c7"
                strokeOpacity="0.8"
                strokeWidth="0.8"
                strokeDasharray="1.2 1.4"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
