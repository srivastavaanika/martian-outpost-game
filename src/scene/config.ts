import Phaser from 'phaser';
import { DESIGN } from './layout';

export { DESIGN, MODULES, METER_MODULES, anchorOf } from './layout';
export type { ModuleId, ModuleLayout } from './layout';

/** Visual settings only. Game-balance numbers live in src/engine/config.ts. */
export const SCENE_TITLE = 'Martian Odyssey';

export function createGameConfig(parent: HTMLElement, scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    title: SCENE_TITLE,
    parent,
    width: DESIGN.width,
    height: DESIGN.height,
    transparent: true,
    scale: { mode: Phaser.Scale.ENVELOP, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true },
    banner: false,
    scene: scenes,
  };
}
