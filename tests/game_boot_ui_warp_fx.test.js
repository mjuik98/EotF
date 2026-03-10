import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireWarpBurst } from '../game/ui/title/game_boot_ui_warp_fx.js';

function createContext() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    globalCompositeOperation: 'source-over',
    fillStyle: '',
  };
}

describe('game_boot_ui_warp_fx', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('finishes immediately when the warp canvas is unavailable', () => {
    const onDone = vi.fn();

    fireWarpBurst({ getElementById: vi.fn(() => null) }, onDone);

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('runs the warp burst loop to completion and fades the canvas out', () => {
    const ctx = createContext();
    const canvas = {
      clientWidth: 400,
      clientHeight: 240,
      width: 0,
      height: 0,
      style: {},
      getContext: vi.fn(() => ctx),
    };
    const doc = {
      getElementById: vi.fn((id) => (id === 'titleWarpCanvas' ? canvas : null)),
    };
    const queue = [];
    const originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn((handler) => {
      queue.push(handler);
      return queue.length;
    });
    const onDone = vi.fn();

    fireWarpBurst(doc, onDone);
    while (queue.length) {
      queue.shift()();
    }

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(240);
    expect(canvas.style.opacity).toBe('0');
    expect(ctx.arc).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledTimes(1);

    globalThis.requestAnimationFrame = originalRaf;
  });
});
