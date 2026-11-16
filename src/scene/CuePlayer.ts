import Phaser from 'phaser';
import type { EventEffect, SceneCue } from './cues';
import { anchorOf, DESIGN } from './layout';
import type { ModuleId } from './layout';

function anchor(module: ModuleId | 'sky'): { x: number; y: number } {
  return module === 'sky' ? { x: DESIGN.width / 2, y: 150 } : anchorOf(module);
}

/**
 * Plays one sol's visual effects (flare glow, dust, snow ...) on a fresh layer; a new `play` (or `stop`)
 * cancels whatever is still running. Numbers and labels are not drawn: the meters and the mission log show them.
 */
export class CuePlayer {
  private layer: Phaser.GameObjects.Container | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly reducedMotion: boolean,
  ) {}

  play(cues: readonly SceneCue[]): void {
    this.stop();
    const layer = this.scene.add.container(0, 0);
    this.layer = layer;
    for (const cue of cues) {
      if (cue.type === 'flare') this.flare(layer, cue.strength);
      if (cue.type === 'event-start') this.eventEffect(layer, cue.effect, anchor(cue.module));
    }
  }

  stop(): void {
    if (this.layer) {
      this.scene.tweens.killTweensOf(this.layer.getAll());
      this.layer.destroy(true);
      this.layer = null;
    }
  }

  /** One soft flash (never a strobe) for the flare event; a faint one for a background flare. */
  private flare(layer: Phaser.GameObjects.Container, strength: 'event' | 'background'): void {
    if (this.reducedMotion) return;
    const glow = this.scene.add.rectangle(0, 0, DESIGN.width, DESIGN.height, 0xfff1c2).setOrigin(0).setAlpha(0);
    layer.addAt(glow, 0);
    this.scene.tweens.add({
      targets: glow,
      alpha: strength === 'event' ? 0.45 : 0.16,
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
