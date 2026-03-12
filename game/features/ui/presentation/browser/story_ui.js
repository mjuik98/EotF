import { renderStoryFragmentOverlay } from '../../../../ui/screens/story_ui_render.js';
import {
  checkHiddenEndingRuntime,
  showEndingRuntime,
  showRunFragmentRuntime,
  unlockNextFragmentRuntime,
} from '../../../../ui/screens/story_ui_runtime.js';

export const StoryUI = {
  unlockNextFragment(deps = {}) {
    unlockNextFragmentRuntime(deps);
  },

  showRunFragment(deps = {}) {
    return showRunFragmentRuntime(this, deps);
  },

  displayFragment(frag, deps = {}) {
    return renderStoryFragmentOverlay(frag, deps);
  },

  checkHiddenEnding(deps = {}) {
    return checkHiddenEndingRuntime(deps);
  },

  showNormalEnding(deps = {}) {
    this.showEnding(false, deps);
  },

  showHiddenEnding(deps = {}) {
    this.showEnding(true, deps);
  },

  showEnding(isHidden, deps = {}) {
    showEndingRuntime(isHidden, deps);
  },
};
