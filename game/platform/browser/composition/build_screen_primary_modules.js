import { createCodexFeatureFacade } from '../../../features/codex/public.js';
import { ScreenUI } from '../../../ui/screens/screen_ui.js';
import { EventUI } from '../../../presentation/screens/event_ui.js';
import { RewardUI } from '../../../presentation/screens/reward_ui.js';
import { EndingScreenUI } from '../../../ui/screens/ending_screen_ui.js';
import { StoryUI } from '../../../ui/screens/story_ui.js';

export function buildScreenPrimaryModules() {
  const codexCapabilities = createCodexFeatureFacade().moduleCapabilities;
  return {
    ScreenUI,
    EventUI,
    RewardUI,
    ...codexCapabilities.primary,
    EndingScreenUI,
    StoryUI,
  };
}
