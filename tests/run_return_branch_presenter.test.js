import { describe, expect, it, vi } from 'vitest';

import { showBranchChoiceOverlay } from '../game/features/run/presentation/browser/run_return_branch_presenter.js';

function createElement(doc, tagName = 'div') {
  const listeners = {};
  const node = {
    ownerDocument: doc,
    tagName: String(tagName).toUpperCase(),
    style: {},
    children: [],
    listeners,
    append(...nodes) {
      nodes.forEach((child) => this.appendChild(child));
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    addEventListener(name, handler) {
      listeners[name] = handler;
    },
    remove() {},
    set textContent(value) {
      this._textContent = String(value ?? '');
    },
    get textContent() {
      return this._textContent || '';
    },
  };
  return node;
}

describe('run_return_branch_presenter', () => {
  it('gives branch choice cards focus parity with the hover styling', async () => {
    const body = createElement(null, 'body');
    const doc = {
      body,
      createElement(tagName) {
        return createElement(doc, tagName);
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    body.ownerDocument = doc;

    const promise = showBranchChoiceOverlay([
      { regionId: 1, label: '지역 1', difficulty: '보통', rewardMod: 1.1 },
      { regionId: 2, label: '지역 2', difficulty: '어려움', rewardMod: 1.3 },
    ], { doc });

    const overlay = body.children[0];
    const panel = overlay.children[0];
    const grid = panel.children[2];
    const card = grid.children[0];

    expect(typeof card.listeners.focus).toBe('function');
    expect(typeof card.listeners.blur).toBe('function');

    card.listeners.focus();
    expect(card.style.transform).toBe('translateY(-2px)');

    card.listeners.blur();
    expect(card.style.transform).toBe('');

    card.listeners.click();
    await expect(promise).resolves.toEqual(expect.objectContaining({ regionId: 1 }));
  });
});
