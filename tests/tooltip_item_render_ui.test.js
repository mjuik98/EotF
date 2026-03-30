import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/items.js';
import {
  createItemTooltipElement,
  positionItemTooltipElement,
  removeItemTooltipElement,
  resolveItemTooltipState,
} from '../game/features/combat/public.js';

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
        void_crystal: {
          id: 'void_crystal',
          setId: 'void_set',
          rarity: 'rare',
          trigger: 'combat_start',
          chargeMeta: {
            gsKey: '_voidCrystalUsed',
            max: 1,
            label: '이번 전투 발동',
            type: 'invert-dot',
            scope: 'combat',
          },
        },
        void_shard: { id: 'void_shard', setId: 'void_set' },
      },
    };
    const item = data.items.void_crystal;
    const gs = {
      _voidCrystalUsed: false,
      combat: { active: true },
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
    expect(state.rarityLabel).toBe('희귀');
    expect(state.triggerText).toBe('전투 시작 시');
    expect(state.liveCharge.remaining).toBe(1);
    expect(state.setDef.name).toBe('공허의 삼위일체');
    expect(state.setCount).toBe(1);
    expect(state.setOwnedFlags).toEqual([true, false]);
  });

  it('reads live charge from item runtime and persistent item state namespaces', () => {
    const data = {
      items: {
        echo_bell: { ...ITEMS.echo_bell, rarity: 'common' },
        energy_core: { ...ITEMS.energy_core, rarity: 'rare' },
      },
    };
    const gs = {
      combat: { active: true },
      _itemRuntime: {
        echo_bell: { count: 4 },
      },
      player: {
        items: ['echo_bell', 'energy_core'],
        _itemState: {
          energy_core: { count: 1 },
        },
      },
    };

    const echoBellState = resolveItemTooltipState('echo_bell', data.items.echo_bell, data, gs, null);
    const energyCoreState = resolveItemTooltipState('energy_core', data.items.energy_core, data, gs, null);

    expect(echoBellState.liveCharge).toEqual(expect.objectContaining({
      type: 'num',
      val: 4,
      max: 10,
    }));
    expect(energyCoreState.liveCharge).toEqual(expect.objectContaining({
      type: 'num',
      val: 1,
      max: 2,
    }));
  });

  it('resets combat-scoped charge outside combat and reads charge metadata from item definitions', () => {
    const data = {
      items: {
        liquid_memory: {
          id: 'liquid_memory',
          rarity: 'uncommon',
          chargeMeta: {
            itemRuntimeKey: 'liquid_memory',
            stateKey: 'used',
            max: 1,
            label: '전투당 복구',
            type: 'invert-dot',
            scope: 'combat',
          },
        },
      },
    };
    const gs = {
      combat: { active: false },
      _itemRuntime: {
        liquid_memory: { used: true },
      },
      player: {
        items: ['liquid_memory'],
      },
    };

    const state = resolveItemTooltipState('liquid_memory', data.items.liquid_memory, data, gs, null);

    expect(state.liveCharge).toEqual(expect.objectContaining({
      type: 'dot',
      remaining: 1,
      max: 1,
    }));
  });

  it('prefers localized set names over raw runtime identifiers', () => {
    const data = {
      items: {
        unyielding_fort: {
          id: 'unyielding_fort',
          name: '불굴의 성채',
          desc: '세트 구성품\n[세트: 철옹성]',
          rarity: 'rare',
          setId: 'iron_fortress',
        },
        guardian_seal: {
          id: 'guardian_seal',
          name: '수호자의 인장',
          desc: '세트 구성품\n[세트: 철옹성]',
          rarity: 'rare',
          setId: 'iron_fortress',
        },
      },
    };
    const item = data.items.unyielding_fort;
    const gs = {
      player: { items: ['unyielding_fort'] },
    };
    const setBonusSystem = {
      sets: {
        iron_fortress: {
          name: 'IRON_FORTRESS',
          items: ['unyielding_fort', 'guardian_seal'],
          bonuses: { 2: { label: '방어막 관련 효과' } },
        },
      },
      getOwnedSetCounts: vi.fn(() => ({ iron_fortress: 1 })),
    };

    const state = resolveItemTooltipState('unyielding_fort', item, data, gs, setBonusSystem);

    expect(state.setDef.name).toBe('철옹성');
  });

  it('falls back to owned set members when runtime counts omit a dynamically resolved set', () => {
    const data = {
      items: {
        opening_mark: {
          id: 'opening_mark',
          name: '시작의 각인',
          desc: '세트 구성품\n[세트: 시작의 각인]',
          rarity: 'uncommon',
          setId: 'opening_set',
        },
        opening_charm: {
          id: 'opening_charm',
          name: '시작의 부적',
          desc: '세트 구성품\n[세트: 시작의 각인]',
          rarity: 'uncommon',
          setId: 'opening_set',
        },
      },
    };
    const gs = {
      player: { items: ['opening_mark'] },
    };
    const setBonusSystem = {
      sets: {},
      getOwnedSetCounts: vi.fn(() => ({})),
    };

    const state = resolveItemTooltipState('opening_mark', data.items.opening_mark, data, gs, setBonusSystem);

    expect(state.setDef).toEqual(expect.objectContaining({
      name: '시작의 각인',
      items: ['opening_mark', 'opening_charm'],
    }));
    expect(state.setCount).toBe(1);
    expect(state.setOwnedFlags).toEqual([true, false]);
  });

  it('keeps feature tooltip rendering decoupled from data rarity imports', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'game/features/combat/presentation/browser/tooltip_item_element.js'),
      'utf8',
    );

    expect(source).not.toContain('data/rarity_meta.js');
    expect(source).toContain('rarityLabel');
  });

  it('styles item tooltip keyword highlights with the readable comparison palette', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.item-tooltip-desc .kw-dmg');
    expect(source).toContain('.item-tooltip-desc .kw-shield');
    expect(source).toContain('.item-tooltip-desc .kw-echo');
    expect(source).toContain('.item-tooltip-desc .kw-exhaust.kw-block');
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
    const descBox = el.children[1]?.children?.[1];
    expect(descBox?.className).toBe('item-tooltip-desc');
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
