function resolveCharacterSelectRoot(resolveById) {
  if (typeof resolveById !== 'function') return null;
  return resolveById('charSelectSubScreen') || null;
}

export function setCharacterSelectFocusLock(resolveById, isLocked) {
  const root = resolveCharacterSelectRoot(resolveById);
  if (!root?.classList) return;

  if (isLocked) {
    root.classList.add('is-focus-locked');
    return;
  }

  root.classList.remove('is-focus-locked');
}
