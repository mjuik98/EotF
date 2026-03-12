export function completeTitleReturn(deps = {}) {
  if (typeof deps.showTitleScreen === 'function') deps.showTitleScreen();
  else if (typeof deps.switchScreen === 'function') deps.switchScreen('title');

  if (typeof deps.clearSelectedClass === 'function') deps.clearSelectedClass();
  if (typeof deps.refreshRunModePanel === 'function') deps.refreshRunModePanel();
  if (typeof deps.refreshTitleSaveState === 'function') deps.refreshTitleSaveState();
  if (typeof deps.showPendingClassProgressSummary === 'function') deps.showPendingClassProgressSummary();
}

export function returnToTitleFromPause(deps = {}) {
  const gs = deps?.gs;
  if (gs && typeof deps.saveRun === 'function') {
    deps.saveRun({ gs });
  }

  if (typeof deps.reload === 'function') {
    deps.reload();
    return true;
  }

  const win = deps?.win || deps?.doc?.defaultView || null;
  if (typeof win?.location?.reload === 'function') {
    win.location.reload();
    return true;
  }

  return false;
}
