import { describe, expect, it, vi } from 'vitest';

import { registerEventModules } from '../game/platform/browser/composition/register_event_modules.js';

describe('registerEventModules', () => {
  it('publishes a lazy event facade instead of eagerly importing the full event screen module', () => {
    const { EventUI } = registerEventModules();

    expect(EventUI).toMatchObject({
      __lazyModule: true,
      triggerRandomEvent: expect.any(Function),
      updateEventGoldBar: expect.any(Function),
      showEvent: expect.any(Function),
      resolveEvent: expect.any(Function),
      showShop: expect.any(Function),
      showRestSite: expect.any(Function),
      showCardDiscard: expect.any(Function),
      showItemShop: expect.any(Function),
      api: {
        showEvent: expect.any(Function),
        resolveEvent: expect.any(Function),
        showShop: expect.any(Function),
        showRestSite: expect.any(Function),
        showItemShop: expect.any(Function),
      },
    });
  });
});
