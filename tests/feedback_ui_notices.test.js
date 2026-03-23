import { describe, expect, it, vi } from 'vitest';

import {
  enqueueWorldMemoryNotice,
  flushWorldMemoryNoticeQueue,
  showLegendaryAcquireOverlay,
} from '../game/features/combat/public.js';

function createMockElement(tag = 'div') {
  return {
    tagName: String(tag).toUpperCase(),
    children: [],
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    isConnected: true,
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      node.isConnected = true;
      return node;
    },
    addEventListener: vi.fn(),
    remove() {
      this.isConnected = false;
    },
  };
}

function createMockDoc() {
  const body = createMockElement('body');
  return {
    body,
    createElement: vi.fn((tag) => createMockElement(tag)),
  };
}

describe('feedback_ui_notices', () => {
  it('renders the legendary acquisition overlay and triggers side effects', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();
    const audioEngine = { playLegendary: vi.fn() };
    const screenShake = { shake: vi.fn() };

    try {
      const shown = showLegendaryAcquireOverlay({
        name: 'Legendary Relic',
        icon: '*',
        desc: 'legend desc',
      }, { doc, audioEngine, screenShake });

      expect(shown).toBe(true);
      expect(audioEngine.playLegendary).toHaveBeenCalledTimes(1);
      expect(screenShake.shake).toHaveBeenCalledWith(8, 0.6);
      expect(doc.body.children[0]).toBeTruthy();
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('queues and flushes world memory notices sequentially', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();
    const flushFn = vi.fn((deps) => flushWorldMemoryNoticeQueue(deps, flushFn));

    try {
      enqueueWorldMemoryNotice('alpha · beta', { doc }, flushFn);

      expect(flushFn).toHaveBeenCalledTimes(1);
      expect(doc.body.children[0].textContent).toBe('alpha');

      vi.runOnlyPendingTimers();
      vi.runOnlyPendingTimers();

      expect(doc.body.children[1].textContent).toBe('beta');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });
});
