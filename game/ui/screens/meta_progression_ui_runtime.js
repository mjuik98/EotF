import { EndingScreenUI } from './ending_screen_ui.js';
import {
  restartFromEndingAction,
  selectMetaFragmentAction,
} from '../../features/title/application/meta_progression_actions.js';

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
