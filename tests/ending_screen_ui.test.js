import { describe, expect, it, vi } from 'vitest';
import { EndingScreenUI } from '../game/features/ui/public.js';

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

describe('EndingScreenUI', () => {
  it('does not render the codex button on the outcome screen', () => {
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
    const originalWindow = globalThis.window;
    globalThis.window = win;
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

    const shown = EndingScreenUI.showOutcome('victory', {
      doc,
      win,
      gs,
      data: {},
    });

    try {
      expect(shown).toBe(true);
      const root = doc.body.children.find((child) => child.id === 'endingScreen');
      expect(root).toBeTruthy();
      expect(root.innerHTML).not.toContain('btnCodex');
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
