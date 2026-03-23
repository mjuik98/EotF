import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  triggerRandomEventService: vi.fn(),
  showEventService: vi.fn(),
  resolveEventService: vi.fn(),
  getCurrentEvent: vi.fn(() => ({ id: 'merchant' })),
  getGS: vi.fn((deps) => deps.gs),
  getData: vi.fn((deps) => deps.data),
  getDoc: vi.fn((deps) => deps.doc),
  getRunRules: vi.fn((deps) => deps.runRules),
  getAudioEngine: vi.fn((deps) => deps.audioEngine),
  getEventId: vi.fn((event) => event.id),
  openEventShopRuntime: vi.fn(),
  openEventRestSiteRuntime: vi.fn(),
  openEventItemShopRuntime: vi.fn(),
  showEventCardDiscardOverlay: vi.fn(),
  runIdempotent: vi.fn(),
  clearIdempotencyPrefix: vi.fn(),
}));

vi.mock('../game/features/event/application/event_service.js', () => ({
  getCurrentEvent: mocks.getCurrentEvent,
  resolveEventService: mocks.resolveEventService,
  showEventService: mocks.showEventService,
  triggerRandomEventService: mocks.triggerRandomEventService,
}));

vi.mock('../game/features/event/platform/event_runtime_context.js', () => ({
  getAudioEngine: mocks.getAudioEngine,
  getData: mocks.getData,
  getDoc: mocks.getDoc,
  getEventId: mocks.getEventId,
  getGS: mocks.getGS,
  getRunRules: mocks.getRunRules,
}));

vi.mock('../game/features/event/platform/event_runtime_dom.js', () => ({
  openEventItemShopRuntime: mocks.openEventItemShopRuntime,
  openEventRestSiteRuntime: mocks.openEventRestSiteRuntime,
  openEventShopRuntime: mocks.openEventShopRuntime,
  renderEventShellRuntime: vi.fn(),
  showEventCardDiscardOverlay: mocks.showEventCardDiscardOverlay,
}));

vi.mock('../game/features/event/application/workflows/event_choice_flow.js', () => ({
  finishEventFlow: vi.fn(),
  resolveEventChoiceFlow: vi.fn(),
}));

vi.mock('../game/utils/idempotency_utils.js', () => ({
  clearIdempotencyPrefix: mocks.clearIdempotencyPrefix,
  runIdempotent: mocks.runIdempotent,
}));

import { createEventUiFacadeRuntime } from '../game/features/event/presentation/browser/event_ui_facade_runtime.js';

describe('event_ui_facade_runtime', () => {
  it('wires trigger/show/resolve flows through the injected api and deps', () => {
    const api = {
      showEvent: vi.fn(),
      resolveEvent: vi.fn(),
      updateEventGoldBar: vi.fn(),
      showItemShop: vi.fn(),
      showCardDiscard: vi.fn(),
    };
    const deps = {
      gs: { player: { gold: 10 } },
      data: { events: [] },
      doc: { getElementById: vi.fn() },
      runRules: { token: 'rules' },
      audioEngine: { token: 'audio' },
    };
    const runtime = createEventUiFacadeRuntime(api, deps);

    runtime.triggerRandomEvent();
    runtime.showEvent({ id: 'merchant' });
    runtime.resolveEvent(2);

    expect(mocks.triggerRandomEventService).toHaveBeenCalledWith(expect.objectContaining({
      gs: deps.gs,
      data: deps.data,
      showEvent: expect.any(Function),
    }));
    expect(mocks.showEventService).toHaveBeenCalledWith(expect.objectContaining({
      event: { id: 'merchant' },
      gs: deps.gs,
      doc: deps.doc,
      refreshGoldBar: expect.any(Function),
      resolveEvent: expect.any(Function),
    }));
    expect(mocks.resolveEventService).toHaveBeenCalledWith(expect.objectContaining({
      choiceIdx: 2,
      gs: deps.gs,
      event: { id: 'merchant' },
      doc: deps.doc,
      deps,
      audioEngine: deps.audioEngine,
      resolveEvent: expect.any(Function),
    }));
  });

  it('builds shop/rest/item-shop/card-discard actions through runtime helpers', () => {
    const api = {
      showEvent: vi.fn(),
      resolveEvent: vi.fn(),
      updateEventGoldBar: vi.fn(),
      showItemShop: vi.fn(),
      showCardDiscard: vi.fn(),
    };
    const deps = {
      gs: { player: { gold: 10 } },
      data: { events: [] },
      doc: { getElementById: vi.fn() },
      runRules: { token: 'rules' },
      audioEngine: { token: 'audio' },
    };
    const runtime = createEventUiFacadeRuntime(api, deps);

    runtime.createShopEvent();
    runtime.openRestSite();
    runtime.showItemShop({ player: { gold: 30 } });
    runtime.showCardDiscard({ player: { deck: [] } }, true);

    expect(mocks.openEventShopRuntime).toHaveBeenCalledWith(deps, expect.objectContaining({
      gs: deps.gs,
      data: deps.data,
      runRules: deps.runRules,
      showItemShop: expect.any(Function),
    }));
    expect(mocks.openEventRestSiteRuntime).toHaveBeenCalledWith(deps, expect.objectContaining({
      gs: deps.gs,
      data: deps.data,
      runRules: deps.runRules,
      doc: deps.doc,
      audioEngine: deps.audioEngine,
      showCardDiscard: expect.any(Function),
      showEvent: expect.any(Function),
    }));
    expect(mocks.openEventItemShopRuntime).toHaveBeenCalledWith(
      { player: { gold: 30 } },
      deps,
      expect.objectContaining({
        gs: deps.gs,
        data: deps.data,
        runRules: deps.runRules,
        refreshEventGoldBar: expect.any(Function),
      }),
    );
    expect(mocks.showEventCardDiscardOverlay).toHaveBeenCalledWith(
      { player: { deck: [] } },
      deps.data,
      true,
      deps,
    );
  });
});
