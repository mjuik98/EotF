import { describe, expect, it, vi } from 'vitest';

import { createCardCloneRuntime } from '../game/features/combat/presentation/browser/card_clone_runtime_ui.js';

function createClassList() {
  const values = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => values.add(token)),
    remove: (...tokens) => tokens.forEach((token) => values.delete(token)),
    contains: (token) => values.has(token),
  };
}

function createElement({ rect } = {}) {
  const classList = createClassList();
  const style = {};
  const listeners = new Map();
  return {
    classList,
    style,
    parentNode: null,
    firstChild: null,
    children: [],
    appendChild(node) {
      node.parentNode = this;
      this.children.push(node);
      this.firstChild = this.children[0] || null;
      return node;
    },
    removeChild(node) {
      this.children = this.children.filter((child) => child !== node);
      this.firstChild = this.children[0] || null;
      node.parentNode = null;
      return node;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    emit(type) {
      listeners.get(type)?.();
    },
    getBoundingClientRect() {
      return rect || { left: 50, top: 200, width: 100, height: 146 };
    },
    querySelector(selector) {
      return selector === '.card-clone-arrow' ? this.arrow : null;
    },
  };
}

describe('card_clone_runtime_ui', () => {
  it('calculates bounded clone positions', () => {
    const runtime = createCardCloneRuntime({
      view: { innerWidth: 260 },
      requestFrame: (callback) => callback(),
    });
    const card = createElement({
      rect: { left: 220, top: 180, width: 60, height: 100 },
    });

    const pos = runtime.calcPosition(card);

    expect(pos.left).toBeLessThanOrEqual(46);
    expect(pos.arrowLeft).toBeGreaterThanOrEqual(20);
    expect(pos.arrowLeft).toBeLessThanOrEqual(180);
  });

  it('shows and hides clones through the runtime lifecycle', () => {
    const runtime = createCardCloneRuntime({
      view: { innerWidth: 1280 },
      requestFrame: (callback) => callback(),
    });
    const layer = createElement();
    const handZone = createElement();
    const card = createElement();
    const clone = createElement();
    clone.arrow = createElement();

    runtime.setLayer(layer);
    runtime.register(card, clone);
    runtime.show(card, clone, handZone);

    expect(layer.children).toContain(clone);
    expect(card.classList.contains('card-clone-dimmed')).toBe(true);
    expect(handZone.classList.contains('has-active-clone')).toBe(true);
    expect(clone.classList.contains('card-clone-visible')).toBe(true);

    runtime.hide(handZone);
    clone.emit('transitionend');

    expect(layer.children).not.toContain(clone);
    expect(card.classList.contains('card-clone-dimmed')).toBe(false);
    expect(handZone.classList.contains('has-active-clone')).toBe(false);
  });

  it('falls back below the source card when the upper area is blocked', () => {
    const runtime = createCardCloneRuntime({
      view: { innerWidth: 1280, innerHeight: 900 },
      getAvoidRects: () => [
        { left: 0, top: 0, right: 1280, bottom: 430, width: 1280, height: 430 },
      ],
      requestFrame: (callback) => callback(),
    });
    const card = createElement({
      rect: { left: 540, top: 460, width: 100, height: 146, right: 640, bottom: 606 },
    });

    const pos = runtime.calcPosition(card);

    expect(pos.cardPlacement).toBe('below');
    expect(pos.top).toBeGreaterThan(520);
  });

  it('docks the hover side panel to the left near the right edge instead of overflowing', () => {
    const runtime = createCardCloneRuntime({
      view: { innerWidth: 1280, innerHeight: 900 },
      requestFrame: (callback) => callback(),
    });
    const layer = createElement();
    const handZone = createElement();
    const card = createElement({
      rect: { left: 1170, top: 220, width: 80, height: 146, right: 1250, bottom: 366 },
    });
    const clone = createElement();
    clone.dataset = {};

    runtime.setLayer(layer);
    runtime.register(card, clone);
    runtime.show(card, clone, handZone);

    expect(clone.dataset.keywordPlacement).toBe('left');
  });
});
