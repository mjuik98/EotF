import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createUiFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      primary: {
        ScreenUI: { id: 'screen-public' },
        EndingScreenUI: { id: 'ending-public' },
        StoryUI: { id: 'story-public' },
      },
    },
  })),
  createCodexFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      primary: { CodexUI: { id: 'codex-public' } },
    },
  })),
  createEventFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      primary: { EventUI: { id: 'event-public' } },
    },
  })),
  createRewardFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      primary: { RewardUI: { id: 'reward-public' } },
    },
  })),
}));

vi.mock('../game/features/ui/public.js', () => ({
  createUiFeatureFacade: hoisted.createUiFeatureFacade,
}));

vi.mock('../game/features/codex/public.js', () => ({
  createCodexFeatureFacade: hoisted.createCodexFeatureFacade,
}));

vi.mock('../game/features/event/public.js', () => ({
  createEventFeatureFacade: hoisted.createEventFeatureFacade,
}));

vi.mock('../game/features/reward/public.js', () => ({
  createRewardFeatureFacade: hoisted.createRewardFeatureFacade,
}));

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';

describe('buildScreenPrimaryModules', () => {
  it('routes screen modules through feature public facades', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen-public' },
      EventUI: { id: 'event-public' },
      RewardUI: { id: 'reward-public' },
      CodexUI: { id: 'codex-public' },
      EndingScreenUI: { id: 'ending-public' },
      StoryUI: { id: 'story-public' },
    });
    expect(hoisted.createUiFeatureFacade).toHaveBeenCalledTimes(1);
    expect(hoisted.createCodexFeatureFacade).toHaveBeenCalledTimes(1);
    expect(hoisted.createEventFeatureFacade).toHaveBeenCalledTimes(1);
    expect(hoisted.createRewardFeatureFacade).toHaveBeenCalledTimes(1);
  });
});
