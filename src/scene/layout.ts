import type { ResourceKey } from '../engine';

/**
 * Design size in game units. It matches the 2:1 outpost picture behind the canvas (PIA23302), and both
 * cover their box from the centre (CSS `object-cover`, Phaser `ENVELOP`), so game positions sit on the picture.
 * No Phaser import here, so the pure cue code and its tests can use the layout.
 */
export const DESIGN = { width: 960, height: 480 } as const;

export type ModuleId = ResourceKey | 'coins' | 'rover' | 'drill';

export interface ModuleLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  icon: string;
}

/** Tap areas over the matching landmark in the picture; cues anchor at their centre. */
export const MODULES: Record<ModuleId, ModuleLayout> = {
  oxygen: { x: 412, y: 226, width: 56, height: 68, label: 'Oxygen maker', icon: '💨' },
  water: { x: 468, y: 226, width: 56, height: 68, label: 'Water tank', icon: '💧' },
  food: { x: 524, y: 226, width: 56, height: 68, label: 'Greenhouse', icon: '🥬' },
  waste: { x: 580, y: 226, width: 56, height: 68, label: 'Trash squasher', icon: '🗜️' },
  coins: { x: 636, y: 214, width: 60, height: 80, label: 'Lab & antenna', icon: '🪙' },
  radiation: { x: 760, y: 212, width: 140, height: 96, label: 'Storm shelter', icon: '☢️' },
  power: { x: 482, y: 322, width: 52, height: 48, label: 'Battery box', icon: '⚡' },
  rover: { x: 200, y: 236, width: 90, height: 70, label: 'Rover', icon: '🚙' },
  drill: { x: 320, y: 284, width: 56, height: 72, label: 'Ice drill', icon: '⛏️' },
};

export const METER_MODULES: readonly ResourceKey[] = ['power', 'oxygen', 'water', 'food', 'radiation', 'waste'];

/** Centre of a module's tap area, where its cues play. */
export function anchorOf(id: ModuleId): { x: number; y: number } {
  const m = MODULES[id];
  return { x: m.x + m.width / 2, y: m.y + m.height / 2 };
}
