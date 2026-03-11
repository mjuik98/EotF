import { describe, expect, it, vi } from 'vitest';

import { createEventActions } from '../game/features/event/app/event_actions.js';

describe('event_actions', () => {
  it('routes event UI commands through event deps only', () => {
    const modules = {
      EventUI: {
        triggerRandomEvent: vi.fn(),
        updateEventGoldBar: vi.fn(),
        showEvent: vi.fn(),
        resolveEvent: vi.fn(),
        showShop: vi.fn(),
        showRestSite: vi.fn(),
        showCardDiscard: vi.fn(),
        showItemShop: vi.fn(),
      },
    };
    const ports = {
      getEventDeps: vi.fn(() => ({ token: 'event-deps' })),
    };
    const actions = createEventActions(modules, ports);

    actions.triggerRandomEvent();
    actions._updateEventGoldBar();
    actions.showEvent({ id: 'merchant' });
    actions.resolveEvent(2);
    actions.showShop();
    actions.showRestSite();
    actions.showCardDiscard({ player: {} }, true);
    actions.showItemShop({ player: { gold: 20 } });

    expect(modules.EventUI.triggerRandomEvent).toHaveBeenCalledWith({ token: 'event-deps' });
    expect(modules.EventUI.updateEventGoldBar).toHaveBeenCalledWith({ token: 'event-deps' });
    expect(modules.EventUI.showEvent).toHaveBeenCalledWith({ id: 'merchant' }, { token: 'event-deps' });
    expect(modules.EventUI.resolveEvent).toHaveBeenCalledWith(2, { token: 'event-deps' });
    expect(modules.EventUI.showShop).toHaveBeenCalledWith({ token: 'event-deps' });
    expect(modules.EventUI.showRestSite).toHaveBeenCalledWith({ token: 'event-deps' });
    expect(modules.EventUI.showCardDiscard).toHaveBeenCalledWith({ player: {} }, true, { token: 'event-deps' });
    expect(modules.EventUI.showItemShop).toHaveBeenCalledWith({ player: { gold: 20 } }, { token: 'event-deps' });
    expect(ports.getEventDeps).toHaveBeenCalledTimes(8);
  });
});
