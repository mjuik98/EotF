import { describe, expect, it, vi } from 'vitest';

import {
  createEnemyCardShell,
  createEnemyHpTextNode,
  createEnemyIntentContainer,
  createEnemyNameNode,
  createEnemyPreviewNode,
  createEnemySpriteNode,
  createEnemyStatusContainer,
} from '../game/ui/combat/combat_enemy_card_sections_ui.js';

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

    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
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
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    this._listeners.set(type, handler);
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
        if (node.className.split(/\s+/).filter(Boolean).includes(token)) result.push(node);
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return result;
  }
}

function createDoc() {
  return {
    _elements: new Map(),
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
}

describe('combat_enemy_card_sections_ui', () => {
  it('creates a clickable selected enemy shell with marker label', () => {
    const doc = createDoc();
    const onSelectTarget = vi.fn();
    const card = createEnemyCardShell(doc, {
      enemy: { hp: 10, isBoss: false },
      index: 2,
      isSelected: true,
      selectedMarkerText: '>>',
      onSelectTarget,
    });

    expect(card.id).toBe('enemy_2');
    expect(card.className).toContain('selected-target');
    expect(card.querySelector('.target-label-anim')).not.toBeNull();
    expect(card.style.cssText).toContain('cursor:pointer');
  });

  it('creates sprite, name, hp, intent, status, and preview sections', () => {
    const doc = createDoc();
    const statusFragment = doc.createElement('span');
    const sprite = createEnemySpriteNode(doc, 1, 'B');
    const name = createEnemyNameNode(doc, { name: 'Boss', isBoss: true, phase: 2 });
    const hpText = createEnemyHpTextNode(doc, 1, '18 / 30');
    const intent = createEnemyIntentContainer(doc, 1, vi.fn(), vi.fn());
    const status = createEnemyStatusContainer(doc, 1, statusFragment);
    const preview = createEnemyPreviewNode(doc, '6 dmg');

    expect(sprite.id).toBe('enemy_sprite_1');
    expect(name.textContent).toBe('Boss');
    expect(name.children[0].textContent).toBe(' P2');
    expect(hpText.textContent).toBe('18 / 30');
    expect(intent.id).toBe('enemy_intent_1');
    expect(status.id).toBe('enemy_status_1');
    expect(status.children[0]).toBe(statusFragment);
    expect(preview?.textContent).toBe('6 dmg');
    expect(createEnemyPreviewNode(doc, '')).toBeNull();
  });
});
