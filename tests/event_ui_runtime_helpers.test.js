import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/event_ui_dom.js', () => ({
  renderChoices: vi.fn(),
}));

vi.mock('../game/ui/screens/event_ui_item_shop.js', () => ({
  showEventItemShopOverlay: vi.fn(),
}));

vi.mock('../game/ui/screens/event_ui_rest_site.js', () => ({
  showEventRestSiteOverlay: vi.fn(),
}));

vi.mock('../game/ui/screens/event_ui_shop.js', () => ({
  createEventShop: vi.fn(() => ({ title: 'shop' })),
}));

describe('event_ui_runtime_helpers', () => {
  it('renders the event shell and opens the modal', async () => {
    const { renderEventShellRuntime } = await import('../game/ui/screens/event_ui_runtime_helpers.js');
    const dom = await import('../game/ui/screens/event_ui_dom.js');
    const eventModal = { classList: { add: vi.fn() } };
    const elements = {
      eventEyebrow: { textContent: '' },
      eventTitle: { textContent: '' },
      eventDesc: { textContent: '' },
      eventImageContainer: { style: { display: 'block' } },
      eventModal,
    };
    const doc = {
      getElementById: vi.fn((id) => elements[id] || null),
    };
    const refreshGoldBar = vi.fn();
    const resolveChoice = vi.fn();

    renderEventShellRuntime({ title: 'An Event', desc: 'Desc', choices: [] }, {
      doc,
      gs: { player: {} },
      refreshGoldBar,
      resolveChoice,
    });

    expect(elements.eventEyebrow.textContent).toBe('LAYER 1 EVENT');
    expect(elements.eventTitle.textContent).toBe('An Event');
    expect(elements.eventDesc.textContent).toBe('Desc');
    expect(elements.eventImageContainer.style.display).toBe('none');
    expect(refreshGoldBar).toHaveBeenCalled();
    expect(dom.renderChoices).toHaveBeenCalledWith(expect.any(Object), doc, expect.any(Object), resolveChoice);
    expect(eventModal.classList.add).toHaveBeenCalledWith('active');
  });

  it('delegates shop, rest-site, and item-shop entrypoints to extracted helpers', async () => {
    const helpers = await import('../game/ui/screens/event_ui_runtime_helpers.js');
    const shop = await import('../game/ui/screens/event_ui_shop.js');
    const rest = await import('../game/ui/screens/event_ui_rest_site.js');
    const itemShop = await import('../game/ui/screens/event_ui_item_shop.js');
    const deps = { marker: true };
    const showItemShop = vi.fn();

    const created = helpers.openEventShopRuntime(deps, {
      gs: { player: {} },
      data: { items: {} },
      runRules: {},
      showItemShop,
    });
    helpers.openEventRestSiteRuntime(deps, {
      gs: { player: {} },
      data: {},
      runRules: {},
      doc: { body: {} },
      audioEngine: { playClick: vi.fn() },
      showCardDiscard: vi.fn(),
      showEvent: vi.fn(),
    });
    helpers.openEventItemShopRuntime(null, deps, {
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
