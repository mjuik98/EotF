import { EndingScreenUI } from './ending_screen_ui.js';

function returnToTitle(deps = {}) {
  if (typeof deps.switchScreen === 'function') deps.switchScreen('title');
  if (typeof deps.clearSelectedClass === 'function') deps.clearSelectedClass();
  if (typeof deps.refreshRunModePanel === 'function') deps.refreshRunModePanel();
  if (typeof deps.refreshTitleSaveState === 'function') deps.refreshTitleSaveState();
  if (typeof deps.showPendingClassProgressSummary === 'function') deps.showPendingClassProgressSummary();
}

export function selectMetaFragmentRuntime(effect, deps = {}) {
  const gs = deps?.gs;
  const doc = deps?.doc || document;
  if (!gs?.meta) return false;
  EndingScreenUI.cleanup({ doc });

  const meta = gs.meta;
  switch (effect) {
    case 'echo_boost':
      meta.inscriptions.echo_boost = true;
      break;
    case 'resilience':
      meta.inscriptions.resilience = true;
      break;
    case 'fortune':
      meta.inscriptions.fortune = true;
      break;
    default:
      return false;
  }

  meta.echoFragments--;
  setTimeout(() => {
    returnToTitle(deps);
  }, 500);
  return true;
}

export function restartFromEndingRuntime(deps = {}) {
  const doc = deps?.doc || document;
  EndingScreenUI.cleanup({ doc });
  returnToTitle(deps);
}
