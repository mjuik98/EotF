import { describe, expect, it, vi } from 'vitest';
import { cleanupEndingSession, showOutcomeScreenRuntime } from '../game/ui/screens/ending_screen_ui_runtime.js';

function createMockElement(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    style: {},
    children: [],
    parentNode: null,
    innerHTML: '',
    textContent: '',
    className: '',
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter((entry) => entry !== child);
      child.parentNode = null;
    },
    remove() {
      this.parentNode?.removeChild?.(this);
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 120, height: 40 })),
    getContext: vi.fn(() => null),
  };
}

function createMockDocument() {
  const byId = new Map();
  const doc = {
    head: createMockElement('head'),
    body: createMockElement('body'),
    createElement(tagName) {
      return createMockElement(tagName);
    },
    getElementById(id) {
      return byId.get(id) || null;
    },
    querySelector: vi.fn(() => null),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  const originalBodyAppend = doc.body.appendChild.bind(doc.body);
  doc.body.appendChild = (child) => {
    if (child?.id) byId.set(child.id, child);
    return originalBodyAppend(child);
  };

  const originalHeadAppend = doc.head.appendChild.bind(doc.head);
  doc.head.appendChild = (child) => {
    if (child?.id) byId.set(child.id, child);
    return originalHeadAppend(child);
  };

  return doc;
}

describe('ending_screen_ui_runtime', () => {
  it('creates an ending session for a visible outcome screen', () => {
    const doc = createMockDocument();
    const win = {
      innerWidth: 1280,
      innerHeight: 720,
      setTimeout: vi.fn(() => 1),
      clearTimeout: vi.fn(),
      setInterval: vi.fn(() => 1),
      clearInterval: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
    };
    const gs = {
      meta: {
        storyPieces: [],
        inscriptions: {},
        runCount: 1,
      },
      player: {
        kills: 3,
        deck: [],
      },
      stats: {
        maxChain: 2,
        damageDealt: 50,
        clearTimeMs: 1000,
        regionClearTimes: [],
      },
      currentRegion: 0,
    };

    const session = showOutcomeScreenRuntime('victory', {
      doc,
      win,
      gs,
      data: {},
    }, {
      cleanup: vi.fn(),
    });

    expect(session).toBeTruthy();
    expect(Array.isArray(session.timers)).toBe(true);
    expect(Array.isArray(session.cleanups)).toBe(true);
  });

  it('cleans up timers and removes the ending root', () => {
    const doc = createMockDocument();
    const root = createMockElement('div');
    root.id = 'endingScreen';
    doc.body.appendChild(root);
    const win = {
      clearTimeout: vi.fn(),
    };

    cleanupEndingSession({
      timers: [11, 22],
      cleanups: [vi.fn(), vi.fn()],
    }, { doc, win });

    expect(win.clearTimeout).toHaveBeenCalledWith(11);
    expect(win.clearTimeout).toHaveBeenCalledWith(22);
    expect(root.parentNode).toBeNull();
  });
});
