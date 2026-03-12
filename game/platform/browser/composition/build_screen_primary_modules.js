import { createCodexFeatureFacade } from '../../../features/codex/public.js';
import { createEventFeatureFacade } from '../../../features/event/public.js';
import { createRewardFeatureFacade } from '../../../features/reward/public.js';
import { ScreenUI } from '../../../ui/screens/screen_ui.js';
import { EndingScreenUI } from '../../../ui/screens/ending_screen_ui.js';
import { StoryUI } from '../../../ui/screens/story_ui.js';

export function buildScreenPrimaryModules() {
  const codexCapabilities = createCodexFeatureFacade().moduleCapabilities;
  const eventCapabilities = createEventFeatureFacade().moduleCapabilities;
  const rewardCapabilities = createRewardFeatureFacade().moduleCapabilities;
  return {
    ScreenUI,
    ...eventCapabilities.primary,
    ...rewardCapabilities.primary,
    ...codexCapabilities.primary,
    EndingScreenUI,
    StoryUI,
  };
}
