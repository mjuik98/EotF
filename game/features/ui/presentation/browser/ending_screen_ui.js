import {
  cleanupEndingSession,
  showOutcomeScreenRuntime,
} from '../../../../ui/screens/ending_screen_ui_runtime.js';

let _session = null;

export const EndingScreenUI = {
  show(isHidden, deps = {}) {
    if (isHidden) return false;
    return this.showOutcome('victory', deps);
  },

  showOutcome(outcome = 'victory', deps = {}) {
    _session = showOutcomeScreenRuntime(outcome, deps, {
      cleanup: EndingScreenUI.cleanup,
    });
    return !!_session;
  },

  cleanup(deps = {}) {
    cleanupEndingSession(_session, deps);
    _session = null;
  },
};
