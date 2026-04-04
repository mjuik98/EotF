import { describe, expect, it, vi } from 'vitest';

import {
  applyCodexModalOpen,
  runCodexModalClose,
  runCodexTabTransition,
} from '../game/features/codex/public.js';

function createModal() {
  const listeners = {};
  const classState = new Set(['fade-out']);
  return {
    style: { display: 'none' },
    classList: {
      add: (...tokens) => tokens.forEach((token) => classState.add(token)),
      remove: (...tokens) => tokens.forEach((token) => classState.delete(token)),
      contains: (token) => classState.has(token),
    },
    addEventListener: vi.fn((type, handler) => {
      listeners[type] = handler;
    }),
    removeEventListener: vi.fn(),
    listeners,
  };
}

describe('codex_ui_controller_helpers', () => {
  it('opens and closes the codex modal through shared helpers', () => {
    const modal = createModal();
    const setTimeoutFn = vi.fn((callback) => callback());
    const clearTimeoutFn = vi.fn();
    const onBeforeHide = vi.fn();

    expect(applyCodexModalOpen(modal)).toBe(modal);
    expect(modal.style.display).toBe('flex');
    expect(modal.classList.contains('fade-in')).toBe(true);

    expect(runCodexModalClose(modal, { onBeforeHide, setTimeoutFn, clearTimeoutFn })).toBe(true);
    expect(onBeforeHide).toHaveBeenCalledTimes(1);
    expect(modal.style.display).toBe('none');
    expect(modal.classList.contains('fade-out')).toBe(false);
  });

  it('cancels a pending close when the codex modal reopens immediately', () => {
    const modal = createModal();
    const pendingTimers = [];
    const setTimeoutFn = vi.fn((callback) => {
      pendingTimers.push(callback);
      return callback;
    });
    const clearTimeoutFn = vi.fn((timer) => {
      const index = pendingTimers.indexOf(timer);
      if (index >= 0) pendingTimers.splice(index, 1);
    });

    applyCodexModalOpen(modal, { clearTimeoutFn });
    expect(runCodexModalClose(modal, { setTimeoutFn, clearTimeoutFn })).toBe(true);
    expect(modal.classList.contains('fade-out')).toBe(true);

    expect(applyCodexModalOpen(modal, { clearTimeoutFn })).toBe(modal);
    expect(modal.style.display).toBe('flex');
    expect(modal.classList.contains('fade-in')).toBe(true);
    expect(modal.classList.contains('fade-out')).toBe(false);
    expect(pendingTimers).toHaveLength(0);

    modal.listeners.animationend?.();
    expect(modal.style.display).toBe('flex');
    expect(modal.classList.contains('fade-in')).toBe(true);
  });

  it('runs codex tab transition choreography and clears the transition flag', () => {
    const content = {
      classList: {
        _tokens: new Set(),
        add(...tokens) { tokens.forEach((token) => this._tokens.add(token)); },
        remove(...tokens) { tokens.forEach((token) => this._tokens.delete(token)); },
        contains(token) { return this._tokens.has(token); },
      },
      listeners: {},
      addEventListener(type, handler) {
        this.listeners[type] = handler;
      },
      removeEventListener: vi.fn(),
    };
    const searchInput = { value: 'old' };
    const doc = {
      getElementById: vi.fn((id) => ({
        codexContent: content,
        cxSearch: searchInput,
      }[id] || null)),
    };
    const state = {
      tab: 'enemies',
      filter: 'rare',
      search: 'old',
      isTransitioning: false,
    };
    const onBeforeRender = vi.fn();
    const onRender = vi.fn();

    expect(runCodexTabTransition(doc, state, 'cards', { onBeforeRender, onRender })).toBe(true);
    expect(state.tab).toBe('cards');
    expect(state.filter).toBe('all');
    expect(state.search).toBe('');
    expect(searchInput.value).toBe('');
    expect(state.isTransitioning).toBe(true);

    content.listeners.animationend();
    expect(onRender).toHaveBeenCalledWith('cards');
    expect(content.classList.contains('cx-tab-enter')).toBe(true);

    content.listeners.animationend();
    expect(state.isTransitioning).toBe(false);
    expect(content.classList.contains('cx-tab-enter')).toBe(false);
  });
});
