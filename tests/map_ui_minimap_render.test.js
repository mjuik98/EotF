import { describe, expect, it } from 'vitest';

import {
  bindMinimapHover,
  buildMinimapScene,
  drawMinimapScene,
  findClosestNodeEntry,
  toCanvasCoords,
  updateMinimapHint,
} from '../game/features/run/public.js';

class MockContext2D {
  constructor() {
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 0;
    this.shadowBlur = 0;
    this.shadowColor = '';
    this.globalAlpha = 1;
    this.font = '';
    this.textAlign = '';
    this.textBaseline = '';
  }

  clearRect() {}
  fillRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  arc() {}
  fill() {}
  setLineDash() {}
  fillText() {}
}

function createCanvas() {
  const listeners = {};
  return {
    width: 100,
    height: 100,
    style: {},
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 100, height: 100 };
    },
    listeners,
  };
}

describe('map_ui_minimap_render', () => {
  it('builds visible minimap scene data and draw hover entries', () => {
    const gs = {
      currentFloor: 0,
      currentNode: { id: '0-a' },
      mapNodes: [
        { id: '0-a', floor: 0, pos: 0, total: 1, type: 'combat', visited: false, accessible: true, children: ['1-a'] },
        { id: '1-a', floor: 1, pos: 0, total: 1, type: 'event', visited: false, accessible: true },
        { id: '2-a', floor: 2, pos: 0, total: 1, type: 'boss', visited: false, accessible: false },
      ],
    };
    const canvas = createCanvas();
    const ctx = new MockContext2D();
    const scene = buildMinimapScene(gs);

    expect(scene.visibleNodeIds.has('0-a')).toBe(true);
    expect(scene.visibleNodeIds.has('2-a')).toBe(false);

    const hoverData = drawMinimapScene(ctx, canvas, gs, {
      combat: { icon: 'C' },
      event: { icon: 'E' },
    }, scene);

    expect(hoverData.entries).toHaveLength(1);
  });

  it('updates hint and hover cursor from bound canvas events', () => {
    const canvas = createCanvas();
    const hint = { textContent: '', style: { opacity: '0' } };
    canvas._minimapHintEl = hint;
    canvas._minimapNodeMeta = { combat: { icon: 'C', label: 'Combat' } };
    canvas._minimapHoverData = {
      entries: [{ node: { type: 'combat', floor: 1 }, x: 50, y: 50 }],
      threshold: 12,
    };

    bindMinimapHover(canvas);
    canvas.listeners.mousemove({ clientX: 50, clientY: 50 });

    expect(canvas.style.cursor).toBe('pointer');
    expect(hint.textContent).toBe('C Combat - 1F');

    canvas.listeners.mouseleave();
    expect(hint.style.opacity).toBe('0');
  });

  it('converts points and finds closest entries within threshold', () => {
    const canvas = createCanvas();
    expect(toCanvasCoords(canvas, { clientX: 25, clientY: 75 })).toEqual({ x: 25, y: 75 });

    const closest = findClosestNodeEntry([
      { node: { id: 'a' }, x: 10, y: 10 },
      { node: { id: 'b' }, x: 80, y: 80 },
    ], 12, 12, 8);

    expect(closest?.node?.id).toBe('a');

    const hintCanvas = createCanvas();
    hintCanvas._minimapHintEl = { textContent: '', style: { opacity: '1' } };
    updateMinimapHint(hintCanvas, null, {});
    expect(hintCanvas._minimapHintEl.style.opacity).toBe('0');
  });
});
