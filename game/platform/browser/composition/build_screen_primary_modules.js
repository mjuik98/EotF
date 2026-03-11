import { ScreenUI } from '../../../ui/screens/screen_ui.js';
import { EventUI } from '../../../ui/screens/event_ui.js';
import { RewardUI } from '../../../ui/screens/reward_ui.js';
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
