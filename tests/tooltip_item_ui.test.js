import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hideItemTooltipUi,
  showItemTooltipUi,
} from '../game/ui/cards/tooltip_item_ui.js';

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

describe('tooltip_item_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates and positions an item tooltip with runtime charge and set info', () => {
    const doc = createDoc();
    const win = { innerWidth: 400, innerHeight: 320 };
    const gs = {
      _voidCrystalUsed: false,
      player: {
        items: ['void_crystal'],
      },
    };
    const data = {
      items: {
        void_crystal: {
          id: 'void_crystal',
          name: 'Void Crystal',
          icon: 'VC',
          desc: 'Charge desc',
          rarity: 'rare',
          trigger: 'combat_start',
          setId: 'void_set',
        },
        void_shard: {
          id: 'void_shard',
          name: 'Void Shard',
          icon: 'VS',
          desc: 'Shard desc',
          rarity: 'common',
          setId: 'void_set',
        },
      },
    };
    const setBonusSystem = {
      sets: {
        void_set: {
          name: 'Void Set',
          items: ['void_crystal', 'void_shard'],
          bonuses: {
            2: { label: 'Bonus active' },
          },
        },
      },
      getOwnedSetCounts: vi.fn(() => ({ void_set: 1 })),
    };
    const event = {
      currentTarget: {
        getBoundingClientRect: () => ({ right: 380, left: 340, top: 24 }),
      },
    };

    showItemTooltipUi(event, 'void_crystal', { data, gs, setBonusSystem, doc, win });

    const tip = win.__itemTooltipEl;
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(tip).toBe(doc.body.children[0]);
    expect(tip.id).toBe('_itemTip');
    expect(tip.style.left).toBe('58px');
    expect(tip.style.top).toBe('10px');

    const text = collectText(tip);
    expect(text).toContain('Void Crystal');
    expect(text).toContain('전투 시작 시');
    expect(text).toContain('1회 남음');
    expect(text).toContain('Void Set');
    expect(text).toContain('보유');
    expect(text).toContain('Bonus active');
  });

  it('animates out and removes the stored tooltip on hide', () => {
    const parent = createElement('body');
    const tip = createElement();
    tip.parentNode = parent;
    parent.children.push(tip);
    const win = { __itemTooltipEl: tip };

    hideItemTooltipUi({ win });

    expect(win.__itemTooltipEl).toBeNull();
    expect(tip.style.animation).toBe('itemTipOut 0.14s ease forwards');
    expect(parent.children).toContain(tip);

    vi.advanceTimersByTime(140);
    expect(parent.children).not.toContain(tip);
  });
});
