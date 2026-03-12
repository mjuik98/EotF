export function confirmReturnToTitleRuntime(deps = {}) {
  if (typeof deps.returnToTitleFromPause === 'function') {
    deps.returnToTitleFromPause();
    return true;
  }

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
