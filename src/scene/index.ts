import Phaser from 'phaser';
import type { GameState } from '../engine';
import { BaseScene, REGISTRY } from './BaseScene';
import type { SceneSnapshot } from './BaseScene';
import { createGameConfig } from './config';
import type { ModuleId } from './config';

export type { ModuleId } from './config';
export type { SceneSnapshot } from './BaseScene';

export interface SceneOptions {
  state: GameState;
  reducedMotion: boolean;
  onModuleTap?: (moduleId: ModuleId) => void;
  onSnapshot?: (snapshot: SceneSnapshot) => void;
}

export interface SceneHandle {
  setState: (state: GameState) => void;
  destroy: () => void;
}

/** Creates the Phaser game inside `parent`. The caller owns the returned handle and must destroy it. */
export function startScene(parent: HTMLElement, options: SceneOptions): SceneHandle {
  const game = new Phaser.Game(createGameConfig(parent, [BaseScene]));
  game.registry.set(REGISTRY.reducedMotion, options.reducedMotion);
  game.registry.set(REGISTRY.onModuleTap, options.onModuleTap);
  game.registry.set(REGISTRY.gameState, options.state);

  const onChanged = (_parent: unknown, snapshot: SceneSnapshot) => options.onSnapshot?.(snapshot);
  const onFirstSet = (_parent: unknown, key: string, snapshot: SceneSnapshot) => {
    if (key === REGISTRY.snapshot) options.onSnapshot?.(snapshot);
  };
  game.registry.events.on(`changedata-${REGISTRY.snapshot}`, onChanged);
  game.registry.events.on(Phaser.Data.Events.SET_DATA, onFirstSet);

  return {
    setState: (state) => game.registry.set(REGISTRY.gameState, state),
    destroy: () => {
      game.registry.events.off(`changedata-${REGISTRY.snapshot}`, onChanged);
      game.registry.events.off(Phaser.Data.Events.SET_DATA, onFirstSet);
      game.destroy(true);
    },
  };
}
