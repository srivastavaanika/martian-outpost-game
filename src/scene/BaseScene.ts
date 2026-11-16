import Phaser from 'phaser';
import { isWarning, METERS } from '../engine';
import type { GameState } from '../engine';
import { CuePlayer } from './CuePlayer';
import { cuesForSol } from './cues';
import type { SceneCue } from './cues';
import { METER_MODULES, MODULES } from './config';
import type { ModuleId } from './config';

/** Registry keys shared with the bridge in src/ui/PhaserGame.tsx. */
export const REGISTRY = {
  gameState: 'gameState',
  snapshot: 'snapshot',
  onModuleTap: 'onModuleTap',
  reducedMotion: 'reducedMotion',
} as const;

/** Read-only view of what the scene is showing, for tests (`?e2e`). */
export interface SceneSnapshot {
  sceneReady: boolean;
  sol: number;
  eventId: string;
  modules: Partial<Record<ModuleId, { value: number; unit: string; warning: boolean }>>;
  /** The cues played for the latest state, e.g. "event-start:dust-storm", "flare:event:X3.9". */
  cues: string[];
}

function cueId(cue: SceneCue): string {
  switch (cue.type) {
    case 'event-start':
      return `event-start:${cue.eventId}`;
    case 'flare':
      return `flare:${cue.strength}:${cue.classType}`;
    case 'resource-delta':
    case 'impact-avoided':
      return `${cue.type}:${cue.key}:${cue.amount}`;
    case 'crew-outside':
      return `crew-outside:${cue.module}`;
  }
}

/**
 * A transparent layer over the outpost picture. The meters are shown once, in the React overlay;
 * this scene holds the tap areas and plays each sol's cues.
 */
export class BaseScene extends Phaser.Scene {
  private player!: CuePlayer;
  private shownKey: string | null = null;
  private lastCues: string[] = [];

  constructor() {
    super('BaseScene');
  }

  create(): void {
    for (const id of Object.keys(MODULES) as ModuleId[]) this.addTapArea(id);
    this.player = new CuePlayer(this, Boolean(this.registry.get(REGISTRY.reducedMotion)));

    const onChange = (_parent: unknown, value: GameState) => this.render(value);
    this.registry.events.on(`changedata-${REGISTRY.gameState}`, onChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off(`changedata-${REGISTRY.gameState}`, onChange);
      this.player.stop();
    });

    const state = this.registry.get(REGISTRY.gameState) as GameState | undefined;
    if (state) this.render(state);
  }

  private addTapArea(id: ModuleId): void {
    const layout = MODULES[id];
    this.add
      .zone(layout.x, layout.y, layout.width, layout.height)
      .setOrigin(0)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_UP, () => {
        const onTap = this.registry.get(REGISTRY.onModuleTap) as ((moduleId: ModuleId) => void) | undefined;
        onTap?.(id);
      });
  }

  /** Plays cues once per new sol (or new mission); other updates only refresh the snapshot. */
  private render(state: GameState): void {
    const key = `${state.seed}:${state.history.length}:${state.status}`;
    if (key !== this.shownKey) {
      this.shownKey = key;
      const cues = cuesForSol(state.history.at(-1), state);
      this.lastCues = cues.map(cueId);
      this.player.play(cues);
    }

    const modules: SceneSnapshot['modules'] = {};
    for (const meter of METER_MODULES) {
      const value = state.resources[meter];
      modules[meter] = { value, unit: METERS[meter].unit, warning: isWarning(meter, value) };
    }
    modules.coins = { value: state.science, unit: 'coins', warning: false };

    const snapshot: SceneSnapshot = {
      sceneReady: true,
      sol: state.sol,
      eventId: state.event.eventId,
      modules,
      cues: this.lastCues,
    };
    this.registry.set(REGISTRY.snapshot, snapshot);
  }
}
