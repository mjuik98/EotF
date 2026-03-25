import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/event/presentation/browser/event_ui_dom.js', () => ({
  renderChoices: vi.fn(),
}));

vi.mock('../game/features/event/presentation/browser/event_ui_item_shop.js', () => ({
  showEventItemShopOverlay: vi.fn(),
}));

vi.mock('../game/features/event/presentation/browser/event_rest_site_presenter.js', () => ({
  showEventRestSiteOverlay: vi.fn(),
}));

vi.mock('../game/features/event/presentation/browser/event_shop_presenter.js', () => ({
  createEventShop: vi.fn(() => ({ title: 'shop' })),
}));

import {
  openEventItemShopRuntime,
  openEventRestSiteRuntime,
  openEventShopRuntime,
  renderEventShellRuntime,
} from '../game/features/event/presentation/browser/event_ui_runtime_helpers.js';

describe('event_ui_runtime_helpers', () => {
  it('renders the event shell and opens the modal', async () => {
    const dom = await import('../game/features/event/presentation/browser/event_ui_dom.js');
    const eventModal = { classList: { add: vi.fn() } };
    const elements = {
      eventEyebrow: { textContent: '' },
      eventTitle: { textContent: '' },
      eventDesc: { textContent: '', innerHTML: '' },
      eventImageContainer: { style: { display: 'block' } },
      eventModal,
    };
    const doc = {
      getElementById: vi.fn((id) => elements[id] || null),
    };
    const refreshGoldBar = vi.fn();
    const resolveChoice = vi.fn();

    renderEventShellRuntime({ title: 'An Event', desc: '피해 14. 잔향 20 충전 [소진]', choices: [] }, {
      doc,
      gs: { player: {} },
      refreshGoldBar,
      resolveChoice,
    });

    expect(elements.eventEyebrow.textContent).toBe('LAYER 1 EVENT');
    expect(elements.eventTitle.textContent).toBe('An Event');
    expect(elements.eventDesc.innerHTML).toContain('kw-dmg');
    expect(elements.eventDesc.innerHTML).toContain('kw-echo');
    expect(elements.eventImageContainer.style.display).toBe('none');
    expect(refreshGoldBar).toHaveBeenCalled();
    expect(dom.renderChoices).toHaveBeenCalledWith(expect.any(Object), doc, expect.any(Object), resolveChoice);
    expect(eventModal.classList.add).toHaveBeenCalledWith('active');
  });

  it('delegates shop, rest-site, and item-shop entrypoints to extracted helpers', async () => {
    const shop = await import('../game/features/event/presentation/browser/event_shop_presenter.js');
    const rest = await import('../game/features/event/presentation/browser/event_rest_site_presenter.js');
    const itemShop = await import('../game/features/event/presentation/browser/event_ui_item_shop.js');
    const deps = { marker: true };
    const showItemShop = vi.fn();

    const created = openEventShopRuntime(deps, {
      gs: { player: {} },
      data: { items: {} },
      runRules: {},
      showItemShop,
    });
    openEventRestSiteRuntime(deps, {
      gs: { player: {} },
      data: {},
      runRules: {},
      doc: { body: {} },
      audioEngine: { playClick: vi.fn() },
      showCardDiscard: vi.fn(),
      showEvent: vi.fn(),
    });
    openEventItemShopRuntime(null, deps, {
      gs: { player: {} },
      data: {},
      runRules: {},
      refreshEventGoldBar: vi.fn(),
    });

    expect(created).toEqual({ title: 'shop' });
    expect(shop.createEventShop).toHaveBeenCalled();
    expect(rest.showEventRestSiteOverlay).toHaveBeenCalled();
    expect(itemShop.showEventItemShopOverlay).toHaveBeenCalled();
  });
});
