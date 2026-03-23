import { describe, expect, it, vi } from 'vitest';

import { MazeSystem } from '../game/features/run/public.js';

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
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  };
}

function createElement(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    style: {},
    textContent: '',
    removed: false,
    getContext: vi.fn(() => createContext()),
    remove() {
      this.removed = true;
    },
  };
}

describe('MazeSystem', () => {
  it('opens the maze overlay, updates hud, moves, and closes cleanly', () => {
    const elements = new Map([
      ['mazeCanvas', { ...createElement('canvas'), offsetWidth: 640, clientWidth: 0, offsetHeight: 360, clientHeight: 0 }],
      ['mazeMinimap', { ...createElement('canvas'), width: 120, height: 80 }],
      ['mazeOverlay', createElement('div')],
      ['mazeStepCount', createElement('div')],
      ['mazeHp', createElement('div')],
      ['mazeEcho', createElement('div')],
      ['mazeGuide', createElement('div')],
    ]);
    const doc = {
      getElementById(id) {
        return elements.get(id) || null;
      },
    };
    const win = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn(),
    };
    const fovEngine = {
      generateMaze: vi.fn(),
      getSize: vi.fn(() => ({ W: 5, H: 5 })),
      getMap: vi.fn(() => [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ]),
      computeFov: vi.fn(),
      getVisible: vi.fn(() => new Set(['1,1', '2,1', '3,1', '3,3'])),
      getRevealed: vi.fn(() => new Set(['1,1', '2,1', '3,1', '3,3'])),
    };

    MazeSystem.configure({
      doc,
      win,
      fovEngine,
      gs: { player: { hp: 18, maxHp: 24, echo: 9.6 } },
    });

    MazeSystem.open(false);

    expect(elements.get('mazeOverlay').style.display).toBe('flex');
    expect(elements.get('mazeStepCount').textContent).toBe('이동: 0');
    expect(elements.get('mazeHp').textContent).toBe('18/24');
    expect(elements.get('mazeEcho').textContent).toBe(9);
    expect(win.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

    expect(MazeSystem.move(1, 0)).toBe(true);
    expect(elements.get('mazeStepCount').textContent).toBe('이동: 1');

    MazeSystem.close();

    expect(elements.get('mazeOverlay').style.display).toBe('none');
    expect(elements.get('mazeGuide').removed).toBe(true);
    expect(win.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('shakes on blocked moves and exits into combat when reaching the goal', () => {
    const elements = new Map([
      ['mazeCanvas', { ...createElement('canvas'), offsetWidth: 640, clientWidth: 0, offsetHeight: 360, clientHeight: 0 }],
      ['mazeMinimap', { ...createElement('canvas'), width: 120, height: 80 }],
      ['mazeOverlay', createElement('div')],
      ['mazeStepCount', createElement('div')],
      ['mazeHp', createElement('div')],
      ['mazeEcho', createElement('div')],
      ['mazeGuide', createElement('div')],
    ]);
    const doc = {
      getElementById(id) {
        return elements.get(id) || null;
      },
    };
    const timers = [];
    const win = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn(),
      setTimeout: vi.fn((fn, delay) => {
        timers.push(delay);
        fn();
        return delay;
      }),
    };
    const startCombat = vi.fn();
    const showWorldMemoryNotice = vi.fn();
    const fovEngine = {
      generateMaze: vi.fn(),
      getSize: vi.fn(() => ({ W: 4, H: 4 })),
      getMap: vi.fn(() => [
        [1, 1, 1, 1],
        [1, 0, 1, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
      ]),
      computeFov: vi.fn(),
      getVisible: vi.fn(() => new Set(['1,1', '1,2', '2,2'])),
      getRevealed: vi.fn(() => new Set(['1,1', '1,2', '2,2'])),
    };

    MazeSystem.configure({
      doc,
      win,
      fovEngine,
      gs: { player: { hp: 10, maxHp: 10, echo: 3 } },
      startCombat,
      showWorldMemoryNotice,
    });

    MazeSystem.open(true);

    expect(MazeSystem.move(1, 0)).toBe(false);
    expect(win.requestAnimationFrame).toHaveBeenCalled();

    expect(MazeSystem.move(0, 1)).toBe(true);
    expect(MazeSystem.move(1, 0)).toBe(true);
    expect(showWorldMemoryNotice).toHaveBeenCalledWith('🚪 출구 발견! 전투가 시작된다...');
    expect(startCombat).toHaveBeenCalledWith(true);
    expect(timers).toContain(800);
    expect(elements.get('mazeOverlay').style.display).toBe('none');
  });
});
