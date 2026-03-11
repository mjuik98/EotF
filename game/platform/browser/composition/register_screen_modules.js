import { ScreenUI } from '../../../ui/screens/screen_ui.js';
import { EventUI } from '../../../ui/screens/event_ui.js';
import { RewardUI } from '../../../ui/screens/reward_ui.js';
import { CodexUI } from '../../../ui/screens/codex_ui.js';
import { EndingScreenUI } from '../../../ui/screens/ending_screen_ui.js';
import { StoryUI } from '../../../ui/screens/story_ui.js';
import { MetaProgressionUI } from '../../../ui/screens/meta_progression_ui.js';
import { HelpPauseUI } from '../../../ui/screens/help_pause_ui.js';
import { SettingsUI } from '../../../ui/screens/settings_ui.js';

export function registerScreenModules() {
  return {
    ScreenUI,
    EventUI,
    RewardUI,
    CodexUI,
    EndingScreenUI,
    StoryUI,
    MetaProgressionUI,
    HelpPauseUI,
    SettingsUI,
  };
}
