import { describe, expect, it, vi } from 'vitest';
import {
  getGameCanvasRefs,
  initGameCanvasRuntime,
  resizeGameCanvasRuntime,
} from '../game/ui/title/game_canvas_setup_ui_runtime.js';

function createCanvas({ width = 720, height = 480, offsetWidth = 220 } = {}) {
  return {
    width: 0,
    height: 0,
    offsetWidth,
    offsetHeight: height,
    style: {},
    _mapOpenPatched: false,
    addEventListener: vi.fn(),
    getContext: vi.fn(() => ({ id: 'ctx' })),
    getBoundingClientRect: vi.fn(() => ({ width, height })),
  };
}

describe('game_canvas_setup_ui_runtime', () => {
  it('initializes canvas refs, patches the minimap click, and binds resize only once', () => {
    const gameCanvas = createCanvas();
    const minimapCanvas = createCanvas({ width: 180, height: 120, offsetWidth: 180 });
    const doc = {
      getElementById: vi.fn((id) => ({
        gameCanvas,
        minimapCanvas,
      }[id] || null)),
    };
    const win = {
      addEventListener: vi.fn(),
      showFullMap: vi.fn(),
    };
    const state = {
      gameCanvas: null,
      gameCtx: null,
      minimapCanvas: null,
      minimapCtx: null,
      combatCanvas: null,
      resizeBound: false,
    };
    const ui = {
      resize: vi.fn((deps) => resizeGameCanvasRuntime(state, deps)),
      getRefs: vi.fn(() => getGameCanvasRefs(state)),
    };
    const particleSystem = { init: vi.fn() };

    const refs = initGameCanvasRuntime(state, ui, { doc, win, particleSystem });

    expect(refs.gameCanvas).toBe(gameCanvas);
    expect(refs.combatCanvas).toBe(gameCanvas);
    expect(particleSystem.init).toHaveBeenCalledWith(gameCanvas);
    expect(ui.resize).toHaveBeenCalledTimes(1);
    expect(win.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(minimapCanvas.style.cursor).toBe('pointer');
    expect(minimapCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    const [, onClick] = minimapCanvas.addEventListener.mock.calls[0];
    onClick();

    expect(win.showFullMap).toHaveBeenCalledTimes(1);
  });

  it('resizes the main and minimap canvases and attaches a resize observer once', () => {
    const observed = [];
    class FakeResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        observed.push(target);
      }
    }
    const gameCanvas = createCanvas({ width: 640, height: 360 });
    const minimapCanvas = createCanvas({ width: 160, height: 80, offsetWidth: 160 });
    const state = {
      gameCanvas,
      gameCtx: null,
      minimapCanvas,
      minimapCtx: null,
      combatCanvas: gameCanvas,
      resizeBound: true,
    };

    resizeGameCanvasRuntime(state, { resizeObserverCtor: FakeResizeObserver });
    resizeGameCanvasRuntime(state, { resizeObserverCtor: FakeResizeObserver });

    expect(gameCanvas.width).toBe(640);
    expect(gameCanvas.height).toBe(400);
    expect(minimapCanvas.width).toBe(160);
    expect(minimapCanvas.height).toBe(160);
    expect(observed).toEqual([gameCanvas]);
  });
});
