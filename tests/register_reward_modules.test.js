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

import { registerRewardModules } from '../game/platform/browser/composition/register_reward_modules.js';

describe('registerRewardModules', () => {
  it('publishes only reward primary modules from the shared screen feature builder', () => {
    expect(registerRewardModules()).toEqual({
      RewardUI: { id: 'reward' },
    });
    expect(hoisted.buildScreenFeaturePrimaryModules).toHaveBeenCalledTimes(1);
  });
});
