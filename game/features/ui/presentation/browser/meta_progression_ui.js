import {
  restartFromEndingRuntime,
  selectMetaFragmentRuntime,
} from '../../../../ui/screens/meta_progression_ui_runtime.js';

export const MetaProgressionUI = {
  selectEndingFragment(effect, deps = {}) {
    return this.selectFragment(effect, deps);
  },

  selectFragment(effect, deps = {}) {
    return selectMetaFragmentRuntime(effect, deps);
  },

  restartEndingFlow(deps = {}) {
    this.restartFromEnding(deps);
  },

  restartFromEnding(deps = {}) {
    restartFromEndingRuntime(deps);
  },
};
