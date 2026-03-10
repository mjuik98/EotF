import { describe, expect, it, vi } from 'vitest';
import { createCharacterParticleRuntime } from '../game/ui/title/character_select_particles.js';

function createGradient() {
  return {
    addColorStop: vi.fn(),
  };
}

function createContext() {
  return {
    globalCompositeOperation: 'source-over',
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createRadialGradient: vi.fn(() => createGradient()),
    createLinearGradient: vi.fn(() => createGradient()),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
  };
}

describe('character select particle runtime', () => {
  it('sizes the particle canvas, renders a frame, and schedules the next RAF', () => {
    const ctx = createContext();
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 320,
      clientHeight: 180,
      getContext: vi.fn(() => ctx),
    };
    const doc = {
      getElementById: vi.fn((id) => (id === 'particleCanvas' ? canvas : null)),
    };
    const requestAnimationFrameImpl = vi.fn(() => 42);
    const cancelAnimationFrameImpl = vi.fn();

    const runtime = createCharacterParticleRuntime({
      doc,
      requestAnimationFrameImpl,
      cancelAnimationFrameImpl,
    });

    runtime.start('rage', '#FF5500');

    expect(cancelAnimationFrameImpl).toHaveBeenCalledWith(null);
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(180);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 320, 180);
    expect(ctx.globalCompositeOperation).toBe('source-over');
    expect(requestAnimationFrameImpl).toHaveBeenCalledWith(expect.any(Function));
  });

  it('stops cleanly and tolerates missing canvas/context', () => {
    const requestAnimationFrameImpl = vi.fn(() => 11);
    const cancelAnimationFrameImpl = vi.fn();
    const doc = {
      getElementById: vi.fn(() => null),
    };

    const runtime = createCharacterParticleRuntime({
      doc,
      requestAnimationFrameImpl,
      cancelAnimationFrameImpl,
    });

    runtime.start('orb', '#7CC8FF');
    expect(requestAnimationFrameImpl).not.toHaveBeenCalled();

    runtime.stop();
    expect(cancelAnimationFrameImpl).toHaveBeenLastCalledWith(null);
  });
});
