import { resolveTitleReload } from '../ports/title_runtime_ports.js';

export function completeTitleReturn(deps = {}) {
  if (typeof deps.showTitleScreen === 'function') deps.showTitleScreen();
  else if (typeof deps.switchScreen === 'function') deps.switchScreen('title');

  if (typeof deps.clearSelectedClass === 'function') deps.clearSelectedClass();
  if (typeof deps.resetCharacterSelectState === 'function') deps.resetCharacterSelectState();
  if (typeof deps.refreshRunModePanel === 'function') deps.refreshRunModePanel();
  if (typeof deps.refreshTitleSaveState === 'function') deps.refreshTitleSaveState();
  if (typeof deps.showPendingClassProgressSummary === 'function') deps.showPendingClassProgressSummary();
}

export function returnToTitleFromPause(deps = {}) {
  const gs = deps?.gs;
  const saveResult = gs && typeof deps.saveRun === 'function'
    ? deps.saveRun({ gs })
    : null;

  if (saveResult?.status === 'queued' || saveResult?.status === 'error') {
    deps.showSaveStatus?.(saveResult);
    return false;
  }

  const reload = resolveTitleReload(deps);
  if (typeof reload === 'function') {
    reload();
    return true;
  }

  return false;
}
