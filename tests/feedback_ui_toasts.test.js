import { describe, expect, it, vi } from 'vitest';

import {
  showCombatSummaryToast,
  showItemToastQueued,
} from '../game/features/combat/public.js';

function findDescendantByClass(root, className) {
  if (!root) return null;
  if (root.className === className) return root;
  for (const child of root.children || []) {
    const match = findDescendantByClass(child, className);
    if (match) return match;
  }
  return null;
}

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
      expect(toastEl.className).toContain('stack-toast');
      expect(toastEl.className).toContain('stack-toast--summary');
      expect(toastEl.style.zIndex).toBe('9500');
      expect(toastEl.children[0].textContent).toContain('전투 요약');

      vi.advanceTimersByTime(4000);
      expect(toastEl.classList.add).toHaveBeenCalledWith('stack-toast--exit');
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
      expect(toastEl.className).toContain('stack-toast');
      expect(toastEl.className).toContain('stack-toast--item');
      expect(toastEl.children[1].children[0].textContent).toContain('아이템 획득');
      expect(toastEl.children[1].children[1].textContent).toBe('Queued Relic');
      expect(toastEl.children[1].children[2].innerHTML).toContain('toast desc');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('merges repeated item toasts into a single visible toast with a count badge', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();

    try {
      const item = {
        name: 'Queued Relic',
        icon: '*',
        desc: 'toast desc',
        rarity: 'common',
      };

      showItemToastQueued(item, { doc });
      showItemToastQueued(item, { doc });

      expect(doc.body.children).toHaveLength(1);
      const countBadge = findDescendantByClass(doc.body.children[0], 'stack-toast-count');
      expect(countBadge).toBeTruthy();
      expect(countBadge.textContent).toBe('x2');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('extends item toast display time for longer descriptions', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    try {
      showItemToastQueued({
        name: 'Short Relic',
        icon: '*',
        desc: 'short desc',
        rarity: 'common',
      }, { doc });
      const shortDuration = timeoutSpy.mock.calls[0]?.[1];

      vi.runAllTimers();
      timeoutSpy.mockClear();

      showItemToastQueued({
        name: 'Long Relic',
        icon: '*',
        desc: 'very long description '.repeat(10),
        rarity: 'common',
      }, { doc });
      const longDuration = timeoutSpy.mock.calls[0]?.[1];

      expect(Number(longDuration)).toBeGreaterThan(Number(shortDuration));
    } finally {
      timeoutSpy.mockRestore();
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('reflows the remaining stack when the first toast exits', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();

    try {
      showCombatSummaryToast(12, 5, 2, { doc });
      vi.advanceTimersByTime(1000);
      showCombatSummaryToast(7, 3, 1, { doc });

      const firstToast = doc.body.children[0];
      const secondToast = doc.body.children[1];
      expect(firstToast.style.bottom).toBe('220px');
      expect(secondToast.style.bottom).toBe('340px');

      vi.advanceTimersByTime(3320);

      expect(firstToast.isConnected).toBe(false);
      expect(secondToast.isConnected).toBe(true);
      expect(secondToast.style.bottom).toBe('220px');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });
});
