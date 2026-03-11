import { describe, expect, it, vi } from 'vitest';

import {
  drawMazeFrame,
  drawMazeMinimap,
  resizeMazeCanvas,
  updateMazeHud,
} from '../game/ui/map/maze_system_render_ui.js';

function createGradient() {
  return {
    addColorStop: vi.fn(),
  };
}

function createContext() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createRadialGradient: vi.fn(() => createGradient()),
  };
}

describe('maze_system_render_ui', () => {
  it('resizes the canvas and redraws', () => {
    const draw = vi.fn();
    const canvas = { offsetWidth: 640, clientWidth: 0, offsetHeight: 360, clientHeight: 0, width: 0, height: 0 };

    resizeMazeCanvas(canvas, draw);

    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(360);
    expect(draw).toHaveBeenCalled();
  });

  it('updates step, hp, and echo hud labels', () => {
    const elements = new Map([
      ['mazeStepCount', { textContent: '' }],
      ['mazeHp', { textContent: '' }],
      ['mazeEcho', { textContent: '' }],
    ]);
    const doc = {
      getElementById(id) {
        return elements.get(id) || null;
      },
    };

    updateMazeHud(doc, { player: { hp: 12, maxHp: 20, echo: 17.8 } }, 5);

    expect(elements.get('mazeStepCount').textContent).toBe('이동: 5');
    expect(elements.get('mazeHp').textContent).toBe('12/20');
    expect(elements.get('mazeEcho').textContent).toBe(17);
  });

  it('renders minimap tiles and player marker', () => {
    const mmCtx = createContext();

    drawMazeMinimap({
      mmCtx,
      minimap: { width: 80, height: 80 },
      map: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
      ],
      W: 3,
      H: 3,
      px: 1,
      py: 1,
    });

    expect(mmCtx.fillRect).toHaveBeenCalled();
    expect(mmCtx.arc).toHaveBeenCalled();
    expect(mmCtx.fill).toHaveBeenCalled();
  });

  it('renders the maze scene, computes fov, and schedules a redraw while active', () => {
    const ctx = createContext();
    const mmCtx = createContext();
    const requestAnimationFrame = vi.fn();
    const computeFov = vi.fn();
    const getVisible = vi.fn(() => new Set(['1,1', '2,1', '2,2', '3,3']));
    const getRevealed = vi.fn(() => new Set(['1,1', '2,1', '2,2', '3,3']));
    const redraw = vi.fn();

    drawMazeFrame({
      canvas: { width: 320, height: 240 },
      ctx,
      minimap: { width: 100, height: 60 },
      mmCtx,
      map: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      W: 5,
      H: 5,
      px: 1,
      py: 1,
      shakeX: 0,
      shakeY: 0,
      tileSize: 40,
      fovActive: true,
      fovEngine: { computeFov, getVisible, getRevealed },
      now: 1000,
      requestAnimationFrame,
      redraw,
    });

    expect(computeFov).toHaveBeenCalledWith(1, 1, 6);
    expect(ctx.fillText).toHaveBeenCalledWith('🧙', expect.any(Number), expect.any(Number));
    expect(requestAnimationFrame).toHaveBeenCalled();

    const scheduled = requestAnimationFrame.mock.calls[0][0];
    scheduled();
    expect(redraw).toHaveBeenCalled();
  });
});
