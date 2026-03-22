import { describe, expect, it, vi } from 'vitest';

import { buildRelicPanel } from '../game/ui/map/map_ui_next_nodes_render.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this._textContent = '';
    this.className = '';
    this.dataset = {};
    this.listeners = {};
    this._rect = null;
    this.style = {
      setProperty: (key, value) => {
        this.style[key] = value;
      },
    };
    this.classList = {
      _tokens: new Set(),
      add: (...tokens) => tokens.forEach((token) => this.classList._tokens.add(token)),
      remove: (...tokens) => tokens.forEach((token) => this.classList._tokens.delete(token)),
      contains: (token) => this.classList._tokens.has(token),
      toggle: (token, force) => {
        if (force === undefined) {
          if (this.classList._tokens.has(token)) {
            this.classList._tokens.delete(token);
            return false;
          }
          this.classList._tokens.add(token);
          return true;
        }
        if (force) this.classList._tokens.add(token);
        else this.classList._tokens.delete(token);
        return !!force;
      },
    };

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = value == null ? '' : String(value);
        if (this.children.length) {
          this.children.forEach((child) => {
            child.parentNode = null;
          });
          this.children = [];
        }
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

  addEventListener(name, handler) {
    this.listeners[name] = handler;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }

  getBoundingClientRect() {
    return this._rect || {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  }
}

function createDoc() {
  const win = {
    innerWidth: 1280,
    innerHeight: 720,
    requestAnimationFrame: (cb) => cb(),
    addEventListener() {},
    removeEventListener() {},
  };
  const doc = {
    defaultView: win,
    addEventListener() {},
    removeEventListener() {},
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
  };
  return doc;
}

describe('map_ui_next_nodes_relic_panel', () => {
  it('uses a compact layout detail panel instead of floating item tooltips', () => {
    const doc = createDoc();
    const tooltipUI = {
      showItemTooltip: vi.fn(),
      hideItemTooltip: vi.fn(),
    };

    const panel = buildRelicPanel(doc, {
      player: {
        items: ['dull_blade', 'echo_charm'],
      },
    }, {
      items: {
        dull_blade: {
          id: 'dull_blade',
          name: '무딘 검',
          icon: '🗡️',
          rarity: 'common',
          desc: '카드 사용 시 10% 확률: 잔향 10 충전',
          trigger: 'card_play',
          setId: 'echo_set',
        },
        echo_charm: {
          id: 'echo_charm',
          name: '메아리 부적',
          icon: '🔹',
          rarity: 'uncommon',
          desc: '전투 시작 시 잔향 +5',
          trigger: 'combat_start',
          setId: 'echo_set',
        },
      },
    }, tooltipUI, {
      requestAnimationFrame: (cb) => cb(),
      setBonusSystem: {
        sets: {
          echo_set: {
            name: '메아리 공명',
            items: ['dull_blade', 'echo_charm'],
            bonuses: { 2: { label: '전투 시작 잔향 +10' } },
          },
        },
        getOwnedSetCounts: () => ({ echo_set: 2 }),
      },
    });

    expect(panel.className).toBe('nc-relic-panel');
    expect(panel.children).toHaveLength(3);
    const scrollWrap = panel.children[1];
    const list = scrollWrap.children[0];
    const detailPanel = panel.children[2];
    const detailList = detailPanel.children[0];
    const firstSlot = list.children[0];
    const secondSlot = list.children[1];

    expect(firstSlot.title || '').toBe('');
    expect(firstSlot['aria-label']).toContain('메아리 부적');
    expect(firstSlot.role).toBe('button');
    expect(firstSlot['aria-pressed']).toBe('true');
    expect(firstSlot.dataset.active).toBe('true');
    expect(firstSlot.listeners.mouseenter).toBeTypeOf('function');
    expect(firstSlot.listeners.click).toBeTypeOf('function');
    expect(tooltipUI.showItemTooltip).not.toHaveBeenCalled();
    expect(firstSlot.children[1].children).toHaveLength(1);
    expect(firstSlot.children[1].children[0].className).toBe('nc-relic-name');
    expect(detailPanel.style.position).toBe('absolute');
    expect(detailPanel.style.right).toBe('calc(100% + 14px)');
    expect(detailPanel.style.top).toBe('56px');
    expect(detailPanel.style.width).toBe('min(240px, calc(100vw - 48px))');
    expect(detailPanel.style.marginTop).toBe('0');
    expect(detailPanel.dataset.placement).toBe('floating-left');
    expect(detailPanel.style.transformOrigin).toBe('100% 24px');
    expect(detailPanel.style.transition).toContain('cubic-bezier');

    expect(detailList.children[0].children[0].textContent).toContain('메아리 부적');
    expect(detailList.children[1].textContent).toContain('전투 시작 시 잔향 +5');
    expect(detailList.children[2].children[0].textContent).toContain('메아리 공명');

    panel._rect = { x: 1088, y: 0, top: 0, left: 1088, right: 1280, bottom: 720, width: 192, height: 720 };
    detailPanel._rect = { x: 834, y: 56, top: 56, left: 834, right: 1074, bottom: 172, width: 240, height: 116 };
    firstSlot._rect = { x: 1101, y: 72, top: 72, left: 1101, right: 1269, bottom: 114, width: 168, height: 42 };
    secondSlot._rect = { x: 1101, y: 228, top: 228, left: 1101, right: 1269, bottom: 270, width: 168, height: 42 };

    secondSlot.listeners.mouseenter({ currentTarget: secondSlot });
    expect(secondSlot.dataset.active).toBe('true');
    expect(secondSlot['aria-pressed']).toBe('true');
    expect(firstSlot['aria-pressed']).toBe('false');
    expect(detailList.children[0].children[0].textContent).toContain('무딘 검');
    expect(detailList.children[1].textContent).toContain('카드 사용 시 10% 확률');
    expect(detailPanel.style.top).toBe('191px');
    expect(tooltipUI.showItemTooltip).not.toHaveBeenCalled();
    expect(tooltipUI.hideItemTooltip).not.toHaveBeenCalled();
  });

  it('pins the clicked relic detail and falls back inline when the left side is too narrow', () => {
    const doc = createDoc();
    const panel = buildRelicPanel(doc, {
      player: {
        items: ['dull_blade', 'echo_charm'],
      },
    }, {
      items: {
        dull_blade: {
          id: 'dull_blade',
          name: '무딘 검',
          icon: '🗡️',
          rarity: 'common',
          desc: '카드 사용 시 10% 확률: 잔향 10 충전',
          trigger: 'card_play',
        },
        echo_charm: {
          id: 'echo_charm',
          name: '메아리 부적',
          icon: '🔹',
          rarity: 'uncommon',
          desc: '전투 시작 시 잔향 +5',
          trigger: 'combat_start',
        },
      },
    }, { showItemTooltip: vi.fn(), hideItemTooltip: vi.fn() }, {
      requestAnimationFrame: (cb) => cb(),
    });

    const scrollWrap = panel.children[1];
    const list = scrollWrap.children[0];
    const detailPanel = panel.children[2];
    const detailList = detailPanel.children[0];
    const firstSlot = list.children[0];
    const secondSlot = list.children[1];

    panel._rect = { x: 150, y: 0, top: 0, left: 150, right: 342, bottom: 720, width: 192, height: 720 };
    detailPanel._rect = { x: 0, y: 56, top: 56, left: 0, right: 240, bottom: 156, width: 240, height: 100 };
    firstSlot._rect = { x: 163, y: 80, top: 80, left: 163, right: 331, bottom: 122, width: 168, height: 42 };
    secondSlot._rect = { x: 163, y: 136, top: 136, left: 163, right: 331, bottom: 178, width: 168, height: 42 };

    secondSlot.listeners.click({ currentTarget: secondSlot, preventDefault: vi.fn() });
    expect(detailPanel.dataset.pinned).toBe('true');
    expect(detailPanel.dataset.placement).toBe('inline');
    expect(detailPanel.style.position).toBe('static');
    expect(detailPanel.style.width).toBe('100%');
    expect(detailPanel.style.transformOrigin).toBe('50% 0');
    expect(detailList.children[0].children[0].textContent).toContain('무딘 검');

    firstSlot.listeners.mouseenter({ currentTarget: firstSlot });
    expect(detailList.children[0].children[0].textContent).toContain('무딘 검');

    secondSlot.listeners.click({ currentTarget: secondSlot, preventDefault: vi.fn() });
    expect(detailPanel.dataset.pinned).toBe('false');

    firstSlot.listeners.mouseenter({ currentTarget: firstSlot });
    expect(detailList.children[0].children[0].textContent).toContain('메아리 부적');
  });

  it('supports keyboard navigation across stage relic rows', () => {
    const doc = createDoc();

    const panel = buildRelicPanel(doc, {
      player: {
        items: ['dull_blade', 'echo_charm', 'glass_pin'],
      },
    }, {
      items: {
        dull_blade: {
          id: 'dull_blade',
          name: '무딘 검',
          icon: '🗡️',
          rarity: 'common',
          desc: '카드 사용 시 10% 확률: 잔향 10 충전',
          trigger: 'card_play',
        },
        echo_charm: {
          id: 'echo_charm',
          name: '메아리 부적',
          icon: '🔹',
          rarity: 'uncommon',
          desc: '전투 시작 시 잔향 +5',
          trigger: 'combat_start',
        },
        glass_pin: {
          id: 'glass_pin',
          name: '유리 핀',
          icon: '📍',
          rarity: 'rare',
          desc: '치명타 확률 +5%',
          trigger: 'passive',
        },
      },
    }, { showItemTooltip: vi.fn(), hideItemTooltip: vi.fn() }, {
      requestAnimationFrame: (cb) => cb(),
    });

    const scrollWrap = panel.children[1];
    const list = scrollWrap.children[0];
    const firstSlot = list.children[0];
    const secondSlot = list.children[1];
    const lastSlot = list.children[2];
    const detailList = panel.children[2].children[0];

    const nextEvent = { key: 'ArrowDown', preventDefault: vi.fn() };
    firstSlot.listeners.keydown(nextEvent);
    expect(nextEvent.preventDefault).toHaveBeenCalledWith();
    expect(doc.activeElement).toBe(secondSlot);
    expect(secondSlot.dataset.active).toBe('true');
    expect(detailList.children[0].children[0].textContent).toContain('메아리 부적');

    const endEvent = { key: 'End', preventDefault: vi.fn() };
    secondSlot.listeners.keydown(endEvent);
    expect(doc.activeElement).toBe(lastSlot);
    expect(lastSlot.dataset.active).toBe('true');
    expect(detailList.children[0].children[0].textContent).toContain('무딘 검');
  });
});
