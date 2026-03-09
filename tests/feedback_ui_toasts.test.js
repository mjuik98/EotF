import { describe, expect, it, vi } from 'vitest';

import {
  showCombatSummaryToast,
  showItemToastQueued,
} from '../game/ui/hud/feedback_ui_toasts.js';

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
    classList: {
      add: vi.fn(),
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

describe('feedback_ui_toasts', () => {
  it('renders a combat summary toast in the stacked queue', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();

    try {
      showCombatSummaryToast(12, 5, 2, { doc });

      const toastEl = doc.body.children[0];
      expect(toastEl).toBeTruthy();
      expect(toastEl.style.zIndex).toBe('9500');
      expect(toastEl.children[0].textContent).toContain('전투 요약');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('renders an item toast with rarity label and description', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();

    try {
      showItemToastQueued({
        name: 'Queued Relic',
        icon: '*',
        desc: 'toast desc',
        rarity: 'common',
      }, { doc });

      const toastEl = doc.body.children[0];
      expect(toastEl).toBeTruthy();
      expect(toastEl.children[1].children[0].textContent).toContain('아이템 획득');
      expect(toastEl.children[1].children[1].textContent).toBe('Queued Relic');
      expect(toastEl.children[1].children[2].innerHTML).toContain('toast desc');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });
});
