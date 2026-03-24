import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FovEngine } from '../engine/fov.js';
import { ParticleSystem } from '../engine/particles.js';
import { ScreenShake } from '../engine/screenshake.js';

function createCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    translate: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  };
}

describe('engine visual effects', () => {
  beforeEach(() => {
    ParticleSystem.setEnabled(true);
    ScreenShake.setEnabled(true);
  });

  it('generates and reveals maze tiles around the player', () => {
    const maze = FovEngine.generateMaze(9, 9);
    FovEngine.computeFov(1, 1, 3);

    expect(maze).toHaveLength(9);
    expect(maze[1][1]).toBe(0);
    expect(FovEngine.getVisible().has('1,1')).toBe(true);
    expect(FovEngine.getRevealed().has('1,1')).toBe(true);
  });

  it('renders particles only while enabled and resets the pool when disabled', () => {
    const ctx = createCtx();
    const canvas = { getContext: vi.fn(() => ctx) };
    ParticleSystem.init(canvas);
    ParticleSystem.hitEffect(10, 20, true);
    ParticleSystem.update();

    expect(ctx.save).toHaveBeenCalled();

    ParticleSystem.setEnabled(false);
    ctx.save.mockClear();
    ParticleSystem.hitEffect(10, 20, true);
    ParticleSystem.update();

    expect(ctx.save).not.toHaveBeenCalled();
    expect(ParticleSystem.isEnabled()).toBe(false);
  });

  it('applies shake offsets only while enabled', () => {
    const ctx = createCtx();
    ScreenShake.shake(8, 0.4);
    ScreenShake.update();
    ScreenShake.apply(ctx);

    expect(ctx.translate).toHaveBeenCalledTimes(1);

    ScreenShake.setEnabled(false);
    ctx.translate.mockClear();
    ScreenShake.update();
    ScreenShake.apply(ctx);

    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ScreenShake.isEnabled()).toBe(false);
  });
});
