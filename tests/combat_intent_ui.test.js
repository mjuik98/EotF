import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatEnemyIntentLabel,
  hideEnemyIntentTooltip,
  resolveEnemyIntent,
  showEnemyIntentTooltip,
  syncEnemyIntentTooltipAnchor,
} from '../game/ui/combat/combat_intent_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this._textContent = '';
    this.innerHTML = '';

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

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = String(value ?? '');
        this.children = [];
      },
    });
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const result = [];
    const visit = (node) => {
      if (!(node instanceof MockElement)) return;
      if (selector.startsWith('.')) {
        const token = selector.slice(1);
        if (node.className.split(/\s+/).filter(Boolean).includes(token)) {
          result.push(node);
        }
      } else if (selector.startsWith('#') && node.id === selector.slice(1)) {
        result.push(node);
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return result;
  }
}

function createMockDocument() {
  const doc = {
    _elements: new Map(),
    _hoverIntent: false,
    body: null,
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    querySelector(selector) {
      if (selector === '.enemy-intent:hover') {
        return this._hoverIntent ? {} : null;
      }
      return this.body?.querySelector(selector) || null;
    },
  };

  doc.body = new MockElement(doc, 'body');
  return doc;
}

function createState() {
  return {
    combat: {
      enemies: [{
        ai: () => ({ type: 'attack', intent: 'Attack 12', dmg: 12 }),
        statusEffects: {},
      }],
      turn: 2,
    },
  };
}

describe('combat_intent_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an enemy intent tooltip with edge-aware positioning', () => {
    const doc = createMockDocument();
    const gs = createState();
    const anchor = {
      getBoundingClientRect: () => ({ left: 940, right: 980, top: 500 }),
    };

    showEnemyIntentTooltip({ currentTarget: anchor }, 0, {
      doc,
      win: { innerWidth: 1024, innerHeight: 640 },
      gs,
    });

    const tooltip = doc.getElementById('intentTooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip.classList.contains('visible')).toBe(true);
    expect(tooltip.style.left).toBe('696px');
    expect(tooltip.style.top).toBe('446px');
    expect(tooltip.querySelector('.itt-title')?.innerHTML).toBe('!! Attack');
    expect(tooltip.querySelector('.itt-dmg')?.textContent).toBe('Expected damage: 12');
  });

  it('schedules intent tooltip hide and clears stale tooltips when hover anchor is gone', () => {
    const doc = createMockDocument();
    const tooltip = doc.createElement('div');
    tooltip.id = 'intentTooltip';
    tooltip.classList.add('visible');
    doc.body.appendChild(tooltip);

    hideEnemyIntentTooltip({ doc });
    expect(tooltip.classList.contains('visible')).toBe(true);

    vi.advanceTimersByTime(80);
    expect(tooltip.classList.contains('visible')).toBe(false);

    tooltip.classList.add('visible');
    syncEnemyIntentTooltipAnchor(doc);
    expect(tooltip.classList.contains('visible')).toBe(false);
  });

  it('uses the stunned override before enemy ai and normalizes attack labels', () => {
    expect(resolveEnemyIntent({
      ai: () => ({ type: 'heal', intent: 'Heal', dmg: 0 }),
      statusEffects: { stunned: 1 },
    }, 3)).toEqual({ type: 'stunned', intent: 'Stunned', dmg: 0, effect: 'stunned' });

    expect(formatEnemyIntentLabel({ intent: 'Attack 18', dmg: 18 })).toBe('Attack');
  });
});
