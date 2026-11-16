import Phaser from 'phaser';
import type { EventEffect, SceneCue } from './cues';
import { anchorOf, DESIGN } from './layout';
import type { ModuleId } from './layout';

/** Visual timing and placement only; every number shown comes from the cue. */
const TIMING = { avoided: 250, deltas: 550, deltaStagger: 110, eventAfterReport: 1500, hold: 1600 } as const;

/** Vertical offset of each module's floating numbers, so neighbouring habitats never overlap. */
const LABEL_DY: Record<ModuleId, number> = {
  oxygen: -50,
  water: -16,
  food: -50,
  waste: -16,
  coins: -84,
  radiation: -64,
  power: -6,
  rover: -52,
  drill: -52,
};

const FONT = 'Nunito, system-ui, sans-serif';
const COLORS = { gain: '#6ee7b7', cost: '#fca5a5', saved: '#86efac', label: '#fde68a', text: '#f8fafc' } as const;

function anchor(module: ModuleId | 'sky'): { x: number; y: number } {
  return module === 'sky' ? { x: DESIGN.width / 2, y: 150 } : anchorOf(module);
}

/** Plays one sol's cues on a fresh layer; a new `play` (or `stop`) cancels whatever is still running. */
export class CuePlayer {
  private layer: Phaser.GameObjects.Container | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly reducedMotion: boolean,
  ) {}

  play(cues: readonly SceneCue[]): void {
    this.stop();
    const layer = this.scene.add.container(0, 0);
    this.layer = layer;

    const hasReport = cues.some((c) => c.type !== 'event-start' && c.type !== 'flare');
    let deltaIndex = 0;
    for (const cue of cues) {
      let at = 0;
      if (cue.type === 'impact-avoided') at = TIMING.avoided;
      if (cue.type === 'resource-delta') at = TIMING.deltas + TIMING.deltaStagger * deltaIndex++;
      if (cue.type === 'event-start' || cue.type === 'flare') at = hasReport ? TIMING.eventAfterReport : 0;
      this.timers.push(this.scene.time.delayedCall(at, () => this.playCue(cue, layer)));
    }
  }

  stop(): void {
    for (const timer of this.timers) timer.remove();
    this.timers = [];
    if (this.layer) {
      this.scene.tweens.killTweensOf(this.layer.getAll());
      this.layer.destroy(true);
      this.layer = null;
    }
  }

  private playCue(cue: SceneCue, layer: Phaser.GameObjects.Container): void {
    switch (cue.type) {
      case 'crew-outside': {
        const { x, y } = anchor(cue.module);
        this.label(layer, x, y + 46, '🧑‍🚀 Crew outside', COLORS.text, { bob: true });
        break;
      }
      case 'impact-avoided': {
        const { x, y } = anchor(cue.module);
        this.label(layer, x, y + 76, cue.text, COLORS.saved, { rise: 0 });
        break;
      }
      case 'resource-delta': {
        const { x, y } = anchor(cue.module);
        this.label(layer, x, y + LABEL_DY[cue.module], cue.text, cue.gain ? COLORS.gain : COLORS.cost, { rise: 22 });
        break;
      }
      case 'flare':
        this.flare(layer, cue.strength, cue.text);
        break;
      case 'event-start':
        this.eventEffect(layer, cue.effect, anchor(cue.module));
        break;
    }
  }

  /** A floating text pill. Reduced motion: it appears in place and disappears, with no tween. */
  private label(
    layer: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    color: string,
    { rise = 18, bob = false, size = 15 }: { rise?: number; bob?: boolean; size?: number } = {},
  ): void {
    const t = this.scene.add
      .text(x, y, text, {
        fontFamily: FONT,
        fontSize: `${size}px`,
        fontStyle: '900',
        color,
        backgroundColor: 'rgba(2,6,23,0.78)',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setResolution(2);
    layer.add(t);
    if (this.reducedMotion) {
      this.scene.time.delayedCall(TIMING.hold + 400, () => t.destroy());
      return;
    }
    t.setAlpha(0).setScale(0.8);
    this.scene.tweens.add({ targets: t, alpha: 1, scale: 1, duration: 200, ease: 'Back.Out' });
    if (bob) this.scene.tweens.add({ targets: t, y: y - 6, duration: 450, yoyo: true, repeat: 2, ease: 'Sine.InOut' });
    this.scene.tweens.add({
      targets: t,
      y: y - rise,
      alpha: 0,
      delay: TIMING.hold,
      duration: 500,
      onComplete: () => t.destroy(),
    });
  }

  /** One soft flash (never a strobe) for the flare event; a faint one for a background flare. */
  private flare(layer: Phaser.GameObjects.Container, strength: 'event' | 'background', text: string): void {
    const strong = strength === 'event';
    this.label(layer, DESIGN.width / 2, strong ? 190 : 205, text, COLORS.label, { rise: 0, size: strong ? 18 : 14 });
    if (this.reducedMotion) return;
    const glow = this.scene.add.rectangle(0, 0, DESIGN.width, DESIGN.height, 0xfff1c2).setOrigin(0).setAlpha(0);
    layer.addAt(glow, 0);
    this.scene.tweens.add({
      targets: glow,
      alpha: strong ? 0.45 : 0.16,
      duration: 450,
      yoyo: true,
      ease: 'Sine.InOut',
      onComplete: () => glow.destroy(),
    });
  }

  private eventEffect(layer: Phaser.GameObjects.Container, effect: EventEffect, at: { x: number; y: number }): void {
    if (this.reducedMotion || effect === 'none' || effect === 'flare') return;
    const { Between, FloatBetween } = Phaser.Math;
    const dot = (x: number, y: number, r: number, color: number, alpha = 1) => {
      const c = this.scene.add.circle(x, y, r, color, alpha);
      layer.add(c);
      return c;
    };
    const fadeOut = (target: Phaser.GameObjects.GameObject, props: Omit<Phaser.Types.Tweens.TweenBuilderConfig, 'targets'>) =>
      this.scene.tweens.add({ ...props, targets: target, onComplete: () => target.destroy() });

    switch (effect) {
      case 'dust':
        for (let i = 0; i < 36; i++) {
          const d = dot(Between(-120, -10), Between(170, 380), Between(6, 18), 0xb45309, FloatBetween(0.25, 0.55));
          fadeOut(d, { x: DESIGN.width + 40, alpha: 0, duration: Between(1600, 2400), delay: Between(0, 500) });
        }
        break;
      case 'snow':
        for (let i = 0; i < 45; i++) {
          const s = dot(Between(0, DESIGN.width), Between(-30, 0), FloatBetween(1.5, 3.5), 0xffffff, 0.9);
          fadeOut(s, { y: Between(300, 470), x: s.x + Between(-30, 30), alpha: 0.3, duration: Between(1800, 2600), delay: Between(0, 600) });
        }
        break;
      case 'drip':
        for (let i = 0; i < 3; i++) {
          const d = dot(at.x + Between(-10, 10), at.y + 20, 3.5, 0x60a5fa);
          fadeOut(d, { y: at.y + 60, alpha: 0, duration: 650, delay: i * 400 });
        }
        break;
      case 'wilt': {
        const plant = this.scene.add.text(at.x, at.y - 30, '🥀', { fontSize: '26px' }).setOrigin(0.5, 1).setResolution(2);
        layer.add(plant);
        fadeOut(plant, { angle: 50, alpha: 0, delay: 500, duration: 1400, ease: 'Sine.In' });
        break;
      }
      case 'sand':
        for (let i = 0; i < 10; i++) {
          const p = dot(at.x + Between(-35, 35), at.y + 28, Between(5, 10), 0xd97706, 0.6);
          fadeOut(p, { y: p.y - Between(8, 24), scale: 2, alpha: 0, duration: Between(900, 1400), delay: Between(0, 500) });
        }
        break;
      case 'sparks':
        for (let i = 0; i < 12; i++) {
          const angle = FloatBetween(0, Math.PI * 2);
          const s = dot(at.x, at.y + 20, 2.2, 0xfde047);
          fadeOut(s, {
            x: at.x + Math.cos(angle) * Between(18, 40),
            y: at.y + 20 + Math.sin(angle) * Between(18, 40),
            alpha: 0,
            duration: 600,
            delay: Between(0, 400),
          });
        }
        break;
      case 'crack': {
        const g = this.scene.add.graphics({ lineStyle: { width: 2.5, color: 0xf8fafc, alpha: 0.95 } });
        g.beginPath();
        g.moveTo(at.x - 18, at.y - 22);
        [[-8, -10], [-12, 0], [0, 6], [-4, 16], [8, 24]].forEach(([dx, dy]) => g.lineTo(at.x + dx!, at.y + dy!));
        g.strokePath();
        layer.add(g);
        fadeOut(g, { alpha: 0, delay: 1200, duration: 600 });
        break;
      }
      case 'sparkle':
        for (let i = 0; i < 5; i++) {
          const s = this.scene.add
            .text(at.x + Between(-36, 36), at.y + Between(-40, 10), '✨', { fontSize: '18px' })
            .setOrigin(0.5)
            .setResolution(2)
            .setScale(0);
          layer.add(s);
          fadeOut(s, { scale: 1.2, alpha: 0, duration: 900, delay: i * 180, ease: 'Sine.Out' });
        }
        break;
    }
  }
}
