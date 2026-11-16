import type { SceneSnapshot } from '../scene';

export interface MartianOdysseyHook extends Partial<SceneSnapshot> {
  sceneReady: boolean;
  canvasCount: number;
}

declare global {
  interface Window {
    /** Read-only scene state for Playwright; only present with `?e2e` in the URL. */
    __MARTIAN_ODYSSEY__?: Readonly<MartianOdysseyHook>;
  }
}

const enabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e');

function canvasCount(): number {
  return document.querySelectorAll('canvas').length;
}

export function publishSceneSnapshot(snapshot: SceneSnapshot): void {
  if (enabled) window.__MARTIAN_ODYSSEY__ = Object.freeze({ ...snapshot, canvasCount: canvasCount() });
}

export function clearSceneSnapshot(): void {
  if (enabled) window.__MARTIAN_ODYSSEY__ = Object.freeze({ sceneReady: false, canvasCount: canvasCount() });
}
