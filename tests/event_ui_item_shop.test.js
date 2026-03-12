import { describe, expect, it, vi } from 'vitest';

const { buildItemShopStockUseCaseSpy, purchaseItemFromShopUseCaseSpy, dismissTransientOverlaySpy } = vi.hoisted(() => ({
  buildItemShopStockUseCaseSpy: vi.fn(),
  purchaseItemFromShopUseCaseSpy: vi.fn(),
  dismissTransientOverlaySpy: vi.fn((overlay) => overlay?.remove?.()),
}));

vi.mock('../game/app/event/use_cases/item_shop_use_case.js', () => ({
  buildItemShopStockUseCase: buildItemShopStockUseCaseSpy,
  purchaseItemFromShopUseCase: purchaseItemFromShopUseCaseSpy,
}));

vi.mock('../game/ui/screens/event_ui_helpers.js', () => ({
  dismissTransientOverlay: dismissTransientOverlaySpy,
  getShopItemIcon: vi.fn((item) => item.icon || '*'),
}));

import { showEventItemShopOverlay } from '../game/ui/screens/event_ui_item_shop.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const styleState = {};
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
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
      onclick: null,
      onmouseenter: null,
      onmouseleave: null,
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
  it('renders owned and purchasable item cards with current gold', () => {
    buildItemShopStockUseCaseSpy.mockReturnValueOnce([
      { item: { id: 'owned', name: 'Owned Relic', desc: 'owned', icon: 'O' }, cost: 10, rarity: 'common' },
      { item: { id: 'new', name: 'New Relic', desc: 'new', icon: 'N' }, cost: 15, rarity: 'rare' },
    ]);

    const doc = createDoc();
    const gs = { player: { gold: 20, items: ['owned'] } };

    showEventItemShopOverlay(gs, { items: {} }, { token: 'rules' }, { doc });

    const overlay = doc.elements.itemShopOverlay;
    const list = doc.elements.itemShopList;
    expect(overlay).toBeTruthy();
    expect(doc.elements.itemShopGold.textContent).toBe(20);
    expect(list.children).toHaveLength(2);
    expect(list.children[0].children.at(-1).className).toBe('item-shop-owned-overlay');
    expect(list.children[1].style.cursor).toBe('pointer');
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
