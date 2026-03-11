import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildEventSubscriberRegistrars: vi.fn(),
  executeEventSubscriberRegistration: vi.fn(),
  createEventSubscriberContext: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('../game/core/build_event_subscriber_registrars.js', () => ({
  buildEventSubscriberRegistrars: hoisted.buildEventSubscriberRegistrars,
}));

vi.mock('../game/core/execute_event_subscriber_registration.js', () => ({
  executeEventSubscriberRegistration: hoisted.executeEventSubscriberRegistration,
}));

vi.mock('../game/core/event_subscriber_context.js', () => ({
  createEventSubscriberContext: hoisted.createEventSubscriberContext,
}));

vi.mock('../game/core/event_bus.js', () => ({
  EventBus: {
    clear: hoisted.clear,
  },
}));

import { clearSubscribers, registerSubscribers } from '../game/core/event_subscribers.js';

describe('event subscribers registry orchestration', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset());
  });

  it('builds context, resolves registrars, and executes them in one place', () => {
    const ctx = { token: 'ctx' };
    const registrars = [vi.fn(), vi.fn()];
    const uiRefs = { win: { innerWidth: 1280 } };

    hoisted.createEventSubscriberContext.mockReturnValue(ctx);
    hoisted.buildEventSubscriberRegistrars.mockReturnValue(registrars);

    registerSubscribers(uiRefs);

    expect(hoisted.createEventSubscriberContext).toHaveBeenCalledWith(uiRefs);
    expect(hoisted.buildEventSubscriberRegistrars).toHaveBeenCalledTimes(1);
    expect(hoisted.executeEventSubscriberRegistration).toHaveBeenCalledWith(ctx, registrars);
  });

  it('clears subscribers through the event bus facade', () => {
    clearSubscribers();
    expect(hoisted.clear).toHaveBeenCalledTimes(1);
  });
});
