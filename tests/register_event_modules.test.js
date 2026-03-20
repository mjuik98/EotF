import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildScreenFeaturePrimaryModules: vi.fn(() => ({
    CodexUI: { id: 'codex' },
    EventUI: { id: 'event' },
    RewardUI: { id: 'reward' },
  })),
}));

vi.mock('../game/platform/browser/composition/build_screen_feature_primary_modules.js', () => ({
  buildScreenFeaturePrimaryModules: hoisted.buildScreenFeaturePrimaryModules,
}));

import { registerEventModules } from '../game/platform/browser/composition/register_event_modules.js';

describe('registerEventModules', () => {
  it('publishes only event primary modules from the shared screen feature builder', () => {
    expect(registerEventModules()).toEqual({
      EventUI: { id: 'event' },
    });
    expect(hoisted.buildScreenFeaturePrimaryModules).toHaveBeenCalledTimes(1);
  });
});
