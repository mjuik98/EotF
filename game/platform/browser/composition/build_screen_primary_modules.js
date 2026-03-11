import { ScreenUI } from '../../../ui/screens/screen_ui.js';
import { EventUI } from '../../../presentation/screens/event_ui.js';
import { RewardUI } from '../../../presentation/screens/reward_ui.js';
import { CodexUI } from '../../../ui/screens/codex_ui.js';
import { EndingScreenUI } from '../../../ui/screens/ending_screen_ui.js';
import { StoryUI } from '../../../ui/screens/story_ui.js';

export function buildScreenPrimaryModules() {
  return {
    ScreenUI,
    EventUI,
    RewardUI,
    CodexUI,
    EndingScreenUI,
    StoryUI,
  };
}
