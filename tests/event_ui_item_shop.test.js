import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const { buildItemShopStockUseCaseSpy, purchaseItemFromShopUseCaseSpy, dismissTransientOverlaySpy } = vi.hoisted(() => ({
  buildItemShopStockUseCaseSpy: vi.fn(),
  purchaseItemFromShopUseCaseSpy: vi.fn(),
  dismissTransientOverlaySpy: vi.fn((overlay) => overlay?.remove?.()),
}));

vi.mock('../game/features/event/application/item_shop_use_case.js', () => ({
  buildItemShopStockUseCase: buildItemShopStockUseCaseSpy,
  purchaseItemFromShopUseCase: purchaseItemFromShopUseCaseSpy,
}));

vi.mock('../game/features/event/presentation/browser/event_ui_helpers.js', () => ({
  dismissTransientOverlay: dismissTransientOverlaySpy,
  getShopItemIcon: vi.fn((item) => item.icon || '*'),
}));

import { showEventItemShopOverlay } from '../game/features/event/public.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const styleState = {};
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      type: '',
      tabIndex: -1,
      disabled: false,
      attributes: {},
      style: {
        ...styleState,
        setProperty: vi.fn((name, value) => {
          styleState[name] = value;
        }),
      },
      className: '',
      textContent: '',
      innerHTML: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
        nodes.forEach((node) => {
          if (node?.id) elements[node.id] = node;
        });
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
      remove() {
        if (this.id) delete elements[this.id];
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
        this[name] = String(value);
      },
      getAttribute(name) {
        return this.attributes[name];
      },
      onclick: null,
      onmouseenter: null,
      onmouseleave: null,
      onfocus: null,
      onblur: null,
    };
    return el;
  };
}

function createDoc() {
  const elements = {};
  const createElement = createElementFactory(elements);
  const body = createElement('body');
  body.appendChild = (node) => {
    body.children.push(node);
    if (node?.id) elements[node.id] = node;
    return node;
  };

  return {
    body,
    createElement,
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('showEventItemShopOverlay', () => {
  it('styles item shop keyword highlights with the readable comparison palette', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.item-shop-desc .kw-dmg');
    expect(source).toContain('.item-shop-desc .kw-energy');
    expect(source).toContain('.item-shop-desc .kw-draw');
    expect(source).toContain('.item-shop-desc .kw-buff.kw-block');
  });

  it('renders owned and purchasable item cards with current gold', () => {
    buildItemShopStockUseCaseSpy.mockReturnValueOnce([
      { item: { id: 'owned', name: 'Owned Relic', desc: 'owned', icon: 'O' }, cost: 10, rarity: 'common' },
      { item: { id: 'new', name: 'New Relic', desc: '피해 14 [소진]', icon: 'N' }, cost: 15, rarity: 'rare' },
    ]);

    const doc = createDoc();
    const gs = { player: { gold: 20, items: ['owned'] } };

    showEventItemShopOverlay(gs, { items: {} }, { token: 'rules' }, { doc });

    const overlay = doc.elements.itemShopOverlay;
    const list = doc.elements.itemShopList;
    expect(overlay).toBeTruthy();
    expect(overlay.children[0].children[0].textContent).toBe('유물 상점');
    expect(overlay.children[0].children[1].textContent).toBe('무엇을 구매하시겠습니까?');
    expect(overlay.children[0].children[2].textContent).toBe('보유 골드: ');
    expect(doc.elements.itemShopGold.textContent).toBe(20);
    expect(list.children).toHaveLength(2);
    expect(list.children[0].tagName).toBe('BUTTON');
    expect(list.children[0].type).toBe('button');
    expect(list.children[0].disabled).toBe(true);
    expect(list.children[0].getAttribute('aria-disabled')).toBe('true');
    expect(list.children[0].children.at(-1).className).toBe('item-shop-owned-overlay');
    expect(list.children[1].getAttribute('aria-label')).toBe('New Relic. 피해 14 [소진]');
    expect(list.children[1].style.cursor).toBe('pointer');
    expect(list.children[1].children[3].innerHTML).toContain('kw-dmg');
    expect(list.children[1].children[3].innerHTML).toContain('kw-exhaust kw-block');
    expect(typeof list.children[1].onfocus).toBe('function');
    expect(typeof list.children[1].onblur).toBe('function');
  });

  it('purchases an item, rerenders gold, and triggers success hooks', () => {
    buildItemShopStockUseCaseSpy.mockReturnValueOnce([
      { item: { id: 'new', name: 'New Relic', desc: 'new', icon: 'N' }, cost: 15, rarity: 'rare' },
    ]);
    purchaseItemFromShopUseCaseSpy.mockImplementationOnce(({ gs }) => {
      gs.player.gold = 5;
      return { success: true };
    });

    const doc = createDoc();
    const playItemGet = vi.fn();
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const showItemToast = vi.fn();
    const updateUI = vi.fn();
    const refreshEventGoldBar = vi.fn();
    const gs = { player: { gold: 20, items: [] } };
    const data = { items: {} };

    showEventItemShopOverlay(gs, data, { token: 'rules' }, {
      doc,
      playItemGet,
      audioEngine,
      showItemToast,
      updateUI,
      refreshEventGoldBar,
    });

    const card = doc.elements.itemShopList.children[0];
    card.onclick();

    expect(purchaseItemFromShopUseCaseSpy).toHaveBeenCalledWith({ gs, item: expect.objectContaining({ id: 'new' }), cost: 15 });
    expect(playItemGet).toHaveBeenCalledTimes(1);
    expect(audioEngine.playEvent).not.toHaveBeenCalled();
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(showItemToast).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }), { forceQueue: true });
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(refreshEventGoldBar).toHaveBeenCalledTimes(1);
    expect(doc.elements.itemShopGold.textContent).toBe(5);
  });

  it('falls back to the audio engine item-get event when no injected hook exists', () => {
    buildItemShopStockUseCaseSpy.mockReturnValueOnce([
      { item: { id: 'new', name: 'New Relic', desc: 'new', icon: 'N' }, cost: 15, rarity: 'rare' },
    ]);
    purchaseItemFromShopUseCaseSpy.mockImplementationOnce(({ gs }) => {
      gs.player.gold = 5;
      return { success: true };
    });

    const doc = createDoc();
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const showItemToast = vi.fn();
    const updateUI = vi.fn();
    const refreshEventGoldBar = vi.fn();
    const gs = { player: { gold: 20, items: [] } };

    showEventItemShopOverlay(gs, { items: {} }, { token: 'rules' }, {
      doc,
      audioEngine,
      showItemToast,
      updateUI,
      refreshEventGoldBar,
    });

    doc.elements.itemShopList.children[0].onclick();

    expect(audioEngine.playEvent).toHaveBeenCalledWith('ui', 'itemGet');
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(showItemToast).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }), { forceQueue: true });
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(refreshEventGoldBar).toHaveBeenCalledTimes(1);
  });

  it('closes the overlay through dismissTransientOverlay', () => {
    buildItemShopStockUseCaseSpy.mockReturnValueOnce([]);
    const doc = createDoc();

    showEventItemShopOverlay({ player: { gold: 9, items: [] } }, { items: {} }, { token: 'rules' }, { doc });

    const closeBtn = doc.elements.itemShopOverlay.children[2];
    closeBtn.onclick();

    expect(dismissTransientOverlaySpy).toHaveBeenCalledTimes(1);
  });
});
