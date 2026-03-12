import { EndingScreenUI } from '../../presentation/browser/ending_screen_ui.js';
import { ScreenUI } from '../../presentation/browser/screen_ui.js';
import { StoryUI } from '../../presentation/browser/story_ui.js';

export function buildScreenPrimaryBrowserModules() {
  return {
    ScreenUI,
    EndingScreenUI,
    StoryUI,
  };
}
