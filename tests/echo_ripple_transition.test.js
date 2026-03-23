import { describe, expect, it, vi } from 'vitest';

import { startEchoRippleDissolve } from '../game/platform/browser/effects/echo_ripple_transition.js';

function createGradient() {
  return {
    addColorStop: vi.fn(),
  };
}

function createContext() {
  return {
    clearRect: vi.fn(),
    createRadialGradient: vi.fn(() => createGradient()),
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
  };
}

function createRuntime() {
  const appended = [];
  const rafQueue = [];
  const canvas = {
    style: {},
    width: 0,
    height: 0,
    remove: vi.fn(),
    getContext: vi.fn(() => createContext()),
  };
  const blackout = {
    style: {},
    remove: vi.fn(),
  };
  const doc = {
    body: {
      appendChild: vi.fn((node) => {
        appended.push(node);
      }),
    },
    createElement: vi.fn((tag) => {
      if (tag === 'canvas') return canvas;
      return blackout;
    }),
  };
  const win = {
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    performance: { now: vi.fn(() => 0) },
  };
  const requestAnimationFrame = vi.fn((cb) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  const cancelAnimationFrame = vi.fn();

  return {
    appended,
    blackout,
    canvas,
    cancelAnimationFrame,
    doc,
    rafQueue,
    requestAnimationFrame,
    win,
  };
}

describe('echo_ripple_transition', () => {
  it('falls back immediately when browser runtime deps are unavailable', () => {
    const overlay = { remove: vi.fn() };
    const onComplete = vi.fn();

    startEchoRippleDissolve(overlay, { doc: null, win: null, onComplete });

    expect(overlay.remove).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up the ripple canvas and blackout overlay after the dissolve completes', () => {
    const runtime = createRuntime();
    const overlay = { remove: vi.fn(), style: {} };
    const onComplete = vi.fn();

    startEchoRippleDissolve(overlay, {
      doc: runtime.doc,
      win: runtime.win,
      requestAnimationFrame: runtime.requestAnimationFrame,
      cancelAnimationFrame: runtime.cancelAnimationFrame,
      onComplete,
    });

    expect(runtime.doc.body.appendChild).toHaveBeenCalledWith(runtime.canvas);
    expect(runtime.win.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });

    const draw = runtime.rafQueue.shift();
    draw(1000);

    expect(overlay.remove).toHaveBeenCalledTimes(1);
    expect(runtime.canvas.remove).toHaveBeenCalledTimes(1);
    expect(runtime.blackout.remove).toHaveBeenCalledTimes(1);
    expect(runtime.win.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
