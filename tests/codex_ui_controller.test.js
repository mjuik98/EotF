import { describe, expect, it, vi } from 'vitest';

import {
  clearCodexPopupNavigation,
  closeCodexModal,
  createCodexUiState,
  navigateCodexPopup,
  resetCodexUiState,
  setCodexPopupNavigation,
  showCodexModal,
  transitionCodexTab,
} from '../game/ui/screens/codex_ui_controller.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.listeners = {};
    this.style = {};
    this._value = '';

    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
      remove: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.delete(token));
        this.className = [...next].join(' ');
      },
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
    };

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
      },
    });

    Object.defineProperty(this, 'value', {
      get: () => this._value,
      set: (value) => {
        this._value = String(value ?? '');
      },
    });
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }

  removeEventListener(type, handler) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((entry) => entry !== handler);
  }
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

describe('codex_ui_controller', () => {
  it('resets module state and clears popup navigation', () => {
    const state = createCodexUiState();
    state.tab = 'items';
    state.filter = 'set';
    state.sort = 'name';
    state.search = 'void';
    state.showUnknown = false;
    state.isTransitioning = true;
    state.popupList = [{ id: 'a' }];
    state.popupIndex = 3;
    state.popupOpenFn = () => {};

    resetCodexUiState(state, { gs: {} });

    expect(state.tab).toBe('enemies');
    expect(state.filter).toBe('all');
    expect(state.sort).toBe('default');
    expect(state.search).toBe('');
    expect(state.showUnknown).toBe(true);
    expect(state.isTransitioning).toBe(false);
    expect(state.popupList).toEqual([]);
    expect(state.popupIndex).toBe(0);
    expect(state.popupOpenFn).toBeNull();
    expect(state.deps).toEqual({ gs: {} });
  });

  it('navigates popup entries through stored callback state', () => {
    const entries = [{ id: 'wolf' }, { id: 'slime' }, { id: 'boss' }];
    const state = createCodexUiState();
    const openFn = vi.fn();

    setCodexPopupNavigation(state, entries[1], entries, openFn);

    expect(navigateCodexPopup(state, 1)).toEqual(entries[2]);
    expect(openFn).toHaveBeenCalledWith(entries[2], entries, 2);

    clearCodexPopupNavigation(state);
    expect(navigateCodexPopup(state, -1)).toBeNull();
  });

  it('runs tab transition choreography and clears the transition flag on enter', () => {
    const doc = createDoc();
    const content = doc.createElement('div');
    content.id = 'codexContent';
    const search = doc.createElement('input');
    search.id = 'cxSearch';
    search.value = 'wolf';

    const state = createCodexUiState();
    state.search = 'wolf';
    const onBeforeRender = vi.fn();
    const onRender = vi.fn();

    transitionCodexTab(doc, state, 'cards', { onBeforeRender, onRender });

    expect(state.tab).toBe('cards');
    expect(state.filter).toBe('all');
    expect(state.search).toBe('');
    expect(search.value).toBe('');
    expect(state.isTransitioning).toBe(true);
    expect(onBeforeRender).toHaveBeenCalledWith('cards');
    expect(onRender).not.toHaveBeenCalled();

    content.listeners.animationend[0]();
    expect(onRender).toHaveBeenCalledWith('cards');
    expect(content.classList.contains('cx-tab-enter')).toBe(true);

    content.listeners.animationend[0]();
    expect(state.isTransitioning).toBe(false);
    expect(content.classList.contains('cx-tab-enter')).toBe(false);
  });

  it('shows and closes the modal through shared helper logic', () => {
    const doc = createDoc();
    const modal = doc.createElement('div');
    modal.id = 'codexModal';
    modal.className = 'fade-out';
    modal.style.display = 'none';
    const setTimeoutFn = vi.fn((callback) => callback());

    expect(showCodexModal(doc)).toBe(modal);
    expect(modal.classList.contains('fade-in')).toBe(true);
    expect(modal.style.display).toBe('flex');

    const onBeforeHide = vi.fn();
    closeCodexModal(doc, { onBeforeHide, setTimeoutFn });

    expect(onBeforeHide).toHaveBeenCalledTimes(1);
    expect(modal.style.display).toBe('none');
    expect(modal.classList.contains('fade-out')).toBe(false);
  });
});
