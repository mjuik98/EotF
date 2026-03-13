import { EndingScreenUI } from './ending_screen_ui.js';
import {
  restartFromEndingAction,
  selectMetaFragmentAction,
} from '../../../title/ports/ending_ui_ports.js';

function cleanupEnding(deps = {}) {
  const doc = deps?.doc || document;
  EndingScreenUI.cleanup({ doc });
}

export function selectMetaFragmentRuntime(effect, deps = {}) {
  return selectMetaFragmentAction(effect, deps, {
    cleanup: () => cleanupEnding(deps),
  });
}

export function restartFromEndingRuntime(deps = {}) {
  return restartFromEndingAction(deps, {
    cleanup: () => cleanupEnding(deps),
  });
}
