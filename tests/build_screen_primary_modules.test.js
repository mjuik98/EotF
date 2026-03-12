import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createCodexFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      primary: { CodexUI: { id: 'codex-public' } },
    },
  })),
}));

vi.mock('../game/features/codex/public.js', () => ({
  createCodexFeatureFacade: hoisted.createCodexFeatureFacade,
}));

vi.mock('../game/ui/screens/screen_ui.js', () => ({
  ScreenUI: { id: 'screen' },
}));

vi.mock('../game/presentation/screens/event_ui.js', () => ({
  EventUI: { id: 'event' },
}));

vi.mock('../game/presentation/screens/reward_ui.js', () => ({
  RewardUI: { id: 'reward' },
}));

vi.mock('../game/ui/screens/ending_screen_ui.js', () => ({
  EndingScreenUI: { id: 'ending' },
}));

vi.mock('../game/ui/screens/story_ui.js', () => ({
  StoryUI: { id: 'story' },
}));

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';

describe('buildScreenPrimaryModules', () => {
  it('routes codex screen modules through the codex feature public facade', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen' },
      EventUI: { id: 'event' },
      RewardUI: { id: 'reward' },
      CodexUI: { id: 'codex-public' },
      EndingScreenUI: { id: 'ending' },
      StoryUI: { id: 'story' },
    });
    expect(hoisted.createCodexFeatureFacade).toHaveBeenCalledTimes(1);
  });
});
