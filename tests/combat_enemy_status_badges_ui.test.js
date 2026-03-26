import { describe, expect, it, vi } from 'vitest';
import { buildEnemyStatusBadges } from '../game/features/combat/public.js';

class MockTextNode {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = String(text ?? '');
    this.parentNode = null;
  }
}

class MockFragment {
  constructor(doc) {
    this.ownerDocument = doc;
    this.children = [];
    this.isFragment = true;
    this.parentNode = null;
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
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
    this._textContent = '';
    this._listeners = new Map();

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = String(value ?? '');
        this.children = [];
      },
    });
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, callback) {
    this._listeners.set(type, callback);
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }
}

function createMockDocument() {
  return {
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
    createTextNode(text) {
      return new MockTextNode(text);
    },
    createDocumentFragment() {
      return new MockFragment(this);
    },
  };
}

describe('buildEnemyStatusBadges', () => {
  it('renders status badges with poison duration override and hover/focus callbacks', () => {
    const doc = createMockDocument();
    const onShowStatusTooltip = vi.fn();
    const onHideStatusTooltip = vi.fn();

    const fragment = buildEnemyStatusBadges({
      poisoned: 2,
      poisonDuration: 3,
      armor_up: 1,
    }, doc, {
      onShowStatusTooltip,
      onHideStatusTooltip,
    });

    expect(fragment.children).toHaveLength(4);

    const poisonBadge = fragment.children[0];
    expect(poisonBadge.className).toBe('enemy-status-badge');
    expect(poisonBadge.textContent).toContain('(3)');
    expect(poisonBadge.style.cssText).toContain('#ff6688');
    expect(poisonBadge.tabIndex).toBe('0');
    expect(poisonBadge.role).toBe('button');
    expect(poisonBadge['aria-label']).toContain('중독');

    const armorBadge = fragment.children[2];
    expect(armorBadge.textContent).not.toContain('poisonDuration');
    expect(armorBadge.style.cssText).toContain('#88ccff');

    poisonBadge._listeners.get('mouseenter')?.({ type: 'mouseenter' });
    poisonBadge._listeners.get('focus')?.({ type: 'focus' });
    expect(onShowStatusTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mouseenter', currentTarget: poisonBadge }),
      'poisoned',
      2,
      expect.objectContaining({ doc, poisonDuration: 3 }),
    );
    expect(onShowStatusTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focus', currentTarget: poisonBadge }),
      'poisoned',
      2,
      expect.objectContaining({ doc, poisonDuration: 3 }),
    );

    poisonBadge._listeners.get('mouseleave')?.();
    poisonBadge._listeners.get('blur')?.();
    expect(onHideStatusTooltip).toHaveBeenCalledWith({ doc });
  });

  it('returns an empty fragment when there are no status effects', () => {
    const doc = createMockDocument();
    const fragment = buildEnemyStatusBadges(null, doc);
    expect(fragment.children).toHaveLength(0);
  });
});
