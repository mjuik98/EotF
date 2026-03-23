import { describe, expect, it, vi } from 'vitest';
import { FeedbackUI } from '../game/features/combat/public.js';

function createMockElement(tag = 'div') {
  return {
    tagName: String(tag).toUpperCase(),
    children: [],
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    offsetHeight: 108,
    isConnected: true,
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      node.isConnected = true;
      return node;
    },
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

describe('FeedbackUI item toast queue', () => {
  it('renders queued item toasts above modal overlays', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();
    const originalWindow = globalThis.window;
    globalThis.window = { DescriptionUtils: null };

    try {
      FeedbackUI.showItemToast({
        name: 'Queued Relic',
        icon: '*',
        desc: 'toast desc',
        rarity: 'common',
      }, { doc });

      const toastEl = doc.body.children[0];
      expect(toastEl).toBeTruthy();
      expect(toastEl.style.zIndex).toBe('9500');
    } finally {
      globalThis.window = originalWindow;
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });
});
