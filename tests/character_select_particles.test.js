import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createCharacterParticleRuntime } from '../game/features/title/platform/browser/character_select_particles.js';

describe('character select particles', () => {
  it('keeps the entry file split across focused particle helpers', () => {
    const root = process.cwd();
    const entry = fs.readFileSync(
      path.join(root, 'game/features/title/platform/browser/character_select_particles.js'),
      'utf8',
    );

    expect(fs.existsSync(path.join(root, 'game/features/title/platform/browser/character_particle_model.js'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'game/features/title/platform/browser/character_particle_runtime.js'))).toBe(true);
    expect(entry).toContain("./character_particle_model.js".replace('./', ''));
    expect(entry).toContain("./character_particle_runtime.js".replace('./', ''));
  });

  it('starts and stops the canvas particle loop through the stable runtime export', () => {
    const clearRect = vi.fn();
    const getContext = vi.fn(() => ({
      clearRect,
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      globalCompositeOperation: 'source-over',
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      translate: vi.fn(),
      rotate: vi.fn(),
    }));
    const canvas = {
      clientWidth: 120,
      clientHeight: 80,
      width: 0,
      height: 0,
      getContext,
    };
    const doc = {
      getElementById: vi.fn((id) => (id === 'particleCanvas' ? canvas : null)),
    };
    const requestAnimationFrameImpl = vi.fn(() => 77);
    const cancelAnimationFrameImpl = vi.fn();

    const runtime = createCharacterParticleRuntime({
      doc,
      requestAnimationFrameImpl,
      cancelAnimationFrameImpl,
    });

    runtime.start('rage', '#ff3366');
    runtime.stop();

    expect(getContext).toHaveBeenCalledWith('2d');
    expect(canvas.width).toBe(120);
    expect(canvas.height).toBe(80);
    expect(clearRect).toHaveBeenCalled();
    expect(requestAnimationFrameImpl).toHaveBeenCalled();
    expect(cancelAnimationFrameImpl).toHaveBeenCalled();
  });
});
