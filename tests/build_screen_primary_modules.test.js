import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createUiModuleCapabilities: vi.fn(() => ({
    primary: {
      ScreenUI: { id: 'screen-public' },
      EndingScreenUI: { id: 'ending-public' },
      StoryUI: { id: 'story-public' },
    },
  })),
  createCodexModuleCapabilities: vi.fn(() => ({
    primary: { CodexUI: { id: 'codex-public' } },
  })),
  createEventModuleCapabilities: vi.fn(() => ({
    primary: { EventUI: { id: 'event-public' } },
  })),
  createRewardModuleCapabilities: vi.fn(() => ({
    primary: { RewardUI: { id: 'reward-public' } },
  })),
}));

vi.mock('../game/features/ui/public.js', () => ({
  createUiModuleCapabilities: hoisted.createUiModuleCapabilities,
}));

vi.mock('../game/features/codex/public.js', () => ({
  createCodexModuleCapabilities: hoisted.createCodexModuleCapabilities,
}));

vi.mock('../game/features/event/public.js', () => ({
  createEventModuleCapabilities: hoisted.createEventModuleCapabilities,
}));

vi.mock('../game/features/reward/public.js', () => ({
  createRewardModuleCapabilities: hoisted.createRewardModuleCapabilities,
}));

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';

describe('buildScreenPrimaryModules', () => {
  it('routes screen modules through narrow feature module capability exports', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen-public' },
      EventUI: { id: 'event-public' },
      RewardUI: { id: 'reward-public' },
      CodexUI: { id: 'codex-public' },
      EndingScreenUI: { id: 'ending-public' },
      StoryUI: { id: 'story-public' },
    });
    expect(hoisted.createUiModuleCapabilities).toHaveBeenCalledTimes(1);
    expect(hoisted.createCodexModuleCapabilities).toHaveBeenCalledTimes(1);
    expect(hoisted.createEventModuleCapabilities).toHaveBeenCalledTimes(1);
    expect(hoisted.createRewardModuleCapabilities).toHaveBeenCalledTimes(1);
  });
});
