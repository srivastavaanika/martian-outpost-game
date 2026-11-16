import { useEffect, useRef } from 'react';
import type { ModuleId, SceneHandle } from '../scene';
import { useGameStore } from '../store';
import { clearSceneSnapshot, publishSceneSnapshot } from './testHook';

/** A transparent layer over the outpost picture: lazy-loads Phaser and keeps exactly one game alive while mounted. */
export function PhaserGame({ onModuleTap }: { onModuleTap?: (moduleId: ModuleId) => void }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const onModuleTapRef = useRef(onModuleTap);

  useEffect(() => {
    onModuleTapRef.current = onModuleTap;
  }, [onModuleTap]);

  useEffect(() => {
    let cancelled = false;
    let handle: SceneHandle | null = null;
    let unsubscribe: (() => void) | null = null;

    void import('../scene').then(({ startScene }) => {
      const parent = parentRef.current;
      const state = useGameStore.getState().game;
      if (cancelled || !parent || !state) return;
      handle = startScene(parent, {
        state,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onModuleTap: (moduleId) => onModuleTapRef.current?.(moduleId),
        onSnapshot: publishSceneSnapshot,
      });
      unsubscribe = useGameStore.subscribe((store) => {
        if (store.game) handle?.setState(store.game);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
      handle?.destroy();
      clearSceneSnapshot();
    };
  }, []);

  return (
    <div
      ref={parentRef}
      aria-hidden
      data-testid="scene"
      className="absolute inset-0 overflow-hidden"
    />
  );
}
