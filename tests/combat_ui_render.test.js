import { describe, expect, it, vi } from 'vitest';
import { CombatUI } from '../game/ui/combat/combat_ui.js';

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

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
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
    this._textContent = '';
    this.innerHTML = '';
    this.onclick = null;
    this.onmouseenter = null;
    this.onmouseleave = null;
    this._listeners = new Map();

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
      toggle: (token, force) => {
        const hasToken = this.classList.contains(token);
        const shouldAdd = force === undefined ? !hasToken : !!force;
        if (shouldAdd) this.classList.add(token);
        else this.classList.remove(token);
        return shouldAdd;
      },
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
    if (node.isFragment) {
      node.children.forEach((child) => this.appendChild(child));
      return node;
    }
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  prepend(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
    }
    node.parentNode = this;
    this.children.unshift(node);
    return node;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
      this.parentNode = null;
    }
    if (this.id) this.ownerDocument._elements.delete(this.id);
  }

  addEventListener(type, callback) {
    this._listeners.set(type, callback);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const result = [];
    const visit = (node) => {
      if (!(node instanceof MockElement)) return;
      if (selector.startsWith('.')) {
        const classToken = selector.slice(1);
        if (node.className.split(/\s+/).filter(Boolean).includes(classToken)) {
          result.push(node);
        }
      } else if (selector.startsWith('#')) {
        if (node.id === selector.slice(1)) {
          result.push(node);
        }
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return result;
  }

  getBoundingClientRect() {
    return { left: 10, right: 100, top: 20 };
  }
}

function createMockDocument() {
  const doc = {
    _elements: new Map(),
    body: null,
    defaultView: { HTMLElement: MockElement },
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    createTextNode(text) {
      return new MockTextNode(text);
    },
    createDocumentFragment() {
      return new MockFragment(doc);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
    querySelector(selector) {
      if (selector.includes(':hover')) return null;
      return this.body?.querySelector(selector) || null;
    },
    querySelectorAll(selector) {
      return this.body?.querySelectorAll(selector) || [];
    },
  };
  doc.body = new MockElement(doc, 'body');
  return doc;
}

function createState() {
  return {
    combat: {
      enemies: [{
        name: 'Bat',
        hp: 30,
        maxHp: 30,
        shield: 2,
        icon: 'B',
        ai: () => ({ type: 'attack', intent: 'Attack 6', dmg: 6 }),
        statusEffects: { poisoned: 2, poisonDuration: 3 },
      }],
      turn: 1,
      playerTurn: true,
    },
    player: {
      hand: ['strike'],
      energy: 3,
      maxEnergy: 3,
    },
    _selectedTarget: 0,
    getBuff: () => null,
  };
}

describe('CombatUI.renderCombatEnemies', () => {
  it('renders enemy cards and updates them incrementally', () => {
    const doc = createMockDocument();
    const zone = doc.createElement('div');
    zone.id = 'enemyZone';
    doc.body.appendChild(zone);

    const gs = createState();
    const data = {
      cards: {
        strike: { type: 'ATTACK', dmg: 6, cost: 1 },
      },
    };
    const selectTarget = vi.fn();

    CombatUI.renderCombatEnemies({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      gs,
      data,
      selectTarget,
      forceFullRender: true,
    });

    expect(doc.getElementById('enemy_0')).not.toBeNull();
    expect(doc.getElementById('enemy_hptext_0')?.textContent).toContain('30 / 30');
    expect(doc.getElementById('enemy_intent_0')).not.toBeNull();
    expect(doc.getElementById('enemy_status_0')).not.toBeNull();
    expect(doc.getElementById('enemy_0').querySelector('.enemy-dmg-preview')).not.toBeNull();

    gs.combat.enemies[0].hp = 18;
    gs.combat.enemies[0].shield = 0;
    gs._selectedTarget = null;

    CombatUI.renderCombatEnemies({
      doc,
      win: { innerWidth: 1280, innerHeight: 720 },
      gs,
      data,
      selectTarget,
    });

    expect(doc.getElementById('enemy_hptext_0')?.textContent).toContain('18 / 30');
    expect(doc.getElementById('enemy_0').querySelector('.enemy-dmg-preview')).toBeNull();
  });
});
