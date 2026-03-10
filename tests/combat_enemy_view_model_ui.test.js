import { describe, expect, it, vi } from 'vitest';
import { buildEnemyHpText, buildEnemyViewModel } from '../game/ui/combat/combat_enemy_view_model_ui.js';

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

function createState(turn = 1) {
  return {
    combat: {
      enemies: [],
      turn,
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

describe('combat_enemy_view_model_ui', () => {
  it('builds a selected enemy view model with preview text and wired handlers', () => {
    const doc = createMockDocument();
    const enemy = {
      name: 'Bat',
      hp: 30,
      maxHp: 30,
      shield: 2,
      icon: 'B',
      ai: () => ({ type: 'attack', intent: 'Attack 6', dmg: 6 }),
      statusEffects: { poisoned: 2, poisonDuration: 3 },
    };
    const gs = createState(1);
    gs.combat.enemies = [enemy];
    const data = {
      cards: {
        strike: { type: 'ATTACK', dmg: 6, cost: 1 },
      },
    };
    const selectTarget = vi.fn();
    const onShowIntentTooltip = vi.fn();
    const onHideIntentTooltip = vi.fn();

    const viewModel = buildEnemyViewModel({
      enemy,
      index: 0,
      gs,
      data,
      doc,
      deps: { selectTarget },
      handlers: {
        onShowStatusTooltip: vi.fn(),
        onHideStatusTooltip: vi.fn(),
        onShowIntentTooltip,
        onHideIntentTooltip,
      },
    });

    expect(viewModel.hpText).toBe('30 / 30 (Shield 2)');
    expect(viewModel.intentIcon).toBe('!');
    expect(viewModel.intentDmgVal).toBe(6);
    expect(viewModel.previewText).not.toBe('');
    expect(viewModel.isSelected).toBe(true);
    expect(viewModel.statusFragment.children.length).toBeGreaterThan(0);

    viewModel.onSelectTarget();
    expect(selectTarget).toHaveBeenCalledWith(0);

    viewModel.onIntentEnter({ type: 'mouseenter' });
    expect(onShowIntentTooltip).toHaveBeenCalledWith({ type: 'mouseenter' }, 0, { selectTarget });
    viewModel.onIntentLeave();
    expect(onHideIntentTooltip).toHaveBeenCalledWith({ selectTarget });
  });

  it('falls back to no-intent state before combat turn starts and hides select handler for dead enemies', () => {
    const doc = createMockDocument();
    const enemy = {
      name: 'Bat',
      hp: 0,
      maxHp: 30,
      shield: 0,
      icon: 'B',
      ai: () => ({ type: 'attack', intent: 'Attack 6', dmg: 6 }),
      statusEffects: {},
    };
    const gs = createState(0);
    gs.combat.enemies = [enemy];

    const viewModel = buildEnemyViewModel({
      enemy,
      index: 0,
      gs,
      data: { cards: {} },
      doc,
      deps: {},
      handlers: {
        onShowStatusTooltip: vi.fn(),
        onHideStatusTooltip: vi.fn(),
        onShowIntentTooltip: vi.fn(),
        onHideIntentTooltip: vi.fn(),
      },
    });

    expect(viewModel.intentIcon).toBe('?');
    expect(viewModel.intentLabelHtml).toBe('No intent');
    expect(viewModel.intentDmgVal).toBe(0);
    expect(viewModel.onSelectTarget).toBeNull();
    expect(viewModel.previewText).toBe('');
    expect(viewModel.isSelected).toBe(false);
  });

  it('formats enemy hp text with and without shield values', () => {
    expect(buildEnemyHpText({ hp: 12, maxHp: 30, shield: 4 })).toBe('12 / 30 (Shield 4)');
    expect(buildEnemyHpText({ hp: 12, maxHp: 30, shield: 0 })).toBe('12 / 30');
  });
});
