import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
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

vi.mock('../game/features/codex/public.js', () => ({
  createCodexFeatureFacade: hoisted.createCodexFeatureFacade,
}));

vi.mock('../game/features/event/public.js', () => ({
  createEventFeatureFacade: hoisted.createEventFeatureFacade,
}));

vi.mock('../game/features/reward/public.js', () => ({
  createRewardFeatureFacade: hoisted.createRewardFeatureFacade,
}));

vi.mock('../game/ui/screens/screen_ui.js', () => ({
  ScreenUI: { id: 'screen' },
}));

vi.mock('../game/ui/screens/ending_screen_ui.js', () => ({
  EndingScreenUI: { id: 'ending' },
}));

vi.mock('../game/ui/screens/story_ui.js', () => ({
  StoryUI: { id: 'story' },
}));

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';

describe('buildScreenPrimaryModules', () => {
  it('routes screen feature modules through feature public facades', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen' },
      EventUI: { id: 'event-public' },
      RewardUI: { id: 'reward-public' },
      CodexUI: { id: 'codex-public' },
      EndingScreenUI: { id: 'ending' },
      StoryUI: { id: 'story' },
    });
    expect(hoisted.createCodexFeatureFacade).toHaveBeenCalledTimes(1);
    expect(hoisted.createEventFeatureFacade).toHaveBeenCalledTimes(1);
    expect(hoisted.createRewardFeatureFacade).toHaveBeenCalledTimes(1);
  });
});
