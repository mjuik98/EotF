import { describe, expect, it, vi } from 'vitest';

const { statusTooltipShowSpy, statusTooltipHideSpy, statusTooltipPositionSpy } = vi.hoisted(() => ({
  statusTooltipShowSpy: vi.fn(),
  statusTooltipHideSpy: vi.fn(),
  statusTooltipPositionSpy: vi.fn(),
}));

vi.mock('../game/features/combat/presentation/browser/status_tooltip_builder.js', () => ({
  StatusTooltipUI: {
    show: statusTooltipShowSpy,
    hide: statusTooltipHideSpy,
    _position: statusTooltipPositionSpy,
  },
}));

import { StatusEffectsUI } from '../game/features/combat/presentation/browser/status_effects_ui.js';

class MockTextNode {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = String(text ?? '');
  }
}

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.listeners = new Map();
    this._textContent = '';

    this.classList = {
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
    };
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }

  querySelectorAll(selector) {
    if (selector === '.hud-status-badge[data-buff-key]') {
      return this.children.filter((child) => String(child.className).includes('hud-status-badge') && child.dataset?.buffKey);
    }
    return [];
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }
}

function createDoc() {
  const elements = new Map();
  const doc = {
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    createTextNode(text) {
      return new MockTextNode(text);
    },
    createDocumentFragment() {
      return new MockElement(doc, '#fragment');
    },
    getElementById(id) {
      return elements.get(id) || null;
    },
  };
  const statusContainer = new MockElement(doc, 'div');
  elements.set('statusEffects', statusContainer);
  const tooltip = new MockElement(doc, 'div');
  tooltip.className = 'visible';
  elements.set('statusTooltip', tooltip);
  return { doc, statusContainer };
}

describe('status_effects_ui accessibility', () => {
  it('renders focusable status badges and mirrors tooltip handlers on focus and blur', () => {
    const { doc, statusContainer } = createDoc();
    const gs = {
      player: {
        buffs: {
          poisoned: { duration: 2, value: 2 },
        },
      },
      combat: { active: false },
    };

    StatusEffectsUI.updateStatusDisplay({ doc, gs, win: {}, statusContainerId: 'statusEffects' });

    const badge = statusContainer.children[0];
    expect(badge.className).toContain('hud-status-badge');
    expect(badge.tabIndex).toBe('0');
    expect(badge.role).toBe('button');
    expect(badge['aria-label']).toContain('중독');

    badge.listeners.get('focus')?.({ type: 'focus', currentTarget: badge });
    badge.listeners.get('blur')?.();

    expect(statusTooltipShowSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focus', currentTarget: badge }),
      'poisoned',
      expect.any(Object),
      expect.anything(),
      expect.objectContaining({ doc }),
    );
    expect(statusTooltipHideSpy).toHaveBeenCalledWith({ doc });
  });
});
