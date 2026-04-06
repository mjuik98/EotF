import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as helpers from '../game/features/title/presentation/browser/intro_cinematic_helpers.js';
import {
  cleanupIntroCinematic,
  playIntroCinematicRuntime,
} from '../game/features/title/presentation/browser/intro_cinematic_runtime.js';

function createDoc() {
  const listeners = new Map();
  const bodyChildren = [];
  return {
    body: {
      appendChild: vi.fn((node) => {
        node.isConnected = true;
        bodyChildren.push(node);
        return node;
      }),
    },
    addEventListener: vi.fn((name, handler) => {
      listeners.set(name, handler);
    }),
    removeEventListener: vi.fn((name) => {
      listeners.delete(name);
    }),
    get listeners() {
      return listeners;
    },
  };
}

function createOverlayShell() {
  const events = new Map();
  return {
    isConnected: true,
    remove: vi.fn(function remove() {
      this.isConnected = false;
    }),
    addEventListener: vi.fn((name, handler) => {
      events.set(name, handler);
    }),
    get events() {
      return events;
    },
  };
}

describe('intro_cinematic_runtime', () => {
  let originalDocument;
  let originalWindow;

  beforeEach(() => {
    vi.useFakeTimers();
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;
  });

  afterEach(() => {
    cleanupIntroCinematic();
    vi.useRealTimers();
    vi.restoreAllMocks();
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  it('mounts the intro overlay and completes on skip input', () => {
    const doc = createDoc();
    const overlay = createOverlayShell();
    const textBox = { appendChild: vi.fn() };
    const canvas = {
      isConnected: true,
      offsetWidth: 640,
      offsetHeight: 360,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
      })),
    };
    const win = {
      innerWidth: 640,
      innerHeight: 360,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const onComplete = vi.fn();

    vi.spyOn(helpers, 'ensureIntroStyle').mockImplementation(() => {});
    vi.spyOn(helpers, 'buildIntroOverlay').mockReturnValue({ canvas, overlay, textBox });
    vi.spyOn(helpers, 'buildIntroSequence').mockReturnValue({
      nodes: [
        { isConnected: true, dataset: {}, style: {} },
      ],
      delays: [0],
      totalDuration: 1000,
    });
    vi.spyOn(helpers, 'createIntroParticles').mockReturnValue([
      { x: 1, y: 2, vy: -1, r: 1 },
    ]);
    const blackoutSpy = vi.spyOn(helpers, 'mountRunStartHandoffBlackout').mockImplementation(() => {});

    playIntroCinematicRuntime(
      {
        doc,
        win,
        gs: { meta: { runCount: 1 } },
        getSelectedClass: () => 'mage',
        raf: vi.fn(() => null),
        cancelRaf: vi.fn(),
      },
      onComplete,
    );

    expect(doc.body.appendChild).toHaveBeenCalledWith(overlay);
    expect(textBox.appendChild).toHaveBeenCalledTimes(1);
    expect(doc.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    const keydown = doc.listeners.get('keydown');
    keydown({ key: 'Enter', code: 'Enter', preventDefault: vi.fn() });

    expect(blackoutSpy).toHaveBeenCalledWith(doc);
    expect(overlay.remove).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('falls back to global document/window when deps omit browser handles', () => {
    const doc = createDoc();
    const overlay = createOverlayShell();
    const textBox = { appendChild: vi.fn() };
    const canvas = {
      isConnected: true,
      offsetWidth: 640,
      offsetHeight: 360,
      ownerDocument: doc,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
      })),
    };
    const win = {
      innerWidth: 640,
      innerHeight: 360,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout,
      clearTimeout,
      requestAnimationFrame: vi.fn(() => null),
      cancelAnimationFrame: vi.fn(),
    };

    globalThis.document = doc;
    globalThis.window = win;

    vi.spyOn(helpers, 'ensureIntroStyle').mockImplementation(() => {});
    vi.spyOn(helpers, 'buildIntroOverlay').mockReturnValue({ canvas, overlay, textBox });
    vi.spyOn(helpers, 'buildIntroSequence').mockReturnValue({
      nodes: [{ isConnected: true, dataset: {}, style: {} }],
      delays: [0],
      totalDuration: 1000,
    });
    vi.spyOn(helpers, 'createIntroParticles').mockReturnValue([{ x: 1, y: 2, vy: -1, r: 1 }]);
    const blackoutSpy = vi.spyOn(helpers, 'mountRunStartHandoffBlackout').mockImplementation(() => {});
    const onComplete = vi.fn();

    playIntroCinematicRuntime(
      {
        gs: { meta: { runCount: 1 } },
        getSelectedClass: () => 'mage',
      },
      onComplete,
    );

    expect(doc.body.appendChild).toHaveBeenCalledWith(overlay);
    const keydown = doc.listeners.get('keydown');
    keydown({ key: 'Escape', code: 'Escape', preventDefault: vi.fn() });

    expect(blackoutSpy).toHaveBeenCalledWith(doc);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('logs intro playback through the injected logger instead of console defaults', () => {
    const doc = createDoc();
    const overlay = createOverlayShell();
    const textBox = { appendChild: vi.fn() };
    const canvas = {
      isConnected: true,
      offsetWidth: 640,
      offsetHeight: 360,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
      })),
    };
    const logger = { info: vi.fn() };

    vi.spyOn(helpers, 'ensureIntroStyle').mockImplementation(() => {});
    vi.spyOn(helpers, 'buildIntroOverlay').mockReturnValue({ canvas, overlay, textBox });
    vi.spyOn(helpers, 'buildIntroSequence').mockReturnValue({
      nodes: [{ isConnected: true, dataset: {}, style: {} }],
      delays: [0],
      totalDuration: 1000,
    });
    vi.spyOn(helpers, 'createIntroParticles').mockReturnValue([{ x: 1, y: 2, vy: -1, r: 1 }]);

    playIntroCinematicRuntime({
      doc,
      win: {
        innerWidth: 640,
        innerHeight: 360,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      gs: { meta: { runCount: 2 } },
      getSelectedClass: () => 'rogue',
      logger,
      raf: vi.fn(() => null),
      cancelRaf: vi.fn(),
    });

    expect(logger.info).toHaveBeenCalledWith('[IntroCinematicUI] play()', {
      isFirstRun: false,
      runCount: 2,
      selectedClass: 'rogue',
    });
  });

  it('cleans up listeners from the previously mounted document before rebinding a new runtime', () => {
    const firstDoc = createDoc();
    const secondDoc = createDoc();
    const firstOverlay = createOverlayShell();
    const secondOverlay = createOverlayShell();
    const textBox = { appendChild: vi.fn() };
    const firstCanvas = {
      isConnected: true,
      offsetWidth: 640,
      offsetHeight: 360,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
      })),
    };
    const secondCanvas = {
      isConnected: true,
      offsetWidth: 640,
      offsetHeight: 360,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
      })),
    };
    const firstWin = {
      innerWidth: 640,
      innerHeight: 360,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const secondWin = {
      innerWidth: 640,
      innerHeight: 360,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    vi.spyOn(helpers, 'ensureIntroStyle').mockImplementation(() => {});
    vi.spyOn(helpers, 'buildIntroOverlay')
      .mockReturnValueOnce({ canvas: firstCanvas, overlay: firstOverlay, textBox })
      .mockReturnValueOnce({ canvas: secondCanvas, overlay: secondOverlay, textBox });
    vi.spyOn(helpers, 'buildIntroSequence').mockReturnValue({
      nodes: [{ isConnected: true, dataset: {}, style: {} }],
      delays: [0],
      totalDuration: 1000,
    });
    vi.spyOn(helpers, 'createIntroParticles').mockReturnValue([{ x: 1, y: 2, vy: -1, r: 1 }]);

    playIntroCinematicRuntime({
      doc: firstDoc,
      win: firstWin,
      gs: { meta: { runCount: 1 } },
      getSelectedClass: () => 'mage',
      raf: vi.fn(() => null),
      cancelRaf: vi.fn(),
    });

    const firstKeydown = firstDoc.listeners.get('keydown');
    expect(firstKeydown).toBeTypeOf('function');

    playIntroCinematicRuntime({
      doc: secondDoc,
      win: secondWin,
      gs: { meta: { runCount: 2 } },
      getSelectedClass: () => 'rogue',
      raf: vi.fn(() => null),
      cancelRaf: vi.fn(),
    });

    expect(firstDoc.removeEventListener).toHaveBeenCalledWith('keydown', firstKeydown);
    expect(firstWin.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(firstDoc.listeners.has('keydown')).toBe(false);
    expect(secondDoc.listeners.has('keydown')).toBe(true);
  });
});
