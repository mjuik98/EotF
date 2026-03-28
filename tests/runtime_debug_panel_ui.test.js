import { describe, expect, it, vi } from 'vitest';

import { mountRuntimeDebugPanel } from '../game/core/bootstrap/runtime_debug_panel_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this._textContent = '';

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
      },
    });
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    if (this.children.length > 0) {
      return this.children.map((child) => child.textContent).join('');
    }
    return this._textContent;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  click() {
    this.listeners.get('click')?.({ type: 'click', currentTarget: this });
  }
}

function createDoc() {
  const listeners = new Map();
  const doc = {
    _elements: new Map(),
    body: null,
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    dispatch(type, event = {}) {
      listeners.get(type)?.(event);
    },
  };

  doc.body = doc.createElement('body');
  const runtimeSceneRoot = doc.createElement('div');
  runtimeSceneRoot.id = 'runtimeSceneRoot';
  doc.body.appendChild(runtimeSceneRoot);
  return { doc, runtimeSceneRoot };
}

describe('runtime debug panel ui', () => {
  it('mounts hidden by default and toggles open with a controller refresh', () => {
    const { doc, runtimeSceneRoot } = createDoc();
    const hooks = {
      advanceTime: vi.fn(() => Promise.resolve(16)),
    };

    const controller = mountRuntimeDebugPanel({
      doc,
      hooks,
      getMetrics: () => ({
        totals: { events: 3, errors: 1, uniqueEvents: 2, uniqueErrors: 1 },
        recent: { activeMinutes: 1, eventsPerMinute: 3, errorsPerMinute: 1 },
        topEvents: [{ event: 'player:damage', count: 2 }],
        topErrors: [{ code: 'save/load_failed', count: 1 }],
      }),
      readSnapshot: () => ({
        screen: 'combat',
        panels: ['combatOverlay'],
        combat: { turn: 4, resources: { energy: 2, maxEnergy: 3 } },
      }),
    });

    expect(controller.root.parentNode).toBe(runtimeSceneRoot);
    expect(controller.root.style.display).toBe('none');

    controller.toggle();

    expect(controller.root.style.display).toBe('block');
    expect(controller.root.dataset.state).toBe('open');
    expect(controller.summary.textContent).toContain('screen combat');
    expect(controller.metrics.textContent).toContain('events 3');
    expect(controller.metrics.textContent).toContain('epm 3');
    expect(controller.metrics.textContent).toContain('err save/load_failed x1');
  });

  it('wires refresh and advance actions onto the existing runtime hooks', async () => {
    const { doc } = createDoc();
    let eventCount = 3;
    const hooks = {
      advanceTime: vi.fn(async (ms) => {
        eventCount += 1;
        return ms;
      }),
    };

    const controller = mountRuntimeDebugPanel({
      doc,
      hooks,
      getMetrics: () => ({
        totals: { events: eventCount, errors: 0, uniqueEvents: 1, uniqueErrors: 0 },
        recent: { activeMinutes: 1, eventsPerMinute: eventCount, errorsPerMinute: 0 },
        topEvents: [{ event: 'combat:tick', count: eventCount }],
        topErrors: [],
      }),
      readSnapshot: () => ({
        screen: 'game',
        panels: ['combatOverlay'],
        combat: { turn: 7, resources: { energy: 1, maxEnergy: 3 } },
      }),
    });

    controller.toggle();
    await controller.advance(250);

    expect(hooks.advanceTime).toHaveBeenCalledWith(250);
    expect(controller.metrics.textContent).toContain('events 4');
    expect(controller.metrics.textContent).toContain('epm 4');

    doc.dispatch('keydown', { key: 'Escape' });
    expect(controller.root.style.display).toBe('none');
  });
});
