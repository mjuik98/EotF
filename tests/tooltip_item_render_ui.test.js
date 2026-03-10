import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createItemTooltipElement,
  positionItemTooltipElement,
  removeItemTooltipElement,
  resolveItemTooltipState,
} from '../game/ui/cards/tooltip_item_render_ui.js';

function createElement(tag = 'div') {
  const element = {
    tagName: String(tag).toUpperCase(),
    id: '',
    style: {},
    children: [],
    textContent: '',
    innerHTML: '',
    parentNode: null,
    append(...nodes) {
      this.children.push(...nodes);
      nodes.forEach((node) => {
        if (node && typeof node === 'object') node.parentNode = this;
      });
    },
    appendChild(node) {
      this.children.push(node);
      if (node && typeof node === 'object') node.parentNode = this;
      return node;
    },
    removeChild(node) {
      this.children = this.children.filter((child) => child !== node);
      if (node && typeof node === 'object') node.parentNode = null;
      return node;
    },
    getBoundingClientRect: vi.fn(() => ({ width: 0, height: 0 })),
  };

  Object.defineProperty(element, 'className', {
    get() {
      return this._className || '';
    },
    set(value) {
      this._className = String(value || '');
    },
    configurable: true,
  });

  return element;
}

function createDoc() {
  const body = createElement('body');
  body.appendChild = vi.fn(function appendChild(node) {
    this.children.push(node);
    if (node && typeof node === 'object') node.parentNode = this;
    return node;
  });

  return {
    body,
    createElement: vi.fn((tag) => createElement(tag)),
  };
}

function collectText(node) {
  const own = [];
  if (typeof node.textContent === 'string' && node.textContent) own.push(node.textContent);
  if (typeof node.innerHTML === 'string' && node.innerHTML) own.push(node.innerHTML);
  for (const child of node.children || []) own.push(collectText(child));
  return own.join(' ');
}

describe('tooltip_item_render_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves runtime charge, trigger text, and set ownership state', () => {
    const data = {
      items: {
        void_crystal: { id: 'void_crystal', setId: 'void_set', rarity: 'rare', trigger: 'combat_start' },
        void_shard: { id: 'void_shard', setId: 'void_set' },
      },
    };
    const item = data.items.void_crystal;
    const gs = {
      _voidCrystalUsed: false,
      player: { items: ['void_crystal'] },
    };
    const setBonusSystem = {
      sets: {
        void_set: {
          name: 'Void Set',
          items: ['void_crystal', 'void_shard'],
          bonuses: { 2: { label: 'Active' } },
        },
      },
      getOwnedSetCounts: vi.fn(() => ({ void_set: 1 })),
    };

    const state = resolveItemTooltipState('void_crystal', item, data, gs, setBonusSystem);

    expect(state.rarity).toBe('rare');
    expect(state.triggerText).toBe('전투 시작 시');
    expect(state.liveCharge.remaining).toBe(1);
    expect(state.setDef.name).toBe('Void Set');
    expect(state.setCount).toBe(1);
    expect(state.setOwnedFlags).toEqual([true, false]);
  });

  it('creates the item tooltip shell and positions it within the viewport', () => {
    const doc = createDoc();
    const item = {
      id: 'void_crystal',
      name: 'Void Crystal',
      icon: 'VC',
      desc: 'Charge desc',
      rarity: 'rare',
    };
    const data = {
      items: {
        void_crystal: item,
        void_shard: { id: 'void_shard', name: 'Void Shard', icon: 'VS' },
      },
    };
    const state = {
      liveCharge: { type: 'dot', remaining: 1, label: '이번 전투 발동' },
      rarity: 'rare',
      rarityMeta: { color: '#f0d472', glow: 'rgba(240,180,41,0.4)', border: 'rgba(240,180,41,0.4)', rgb: '240,180,41' },
      setCount: 1,
      setDef: { name: 'Void Set', items: ['void_crystal', 'void_shard'], bonuses: { 2: { label: 'Bonus active' } } },
      setOwnedFlags: [true, false],
      triggerText: '전투 시작 시',
    };
    const el = createItemTooltipElement(doc, item, data, state);
    const win = { innerWidth: 400, innerHeight: 320 };
    const event = {
      currentTarget: {
        getBoundingClientRect: () => ({ right: 380, left: 340, top: 24 }),
      },
    };

    const pos = positionItemTooltipElement(event, el, doc, win);

    expect(el.id).toBe('_itemTip');
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(pos).toEqual({ x: 58, y: 10 });
    expect(el.style.left).toBe('58px');
    expect(el.style.top).toBe('10px');

    const text = collectText(el);
    expect(text).toContain('Void Crystal');
    expect(text).toContain('전투 시작 시');
    expect(text).toContain('1회 남음');
    expect(text).toContain('Void Set');
    expect(text).toContain('Bonus active');
  });

  it('animates out and removes the stored tooltip element', () => {
    const parent = createElement('body');
    const tip = createElement();
    tip.parentNode = parent;
    parent.children.push(tip);
    const win = { __itemTooltipEl: tip };

    const removed = removeItemTooltipElement(win);

    expect(removed).toBe(tip);
    expect(win.__itemTooltipEl).toBeNull();
    expect(tip.style.animation).toBe('itemTipOut 0.14s ease forwards');

    vi.advanceTimersByTime(140);
    expect(parent.children).not.toContain(tip);
  });
});
