import { getDoc } from '../../../../ui/screens/screen_ui_helpers.js';
import { switchScreenRuntime } from '../../../../ui/screens/screen_ui_runtime.js';

export const ScreenUI = {
  switchScreen(screen, deps = {}) {
    const doc = getDoc(deps);
    switchScreenRuntime(screen, { ...deps, doc });
  },
};
