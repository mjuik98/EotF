import { describe, expect, it, vi } from 'vitest';
import { createTitleCanvasRuntime } from '../game/ui/title/title_canvas_runtime.js';

function createGradient() {
  return {
    addColorStop: vi.fn(),
  };
}

function createContext() {
  return {
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    globalAlpha: 1,
    fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => createGradient()),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
}

describe('title canvas runtime', () => {
  it('binds resize, sizes the canvas, and schedules animation frames', () => {
    const ctx = createContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ctx),
    };
    const resizeHandlers = [];
    const requestAnimationFrame = vi.fn(() => 77);
    const cancelAnimationFrame = vi.fn();
    const win = {
      innerWidth: 1440,
      innerHeight: 900,
      addEventListener: vi.fn((name, handler) => {
        if (name === 'resize') resizeHandlers.push(handler);
      }),
      requestAnimationFrame,
      cancelAnimationFrame,
    };
    const doc = {
      documentElement: {
        clientWidth: 0,
        clientHeight: 0,
      },
    };

    const runtime = createTitleCanvasRuntime({ win, doc });
    runtime.init(canvas);

    expect(canvas.width).toBe(1440);
    expect(canvas.height).toBe(900);
    expect(win.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1440, 900);
    expect(requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));

    win.innerWidth = 1280;
    win.innerHeight = 720;
    resizeHandlers[0]();
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);

    runtime.stop();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(77);
  });

  it('retries resize before animating when the canvas stays too small', () => {
    const ctx = createContext();
    const canvas = {
      width: 50,
      height: 50,
      getContext: vi.fn(() => ctx),
    };
    const win = {
      innerWidth: 50,
      innerHeight: 50,
      addEventListener: vi.fn(),
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
    };
    const doc = {
      documentElement: {
        clientWidth: 50,
        clientHeight: 50,
      },
    };
    const originalSetTimeout = globalThis.setTimeout;
    const setTimeoutSpy = vi.fn();
    globalThis.setTimeout = setTimeoutSpy;

    try {
      const runtime = createTitleCanvasRuntime({ win, doc });
      runtime.init(canvas);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 200);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });
});
