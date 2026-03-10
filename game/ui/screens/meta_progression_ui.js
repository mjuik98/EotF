import {
  restartFromEndingRuntime,
  selectMetaFragmentRuntime,
} from './meta_progression_ui_runtime.js';

export const MetaProgressionUI = {
  selectFragment(effect, deps = {}) {
    return selectMetaFragmentRuntime(effect, deps);
  },

  restartFromEnding(deps = {}) {
    restartFromEndingRuntime(deps);
  },
};
